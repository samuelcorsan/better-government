import type { Metadata } from 'next';
import { Pagina } from '../../../components/sol/pagina';

export const metadata: Metadata = {
  title: 'Reforma Digital — Propuesta de portada',
  robots: { index: false, follow: false },
};

export default function NuevaPage() {
  return <Pagina hero="chat" />;
}
