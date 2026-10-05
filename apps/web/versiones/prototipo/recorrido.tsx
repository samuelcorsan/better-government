'use client';

// Variante 2 · Recorrido: un único escenario que cambia al pulsar cada paso.
import { useRef, useState, type KeyboardEvent } from 'react';
import DemoTransform from '../../landing/DemoTransform';
import { CapturaCatalogo, PuntosCatalogo, VinetaRespuesta, nunca } from './shared';
import { Icono } from './iconos';

const pasos = [
  { titulo: 'Preguntas', texto: 'Con tus palabras, como se lo dirías a alguien.' },
  { titulo: 'Te respondemos con fuentes', texto: 'Pasos claros y el organismo que se encarga.' },
  { titulo: 'Abres la web oficial', texto: 'La de siempre. Aquí es donde la gente se pierde.' },
  {
    titulo: 'La extensión la ordena',
    texto: 'Buscador y pasos encima. El envío sigue siendo oficial.',
  },
];

function Escena({ paso }: { paso: number }) {
  if (paso === 0)
    return (
      <div className="re-preguntar" aria-hidden="true">
        <span className="re-preguntar-titulo">¿Qué necesitas hacer?</span>
        <span className="re-preguntar-caja">
          ¿Cómo renuevo el DNI?
          <i>
            <Icono n="enviar" />
          </i>
        </span>
      </div>
    );
  if (paso === 1) return <VinetaRespuesta ladeada={false} />;
  if (paso === 2) return <CapturaCatalogo />;
  return <DemoTransform compact initialView="enhanced" />;
}

export default function Recorrido() {
  const [paso, setPaso] = useState(0);
  const botones = useRef<(HTMLButtonElement | null)[]>([]);
  const ir = (i: number) => {
    const n = (i + pasos.length) % pasos.length;
    setPaso(n);
    botones.current[n]?.focus();
  };
  const teclas = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') ir(paso + 1);
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ir(paso - 1);
    else return;
    e.preventDefault();
  };
  return (
    <main id="contenido" className="re">
      <div className="re-cabeza">
        <p className="es-antetitulo">El sistema en España está roto. Así lo arreglamos.</p>
        <h2>Cuatro pasos, una sola pantalla</h2>
      </div>

      <div className="re-escenario">
        <div
          className="re-pasos"
          role="tablist"
          aria-orientation="vertical"
          aria-label="Pasos"
          onKeyDown={teclas}
        >
          {pasos.map((p, i) => (
            <button
              key={p.titulo}
              ref={(el) => {
                botones.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`re-tab-${i}`}
              aria-selected={paso === i}
              aria-controls="re-panel"
              tabIndex={paso === i ? 0 : -1}
              onClick={() => setPaso(i)}
            >
              <span className="re-num">{i + 1}</span>
              <span>
                <b>{p.titulo}</b>
                <small>{p.texto}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="re-panel" role="tabpanel" id="re-panel" aria-labelledby={`re-tab-${paso}`}>
          <div className="re-panel-escena">
            <Escena paso={paso} />
          </div>
          <div className="re-panel-nav">
            <button type="button" onClick={() => ir(paso - 1)} aria-label="Paso anterior">
              <Icono n="izquierda" />
            </button>
            <span>
              {paso + 1} de {pasos.length}
            </span>
            <button type="button" onClick={() => ir(paso + 1)} aria-label="Paso siguiente">
              <Icono n="derecha" />
            </button>
          </div>
        </div>
      </div>

      <div className="re-extra">
        <PuntosCatalogo />
        <ul className="es-nunca" aria-label="Lo que nunca hace">
          {nunca.map((n) => (
            <li key={n}>
              <Icono n="nunca" /> {n}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
