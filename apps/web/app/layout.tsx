import { Analytics } from '@vercel/analytics/next';
import type { Metadata, Viewport } from 'next';
import { fuentesSol } from '../components/sol/fuentes';
import { RouteFocus } from '../components/route-focus';
import { pageMetadata } from '../lib/seo';
import { siteUrl } from '../lib/site';
import './(search)/globals.css';

// Valores por defecto para las páginas sin metadatos propios. Sin canonical: cada página declara
// el suyo, y heredarlo haría que una 404 apuntara a la portada.
export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Reforma Digital · Lo público, a la altura de las personas',
    description:
      'Creamos herramientas y propuestas para hacer más clara, accesible y sencilla nuestra relación con lo público.',
    path: '/',
    og: 'portada',
  }),
  alternates: null,
  metadataBase: siteUrl,
  robots: {
    index: true,
    follow: true,
    googleBot: { 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};
export const viewport: Viewport = { themeColor: '#df1717' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-bg-landing="" data-scroll-behavior="smooth">
      <body className={`sol-raiz ${fuentesSol}`}>
        <a className="sol-salto" href="#main">
          Saltar al contenido
        </a>
        <RouteFocus />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
