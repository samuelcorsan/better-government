'use client';

// Opción de hero «Problema primero»: se sale del rojo del sistema a propósito. Fondo tinta, el
// titular y los 89 puntos; el único color es la Renta (amarillo) y la llamada (rojo).
import { links } from '../../landing/site';
import { Icono } from './icono';
import { Logotipo } from './marca';
import { catalogo } from './catalogo';
import { Puntos } from './puntos';
import './hero-problema.css';

export function HeroProblema({ onAsk }: { onAsk: () => void }) {
  return (
    <section className="hp" aria-labelledby="hp-titulo">
      <header className="hp-cab">
        <span className="hp-marca marca">
          <Logotipo />
        </span>
        <a
          className="boton-fantasma hp-extension"
          href={links.install}
          aria-label="Descargar extensión"
        >
          <Icono n="descargar" />
          <span>
            Descargar<span className="hp-largo"> extensión</span>
          </span>
        </a>
      </header>

      <div className="hp-cuerpo">
        <div className="hp-texto">
          <p className="t-etiqueta hp-antetitulo">Catálogo de ayuda de la Agencia Tributaria</p>
          <h1 id="hp-titulo" className="hp-titulo">
            El sistema en España está roto.
          </h1>
          <p className="t-texto-l hp-entradilla">
            Para pedir ayuda con la Renta, primero tienes que encontrarla: está en el puesto{' '}
            {catalogo.renta} de una lista de {catalogo.total}. Pregúntanos y te llevamos a la web
            oficial correcta.
          </p>
          <button type="button" className="boton hp-cta" onClick={onAsk}>
            Pregúntanos qué necesitas
          </button>
          <dl className="hp-cifras">
            <div>
              <dt>{catalogo.total}</dt>
              <dd>servicios en una página</dd>
            </div>
            <div>
              <dt>{catalogo.renta}</dt>
              <dd>puesto de la Renta</dd>
            </div>
            <div>
              <dt>{catalogo.repetidos}</dt>
              <dd>repetidos</dd>
            </div>
          </dl>
        </div>
        <div className="hp-imagen">
          <Puntos />
        </div>
      </div>
    </section>
  );
}
