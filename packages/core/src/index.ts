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
