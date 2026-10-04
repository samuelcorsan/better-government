import { describe, expect, it } from 'vitest';
import { tarragonaMunicipalCases, tarragonaMunicipalDataset } from './tarragona-municipal-cases';

describe('Tarragona controlled cases', () => {
  it('has source-backed ca/es answers and other-city abstentions', () => {
    expect(tarragonaMunicipalDataset.stage).toBe('controlled');
    expect(tarragonaMunicipalCases).toHaveLength(4);
    for (const language of ['ca', 'es']) {
      const answer = tarragonaMunicipalCases.find(
        (item) => item.language === language && item.expected.shouldAnswer,
      );
      const abstention = tarragonaMunicipalCases.find(
        (item) => item.language === language && !item.expected.shouldAnswer,
      );
      expect(answer?.city).toBe('Tarragona');
      expect(answer?.sources[0]?.jurisdiction).toBe('ES-CT-TARRAGONA');
      expect(abstention?.city).toBe('Lleida');
      expect(abstention?.sources).toEqual([]);
    }
  });
});
