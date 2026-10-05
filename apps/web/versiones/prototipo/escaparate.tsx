'use client';

// Variante 1 · Escaparate: la imagen manda, una sola frase por bloque, alternando lados.
import type { ReactNode } from 'react';
import DemoTransform from '../../landing/DemoTransform';
import { CapturaCatalogo, VinetaDatos, VinetaRespuesta, nunca, webs } from './shared';
import { Icono } from './iconos';

function Fila({
  num,
  titulo,
  texto,
  visual,
  invertida,
  children,
}: {
  num: string;
  titulo: string;
  texto: string;
  visual: ReactNode;
  invertida?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={invertida ? 'es-fila es-invertida' : 'es-fila'}
      aria-labelledby={`es-${num}`}
    >
      <div className="es-visual">{visual}</div>
      <div className="es-texto">
        <span className="es-num" aria-hidden="true">
          {num}
        </span>
        <h2 id={`es-${num}`}>{titulo}</h2>
        <p>{texto}</p>
        {children}
      </div>
    </section>
  );
}

export default function Escaparate({ onAsk }: { onAsk: () => void }) {
  return (
    <main id="contenido" className="es">
      <p className="es-antetitulo">Proyecto independiente, sin vinculación con la Administración</p>
      <h2 className="es-roto">El sistema en España está roto.</h2>

      <Fila
        num="01"
        titulo="Todo está en internet. Nada se encuentra."
        texto="89 servicios en una sola página, sin buscador."
        visual={<CapturaCatalogo />}
      >
        <ul className="es-cifras">
          <li>
            <b>89</b> servicios
          </li>
          <li data-sol>
            <b>83</b> la Renta
          </li>
          <li>
            <b>20</b> repetidos
          </li>
        </ul>
      </Fila>

      <Fila
        num="02"
        titulo="Pregunta como hablas"
        texto="Te decimos qué organismo se encarga y te llevamos a su web."
        visual={<VinetaRespuesta />}
        invertida
      >
        <button type="button" className="es-boton" onClick={onAsk}>
          Probar el chat <Icono n="enviar" />
        </button>
      </Fila>

      <Fila
        num="03"
        titulo="La misma web, ordenada"
        texto="Pulsa «Mejorada» y busca «renta»."
        visual={
          <div className="es-demo">
            <DemoTransform compact initialView="legacy" />
          </div>
        }
      >
        <ul className="es-chips" aria-label="Dónde funciona ya">
          {webs.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </Fila>

      <Fila
        num="04"
        titulo="Tus datos se quedan contigo"
        texto="Los ocultamos en tu navegador antes de preguntar."
        visual={<VinetaDatos />}
        invertida
      >
        <ul className="es-nunca">
          {nunca.map((n) => (
            <li key={n}>
              <Icono n="nunca" /> {n}
            </li>
          ))}
        </ul>
      </Fila>
    </main>
  );
}
