import { describe, expect, it } from 'vitest';
import { privacyCommerceGuides } from '@reforma-digital/government/privacy-commerce-guides';
import { privacyCommerceDataset } from '@reforma-digital/evals/privacy-commerce-cases';
import { approvedSource, sources } from '@reforma-digital/government';

describe('D-11/D-12 privacy, commerce and consumer guides', () => {
  it('registers the AEPD and Consum public documents without enabling remote search', () => {
    for (const id of ['aepd', 'consum']) {
      const source = sources.find((item) => item.id === id);
      expect(source?.enabled).toBe(false);
      for (const url of source?.publicUrls ?? []) expect(approvedSource(url, id)).toBeUndefined();
      expect(source?.publicUrls?.length).toBeGreaterThan(0);
    }
  });

  it('keeps every public candidate conditional, bilingual and pending', () => {
    expect(privacyCommerceGuides.map((guide) => guide.id)).toEqual(
      expect.arrayContaining([
        'personal-data-low-risk',
        'personal-data-high-risk',
        'online-shop-identity',
        'cookies-consent',
        'cookies-technical-exception',
        'cookies-accept-reject',
        'email-advertising',
        'distance-precontract',
        'physical-prices',
        'service-prices',
        'service-estimate',
        'physical-complaints',
        'complaint-response',
        'consumer-language',
        'web-offer-language',
        'product-label-language',
      ]),
    );
    for (const guide of privacyCommerceGuides) {
      expect(guide.validation.status).toBe('pending');
      expect(guide.conditions.length).toBeGreaterThan(0);
      expect(guide.exclusions.length).toBeGreaterThan(0);
      expect(guide.claims.every((claim) => claim.conditionIds.length > 0)).toBe(true);
      for (const evidence of guide.evidence) {
        if (evidence.sourceId !== 'aepd' && evidence.sourceId !== 'consum') continue;
        const source = sources.find((item) => item.id === evidence.sourceId);
        const url = new URL(evidence.url);
        expect(source?.publicUrls).toContain(url.origin + url.pathname + url.search);
      }
    }
    const facilita = privacyCommerceGuides.find((guide) => guide.id === 'personal-data-low-risk');
    expect(facilita?.claims[0].text.es).toContain('no implican cumplimiento automático');
    const web = privacyCommerceGuides.find((guide) => guide.id === 'web-language');
    const offer = privacyCommerceGuides.find((guide) => guide.id === 'web-offer-language');
    expect(web?.claims[0].text.es).toContain('No hay obligación general');
    expect(offer?.claims[0].text.es).toContain('al menos en catalán');
  });

  it('has answer and abstention cases in both languages for every relevant profile', () => {
    expect(privacyCommerceDataset.stage).toBe('controlled');
    expect(new Set(privacyCommerceDataset.cases.map((item) => item.id)).size).toBe(
      privacyCommerceDataset.cases.length,
    );
    for (const guide of privacyCommerceGuides)
      for (const profile of guide.profiles)
        for (const language of ['ca', 'es'] as const) {
          const cases = privacyCommerceDataset.cases.filter(
            (item) =>
              item.subtopic === guide.subtopic &&
              item.profile === profile &&
              item.language === language &&
              item.city === null,
          );
          expect(cases.some((item) => item.expected.shouldAnswer && item.sources.length > 0)).toBe(
            true,
          );
          expect(
            cases.some((item) => !item.expected.shouldAnswer && item.sources.length === 0),
          ).toBe(true);
        }
  });

  it('does not infer a municipality-specific rule from the regional guide', () => {
    for (const city of ['Barcelona', 'Girona', 'Lleida', 'Tarragona']) {
      const cases = privacyCommerceDataset.cases.filter((item) => item.city === city);
      expect(cases.map((item) => item.language).sort()).toEqual(['ca', 'es']);
      expect(cases.every((item) => !item.expected.shouldAnswer && item.sources.length === 0)).toBe(
        true,
      );
    }
  });
});
