'use client';

// Variante 3 · Antes y después: cada problema, la pantalla de hoy frente a la de Reforma Digital.
import type { ReactNode } from 'react';
import { CapturaCatalogo, PuntosCatalogo, VinetaBusqueda, VinetaRespuesta } from './shared';
import { Icono } from './iconos';

const pestanas = [
  'sede.agenciatributaria.gob.es',
  'portal.seg-social.gob.es',
  'sede.administracion.gob.es',
  'www.madrid.es',
  'sede.sepe.gob.es',
  'www.dnielectronico.es',
];

function Par({ titulo, hoy, con }: { titulo: string; hoy: ReactNode; con: ReactNode }) {
  return (
    <section className="ad-par" aria-label={titulo}>
      <h2>{titulo}</h2>
      <div className="ad-lados">
        <div className="ad-lado ad-hoy">
          <span className="ad-etiqueta">Hoy</span>
          {hoy}
        </div>
        <span className="ad-flecha" aria-hidden="true">
          <Icono n="derecha" size={22} />
        </span>
        <div className="ad-lado ad-con">
          <span className="ad-etiqueta">Con Reforma Digital</span>
          {con}
        </div>
      </div>
    </section>
  );
}

export default function AntesDespues() {
  return (
    <main id="contenido" className="ad">
      <div className="ad-cabeza">
        <p className="es-antetitulo">El sistema en España está roto.</p>
        <h2>Hoy, y con Reforma Digital</h2>
      </div>

      <Par titulo="Encontrar un servicio" hoy={<CapturaCatalogo />} con={<VinetaBusqueda />} />

      <Par
        titulo="Saber a quién preguntar"
        hoy={
          <div className="ad-pestanas" aria-hidden="true">
            {pestanas.map((p) => (
              <span key={p}>{p}</span>
            ))}
            <b>¿Cuál era?</b>
          </div>
        }
        con={<VinetaRespuesta ladeada={false} />}
      />

      <Par
        titulo="Entender qué te piden"
        hoy={
          <p className="ad-legal">
            La solicitud deberá formularse mediante comparecencia personal del interesado, previa
            obtención de cita, aportando la documentación acreditativa exigida por la normativa
            vigente en los términos previstos reglamentariamente.
          </p>
        }
        con={
          <ol className="ad-claro">
            <li>
              <span>1</span> Pide cita previa.
            </li>
            <li>
              <span>2</span> Ve en persona con tu DNI anterior y una foto.
            </li>
          </ol>
        }
      />

      <div className="ad-numeros">
        <PuntosCatalogo />
      </div>
    </main>
  );
}
