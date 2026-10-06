'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import './recorrido.css';

type PasoRecorrido = {
  titulo: string;
  etiqueta: ReactNode;
  texto: ReactNode;
  escena: ReactNode;
};

const dosCifras = (n: number) => String(n).padStart(2, '0');

export function RecorridoScroll({
  cabecera,
  tituloId,
  pasos,
  unidad = 'Paso',
}: {
  cabecera: ReactNode;
  tituloId: string;
  pasos: readonly PasoRecorrido[];
  unidad?: string;
}) {
  const [activo, setActivo] = useState(0);
  const lista = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = lista.current?.querySelectorAll<HTMLElement>('[data-paso]');
    if (!items) return;
    // El paso que cruza el centro de la pantalla acompaña la lectura, sin controlar el scroll.
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting && e.target instanceof HTMLElement) {
            setActivo(Number(e.target.dataset.paso));
          }
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    items.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [pasos]);

  return (
    <section className="rc" aria-labelledby={tituloId}>
      {cabecera}
      <div className="rc-cuerpo">
        <ol className="rc-pasos" ref={lista}>
          {pasos.map((p, i) => (
            <li
              key={p.titulo}
              className="rc-paso"
              data-paso={i}
              data-activo={activo === i ? '' : undefined}
            >
              <div className="rc-paso-texto">
                {p.etiqueta}
                <h3 className="t-titular-s">{p.titulo}</h3>
                {p.texto}
              </div>
              <div className="rc-marco rc-marco-movil" aria-hidden="true">
                {p.escena}
              </div>
            </li>
          ))}
        </ol>
        <div className="rc-fijo" aria-hidden="true">
          <div className="rc-marco rc-escenario">
            {pasos.map((p, i) => (
              <div key={p.titulo} className="rc-escena" data-activa={activo === i ? '' : undefined}>
                {p.escena}
              </div>
            ))}
          </div>
          <div className="rc-progreso">
            <span className="t-etiqueta">
              {unidad} {dosCifras(activo + 1)} de {dosCifras(pasos.length)}
            </span>
            <span className="rc-progreso-barras">
              {pasos.map((p, i) => (
                <i key={p.titulo} data-lleno={i <= activo ? '' : undefined} />
              ))}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
