import { guideSchema } from '@reforma-digital/core';
import { sectorCoverage, sectorGuides } from '@reforma-digital/government/sector-guides';
import { describe, expect, it } from 'vitest';
import { sectorDataset } from './sector-cases';

describe('D-07 sectorial controlado', () => {
  it('conserva una ruta bilingüe, fuente propia y hueco explícito por sector', () => {
    expect(sectorGuides).toHaveLength(8);
    expect(new Set(sectorGuides.map((guide) => guide.subtopic)).size).toBe(8);
    for (const guide of sectorGuides) {
      expect(() => guideSchema.parse(guide)).not.toThrow();
      expect(guide.validation.status).toBe('pending');
      expect(guide.steps[0]?.evidenceIds).toEqual(guide.evidence.map((item) => item.id));
      expect(guide.evidence.map((item) => item.language)).toEqual(['ca', 'es']);
      for (const evidence of guide.evidence)
        expect(evidence.url).toMatch(/^https:\/\/(?:[^/]+\.)?gencat\.cat\//);
      const coverage = sectorCoverage.find((item) => item.id === guide.subtopic);
      expect(coverage?.authority.ca).toBeTruthy();
      expect(coverage?.authority.es).toBeTruthy();
      expect(coverage?.questions.length).toBeGreaterThan(0);
      expect(coverage?.gap.ca).toBeTruthy();
    }
  });

  it('exige abstención ca/es cuando faltan actividad o local, junto al caso sustentado', () => {
    expect(sectorDataset.stage).toBe('controlled');
    expect(sectorDataset.cases).toHaveLength(32);
    for (const guide of sectorGuides) {
      const cases = sectorDataset.cases.filter((item) => item.subtopic === guide.subtopic);
      expect(cases).toHaveLength(4);
      for (const language of ['ca', 'es']) {
        const pair = cases.filter((item) => item.language === language);
        expect(pair.map((item) => item.expected.shouldAnswer).sort()).toEqual([false, true]);
        expect(pair.find((item) => item.expected.shouldAnswer)?.sources).toHaveLength(1);
        expect(pair.find((item) => !item.expected.shouldAnswer)?.sources).toHaveLength(0);
      }
    }
  });

  it('incluye las dos autorizaciones previas del HUT y la fecha propia de espectáculos es', () => {
    const hut = sectorGuides.find((guide) => guide.subtopic === 'tourism-hut')!;
    expect(hut.conditions[0]?.text.ca).toContain('autorització turística');
    expect(hut.conditions[0]?.text.es).toContain('autorización turística');
    expect(hut.steps[0]?.text.es).toContain('antes de la comunicación');
    const shows = sectorGuides.find((guide) => guide.subtopic === 'shows-extraordinary')!;
    expect(shows.evidence.find((item) => item.language === 'es')?.sourceUpdatedAt).toBe(
      '2016-01-19',
    );
    expect(
      sectorDataset.cases.find((item) => item.id === 'shows-extraordinary-es-fact')?.sources[0]
        ?.version,
    ).toBe('2016-01-19');
  });
});
