'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Icono } from '../../../components/sol/icono';

// Etiqueta de un dato con su explicación: se abre al pasar el ratón por la «i», al enfocarla con
// teclado o al tocarla en móvil, y se cierra al salir de la etiqueta y del texto, con Esc o tocando
// fuera. El texto también describe el botón para lectores de pantalla.
export function InfoDato({ titulo, ayuda }: { titulo: string; ayuda: string }) {
  const [abierto, setAbierto] = useState(false);
  const id = useId();
  const raiz = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!(e.target instanceof Node && raiz.current?.contains(e.target))) setAbierto(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('pointerdown', fuera);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', fuera);
      document.removeEventListener('keydown', esc);
    };
  }, [abierto]);

  return (
    <dt ref={raiz} onMouseLeave={() => setAbierto(false)}>
      {titulo}
      <button
        type="button"
        className="boton-icono el-info-boton"
        aria-label={`Qué significa «${titulo}»`}
        aria-describedby={id}
        onMouseEnter={() => setAbierto(true)}
        onClick={() => setAbierto(true)}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
      >
        <Icono n="info" size={16} />
      </button>
      {/* El hueco hasta la caja es parte del globo: el ratón puede bajar sin que se cierre. */}
      <span id={id} role="tooltip" className="el-info" hidden={!abierto}>
        <span className="caja-flota">{ayuda}</span>
      </span>
    </dt>
  );
}
