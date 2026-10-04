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
});
