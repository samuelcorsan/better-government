import { z } from 'zod';
export type Jurisdiction = string;
export const regionSchema = z.enum([
  'ES-AN',
  'ES-AR',
  'ES-AS',
  'ES-IB',
  'ES-CN',
  'ES-CB',
  'ES-CL',
  'ES-CM',
  'ES-CT',
  'ES-VC',
  'ES-EX',
  'ES-GA',
  'ES-MD',
  'ES-MC',
  'ES-NC',
  'ES-PV',
  'ES-RI',
  'ES-CE',
  'ES-ML',
]);
export type Region = z.infer<typeof regionSchema>;
export type Source = {
  id: string;
  name: string;
  baseUrl: string;
  hosts: string[];
  organization: string;
  jurisdictionType: 'country' | 'region' | 'municipality';
  jurisdictionValue: Jurisdiction;
  authorityScore: number;
  enabled: boolean;
  /** Idiomas comprobados para las páginas públicas inventariadas. */
  languages?: ('ca' | 'es')[];
  /** URLs públicas verificadas; si existe, ninguna otra ruta del host está aprobada. */
  publicUrls?: string[];
};
export type Evidence = {
  chunkId: string;
  documentId: string;
  sourceId: string;
  canonicalUrl: string;
  title: string;
  heading: string;
  content: string;
  organization: string;
  jurisdiction: Jurisdiction;
  authorityScore: number;
  crawledAt: string;
  sourceUpdatedAt: string | null;
  score: number;
  available: boolean;
  validUntil?: string | null;
  applicabilityYear?: number | null;
};
export type QueryUnderstanding = {
  normalizedQuery: string;
  intent: string;
  location?: string;
  jurisdiction?: Jurisdiction;
  region?: Region | null;
  likelyOrganizations: string[];
  keywords: string[];
  clarification?: string;
  temporal: boolean;
  requestedYear?: number;
};
export const answerSchema = z.object({
  status: z.enum(['answered', 'insufficient_evidence', 'needs_clarification']),
  answer: z.string().max(1800),
  claims: z
    .array(
      z.object({
        id: z.string(),
        text: z.string().max(900),
        kind: z.enum(['step', 'document', 'cost', 'deadline', 'fact']),
      }),
    )
    .max(16),
  citations: z
    .array(
      z.object({
        claimId: z.string(),
        documentId: z.string(),
        chunkId: z.string(),
        quote: z.string().min(8).max(12000),
      }),
    )
    .max(40),
  relatedOfficialLinks: z.array(z.object({ documentId: z.string() })).max(6),
  incomplete: z.boolean().optional(),
});
export type Answer = z.infer<typeof answerSchema>;
export type VerifiedClaim = {
  claim: Answer['claims'][number];
  citations: Answer['citations'];
};
export const configSchema = z.object({
  finalEvidenceCount: z.number().int().min(1).max(12).default(8),
  reasoningEffort: z.enum(['none', 'minimal', 'low', 'medium', 'high', 'xhigh']).default('high'),
  generationModel: z.string().default('openai/gpt-6-luna'),
  judgeModel: z.string().default('openai/gpt-6-luna'),
  promptVersion: z.enum(['evidence-v1', 'evidence-v2']).default('evidence-v2'),
});
export type SearchConfig = z.infer<typeof configSchema>;
export const defaultConfig = configSchema.parse({});
export type Stage = 'understandQuery' | 'retrieval' | 'generation' | 'evaluation';
export type SearchResult = {
  id: string;
  traceId: string;
  query: string;
  resolvedQuery?: string;
  understanding: QueryUnderstanding;
  evidence: Evidence[];
  answer: Answer;
  mode: 'live' | 'preview';
  latencyMs: number;
  tokens: number;
  costUsd: number | null;
  usage?: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    costUsd: number | null;
    latencyMs: number;
  }[];
  config: SearchConfig;
};
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
export function compatibleJurisdiction(document: string, target?: string): boolean {
  if (!target) return document === 'ES';
  return document === target || target.startsWith(document + '-');
}
export const abstain = (
  reason = 'No tengo evidencia oficial suficiente para responder con seguridad. Concreta el trámite o consulta el organismo responsable.',
): Answer => ({
  status: 'insufficient_evidence',
  answer: reason,
  claims: [],
  citations: [],
  relatedOfficialLinks: [],
});
/** Compare literal text without treating Markdown markup or NBSP as factual differences. */
export function evidenceText(markdown: string): string {
  return markdown
    .replace(/\[([^\]]+)\]\([^\n]*?\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*[-+]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
export function quoteSupported(content: string, quote: string): boolean {
  const text = evidenceText(quote);
  return text.length >= 8 && evidenceText(content).includes(text);
}

const guideId = z.string().trim().min(1);
const guideDate = z.iso.date();
const bilingual = z.strictObject({ ca: z.string().trim().min(1), es: z.string().trim().min(1) });
const guideJurisdiction = z.string().regex(/^ES(?:-[A-Z]{2}(?:-[A-Z0-9]+(?:-[A-Z0-9]+)*)?)?$/);
const citedText = z.strictObject({
  id: guideId,
  text: bilingual,
  evidenceIds: z.array(guideId).min(1),
  /** Language written by the product; null means both languages have original-source evidence. */
  translation: z.enum(['ca', 'es']).nullable(),
});
const publicGuideUrl = z.url().refine((url) => {
  const parsed = new URL(url);
  return parsed.protocol === 'https:' && !parsed.username && !parsed.password;
});

/** Structural checks only: citations are internal references and ISO dates are matched literally. Source authenticity and applicability need separate automatic gates before `verified`; parsing alone is insufficient. */
export const guideSchema = z
  .strictObject({
    id: guideId,
    revision: z.number().int().positive(),
    title: bilingual,
    domain: z.string().regex(/^D-(0[1-9]|1[0-8])$/),
    subtopic: guideId,
    profiles: z.array(guideId).min(1),
    jurisdiction: guideJurisdiction,
    consultedAt: guideDate,
    period: z.strictObject({
      from: guideDate.optional(),
      until: guideDate.optional(),
      evidenceIds: z.array(guideId),
    }),
    validation: z.discriminatedUnion('status', [
      z.strictObject({ status: z.literal('pending') }),
      z.strictObject({
        status: z.literal('verified'),
        checkedAt: guideDate,
        method: z.literal('automatic'),
      }),
    ]),
    evidence: z
      .array(
        z.strictObject({
          id: guideId,
          sourceId: guideId,
          url: publicGuideUrl,
          originalUrl: publicGuideUrl,
          version: guideId,
          language: z.enum(['ca', 'es']),
          attribution: z.string().trim().min(1),
          sourceUpdatedAt: guideDate.nullable(),
          informative: z.boolean(),
          jurisdiction: guideJurisdiction,
          quote: z.string().trim().min(8),
        }),
      )
      .min(1),
    conditions: z.array(citedText),
    exclusions: z.array(citedText),
    claims: z
      .array(
        citedText.extend({
          kind: z.enum(['fact', 'obligation']),
          conditionIds: z.array(guideId),
        }),
      )
      .min(1),
    steps: z.array(citedText.extend({ dependsOn: z.array(guideId) })),
  })
  .superRefine((guide, context) => {
    const issue = (message: string) => context.addIssue({ code: 'custom', message });
    const evidence = new Map(guide.evidence.map((item) => [item.id, item]));
    const hasDateCitation = (ids: string[], date: string) =>
      ids.some((id) => evidence.get(id)?.quote.includes(date));
    if (evidence.size !== guide.evidence.length) issue('Evidencia duplicada');
    for (const item of guide.evidence)
      if (!compatibleJurisdiction(item.jurisdiction, guide.jurisdiction))
        issue(`Ámbito incompatible en evidencia ${item.id}`);

    const statements = [...guide.conditions, ...guide.exclusions, ...guide.claims, ...guide.steps];
    if (new Set(statements.map((item) => item.id)).size !== statements.length)
      issue('Identificador de afirmación duplicado');
    for (const statement of statements) {
      for (const id of statement.evidenceIds)
        if (!evidence.has(id)) issue(`Cita inexistente ${id}`);
      const languages = new Set(statement.evidenceIds.map((id) => evidence.get(id)?.language));
      if (statement.translation) {
        if (!languages.has(statement.translation === 'ca' ? 'es' : 'ca'))
          issue(`Traducción sin cita en idioma original ${statement.id}`);
      } else if (!languages.has('ca') || !languages.has('es'))
        issue(`Texto bilingüe sin citas originales en ambos idiomas ${statement.id}`);
      for (const date of [
        ...statement.text.ca.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g),
        ...statement.text.es.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g),
      ])
        if (!hasDateCitation(statement.evidenceIds, date[0]))
          issue(`Fecha de afirmación sin cita literal ${date[0]}`);
    }

    const conditions = new Set(guide.conditions.map((item) => item.id));
    for (const claim of guide.claims) {
      if (claim.kind === 'obligation' && claim.conditionIds.length === 0)
        issue(`Obligación sin condiciones ${claim.id}`);
      for (const id of claim.conditionIds)
        if (!conditions.has(id)) issue(`Condición inexistente ${id}`);
    }

    const priorSteps = new Set<string>();
    for (const step of guide.steps) {
      for (const id of step.dependsOn)
        if (!priorSteps.has(id)) issue(`Dependencia inexistente o posterior ${id}`);
      priorSteps.add(step.id);
    }

    if (guide.period.from && guide.period.until && guide.period.from > guide.period.until)
      issue('Periodo invertido');
    if (guide.validation.status === 'verified' && !guide.period.from && !guide.period.until)
      issue('Vigencia desconocida');
    for (const id of guide.period.evidenceIds)
      if (!evidence.has(id)) issue(`Cita de vigencia inexistente ${id}`);
    for (const date of [guide.period.from, guide.period.until]) {
      if (date && !hasDateCitation(guide.period.evidenceIds, date))
        issue(`Fecha de vigencia sin cita literal ${date}`);
    }
    if (guide.validation.status === 'verified' && guide.validation.checkedAt < guide.consultedAt)
      issue('Validación anterior a la consulta');
  });
export type Guide = z.infer<typeof guideSchema>;
