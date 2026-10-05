'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Github,
  MessageCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import Chat from '../../components/chat';
import HeroComposer from '../../landing/HeroComposer';
import DemoTransform from '../../landing/DemoTransform';
import { links } from '../../landing/site';
import './chat-landing.css';

function Marca() {
  return (
    <svg width="21" height="28" viewBox="0 0 144 192" aria-hidden="true">
      <path fill="currentColor" d="M48 0H96V48H48V96H96V144H48V192H0V48H48Z" />
      <path fill="#a50e0e" d="M0 48L48 0V48Z" />
      <rect x="96" y="48" width="48" height="48" fill="currentColor" />
      <rect x="96" y="144" width="48" height="48" fill="currentColor" />
    </svg>
  );
}

// Ilustraciones: piezas de la propia interfaz sobre un sol, sin dibujos genéricos.
function IlusLista() {
  return (
    <div className="cl-ilus" aria-hidden="true">
      <div className="cl-ilus-tarjeta">
        <span className="cl-ilus-titulo">Catálogo de servicios</span>
        {[1, 2, 3].map((n) => (
          <span key={n} className="cl-ilus-fila">
            <i /> <b />
          </span>
        ))}
        <span className="cl-ilus-salto">· · · 79 servicios más · · ·</span>
        <span className="cl-ilus-fila cl-ilus-destacada">
          Renta <small>puesto 83</small>
        </span>
        <span className="cl-ilus-fila">
          <i /> <b />
        </span>
      </div>
    </div>
  );
}

function IlusPregunta() {
  return (
    <div className="cl-ilus" aria-hidden="true">
      <div className="cl-ilus-tarjeta">
        <span className="cl-ilus-pregunta">¿Dónde pido cita para el DNI?</span>
        <span className="cl-ilus-paso">
          <em>1</em> Pide cita previa en la web de la Policía Nacional.
        </span>
        <span className="cl-ilus-cita">
          Policía Nacional <ArrowUpRight size={13} />
        </span>
        <span className="cl-ilus-boton">
          Abrir la web oficial <ArrowUpRight size={15} />
        </span>
      </div>
    </div>
  );
}

function IlusDatos() {
  return (
    <div className="cl-ilus" aria-hidden="true">
      <div className="cl-ilus-tarjeta">
        <span className="cl-ilus-texto">
          Me llamo <u>Ana García</u> y quiero renovar el DNI.
        </span>
        <span className="cl-ilus-chip">
          <ShieldCheck size={15} /> 1 dato personal ocultado
        </span>
        <span className="cl-ilus-nota">Se protege en tu navegador antes de enviar nada.</span>
      </div>
    </div>
  );
}

const nunca = [
  'No rellena tus datos',
  'No resuelve el CAPTCHA',
  'No entra en Cl@ve por ti',
  'No envía formularios',
  'No guarda lo que escribes',
  'No tiene servidores propios',
];

const webs = [
  ['DNI y pasaporte', 'Cita previa'],
  ['Agencia Tributaria', 'Asistencia y Cita'],
  ['Registro de asociaciones', 'Consulta de denominaciones'],
];

export default function ChatLanding() {
  const [conversation, setConversation] = useState<string | null>(null);
  const [chatKey, setChatKey] = useState(0);
  if (conversation !== null) {
    return (
      <div className="sol">
        <Chat
          key={chatKey}
          initialQuestion={conversation}
          onGoHome={() => {
            setConversation(null);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
          onNewConversation={() => {
            setConversation('');
            setChatKey((value) => value + 1);
          }}
        />
      </div>
    );
  }
  return (
    <div className="cl">
      <section className="cl-hero" aria-labelledby="cl-titulo">
        <header className="cl-cab">
          <a className="cl-marca" href="/versiones/ilustraciones-y-demo">
            <Marca /> Reforma Digital
          </a>
          <a className="cl-boton cl-boton-claro" href={links.install}>
            <Download size={18} aria-hidden="true" /> Descargar extensión
          </a>
        </header>
        <div className="cl-hero-centro">
          <h1 id="cl-titulo">¿Qué necesitas hacer?</h1>
          <HeroComposer onAsk={(query) => setConversation(query)} />
          <p>
            Pregunta con tus palabras. Te decimos qué organismo se encarga y te enlazamos a su web
            oficial.
          </p>
        </div>
        <a className="cl-mas" href="#proyecto">
          Quiero saber más <ArrowDown size={18} aria-hidden="true" />
        </a>
      </section>

      <main id="main" className="cl-cuerpo">
        <section id="proyecto" className="cl-intro" aria-labelledby="cl-roto">
          <p className="cl-antetitulo">
            Proyecto independiente, sin vinculación con la Administración
          </p>
          <h2 id="cl-roto">El sistema en España está roto.</h2>
          <p>
            Hacer un trámite por internet no debería exigir saber cómo funciona la Administración.
            Las webs públicas están pensadas para quien ya conoce el procedimiento; el resto pierde
            horas, comete errores o paga a un gestor. Reforma Digital es una iniciativa abierta para
            arreglarlo, paso a paso.
          </p>
        </section>

        <section className="cl-paso" aria-labelledby="cl-p1">
          <span className="cl-num" aria-hidden="true">
            01
          </span>
          <div>
            <div className="cl-paso-cabeza">
              <div>
                <h2 id="cl-p1">Digitalizar un trámite no lo hace sencillo</h2>
                <p>
                  El catálogo de ayuda de la Agencia Tributaria lo demuestra: todo está en internet,
                  pero encontrar lo que necesitas sigue siendo cosa de expertos.
                </p>
              </div>
              <IlusLista />
            </div>
            <dl className="cl-cifras">
              <div>
                <dt>89</dt>
                <dd>servicios en una sola página, sin buscador</dd>
              </div>
              <div>
                <dt>83</dt>
                <dd>es el puesto de la Renta en esa lista</dd>
              </div>
              <div>
                <dt>20</dt>
                <dd>servicios aparecen dos veces</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="cl-paso" aria-labelledby="cl-p2">
          <span className="cl-num" aria-hidden="true">
            02
          </span>
          <div>
            <div className="cl-paso-cabeza">
              <div>
                <h2 id="cl-p2">Primero, saber a dónde ir</h2>
                <p>
                  Antes de rellenar nada hay que saber qué organismo se encarga. El buscador de
                  arriba responde con tus palabras y te lleva a la página oficial correcta, citando
                  siempre la fuente.
                </p>
                <a className="cl-enlace" href="#cl-titulo">
                  Hacer una pregunta <ArrowUpRight size={18} aria-hidden="true" />
                </a>
              </div>
              <IlusPregunta />
            </div>
          </div>
        </section>

        <section className="cl-paso" aria-labelledby="cl-p3">
          <span className="cl-num" aria-hidden="true">
            03
          </span>
          <div>
            <h2 id="cl-p3">Después, una capa clara sobre la web oficial</h2>
            <p>
              La extensión para Chrome ordena la pantalla que ya estás usando. La web oficial sigue
              validando tus datos y haciendo el envío, y puedes volver al original con un botón.
            </p>
            <div id="demo" className="cl-demo">
              <p className="cl-demo-guia">
                Es el catálogo real de la Agencia Tributaria, con sus 89 servicios. Pulsa{' '}
                <b>Mejorada</b> y busca «renta».
              </p>
              <DemoTransform compact initialView="legacy" />
            </div>
            <ul className="cl-webs" aria-label="Dónde funciona ya">
              {webs.map(([nombre, pantalla]) => (
                <li key={nombre}>
                  <span>
                    {nombre}
                    <small>{pantalla}</small>
                  </span>
                  <span className="cl-estado">Experimental</span>
                </li>
              ))}
            </ul>
            <a className="cl-boton cl-boton-oscuro" href={links.install}>
              <Download size={18} aria-hidden="true" /> Descargar la extensión para Chrome
            </a>
          </div>
        </section>

        <section className="cl-paso" aria-labelledby="cl-p4">
          <span className="cl-num" aria-hidden="true">
            04
          </span>
          <div>
            <div className="cl-paso-cabeza">
              <div>
                <h2 id="cl-p4">Sin tocar lo que importa</h2>
                <p>
                  Ayuda a entender, pero tus datos y tus decisiones siguen siendo tuyos. Los datos
                  personales se ocultan en tu navegador antes de preguntar.
                </p>
              </div>
              <IlusDatos />
            </div>
            <ul className="cl-nunca">
              {nunca.map((item) => (
                <li key={item}>
                  <XCircle size={20} aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="cl-pie">
        <div className="cl-pie-bloque">
          <h2>Lo público es de todos. Su web, también.</h2>
          <ul className="cl-acciones">
            <li>
              <a href={links.contributing}>
                Cuéntanos dónde te atascaste <MessageCircle size={18} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a href={links.repo}>
                Ver el código en GitHub <Github size={18} aria-hidden="true" />
              </a>
            </li>
          </ul>
        </div>
        <div className="cl-pie-legal">
          <span className="cl-marca">
            <Marca /> Reforma Digital
          </span>
          <nav aria-label="Más información">
            <a href="/propuesta">La propuesta</a>
            <a href="/how-it-works">Cómo funciona</a>
            <a href="/sources">Fuentes oficiales</a>
            <a href="/privacy">Privacidad</a>
            <a href={links.license}>Licencia MIT</a>
          </nav>
          <small>Las adaptaciones son experimentales. La web oficial manda siempre.</small>
        </div>
      </footer>
    </div>
  );
}
