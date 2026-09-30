import { fingerprintDocument } from './fingerprint';
import { normalizePageUrl } from './path';
import {
  collectCss,
  collectFormValues,
  createDocumentRedactor,
  sanitizeDocument,
} from './sanitize';
import {
  REPORT_SCHEMA,
  type CaptureFailure,
  type CaptureOptions,
  type CaptureResult,
  type PageSnapshot,
} from './types';

const DEFAULT_MAX_HTML = 2 * 1024 * 1024;
const DEFAULT_MAX_CSS = 1 * 1024 * 1024;

/**
 * Capture a sanitized, redacted snapshot of `document` without mutating the live page.
 * Works in the browser (content script) and in Node (jsdom) for intake re-validation.
 */
export async function capturePage(
  document: Document,
  options: CaptureOptions,
): Promise<CaptureResult | CaptureFailure> {
  const maxHtml = options.maxHtmlBytes ?? DEFAULT_MAX_HTML;
  const maxCss = options.maxCssBytes ?? DEFAULT_MAX_CSS;
  const url = normalizePageUrl(options.url);
  let pageOrigin: string;
  try {
    pageOrigin = new URL(url).origin;
  } catch {
    return { ok: false, error: 'Invalid page URL' };
  }

  const formValues = collectFormValues(document);
  const redactor = createDocumentRedactor(formValues);

  const clone = document.cloneNode(true) as Document;
  // Some environments clone without a browsing context; ensure documentElement exists.
  if (!clone.documentElement) {
    return { ok: false, error: 'Could not clone the document' };
  }

  const counts = sanitizeDocument(clone, pageOrigin, redactor);
  const { css, unavailable } = collectCss(document, createDocumentRedactor(formValues), maxCss);

  const html = clone.documentElement.outerHTML;
  if (html.length > maxHtml) {
    return { ok: false, error: `Cleaned HTML exceeds ${maxHtml} bytes` };
  }

  const fingerprint = await fingerprintDocument(clone);

  const snapshot: PageSnapshot = {
    schema: REPORT_SCHEMA,
    siteId: options.siteId,
    url,
    fingerprint,
    reason: options.reason,
    extensionVersion: options.extensionVersion,
    html,
    css,
    cssUnavailable: unavailable,
    counts,
  };

  return { ok: true, snapshot };
}

/**
 * Re-run sanitization on an HTML string (intake / CI). Returns the cleaned HTML
 * and whether it matches the input (byte-identical after a second pass means the
 * payload was already fully sanitized).
 */
export async function recaptureHtml(
  html: string,
  options: Omit<CaptureOptions, 'reason' | 'extensionVersion'> & {
    reason?: CaptureOptions['reason'];
    extensionVersion?: string;
  },
): Promise<{ ok: true; html: string; fingerprint: string; identical: boolean } | CaptureFailure> {
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const opts: CaptureOptions = {
    siteId: options.siteId,
    url: options.url,
    reason: options.reason ?? 'unsupported',
    extensionVersion: options.extensionVersion ?? '0',
  };
  if (options.maxHtmlBytes !== undefined) opts.maxHtmlBytes = options.maxHtmlBytes;
  if (options.maxCssBytes !== undefined) opts.maxCssBytes = options.maxCssBytes;
  const result = await capturePage(dom, opts);
  if (!result.ok) return result;
  return {
    ok: true,
    html: result.snapshot.html,
    fingerprint: result.snapshot.fingerprint,
    identical: result.snapshot.html === html,
  };
}

export function isPageSnapshot(value: unknown): value is PageSnapshot {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    v.schema === REPORT_SCHEMA &&
    typeof v.siteId === 'string' &&
    typeof v.url === 'string' &&
    typeof v.fingerprint === 'string' &&
    /^[a-f0-9]{64}$/.test(v.fingerprint as string) &&
    (v.reason === 'unsupported' || v.reason === 'mismatch') &&
    typeof v.extensionVersion === 'string' &&
    typeof v.html === 'string' &&
    typeof v.css === 'string' &&
    Array.isArray(v.cssUnavailable) &&
    typeof v.counts === 'object' &&
    v.counts !== null
  );
}
