import { expect, it } from 'vitest';
import { guideSchema } from '../packages/core/src/index';
import {
  digestPendingGuide,
  type GenerationReport,
} from '../packages/government/src/guide-generation';
import {
  catalunyaCaseSchema,
  catalunyaGate,
  catalunyaPublicationGate,
  compareCatalunya,
  evaluateCatalunya,
  promoteGeneratedGuide,
  scoreCatalunya,
  type CatalunyaOutcome,
  type CatalunyaDataset,
} from '../packages/evals/src/catalunya';
import { loadCatalunyaDataset } from '../packages/evals/src/index';

// Synthetic excerpt and answers exercise the gate; they assert no real legal obligation.
const testCase = catalunyaCaseSchema.parse({
  id: 'synthetic-deadline-ca',
  query: 'Quin termini fictici aplica?',
  domain: 'D-03',
  subtopic: 'alta-fiscal',
  profile: 'general',
  language: 'ca',
  city: 'Girona',
  year: 2026,
  critical: 'deadline',
  sources: [
    {
      sourceId: 'synthetic-office',
      documentId: 'fixture-v1',
      version: '2026-01-01',
      url: 'https://example.test/fixture',
      jurisdiction: 'ES-CT-GIRONA',
      consultedAt: '2026-06-01',
      excerpt: 'El termini fictici acaba el 2026-12-31.',
    },
  ],
  expected: {
    shouldAnswer: true,
    jurisdiction: 'ES-CT-GIRONA',
    requiredFacts: ['termini fictici acaba el 2026-12-31'],
    forbiddenFacts: ['2025-12-31'],
  },
});

const outcome: CatalunyaOutcome = {
  answer: {
    status: 'answered',
    answer: 'El termini fictici acaba el 2026-12-31.',
    claims: [{ id: 'c1', text: 'El termini fictici acaba el 2026-12-31.', kind: 'deadline' }],
    citations: [
      {
        claimId: 'c1',
        documentId: 'fixture-v1',
        chunkId: 'one',
        quote: 'El termini fictici acaba el 2026-12-31.',
      },
    ],
    relatedOfficialLinks: [],
  },
  evidence: [
    {
      chunkId: 'one',
      documentId: 'fixture-v1',
      sourceId: 'synthetic-office',
      canonicalUrl: 'https://example.test/fixture',
      title: 'Ficció',
      heading: 'Prova',
      content: 'El termini fictici acaba el 2026-12-31.',
      organization: 'Oficina fictícia',
      jurisdiction: 'ES-CT-GIRONA',
      authorityScore: 100,
      crawledAt: '2026-06-01',
      sourceUpdatedAt: '2026-01-01',
      applicabilityYear: 2026,
      score: 1,
      available: true,
    },
  ],
  latencyMs: 12,
  costUsd: 0.002,
};

it('anchors golden facts to a separate versioned excerpt and accepts a cited result', () => {
  const row = scoreCatalunya(testCase, outcome);
  expect(row.failures).toEqual([]);
  expect(catalunyaGate([testCase], [row])).toEqual([]);
  expect(() =>
    catalunyaCaseSchema.parse({
      ...testCase,
      expected: { ...testCase.expected, requiredFacts: ['un hecho ausente'] },
    }),
  ).toThrow('Hecho sin respaldo');
});

it('blocks critical wrong deadlines, obsolete versions and foreign jurisdictions', () => {
  const wrongDate = {
    ...outcome,
    answer: { ...outcome.answer, answer: 'El termini fictici acaba el 2025-12-31.' },
  };
  expect(catalunyaGate([testCase], [scoreCatalunya(testCase, wrongDate)])).toContain(
    'Caso crítico deadline fallido: synthetic-deadline-ca',
  );
  const obsolete = {
    ...outcome,
    evidence: [{ ...outcome.evidence[0]!, sourceUpdatedAt: '2025-01-01' }],
  };
  expect(scoreCatalunya(testCase, obsolete).failures).toContain(
    'Cita no respaldada por la versión esperada: c1',
  );
  const foreign = {
    ...outcome,
    evidence: [{ ...outcome.evidence[0]!, jurisdiction: 'ES-CT-BARCELONA' }],
  };
  expect(scoreCatalunya(testCase, foreign).failures).toContain(
    'Resultado de jurisdicción incompatible',
  );
});

it('requires abstention without evidence and rejects uncited obligations', () => {
  const empty = catalunyaCaseSchema.parse({
    ...testCase,
    id: 'synthetic-obligation-es',
    language: 'es',
    critical: 'obligation',
    sources: [],
    expected: {
      shouldAnswer: false,
      jurisdiction: 'ES-CT-GIRONA',
      requiredFacts: [],
      forbiddenFacts: ['obligatorio presentar'],
    },
  });
  const abstained: CatalunyaOutcome = {
    answer: {
      status: 'insufficient_evidence',
      answer: 'Falta evidencia.',
      claims: [],
      citations: [],
      relatedOfficialLinks: [],
    },
    evidence: [],
    latencyMs: 4,
    costUsd: 0,
  };
  expect(scoreCatalunya(empty, abstained).failures).toEqual([]);
  const guessed: CatalunyaOutcome = {
    ...abstained,
    answer: { ...outcome.answer, answer: 'Es obligatorio presentar la solicitud.', citations: [] },
  };
  expect(catalunyaGate([empty], [scoreCatalunya(empty, guessed)])).toContain(
    'Caso crítico obligation fallido: synthetic-obligation-es',
  );
});

it('compares exactly the same bilingual cases and reports quality, latency and cost by segment', () => {
  const row = scoreCatalunya(testCase, outcome);
  const comparison = compareCatalunya(
    [testCase],
    { gitCommit: 'same-commit', rows: [row] },
    {
      gitCommit: 'same-commit',
      rows: [{ ...row, failures: ['mal'], latencyMs: 20, costUsd: 0.004 }],
    },
  );
  expect(comparison.local.quality).toBe(1);
  expect(comparison.webSearch.quality).toBe(0);
  expect(comparison.local.segments['language:ca']?.latencyMs).toBe(12);
  expect(comparison.local.segments['domain:D-03']?.quality).toBe(1);
  expect(comparison.local.segments['subtopic:alta-fiscal']?.quality).toBe(1);
  expect(comparison.local.segments['profile:general']?.quality).toBe(1);
  expect(comparison.local.segments['city:Girona']?.quality).toBe(1);
  expect(comparison.local.segments['year:2026']?.quality).toBe(1);
  expect(comparison.webSearch.costUsd).toBe(0.004);
  expect(() =>
    compareCatalunya([testCase], { gitCommit: 'a', rows: [row] }, { gitCommit: 'a', rows: [] }),
  ).toThrow('mismos casos');
  expect(() =>
    compareCatalunya([testCase], { gitCommit: 'a', rows: [row] }, { gitCommit: 'b', rows: [row] }),
  ).toThrow('mismos casos');
});

it('runs identical fixture cases through either backend and fails closed on an error', async () => {
  expect(await evaluateCatalunya([testCase], async () => outcome)).toEqual([
    { id: testCase.id, failures: [], latencyMs: 12, costUsd: 0.002 },
  ]);
  const failed = await evaluateCatalunya([testCase], async () => {
    throw new Error('Synthetic backend failure');
  });
  expect(catalunyaGate([testCase], failed)).toContain(
    'Caso crítico deadline fallido: synthetic-deadline-ca',
  );
  expect(failed[0]?.latencyMs).toBeNull();
});

it('loads the controlled corpus and keeps the publication gate closed', async () => {
  const dataset = await loadCatalunyaDataset();
  expect(dataset.cases).toHaveLength(4);
  expect(dataset.stage).toBe('controlled');
  const rows = dataset.cases.map((item) => ({
    id: item.id,
    failures: [],
    latencyMs: 1,
    costUsd: 0,
  }));
  expect(catalunyaPublicationGate(dataset, rows)).toContain(
    'El corpus controlado no certifica publicación',
  );
  expect(catalunyaPublicationGate(dataset, rows)).toContain('Sin caso D-01/ca/respuesta');
  expect(catalunyaPublicationGate(dataset, rows)).toContain('Sin caso municipal Girona/es');
});

it('promotes only a guide covered by an official run and matching public evidence', async () => {
  // Synthetic gate-shape fixture: only a trusted CI runner may label a real corpus official.
  const cities = ['Barcelona', 'Lleida', 'Girona', 'Tarragona'] as const;
  const cases = Array.from(
    { length: 18 },
    (_, index) => `D-${String(index + 1).padStart(2, '0')}`,
  ).flatMap((domain, index) =>
    (['ca', 'es'] as const).flatMap((language) =>
      [true, false].map((shouldAnswer) => {
        const city = index < 4 ? cities[index]! : null;
        const jurisdiction = city ? `ES-CT-${city.toUpperCase()}` : 'ES-CT';
        return catalunyaCaseSchema.parse({
          ...testCase,
          id: `${domain}-${language}-${shouldAnswer}`,
          domain,
          language,
          city,
          expected: { shouldAnswer, jurisdiction, requiredFacts: [], forbiddenFacts: [] },
          sources: shouldAnswer ? [{ ...testCase.sources[0]!, jurisdiction }] : [],
        });
      }),
    ),
  );
  const dataset: CatalunyaDataset = {
    version: 'synthetic-ci-fixture',
    stage: 'official',
    description: 'Solo prueba sintética',
    cases,
  };
  const run = {
    gitCommit: 'fixture-commit',
    rows: cases.map((item) => ({
      id: item.id,
      failures: [],
      latencyMs: 1,
      costUsd: 0,
    })),
  };
  const quote = testCase.sources[0]!.excerpt;
  const guide = guideSchema.parse({
    id: 'synthetic-guide',
    revision: 1,
    title: { ca: 'Guia fictícia', es: 'Guía ficticia' },
    domain: 'D-03',
    subtopic: 'alta-fiscal',
    profiles: ['general'],
    jurisdiction: 'ES-CT-GIRONA',
    consultedAt: '2026-06-01',
    period: { from: '2026-01-01', evidenceIds: ['e1'] },
    validation: { status: 'pending' },
    evidence: [
      {
        id: 'e1',
        sourceId: 'synthetic-office',
        url: 'https://example.test/fixture',
        originalUrl: 'https://example.test/fixture',
        version: 'synthetic@2026-01-01#fixture',
        language: 'ca',
        attribution: 'Fuente sintética',
        sourceUpdatedAt: '2026-02-01',
        applicableFrom: '2026-01-01',
        applicableUntil: null,
        informative: false,
        jurisdiction: 'ES-CT-GIRONA',
        quote,
      },
    ],
    conditions: [],
    exclusions: [],
    claims: [],
    steps: [
      {
        id: 'step',
        text: { ca: quote, es: 'El plazo ficticio acaba el 2026-12-31.' },
        evidenceIds: ['e1'],
        translation: 'es',
        dependsOn: [],
      },
    ],
  });
  const report: GenerationReport = {
    reasons: [],
    guideDigest: await digestPendingGuide(guide),
    discrepancies: [],
    retainedStepIds: ['step'],
    sources: [
      {
        id: 'e1',
        originalUrl: 'https://example.test/fixture',
        version: 'synthetic@2026-01-01#fixture',
      },
    ],
  };
  const promote = (corpus = dataset, result = run, generation = report) =>
    promoteGeneratedGuide(guide, generation, corpus, result, 'fixture-commit', '2026-06-02');
  expect((await promote()).reasons).toEqual([]);
  expect((await promote()).guide?.validation.status).toBe('verified');
  expect((await promote({ ...dataset, stage: 'controlled' })).guide?.validation.status).toBe(
    'pending',
  );
  expect((await promote(dataset, { ...run, gitCommit: 'otro' })).guide?.validation.status).toBe(
    'pending',
  );
  expect(
    (await promote(dataset, run, { ...report, reasons: [{ code: 'conflict', ids: ['e1'] }] })).guide
      ?.validation.status,
  ).toBe('pending');
  expect(
    (
      await promoteGeneratedGuide(
        { ...guide, profiles: ['general', 'missing'] },
        report,
        dataset,
        run,
        'fixture-commit',
        '2026-06-02',
      )
    ).guide?.validation.status,
  ).toBe('pending');
  expect(
    (
      await promoteGeneratedGuide(
        { ...guide, evidence: [{ ...guide.evidence[0]!, applicableUntil: '2026-06-01' }] },
        report,
        dataset,
        run,
        'fixture-commit',
        '2026-06-02',
      )
    ).guide?.validation.status,
  ).toBe('pending');
  const wrongSource = {
    ...dataset,
    cases: dataset.cases.map((item) =>
      item.id === 'D-03-ca-true'
        ? { ...item, sources: [{ ...item.sources[0]!, version: '2025-01-01' }] }
        : item,
    ),
  };
  expect((await promote(wrongSource)).guide?.validation.status).toBe('pending');
  const changedTranslation = {
    ...guide,
    steps: [
      {
        ...guide.steps[0]!,
        text: { ...guide.steps[0]!.text, es: 'Un plazo distinto sin verificar.' },
      },
    ],
  };
  const altered = await promoteGeneratedGuide(
    changedTranslation,
    report,
    dataset,
    run,
    'fixture-commit',
    '2026-06-02',
  );
  expect(altered.guide?.validation.status).toBe('pending');
  expect(altered.reasons).toContain('Guía modificada desde la generación');
});
