import type { Metadata } from 'next';
import { regionSchema } from '@reforma-digital/core';
import { sources } from '@reforma-digital/government';
import { searchMode } from '../../../lib/search-mode';
import { limitedSourceCoverage } from '../../../lib/source-coverage';
import { ChatView } from './chat-view';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Buscador de trámites · Reforma Digital',
  description: 'Pregunta con tus palabras y encuentra respuestas con fuentes oficiales.',
  robots: { index: false, follow: false },
};

// Se calcula en el servidor: la geometría del mapa solo viaja al cliente al abrirlo.
const limitedRegions = regionSchema.options.flatMap((id) => {
  const region = limitedSourceCoverage(sources, id);
  return region ? [{ id, name: region.name, sourceCount: region.sources.length }] : [];
});

export default function ChatPage() {
  return <ChatView mode={searchMode()} limitedRegions={limitedRegions} />;
}
