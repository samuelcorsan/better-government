import { describe, expect, it } from 'vitest';
import { activityClosureGuides } from '../packages/government/src/activity-closure-guides';
import { sources } from '../packages/government/src/index';
import { activityClosureDataset } from '../packages/evals/src/activity-closure-cases';

describe('D-17/D-18 candidate knowledge', () => {
  it('registers the public closure page without enabling remote retrieval', () => {
    const source = sources.find((item) => item.id === 'canal-empresa-fue');
    expect(source?.enabled).toBe(false);
    expect(source?.publicUrls).toContain(
      'https://canalempresa.gencat.cat/ca/01_que_voleu_fer/04_canvis_i_tancament/proces-de-tancament/',
    );
  });

  it('separates changes, administrative incidents and each closure branch', () => {
    expect(activityClosureGuides.map((guide) => guide.id)).toEqual(
      expect.arrayContaining([
        'change-tax-census',
        'change-tgss-activity',
        'respond-correction-request',
        'identify-appeal',
        'stop-one-activity',
        'stop-all-activities',
        'close-physical-establishment',
        'close-with-employees',
        'close-with-grant',
        'file-final-tax-returns',
        'retain-tax-invoices',
      ]),
    );
    for (const guide of activityClosureGuides) {
      expect(guide.validation.status).toBe('pending');
      expect(guide.conditions.length).toBeGreaterThan(0);
      expect(guide.exclusions.length).toBeGreaterThan(0);
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(
        guide.evidence.every((item) => item.informative && item.url.startsWith('https://')),
      ).toBe(true);
    }
    expect(
      activityClosureGuides
        .find((guide) => guide.id === 'stop-one-activity')
        ?.evidence.map((item) => item.sourceId),
    ).toEqual(expect.arrayContaining(['aeat', 'seg-social']));
    expect(
      activityClosureGuides
        .find((guide) => guide.id === 'stop-all-activities')
        ?.evidence.map((item) => item.sourceId),
    ).toEqual(expect.arrayContaining(['aeat', 'seg-social', 'canal-empresa-fue']));
    const appeal = activityClosureGuides.find((guide) => guide.id === 'identify-appeal');
    expect(appeal?.exclusions[0]?.text.es).toMatch(/organismo.*acto.*fecha de notificación/);
    expect(appeal?.steps[0]?.text.ca).toMatch(/organisme.*data de notificació/);
    expect(
      activityClosureGuides.find((guide) => guide.id === 'file-final-tax-returns')?.steps[0]?.text
        .es,
    ).toContain('período en que cesa');
  });

  it('has a bilingual answer and abstention for each relevant profile', () => {
    expect(activityClosureDataset.stage).toBe('controlled');
    for (const guide of activityClosureGuides)
      for (const profile of guide.profiles)
        for (const language of ['ca', 'es']) {
          const cases = activityClosureDataset.cases.filter(
            (item) =>
              item.subtopic === guide.subtopic &&
              item.profile === profile &&
              item.language === language &&
              item.city === null,
          );
          expect(cases.map((item) => item.expected.shouldAnswer)).toEqual([true, false]);
        }
    for (const language of ['ca', 'es']) {
      const deadline = activityClosureDataset.cases.find(
        (item) =>
          item.subtopic === 'identify-appeal' &&
          item.language === language &&
          !item.expected.shouldAnswer,
      );
      expect(deadline?.critical).toBe('deadline');
      expect(deadline?.sources).toEqual([]);
    }
  });

  it('abstains from a municipal closure form without activity and address', () => {
    for (const city of ['Barcelona', 'Girona', 'Lleida', 'Tarragona'])
      for (const language of ['ca', 'es']) {
        const local = activityClosureDataset.cases.find(
          (item) => item.city === city && item.language === language,
        );
        expect(local?.critical).toBe('jurisdiction');
        expect(local?.expected.shouldAnswer).toBe(false);
        expect(local?.sources).toEqual([]);
      }
  });
});
