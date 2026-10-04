import { guideSchema, type Guide } from '@reforma-digital/core';

const base = 'https://raw.githubusercontent.com/samuelcorsan/reforma-digital/main/catalogue/';
const sha256Pattern = /^[a-f0-9]{64}$/;
const idPattern = /^[a-z][a-z0-9-]{0,63}$/;
const maxBytes = 5_000_000;

type FlowStatus = { id: string; version: string; status: 'available' | 'retired' };
export type PublicRelease = {
  schemaVersion: 1;
  revision: number;
  publishedAt: string;
  validUntil: string;
  guides: Guide[];
  retiredGuides: string[];
  flows: FlowStatus[];
};
export type StoredRelease = { body: string; sha256: string; checkedAt: string | null };
export type PublicCatalogue = {
  revision: number | null;
  publishedAt: string | null;
  fresh: boolean;
  guides: { guide: Guide; current: boolean }[];
  flows: { id: string; version: string; status: 'available' | 'retired' | 'unknown' }[];
};

function record(value: unknown, keys: string[]): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => keys.includes(key))
  );
}
function date(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}
function id(value: unknown): value is string {
  return typeof value === 'string' && idPattern.test(value);
}
function sha256(value: unknown): value is string {
  return typeof value === 'string' && sha256Pattern.test(value);
}
async function digest(body: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Public JSON only. Flow maps are deliberately absent: a release cannot add browser actions. */
export function parsePublicRelease(raw: unknown): PublicRelease {
  if (
    !record(raw, [
      'schemaVersion',
      'revision',
      'publishedAt',
      'validUntil',
      'guides',
      'retiredGuides',
      'flows',
    ]) ||
    raw.schemaVersion !== 1 ||
    !Number.isSafeInteger(raw.revision) ||
    Number(raw.revision) < 1 ||
    !date(raw.publishedAt) ||
    !date(raw.validUntil) ||
    raw.publishedAt > raw.validUntil ||
    !Array.isArray(raw.guides) ||
    !Array.isArray(raw.retiredGuides) ||
    !Array.isArray(raw.flows)
  )
    throw new Error('Invalid public release');
  const publishedAt = raw.publishedAt;
  const retiredGuides = raw.retiredGuides;
  const guides = raw.guides.map((value: unknown) => guideSchema.parse(value));
  if (
    guides.some(
      (guide) =>
        guide.validation.status !== 'verified' ||
        guide.validation.checkedAt > publishedAt ||
        (guide.period.until && guide.period.until < publishedAt),
    ) ||
    new Set(guides.map((guide) => guide.id)).size !== guides.length ||
    retiredGuides.some((value: unknown) => !id(value)) ||
    new Set(retiredGuides).size !== retiredGuides.length ||
    guides.some((guide) => retiredGuides.includes(guide.id))
  )
    throw new Error('Invalid guide publication');
  const flows = raw.flows.map((value: unknown) => {
    if (
      !record(value, ['id', 'version', 'status']) ||
      !id(value.id) ||
      typeof value.version !== 'string' ||
      !/^\d+\.\d+\.\d+$/.test(value.version) ||
      !['available', 'retired'].includes(String(value.status))
    )
      throw new Error('Invalid flow status');
    return value as FlowStatus;
  });
  if (new Set(flows.map((flow) => flow.id)).size !== flows.length)
    throw new Error('Duplicate flow status');
  return {
    schemaVersion: 1,
    revision: Number(raw.revision),
    publishedAt,
    validUntil: raw.validUntil,
    guides,
    retiredGuides,
    flows,
  };
}

function coherent(previous: PublicRelease, next: PublicRelease): boolean {
  if (next.revision < previous.revision || next.publishedAt < previous.publishedAt) return false;
  const nextGuides = new Map(next.guides.map((guide) => [guide.id, guide]));
  const nextFlows = new Map(next.flows.map((flow) => [flow.id, flow]));
  return (
    previous.retiredGuides.every((id) => next.retiredGuides.includes(id)) &&
    previous.guides.every((guide) => {
      const updated = nextGuides.get(guide.id);
      return updated
        ? updated.revision > guide.revision ||
            (updated.revision === guide.revision &&
              JSON.stringify(updated) === JSON.stringify(guide))
        : next.retiredGuides.includes(guide.id);
    }) &&
    previous.flows.every((flow) => {
      const updated = nextFlows.get(flow.id);
      return (
        updated &&
        (flow.status !== 'retired' ||
          updated.status === 'retired' ||
          updated.version !== flow.version)
      );
    })
  );
}

async function readStored(
  value: unknown,
): Promise<{ stored: StoredRelease; release: PublicRelease } | null> {
  if (
    !record(value, ['body', 'sha256', 'checkedAt']) ||
    typeof value.body !== 'string' ||
    value.body.length > maxBytes ||
    !sha256(value.sha256) ||
    (value.checkedAt !== null && !date(value.checkedAt)) ||
    (await digest(value.body)) !== value.sha256
  )
    return null;
  try {
    return {
      stored: { body: value.body, sha256: value.sha256, checkedAt: value.checkedAt },
      release: parsePublicRelease(JSON.parse(value.body)),
    };
  } catch {
    return null;
  }
}

function view(
  release: PublicRelease | null,
  asOf: string,
  downloaded: boolean,
  packagedFlows: readonly { id: string; version: string }[],
): PublicCatalogue {
  const fresh =
    !!release && downloaded && release.publishedAt <= asOf && asOf <= release.validUntil;
  return {
    revision: release?.revision ?? null,
    publishedAt: release?.publishedAt ?? null,
    fresh,
    guides: (release?.guides ?? []).map((guide) => ({
      guide,
      current:
        fresh &&
        (!guide.period.from || guide.period.from <= asOf) &&
        (!guide.period.until || asOf <= guide.period.until),
    })),
    flows: (release?.flows ?? []).map((flow) => ({
      ...flow,
      status:
        flow.status === 'retired'
          ? 'retired'
          : fresh &&
              packagedFlows.some((item) => item.id === flow.id && item.version === flow.version)
            ? 'available'
            : 'unknown',
    })),
  };
}

/** The two fixed public GETs never receive a query, profile, portal header, credential or body. */
export async function refreshPublicRelease(
  previous: unknown,
  asOf: string,
  packagedFlows: readonly { id: string; version: string }[] = [],
): Promise<{ stored: StoredRelease | null; catalogue: PublicCatalogue }> {
  if (!date(asOf)) throw new RangeError('Invalid catalogue date');
  const old = await readStored(previous);
  try {
    const get = async (url: string): Promise<string> => {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'omit',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Catalogue download failed');
      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > maxBytes) throw new Error('Catalogue too large');
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    };
    const pointer: unknown = JSON.parse(await get(`${base}latest.json`));
    if (
      !record(pointer, ['schemaVersion', 'revision', 'sha256']) ||
      pointer.schemaVersion !== 1 ||
      !Number.isSafeInteger(pointer.revision) ||
      Number(pointer.revision) < 1 ||
      !sha256(pointer.sha256)
    )
      throw new Error('Invalid catalogue pointer');
    if (old && Number(pointer.revision) < old.release.revision)
      throw new Error('Catalogue rollback');
    const body = await get(`${base}releases/${pointer.revision}.json`);
    if ((await digest(body)) !== pointer.sha256) throw new Error('Catalogue digest mismatch');
    const release = parsePublicRelease(JSON.parse(body));
    if (
      release.revision !== pointer.revision ||
      release.publishedAt > asOf ||
      (old &&
        (!coherent(old.release, release) ||
          (release.revision === old.release.revision && pointer.sha256 !== old.stored.sha256)))
    )
      throw new Error('Invalid catalogue transition');
    const stored = { body, sha256: pointer.sha256, checkedAt: asOf };
    return { stored, catalogue: view(release, asOf, true, packagedFlows) };
  } catch {
    return {
      stored: old ? { ...old.stored, checkedAt: null } : null,
      catalogue: view(old?.release ?? null, asOf, false, packagedFlows),
    };
  }
}

export async function readPublicRelease(
  stored: unknown,
  asOf: string,
  packagedFlows: readonly { id: string; version: string }[] = [],
): Promise<PublicCatalogue> {
  if (!date(asOf)) throw new RangeError('Invalid catalogue date');
  const cached = await readStored(stored);
  return view(cached?.release ?? null, asOf, cached?.stored.checkedAt === asOf, packagedFlows);
}
