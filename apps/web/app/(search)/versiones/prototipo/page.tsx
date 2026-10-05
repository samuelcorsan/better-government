import type { Metadata } from 'next';
import { fuentesSol } from '../../../../components/sol/fuentes';
import '../../../../components/sol/tokens.css';
import Harness from '../../../../versiones/prototipo/harness';

export const metadata: Metadata = {
  title: 'Versión · Escaparate, Recorrido y Antes y después',
  robots: { index: false, follow: false },
};

export default function PrototipoPage() {
  return (
    <div className={fuentesSol}>
      <Harness />
    </div>
  );
}
