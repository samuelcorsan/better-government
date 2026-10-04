import { expect, it } from 'vitest';
import { normalizeText } from '../packages/core/src/index';
import { gironaMunicipalDataset } from '../packages/evals/src/girona-municipal-cases';

it('acepta la respuesta técnica en catalán y castellano', () => {
  for (const [language, answer] of [
    ['ca', 'Cal un certificat tècnic.'],
    ['es', 'Se requiere un certificado técnico.'],
  ] as const) {
    const testCase = gironaMunicipalDataset.cases.find(
      (item) => item.language === language && item.expected.shouldAnswer,
    );
    expect(testCase).toBeDefined();
    expect(
      testCase?.expected.requiredFacts.every((fact) =>
        normalizeText(answer).includes(normalizeText(fact)),
      ),
    ).toBe(true);
  }
});
