// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { EligeProvincia } from '../apps/web/app/(search)/elecciones/elige-provincia';
import { InfoDato } from '../apps/web/app/(search)/elecciones/info-dato';
import { TablaProvincias } from '../apps/web/app/(search)/elecciones/tabla-provincias';
import Elecciones, { generateMetadata } from '../apps/web/app/(search)/elecciones/page';
import { cartograma, provincias, recuadroCanarias } from '../apps/web/lib/elecciones';

const pagina = async (query: Record<string, string | string[]>) =>
  renderToStaticMarkup(await Elecciones({ searchParams: Promise.resolve(query) }));
const ficha = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html').getElementById('el-ficha')?.innerHTML ?? '';

describe('?provincia= en /elecciones', () => {
  it('abre la ficha de la provincia con sus cifras y sus fuentes oficiales', async () => {
    const html = ficha(await pagina({ provincia: '42' }));
    expect(html).toContain('<h3>Soria</h3>');
    expect(html).toContain('<strong class="t-dato">2</strong>');
    expect(html).toContain('<strong class="t-dato">90.234</strong>');
    expect(html).toContain('<strong class="t-dato">45.117</strong>');
    expect(html).toContain('un 68 % menos que la media de España (140.327)');
    expect(html).toContain('aria-label="Qué significa «Votos por escaño en 2023»"');
    expect(html).toContain('a candidaturas y en blanco, sin los nulos');
    expect(html).toContain('https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742');
    expect(html).toContain('https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25362');
    expect(html).toContain('https://infoelectoral.interior.gob.es/');
  });

  it('muestra el cambio de escaños frente a 2023 donde lo hay', async () => {
    expect(ficha(await pagina({ provincia: '28' }))).toContain('(1 más que en 2023)');
    expect(ficha(await pagina({ provincia: '11' }))).toContain('(1 menos que en 2023)');
    expect(ficha(await pagina({ provincia: '42' }))).not.toContain('que en 2023)');
  });

  it('ignora códigos que no son una circunscripción', async () => {
    for (const provincia of ['99', '', ['42', '28']]) {
      expect(ficha(await pagina({ provincia }))).not.toContain('<h3>');
    }
  });

  it('enlaza la imagen OG de la provincia elegida', async () => {
    const og = async (provincia: string) =>
      (await generateMetadata({ searchParams: Promise.resolve({ provincia }) })).openGraph?.images;
    expect(await og('52')).toEqual(['/elecciones/og/52']);
    expect(await og('99')).toEqual(['/og.png']);
  });

  it('elige provincia en el desplegable o en la tabla sin perder la vista', async () => {
    const doc = new DOMParser().parseFromString(
      await pagina({ provincia: '42', vista: 'escanos' }),
      'text/html',
    );
    const desplegable = doc.querySelector<HTMLSelectElement>('select[name="provincia"]')!;
    expect(desplegable.form?.getAttribute('action')).toBe('/elecciones');
    expect(desplegable.labels[0]?.textContent).toBe('Elige tu provincia');
    expect(desplegable.options).toHaveLength(53);
    expect(desplegable.value).toBe('42');
    expect(desplegable.form?.querySelector('input[name="vista"]')?.getAttribute('value')).toBe(
      'escanos',
    );
    expect(
      [...doc.querySelectorAll('.el-tabla tbody th a')]
        .find((a) => a.textContent === 'Soria')
        ?.getAttribute('href'),
    ).toBe('/elecciones?provincia=42&vista=escanos#el-ficha');
  });
});

it('dibuja Canarias dentro de su recuadro, con margen', () => {
  const { x, y, width, height } = recuadroCanarias;
  for (const id of ['35', '38']) {
    const n = provincias
      .find((p) => p.id === id)!
      .path.match(/-?\d+(\.\d+)?/g)!
      .map(Number);
    for (const [i, v] of n.entries()) {
      const [min, max] = i % 2 === 0 ? [x, x + width] : [y, y + height];
      expect(v).toBeGreaterThanOrEqual(min + 6);
      expect(v).toBeLessThanOrEqual(max - 6);
    }
  }
});

describe('cartograma de escaños', () => {
  it('da a cada provincia un círculo de área proporcional a sus escaños, sin solaparse', () => {
    expect(cartograma.map((c) => c.id)).toEqual(provincias.map((p) => p.id));
    for (const [i, a] of cartograma.entries()) {
      expect(a.r ** 2 / provincias[i]!.seats).toBeCloseTo(
        cartograma[0]!.r ** 2 / provincias[0]!.seats,
      );
      expect(a.x - a.r).toBeGreaterThanOrEqual(0);
      expect(a.x + a.r).toBeLessThanOrEqual(600);
      expect(a.y - a.r).toBeGreaterThanOrEqual(0);
      expect(a.y + a.r).toBeLessThanOrEqual(520);
      for (const b of cartograma.slice(i + 1)) {
        expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeGreaterThanOrEqual(a.r + b.r);
      }
    }
  });
});

it('la tabla busca sin tildes y ordena por nombre o escaños', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  const nombres = () => [...container.querySelectorAll('tbody th')].map((e) => e.textContent);
  const cambiar = async (control: HTMLInputElement | HTMLSelectElement, valor: string) => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(control), 'value')?.set?.call(
      control,
      valor,
    );
    await act(async () => control.dispatchEvent(new Event('change', { bubbles: true })));
  };
  try {
    const items = provincias.map((p) => ({ ...p, href: `/elecciones?provincia=${p.id}` }));
    await act(async () => root.render(createElement(TablaProvincias, { items })));
    const busqueda = container.querySelector('input')!;
    const orden = container.querySelector('select')!;
    expect(nombres().slice(0, 2)).toEqual(['Albacete', 'Alicante/Alacant']);
    await cambiar(orden, 'escanos');
    expect(nombres().slice(0, 3)).toEqual(['Madrid', 'Barcelona', 'Valencia/València']);
    expect([...orden.options].map((o) => o.text)).toEqual(['Nombre', 'Escaños']);
    await cambiar(busqueda, 'avila');
    expect(nombres()).toEqual(['Ávila']);
    await cambiar(busqueda, 'la rioja');
    expect(nombres()).toEqual(['Rioja (La)']);
    await cambiar(busqueda, 'xyz');
    expect(nombres()).toEqual([]);
    expect(container.textContent).toContain('Ninguna circunscripción coincide con «xyz».');
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});

it('el desplegable abre la ficha al elegir y sigue a la provincia del mapa sin perder el foco', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const form = document.createElement('form');
  document.body.append(form);
  const enviadas: (FormDataEntryValue | null)[] = [];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    enviadas.push(new FormData(form).get('provincia'));
  });
  const root = createRoot(form);
  const opciones = provincias.map(({ id, name }) => ({ id, name }));
  const pintar = (actual: string | undefined) =>
    act(async () => root.render(createElement(EligeProvincia, { actual, opciones })));
  try {
    await pintar(undefined);
    const select = form.querySelector('select')!;
    select.focus();
    select.value = '42';
    await act(async () => select.dispatchEvent(new Event('change', { bubbles: true })));
    expect(enviadas).toEqual(['42']);
    await pintar('28');
    expect(form.querySelector('select')).toBe(select);
    expect(select.value).toBe('28');
    expect(document.activeElement).toBe(select);
  } finally {
    await act(async () => root.unmount());
    form.remove();
    vi.unstubAllGlobals();
  }
});

it('la «i» se abre al pasar el ratón, al tocarla o con teclado, y se cierra al salir, fuera o con Esc', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () =>
      root.render(
        createElement(InfoDato, { titulo: 'Habitantes', ayuda: 'Personas empadronadas' }),
      ),
    );
    const boton = container.querySelector('button')!;
    const texto = container.querySelector('[role="tooltip"]')!;
    const abierto = () => !texto.hasAttribute('hidden');
    const raton = (tipo: string, relatedTarget: Element) =>
      act(async () => boton.dispatchEvent(new MouseEvent(tipo, { bubbles: true, relatedTarget })));
    expect(boton.getAttribute('aria-describedby')).toBe(texto.id);
    expect(abierto()).toBe(false);
    await raton('mouseover', document.body);
    expect(abierto()).toBe(true);
    await act(async () =>
      container
        .querySelector('dt')!
        .dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })),
    );
    expect(abierto()).toBe(false);
    await act(async () => boton.click());
    expect(abierto()).toBe(true);
    await act(async () => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
    expect(abierto()).toBe(false);
    await act(async () => boton.focus());
    expect(abierto()).toBe(true);
    await act(async () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
    expect(abierto()).toBe(false);
  } finally {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  }
});
