import { guideSchema, type Guide } from '@reforma-digital/core';
import { describe, expect, it, vi } from 'vitest';
import { searchPublicCatalogue } from './public-index';
import type { PublicCatalogue } from './public-release';

function guide(id: string, jurisdiction: string, url: string): Guide {
  return guideSchema.parse({
    id,
    revision: 1,
    title: { ca: 'Factura i obertura', es: 'Factura y apertura' },
    domain: 'D-08',
    subtopic: 'factura',
    profiles: ['persona-fisica'],
    jurisdiction,
    consultedAt: '2026-10-01',
    period: { from: '2026-10-01', evidenceIds: ['rule'] },
    validation: { status: 'verified', checkedAt: '2026-10-02', method: 'automatic' },
    evidence: [
      {
        id: 'rule',
        sourceId: id,
        url,
        originalUrl: url,
        version: '2026-10-01',
        language: 'es',
        attribution: 'Oficina sintética',
        sourceUpdatedAt: '2026-10-01',
        applicableFrom: '2026-10-01',
        applicableUntil: null,
        informative: false,
        jurisdiction,
        quote: 'Factura sintética desde 2026-10-01.',
      },
    ],
    conditions: [
      {
        id: 'profile',
        text: { ca: 'Si ets persona física.', es: 'Si eres persona física.' },
        evidenceIds: ['rule'],
        translation: 'ca',
      },
    ],
    exclusions: [
      {
        id: 'company',
        text: { ca: 'No cobreix societats.', es: 'No cubre sociedades.' },
        evidenceIds: ['rule'],
        translation: 'ca',
      },
    ],
    claims: [
      {
        id: 'fact',
        text: { ca: 'Consulta la factura.', es: 'Consulta la factura.' },
        evidenceIds: ['rule'],
        translation: 'ca',
        kind: 'fact',
        conditionIds: ['profile'],
      },
    ],
    steps: [],
  });
}

function catalogue(...guides: { guide: Guide; current: boolean }[]): PublicCatalogue {
  return { revision: 1, publishedAt: '2026-10-01', fresh: true, guides, flows: [] };
}

describe('índice público local', () => {
  it('devuelve fuentes y preguntas ca/es sin enviar la consulta a red', () => {
    const fetch = vi.fn(() => {
      throw new Error('unexpected network');
    });
    vi.stubGlobal('fetch', fetch);
    try {
      const item = guide('factura-general', 'ES-CT', 'https://example.test/general');
      const data = catalogue({ guide: item, current: true });
      for (const language of ['ca', 'es'] as const) {
        const result = searchPublicCatalogue(
          data,
          {
            query: 'factura',
            language,
            profile: 'persona-fisica',
            activity: 'obertura',
          },
          '2026-10-04',
        );
        expect(result.hits).toHaveLength(1);
        expect(result.hits[0]?.guide.evidence[0]?.url).toBe('https://example.test/general');
        expect(result.hits[0]?.questions[0]).toContain(
          language === 'ca' ? 'Es compleix' : '¿Se cumple',
        );
        expect(result.hits[0]?.guide.exclusions[0]?.text[language]).toBe(
          language === 'ca' ? 'No cobreix societats.' : 'No cubre sociedades.',
        );
      }
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('no hereda otro municipio y conserva fuentes discrepantes por separado', () => {
    const regional = guide('factura-general', 'ES-CT', 'https://example.test/general');
    const girona = guide('factura-girona', 'ES-CT-GIRONA', 'https://example.test/girona');
    girona.claims[0]!.text = { ca: 'Una altra regla.', es: 'Otra regla.' };
    const barcelona = guide(
      'factura-barcelona',
      'ES-CT-BARCELONA',
      'https://example.test/barcelona',
    );
    const unrelated = guide(
      'licencia-tarragona',
      'ES-CT-TARRAGONA',
      'https://example.test/tarragona',
    );
    unrelated.title = { ca: 'Permís', es: 'Permiso' };
    unrelated.subtopic = 'permiso';
    unrelated.claims[0]!.text = { ca: 'Consulta el permís.', es: 'Consulta el permiso.' };
    const data = catalogue(
      { guide: regional, current: true },
      { guide: girona, current: true },
      { guide: barcelona, current: false },
      { guide: unrelated, current: true },
    );
    const other = searchPublicCatalogue(
      data,
      { query: 'factura', language: 'ca', municipality: 'Tarragona' },
      '2026-10-04',
    );
    expect(other.municipalCoverage).toBe('uncovered');
    expect(other.hits.map((hit) => hit.guide.id)).toEqual(['factura-general']);
    const city = searchPublicCatalogue(
      data,
      { query: 'factura', language: 'es', municipality: 'Girona' },
      '2026-10-04',
    );
    expect(city.municipalCoverage).toBe('covered');
    expect(city.hits.map((hit) => hit.guide.evidence[0]?.url)).toEqual([
      'https://example.test/general',
      'https://example.test/girona',
    ]);
    expect(city.hits.map((hit) => hit.guide.claims[0]?.text.es)).toEqual([
      'Consulta la factura.',
      'Otra regla.',
    ]);
    const stale = searchPublicCatalogue(
      data,
      { query: 'factura', language: 'ca', municipality: 'Barcelona' },
      '2026-10-04',
    );
    expect(stale.municipalCoverage).toBe('uncovered');
    expect(stale.hits.find((hit) => hit.guide.id === 'factura-barcelona')?.current).toBe(false);
  });

  it('se abstiene sin tema o con perfil desconocido', () => {
    const data = catalogue({
      guide: guide('factura-general', 'ES-CT', 'https://example.test/general'),
      current: true,
    });
    expect(searchPublicCatalogue(data, { query: '', language: 'es' }, '2026-10-04')).toMatchObject({
      needsTopic: true,
      hits: [],
    });
    expect(
      searchPublicCatalogue(
        data,
        { query: 'factura', language: 'es', profile: 'sociedad' },
        '2026-10-04',
      ).hits,
    ).toEqual([]);
  });

  it('no presenta una guía futura como aplicable', () => {
    const future = guide('factura-futura', 'ES-CT', 'https://example.test/futura');
    future.period.from = '2027-01-01';
    const data = catalogue({ guide: future, current: false });
    expect(
      searchPublicCatalogue(data, { query: 'factura', language: 'ca' }, '2026-10-04').hits,
    ).toEqual([]);
  });
});
