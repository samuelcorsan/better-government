import { describe, expect, it } from 'vitest';
import { employmentCases, employmentDataset } from './employment-cases';

describe('employment controlled cases', () => {
  it('covers both languages and answer/abstention for employee and solo prevention branches', () => {
    expect(employmentDataset.stage).toBe('controlled');
    expect(employmentCases).toHaveLength(36);
    for (const domain of ['D-09', 'D-10'])
      for (const language of ['ca', 'es'])
        for (const shouldAnswer of [true, false])
          expect(
            employmentCases.some(
              (item) =>
                item.domain === domain &&
                item.language === language &&
                item.expected.shouldAnswer === shouldAnswer,
            ),
          ).toBe(true);
    expect(
      employmentCases
        .filter((item) => item.domain === 'D-09')
        .every((item) => item.profile === 'with-employees'),
    ).toBe(true);
    expect(
      employmentCases.some(
        (item) => item.domain === 'D-10' && item.profile === 'without-employees',
      ),
    ).toBe(true);
  });
});
