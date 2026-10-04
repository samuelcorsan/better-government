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

  it('grounds the initial consular application in the regulation and excludes the EU family regime', () => {
    const initial = foreignWorkGuides[0]!;
    const step = initial.steps.find((item) => item.id === 'open-aut03a')!;
    expect(step.text.ca).toContain('sol·licitud inicial de visat');
    expect(step.evidenceIds).toContain('visa-request');
    expect(initial.evidence.find((item) => item.id === 'visa-request')?.url).toBe(
      foreignWorkUrls.regulation,
    );
    expect(initial.evidence.find((item) => item.id === 'ministry-scope')?.quote).toContain(
      'familiar de ciudadanos',
    );
  });
});
