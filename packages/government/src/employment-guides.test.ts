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

  it('cites the alta route separately and keeps edition dates apart from observation', () => {
    const registration = employmentGuides.find((guide) => guide.id === 'employer-registration')!;
    expect(registration.claims[0]?.evidenceIds).toContain('tgss-worker-alta');
    expect(registration.steps[0]?.text.es).toContain('régimen general');
    const contract = employmentGuides.find((guide) => guide.id === 'employment-contract')!;
    expect(contract.evidence[0]?.sourceUpdatedAt).toBe('2025-12-04');
    expect(contract.evidence[0]?.applicableFrom).toBe(contract.consultedAt);
  });
});
