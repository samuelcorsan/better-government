import Link from 'next/link';
import { InfoPage } from '../components/sol/info-page';
export default function NotFound() {
  return (
    <InfoPage narrow>
      <p className="t-etiqueta info-etiqueta">Página no encontrada</p>
      <h1>Por aquí no era.</h1>
      <p className="info-entradilla">
        No encontramos esta página. Vuelve al buscador para encontrar tu trámite.
      </p>
      <Link className="boton" href="/chat">
        Ir al buscador
      </Link>
    </InfoPage>
  );
}
