import { describe, expect, it } from 'vitest';
import { compatibleJurisdiction } from '../packages/core/src/index';
import {
  lleidaMunicipalCoverage,
  lleidaMunicipalGuide,
} from '../packages/government/src/lleida-municipal-guide';
import { lleidaMunicipalDataset } from '../packages/evals/src/lleida-municipal-cases';

describe('ficha municipal de Lleida', () => {
  it('conserva la fuente pública y limita el supuesto al municipio', () => {
    expect(lleidaMunicipalGuide.validation.status).toBe('pending');
    expect(lleidaMunicipalGuide.jurisdiction).toBe('ES-CT-LLEIDA');
    expect(compatibleJurisdiction(lleidaMunicipalGuide.jurisdiction, 'ES-CT-BARCELONA')).toBe(
      false,
    );
    expect(
      lleidaMunicipalGuide.evidence.every(
        (item) => new URL(item.url).hostname === 'tramits.paeria.cat',
      ),
    ).toBe(true);
    expect(new Set(lleidaMunicipalGuide.evidence.map((item) => item.language))).toEqual(
      new Set(['ca']),
    );
    expect(lleidaMunicipalGuide.steps.every((item) => item.translation === 'es')).toBe(true);
    expect(lleidaMunicipalCoverage.status).toBe('partial');
    expect(lleidaMunicipalCoverage.gaps[0]?.es).toContain('pantalla autenticada');
  });

  it('deja casos controlados en ambos idiomas y abstiene Barcelona', () => {
    expect(lleidaMunicipalDataset.stage).toBe('controlled');
    expect(lleidaMunicipalDataset.cases).toHaveLength(4);
    for (const language of ['ca', 'es']) {
      const answer = lleidaMunicipalDataset.cases.find(
        (item) => item.language === language && item.expected.shouldAnswer,
      );
      const abstain = lleidaMunicipalDataset.cases.find(
        (item) => item.language === language && !item.expected.shouldAnswer,
      );
      expect(answer?.city).toBe('Lleida');
      expect(answer?.sources).toHaveLength(5);
      expect(abstain?.city).toBe('Barcelona');
      expect(abstain?.sources).toEqual([]);
    }
  });
});
