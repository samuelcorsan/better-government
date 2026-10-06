import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { fuentesSol } from '../components/sol/fuentes';
import './(search)/globals.css';
import '../components/sol/tokens.css';
import '../components/sol/botones.css';
export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || 'http://localhost:3000'),
  title: 'Reforma Digital · Lo público, a la altura de las personas',
  description:
    'Una iniciativa abierta para mejorar nuestra relación con la Administración, con proyectos construidos en comunidad.',
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'Reforma Digital · Lo público, a la altura de las personas',
    description:
      'Creamos herramientas y propuestas para hacer más clara, accesible y sencilla nuestra relación con lo público.',
    images: ['/og.png'],
    locale: 'es_ES',
    type: 'website',
  },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-bg-landing="">
      <body className={`sol-raiz ${fuentesSol}`}>
        <a className="sol-salto" href="#main">
          Saltar al contenido
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
