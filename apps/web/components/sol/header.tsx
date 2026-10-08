import type { ReactNode } from 'react';
import Link from 'next/link';
import { Icon } from './icon';
import { Logo } from './logo';
import './header.css';

export function Header({ current, action }: { current?: string; action?: ReactNode }) {
  return (
    <header className="in-nav">
      <Link href="/" aria-label="Reforma Digital, portada de la iniciativa">
        <Logo size={36} />
      </Link>
      <nav aria-label="Navegación principal">
        <Link href="/#iniciativa">La iniciativa</Link>
        <Link href="/#proyectos">Proyectos</Link>
        <Link href="/equipo" aria-current={current === '/equipo' ? 'page' : undefined}>
          Equipo
        </Link>
        {action ?? (
          <Link className="boton-claro" href="/#participar">
            Participar <Icon name="derecha" size={16} />
          </Link>
        )}
      </nav>
    </header>
  );
}
