'use client';
import { Button } from '@reforma-digital/design/sol';
import { InfoPage } from '../../components/sol/info-page';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <InfoPage narrow>
      <h1>No hemos podido cargar esta página.</h1>
      <p className="info-entradilla">Inténtalo de nuevo en un momento.</p>
      <Button onClick={reset}>Volver a intentar</Button>
    </InfoPage>
  );
}
