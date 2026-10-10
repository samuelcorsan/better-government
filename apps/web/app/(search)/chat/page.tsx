import type { Metadata } from 'next';
import { regionSchema } from '@reforma-digital/core';
import { sources } from '@reforma-digital/government';
import { pageMetadata } from '../../../lib/seo';
import { searchMode } from '../../../lib/search-mode';
import { limitedSourceCoverage } from '../../../lib/source-coverage';
import { ChatView } from './chat-view';

export const dynamic = 'force-dynamic';
// Sin indexar: cada conversación es distinta. Se comparte con su propia imagen.
export const metadata: Metadata = pageMetadata({
  title: 'Buscador de trámites con fuentes oficiales · Reforma Digital',
  description:
    'Pregunta con tus palabras por un trámite, una ayuda o un impuesto y recibe una respuesta con enlaces a fuentes oficiales que puedes comprobar.',
  path: '/chat',
  og: 'buscador',
  index: false,
});

// Se calcula en el servidor: la geometría del mapa solo viaja al cliente al abrirlo.
const limitedRegions = regionSchema.options.flatMap((id) => {
  const region = limitedSourceCoverage(sources, id);
  return region ? [{ id, name: region.name, sourceCount: region.sources.length }] : [];
});

export default function ChatPage() {
  return <ChatView mode={searchMode()} limitedRegions={limitedRegions} />;
}
