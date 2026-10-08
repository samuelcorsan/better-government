'use client';

import { Button } from '@reforma-digital/design/sol';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from './icon';
import { links } from '../../lib/site';

export function Contribution() {
  const escena = useRef<HTMLDivElement>(null);
  const id = useId();
  const [animada, setAnimada] = useState(false);
  const [tocada, setTocada] = useState(false);

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
        <form
          className="in-issue"
          action={`${links.repo}/issues/new`}
          method="get"
          target="_blank"
          rel="noopener noreferrer"
          aria-labelledby={`${id}-titulo`}
          onFocus={() => setTocada(true)}
        >
          <div className="in-issue-demo" data-animada={animada && !tocada ? '' : undefined}>
            <div className="in-issue-repo" aria-hidden="true">
              <Icon name="documento" size={18} />
              <strong>reforma-digital</strong>
              <span className="t-dato">Issues</span>
            </div>
            <div className="in-issue-formulario">
              <strong className="in-issue-titulo" id={`${id}-titulo`}>
                <Icon name="usuario" size={20} /> Crear una issue
              </strong>
              <div className="in-issue-campo">
                <label htmlFor={`${id}-title`}>
                  Añade un título <b aria-hidden="true">*</b>
                </label>
                <div>
                  <input
                    className="in-issue-escritura"
                    id={`${id}-title`}
                    name="title"
                    required
                    maxLength={200}
                    autoComplete="off"
                    placeholder="Pedir cita sin perderse"
                    aria-describedby={`${id}-aviso`}
                  />
                </div>
              </div>
              <div className="in-issue-campo">
                <label htmlFor={`${id}-body`}>Añade una descripción</label>
                <div className="in-issue-editor">
                  <div className="in-issue-herramientas" aria-hidden="true">
                    <span className="in-issue-tab">Escribir</span>
                    <span>Vista previa</span>
                    <span className="in-issue-formatos">
                      <b>B</b>
                      <i>I</i>
                      <Icon name="externo" size={14} />
                      <span>{'<>'}</span>
                    </span>
                  </div>
                  <textarea
                    className="in-issue-escritura in-issue-descripcion"
                    id={`${id}-body`}
                    name="body"
                    rows={4}
                    maxLength={1000}
                    placeholder={
                      'El botón no explica\ncuál es el siguiente paso.\nPropongo aclararlo.'
                    }
                    aria-describedby={`${id}-aviso`}
                  />
                </div>
                <span className="in-issue-aviso" id={`${id}-aviso`}>
                  <Icon name="info" size={14} /> La issue será pública en GitHub. No incluyas datos
                  personales.
                </span>
              </div>
              <div className="in-issue-acciones">
                <Button variant="secondary" type="reset">
                  Cancelar
                </Button>
                <Button className="in-issue-enviar" type="submit">
                  <span className="in-issue-enviar-texto">Crear</span>
                  <span className="in-issue-enviar-check" aria-hidden="true">
                    <Icon name="hecho" size={18} />
                  </span>
                  <span className="sr-only"> (se abre en una pestaña nueva)</span>
                </Button>
              </div>
              <span className="in-issue-confirmacion" aria-hidden="true">
                Una mejora en camino.
              </span>
              <svg
                className="in-issue-cursor"
                width="24"
                height="28"
                viewBox="0 0 24 28"
                fill="none"
                aria-hidden="true"
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
        </form>
        <div className="in-issue-pie">
          <span>Ejemplo de una propuesta</span>
        </div>
      </div>
    </div>
  );
}
