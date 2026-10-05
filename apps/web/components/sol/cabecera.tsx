import { Logotipo } from './marca';
import './cabecera.css';

// Cabecera sobre blanco para las vistas sin cabecera propia (hero extensión, Antes y después).
export function Cabecera() {
  return (
    <header className="cabecera">
      <a
        className="cabecera-marca marca"
        href="/nueva"
        aria-label="Reforma Digital, ir a la portada"
      >
        <Logotipo />
      </a>
    </header>
  );
}
