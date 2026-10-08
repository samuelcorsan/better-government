// @vitest-environment jsdom
import { act, createElement, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RepartoDhondt } from '../apps/web/app/(search)/elecciones/animaciones';
import Elecciones from '../apps/web/app/(search)/elecciones/page';
import { Reparto, RepartoGeneral } from '../apps/web/app/(search)/elecciones/reparto';
import { dhondt } from '../apps/web/lib/congreso';
import { provincias, type Provincia } from '../apps/web/lib/elecciones';

const provincia = (id: string) => provincias.find((p) => p.id === id)!;
const dhondt2023 = (p: Provincia) =>
  createElement(RepartoDhondt, {
    escanos: p.results2023.seats,
    blanco: p.results2023.blank,
    candidaturas: p.results2023.candidatures.map(({ acronym, votes }) => ({ acronym, votes })),
  });

async function montar(elemento: ReactElement, prueba: (c: HTMLElement) => Promise<void>) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(elemento));
    await prueba(container);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  }
}
const boton = (c: HTMLElement, texto: string) =>
  [...c.querySelectorAll('button')].find((b) => b.textContent === texto)!;
const pulsar = (c: HTMLElement, texto: string) => act(async () => boton(c, texto).click());
const frase = (c: HTMLElement) => c.querySelector('.el-paso')!;
const filas = (c: HTMLElement) =>
  [...c.querySelectorAll<HTMLElement>('[data-escanos]')].map((li) => [
    li.querySelector('.el-siglas')!.textContent,
    Number(li.dataset.escanos),
  ]);
const bloque = (p: Provincia, n: string) =>
  new DOMParser()
    .parseFromString(renderToStaticMarkup(createElement(Reparto, { p })), 'text/html')
    .querySelector(`[aria-labelledby="el-bloque-${n}"]`)!;

describe("D'Hondt de 2023 paso a paso", () => {
  it.each(provincias.map((p) => [p.name, p] as const))(
    'reproduce desde cero y termina en el reparto oficial en %s',
    async (_, p) => {
      const oficial = p.results2023.candidatures
        .filter((c) => c.seats > 0)
        .map((c) => [c.acronym, c.seats]);
      vi.useFakeTimers();
      await montar(dhondt2023(p), async (c) => {
        const conEscano = () => filas(c).filter(([, n]) => Number(n) > 0);
        expect(conEscano()).toEqual(oficial);
        await pulsar(c, 'Reproducir');
        expect(conEscano()).toEqual([]);
        while (boton(c, 'Pausar')) await act(async () => vi.advanceTimersByTime(1200));
        expect(conEscano()).toEqual(oficial);
        expect(frase(c).textContent).toContain('Así quedó el reparto oficial de 2023');
        expect(c.querySelector('[data-gana]')).toBeNull();
      });
    },
  );

  it('cuenta la barrera y cada escaño, y se pausa y sigue donde estaba', async () => {
    vi.useFakeTimers();
    await montar(dhondt2023(provincia('02')), async (c) => {
      const final = 'Así quedó el reparto oficial de 2023: PP (2) y PSOE (2).';
      const ganador = () =>
        [...c.querySelectorAll('[data-gana] span')].map((s) => s.textContent?.trim()).join(' | ');
      const avanzar = () => act(async () => vi.advanceTimersByTime(1200));
      expect(frase(c).textContent).toBe(final);
      expect(ganador()).toBe('');
      expect(c.querySelector('.el-dhondt-fuera')?.textContent).toBe(
        'Por debajo del 3 %, fuera del reparto: 4 candidaturas con 2152 votos.',
      );
      const ayuda = boton(c, 'Reproducir').getAttribute('aria-describedby')!;
      expect(document.getElementById(ayuda)?.textContent).toBe(
        'Muestra paso a paso cómo se llega a este resultado.',
      );
      // Desde el final, vuelve a empezar y calla la frase mientras avanza.
      await pulsar(c, 'Reproducir');
      expect(frase(c).textContent).toBe(
        '221.191 votos válidos, 1834 de ellos en blanco. Para entrar en el reparto hace falta el 3 %: 6636 votos.',
      );
      expect(frase(c).getAttribute('aria-live')).toBe('off');
      await avanzar();
      expect(ganador()).toBe('PP | 1 |  | ÷1 = 88.299');
      await avanzar();
      await avanzar();
      expect(frase(c).textContent).toBe('Escaño 3 de 4: PP, 88.299 ÷ 2 = 44.150.');
      expect(ganador()).toBe('PP | 2 |  | ÷2 = 44.150');
      // «Pausar» lo detiene donde está y «Reproducir» sigue desde ahí.
      await pulsar(c, 'Pausar');
      await act(async () => vi.advanceTimersByTime(5000));
      expect(frase(c).textContent).toBe('Escaño 3 de 4: PP, 88.299 ÷ 2 = 44.150.');
      expect(frase(c).getAttribute('aria-live')).toBe('polite');
      await pulsar(c, 'Reproducir');
      await avanzar();
      expect(frase(c).textContent).toBe('Escaño 4 de 4: PSOE, 76.322 ÷ 2 = 38.161.');
      expect(ganador()).toBe('PSOE | 2 |  | ÷2 = 38.161');
      await avanzar();
      expect(frase(c).textContent).toBe(final);
      expect(boton(c, 'Reproducir')).toBeDefined();
    });
  });

  it('marca en la tabla de divisores los cocientes que ganan escaño, también al reproducir', async () => {
    vi.useFakeTimers();
    await montar(dhondt2023(provincia('02')), async (c) => {
      const tabla = c.querySelector('.el-divisores')!;
      const marcadas = () =>
        [...tabla.querySelectorAll('[data-escano]')].map((td) => td.textContent);
      const avanzar = () => act(async () => vi.advanceTimersByTime(1200));
      expect([...tabla.querySelectorAll('thead th')].map((th) => th.textContent)).toEqual([
        'Divisor',
        'PP',
        'PSOE',
        'VOX',
        'SUMAR',
      ]);
      expect(marcadas()).toEqual(['88.299 (1.º)', '76.322 (2.º)', '44.150 (3.º)', '38.161 (4.º)']);
      expect(tabla.querySelector('[data-gana]')).toBeNull();
      expect(tabla.querySelectorAll('tbody tr')).toHaveLength(3);
      // Al reproducir, la casilla de cada escaño se ilumina en su paso y queda marcada.
      await pulsar(c, 'Reproducir');
      expect(marcadas()).toEqual([]);
      await avanzar();
      expect(marcadas()).toEqual(['88.299 (1.º)']);
      await avanzar();
      await avanzar();
      expect(marcadas()).toEqual(['88.299 (1.º)', '76.322 (2.º)', '44.150 (3.º)']);
      expect(tabla.querySelector('[data-gana]')?.textContent).toBe('44.150 (3.º)');
    });
  });

  it('en Ceuta y Melilla elige sin barrera', async () => {
    await montar(dhondt2023(provincia('51')), async (c) => {
      await pulsar(c, 'Reproducir');
      expect(frase(c).textContent).toContain('no hay barrera del 3 %');
      expect(c.querySelector('.el-dhondt-fuera')).toBeNull();
    });
  });
});

describe('de dónde salen los escaños', () => {
  const escanos = (id: string) => {
    const b = bloque(provincia(id), '01');
    return {
      tipos: [...b.querySelectorAll<HTMLElement>('.el-escanos .el-escano')].map(
        (s) => s.dataset.tipo,
      ),
      frase: b.querySelector('.el-paso')?.textContent,
      botones: b.querySelectorAll('button').length,
    };
  };
  const repetir = (tipo: string, n: number) => Array<string>(n).fill(tipo);

  it('muestra los 2 de la ley, los de población y el cambio frente a 2023, sin animación', () => {
    expect(escanos('28')).toEqual({
      tipos: [...repetir('ley', 2), ...repetir('poblacion', 35), 'nuevo'],
      frase:
        'Por población le corresponden 36 más: elige 38. En 2023 elegía 37; ahora elige 1 más.',
      botones: 0,
    });
    expect(escanos('11')).toEqual({
      tipos: [...repetir('ley', 2), ...repetir('poblacion', 6), 'perdido'],
      frase: 'Por población le corresponden 6 más: elige 8. En 2023 elegía 9; ahora elige 1 menos.',
      botones: 0,
    });
    expect(escanos('42')).toEqual({
      tipos: repetir('ley', 2),
      frase: 'Por población no le corresponde ninguno más: elige 2.',
      botones: 0,
    });
  });

  it('en Ceuta, un único escaño fijado por la ley', () => {
    expect(escanos('51')).toEqual({ tipos: ['ley'], frase: undefined, botones: 0 });
  });
});

it('el hemiciclo, sin animación, enciende los escaños de la provincia entre los 350', () => {
  const hemiciclo = bloque(provincia('42'), '04');
  expect(hemiciclo.querySelectorAll('svg > circle')).toHaveLength(350);
  expect(hemiciclo.querySelectorAll('[data-tuyo]')).toHaveLength(2);
  expect(hemiciclo.querySelector('.el-paso')?.textContent).toBe(
    'Soria elige 2 escaños, el 0,57\u00a0% del Congreso, y tiene el 0,18\u00a0% de la población de España. La línea marca la mitad: la mayoría absoluta son 176.',
  );
  expect(hemiciclo.querySelector('button')).toBeNull();
});

describe('votos que no eligieron a nadie', () => {
  const votos = (p: Provincia) =>
    [...bloque(p, '03').querySelectorAll('tbody tr')].map((tr) => [
      tr.querySelector('th')!.textContent,
      Number(tr.querySelector('td')!.textContent!.replace(/\D/g, '')),
    ]);

  it.each(provincias.map((p) => [p.name, p] as const))(
    'reparte todos los votos emitidos en %s',
    (_, p) => {
      const filas = votos(p);
      const emitidos = filas.pop();
      expect(emitidos).toEqual(['Votos emitidos', p.results2023.voters]);
      expect(filas.reduce((sum, [, n]) => sum + Number(n), 0)).toBe(p.results2023.voters);
    },
  );

  it('separa en Soria los votos sin escaño que superaron el 3 % de los que no llegaron', () => {
    expect(votos(provincia('42'))).toEqual([
      ['A candidaturas con escaño', 33861],
      ['A candidaturas sin escaño que superaron el 3 %', 16386],
      ['A candidaturas por debajo del 3 %', 237],
      ['En blanco', 285],
      ['Nulos', 388],
      ['Votos emitidos', 51157],
    ]);
  });

  it('cuenta también a quienes no votaron, sobre todo el censo', () => {
    expect(bloque(provincia('42'), '03').textContent).toContain(
      'Además, 24.611 personas con derecho a voto no votaron: el 32,5\u00a0% del censo, que incluye a quienes viven en el extranjero.',
    );
  });
});

describe('laboratorio con partidos ficticios', () => {
  const laboratorio = (c: HTMLElement) =>
    c.querySelector<HTMLElement>('[aria-labelledby="el-bloque-05"]')!;
  // Porcentajes de A, B, C, D y blanco en décimas, como los muestra cada deslizador.
  const valores = (c: HTMLElement) =>
    [...laboratorio(c).querySelectorAll('output')].map((o) =>
      Math.round(Number(o.textContent!.replace(/[^\d,]/g, '').replace(',', '.')) * 10),
    );
  const escanos = (c: HTMLElement) =>
    [...laboratorio(c).querySelectorAll('.el-lab li')]
      .slice(0, 4)
      .map((li) =>
        Number(
          li.querySelector('.el-dhondt-escanos')!.textContent!.match(/(\d+) escaño/)?.[1] ?? 0,
        ),
      );
  const n = (escanos: number) => (escanos === 1 ? '1 escaño' : `${escanos} escaños`);
  const texto = (c: HTMLElement) => laboratorio(c).querySelector('.el-experimento')!.textContent;
  const mover = (c: HTMLElement, i: number, valor: string) =>
    act(async () => {
      const input = laboratorio(c).querySelectorAll('input')[i]!;
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, valor);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  const experimento = (
    p: Provincia,
    nombre: string,
    prueba: (c: HTMLElement, v: number[]) => void,
  ) =>
    montar(createElement(Reparto, { p }), async (c) => {
      await pulsar(c, nombre);
      expect(boton(c, nombre).getAttribute('aria-pressed')).toBe('true');
      const v = valores(c);
      prueba(c, v);
    });

  it('los deslizadores siempre suman el 100 %', async () => {
    await montar(createElement(Reparto, { p: provincia('42') }), async (c) => {
      const suma = () => valores(c).reduce((a, b) => a + b, 0);
      expect(suma()).toBe(1000);
      for (const [i, valor] of [
        [0, '61.3'],
        [4, '0'],
        [3, '100'],
        [1, '33.3'],
        [2, '0.1'],
        [0, '0'],
      ] as const) {
        await mover(c, i, valor);
        expect(valores(c)[i]).toBe(Math.round(Number(valor) * 10));
        expect(suma()).toBe(1000);
      }
    });
  });

  it('en Madrid el blanco deja sin escaño a quien queda cerca del 3 %; en Soria no cambia nada', async () => {
    await experimento(provincia('28'), 'El blanco eleva la barrera', (c, v) => {
      const sin = dhondt(v.slice(0, 4), 0, 38);
      const con = dhondt(v.slice(0, 4), v[4]!, 38);
      expect(sin[3]).toBeGreaterThan(0);
      expect(con[3]).toBe(0);
      expect(escanos(c)).toEqual(con);
      const gana = ['A', 'B', 'C'].filter((_, i) => con[i]! > sin[i]!);
      expect(texto(c)).toContain('El voto en blanco es un sobre vacío');
      expect(texto(c)).toContain(`D tendría ${n(sin[3]!)}, que ahora se lleva ${gana.join('')}.`);
    });
    await experimento(provincia('42'), 'El blanco eleva la barrera', (c, v) => {
      expect(dhondt(v.slice(0, 4), v[4]!, 2)).toEqual(dhondt(v.slice(0, 4), 0, 2));
      expect(texto(c)).toContain('pero D seguiría sin escaño: con 2 escaños');
    });
  });

  const madrid = provincia('28');
  const validosMadrid = madrid.results2023.voters - madrid.results2023.invalid;

  it('dice cuántos votos le faltan a cada partido para otro escaño', async () => {
    await experimento(madrid, 'El blanco eleva la barrera', (c, v) => {
      const reales = v.map((x) => (x * validosMadrid) / 1000);
      // Escaños del partido i si sumara x votos, con los demás iguales.
      const con = (i: number, x: number) =>
        dhondt(
          reales.slice(0, 4).map((r, j) => (j === i ? r + x : r)),
          reales[4]!,
          38,
        )[i]!;
      const filas = [...laboratorio(c).querySelectorAll('.el-lab li')].slice(0, 4);
      for (const [i, li] of filas.entries()) {
        const frase = li.querySelector('.el-faltan')!.textContent!;
        const falta = Number(frase.replace(/\D/g, ''));
        const tiene = con(i, 0);
        expect(frase).toContain(tiene ? 'para otro escaño' : 'para su primer escaño');
        expect(con(i, falta)).toBeGreaterThan(tiene);
        expect(con(i, falta - 1)).toBe(tiene);
      }
    });
  });

  it('con más participación y los mismos porcentajes, los escaños no cambian', async () => {
    await montar(createElement(Reparto, { p: madrid }), async (c) => {
      const antes = valores(c);
      await pulsar(c, '¿Y si vota más gente?');
      expect(valores(c)).toEqual(antes);
      const mas = Math.round(validosMadrid / 10);
      const conTotal = (total: number) =>
        dhondt(
          antes.slice(0, 4).map((x) => Math.round((x * total) / 1000)),
          Math.round((antes[4]! * total) / 1000),
          38,
        );
      expect(conTotal(validosMadrid + mas)).toEqual(conTotal(validosMadrid));
      const barrera = (total: number) =>
        new Intl.NumberFormat('es-ES').format(Math.ceil((total * 3) / 100));
      expect(texto(c)).toContain('los escaños no cambiarían');
      expect(texto(c)).toContain(
        `de ${barrera(validosMadrid)} a ${barrera(validosMadrid + mas)} votos`,
      );
    });
  });

  it('los mismos porcentajes dan repartos distintos en Soria, en la provincia y en Madrid', async () => {
    await experimento(provincia('45'), 'Provincia pequeña y grande', (c, v) => {
      const esperado = [2, 6, 38].map((seats) => dhondt(v.slice(0, 4), v[4]!, seats));
      expect(esperado[0]).not.toEqual(esperado[2]);
      const columnas = [...laboratorio(c).querySelectorAll('.el-experimento thead th')].map(
        (th) => th.textContent,
      );
      expect(columnas).toEqual(['Partido', 'Soria (2)', 'Toledo (6)', 'Madrid (38)']);
      const celdas = [...laboratorio(c).querySelectorAll('.el-experimento tbody tr')].map((tr) =>
        [...tr.querySelectorAll('td')].map((td) => Number(td.textContent)),
      );
      expect(celdas).toEqual([0, 1, 2, 3].map((i) => esperado.map((r) => r[i])));
    });
  });

  describe('presentarse juntos', () => {
    // Escaños de C y D por separado y en una sola lista, con el escenario del experimento.
    const juntosYSeparados = (p: Provincia, v: number[]) => {
      const [a = 0, b = 0, cc = 0, d = 0, blanco = 0] = v;
      const separadas = dhondt([a, b, cc, d], blanco, p.seats);
      const juntas = dhondt([a, b, cc + d], blanco, p.seats);
      return {
        separadas,
        juntas,
        pierden: ['A', 'B'].filter((_, i) => juntas[i]! < separadas[i]!),
      };
    };
    const boton = 'Presentarse juntos: C + D';

    it('en Madrid les da un escaño más que por separado', async () => {
      await experimento(provincia('28'), boton, (c, v) => {
        const { separadas, juntas, pierden } = juntosYSeparados(provincia('28'), v);
        expect(separadas.slice(2)).toEqual([5, 5]);
        expect(juntas[2]).toBe(11);
        expect(texto(c)).toBe(
          `Antes de las elecciones, dos partidos pueden presentarse juntos en una sola lista. En Madrid, por separado, con el 14,0 % y el 12,0 %, C y D conseguirían 5 y 5 escaños. Juntos, con el 26,0 %, conseguirían 11: uno más, a costa de ${pierden.join(' y ')}. Con D'Hondt, juntos pueden sacar más que por separado.`,
        );
      });
    });

    it('en Albacete por separado no conseguirían escaño y juntos sí', async () => {
      await experimento(provincia('02'), boton, (c, v) => {
        const { separadas, juntas, pierden } = juntosYSeparados(provincia('02'), v);
        expect(separadas.slice(2)).toEqual([0, 0]);
        expect(juntas[2]).toBe(1);
        // Por separado, C se queda a un voto del último escaño: en singular.
        expect(laboratorio(c).querySelectorAll('.el-faltan')[2]!.textContent).toBe(
          'Le falta 1 voto para su primer escaño.',
        );
        expect(texto(c)).toContain(
          `ni C ni D conseguirían escaño. Juntos, con el 26,0 %, conseguirían 1 escaño, a costa de ${pierden.join(' y ')}.`,
        );
      });
    });

    it('en Soria no lo consiguen ni juntos', async () => {
      await experimento(provincia('42'), boton, (c, v) => {
        const { separadas, juntas } = juntosYSeparados(provincia('42'), v);
        expect([...separadas.slice(2), juntas[2]]).toEqual([0, 0, 0]);
        expect(texto(c)).toContain(
          'ni C ni D conseguirían escaño. Juntos, con el 26,0 %, tampoco.',
        );
      });
    });
  });

  it('pulsar otra vez el experimento lo cierra y deja los valores libres', async () => {
    await montar(createElement(Reparto, { p: provincia('42') }), async (c) => {
      const juntos = 'Presentarse juntos: C + D';
      await pulsar(c, juntos);
      const v = valores(c);
      await pulsar(c, juntos);
      expect(boton(c, juntos).getAttribute('aria-pressed')).toBe('false');
      expect(laboratorio(c).querySelector('.el-experimento')).toBeNull();
      expect(valores(c)).toEqual(v);
    });
  });

  it('nunca usa siglas de partidos reales', () => {
    const siglas = new Set(
      provincias.flatMap((p) => p.results2023.candidatures.map((x) => x.acronym)),
    );
    const nombres = [...bloque(provincia('28'), '05').querySelectorAll('.el-lab label')].map((l) =>
      l.textContent!.replace('Partido ', ''),
    );
    expect(nombres).toEqual(['A', 'B', 'C', 'D', 'En blanco']);
    expect(nombres.filter((n) => siglas.has(n))).toEqual([]);
  });
});

it('sin provincia explica el reparto en general, con el laboratorio en una provincia inventada', async () => {
  await montar(createElement(RepartoGeneral), async (c) => {
    expect(c.querySelector('h2')!.textContent).toBe('Cómo se eligen los diputados');
    expect(c.querySelectorAll('.el-bloque')).toHaveLength(2);
    const escanos = [...c.querySelectorAll('.el-lab .el-dhondt-escanos')].reduce(
      (suma, s) => suma + Number(s.textContent!.match(/(\d+) escaño/)?.[1] ?? 0),
      0,
    );
    expect(escanos).toBe(5);
    await pulsar(c, 'Provincia pequeña y grande');
    const columnas = [...c.querySelectorAll('.el-experimento thead th')].map(
      (th) => th.textContent,
    );
    expect(columnas).toEqual(['Partido', 'Soria (2)', 'Madrid (38)']);
  });
});

it('la sección de la provincia aparece al elegirla y la ficha enlaza a ella', async () => {
  const pagina = async (query: Record<string, string>) =>
    renderToStaticMarkup(await Elecciones({ searchParams: Promise.resolve(query) }));
  expect(await pagina({})).toContain(
    '<h2 id="el-reparto-titulo">Cómo se eligen los diputados</h2>',
  );
  const html = await pagina({ provincia: '42' });
  expect(html).toContain('<h2 id="el-reparto-titulo">Cómo se eligen los diputados de Soria</h2>');
  expect(html).toContain('href="#reparto"');
});
