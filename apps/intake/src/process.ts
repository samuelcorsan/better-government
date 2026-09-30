import {
  isPageSnapshot,
  normalizePageUrl,
  recaptureHtml,
  safeInboxParts,
  type PageSnapshot,
} from '@reforma-digital/capture';

/** Validate, re-sanitize, and prepare the inbox payload. Pure — no GitHub side effects. */
export async function processReport(
  raw: unknown,
): Promise<
  | { ok: true; snapshot: PageSnapshot; parts: { siteId: string; fingerprint: string } }
  | { ok: false; error: string; status: number }
> {
  if (!isPageSnapshot(raw)) return { ok: false, error: 'Invalid report schema', status: 400 };
  const parts = safeInboxParts(raw.siteId, raw.fingerprint);
  if (!parts) return { ok: false, error: 'Invalid siteId or fingerprint', status: 400 };

  const expectedUrl = normalizePageUrl(raw.url);
  if (expectedUrl !== raw.url) return { ok: false, error: 'URL is not normalized', status: 400 };

  const again = await recaptureHtml(raw.html, {
    siteId: raw.siteId,
    url: raw.url,
    reason: raw.reason,
    extensionVersion: raw.extensionVersion,
  });
  if (!again.ok) return { ok: false, error: again.error, status: 400 };

  // Parser serialization can reshuffle markup; we store the re-sanitized HTML and
  // refuse anything that still looks like active code or session material.
  if (hasForbiddenRemnants(again.html) || hasForbiddenRemnants(raw.html)) {
    return {
      ok: false,
      error: 'Report still contains forbidden remnants after re-sanitization',
      status: 422,
    };
  }

  // A third pass on the cleaned HTML must be stable.
  const stable = await recaptureHtml(again.html, {
    siteId: raw.siteId,
    url: raw.url,
    reason: raw.reason,
    extensionVersion: raw.extensionVersion,
  });
  if (!stable.ok) return { ok: false, error: stable.error, status: 400 };
  if (!stable.identical) {
    return { ok: false, error: 'Sanitizer is not stable on this payload', status: 422 };
  }

  if (again.fingerprint !== raw.fingerprint) {
    return {
      ok: false,
      error: 'Fingerprint does not match re-computed skeleton',
      status: 422,
    };
  }

  const snapshot: PageSnapshot = {
    ...raw,
    html: again.html,
    fingerprint: again.fingerprint,
  };
  return { ok: true, snapshot, parts };
}

function hasForbiddenRemnants(html: string): boolean {
  const lower = html.toLowerCase();
  return (
    lower.includes('<script') ||
    lower.includes('javascript:') ||
    /on[a-z]+\s*=/i.test(html) ||
    lower.includes('jsessionid=') ||
    /type\s*=\s*["']?hidden["']?/i.test(html)
  );
}
