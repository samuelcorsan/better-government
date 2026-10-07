import { describe, expect, it } from 'vitest';
import { dhondt } from '../apps/web/lib/congreso';
import results2023 from '../apps/web/lib/congreso-2023.json';
import { poblacionReparto, provincias, resultado2023 } from '../apps/web/lib/elecciones';
import {
  experimentos,
  hemiciclo,
  labDesde,
  origenEscanos,
  PARTIDOS,
  pasosDhondt,
  repartoLab,
  votosSinEscano,
  type Lab,
} from '../apps/web/lib/reparto';

const provincia = (id: string) => provincias.find((p) => p.id === id)!;
const validosDe = (id: string) => {
  const r = resultado2023(id);
  return r.candidaturas.reduce((sum, c) => sum + c.votos, r.blanco);
};
const lab = (id: string, inicio: number[]) => labDesde(inicio, validosDe(id), provincia(id).seats);

describe('de dónde salen los escaños', () => {
  it.each(provincias.map((p) => [p.name, p] as const))(
    'mínimo legal más población suman los escaños de 2026 en %s',
    (_, p) => {
      const o = origenEscanos(p, poblacionReparto);
      expect(o.minimo + o.porPoblacion).toBe(p.seats);
      expect(o.cambio).toBe(p.seats - p.seats2023);
      // Cuota entera, más uno si le toca un resto mayor (art. 162.3).
      expect(o.porPoblacion).toBe(Math.floor(o.exacto) + (o.restoMayor ? 1 : 0));
    },
  );

  it('reparte 248 escaños por población', () => {
    expect(
      provincias.reduce((sum, p) => sum + origenEscanos(p, poblacionReparto).porPoblacion, 0),
    ).toBe(248);
    expect(origenEscanos(provincia('51'), poblacionReparto)).toMatchObject({
      minimo: 1,
      porPoblacion: 0,
    });
  });
});

describe("D'Hondt paso a paso", () => {
  it.each(results2023.constituencies.map((c) => [c.name, c.id] as const))(
    'la secuencia termina en el reparto oficial de 2023 de %s',
    (_, id) => {
      const r = resultado2023(id);
      const votos = r.candidaturas.map((c) => c.votos);
      const d = pasosDhondt(votos, r.blanco, r.escanos);
      expect(d.orden).toHaveLength(r.escanos);
      const final = votos.map((_, i) => d.orden.filter((q) => q.i === i).length);
      expect(final).toEqual(r.candidaturas.map((c) => c.escanos));
      // Cada escaño va al mayor cociente que queda: la secuencia nunca sube.
      const cociente = (q: { i: number; divisor: number }) => votos[q.i]! / q.divisor;
      for (const [k, q] of d.orden.slice(1).entries()) {
        expect(cociente(q)).toBeLessThanOrEqual(cociente(d.orden[k]!));
      }
      // El siguiente cociente no habría entrado.
      if (d.siguiente) expect(d.siguiente.cociente).toBeLessThanOrEqual(cociente(d.orden.at(-1)!));
    },
  );

  it('enseña los escaños de Soria uno a uno', () => {
    const r = resultado2023('42');
    const d = pasosDhondt(
      r.candidaturas.map((c) => c.votos),
      r.blanco,
      r.escanos,
    );
    expect(d.orden.map((q) => r.candidaturas[q.i]!.sigla)).toEqual(['PP', 'PSOE']);
    expect(d.barrera).toBe(Math.ceil((d.validos * 3) / 100));
  });
});

describe('votos sin escaño', () => {
  it.each(results2023.constituencies.map((c) => [c.name, c.id] as const))(
    'los votos válidos de %s se reparten sin huecos',
    (_, id) => {
      const r = resultado2023(id);
      const v = votosSinEscano(r);
      expect(v.conEscano + v.sinCociente + v.bajoBarrera + v.blanco).toBe(v.validos);
      expect(v.sinEscano.every((c) => c.escanos === 0)).toBe(true);
      if (r.escanos === 1) expect(v.bajoBarrera).toBe(0);
    },
  );
});

describe('laboratorio sobre el cálculo compartido', () => {
  it('usa dhondt de congreso.ts', () => {
    const l = lab('28', experimentos.union.inicio);
    expect(repartoLab(l).escanos).toEqual(dhondt(l.votos, l.blanco, l.escanos));
  });

  it('el voto en blanco eleva la barrera y deja fuera a una candidatura con escaño', () => {
    const antes = lab('28', experimentos.blanco.inicio);
    const despues = experimentos.blanco.despues(antes);
    const ra = repartoLab(antes);
    const rd = repartoLab(despues);
    expect(despues.votos).toEqual(antes.votos);
    expect(despues.blanco).toBeGreaterThan(antes.blanco);
    expect(rd.barrera).toBeGreaterThan(ra.barrera);
    expect(antes.votos[3]).toBeGreaterThanOrEqual(ra.barrera);
    expect(despues.votos[3]).toBeLessThan(rd.barrera);
    expect(ra.escanos?.[3]).toBe(1);
    expect(rd.escanos?.[3]).toBe(0);
    expect(rd.escanos).toEqual(dhondt(despues.votos, despues.blanco, despues.escanos));
    // Con un votante en blanco menos, D seguiría dentro: es el mínimo.
    expect(repartoLab({ ...despues, blanco: despues.blanco - 1 }).barrera).toBeLessThanOrEqual(
      despues.votos[3]!,
    );
  });

  it('con un solo escaño no hay barrera y el voto en blanco no cambia nada', () => {
    const antes = lab('51', experimentos.blanco.inicio);
    expect(experimentos.blanco.despues(antes)).toBe(antes);
    expect(repartoLab(antes).barrera).toBe(0);
  });

  it('los mismos porcentajes dan repartos distintos en una provincia pequeña y en una grande', () => {
    const soria = lab('42', experimentos.tamano.inicio);
    const madrid = provincia('28');
    const despues = experimentos.tamano.despues(soria, {
      escanos: madrid.seats,
      validos: validosDe('28'),
    });
    expect(repartoLab(soria).escanos).toEqual([1, 1, 0, 0]);
    const grande = repartoLab(despues).escanos!;
    expect(grande.reduce((a, b) => a + b, 0)).toBe(madrid.seats);
    expect(grande.every((n) => n > 0)).toBe(true);
    expect(grande).toEqual(dhondt(despues.votos, despues.blanco, madrid.seats));
  });

  it('unir dos candidaturas suma sus votos y cambia el reparto según D’Hondt', () => {
    const cambios = provincias.filter((p) => {
      const antes = lab(p.id, experimentos.union.inicio);
      const despues = experimentos.union.despues(antes);
      expect(despues.votos[2]).toBe(antes.votos[2]! + antes.votos[3]!);
      expect(despues.votos[3]).toBe(0);
      const ra = repartoLab(antes).escanos!;
      const rd = repartoLab(despues).escanos!;
      expect(rd).toEqual(dhondt(despues.votos, despues.blanco, despues.escanos));
      return rd[2] !== ra[2]! + ra[3]!;
    });
    // En la mayoría de provincias, juntas logran algún escaño más que por separado.
    expect(cambios.length).toBeGreaterThan(provincias.length / 2);
    const antes = lab('42', experimentos.union.inicio);
    expect(repartoLab(antes).escanos).toEqual([1, 1, 0, 0]);
    expect(repartoLab(experimentos.union.despues(antes)).escanos).toEqual([1, 0, 1, 0]);
  });

  it('no inventa ganador si el último escaño exige sorteo', () => {
    const empate: Lab = {
      etiquetas: [...PARTIDOS],
      votos: [500, 500, 0, 0],
      blanco: 0,
      escanos: 1,
    };
    expect(repartoLab(empate).escanos).toBeNull();
  });
});

describe('neutralidad del laboratorio', () => {
  it('solo usa las letras A, B, C y D', () => {
    expect(PARTIDOS).toEqual(['A', 'B', 'C', 'D']);
    for (const e of Object.values(experimentos)) {
      const antes = lab('28', e.inicio);
      const despues = e.despues(antes, { escanos: 2, validos: validosDe('42') });
      for (const etiqueta of [...antes.etiquetas, ...despues.etiquetas]) {
        expect(etiqueta).toMatch(/^([A-D](\+[A-D])*)?$/);
      }
    }
  });
});

it('el hemiciclo tiene 350 escaños sin solaparse, de izquierda a derecha', () => {
  const h = hemiciclo();
  expect(h).toHaveLength(350);
  for (const [i, a] of h.entries()) {
    expect(a.y).toBeGreaterThanOrEqual(0);
    for (const b of h.slice(i + 1)) expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThan(0.05);
  }
  expect(h[0]!.x).toBeLessThan(0);
  expect(h.at(-1)!.x).toBeGreaterThan(0);
});
