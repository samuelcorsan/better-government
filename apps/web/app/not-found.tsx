import { PaginaInformativa } from '../components/sol/pagina-informativa';
export default function NotFound() {
  return (
    <PaginaInformativa lectura>
      <p className="t-etiqueta info-etiqueta">Página no encontrada</p>
      <h1>Por aquí no era.</h1>
      <p className="info-entradilla">
        No encontramos esta página. Vuelve al buscador para encontrar tu trámite.
      </p>
      <a href="/chat" className="boton">
        Ir al buscador
      </a>
    </PaginaInformativa>
  );
}
