/** Schema version of a page report produced by the extension. */
export const REPORT_SCHEMA = 'bg-report-v1' as const;

export type ReportReason = 'unsupported' | 'mismatch';

export type RedactionKind =
  | 'nie'
  | 'nif'
  | 'cif'
  | 'iban'
  | 'phone'
  | 'email'
  | 'card'
  | 'date'
  | 'digits'
  | 'token'
  | 'session'
  | 'script'
  | 'non_latin'
  | 'form_value'
  | 'hidden'
  | 'media'
  | 'attribute'
  | 'url'
  | 'manual';

export type RedactionCounts = Partial<Record<RedactionKind, number>>;

export interface PageSnapshot {
  schema: typeof REPORT_SCHEMA;
  siteId: string;
  /** Origin + normalized pathname only (no query or hash). */
  url: string;
  /** SHA-256 hex of the structural skeleton (tags + control ids/names/types). */
  fingerprint: string;
  reason: ReportReason;
  extensionVersion: string;
  html: string;
  css: string;
  /** Stylesheets that could not be read (cross-origin CSSOM). */
  cssUnavailable: string[];
  counts: RedactionCounts;
}

export interface CaptureOptions {
  siteId: string;
  reason: ReportReason;
  extensionVersion: string;
  /** Page URL; query and hash are stripped. */
  url: URL | string;
  /** Max cleaned HTML size in bytes. */
  maxHtmlBytes?: number;
  /** Max CSS size in bytes. */
  maxCssBytes?: number;
}

export interface CaptureResult {
  ok: true;
  snapshot: PageSnapshot;
}

export interface CaptureFailure {
  ok: false;
  error: string;
}
