import { describe, expect, it } from 'vitest';
import { processReport } from './process';
import { REPORT_SCHEMA, capturePage, type PageSnapshot } from '@reforma-digital/capture';

function baseSnapshot(over: Partial<PageSnapshot> = {}): PageSnapshot {
  return {
    schema: REPORT_SCHEMA,
    siteId: 'extranjeria',
    url: 'https://example.test/icpplus/paso',
    fingerprint: 'a'.repeat(64),
    reason: 'unsupported',
    extensionVersion: '0.1.0',
    html: '<html><head></head><body><h1>Hola</h1><form><input id="x" name="x" type="text"></form></body></html>',
    css: '',
    cssUnavailable: [],
    counts: {},
    ...over,
  };
}

describe('processReport', () => {
  it('rejects path traversal in siteId', async () => {
    const result = await processReport(baseSnapshot({ siteId: '../evil' }));
    expect(result.ok).toBe(false);
  });

  it('rejects reports that still contain forbidden remnants', async () => {
    const dirty = baseSnapshot({
      html: '<html><body><script>alert(1)</script><p>Hola</p></body></html>',
      fingerprint: 'b'.repeat(64),
    });
    const result = await processReport(dirty);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(422);
  });

  it('accepts an already-clean snapshot', async () => {
    const cleanHtml =
      '<html><head></head><body><h1>Hola</h1><form method="post"><input id="x" name="x" type="text"></form></body></html>';
    const dom = new DOMParser().parseFromString(cleanHtml, 'text/html');
    const captured = await capturePage(dom, {
      siteId: 'extranjeria',
      reason: 'unsupported',
      extensionVersion: '0.1.0',
      url: 'https://example.test/icpplus/paso',
    });
    expect(captured.ok).toBe(true);
    if (!captured.ok) return;
    const result = await processReport(captured.snapshot);
    expect(result.ok).toBe(true);
  });
});
