'use client';

import { useEffect, useState } from 'react';
import { Button } from '@reforma-digital/design/sol';
import Chat, { type LimitedRegion } from '../../../components/chat';
import { Icon } from '../../../components/sol/icon';
import { Header } from '../../../components/sol/header';
import { takePendingQuestion } from '../../../lib/pending-question';
import './chat-view.css';

export function ChatView({
  mode,
  limitedRegions,
}: {
  mode: 'preview' | 'live';
  limitedRegions: readonly LimitedRegion[];
}) {
  const [conversation, setConversation] = useState(0);
  const [initialQuestion, setInitialQuestion] = useState('');
  const nueva = () => {
    setInitialQuestion('');
    setConversation((value) => value + 1);
  };

  // sessionStorage solo existe en el navegador: se lee después de hidratar.
  useEffect(() => {
    const question = takePendingQuestion();
    if (question) setInitialQuestion(question);
  }, []);

  return (
    <div className="buscador">
      <Chat
        key={conversation}
        initialQuestion={initialQuestion}
        limitedRegions={limitedRegions}
        header={
          <Header
            action={
              <Button
                variant="secondary"
                className="bs-nueva"
                type="button"
                onClick={nueva}
                aria-label="Nueva conversación"
              >
                <span>Nueva conversación</span> <Icon name="nueva" size={18} />
              </Button>
            }
          />
        }
        footer={
          <footer className="bs-pie">
            <p>
              {mode === 'preview'
                ? 'Vista previa con fragmentos oficiales; la generación con IA no está activada.'
                : 'Comprueba las fuentes antes de realizar el trámite.'}
            </p>
            <nav aria-label="Información del buscador">
              <a href="/sources">Fuentes oficiales</a>
              <span aria-hidden="true">·</span>
              <a href="/privacy">Privacidad</a>
            </nav>
          </footer>
        }
      />
    </div>
  );
}
