'use client';

import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import './project-tour.css';

type TourStep = {
  title: string;
  label: ReactNode;
  text: ReactNode;
  scene: ReactNode;
};

const dosCifras = (n: number) => String(n).padStart(2, '0');

export function ProjectTour({
  header,
  titleId,
  steps,
  unit = 'Paso',
}: {
  header: ReactNode;
  titleId: string;
  steps: readonly TourStep[];
  unit?: string;
}) {
  const [activo, setActivo] = useState(0);
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = lista.current?.querySelectorAll<HTMLElement>('[data-paso]');
    if (!items) return;
    // El paso que cruza el centro de la pantalla, donde queda el centro del escenario, acompaña
    // la lectura sin controlar el scroll.
    // root: document, porque dentro de un iframe de otro origen el navegador ignora rootMargin
    // con la raíz implícita y el paso activo saltaría al que asoma por el borde.
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting && e.target instanceof HTMLElement) {
            setActivo(Number(e.target.dataset.paso));
          }
        }
      },
      { root: document, rootMargin: '-50% 0px -50% 0px' },
    );
    items.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [steps]);

  return (
    <section className="rc" aria-labelledby={titleId}>
      {header}
      <div className="rc-cuerpo">
        {/* El escenario va antes que los pasos en el DOM y CSS lo pinta a la derecha: así el compositor
            del buscador es la primera parada del teclado, justo cuando su escena está activa. */}
        <div className="rc-fijo">
          <div className="rc-marco rc-escenario">
            {steps.map((p, i) => (
              <div
                key={p.title}
                className="rc-escena"
                data-activa={activo === i ? '' : undefined}
                inert={activo !== i}
              >
                {p.scene}
              </div>
            ))}
          </div>
          <div className="rc-progreso" aria-hidden="true">
            <span className="t-etiqueta">
              {unit} {dosCifras(activo + 1)} de {dosCifras(steps.length)}
            </span>
            <span className="rc-progreso-barras">
              {steps.map((p, i) => (
                <i key={p.title} data-lleno={i <= activo ? '' : undefined} />
              ))}
            </span>
          </div>
        </div>
        <ol className="rc-pasos" ref={lista}>
          {steps.map((p, i) => (
            <li
              key={p.title}
              className="rc-paso"
              data-paso={i}
              data-activo={activo === i ? '' : undefined}
            >
              <div className="rc-paso-texto">
                {/* Elementos creados en un componente de servidor: sin clave, React avisa al ponerlos entre hermanos. */}
                <Fragment key="label">{p.label}</Fragment>
                <h3 className="t-titular-s">{p.title}</h3>
                <Fragment key="text">{p.text}</Fragment>
              </div>
              {/* Cada escena marca como decorativo lo que lo es: la del buscador lleva un compositor real.
                  En cada ancho solo se muestra una de las dos copias; la otra, con display: none, no recibe foco. */}
              <div className="rc-marco rc-marco-movil">{p.scene}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
