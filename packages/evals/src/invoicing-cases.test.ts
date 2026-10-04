import { describe, expect, it } from 'vitest';
import { invoicingCases, invoicingDataset } from './invoicing-cases';

describe('controlled invoicing cases', () => {
  it('covers answers and abstentions per profile/language without using another tax year', () => {
    expect(invoicingDataset.stage).toBe('controlled');
    const annual = invoicingCases.filter((item) => item.subtopic === 'tax-calendar-2026');
    expect(
      annual.filter((item) => item.year !== 2026).every((item) => !item.expected.shouldAnswer),
    ).toBe(true);
    for (const topic of new Set(
      invoicingCases.filter((item) => item.year === 2026).map((item) => item.subtopic),
    ))
      for (const profile of new Set(
        invoicingCases
          .filter((item) => item.subtopic === topic && item.year === 2026)
          .map((item) => item.profile),
      ))
        for (const language of ['ca', 'es'])
          for (const shouldAnswer of [true, false])
            expect(
              invoicingCases.some(
                (item) =>
                  item.subtopic === topic &&
                  item.profile === profile &&
                  item.language === language &&
                  item.expected.shouldAnswer === shouldAnswer &&
                  item.year === 2026,
              ),
            ).toBe(true);
    expect(
      invoicingCases
        .filter((item) => item.expected.shouldAnswer)
        .every((item) => item.expected.requiredFacts.length > 0),
    ).toBe(true);
  });
});
