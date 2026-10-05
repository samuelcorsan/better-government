'use client';

import { useState, type FormEvent } from 'react';
import { warm } from '../../lib/pii';
import { links } from '../../landing/site';
import { preparadas } from './chat/chat-demo';
import { Icono } from './icono';
import { Logotipo } from './marca';
import './hero-chat.css';

export function HeroChat({ onAsk }: { onAsk: (pregunta: string) => void }) {
  const [pregunta, setPregunta] = useState('');
  const lista = pregunta.trim().length >= 2;

  function enviar(event?: FormEvent) {
    event?.preventDefault();
    if (lista) onAsk(pregunta.trim());
  }

  return (
    <section className="hc" aria-labelledby="hc-titulo">
      <header className="hc-cab">
        <a className="hc-marca marca" href="/nueva">
          <Logotipo />
        </a>
        <a className="boton-claro hc-descargar" href={links.install}>
          <Icono n="descargar" />
          <span>
            Descargar<span className="hc-oculto-movil"> extensión</span>
          </span>
        </a>
      </header>

      <div className="hc-centro">
        <h1 id="hc-titulo" className="hc-titulo">
          ¿Qué necesitas hacer?
        </h1>
        <p className="hc-nota">
          Pregunta con tus palabras. Te decimos qué organismo se encarga y te llevamos a su web
          oficial.
        </p>

        <form className="hc-compositor" onSubmit={enviar}>
          <label htmlFor="hc-pregunta" className="sr-only">
            Escribe tu pregunta sobre un trámite
          </label>
          <textarea
            id="hc-pregunta"
            rows={1}
            value={pregunta}
            onChange={(event) => {
              warm();
              setPregunta(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                enviar();
              }
            }}
            placeholder="Escribe qué trámite necesitas"
            maxLength={1200}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button type="submit" className="boton-enviar" disabled={!lista} aria-label="Preguntar">
            <Icono n="enviar" size={20} />
          </button>
        </form>

        <ul className="hc-ejemplos" aria-label="Preguntas de ejemplo">
          {preparadas.map((ejemplo) => (
            <li key={ejemplo}>
              <button
                type="button"
                className="pildora hc-ejemplo"
                onPointerEnter={warm}
                onFocus={warm}
                onClick={() => onAsk(ejemplo)}
              >
                {ejemplo}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <a className="boton-fantasma hc-mas" href="#contenido">
        Quiero saber más <Icono n="abajo" />
      </a>
    </section>
  );
}
