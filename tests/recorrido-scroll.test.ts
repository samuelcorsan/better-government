// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { RecorridoScroll } from '../apps/web/components/sol/recorrido-scroll';

it('acompaña el scroll en ambos sentidos y conserva los enlaces de cada proyecto', async () => {
  const observados: Element[] = [];
  const disconnect = vi.fn();
  let notificar = (_entradas: { target: Element; isIntersecting: boolean }[]) => {};
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: typeof notificar) {
        notificar = callback;
      }
      observe(elemento: Element) {
        observados.push(elemento);
      }
      disconnect = disconnect;
    },
  );
  const contenedor = document.createElement('div');
  const root = createRoot(contenedor);
  try {
    await act(async () =>
      root.render(
        createElement(RecorridoScroll, {
          tituloId: 'proyectos',
          cabecera: createElement('h2', { id: 'proyectos' }, 'Los proyectos'),
          unidad: 'Proyecto',
          pasos: ['Buscador', 'Extensión', 'Fuentes'].map((titulo, i) => ({
            titulo,
            etiqueta: titulo,
            texto: createElement('a', { href: `/proyecto/${i}` }, `Abrir ${titulo}`),
            escena: createElement('span', null, `Vista de ${titulo}`),
          })),
        }),
      ),
    );
    const progreso = () => contenedor.querySelector('.rc-progreso')?.textContent;
    expect(progreso()).toContain('Proyecto 01 de 03');
    for (const i of [1, 2, 0]) {
      const target = observados[i];
      if (!target) throw new Error(`No se observó el proyecto ${i}`);
      await act(async () => notificar([{ target, isIntersecting: true }]));
      expect(progreso()).toContain(`Proyecto 0${i + 1} de 03`);
    }
    expect([...contenedor.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual([
      '/proyecto/0',
      '/proyecto/1',
      '/proyecto/2',
    ]);
  } finally {
    await act(async () => root.unmount());
    vi.unstubAllGlobals();
  }
  expect(disconnect).toHaveBeenCalledOnce();
});
