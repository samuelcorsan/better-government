import { describe, expect, it } from 'vitest';
import { unemploymentCases, unemploymentDataset } from './unemployment-cases';

describe('D-05 controlled cases', () => {
  it('covers each route in both languages and keeps unresolved benefits closed', () => {
    expect(unemploymentDataset.stage).toBe('controlled');
    expect(unemploymentCases).toHaveLength(18);
    expect(new Set(unemploymentCases.map((item) => item.id)).size).toBe(18);
    for (const subtopic of [
      'compatibility',
      'capitalization',
      'suspension-resumption',
      'cessation-protection',
      'subsidy-resumption',
      'soc-services',
    ]) {
      expect(
        new Set(
          unemploymentCases
            .filter((item) => item.subtopic === subtopic && item.expected.shouldAnswer)
            .map((item) => item.language),
        ),
      ).toEqual(new Set(['ca', 'es']));
    }
    expect(
      unemploymentCases
        .filter((item) => item.profile === 'mutuality-alternative')
        .map((item) => item.language)
        .sort(),
    ).toEqual(['ca', 'es']);
    expect(
      unemploymentCases.filter((item) => !item.expected.shouldAnswer).map((item) => item.language),
    ).toEqual(['ca', 'es', 'es', 'ca']);
  });
});
