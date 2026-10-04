import { describe, expect, it } from 'vitest';
import { compatibleJurisdiction, guideSchema } from '../packages/core/src/index';
import {
  barcelonaMunicipalCoverage,
  barcelonaMunicipalGuide,
} from '../packages/government/src/barcelona-municipal-guide';
import { barcelonaMunicipalDataset } from '../packages/evals/src/barcelona-municipal-cases';

describe('ficha municipal de Barcelona', () => {
  it('conserva la ruta pública bilingüe y limita el supuesto al municipio', () => {
    expect(guideSchema.safeParse(barcelonaMunicipalGuide).success).toBe(true);
    expect(barcelonaMunicipalGuide.validation.status).toBe('pending');
    expect(barcelonaMunicipalGuide.jurisdiction).toBe('ES-CT-BARCELONA');
    expect(compatibleJurisdiction(barcelonaMunicipalGuide.jurisdiction, 'ES-CT-GIRONA')).toBe(
      false,
    );
    expect(
      barcelonaMunicipalGuide.evidence.every(
        (item) => new URL(item.url).hostname === 'seuelectronica.ajuntament.barcelona.cat',
      ),
    ).toBe(true);
    expect(new Set(barcelonaMunicipalGuide.evidence.map((item) => item.language))).toEqual(
      new Set(['ca', 'es']),
    );
    expect(barcelonaMunicipalCoverage.status).toBe('partial');
    expect(barcelonaMunicipalCoverage.gaps[0]?.es).toContain('pantalla autenticada');
  });

  it('deja un escenario municipal controlado por idioma y abstiene Girona', () => {
    expect(barcelonaMunicipalDataset.stage).toBe('controlled');
    expect(barcelonaMunicipalDataset.cases).toHaveLength(4);
    for (const language of ['ca', 'es']) {
      const answer = barcelonaMunicipalDataset.cases.find(
        (item) => item.language === language && item.expected.shouldAnswer,
      );
      const abstain = barcelonaMunicipalDataset.cases.find(
        (item) => item.language === language && !item.expected.shouldAnswer,
      );
      expect(answer?.city).toBe('Barcelona');
      expect(answer?.sources).toHaveLength(1);
      expect(abstain?.city).toBe('Girona');
      expect(abstain?.sources).toEqual([]);
    }
  });
});
