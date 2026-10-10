import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Reforma Digital',
    short_name: 'Reforma Digital',
    description:
      'Herramientas y propuestas para una Administración más clara, accesible y sencilla.',
    lang: 'es-ES',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#df1717',
    categories: ['government', 'productivity', 'utilities'],
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'any' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };
}
