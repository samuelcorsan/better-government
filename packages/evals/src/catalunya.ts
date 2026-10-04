import {
  compatibleJurisdiction,
  normalizeText,
  quoteSupported,
  type SearchResult,
} from '@reforma-digital/core';
import { z } from 'zod';

const id = z.string().min(1);
const jurisdiction = z.string().regex(/^ES(?:-[A-Z]{2}(?:-[A-Z0-9]+)*)?$/);
const source = z.strictObject({
  sourceId: id,
  documentId: id,
  version: z.iso.date(),
  url: z.url().refine((value) => {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
  }),
  jurisdiction,
  consultedAt: z.iso.date(),
  excerpt: z.string().min(8),
});

/** Golden expectations are tied to a separately captured public excerpt, never to a generated answer. */
export const catalunyaCaseSchema = z
  .strictObject({
    id,
    query: z.string().min(4),
    domain: z.string().regex(/^D-(0[1-9]|1[0-8])$/),
    subtopic: id,
    profile: id,
    language: z.enum(['ca', 'es']),
    city: z.enum(['Barcelona', 'Girona', 'Lleida', 'Tarragona']).nullable(),
    year: z.number().int().min(2000).max(2100),
    critical: z.enum(['deadline', 'jurisdiction', 'obligation']).nullable(),
    sources: z.array(source),
    expected: z.strictObject({
      shouldAnswer: z.boolean(),
      jurisdiction,
      requiredFacts: z.array(z.string().min(1)),
      forbiddenFacts: z.array(z.string().min(1)),
    }),
  })
  .superRefine((testCase, context) => {
    if (
      testCase.city &&
      !compatibleJurisdiction(
        testCase.expected.jurisdiction,
        `ES-CT-${testCase.city.toUpperCase()}`,
      )
    )
      context.addIssue({ code: 'custom', message: 'Ciudad y ámbito esperado incompatibles' });
    if (testCase.expected.shouldAnswer && !testCase.sources.length)
      context.addIssue({
        code: 'custom',
        message: 'Una respuesta necesita evidencia independiente',
      });
    for (const fact of testCase.expected.requiredFacts)
      if (
        !testCase.sources.some((item) => normalizeText(item.excerpt).includes(normalizeText(fact)))
      )
        context.addIssue({ code: 'custom', message: `Hecho sin respaldo en el fixture: ${fact}` });
    for (const item of testCase.sources)
      if (!compatibleJurisdiction(item.jurisdiction, testCase.expected.jurisdiction))
        context.addIssue({
          code: 'custom',
          message: `Ámbito de fuente incompatible: ${item.sourceId}`,
        });
  });
export type CatalunyaCase = z.infer<typeof catalunyaCaseSchema>;
export const catalunyaDatasetSchema = z.strictObject({
  version: z.string().min(1),
  stage: z.enum(['controlled', 'official']),
  description: z.string().min(1),
  cases: z.array(catalunyaCaseSchema).min(1),
});
export type CatalunyaDataset = z.infer<typeof catalunyaDatasetSchema>;
export type CatalunyaOutcome = Pick<SearchResult, 'answer' | 'evidence' | 'latencyMs' | 'costUsd'>;
export type CatalunyaRow = {
  id: string;
  failures: string[];
  latencyMs: number | null;
  costUsd: number | null;
};
export type CatalunyaRun = { gitCommit: string; rows: CatalunyaRow[] };

export function scoreCatalunya(testCase: CatalunyaCase, result: CatalunyaOutcome): CatalunyaRow {
  const failures: string[] = [];
  const validLatency = Number.isFinite(result.latencyMs) && result.latencyMs >= 0;
  const validCost =
    result.costUsd === null || (Number.isFinite(result.costUsd) && result.costUsd >= 0);
  if (!validLatency) failures.push('Latencia inválida');
  if (!validCost) failures.push('Coste inválido');
  const answered = result.answer.status === 'answered';
  if (answered !== testCase.expected.shouldAnswer)
    failures.push('Respuesta o abstención incorrecta');
  if (answered && !testCase.sources.length) failures.push('Respuesta sin evidencia independiente');
  const text = normalizeText(
    [result.answer.answer, ...result.answer.claims.map((claim) => claim.text)].join(' '),
  );
  for (const fact of testCase.expected.forbiddenFacts)
    if (text.includes(normalizeText(fact))) failures.push(`Afirmación prohibida: ${fact}`);
  if (!answered && (result.answer.claims.length || result.answer.citations.length))
    failures.push('Abstención con afirmaciones o citas');
  if (answered) {
    for (const fact of testCase.expected.requiredFacts)
      if (!text.includes(normalizeText(fact))) failures.push(`Falta el hecho esperado: ${fact}`);
    if (!result.answer.claims.length) failures.push('Respuesta sin afirmaciones comprobables');
    for (const claim of result.answer.claims) {
      const citations = result.answer.citations.filter((citation) => citation.claimId === claim.id);
      if (!citations.length) failures.push(`Afirmación sin cita: ${claim.id}`);
      for (const citation of citations) {
        const evidence = result.evidence.find(
          (item) => item.documentId === citation.documentId && item.chunkId === citation.chunkId,
        );
        const golden = testCase.sources.find(
          (item) => item.documentId === citation.documentId && item.sourceId === evidence?.sourceId,
        );
        if (
          !evidence ||
          !golden ||
          evidence.canonicalUrl !== golden.url ||
          evidence.sourceUpdatedAt !== golden.version ||
          evidence.applicabilityYear !== testCase.year ||
          !compatibleJurisdiction(evidence.jurisdiction, testCase.expected.jurisdiction) ||
          !quoteSupported(evidence.content, citation.quote) ||
          !quoteSupported(golden.excerpt, citation.quote)
        )
          failures.push(`Cita no respaldada por la versión esperada: ${claim.id}`);
      }
    }
    if (
      result.evidence.some(
        (item) => !compatibleJurisdiction(item.jurisdiction, testCase.expected.jurisdiction),
      )
    )
      failures.push('Resultado de jurisdicción incompatible');
  }
  return {
    id: testCase.id,
    failures,
    latencyMs: validLatency ? result.latencyMs : null,
    costUsd: validCost ? result.costUsd : null,
  };
}

export async function evaluateCatalunya(
  cases: CatalunyaCase[],
  run: (testCase: CatalunyaCase) => Promise<CatalunyaOutcome>,
): Promise<CatalunyaRow[]> {
  const rows: CatalunyaRow[] = [];
  for (const testCase of cases) {
    try {
      rows.push(scoreCatalunya(testCase, await run(testCase)));
    } catch {
      rows.push({
        id: testCase.id,
        failures: ['El motor falló o no devolvió un resultado válido'],
        latencyMs: null,
        costUsd: null,
      });
    }
  }
  return rows;
}

export function catalunyaGate(cases: CatalunyaCase[], rows: CatalunyaRow[]): string[] {
  const reasons: string[] = [];
  const byId = new Map(rows.map((row) => [row.id, row]));
  if (!cases.length || new Set(cases.map((item) => item.id)).size !== cases.length)
    reasons.push('Dataset vacío o con IDs duplicados');
  if (byId.size !== rows.length || rows.length !== cases.length)
    reasons.push('Casos ausentes o duplicados');
  for (const testCase of cases) {
    const row = byId.get(testCase.id);
    if (!row) reasons.push(`Caso sin resultado: ${testCase.id}`);
    else if (row.failures.length)
      reasons.push(
        testCase.critical
          ? `Caso crítico ${testCase.critical} fallido: ${testCase.id}`
          : `Caso fallido: ${testCase.id}`,
      );
  }
  return reasons;
}

/** Publication stays closed until the controlled corpus is replaced by source-checked cases. */
export function catalunyaPublicationGate(
  dataset: CatalunyaDataset,
  rows: CatalunyaRow[],
): string[] {
  const reasons = catalunyaGate(dataset.cases, rows);
  if (dataset.stage !== 'official') reasons.push('El corpus controlado no certifica publicación');
  for (const domain of Array.from(
    { length: 18 },
    (_, index) => `D-${String(index + 1).padStart(2, '0')}`,
  ))
    for (const language of ['ca', 'es'])
      for (const shouldAnswer of [true, false])
        if (
          !dataset.cases.some(
            (item) =>
              item.domain === domain &&
              item.language === language &&
              item.expected.shouldAnswer === shouldAnswer,
          )
        )
          reasons.push(
            `Sin caso ${domain}/${language}/${shouldAnswer ? 'respuesta' : 'abstención'}`,
          );
  for (const city of ['Barcelona', 'Girona', 'Lleida', 'Tarragona'])
    for (const language of ['ca', 'es'])
      if (!dataset.cases.some((item) => item.city === city && item.language === language))
        reasons.push(`Sin caso municipal ${city}/${language}`);
  return reasons;
}

/** Both backends must run the identical case set; this comparison never approves publication. */
export function compareCatalunya(
  cases: CatalunyaCase[],
  localRun: CatalunyaRun,
  webSearchRun: CatalunyaRun,
) {
  const ids = cases.map((item) => item.id);
  const { rows: local } = localRun;
  const { rows: webSearch } = webSearchRun;
  if (
    !localRun.gitCommit ||
    localRun.gitCommit !== webSearchRun.gitCommit ||
    !ids.length ||
    new Set(ids).size !== ids.length ||
    [local, webSearch].some(
      (rows) =>
        rows.length !== ids.length ||
        new Set(rows.map((row) => row.id)).size !== ids.length ||
        rows.some((row) => !ids.includes(row.id)),
    )
  )
    throw new Error('La comparación exige los mismos casos');
  const summary = (rows: CatalunyaRow[]) => ({
    quality: rows.filter((row) => !row.failures.length).length / rows.length,
    latencyMs: rows.some((row) => row.latencyMs === null)
      ? null
      : rows.reduce((sum, row) => sum + row.latencyMs!, 0) / rows.length,
    costUsd: rows.some((row) => row.costUsd === null)
      ? null
      : rows.reduce((sum, row) => sum + row.costUsd!, 0),
  });
  const segment = (rows: CatalunyaRow[]) => {
    const result: Record<string, ReturnType<typeof summary>> = {};
    const byId = new Map(rows.map((row) => [row.id, row]));
    for (const dimension of [
      'domain',
      'subtopic',
      'profile',
      'language',
      'city',
      'year',
    ] as const) {
      const values = new Set(cases.map((item) => String(item[dimension])));
      for (const value of values)
        result[`${dimension}:${value}`] = summary(
          cases
            .filter((item) => String(item[dimension]) === value)
            .map((item) => byId.get(item.id)!),
        );
    }
    return result;
  };
  return {
    gitCommit: localRun.gitCommit,
    local: { ...summary(local), segments: segment(local) },
    webSearch: { ...summary(webSearch), segments: segment(webSearch) },
  };
}
