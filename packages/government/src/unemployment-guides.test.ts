import { describe, expect, it } from 'vitest';
import { unemploymentCoverage, unemploymentGuides } from './unemployment-guides';

describe('guías de desempleo y autoempleo', () => {
  it('mantiene separadas las rutas y bloquea la publicación de una convocatoria cerrada', () => {
    const [benefits, subsidy, soc, grant] = unemploymentGuides;
    expect(benefits?.validation.status).toBe('pending');
    expect(benefits?.claims.map((claim) => [claim.id, claim.conditionIds])).toEqual([
      ['compatibility', ['contributory']],
      ['capitalization', ['contributory']],
      ['suspension', ['suspended']],
      ['cessation-protection', ['cessation']],
    ]);
    expect(benefits?.exclusions.some((item) => item.id === 'subsidy-exclusion')).toBe(true);
    expect(benefits?.steps).toHaveLength(6);
    expect(
      benefits?.steps.every(
        (step) => step.text.ca.startsWith('Si') || step.id === 'check-benefit-and-start-date',
      ),
    ).toBe(true);
    expect(benefits?.profiles).toContain('mutuality-alternative');
    expect(benefits?.steps.some((step) => step.id === 'check-mutuality-resumption')).toBe(true);
    expect(subsidy?.subtopic).toBe('subsidy-resumption');
    expect(subsidy?.validation.status).toBe('pending');
    expect(subsidy?.steps).toHaveLength(2);
    expect(soc?.subtopic).toBe('soc-services');
    expect(soc?.validation.status).toBe('pending');
    expect(soc?.steps[0]?.text.ca).toContain('SOC');
    expect(grant?.period.until).toBe('2026-09-22');
    expect(grant?.validation.status).toBe('pending');
    expect(grant?.steps).toEqual([]);
    expect(unemploymentCoverage.unresolved.some((item) => item.includes('no calcular'))).toBe(true);
  });
});
