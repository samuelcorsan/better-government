import type { RedactionCounts, RedactionKind } from './types';

const DNI_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function dniLetter(num: number): string {
  return DNI_LETTERS[num % 23] ?? '';
}

/** True when `digits` + `letter` form a valid Spanish DNI/NIF control. */
export function isValidNif(digits: string, letter: string): boolean {
  if (!/^\d{8}$/.test(digits) || !/^[A-Z]$/i.test(letter)) return false;
  return dniLetter(Number(digits)).toUpperCase() === letter.toUpperCase();
}

/** True when the NIE (X/Y/Z + 7 digits + letter) has a valid control. */
export function isValidNie(nie: string): boolean {
  const m = /^([XYZ])(\d{7})([A-Z])$/i.exec(nie.replace(/[\s.-]/g, ''));
  if (!m) return false;
  const map: Record<string, string> = { X: '0', Y: '1', Z: '2' };
  const prefix = map[m[1]!.toUpperCase()];
  if (!prefix) return false;
  return isValidNif(prefix + m[2], m[3]!);
}

/** Spanish CIF: letter + 7 digits + control (digit or letter). */
export function isValidCif(raw: string): boolean {
  const cif = raw.replace(/[\s.-]/g, '').toUpperCase();
  const m = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/.exec(cif);
  if (!m) return false;
  const digits = m[2]!;
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const n = Number(digits[i]);
    if (i % 2 === 0) {
      const d = n * 2;
      sum += Math.floor(d / 10) + (d % 10);
    } else sum += n;
  }
  const control = (10 - (sum % 10)) % 10;
  const letterControl = 'JABCDEFGHI'[control];
  const c = m[3]!;
  const letterOrg = 'PQRSW';
  if (letterOrg.includes(m[1]!)) return c === letterControl;
  if ('ABEH'.includes(m[1]!)) return c === String(control);
  return c === String(control) || c === letterControl;
}

function ibanMod97(iban: string): number {
  const rearranged = (iban.slice(4) + iban.slice(0, 4)).toUpperCase();
  let remainder = 0;
  for (const ch of rearranged) {
    const value = /[A-Z]/.test(ch) ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of value) remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

export function isValidIban(raw: string): boolean {
  const iban = raw.replace(/[\s.-]/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
  return ibanMod97(iban) === 1;
}

export function isLuhnValid(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return digits.length >= 13 && digits.length <= 19 && sum % 10 === 0;
}

export interface Redactor {
  apply: (text: string) => string;
  counts: () => RedactionCounts;
  /** Drop every occurrence of these exact strings (form values copied into surrounding text). */
  scrubValues: (values: readonly string[]) => void;
  /** Manually blank these strings (user review). */
  scrubManual: (values: readonly string[]) => void;
}

/**
 * Offset-preserving Spanish + structural redactor. Placeholders are stable per value
 * within one document (`[NIE_1]`, `[EMAIL_2]`, …).
 */
export function createRedactor(): Redactor {
  const counts: RedactionCounts = {};
  const tables = new Map<RedactionKind, Map<string, string>>();
  const bump = (kind: RedactionKind) => {
    counts[kind] = (counts[kind] ?? 0) + 1;
  };
  const token = (kind: RedactionKind, raw: string) => {
    const key = raw.toUpperCase();
    let table = tables.get(kind);
    if (!table) {
      table = new Map();
      tables.set(kind, table);
    }
    let existing = table.get(key);
    if (!existing) {
      existing = `[${kind.toUpperCase()}_${table.size + 1}]`;
      table.set(key, existing);
      bump(kind);
    }
    return existing;
  };

  let extra: string[] = [];
  let manual: string[] = [];

  const replaceAll = (text: string, needle: string, kind: RedactionKind): string => {
    if (needle.length < 3) return text;
    if (!text.includes(needle)) return text;
    const placeholder = token(kind, needle);
    return text.split(needle).join(placeholder);
  };

  const apply = (input: string): string => {
    let text = input;

    for (const value of manual) text = replaceAll(text, value, 'manual');
    for (const value of extra) text = replaceAll(text, value, 'form_value');

    // Prefer longer / more specific patterns first.
    text = text.replace(/\b[A-Z]{2}\d{2}(?:[\s-]?[A-Z0-9]){11,30}\b/gi, (m) =>
      isValidIban(m) ? token('iban', m.replace(/[\s-]/g, '')) : m,
    );

    text = text.replace(/\b(?:\d[ -]*?){13,19}\b/g, (m) => {
      const digits = m.replace(/\D/g, '');
      return isLuhnValid(digits) ? token('card', digits) : m;
    });

    text = text.replace(/\b[XYZ]\d{7}[A-Z]\b/gi, (m) => (isValidNie(m) ? token('nie', m) : m));

    text = text.replace(/\b\d{8}[A-Z]\b/gi, (m) => {
      const digits = m.slice(0, 8);
      const letter = m.slice(8);
      return isValidNif(digits, letter) ? token('nif', m) : m;
    });

    text = text.replace(/\b[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]\b/gi, (m) =>
      isValidCif(m) ? token('cif', m) : m,
    );

    text = text.replace(
      /[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+/gi,
      (m) => token('email', m),
    );

    text = text.replace(/(?:\+|00\s*)?(?:34[\s.-]?)?(?:6|7|8|9)(?:[\s.-]*\d){8}\b/g, (m) =>
      token('phone', m.replace(/[\s.-]/g, '')),
    );

    text = text.replace(
      /\b(?:jsessionid|csrf(?:token)?|authenticity_token|bearer|authorization)\b[=:\s]+[^\s"'<>]+/gi,
      (m) => token('session', m),
    );

    text = text.replace(/\b[A-Fa-f0-9]{16,}\b/g, (m) => token('token', m));
    text = text.replace(/\b[A-Za-z0-9+/]{16,}={0,2}\b/g, (m) => {
      if (/^[A-Fa-f0-9]+$/.test(m)) return m; // already handled as hex token or left alone
      if (m.length < 16) return m;
      return token('token', m);
    });

    text = text.replace(/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g, (m) => token('date', m));
    text = text.replace(/\b\d{6,}\b/g, (m) => token('digits', m));

    // Non-Latin scripts (names Rampart cannot reliably catch).
    text = text.replace(
      /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]+/g,
      () => {
        bump('non_latin');
        return '[TEXTO]';
      },
    );

    return text;
  };

  return {
    apply,
    counts: () => ({ ...counts }),
    scrubValues: (values) => {
      extra = [
        ...extra,
        ...values.filter((v) => typeof v === 'string' && v.trim().length > 2).map((v) => v.trim()),
      ];
    },
    scrubManual: (values) => {
      manual = [
        ...manual,
        ...values.filter((v) => typeof v === 'string' && v.trim().length > 0).map((v) => v.trim()),
      ];
    },
  };
}
