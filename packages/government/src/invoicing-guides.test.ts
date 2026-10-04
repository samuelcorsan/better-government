import { describe, expect, it } from 'vitest';
import { invoicingGuides } from './invoicing-guides';
import { reviseKnowledgeCatalog } from './knowledge-invalidation';

describe('candidate invoicing guides', () => {
  it('keeps profile branches pending and expires the 2026 calendar', () => {
    expect(invoicingGuides).toHaveLength(23);
    expect(new Set(invoicingGuides.map((guide) => guide.subtopic)).size).toBe(23);
    expect(invoicingGuides.find((guide) => guide.id === 'invoice-obligation')?.profiles).toEqual([
      'business-customer',
    ]);
    expect(invoicingGuides.every((guide) => guide.validation.status === 'pending')).toBe(true);
    const annual = invoicingGuides.filter((guide) => guide.id === 'tax-calendar-2026');
    expect(reviseKnowledgeCatalog(annual, [], '2026-12-31').guides).toHaveLength(1);
    expect(reviseKnowledgeCatalog(annual, [], '2027-01-01').guides).toHaveLength(0);
    const sif = invoicingGuides.filter((guide) => guide.id === 'sif-verifactu');
    expect(reviseKnowledgeCatalog(sif, [], '2027-07-01').guides).toHaveLength(0);
  });
});
