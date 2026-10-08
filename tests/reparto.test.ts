// @vitest-environment jsdom
import { act, createElement, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { RepartoDhondt } from '../apps/web/app/(search)/elecciones/animaciones';
import Elecciones from '../apps/web/app/(search)/elecciones/page';
import { Reparto } from '../apps/web/app/(search)/elecciones/reparto';
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

it('la sección aparece al elegir provincia y la ficha enlaza a ella', async () => {
  const pagina = async (query: Record<string, string>) =>
    renderToStaticMarkup(await Elecciones({ searchParams: Promise.resolve(query) }));
  expect(await pagina({})).not.toContain('id="reparto"');
  const html = await pagina({ provincia: '42' });
  expect(html).toContain('<h2 id="el-reparto-titulo">Cómo se eligen los diputados de Soria</h2>');
  expect(html).toContain('href="#reparto"');
});
