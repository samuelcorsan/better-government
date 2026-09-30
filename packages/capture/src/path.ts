const ID_SEGMENT =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|[0-9a-f]{8,}|[XYZ]\d{7}[A-Z]|\d{8}[A-Z]|\d{4,})$/i;

/**
 * Origin + pathname only. Segments that look like identifiers become `:id`.
 * Query and hash are always dropped.
 */
export function normalizePageUrl(input: URL | string): string {
  const url = typeof input === 'string' ? new URL(input) : new URL(input.href);
  const segments = url.pathname.split('/').map((segment) => {
    if (!segment) return segment;
    try {
      const decoded = decodeURIComponent(segment);
      return ID_SEGMENT.test(decoded) ? ':id' : segment;
    } catch {
      return ID_SEGMENT.test(segment) ? ':id' : segment;
    }
  });
  const pathname = segments.join('/') || '/';
  return `${url.origin}${pathname}`;
}

/** Safe path components for inbox folders (no `..`, no separators). */
export function safeInboxParts(
  siteId: string,
  fingerprint: string,
): { siteId: string; fingerprint: string } | null {
  if (!/^[a-z][a-z0-9-]*$/.test(siteId)) return null;
  if (!/^[a-f0-9]{64}$/.test(fingerprint)) return null;
  return { siteId, fingerprint };
}
