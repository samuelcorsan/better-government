import { expect, it } from 'vitest';
import {
  catalunyaCaseSchema,
  catalunyaGate,
  catalunyaPublicationGate,
  compareCatalunya,
  evaluateCatalunya,
  scoreCatalunya,
  type CatalunyaOutcome,
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
