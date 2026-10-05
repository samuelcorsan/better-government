import type { Metadata } from 'next';
import { fuentesSol } from '../../../../components/sol/fuentes';
import '../../../../components/sol/tokens.css';
import ChatLanding from '../../../../versiones/ilustraciones/chat-landing';

export const metadata: Metadata = {
  title: 'Versión · Ilustraciones y demo',
  robots: { index: false, follow: false },
};

export default function IlustracionesPage() {
  return (
    <div className={fuentesSol}>
      <ChatLanding />
    </div>
  );
}
