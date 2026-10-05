'use client';

// Los 89 servicios del catálogo de ayuda de la Agencia Tributaria, un punto por servicio y en el
// orden de la web oficial. Datos reales de landing/data/aeat.ts (captura del 27/09/2026).
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { catalogo, iRenta, puntos, type Punto } from './catalogo';
import { Icono } from './icono';
import './puntos.css';

const POR_FILA = 10;
const PASO_MS = 14; // 82 servicios × 14 ms ≈ 1,15 s de lectura hasta la Renta

const dos = (n: number) => String(n).padStart(2, '0');
const filas = Array.from({ length: Math.ceil(puntos.length / POR_FILA) }, (_, f) =>
  puntos.slice(f * POR_FILA, (f + 1) * POR_FILA),
);
// Un anillo recorre la lista en orden hasta la Renta; lo que viene después no se anima.
const retraso = (i: number) => i * PASO_MS;

function nota(p: Punto) {
  if (p.i === iRenta) return 'Renta';
  if (p.original !== undefined) return `Repetido del ${dos(p.original + 1)}`;
  if (p.copias.length) return `Se repite en el ${p.copias.map((c) => dos(c + 1)).join(', ')}`;
  return null;
}

type Globo = { p: Punto; x: number; y: number };

export function Puntos() {
  const lienzo = useRef<HTMLDivElement>(null);
  const [vuelta, setVuelta] = useState(0);
  const [globo, setGlobo] = useState<Globo | null>(null);

  // Un recorrido al entrar en pantalla; después, solo si lo pide la persona.
  useEffect(() => {
    const nodo = lienzo.current;
    if (!nodo || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return;
        setVuelta(1);
        observador.disconnect();
      },
      { threshold: 0.4 },
    );
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  function mostrar(e: PointerEvent<HTMLDivElement>) {
    const t = e.target;
    if (!(t instanceof HTMLElement) || t.dataset.i === undefined) return;
    const p = puntos[Number(t.dataset.i)];
    if (!p) return;
    const abajo = p.i < POR_FILA;
    setGlobo({
      p,
      x: t.offsetLeft + t.offsetWidth / 2,
      y: t.offsetTop + (abajo ? t.offsetHeight : 0),
    });
  }

  const columna = globo ? globo.p.i % POR_FILA : 0;
  const notaGlobo = globo ? nota(globo.p) : null;

  return (
    <figure className="pt">
      <div className="pt-lienzo" ref={lienzo}>
        <div
          key={vuelta}
          className="pt-rejilla"
          data-fase={vuelta ? 'recorrido' : 'espera'}
          role="img"
          aria-label={`Catálogo de ayuda de la Agencia Tributaria: ${catalogo.total} servicios en una sola lista. La Renta está en el puesto ${catalogo.renta}. ${catalogo.repetidos} servicios aparecen dos veces.`}
          onPointerOver={mostrar}
          onPointerLeave={() => setGlobo(null)}
        >
          {filas.map((fila, f) => [
            <span key={`f${f}`} className="pt-fila t-etiqueta" aria-hidden="true">
              {dos(f * POR_FILA + 1)}
            </span>,
            ...fila.map(({ i, original }) => (
              <i
                key={i}
                className="pt-punto"
                data-i={i}
                data-tipo={i === iRenta ? 'renta' : original === undefined ? undefined : 'repetido'}
                data-despues={i > iRenta ? '' : undefined}
                style={i <= iRenta ? { animationDelay: `${retraso(i)}ms` } : undefined}
              >
                {i === iRenta && (
                  <span
                    className="pt-renta t-dato"
                    style={{ animationDelay: `${retraso(i) + 260}ms` }}
                  >
                    {catalogo.renta} / {catalogo.total} · Renta
                  </span>
                )}
              </i>
            )),
          ])}
        </div>
        <div
          className="pt-globo"
          data-visible={globo ? '' : undefined}
          data-abajo={globo && globo.p.i < POR_FILA ? '' : undefined}
          data-lado={columna < 2 ? 'izq' : columna > POR_FILA - 3 ? 'der' : undefined}
          style={globo ? { left: globo.x, top: globo.y } : undefined}
          aria-hidden="true"
        >
          {globo && (
            <>
              <span className="t-etiqueta">
                {dos(globo.p.i + 1)} / {catalogo.total}
                {notaGlobo && ` · ${notaGlobo}`}
              </span>
              <span>{globo.p.nombre}</span>
            </>
          )}
        </div>
      </div>
      <figcaption className="pt-pie">
        <ul className="pt-leyenda">
          <li>
            <i className="pt-muestra" /> Servicio
          </li>
          <li>
            <i className="pt-muestra" data-tipo="repetido" /> Repetido
          </li>
          <li>
            <i className="pt-muestra" data-tipo="renta" /> Renta
          </li>
        </ul>
        <button
          type="button"
          className="boton-fantasma pt-repetir"
          onClick={() => setVuelta((v) => v + 1)}
        >
          <Icono n="reintentar" size={16} /> Repetir el recorrido
        </button>
        <p className="pt-fuente t-dato">{catalogo.fuente}</p>
      </figcaption>
    </figure>
  );
}
