'use client';

import { useEffect, useRef, useState } from 'react';
import { Icono } from './icono';
import { links } from '../../lib/site';

export function Contribucion() {
  const escena = useRef<HTMLDivElement>(null);
  const [animada, setAnimada] = useState(false);
  const [pausada, setPausada] = useState(false);

  useEffect(() => {
    const elemento = escena.current;
    if (!elemento) return;
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((entrada) => entrada.isIntersecting)) {
          setAnimada(true);
          observador.disconnect();
        }
      },
      { rootMargin: '0px 0px -80px 0px' },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, []);

  return (
    <div className="in-colaboracion" ref={escena}>
      <div className="in-colaboracion-composicion">
        <a
          className="in-issue"
          href={`${links.repo}/issues/new`}
          aria-label="Proponer una mejora: abrir una nueva issue en GitHub"
        >
          <div
            className="in-issue-demo"
            data-animada={animada ? '' : undefined}
            data-pausada={pausada ? '' : undefined}
            aria-hidden="true"
          >
            <div className="in-issue-repo">
              <Icono n="documento" size={18} />
              <strong>reforma-digital</strong>
              <span className="t-dato">Issues</span>
            </div>
            <div className="in-issue-formulario">
              <strong className="in-issue-titulo">
                <Icono n="usuario" size={20} /> Crear una issue
              </strong>
              <div className="in-issue-campo">
                <span>
                  Añade un título <b>*</b>
                </span>
                <div>
                  <span className="in-issue-escritura in-issue-escritura-titulo">
                    Pedir cita sin perderse
                  </span>
                </div>
              </div>
              <div className="in-issue-campo">
                <span>Añade una descripción</span>
                <div className="in-issue-editor">
                  <div className="in-issue-herramientas">
                    <span className="in-issue-tab">Escribir</span>
                    <span>Vista previa</span>
                    <span className="in-issue-formatos">
                      <b>B</b>
                      <i>I</i>
                      <Icono n="externo" size={14} />
                      <span>{'<>'}</span>
                    </span>
                  </div>
                  <div className="in-issue-descripcion">
                    <span className="in-issue-escritura">El botón no explica</span>
                    <span className="in-issue-escritura">cuál es el siguiente paso.</span>
                    <span className="in-issue-escritura">Propongo aclararlo.</span>
                  </div>
                </div>
                <span className="in-issue-adjuntar">
                  <Icono n="externo" size={13} /> Adjunta archivos o arrástralos aquí
                </span>
              </div>
              <div className="in-issue-acciones">
                <span className="in-issue-mas">
                  <i /> Crear otra
                </span>
                <span className="in-issue-cancelar">Cancelar</span>
                <span className="in-issue-enviar">
                  <span className="in-issue-enviar-texto">Crear</span>
                  <span className="in-issue-enviar-check">
                    <Icono n="hecho" size={18} />
                  </span>
                </span>
              </div>
              <span className="in-issue-confirmacion">Una mejora en camino.</span>
              <svg
                className="in-issue-cursor"
                width="24"
                height="28"
                viewBox="0 0 24 28"
                fill="none"
              >
                <path
                  d="M3 2v21l6-5 4 8 4-2-4-8h8L3 2Z"
                  fill="var(--blanco)"
                  stroke="var(--tinta)"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </a>
        <div className="in-issue-pie">
          <span>Ejemplo de una propuesta</span>
          <button
            className="in-enlace in-issue-control"
            type="button"
            aria-pressed={pausada}
            onClick={() => setPausada((anterior) => !anterior)}
          >
            {pausada ? 'Reanudar' : 'Pausar'}
          </button>
        </div>
      </div>
    </div>
  );
}
