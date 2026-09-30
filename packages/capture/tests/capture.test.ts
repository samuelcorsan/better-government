import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  capturePage,
  createRedactor,
  isValidCif,
  isValidIban,
  isValidNie,
  isValidNif,
  normalizePageUrl,
  safeInboxParts,
} from '../src/index';

const corpus = path.join(path.dirname(fileURLToPath(import.meta.url)), 'corpus');

/** Valid control letter for 12345678 → Z */
describe('Spanish validators', () => {
  it('accepts valid NIF/NIE/CIF/IBAN', () => {
    expect(isValidNif('12345678', 'Z')).toBe(true);
    expect(isValidNif('12345678', 'A')).toBe(false);
    expect(isValidNie('X1234567L')).toBe(true);
    expect(isValidNie('X1234567A')).toBe(false);
    expect(isValidCif('A58818501')).toBe(true);
    expect(isValidIban('ES9121000418450200051332')).toBe(true);
    expect(isValidIban('ES9121000418450200051333')).toBe(false);
  });
});

describe('normalizePageUrl', () => {
  it('strips query/hash and replaces identifier segments', () => {
    expect(normalizePageUrl('https://example.test/icpplus/detalle/12345?jsessionid=x#y')).toBe(
      'https://example.test/icpplus/detalle/:id',
    );
    expect(normalizePageUrl('https://example.test/path/X1234567L/ok')).toBe(
      'https://example.test/path/:id/ok',
    );
    expect(safeInboxParts('extranjeria', 'a'.repeat(64))).toEqual({
      siteId: 'extranjeria',
      fingerprint: 'a'.repeat(64),
    });
    expect(safeInboxParts('../x', 'a'.repeat(64))).toBeNull();
    expect(safeInboxParts('x', '../' + 'a'.repeat(61))).toBeNull();
  });
});

describe('createRedactor', () => {
  it('redacts Spanish identifiers and structural secrets', () => {
    const r = createRedactor();
    r.scrubValues(['X1234567L']);
    const out = r.apply(
      'Cita para X1234567L DNI 12345678Z mail a@b.co tel 612345678 card 4111111111111111',
    );
    expect(out).not.toMatch(/X1234567L/i);
    expect(out).not.toMatch(/12345678Z/);
    expect(out).not.toMatch(/a@b\.co/);
    expect(out).not.toMatch(/612345678/);
    expect(out).not.toMatch(/4111111111111111/);
    expect(out).toMatch(/\[FORM_VALUE_/);
    expect(out).toMatch(/\[NIF_/);
    expect(out).toMatch(/\[EMAIL_/);
  });
});

describe('capturePage corpus', () => {
  it('removes every seed secret from the cleaned snapshot', async () => {
    const html = readFileSync(path.join(corpus, 'pii-page.html'), 'utf8');
    const dom = new DOMParser().parseFromString(html, 'text/html');
    // Simulate filled controls on the live document.
    const nie = dom.querySelector<HTMLInputElement>('#nie');
    const email = dom.querySelector<HTMLInputElement>('#email');
    const notes = dom.querySelector<HTMLTextAreaElement>('textarea');
    if (nie) nie.value = 'X1234567L';
    if (email) email.value = 'ana.garcia@example.com';
    if (notes) notes.value = 'Cita para X1234567L el 01/02/2026';

    const seeds = [
      'X1234567L',
      '12345678Z',
      'ana.garcia@example.com',
      '612 345 678',
      '612345678',
      'ES91 2100 0418 4502 0005 1332',
      'ES9121000418450200051332',
      '4111 1111 1111 1111',
      '4111111111111111',
      'csrf-secret-value-9999',
      'abc123csrfsecrettoken99',
      'SESSIONTOKEN123456',
      'should-not-appear',
      'اسم',
      '中文',
      '/face.jpg',
      'data-user="secret"',
      'a1b2c3d4e5f67890',
    ];

    const result = await capturePage(dom, {
      siteId: 'extranjeria',
      reason: 'unsupported',
      extensionVersion: '0.1.0',
      url: 'https://icp.administracionelectronica.gob.es/icpplus/detalle/99999?jsessionid=x',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const blob = `${result.snapshot.html}\n${result.snapshot.css}\n${result.snapshot.url}`;
    for (const seed of seeds) {
      expect(blob.toLowerCase(), `seed still present: ${seed}`).not.toContain(seed.toLowerCase());
    }
    expect(result.snapshot.url).toBe(
      'https://icp.administracionelectronica.gob.es/icpplus/detalle/:id',
    );
    expect(result.snapshot.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(result.snapshot.html).not.toMatch(/<script/i);
    expect(result.snapshot.html).not.toMatch(/type="hidden"/i);
    expect(result.snapshot.html).toMatch(/data-bg-media="img"/);
    // Live document must remain untouched.
    expect(dom.querySelector('#nie')).toBeTruthy();
    expect(dom.querySelector<HTMLInputElement>('#nie')?.value).toBe('X1234567L');
  });
});
