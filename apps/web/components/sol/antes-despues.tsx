// «Antes y después»: tres momentos de un trámite, la web de hoy frente a Reforma Digital.
import type { ReactNode } from 'react';
import Image from 'next/image';
import catalogo from '../../landing/assets/screens/original-2-catalogo.png';
import { catalogo as cifras } from './catalogo';
import { Icono } from './icono';
import './antes-despues.css';

const { resultadosRenta: resultados, renta: puestoRenta, total } = cifras;

const pestanas = [
  'sede.agenciatributaria.gob.es',
  'portal.seg-social.gob.es',
  'sede.administracion.gob.es',
  'www.madrid.es',
  'sede.sepe.gob.es',
  'www.dnielectronico.es',
];

function Par({
  n,
  titulo,
  hoy,
  con,
}: {
  n: string;
  titulo: string;
  hoy: ReactNode;
  con: ReactNode;
}) {
  const id = `ad-par-${n}`;
  return (
    <section className="ad-par" aria-labelledby={id}>
      <div className="ad-par-cabeza">
        <span className="t-dato ad-num">{n}</span>
        <h2 id={id} className="t-titular-m">
          {titulo}
        </h2>
      </div>
      <div className="ad-lados">
        <div className="ad-lado ad-hoy">
          <p className="t-etiqueta">Hoy</p>
          {hoy}
        </div>
        <div className="ad-lado ad-con">
          <p className="t-etiqueta">Con Reforma Digital</p>
          {con}
        </div>
      </div>
    </section>
  );
}

export function AntesDespues() {
  return (
    <article className="ad" aria-labelledby="ad-titulo">
      <header className="ad-cabeza">
        <p className="t-etiqueta ad-antetitulo">Antes y después</p>
        <h1 id="ad-titulo" className="t-titular-xl">
          Hoy, y con Reforma Digital
        </h1>
        <p className="t-texto-l">
          Tres momentos de un trámite. A la izquierda, la web oficial tal y como está. A la derecha,
          lo que te enseñamos nosotros, con respuestas de ejemplo.
        </p>
      </header>

      <Par
        n="01"
        titulo="Encontrar un servicio"
        hoy={
          <figure className="ad-navegador">
            <div className="ad-barra" aria-hidden="true">
              <i />
              <i />
              <i />
              <span className="t-dato">
                <Icono n="candado" size={14} /> www2.agenciatributaria.gob.es
              </span>
            </div>
            <div className="ad-captura">
              <Image
                src={catalogo}
                alt="Catálogo de servicios de asistencia de la Agencia Tributaria, tal y como estaba el 27 de septiembre de 2026."
                sizes="(min-width: 960px) 560px, 100vw"
                loading="eager"
              />
            </div>
            <figcaption className="ad-pin">
              La Renta está en el puesto <b className="t-dato">{puestoRenta}</b> de {total}
            </figcaption>
          </figure>
        }
        con={
          <div className="caja-flota ad-tarjeta">
            <p className="ad-buscador">
              <Icono n="buscar" size={16} /> renta
              <small className="t-dato">
                {resultados.length} de {total}
              </small>
            </p>
            <ul className="ad-resultados">
              {resultados.map((s) => (
                <li key={s.puesto} data-elegido={s.name === 'Renta' ? '' : undefined}>
                  <span>{s.name}</span>
                  <small className="t-dato">Puesto {s.puesto}</small>
                </li>
              ))}
            </ul>
            <p className="ad-nota">Nombres reales del catálogo, en su orden.</p>
          </div>
        }
      />

      <Par
        n="02"
        titulo="Saber a quién preguntar"
        hoy={
          <div className="ad-pestanas">
            <ul aria-label="Pestañas abiertas">
              {pestanas.map((p) => (
                <li key={p} className="t-dato">
                  {p}
                </li>
              ))}
            </ul>
            <p className="ad-cual">¿Cuál era?</p>
          </div>
        }
        con={
          <div className="caja-flota ad-tarjeta">
            <p className="ad-pregunta">¿Cómo renuevo el DNI?</p>
            <ol className="ad-pasos">
              <li>
                <span className="t-etiqueta">Paso 1</span>
                Pide cita previa en la web de la Policía Nacional.
              </li>
              <li>
                <span className="t-etiqueta">Paso 2</span>
                Acude a la oficina el día de la cita, en persona.
              </li>
            </ol>
            <p className="ad-cita">
              <span className="ad-cita-sigla t-dato" aria-hidden="true">
                PN
              </span>
              <span className="t-dato">dnielectronico.es</span>
            </p>
          </div>
        }
      />

      <Par
        n="03"
        titulo="Entender qué te piden"
        hoy={
          <p className="ad-legal">
            La solicitud deberá formularse mediante comparecencia personal del interesado, previa
            obtención de cita, aportando la documentación acreditativa exigida por la normativa
            vigente en los términos previstos reglamentariamente.
          </p>
        }
        con={
          <ol className="caja-flota ad-claro">
            <li>
              <span className="t-dato">1</span> Pide cita previa.
            </li>
            <li>
              <span className="t-dato">2</span> Ve en persona con tu DNI anterior y una foto.
            </li>
          </ol>
        }
      />

      <section className="ad-cierre" aria-labelledby="ad-cierre-titulo">
        <h2 id="ad-cierre-titulo" className="t-titular-m">
          Prueba con tu trámite
        </h2>
        <a className="boton" href="/nueva#hc-pregunta">
          Pregúntanos qué necesitas <Icono n="derecha" />
        </a>
      </section>
    </article>
  );
}
