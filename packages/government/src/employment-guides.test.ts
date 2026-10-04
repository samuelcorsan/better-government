import { describe, expect, it } from 'vitest';
import { employmentCoverage, employmentGuides } from './employment-guides';

describe('employment guides', () => {
  it('keeps hiring steps on the employee branch and prevention on both relevant branches', () => {
    const hiring = employmentGuides.filter((guide) => guide.domain === 'D-09');
    const prevention = employmentGuides.filter((guide) => guide.domain === 'D-10');
    expect(hiring).toHaveLength(5);
    expect(hiring.every((guide) => guide.profiles.includes('with-employees'))).toBe(true);
    expect(hiring.every((guide) => !guide.profiles.includes('without-employees'))).toBe(true);
    expect(prevention.some((guide) => guide.profiles.includes('with-employees'))).toBe(true);
    expect(prevention.some((guide) => guide.profiles.includes('without-employees'))).toBe(true);
    expect(employmentGuides.every((guide) => guide.validation.status === 'pending')).toBe(true);
    expect(
      employmentCoverage.every((branch) => branch.questions.length && branch.gaps.length),
    ).toBe(true);
  });
});
