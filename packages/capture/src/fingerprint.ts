/** Structural skeleton used for deduplication (no text content). */
export function structuralSkeleton(document: Document): string {
  const parts: string[] = [];
  const walk = (node: Element) => {
    if (node.closest?.('[data-bg-notice],[data-bg-host],[data-bg-shell]')) return;
    const tag = node.tagName.toLowerCase();
    const id = node.getAttribute('id') ?? '';
    const name = node.getAttribute('name') ?? '';
    const type = node.getAttribute('type') ?? '';
    const htmlFor = node.getAttribute('for') ?? '';
    if (
      tag === 'input' ||
      tag === 'select' ||
      tag === 'textarea' ||
      tag === 'button' ||
      tag === 'form' ||
      tag === 'label' ||
      id ||
      name
    ) {
      parts.push(`${tag}#${id}|${name}|${type}|${htmlFor}`);
    }
    for (const child of node.children) walk(child);
  };
  if (document.documentElement) walk(document.documentElement);
  return parts.join('\n');
}

/** SHA-256 hex via Web Crypto (available in browsers and Node 22+). */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function fingerprintDocument(document: Document): Promise<string> {
  return sha256Hex(structuralSkeleton(document));
}
