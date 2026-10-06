'use client';

import { useState } from 'react';
import Chat from '../../../../../components/chat';
import { fuentesSol } from '../../../../../components/sol/fuentes';
import { Icono } from '../../../../../components/sol/icono';
import { Logotipo } from '../../../../../components/sol/marca';
import '../../../../../components/sol/tokens.css';
import '../iniciativa.css';
import './buscador.css';

export function Buscador({ mode }: { mode: 'preview' | 'live' }) {
  const [conversation, setConversation] = useState(0);
  const nueva = () => setConversation((value) => value + 1);

  return (
    <div className={`sol-raiz ${fuentesSol} iniciativa buscador`}>
      <a className="sol-salto" href="#main">
        Saltar al contenido
      </a>
      <Chat
        key={conversation}
        initialQuestion=""
        onNewConversation={nueva}
        onGoHome={() => window.location.assign('/versiones/iniciativa')}
        header={
          <header className="bs-cabecera in-nav">
            <a href="/versiones/iniciativa" aria-label="Reforma Digital, portada de la iniciativa">
              <Logotipo size={36} />
            </a>
            <nav aria-label="Navegación principal">
              <a href="/versiones/iniciativa#iniciativa">La iniciativa</a>
              <a href="/versiones/iniciativa#proyectos">Proyectos</a>
              <a href="/versiones/iniciativa/core-team">Equipo</a>
              <button
                className="bs-nueva"
                type="button"
                onClick={nueva}
                aria-label="Nueva conversación"
              >
                <span>Nueva conversación</span> <Icono n="nueva" size={18} />
              </button>
            </nav>
          </header>
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
