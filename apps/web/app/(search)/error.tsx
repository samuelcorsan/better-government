'use client';
import { PaginaInformativa } from '../../components/sol/pagina-informativa';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <PaginaInformativa lectura>
      <h1>No hemos podido cargar esta página.</h1>
      <p className="info-entradilla">Inténtalo de nuevo en un momento.</p>
      <button className="boton" onClick={reset}>
        Volver a intentar
      </button>
    </PaginaInformativa>
  );
}
