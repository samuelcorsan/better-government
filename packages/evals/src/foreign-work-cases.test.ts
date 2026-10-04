import { describe, expect, it } from 'vitest';
import { foreignWorkCases, foreignWorkDataset } from './foreign-work-cases';

describe('foreign work controlled cases', () => {
  it('covers two supported routes and two abstentions in both languages', () => {
    expect(foreignWorkDataset.stage).toBe('controlled');
    expect(foreignWorkCases).toHaveLength(8);
    for (const language of ['ca', 'es']) {
      const cases = foreignWorkCases.filter((item) => item.language === language);
      expect(cases.filter((item) => item.expected.shouldAnswer)).toHaveLength(2);
      expect(cases.filter((item) => !item.expected.shouldAnswer)).toHaveLength(2);
      expect(cases.every((item) => item.sources.length > 0)).toBe(true);
    }
  });

  it('conditions AUT03a on the family regime and grounds the EU route in each language', () => {
    for (const language of ['ca', 'es'] as const) {
      const initial = foreignWorkCases.find(
        (item) => item.id === `foreign-initial-${language}-answer`,
      )!;
      const eu = foreignWorkCases.find((item) => item.id === `foreign-eu-${language}-answer`)!;
      expect(initial.query).toMatch(/familiar/);
      expect(eu.sources[0]?.url).toContain(language === 'ca' ? '/ca/' : '/tu-espacio-europeo/');
      expect(eu.expected.requiredFacts).toEqual([
        language === 'ca' ? 'compte propi' : 'cuenta propia',
      ]);
    }
  });
});
