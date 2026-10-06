'use client';

import { useState } from 'react';
import Chat from '../../../components/chat';
import { Icono } from '../../../components/sol/icono';
import { Cabecera } from '../../../components/sol/cabecera';
import './buscador.css';

export function Buscador({ mode }: { mode: 'preview' | 'live' }) {
  const [conversation, setConversation] = useState(0);
  const nueva = () => setConversation((value) => value + 1);

  return (
    <div className="buscador">
      <Chat
        key={conversation}
        initialQuestion=""
        header={
          <Cabecera
            accion={
              <button
                className="bs-nueva"
                type="button"
                onClick={nueva}
                aria-label="Nueva conversación"
              >
                <span>Nueva conversación</span> <Icono n="nueva" size={18} />
              </button>
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
