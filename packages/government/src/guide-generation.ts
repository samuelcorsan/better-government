import {
  compatibleJurisdiction,
  evidenceText,
  guideSchema,
  quoteSupported,
  type Guide,
} from '@reforma-digital/core';
import type { LegalSnapshot } from './legal-versions';

type Seed = Pick<
  Guide,
  'id' | 'revision' | 'title' | 'domain' | 'subtopic' | 'profiles' | 'jurisdiction' | 'consultedAt'
>;
type Draft = Pick<Guide, 'period' | 'conditions' | 'exclusions' | 'claims' | 'steps'>;
/** Must be compiled from, or acquired with, an approved public taxonomy; never built from a query. */
export type PublicTaxonomy = {
  guideIds: readonly string[];
  subtopics: readonly string[];
  profiles: readonly string[];
  topics: readonly string[];
};
export type PublicPassage<Receipt = unknown> = {
  id: string;
  /** Same topic means competing wording for one material assertion, not a broad subject category. */
  topic: string;
  sourceId: string;
  url: string;
  originalUrl: string;
  version: string;
  language: 'ca' | 'es';
  jurisdiction: string;
  /** Public text acquired with this document; never forwarded to the generator. */
  content: string;
  quote: string;
  receipt: Receipt;
};
type StatementKind = 'condition' | 'exclusion' | 'fact' | 'obligation' | 'step';
export type DocumentApproval =
  | {
      status: 'approved';
      kinds: StatementKind[];
      applicableFrom: string;
      applicableUntil: string | null;
      attribution: string;
      sourceUpdatedAt: string | null;
      informative: boolean;
    }
  | { status: 'reference' }
  | { status: 'rejected' };
/** An approver must check the exact public document URL and original URL, version, rights,
 * applicability and absence of personal data in the public excerpt and URLs. A trusted
 * acquisition receipt is required; neither a host nor this type proves approval. */
export type ApproveDocument<Receipt> = (
  passage: PublicPassage<Receipt>,
  seed: Seed,
) => Promise<DocumentApproval>;
type ModelInput = Pick<Seed, 'domain' | 'subtopic' | 'profiles' | 'jurisdiction'> & {
  passages: {
    id: string;
    topic: string;
    quote: string;
    language: 'ca' | 'es';
    version: string;
    applicableFrom: string;
  }[];
};
type TranslatorInput = {
  original: string;
  translation: string;
  from: 'ca' | 'es';
  to: 'ca' | 'es';
};
type CompareInput = {
  topic: string;
  left: Pick<PublicPassage, 'id' | 'quote' | 'language'>;
  right: Pick<PublicPassage, 'id' | 'quote' | 'language'>;
};
type Reason =
  | 'source-unconfirmed'
  | 'quote-unmatched'
  | 'unsafe-material'
  | 'conflict'
  | 'unresolved-comparison'
  | 'unsupported-statement'
  | 'translation-unverified'
  | 'unsupported-period'
  | 'omitted-source'
  | 'invalid-draft';
export type GenerationReport = {
  reasons: { code: Reason; ids: string[] }[];
  /** SHA-256 of the exact pending Guide returned by generation; integrity check, not a signature. */
  guideDigest: string | null;
  sources: { id: string; originalUrl: string; version: string }[];
  discrepancies: {
    topic: string;
    passages: { id: string; quote: string; originalUrl: string; version: string }[];
  }[];
  retainedStepIds: string[];
};

const safeId = /^[a-zA-Z0-9_-]{1,64}$/;
const sha256 = /^[a-f0-9]{64}$/;
const promptInstruction =
  /<\|(?:system|developer|assistant)\|>|(?:ignore|ignora|desatiende).{0,60}(?:instructions|instrucciones|instruccions)|(?:system|developer)\s*:/i;
const privateValue =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b|\b(?:[XYZ]\d{7}[A-Z]|\d{8}[A-Z])\b/i;

async function digestText(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Exact JSON integrity of the structurally parsed pending Guide; caller must trust the report producer. */
export function digestPendingGuide(guide: Guide): Promise<string> {
  return digestText(JSON.stringify(guide));
}

function publicUrl(url: URL): boolean {
  try {
    const decoded = decodeURIComponent(url.href);
    return (
      url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      !url.hash &&
      !privateValue.test(decoded) &&
      !/[?&](?:token|session|sid|cookie|user|email|dni|nif|name|nombre)=/i.test(decoded)
    );
  } catch {
    return false;
  }
}

function validDate(value: string): boolean {
  const time = Date.parse(value);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value
  );
}

/** BOE adapter: an original-only or repealed record is a reference, never a current rule. */
export async function approveBoePassage(
  passage: PublicPassage<LegalSnapshot>,
  mayReuse: (originalUrl: string, noticeUrl: string) => Promise<boolean>,
): Promise<DocumentApproval> {
  const source = passage.receipt;
  if (
    source.source !== 'boe' ||
    source.observation !== 'consolidated' ||
    source.reportedStatus !== 'in_force'
  )
    return { status: 'reference' };
  if (!(
    /^BOE-A-\d{4}-\d{1,8}$/.test(source.id) &&
    source.language === 'es' &&
    !!source.materialDigest &&
    sha256.test(source.materialDigest) &&
    source.originalUrl === `https://www.boe.es/buscar/doc.php?id=${source.id}` &&
    source.informativeUrl === `https://www.boe.es/buscar/act.php?id=${source.id}` &&
    passage.sourceId === 'boe' &&
    passage.url === source.informativeUrl &&
    passage.originalUrl === source.originalUrl &&
    passage.version === `${source.id}@${source.versionDate}#${source.materialDigest}` &&
    passage.language === source.language &&
    passage.jurisdiction === 'ES'
  ))
    return { status: 'rejected' };
  const digest = await digestText(passage.content);
  if (digest !== source.materialDigest) return { status: 'rejected' };
  const reusable = await mayReuse(
    source.originalUrl,
    'https://www.boe.es/informacion/aviso_legal/index.php',
  );
  return reusable
    ? {
        status: 'approved',
        kinds: ['condition', 'exclusion', 'fact', 'obligation', 'step'],
        applicableFrom: source.versionDate,
        applicableUntil: null,
        attribution: 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado',
        sourceUpdatedAt: source.metadataRevision
          ? `${source.metadataRevision.slice(0, 4)}-${source.metadataRevision.slice(4, 6)}-${source.metadataRevision.slice(6, 8)}`
          : null,
        informative: true,
      }
    : { status: 'reference' };
}

/** Builds a pending Guide from public excerpts. The separate corpus publication gate still applies. */
export async function generatePublicGuide<Receipt>(
  seed: Seed,
  taxonomy: PublicTaxonomy,
  passages: PublicPassage<Receipt>[],
  approve: ApproveDocument<Receipt>,
  propose: (input: ModelInput) => Promise<Draft>,
  verifyTranslation: (input: TranslatorInput) => Promise<boolean>,
  compare: (input: CompareInput) => Promise<'equivalent' | 'conflict' | 'unknown'> = async () =>
    'unknown',
): Promise<{ guide: Guide | null; report: GenerationReport }> {
  const report: GenerationReport = {
    reasons: [],
    guideDigest: null,
    sources: [],
    discrepancies: [],
    retainedStepIds: [],
  };
  const note = (code: Reason, ids: string[] = []) =>
    report.reasons.push({
      code,
      ids: ids.filter((id) => safeId.test(id) && !privateValue.test(id)).sort(),
    });
  if (
    !safeId.test(seed.id) ||
    privateValue.test(seed.id) ||
    !taxonomy.guideIds.includes(seed.id) ||
    !safeId.test(seed.subtopic) ||
    privateValue.test(seed.subtopic) ||
    !taxonomy.subtopics.includes(seed.subtopic) ||
    !/^D-(0[1-9]|1[0-8])$/.test(seed.domain) ||
    !/^ES(?:-[A-Z]{2}(?:-[A-Z0-9]+)*)?$/.test(seed.jurisdiction) ||
    !validDate(seed.consultedAt) ||
    !Array.isArray(seed.profiles) ||
    !seed.profiles.length ||
    seed.profiles.some(
      (profile) =>
        !safeId.test(profile) || privateValue.test(profile) || !taxonomy.profiles.includes(profile),
    ) ||
    !seed.title ||
    privateValue.test(`${seed.title.ca} ${seed.title.es}`) ||
    promptInstruction.test(`${seed.title.ca} ${seed.title.es}`)
  ) {
    note('invalid-draft');
    return { guide: null, report };
  }
  const eligible = new Map<
    string,
    { passage: PublicPassage<Receipt>; approval: Extract<DocumentApproval, { status: 'approved' }> }
  >();
  const counts = new Map<string, number>();
  for (const passage of passages) counts.set(passage.id, (counts.get(passage.id) ?? 0) + 1);
  for (const passage of [...passages].sort((a, b) => a.id.localeCompare(b.id))) {
    if (
      !safeId.test(passage.id) ||
      privateValue.test(passage.id) ||
      !safeId.test(passage.topic) ||
      privateValue.test(passage.topic) ||
      !taxonomy.topics.includes(passage.topic) ||
      counts.get(passage.id) !== 1
    ) {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    let url: URL;
    let originalUrl: URL;
    try {
      url = new URL(passage.url);
      originalUrl = new URL(passage.originalUrl);
    } catch {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    if (
      !safeId.test(passage.sourceId) ||
      privateValue.test(passage.sourceId) ||
      !passage.version ||
      passage.version.length > 150 ||
      privateValue.test(passage.version) ||
      !publicUrl(url) ||
      !publicUrl(originalUrl) ||
      !compatibleJurisdiction(passage.jurisdiction, seed.jurisdiction)
    ) {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    if (
      promptInstruction.test(passage.quote) ||
      privateValue.test(passage.quote) ||
      passage.quote.length > 500 ||
      passage.content.length > 5_000_000 ||
      privateValue.test(passage.content)
    ) {
      note('unsafe-material', [passage.id]);
      continue;
    }
    let approval: DocumentApproval;
    try {
      approval = await approve(passage, seed);
    } catch {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    if (approval.status !== 'approved') {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    if (
      !approval.attribution.trim() ||
      (approval.sourceUpdatedAt &&
        (!validDate(approval.sourceUpdatedAt) || approval.sourceUpdatedAt > seed.consultedAt)) ||
      !validDate(approval.applicableFrom) ||
      (approval.applicableUntil &&
        (!validDate(approval.applicableUntil) ||
          approval.applicableUntil < approval.applicableFrom))
    ) {
      note('source-unconfirmed', [passage.id]);
      continue;
    }
    if (!quoteSupported(passage.content, passage.quote)) {
      note('quote-unmatched', [passage.id]);
      continue;
    }
    report.sources.push({
      id: passage.id,
      originalUrl: passage.originalUrl,
      version: passage.version,
    });
    eligible.set(passage.id, { passage, approval });
  }

  const byTopic = new Map<string, PublicPassage<Receipt>[]>();
  for (const { passage } of eligible.values())
    byTopic.set(passage.topic, [...(byTopic.get(passage.topic) ?? []), passage]);
  for (const group of byTopic.values()) {
    let verdict: 'equivalent' | 'conflict' | 'unknown' = 'equivalent';
    for (let i = 0; i < group.length; i++)
      for (let j = i + 1; j < group.length; j++) {
        const left = group[i]!;
        const right = group[j]!;
        if (
          left.language === right.language &&
          evidenceText(left.quote) === evidenceText(right.quote)
        )
          continue;
        try {
          const compared = await compare({
            topic: left.topic,
            left: { id: left.id, quote: left.quote, language: left.language },
            right: { id: right.id, quote: right.quote, language: right.language },
          });
          if (compared === 'conflict') verdict = 'conflict';
          else if (compared !== 'equivalent' && verdict !== 'conflict') verdict = 'unknown';
        } catch {
          if (verdict !== 'conflict') verdict = 'unknown';
        }
      }
    if (verdict === 'equivalent') continue;
    note(
      verdict === 'conflict' ? 'conflict' : 'unresolved-comparison',
      group.map((item) => item.id),
    );
    report.discrepancies.push({
      topic: group[0]!.topic,
      passages: group.map((item) => ({
        id: item.id,
        quote: item.quote,
        originalUrl: item.originalUrl,
        version: item.version,
      })),
    });
    for (const item of group) eligible.delete(item.id);
  }
  if (!eligible.size) return { guide: null, report };

  const evidence: Guide['evidence'] = [...eligible.values()].map(({ passage, approval }) => ({
    id: passage.id,
    sourceId: passage.sourceId,
    url: passage.url,
    originalUrl: passage.originalUrl,
    version: passage.version,
    language: passage.language,
    attribution: approval.attribution,
    sourceUpdatedAt: approval.sourceUpdatedAt,
    applicableFrom: approval.applicableFrom,
    applicableUntil: approval.applicableUntil,
    informative: approval.informative,
    jurisdiction: passage.jurisdiction,
    quote: passage.quote,
  }));
  let draft: Draft;
  try {
    draft = await propose({
      domain: seed.domain,
      subtopic: seed.subtopic,
      profiles: [...seed.profiles],
      jurisdiction: seed.jurisdiction,
      passages: [...eligible.values()].map(({ passage, approval }) => ({
        id: passage.id,
        topic: passage.topic,
        quote: passage.quote,
        language: passage.language,
        version: passage.version,
        applicableFrom: approval.applicableFrom,
      })),
    });
    if (
      !draft ||
      !Array.isArray(draft.conditions) ||
      !Array.isArray(draft.exclusions) ||
      !Array.isArray(draft.claims) ||
      !Array.isArray(draft.steps) ||
      !draft.period
    )
      throw new Error('invalid draft');
  } catch {
    note('invalid-draft');
    return { guide: null, report };
  }

  try {
    let period = draft.period;
    if (
      !Array.isArray(period.evidenceIds) ||
      (period.from !== undefined && (typeof period.from !== 'string' || !validDate(period.from))) ||
      (period.until !== undefined &&
        (typeof period.until !== 'string' || !validDate(period.until))) ||
      (period.from && period.until && period.from > period.until) ||
      period.evidenceIds.some((id) => !eligible.has(id)) ||
      [period.from, period.until].some(
        (date) =>
          date &&
          !period.evidenceIds.some((id) => {
            const source = eligible.get(id);
            return (
              source?.passage.quote.includes(date) ||
              source?.approval.applicableFrom === date ||
              source?.approval.applicableUntil === date
            );
          }),
      )
    ) {
      note('unsupported-period');
      period = { evidenceIds: [] };
    }

    const supported = async <T extends Guide['conditions'][number]>(
      item: T,
      kind: StatementKind,
    ): Promise<boolean> => {
      if (
        !item ||
        typeof item !== 'object' ||
        typeof item.id !== 'string' ||
        !safeId.test(item.id) ||
        privateValue.test(item.id) ||
        !Array.isArray(item.evidenceIds) ||
        item.evidenceIds.length !== 1 ||
        Object.keys(item).some(
          (key) =>
            ![
              'id',
              'text',
              'evidenceIds',
              'translation',
              ...(kind === 'step'
                ? ['dependsOn']
                : kind === 'fact' || kind === 'obligation'
                  ? ['kind', 'conditionIds']
                  : []),
            ].includes(key),
        )
      ) {
        note('unsupported-statement', typeof item?.id === 'string' ? [item.id] : []);
        return false;
      }
      const approved = eligible.get(item.evidenceIds[0]!);
      const source = approved?.passage;
      if (!source || !approved) {
        note('unsupported-statement', [item.id]);
        return false;
      }
      const from = source.language;
      const to = from === 'es' ? 'ca' : 'es';
      if (
        !approved.approval.kinds.includes(kind) ||
        !period.from ||
        period.from < approved.approval.applicableFrom ||
        (approved.approval.applicableUntil &&
          (!period.until || period.until > approved.approval.applicableUntil)) ||
        !item.text ||
        typeof item.text !== 'object' ||
        Object.keys(item.text).some((key) => key !== 'ca' && key !== 'es') ||
        typeof item.text.ca !== 'string' ||
        typeof item.text.es !== 'string' ||
        !item.text.ca.trim() ||
        !item.text.es.trim() ||
        item.translation !== to ||
        evidenceText(item.text[from]) !== evidenceText(source.quote) ||
        [
          ...item.text.ca.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g),
          ...item.text.es.matchAll(/\b\d{4}-\d{2}-\d{2}\b/g),
        ].some(
          ([date]) =>
            !source.quote.includes(date) &&
            date !== approved.approval.applicableFrom &&
            date !== approved.approval.applicableUntil,
        ) ||
        promptInstruction.test(item.text[to]) ||
        privateValue.test(item.text[to])
      ) {
        note('unsupported-statement', [item.id]);
        return false;
      }
      try {
        if (
          await verifyTranslation({
            original: source.quote,
            translation: item.text[to],
            from,
            to,
          })
        )
          return true;
      } catch {
        // A verifier failure cannot promote a translation.
      }
      note('translation-unverified', [item.id]);
      return false;
    };
    const seenStatementIds = new Set<string>();
    const keep = async <T extends Guide['conditions'][number]>(
      items: T[],
      kind: StatementKind,
    ): Promise<T[]> => {
      const result: T[] = [];
      for (const item of items) {
        if (!(await supported(item, kind))) continue;
        if (seenStatementIds.has(item.id)) note('unsupported-statement', [item.id]);
        else {
          seenStatementIds.add(item.id);
          result.push(item);
        }
      }
      return result;
    };
    const conditions = await keep(draft.conditions, 'condition');
    const exclusions = await keep(draft.exclusions, 'exclusion');
    const validConditions = new Set(conditions.map((item) => item.id));
    const claims: Guide['claims'] = [];
    for (const item of draft.claims) {
      if (
        !item ||
        typeof item !== 'object' ||
        !Array.isArray(item.conditionIds) ||
        (item.kind !== 'fact' && item.kind !== 'obligation') ||
        (item.kind === 'obligation' && item.conditionIds.length === 0)
      ) {
        note('unsupported-statement', typeof item?.id === 'string' ? [item.id] : []);
        continue;
      }
      if (!(await supported(item, item.kind))) continue;
      const valid = item.conditionIds.every((id) => validConditions.has(id));
      if (!valid || seenStatementIds.has(item.id)) note('unsupported-statement', [item.id]);
      else {
        seenStatementIds.add(item.id);
        claims.push(item);
      }
    }
    const steps: Guide['steps'] = [];
    for (const item of draft.steps) {
      if (!(await supported(item, 'step'))) continue;
      if (
        seenStatementIds.has(item.id) ||
        !Array.isArray(item.dependsOn) ||
        !item.dependsOn.every((id) => steps.some((step) => step.id === id))
      ) {
        note('unsupported-statement', [item.id]);
        continue;
      }
      seenStatementIds.add(item.id);
      steps.push(item);
    }
    const used = new Set(
      [...conditions, ...exclusions, ...claims, ...steps].flatMap((item) => item.evidenceIds),
    );
    for (const id of eligible.keys())
      if (!used.has(id) && !period.evidenceIds.includes(id)) note('omitted-source', [id]);

    const parsed = guideSchema.safeParse({
      ...seed,
      period,
      validation: { status: 'pending' },
      evidence: evidence.filter(
        (item) => used.has(item.id) || period.evidenceIds.includes(item.id),
      ),
      conditions,
      exclusions,
      claims,
      steps,
    });
    if (!parsed.success) {
      note('invalid-draft');
      return { guide: null, report };
    }
    report.guideDigest = await digestPendingGuide(parsed.data);
    report.retainedStepIds = steps.map((item) => item.id);
    return { guide: parsed.data, report };
  } catch {
    note('invalid-draft');
    return { guide: null, report };
  }
}
