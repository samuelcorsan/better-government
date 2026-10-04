import { guideSchema, type Guide } from '@reforma-digital/core';
import { compareLegalSnapshots, type LegalAcquisition, type LegalSnapshot } from './legal-versions';

type Identity = { evidenceId: string; version: string; originalUrl: string; checkedAt: string };
/** Inputs come from a trusted public-source monitor, never from a portal session or a user query. */
export type EvidenceCheck = Identity &
  (
    | { kind: 'legal'; previous: LegalSnapshot; current: LegalAcquisition }
    | { kind: 'content'; previousDigest: string; currentDigest: string }
    | { kind: 'removed'; proof: 'official-catalogue'; proofUrl: string }
    | { kind: 'unavailable'; reason: 'timeout' | 'http' | 'parser' | 'version' }
  );
export type InvalidationReport = {
  guideId: string;
  jurisdiction: string;
  status: 'unchanged' | 'revised' | 'withdrawn';
  previousRevision: number;
  nextRevision: number;
  invalidEvidenceIds: string[];
  invalidStatementIds: string[];
  invalidStepIds: string[];
  uncertainEvidenceIds: string[];
};

const digest = /^[a-f0-9]{64}$/;
function validDate(value: string): boolean {
  const time = Date.parse(value);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(time) &&
    new Date(time).toISOString().slice(0, 10) === value
  );
}
function publicUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !url.hash;
  } catch {
    return false;
  }
}
function changed(check: EvidenceCheck): 'changed' | 'uncertain' | 'unchanged' {
  if (check.kind === 'unavailable') return 'uncertain';
  if (check.kind === 'removed')
    return check.proof === 'official-catalogue' && publicUrl(check.proofUrl)
      ? 'changed'
      : 'uncertain';
  if (check.kind === 'content')
    return digest.test(check.previousDigest) && digest.test(check.currentDigest)
      ? check.previousDigest === check.currentDigest
        ? 'unchanged'
        : 'changed'
      : 'uncertain';
  if (!check.current.ok) return 'uncertain';
  if (
    check.previous.originalUrl !== check.originalUrl ||
    check.current.snapshot.originalUrl !== check.originalUrl
  )
    return 'uncertain';
  const comparison = compareLegalSnapshots(check.previous, check.current.snapshot);
  if (comparison === 'stale' || comparison === 'unverifiable') return 'uncertain';
  if (check.current.snapshot.reportedStatus !== 'in_force') return 'changed';
  if (
    comparison === 'metadata' &&
    (!check.previous.materialDigest || !check.current.snapshot.materialDigest)
  )
    return 'uncertain';
  if (comparison === 'material') return 'changed';
  return 'unchanged';
}

function reviseGuide(
  guide: Guide,
  checks: EvidenceCheck[],
  asOf: string,
): {
  guide: Guide | null;
  report: InvalidationReport;
} {
  const invalid = new Set<string>();
  const uncertain = new Set<string>();
  const evidence = new Map(guide.evidence.map((item) => [item.id, item]));
  for (const item of guide.evidence)
    if (item.applicableUntil && item.applicableUntil < asOf) invalid.add(item.id);
  if (guide.period.until && guide.period.until < asOf)
    for (const item of guide.evidence) invalid.add(item.id);
  for (const check of checks) {
    const source = evidence.get(check.evidenceId);
    if (
      !source ||
      source.version !== check.version ||
      source.originalUrl !== check.originalUrl ||
      !validDate(check.checkedAt) ||
      check.checkedAt > asOf
    )
      continue;
    const result = changed(check);
    if (result === 'changed') invalid.add(check.evidenceId);
    if (result === 'uncertain') uncertain.add(check.evidenceId);
  }
  const report: InvalidationReport = {
    guideId: guide.id,
    jurisdiction: guide.jurisdiction,
    status: 'unchanged',
    previousRevision: guide.revision,
    nextRevision: guide.revision,
    invalidEvidenceIds: [...invalid].sort(),
    invalidStatementIds: [],
    invalidStepIds: [],
    uncertainEvidenceIds: [...uncertain].sort(),
  };
  if (!invalid.size) return { guide, report };

  const backed = (item: { evidenceIds: string[] }) =>
    item.evidenceIds.every((id) => !invalid.has(id));
  const conditions = guide.conditions.filter(backed);
  const exclusions = guide.exclusions.filter(backed);
  const conditionIds = new Set(conditions.map((item) => item.id));
  const claims = guide.claims.filter(
    (item) => backed(item) && item.conditionIds.every((id) => conditionIds.has(id)),
  );
  const steps: Guide['steps'] = [];
  const keptSteps = new Set<string>();
  for (const step of guide.steps) {
    if (!backed(step) || !step.dependsOn.every((id) => keptSteps.has(id))) continue;
    steps.push(step);
    keptSteps.add(step.id);
  }
  report.invalidStatementIds = [
    ...guide.conditions.filter((item) => !conditions.includes(item)),
    ...guide.exclusions.filter((item) => !exclusions.includes(item)),
    ...guide.claims.filter((item) => !claims.includes(item)),
  ]
    .map((item) => item.id)
    .sort();
  report.invalidStepIds = guide.steps
    .filter((item) => !keptSteps.has(item.id))
    .map((item) => item.id)
    .sort();
  report.nextRevision++;
  const keptEvidence = guide.evidence.filter((item) => !invalid.has(item.id));
  const periodEvidence = guide.period.evidenceIds.filter((id) => !invalid.has(id));
  const supportsDate = (date: string) =>
    periodEvidence.some((id) => {
      const item = evidence.get(id);
      return (
        item?.quote.includes(date) ||
        item?.applicableFrom === date ||
        item?.applicableUntil === date
      );
    });
  const period = [guide.period.from, guide.period.until].every(
    (date) => !date || supportsDate(date),
  )
    ? { ...guide.period, evidenceIds: periodEvidence }
    : { evidenceIds: [] };
  const parsed = guideSchema.safeParse({
    ...guide,
    revision: report.nextRevision,
    validation: { status: 'pending' },
    evidence: keptEvidence,
    period,
    conditions,
    exclusions,
    claims,
    steps,
  });
  report.status = parsed.success ? 'revised' : 'withdrawn';
  return { guide: parsed.success ? parsed.data : null, report };
}

/** Reconciles only public guide content; a failed check cannot assert repeal or removal. */
export function reviseKnowledgeCatalog(
  guides: Guide[],
  checks: EvidenceCheck[],
  asOf: string,
): {
  guides: Guide[];
  reports: InvalidationReport[];
} {
  if (!validDate(asOf)) throw new RangeError('Fecha de revisión inválida');
  const revised = guides.map((guide) => reviseGuide(guide, checks, asOf));
  return {
    guides: revised.flatMap((item) => (item.guide ? [item.guide] : [])),
    reports: revised.map((item) => item.report),
  };
}
