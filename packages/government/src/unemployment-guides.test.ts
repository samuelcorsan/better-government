import { describe, expect, it } from 'vitest';
import { unemploymentCoverage, unemploymentGuides } from './unemployment-guides';

describe('guías de desempleo y autoempleo', () => {
  it('mantiene separadas las rutas y bloquea la publicación de una convocatoria cerrada', () => {
    const [benefits, grant] = unemploymentGuides;
    expect(benefits?.validation.status).toBe('pending');
    expect(benefits?.claims.map((claim) => [claim.id, claim.conditionIds])).toEqual([
      ['compatibility', ['contributory']],
      ['capitalization', ['contributory']],
      ['suspension', ['suspended']],
      ['cessation-protection', ['cessation']],
    ]);
    expect(benefits?.exclusions.some((item) => item.id === 'subsidy-exclusion')).toBe(true);
    expect(grant?.period.until).toBe('2026-09-22');
    expect(grant?.validation.status).toBe('pending');
    expect(grant?.steps).toEqual([]);
    expect(unemploymentCoverage.unresolved.some((item) => item.includes('no calcular'))).toBe(true);
  });
});
