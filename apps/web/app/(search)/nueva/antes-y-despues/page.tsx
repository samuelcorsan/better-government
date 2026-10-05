import type { Metadata } from 'next';
import { AntesDespues } from '../../../../components/sol/antes-despues';
import { Cabecera } from '../../../../components/sol/cabecera';
import { fuentesSol } from '../../../../components/sol/fuentes';
import { Pie } from '../../../../components/sol/pie';
import '../../../../components/sol/tokens.css';
import '../../../../components/sol/botones.css';

export const metadata: Metadata = {
  title: 'Antes y después — Reforma Digital',
  robots: { index: false, follow: false },
};

export default function AntesYDespuesPage() {
  return (
    <div className={`sol-raiz ${fuentesSol}`}>
      <a className="sol-salto" href="#main">
        Saltar al contenido
      </a>
      <Cabecera />
      <main id="main" tabIndex={-1}>
        <AntesDespues />
      </main>
      <Pie />
    </div>
  );
}
