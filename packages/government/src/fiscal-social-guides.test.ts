import { describe, expect, it } from 'vitest';
import {
  fiscalSocialCoverage,
  fiscalSocialGuides,
  fiscalSocialRights,
} from './fiscal-social-guides';
import { reviseKnowledgeCatalog } from './knowledge-invalidation';

describe('guías fiscales y sociales controladas', () => {
  it('mantiene cobertura por subtema y perfil con citas, versiones y traducciones pendientes', () => {
    expect(fiscalSocialGuides).toHaveLength(13);
    expect(new Set(fiscalSocialGuides.map((guide) => guide.id)).size).toBe(13);
    const covered = new Set(
      fiscalSocialGuides.flatMap((guide) =>
        guide.profiles.map((profile) => `${guide.domain}/${guide.subtopic}/${profile}`),
      ),
    );
    for (const key of [
      'D-03/alta-censal/persona-fisica',
      'D-03/alta-censal/sociedad',
      'D-03/canal-integrado/persona-fisica',
      'D-03/actividades-locales/sociedad',
      'D-03/modelos-tributarios/persona-fisica',
      'D-04/encuadramiento-reta/persona-fisica',
      'D-04/encuadramiento-reta/socio-administrador',
      'D-04/encuadramiento-reta/familiar-colaborador',
      'D-04/mutualidad-alternativa/profesional-colegiado',
      'D-04/cotizacion/socio-administrador',
      'D-04/cambios-actividad/persona-fisica',
      'D-04/pluriactividad/pluriactivo',
      'D-04/beneficios-cotizacion/persona-fisica',
    ])
      expect(covered.has(key), key).toBe(true);
    for (const guide of fiscalSocialGuides) {
      expect(guide.validation.status).toBe('pending');
      expect(guide.title.ca).toBeTruthy();
      expect(guide.title.es).toBeTruthy();
      expect(guide.evidence.every((item) => item.sourceId in fiscalSocialRights)).toBe(true);
      expect(guide.conditions).toHaveLength(1);
      expect(guide.exclusions).toHaveLength(1);
      expect(
        [...guide.conditions, ...guide.exclusions, ...guide.claims, ...guide.steps].every(
          (item) => item.translation === 'ca',
        ),
      ).toBe(true);
    }
    expect(
      fiscalSocialGuides.filter((guide) => guide.period.from).map((guide) => guide.id),
    ).toEqual([
      'fiscal-036-vigente',
      'social-mutualidad-alternativa',
      'social-cotizacion-2026',
      'social-pluriactividad-2026',
    ]);
    expect(fiscalSocialCoverage.state).toBe('controlled-pending');
    expect(new Set(fiscalSocialCoverage.partial.map((item) => item.guideId))).toEqual(
      new Set(fiscalSocialGuides.map((guide) => guide.id)),
    );
  });

  it('conserva las abstenciones materiales frente a 037, cuota fija y plazo RETA extrapolado', () => {
    const byId = new Map(fiscalSocialGuides.map((guide) => [guide.id, guide]));
    for (const id of ['social-cotizacion-2026', 'social-pluriactividad-2026'])
      expect(byId.get(id)?.period.until).toBe('2026-12-31');
    expect(byId.get('fiscal-036-vigente')?.claims[0]?.text.es).toContain('suprimido');
    expect(byId.get('fiscal-pae-sin-duplicar')?.steps[0]?.text.es).toContain('antes de presentar');
    expect(byId.get('social-cotizacion-2026')?.steps[0]?.text.es).toContain('no calcules');
    expect(byId.get('social-mutualidad-alternativa')?.steps[0]?.text.es).toContain(
      'no presupongas',
    );
    expect(byId.get('social-varias-actividades')?.claims[0]?.text.es).toContain('alta única');
    expect(fiscalSocialCoverage.gaps.join(' ')).toContain('RD 643/2026');
    expect(
      fiscalSocialGuides.every(
        (guide) => !guide.steps.some((step) => /tres días|seis días|80 €/i.test(step.text.es)),
      ),
    ).toBe(true);
  });

  it('retira las fichas del ejercicio 2026 al empezar 2027', () => {
    const annual = fiscalSocialGuides.filter((guide) => guide.period.until === '2026-12-31');
    const revised = reviseKnowledgeCatalog(annual, [], '2027-01-01');
    expect(annual).toHaveLength(2);
    expect(revised.guides).toEqual([]);
    expect(revised.reports.map((report) => report.status)).toEqual(['withdrawn', 'withdrawn']);
  });
});
