import { describe, expect, it } from 'vitest';
import { foreignWorkCoverage, foreignWorkGuides, foreignWorkUrls } from './foreign-work-guides';

describe('foreign work guidance', () => {
  it('separates initial own-account authorization from EU residence and leaves other statuses open', () => {
    expect(foreignWorkGuides).toHaveLength(2);
    expect(foreignWorkGuides.every((guide) => guide.validation.status === 'pending')).toBe(true);
    expect(foreignWorkGuides.every((guide) => guide.jurisdiction === 'ES-CT')).toBe(true);
    expect(foreignWorkGuides[0]?.steps.at(-1)?.text.ca).toContain('AUT03a');
    expect(
      foreignWorkGuides[0]?.exclusions.some(
        (item) => item.id === 'registration-is-not-authorization',
      ),
    ).toBe(true);
    expect(foreignWorkGuides[1]?.steps[0]?.evidenceIds).toContain('eu-registration');
    expect(foreignWorkCoverage.status).toBe('partial');
    expect(foreignWorkUrls.initialCa).toContain('/ca/');
    expect(foreignWorkUrls.initialEs).toContain('/es/');
  });
});
