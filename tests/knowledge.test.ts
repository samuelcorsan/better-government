import { describe, expect, it } from 'vitest';
import { guideSchema, type Guide } from '../packages/core/src/index';

// Entirely synthetic text and source; these tests do not verify any real legal rule.
const guide = {
  id: 'synthetic-self-employment',
  revision: 1,
  title: { ca: 'Alta fictícia', es: 'Alta ficticia' },
  domain: 'D-01',
  subtopic: 'alta',
  profiles: ['general'],
  jurisdiction: 'ES-CT-BARCELONA',
  consultedAt: '2026-06-01',
  period: { from: '2026-01-01', evidenceIds: ['e1'] },
  validation: { status: 'verified', checkedAt: '2026-06-02', method: 'automatic' },
  evidence: [
    {
      id: 'e1',
      sourceId: 'synthetic-office',
      url: 'https://example.test/rule',
      originalUrl: 'https://example.test/rule',
      version: 'synthetic-v1',
      language: 'es',
      attribution: 'Fuente sintética',
      sourceUpdatedAt: '2026-05-31',
      applicableFrom: '2026-01-01',
      applicableUntil: null,
      informative: false,
      jurisdiction: 'ES-CT',
      quote: 'Regla sintética aplicable desde 2026-01-01 a perfiles ficticios.',
    },
  ],
  conditions: [
    {
      id: 'c1',
      text: { ca: 'Condició fictícia', es: 'Condición ficticia' },
      evidenceIds: ['e1'],
      translation: 'ca',
    },
  ],
  exclusions: [
    {
      id: 'x1',
      text: { ca: 'Exclusió fictícia', es: 'Exclusión ficticia' },
      evidenceIds: ['e1'],
      translation: 'ca',
    },
  ],
  claims: [
    {
      id: 'o1',
      kind: 'obligation',
      text: { ca: 'Obligació fictícia', es: 'Obligación ficticia' },
      evidenceIds: ['e1'],
      translation: 'ca',
      conditionIds: ['c1'],
    },
  ],
  steps: [
    {
      id: 's1',
      text: { ca: 'Primer pas fictici', es: 'Primer paso ficticio' },
      evidenceIds: ['e1'],
      translation: 'ca',
      dependsOn: [],
    },
    {
      id: 's2',
      text: { ca: 'Segon pas fictici', es: 'Segundo paso ficticio' },
      evidenceIds: ['e1'],
      translation: 'ca',
      dependsOn: ['s1'],
    },
  ],
} satisfies Guide;

describe('contrato de guía bilingüe sintética', () => {
  it('acepta una ficha con procedencia, condiciones y vigencia explícitas', () => {
    expect(guideSchema.safeParse(guide).success).toBe(true);
    expect(guide.consultedAt).not.toBe(guide.period.from);
  });

  it('no confirma una obligación sin condiciones aplicables', () => {
    expect(guideSchema.safeParse({ ...guide, conditions: [] }).success).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        claims: [{ ...guide.claims[0], conditionIds: [] }],
      }).success,
    ).toBe(false);
  });

  it('rechaza citas inexistentes o duplicadas y dependencias futuras', () => {
    expect(
      guideSchema.safeParse({
        ...guide,
        claims: [{ ...guide.claims[0], evidenceIds: ['missing'] }],
      }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({ ...guide, evidence: [...guide.evidence, guide.evidence[0]] }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        steps: [{ ...guide.steps[0], dependsOn: ['s2'] }, guide.steps[1]],
      }).success,
    ).toBe(false);
  });

  it('rechaza evidencia municipal ajena y URLs sin HTTPS seguro', () => {
    expect(
      guideSchema.safeParse({
        ...guide,
        evidence: [{ ...guide.evidence[0], jurisdiction: 'ES-CT-GIRONA' }],
      }).success,
    ).toBe(false);
    for (const url of ['http://example.test/rule', 'https://user@example.test/rule'])
      expect(
        guideSchema.safeParse({
          ...guide,
          evidence: [{ ...guide.evidence[0], url }],
        }).success,
      ).toBe(false);
  });

  it('rechaza fechas sin cita y no confunde consulta con vigencia', () => {
    expect(
      guideSchema.safeParse({
        ...guide,
        period: { from: guide.consultedAt, evidenceIds: ['e1'] },
      }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        claims: [
          {
            ...guide.claims[0],
            text: { ca: 'Fins a 2027-01-01', es: 'Hasta 2027-01-01' },
          },
        ],
      }).success,
    ).toBe(false);
    expect(guideSchema.safeParse({ ...guide, period: { evidenceIds: [] } }).success).toBe(false);
  });

  it('solo admite estado verificado por controles automáticos y contenido ca/es', () => {
    expect(
      guideSchema.safeParse({
        ...guide,
        validation: { status: 'verified', checkedAt: '2026-06-02', method: 'professional' },
      }).success,
    ).toBe(false);
    expect(guideSchema.safeParse({ ...guide, title: { ca: 'Alta fictícia' } }).success).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        evidence: [{ ...guide.evidence[0], version: '' }],
      }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        claims: [{ ...guide.claims[0], translation: 'es' }],
      }).success,
    ).toBe(false);
  });

  it('rechaza campos inesperados que podrían introducir datos personales', () => {
    expect(guideSchema.safeParse({ ...guide, applicantName: 'ficticio' }).success).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        evidence: [{ ...guide.evidence[0], applicantName: 'ficticio' }],
      }).success,
    ).toBe(false);
    expect(
      guideSchema.safeParse({
        ...guide,
        claims: [{ ...guide.claims[0], applicantName: 'ficticio' }],
      }).success,
    ).toBe(false);
  });
});
