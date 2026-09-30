import { normalizePageUrl, sha256Hex } from '@reforma-digital/capture';

const NOTICE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 200;

type NoticeMap = Record<string, number>;

async function pathKey(url: string): Promise<string> {
  return sha256Hex(normalizePageUrl(url));
}

async function readMap(key: 'reportNotices' | 'reportSent'): Promise<NoticeMap> {
  try {
    const saved = await chrome.storage.local.get(key);
    const value = saved[key];
    if (!value || typeof value !== 'object') return {};
    return value as NoticeMap;
  } catch {
    return {};
  }
}

async function writeMap(key: 'reportNotices' | 'reportSent', map: NoticeMap): Promise<void> {
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const trimmed = Object.fromEntries(entries.slice(0, MAX_ENTRIES));
  await chrome.storage.local.set({ [key]: trimmed });
}

/** True if a notice for this URL may be shown (not dismissed within TTL). */
export async function shouldShowReportNotice(url: string): Promise<boolean> {
  try {
    const prefs = await chrome.storage.local.get('reportNoticesDisabled');
    if (prefs.reportNoticesDisabled === true) return false;
    const map = await readMap('reportNotices');
    const key = await pathKey(url);
    const at = map[key];
    if (at && Date.now() - at < NOTICE_TTL_MS) return false;
    return true;
  } catch {
    return false;
  }
}

export async function markReportNoticeShown(url: string): Promise<void> {
  const map = await readMap('reportNotices');
  map[await pathKey(url)] = Date.now();
  await writeMap('reportNotices', map);
}

export async function markReportSent(url: string): Promise<void> {
  const map = await readMap('reportSent');
  map[await pathKey(url)] = Date.now();
  await writeMap('reportSent', map);
}

export async function wasReportSent(url: string): Promise<boolean> {
  const map = await readMap('reportSent');
  return Boolean(map[await pathKey(url)]);
}

/** Pending inbox entries shipped with the extension build (no network). */
export type PendingEntry = { siteId: string; url: string; fingerprint: string };

export function isPending(
  pending: readonly PendingEntry[],
  siteId: string,
  url: string,
  fingerprint?: string,
): boolean {
  const normalized = normalizePageUrl(url);
  return pending.some(
    (entry) =>
      entry.siteId === siteId &&
      entry.url === normalized &&
      (fingerprint === undefined || entry.fingerprint === fingerprint),
  );
}
