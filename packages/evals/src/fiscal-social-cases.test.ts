import { describe, expect, it } from 'vitest';
import { fiscalSocialGuides } from '@reforma-digital/government/fiscal-social-guides';
import { catalunyaPublicationGate } from './catalunya';
import { fiscalSocialCases } from './fiscal-social-cases';

describe('casos T-004 D-03 y D-04', () => {
  it('cubre respuesta y abstención en ca/es para cada perfil de las guías', () => {
    const ids = new Set(fiscalSocialCases.map((item) => item.id));
    expect(ids.size).toBe(fiscalSocialCases.length);
    expect(fiscalSocialCases).toHaveLength(80);
    for (const testCase of fiscalSocialCases) {
      expect(testCase.sources.every((item) => item.consultedAt === '2026-10-04')).toBe(true);
    }
    const byId = new Map(fiscalSocialCases.map((testCase) => [testCase.id, testCase]));
    for (const guide of fiscalSocialGuides)
      for (const profile of guide.profiles)
        for (const language of ['ca', 'es'])
          for (const [suffix, shouldAnswer] of [
            ['answer', true],
            ['abstain', false],
          ] as const) {
            const testCase = byId.get(`${guide.id}-${profile}-${language}-${suffix}`);
            expect(testCase?.expected.shouldAnswer, guide.id).toBe(shouldAnswer);
            expect(testCase?.year, guide.id).toBe(2026);
          }
  });

  it('mantiene cerrado el gate oficial aunque exista cobertura controlada', () => {
    expect(
      catalunyaPublicationGate(
        {
          version: 'fiscal-social-controlled-2026',
          stage: 'controlled',
          description: 'Casos de #57',
          cases: fiscalSocialCases,
        },
        [],
      ),
    ).toContain('El corpus controlado no certifica publicación');
  });
});
