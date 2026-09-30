import { normalizePageUrl } from './path';
import { createRedactor, type Redactor } from './redact';
import type { RedactionCounts } from './types';

const DROP_TAGS = new Set([
  'script',
  'noscript',
  'iframe',
  'frame',
  'frameset',
  'object',
  'embed',
  'base',
  'link',
  'template',
]);

const MEDIA_TAGS = new Set(['img', 'picture', 'video', 'audio', 'source', 'track', 'canvas']);

const KEEP_ATTR = new Set([
  'id',
  'class',
  'name',
  'for',
  'type',
  'role',
  'lang',
  'dir',
  'hidden',
  'tabindex',
  'method',
  'disabled',
  'required',
  'readonly',
  'multiple',
  'min',
  'max',
  'minlength',
  'maxlength',
  'pattern',
  'size',
  'colspan',
  'rowspan',
  'rows',
  'cols',
  'wrap',
  'autocomplete',
  'enctype',
  'novalidate',
  'checked', // cleared later for inputs; kept structurally off
  'selected',
]);

const TEXT_ATTR = new Set([
  'title',
  'alt',
  'placeholder',
  'label',
  'aria-label',
  'aria-description',
]);

const URL_ATTR = new Set(['href', 'action', 'src', 'formaction']);

function mergeCounts(into: RedactionCounts, from: RedactionCounts) {
  for (const [key, value] of Object.entries(from) as [
    keyof RedactionCounts,
    number | undefined,
  ][]) {
    if (value) into[key] = (into[key] ?? 0) + value;
  }
}

function stripStyleUrls(style: string): string {
  return style.replace(/url\s*\(\s*(['"]?)[^)]*\1\s*\)/gi, 'url(about:blank)');
}

function normalizeAttrUrl(value: string, pageOrigin: string): string {
  try {
    const url = new URL(value, pageOrigin);
    if (url.protocol === 'javascript:') return '#';
    if (url.origin === new URL(pageOrigin).origin) return normalizePageUrl(url);
    return url.origin;
  } catch {
    return '#';
  }
}

function isOwnUi(el: Element): boolean {
  return Boolean(
    el.closest?.('[data-bg-notice],[data-bg-host],[data-bg-shell]') ||
    el.hasAttribute('data-bg-notice') ||
    el.hasAttribute('data-bg-host') ||
    el.hasAttribute('data-bg-shell'),
  );
}

/** Collect non-empty control values from the live document before clearing. */
export function collectFormValues(document: Document): string[] {
  const values: string[] = [];
  for (const el of document.querySelectorAll('input, textarea, select')) {
    if (isOwnUi(el)) continue;
    if (el instanceof HTMLInputElement) {
      if (el.type === 'password' || el.type === 'hidden' || el.type === 'file') continue;
      if (el.value.trim().length > 2) values.push(el.value.trim());
    } else if (el instanceof HTMLTextAreaElement) {
      if (el.value.trim().length > 2) values.push(el.value.trim());
    } else if (el instanceof HTMLSelectElement) {
      const selected = [...el.selectedOptions]
        .map((o) => o.textContent?.trim() ?? '')
        .filter((t) => t.length > 2);
      values.push(...selected);
      if (el.value.trim().length > 2) values.push(el.value.trim());
    }
  }
  for (const el of document.querySelectorAll('[contenteditable="true"],[contenteditable=""]')) {
    if (isOwnUi(el)) continue;
    const text = el.textContent?.trim() ?? '';
    if (text.length > 2) values.push(text);
  }
  return [...new Set(values)];
}

/**
 * Sanitize a cloned Document in place. Returns redaction counts from DOM structure
 * removals; text redaction is applied via `redactor` on text nodes and attributes.
 */
export function sanitizeDocument(
  document: Document,
  pageOrigin: string,
  redactor: Redactor,
): RedactionCounts {
  const counts: RedactionCounts = {};
  const bump = (kind: keyof RedactionCounts) => {
    counts[kind] = (counts[kind] ?? 0) + 1;
  };

  // Remove extension UI from the clone.
  for (const el of [
    ...document.querySelectorAll('[data-bg-notice],[data-bg-host],[data-bg-shell]'),
  ]) {
    el.remove();
  }

  const all = [...document.querySelectorAll('*')];
  for (const el of all) {
    const tag = el.tagName.toLowerCase();

    if (DROP_TAGS.has(tag)) {
      if (tag === 'link' || tag === 'meta') {
        // handled below for allowed meta
      } else {
        bump('script');
        el.remove();
        continue;
      }
    }

    if (tag === 'meta') {
      const name = (el.getAttribute('charset') || el.getAttribute('name') || '').toLowerCase();
      const httpEquiv = (el.getAttribute('http-equiv') || '').toLowerCase();
      if (el.hasAttribute('charset') || name === 'viewport') {
        // keep
      } else if (httpEquiv === 'content-type') {
        // keep
      } else {
        bump('attribute');
        el.remove();
        continue;
      }
    }

    if (tag === 'link') {
      bump('script');
      el.remove();
      continue;
    }

    if (tag === 'svg') {
      for (const bad of el.querySelectorAll('foreignObject, script, use')) {
        bump('script');
        bad.remove();
      }
    }

    if (MEDIA_TAGS.has(tag)) {
      const marker = document.createElement('div');
      marker.setAttribute('data-bg-media', tag);
      const w = el.getAttribute('width');
      const h = el.getAttribute('height');
      if (w) marker.setAttribute('data-width', w);
      if (h) marker.setAttribute('data-height', h);
      marker.textContent = `[${tag}]`;
      el.replaceWith(marker);
      bump('media');
      continue;
    }

    if (tag === 'input' && (el as HTMLInputElement).type === 'hidden') {
      bump('hidden');
      el.remove();
      continue;
    }

    // Strip attributes not on the allowlist.
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (name.startsWith('on') || value.trim().toLowerCase().startsWith('javascript:')) {
        bump('attribute');
        el.removeAttribute(attr.name);
        continue;
      }

      if (name.startsWith('aria-')) {
        if (
          TEXT_ATTR.has(name) ||
          name === 'aria-label' ||
          name === 'aria-description' ||
          name === 'aria-placeholder'
        ) {
          el.setAttribute(attr.name, redactor.apply(value));
        } else if (
          name === 'aria-hidden' ||
          name === 'aria-disabled' ||
          name === 'aria-required' ||
          name === 'aria-invalid' ||
          name === 'aria-expanded' ||
          name === 'aria-checked' ||
          name === 'aria-selected' ||
          name === 'aria-current' ||
          name === 'aria-live' ||
          name === 'aria-atomic' ||
          name === 'aria-relevant' ||
          name === 'aria-controls' ||
          name === 'aria-labelledby' ||
          name === 'aria-describedby' ||
          name === 'aria-owns' ||
          name === 'aria-haspopup' ||
          name === 'aria-autocomplete' ||
          name === 'aria-busy'
        ) {
          // structural aria — keep as-is
        } else {
          bump('attribute');
          el.removeAttribute(attr.name);
        }
        continue;
      }

      if (name === 'style') {
        el.setAttribute('style', stripStyleUrls(value));
        continue;
      }

      if (URL_ATTR.has(name)) {
        el.setAttribute(attr.name, normalizeAttrUrl(value, pageOrigin));
        bump('url');
        continue;
      }

      if (TEXT_ATTR.has(name) || (name === 'value' && tag === 'button')) {
        el.setAttribute(attr.name, redactor.apply(value));
        continue;
      }

      if (
        KEEP_ATTR.has(name) ||
        name === 'charset' ||
        name === 'content' ||
        name === 'http-equiv' ||
        name === 'name'
      ) {
        if (tag === 'meta' && name === 'content') {
          el.setAttribute(attr.name, redactor.apply(value));
        }
        continue;
      }

      // data-* and everything else
      bump('attribute');
      el.removeAttribute(attr.name);
    }

    // Clear form state.
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox' || el.type === 'radio') {
        el.removeAttribute('checked');
        el.checked = false;
      } else if (
        el.type !== 'submit' &&
        el.type !== 'button' &&
        el.type !== 'reset' &&
        el.type !== 'image'
      ) {
        el.value = '';
        el.removeAttribute('value');
      }
    } else if (el instanceof HTMLTextAreaElement) {
      el.value = '';
      el.textContent = '';
    } else if (el instanceof HTMLSelectElement) {
      for (const opt of el.options) {
        opt.removeAttribute('selected');
        opt.selected = false;
        if (opt.textContent) opt.textContent = redactor.apply(opt.textContent);
      }
    }

    if (el.hasAttribute('contenteditable')) {
      el.textContent = '';
      el.removeAttribute('contenteditable');
    }
  }

  // Redact text nodes.
  const walker = document.createTreeWalker(
    document.documentElement ?? document,
    NodeFilter.SHOW_TEXT,
  );
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
  for (const node of textNodes) {
    const parent = node.parentElement;
    if (!parent || parent.tagName === 'STYLE' || parent.tagName === 'SCRIPT') continue;
    const next = redactor.apply(node.nodeValue ?? '');
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  // Style tags: redact urls and tokens inside.
  for (const style of document.querySelectorAll('style')) {
    style.textContent = sanitizeCssText(style.textContent ?? '', redactor);
  }

  mergeCounts(counts, redactor.counts());
  return counts;
}

export function sanitizeCssText(css: string, redactor: Redactor): string {
  let out = css.replace(/@import\s+[^;]+;?/gi, '/* import removed */');
  out = out.replace(/url\s*\(\s*(['"]?)[^)]*\1\s*\)/gi, 'url(about:blank)');
  return redactor.apply(out);
}

/** Read same-origin stylesheets from the live document (not the clone). */
export function collectCss(
  document: Document,
  redactor: Redactor,
  maxBytes: number,
): { css: string; unavailable: string[] } {
  const parts: string[] = [];
  const unavailable: string[] = [];
  let size = 0;
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      const text = Array.from(rules, (r) => r.cssText).join('\n');
      const cleaned = sanitizeCssText(text, redactor);
      size += cleaned.length;
      if (size > maxBytes) break;
      parts.push(cleaned);
    } catch {
      unavailable.push(sheet.href ?? '(inline)');
    }
  }
  return { css: parts.join('\n\n'), unavailable };
}

export function createDocumentRedactor(formValues: readonly string[]): Redactor {
  const redactor = createRedactor();
  redactor.scrubValues(formValues);
  return redactor;
}
