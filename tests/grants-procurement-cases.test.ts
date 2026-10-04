import { expect, it } from 'vitest';
import { grantsProcurementDataset } from '../packages/evals/src/grants-procurement-cases';
import { grantsProcurementGuides } from '../packages/government/src/grants-procurement-guides';

it('exige una fecha de actualización oficial para cada fuente golden', () => {
  const datedSources = new Set(
    grantsProcurementGuides.flatMap((guide) =>
      guide.evidence.map((item) => `${item.url}|${item.sourceUpdatedAt}`),
    ),
  );
  for (const testCase of grantsProcurementDataset.cases)
    for (const source of testCase.sources)
      expect(datedSources.has(`${source.url}|${source.version}`)).toBe(true);
});
