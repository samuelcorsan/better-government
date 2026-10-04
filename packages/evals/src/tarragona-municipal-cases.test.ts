import { describe, expect, it } from 'vitest';
import { tarragonaMunicipalCases, tarragonaMunicipalDataset } from './tarragona-municipal-cases';

describe('Tarragona controlled cases', () => {
  it('abstains on unclassified premises in both cities and languages', () => {
    expect(tarragonaMunicipalDataset.stage).toBe('controlled');
    expect(tarragonaMunicipalCases).toHaveLength(4);
    for (const language of ['ca', 'es']) {
      const cases = tarragonaMunicipalCases.filter((item) => item.language === language);
      expect(cases.map((item) => item.city)).toEqual(['Tarragona', 'Lleida']);
      expect(cases.every((item) => !item.expected.shouldAnswer && item.sources.length === 0)).toBe(
        true,
      );
    }
  });
});
