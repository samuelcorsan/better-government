'use client';

// Hero «La extensión a tu lado»: la web oficial de Hacienda con el panel de Reforma Digital al
// lado. El panel es una maqueta estática; el chat real en modo panel vive en components/sol/chat/.
import { useState } from 'react';
import Image from 'next/image';
import { links } from '../../landing/site';
import catalogo from '../../landing/assets/screens/original-2-catalogo.png';
import { catalogo as cifras } from './catalogo';
import { Icono } from './icono';
import { Logotipo, Marca } from './marca';
import './hero-extension.css';

const pasos = [
  {
    titulo: 'Busca «Renta»',
    texto: `Está en el puesto ${cifras.renta} de ${cifras.total}. Escríbela en el buscador que he añadido a la página.`,
  },
  {
    titulo: 'Abre el servicio',
    texto: 'Está en «Asistencia sobre cartas recibidas». Pulsa el resultado y te llevo hasta él.',
  },
  {
    titulo: 'Elige cómo te atienden',
    texto: 'Asistente virtual, te llamamos u oficina. La cita la pides tú, en la web oficial.',
  },
] as const;

const estado = (i: number, paso: number) =>
  i < paso ? 'hecho' : i === paso ? 'activo' : 'pendiente';

export function HeroExtension({ onAsk }: { onAsk: () => void }) {
  const [actual, setActual] = useState<(typeof pasos)[number]>(pasos[0]);
  const paso = pasos.indexOf(actual);
  const siguiente = pasos[paso + 1];

  return (
    <section className="hx" aria-labelledby="hx-titulo">
      <div className="hx-copia">
        <div className="hx-titular">
          <p className="t-etiqueta hx-etiqueta">Extensión para Chrome · Experimental</p>
          <h1 id="hx-titulo" className="t-titular-xl">
            Arreglamos la web pública desde dentro.
          </h1>
        </div>
        <div className="hx-accion">
          <p className="t-texto-l hx-sub">
            Una capa sobre la web oficial que ordena el trámite y te guía paso a paso. El envío
            sigue siendo oficial.
          </p>
          <div className="hx-ctas">
            <a className="boton" href={links.install}>
              <Icono n="descargar" /> Descargar extensión
            </a>
            <button type="button" className="boton-claro" onClick={onAsk}>
              Probar el asistente
            </button>
          </div>
        </div>
      </div>

      <figure className="hx-escena" data-paso={paso + 1}>
        <figcaption className="hx-escena-barra">
          <span className="t-etiqueta" aria-hidden="true">
            <span className="hx-solo-ancho">Maqueta · </span>Paso {paso + 1} de {pasos.length}
          </span>
          <span className="sr-only">
            Maqueta: el catálogo de servicios de la Agencia Tributaria con el panel de Reforma
            Digital a la derecha, que te guía en tres pasos hasta el servicio de la Renta.
          </span>
          <button
            type="button"
            className="boton-claro hx-guia"
            onClick={() => setActual(siguiente ?? pasos[0])}
          >
            {siguiente ? 'Ver cómo guía' : 'Volver a empezar'}
            <Icono n={siguiente ? 'derecha' : 'reintentar'} size={16} />
          </button>
        </figcaption>
        <p className="sr-only" aria-live="polite">
          Paso {paso + 1} de {pasos.length}: {actual.titulo}. {actual.texto}
        </p>

        <div className="hx-navegador" aria-hidden="true">
          <div className="hx-barra">
            <span className="hx-semaforo">
              <i />
              <i />
              <i />
            </span>
            <span className="hx-url t-dato">
              <Icono n="candado" size={14} /> www2.agenciatributaria.gob.es
            </span>
            <span className="hx-ext">
              <Marca size={14} />
            </span>
          </div>

          <div className="hx-cuerpo">
            <div className="hx-web">
              <div className="hx-lienzo">
                <Image
                  src={catalogo}
                  alt=""
                  loading="eager"
                  sizes="(min-width: 1240px) 760px, (min-width: 860px) 62vw, 100vw"
                  className="hx-captura"
                />
                <span className="hx-capa-buscar">
                  <Icono n="buscar" size={14} />
                  <span>Renta</span>
                  <span className="t-dato hx-capa-cuenta">
                    {cifras.renta} de {cifras.total}
                  </span>
                </span>
                <span className="hx-capa-resultado">
                  <span>
                    <strong>Renta</strong>
                    <small>Asistencia sobre cartas recibidas</small>
                  </span>
                  <Icono n="derecha" size={14} />
                </span>
                <span className="hx-foco" />
              </div>
            </div>

            <div className="hx-panel">
              <div className="hx-panel-cabecera">
                <span className="hx-panel-marca">
                  <Logotipo size={22} />
                </span>
                <Icono n="cerrar" size={16} />
              </div>

              <div className="hx-panel-hilo">
                <p className="hx-pregunta">Quiero ayuda con la Renta</p>
                <p className="hx-respuesta">Te guío en esta misma página. Son tres pasos.</p>

                <div className="hx-guion">
                  <p className="t-etiqueta hx-guion-titulo">
                    Paso {paso + 1} de {pasos.length} · {actual.titulo}
                  </p>
                  <span className="hx-progreso">
                    {pasos.map((p, i) => (
                      <i key={p.titulo} data-estado={estado(i, paso)} />
                    ))}
                  </span>
                  <span className="hx-mensajes">
                    {pasos.map((p, i) => (
                      <span key={p.titulo} data-activo={i === paso || undefined}>
                        {p.texto}
                      </span>
                    ))}
                  </span>
                  <ol className="hx-pasos">
                    {pasos.map((p, i) => (
                      <li key={p.titulo} data-estado={estado(i, paso)}>
                        <span className="hx-casilla">
                          {i < paso ? <Icono n="hecho" size={12} /> : i + 1}
                        </span>
                        {p.titulo}
                      </li>
                    ))}
                  </ol>
                </div>

                <span className="pildora t-dato hx-cita">
                  <Icono n="externo" size={14} /> agenciatributaria.gob.es
                </span>
              </div>

              <div className="hx-compositor">
                <span>Pregunta otra cosa…</span>
                <span className="hx-enviar">
                  <Icono n="enviar" size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </figure>
    </section>
  );
}
