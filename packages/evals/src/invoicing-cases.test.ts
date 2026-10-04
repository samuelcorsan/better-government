import { describe, expect, it } from 'vitest';
import { normalizeText } from '@reforma-digital/core';
import { invoicingGuides } from '@reforma-digital/government/invoicing-guides';
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
    for (const item of invoicingCases.filter((item) => item.expected.shouldAnswer)) {
      const guide = invoicingGuides.find((candidate) => candidate.id === item.subtopic)!;
      const claims = normalizeText(
        guide.claims.map((claim) => claim.text[item.language]).join(' '),
      );
      for (const fact of item.expected.requiredFacts)
        expect(claims, item.id).toContain(normalizeText(fact));
    }
  });
});
