import { describe, expect, it } from 'vitest';
import { abstain, guideSchema, type Evidence } from '../packages/core/src/index';
import {
  preparationCoverage,
  preparationGuides,
  preparationProfileBranches,
  preparationRights,
} from '../packages/government/src/preparation-guides';
import { preparationCases, preparationDataset } from '../packages/evals/src/preparation-cases';
import {
  catalunyaPublicationGate,
  scoreCatalunya,
  type CatalunyaOutcome,
} from '../packages/evals/src/catalunya';

describe('preparación, forma profesional e identificación', () => {
  it('entrega propuestas bilingües parciales con preguntas y sin atribuir verificación automática', () => {
    expect(new Set(preparationGuides.map((guide) => guide.domain))).toEqual(
      new Set(['D-01', 'D-02', 'D-16']),
    );
    for (const guide of preparationGuides) {
      expect(guideSchema.safeParse(guide).success).toBe(true);
      expect(guide.validation.status).toBe('pending');
      expect(guide.conditions.length).toBeGreaterThan(0);
      expect(guide.exclusions.length).toBeGreaterThan(0);
      expect(guide.steps.length).toBeGreaterThan(0);
      const coverage = preparationCoverage.find((item) => item.guideId === guide.id);
      expect(coverage?.status).toBe('partial');
      expect(coverage?.questions.length).toBeGreaterThan(0);
      expect(coverage?.gaps.length).toBeGreaterThan(0);
      for (const item of coverage?.questions ?? []) {
        expect(item.ca).toBeTruthy();
        expect(item.es).toBeTruthy();
      }
    }
    expect(
      preparationProfileBranches.find((branch) => branch.profile === 'unemployment')?.domains,
    ).toEqual(['D-05']);
    expect(
      preparationProfileBranches.find((branch) => branch.profile === 'foreign-national')?.domains,
    ).toEqual(['D-14']);
    expect(
      preparationProfileBranches.find((branch) => branch.profile === 'pluriactivity')?.domains,
    ).toEqual(['D-04']);
    for (const profile of preparationProfileBranches) {
      expect(profile.questions.length).toBeGreaterThan(0);
      expect(profile.urls.length).toBeGreaterThan(0);
      expect(profile.limitation.ca).toBeTruthy();
      expect(profile.limitation.es).toBeTruthy();
    }
  });

  it('distingue ramas y excluye contenido FNMT/AOC y referencias históricas como evidencia', () => {
    const get = (id: string) => preparationGuides.find((guide) => guide.id === id)!;
    expect(get('family-collaborator').profiles).toEqual(['collaborator']);
    expect(get('individual-pathway').profiles).not.toContain('alternative-mutuality');
    expect(get('societario-role').profiles).toEqual(['societario']);
    expect(get('trade').profiles).toContain('with-employees');
    expect(get('societario-role').evidence[0]?.applicableFrom).toBe('2023-04-01');
    expect(get('alternative-mutuality').evidence[0]?.sourceUpdatedAt).toBe('2026-07-31');
    expect(get('alternative-mutuality').evidence[0]?.applicableFrom).toBe('2026-08-01');
    const urls = preparationGuides.flatMap((guide) => guide.evidence.map((item) => item.url));
    expect(
      urls.every((url) =>
        ['www.boe.es', 'tramits.gencat.cat', 'canalempresa.gencat.cat'].includes(
          new URL(url).hostname,
        ),
      ),
    ).toBe(true);
    expect(
      urls.some((url) => url.includes('Formes-juridiques') || url.includes('tarragona.pdf')),
    ).toBe(false);
    expect(preparationRights.excluded.map((item) => new URL(item.url).hostname)).toEqual([
      'www.aoc.cat',
      'www.sede.fnmt.gob.es',
    ]);
    for (const guide of preparationGuides)
      for (const statement of [...guide.conditions, ...guide.exclusions, ...guide.steps]) {
        const source = guide.evidence.find((item) => item.id === statement.evidenceIds[0]);
        expect(statement.translation).toBe(source?.language === 'ca' ? 'es' : 'ca');
      }
  });

  it('prepara escenarios ca/es de cada perfil y evalúa versiones/abstención sin abrir el gate oficial', () => {
    expect(preparationDataset.stage).toBe('controlled');
    for (const guide of preparationGuides)
      for (const profile of guide.profiles)
        for (const language of ['ca', 'es'])
          for (const shouldAnswer of [true, false])
            expect(
              preparationCases.some(
                (item) =>
                  item.subtopic === guide.subtopic &&
                  item.profile === profile &&
                  item.language === language &&
                  item.expected.shouldAnswer === shouldAnswer,
              ),
            ).toBe(true);

    // Synthetic scorer outcomes retain literal original-language excerpts; no retrieval/model ran.
    const rows = preparationCases.map((testCase) => {
      const evidence: Evidence[] = testCase.sources.map((source) => ({
        chunkId: source.documentId,
        documentId: source.documentId,
        sourceId: source.sourceId,
        canonicalUrl: source.url,
        title: 'Control público',
        heading: '',
        content: source.excerpt,
        organization: 'Organismo del documento',
        jurisdiction: source.jurisdiction,
        authorityScore: 1,
        crawledAt: source.consultedAt,
        sourceUpdatedAt: source.version,
        score: 1,
        available: true,
        applicabilityYear: testCase.year,
      }));
      const result: CatalunyaOutcome = {
        answer: testCase.sources.length
          ? {
              status: 'answered',
              answer: testCase.sources.map((source) => source.excerpt).join(' '),
              claims: testCase.sources.map((source) => ({
                id: source.documentId,
                text: source.excerpt,
                kind: 'fact',
              })),
              citations: testCase.sources.map((source) => ({
                claimId: source.documentId,
                documentId: source.documentId,
                chunkId: source.documentId,
                quote: source.excerpt,
              })),
              relatedOfficialLinks: [],
            }
          : abstain(),
        evidence,
        latencyMs: 1,
        costUsd: null,
      };
      const row = scoreCatalunya(testCase, result);
      expect(row.failures).toEqual([]);
      if (testCase.sources.length) {
        expect(
          scoreCatalunya(testCase, {
            ...result,
            evidence: evidence.map((item) => ({ ...item, sourceUpdatedAt: '2000-01-01' })),
          }).failures.length,
        ).toBeGreaterThan(0);
        expect(
          scoreCatalunya(testCase, {
            ...result,
            evidence: evidence.map((item) => ({ ...item, jurisdiction: 'ES-CT-GIRONA' })),
          }).failures.length,
        ).toBeGreaterThan(0);
      }
      return row;
    });
    for (const guide of preparationGuides)
      for (const evidence of guide.evidence)
        for (const profile of guide.profiles)
          for (const language of ['ca', 'es'])
            expect(
              preparationCases.some(
                (item) =>
                  item.subtopic === guide.subtopic &&
                  item.profile === profile &&
                  item.language === language &&
                  item.expected.shouldAnswer &&
                  item.sources.some(
                    (source) =>
                      source.documentId === evidence.id &&
                      source.url === evidence.url &&
                      source.version === evidence.version,
                  ),
              ),
            ).toBe(true);
    expect(catalunyaPublicationGate(preparationDataset, rows)).toContain(
      'El corpus controlado no certifica publicación',
    );
    for (const city of ['Barcelona', 'Girona', 'Lleida', 'Tarragona'])
      for (const language of ['ca', 'es'])
        expect(
          preparationCases.some(
            (item) =>
              item.city === city && item.language === language && !item.expected.shouldAnswer,
          ),
        ).toBe(true);
  });
});
