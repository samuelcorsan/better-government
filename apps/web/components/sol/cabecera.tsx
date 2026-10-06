import type { ReactNode } from 'react';
import { Icono } from './icono';
import { Logotipo } from './marca';
import './cabecera.css';

export function Cabecera({ actual, accion }: { actual?: string; accion?: ReactNode }) {
  return (
    <header className="in-nav">
      <a href="/" aria-label="Reforma Digital, portada de la iniciativa">
        <Logotipo size={36} />
      </a>
      <nav aria-label="Navegación principal">
        <a href="/#iniciativa">La iniciativa</a>
        <a href="/#proyectos">Proyectos</a>
        <a href="/equipo" aria-current={actual === '/equipo' ? 'page' : undefined}>
          Equipo
        </a>
        {accion ?? (
          <a href="/#participar">
            Participar <Icono n="derecha" size={16} />
          </a>
        )}
      </nav>
    </header>
  );
}
