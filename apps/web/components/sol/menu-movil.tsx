'use client';

import { useRef } from 'react';
import { Icono } from './icono';
import { Logotipo } from './marca';

type Enlace = { href: string; texto: string; actual: boolean };

// Menú de pantalla completa para móvil, en amarillo para no confundirse con el rojo de la web.
// <dialog> modal: Esc, foco atrapado y devuelto al cerrar.
export function MenuMovil({ enlaces }: { enlaces: readonly Enlace[] }) {
  const menu = useRef<HTMLDialogElement>(null);
  const cerrar = () => menu.current?.close();

  return (
    <>
      <button
        className="boton-claro in-menu-boton"
        type="button"
        aria-label="Abrir el menú"
        aria-haspopup="dialog"
        onClick={() => menu.current?.showModal()}
      >
        <Icono n="mas" size={18} />
      </button>
      <dialog ref={menu} className="in-menu" aria-label="Menú">
        <div className="in-menu-barra">
          <a href="/" aria-label="Reforma Digital, portada de la iniciativa" onClick={cerrar}>
            <Logotipo size={36} />
          </a>
          <button
            className="boton in-menu-boton in-menu-cerrar"
            type="button"
            aria-label="Cerrar el menú"
            onClick={cerrar}
          >
            <Icono n="mas" size={18} />
          </button>
        </div>
        <nav aria-label="Menú">
          {enlaces.map(({ href, texto, actual }) => (
            <a key={href} href={href} aria-current={actual ? 'page' : undefined} onClick={cerrar}>
              {texto}
              <Icono n="derecha" size={18} />
            </a>
          ))}
        </nav>
        <a className="boton in-menu-participar" href="/#participar" onClick={cerrar}>
          Participar <Icono n="derecha" size={16} />
        </a>
      </dialog>
    </>
  );
}
