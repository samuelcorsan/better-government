import { describe, expect, it } from 'vitest';
import { regionSchema, type Source } from '../packages/core/src/index';
import { sources } from '../packages/government/src/index';
import { limitedSourceCoverage, sourceBand, sourceCoverage } from '../apps/web/lib/source-coverage';

function source(jurisdictionType: Source['jurisdictionType'], jurisdictionValue: string): Source {
  return {
    id: jurisdictionValue,
    name: 'Organismo sintético',
    organization: 'Organismo sintético',
    baseUrl: 'https://example.test',
    hosts: ['example.test'],
    jurisdictionType,
    jurisdictionValue,
    authorityScore: 100,
    enabled: true,
  };
}

describe('fuentes por territorio', () => {
  it('agrupa municipios por el identificador territorial exacto y excluye fuentes deshabilitadas', () => {
    const coverage = sourceCoverage([
      source('country', 'ES'),
      source('region', 'ES-MD'),
      source('municipality', 'ES-MD-SINTETICO'),
      source('municipality', 'ES-AN-SINTETICO'),
      source('municipality', 'ES-MDX-SINTETICO'),
      { ...source('region', 'ES-GA'), enabled: false },
      { ...source('country', 'ES'), enabled: false },
    ]);

    expect(coverage.national).toHaveLength(1);
    expect(coverage.regions.find((region) => region.id === 'ES-MD')?.sources).toHaveLength(2);
    expect(coverage.regions.find((region) => region.id === 'ES-AN')?.sources).toHaveLength(1);
    expect(coverage.regions.find((region) => region.id === 'ES-GA')?.sources).toHaveLength(0);
    expect(coverage.regions.flatMap((region) => region.sources)).toHaveLength(3);
  });

  it('muestra las 19 zonas, incluidas las vacías, y el registro aprobado actual', () => {
    const coverage = sourceCoverage(sources);
    expect(coverage.regions).toHaveLength(19);
    expect(new Set(coverage.regions.map((region) => region.id)).size).toBe(19);
    expect(new Set(coverage.regions.map((region) => region.id))).toEqual(
      new Set(regionSchema.options),
    );
    expect(coverage.regions.find((region) => region.id === 'ES-MD')?.sources).toHaveLength(2);
    expect(coverage.regions.find((region) => region.id === 'ES-CT')?.sources).toHaveLength(0);
    expect(coverage.regions.filter((region) => region.sources.length === 0)).toHaveLength(18);
    expect(coverage.national).toHaveLength(8);
  });

  it('elige una intensidad por cantidad de fuentes, incluidos los límites de cada banda', () => {
    expect([0, 1, 2, 3, 5, 6, 12].map(sourceBand)).toEqual([0, 1, 1, 2, 2, 3, 3]);
  });
  it('ofrece el mapa solo para la comunidad identificada con pocas fuentes', () => {
    expect(limitedSourceCoverage(sources, 'ES-AR')?.name).toBe('Aragón');
    expect(limitedSourceCoverage(sources, 'ES-AR')?.sources).toHaveLength(0);
    expect(limitedSourceCoverage(sources, 'ES-MD')?.sources).toHaveLength(2);
    expect(limitedSourceCoverage(sources, null)).toBeUndefined();
    expect(limitedSourceCoverage(sources)).toBeUndefined();
  });
  it('no avisa de cobertura limitada cuando hay más de dos fuentes territoriales', () => {
    const registered = [
      source('region', 'ES-AR'),
      source('municipality', 'ES-AR-SINTETICO-1'),
      source('municipality', 'ES-AR-SINTETICO-2'),
    ];
    expect(limitedSourceCoverage(registered.slice(0, 1), 'ES-AR')?.sources).toHaveLength(1);
    expect(limitedSourceCoverage(registered.slice(0, 2), 'ES-AR')?.sources).toHaveLength(2);
    expect(limitedSourceCoverage(registered, 'ES-AR')).toBeUndefined();
  });
});
