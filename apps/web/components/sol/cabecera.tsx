import type { ReactNode } from 'react';
import { Icono } from './icono';
import { Logotipo } from './marca';
import { MenuMovil } from './menu-movil';
import './cabecera.css';

export function Cabecera({ actual, accion }: { actual?: string; accion?: ReactNode }) {
  const enlaces = [
    { href: '/#iniciativa', texto: 'La iniciativa', actual: false },
    { href: '/#proyectos', texto: 'Proyectos', actual: false },
    { href: '/equipo', texto: 'Equipo', actual: actual === '/equipo' },
  ];

  return (
    <header className="in-nav">
      <a href="/" aria-label="Reforma Digital, portada de la iniciativa">
        <Logotipo size={36} />
      </a>
      <nav aria-label="Navegación principal">
        {enlaces.map((enlace) => (
          <a
            key={enlace.href}
            className="boton-fantasma"
            href={enlace.href}
            aria-current={enlace.actual ? 'page' : undefined}
          >
            {enlace.texto}
          </a>
        ))}
        {!accion && (
          <a className="boton-claro" href="/#participar">
            Participar <Icono n="derecha" size={16} />
          </a>
        )}
      </nav>
      {accion}
      <MenuMovil enlaces={enlaces} />
    </header>
  );
}
