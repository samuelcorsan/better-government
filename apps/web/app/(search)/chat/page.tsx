import type { Metadata } from 'next';
import { searchMode } from '../../../lib/search-mode';
import { Buscador } from './buscador';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Buscador de trámites · Reforma Digital',
  description: 'Pregunta con tus palabras y encuentra respuestas con fuentes oficiales.',
  robots: { index: false, follow: false },
};

export default function BuscadorPage() {
  return <Buscador mode={searchMode()} />;
}
