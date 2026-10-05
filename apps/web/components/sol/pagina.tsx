'use client';

// La portada Sol completa. El hero cambia según la prop; el resto de la página es el mismo.
import { useState } from 'react';
import { links } from '../../landing/site';
import { Cabecera } from './cabecera';
import { ChatDemo } from './chat/chat-demo';
import { Datos } from './datos';
import { Demo } from './demo';
import { fuentesSol } from './fuentes';
import { HeroChat } from './hero-chat';
import { HeroExtension } from './hero-extension';
import { HeroProblema } from './hero-problema';
import { Icono } from './icono';
import { Pie } from './pie';
import { Problema } from './problema';
import { Recorrido } from './recorrido';
import './tokens.css';
import './botones.css';
import './pagina.css';

export type Hero = 'chat' | 'problema' | 'extension';

const webs = [
  ['DNI y pasaporte', 'Cita previa'],
  ['Agencia Tributaria', 'Asistencia y cita'],
  ['Registro de asociaciones', 'Consulta de denominaciones'],
] as const;

export function Pagina({ hero }: { hero: Hero }) {
  // null: la página; '' o texto: el chat, vacío o con la primera pregunta.
  const [pregunta, setPregunta] = useState<string | null>(null);

  // El hero y el chat se sustituyen: el foco va a <main> para no perderse en <body>.
  const cambiar = (siguiente: string | null) => {
    setPregunta(siguiente);
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => document.getElementById('main')?.focus({ preventScroll: true }));
  };
  const abrir = (texto = '') => cambiar(texto);
  const salto = (
    <a className="sol-salto" href="#main">
      Saltar al contenido
    </a>
  );

  if (pregunta !== null) {
    return (
      <div className={`sol-raiz ${fuentesSol}`}>
        {salto}
        <main id="main" tabIndex={-1}>
          <ChatDemo inicial={pregunta || undefined} onHome={() => cambiar(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className={`sol-raiz ${fuentesSol}`}>
      {salto}
      <main id="main" tabIndex={-1}>
        {hero === 'chat' && <HeroChat onAsk={abrir} />}
        {hero === 'problema' && <HeroProblema onAsk={() => abrir()} />}
        {hero === 'extension' && (
          <>
            <Cabecera />
            <HeroExtension onAsk={() => abrir()} />
          </>
        )}

        <div id="contenido" className="pg-contenido">
          <Problema titular={hero !== 'problema'} />
          <Recorrido />
          <Demo />
          <Datos />

          <section className="pg-donde" aria-labelledby="pg-donde-titulo">
            <div className="pg-donde-texto">
              <h2 id="pg-donde-titulo" className="t-titular-m">
                Dónde funciona ya
              </h2>
              <p className="t-texto-l">
                La extensión ordena estas webs oficiales. Los formularios, la firma y el envío
                siguen siendo los suyos.
              </p>
              <a className="boton" href={links.install}>
                <Icono n="descargar" /> Descargar la extensión para Chrome
              </a>
            </div>
            <ul className="pg-webs caja-gris">
              {webs.map(([nombre, pantalla]) => (
                <li key={nombre} className="caja-plana">
                  <span className="pg-web">
                    {nombre}
                    <small>{pantalla}</small>
                  </span>
                  <span className="t-etiqueta pg-estado">Experimental</span>
                </li>
              ))}
            </ul>
          </section>

          <a className="pg-antes caja-tinta" href="/nueva/antes-y-despues">
            <span className="t-etiqueta pg-antes-etiqueta">Antes y después</span>
            <span className="t-titular-m pg-antes-titulo">Hoy, y con Reforma Digital</span>
            <span className="pg-antes-texto">
              Tres momentos de un trámite: la web de hoy al lado de lo que te enseñamos nosotros.
            </span>
            <span className="pg-antes-flecha" aria-hidden="true">
              <Icono n="derecha" size={20} />
            </span>
          </a>
        </div>
      </main>
      <Pie />
    </div>
  );
}
