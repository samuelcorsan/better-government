'use client';

// Prototipo desechable (/proto/sol). Nada de producción importa este directorio.
import type { ReactNode } from 'react';
import Image from 'next/image';
import { Github, LockKeyhole } from 'lucide-react';
import HeroComposer from '../../landing/HeroComposer';
import { links } from '../../landing/site';
import catalogo from '../../landing/assets/screens/original-2-catalogo.png';
import { Icono } from './iconos';

export function Marca() {
  return (
    <svg width="21" height="28" viewBox="0 0 144 192" aria-hidden="true">
      <path fill="currentColor" d="M48 0H96V48H48V96H96V144H48V192H0V48H48Z" />
      <path fill="#a50e0e" d="M0 48L48 0V48Z" />
      <rect x="96" y="48" width="48" height="48" fill="currentColor" />
      <rect x="96" y="144" width="48" height="48" fill="currentColor" />
    </svg>
  );
}

export const nunca = [
  'No rellena tus datos',
  'No resuelve el CAPTCHA',
  'No entra en Cl@ve por ti',
  'No envía formularios',
  'No guarda lo que escribes',
  'No tiene servidores propios',
];

export const webs = ['DNI y pasaporte', 'Agencia Tributaria', 'Registro de asociaciones'];

export function Hero({ onAsk }: { onAsk: (query: string) => void }) {
  return (
    <section className="cl-hero" aria-labelledby="cl-titulo">
      <header className="cl-cab">
        <a className="cl-marca" href="/versiones/prototipo">
          <Marca /> Reforma Digital
        </a>
        <a className="cl-boton cl-boton-claro" href={links.install}>
          <Icono n="descargar" /> Descargar extensión
        </a>
      </header>
      <div className="cl-hero-centro">
        <h1 id="cl-titulo">¿Qué necesitas hacer?</h1>
        <HeroComposer onAsk={onAsk} />
        <p>
          Pregunta con tus palabras. Te decimos qué organismo se encarga y te enlazamos a su web
          oficial.
        </p>
      </div>
      <a className="cl-mas" href="#contenido">
        Quiero saber más <Icono n="abajo" />
      </a>
    </section>
  );
}

export function Pie() {
  return (
    <footer className="cl-pie">
      <div className="cl-pie-bloque">
        <h2>Lo público es de todos. Su web, también.</h2>
        <ul className="cl-acciones">
          <li>
            <a href={links.contributing}>
              Cuéntanos dónde te atascaste <Icono n="contacto" />
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
        <small>Proyecto independiente. Las adaptaciones son experimentales.</small>
      </div>
    </footer>
  );
}

export function Navegador({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="pr-navegador">
      <div className="pr-navegador-barra" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>
          <LockKeyhole size={12} /> {url}
        </span>
      </div>
      <div className="pr-navegador-cuerpo">{children}</div>
    </div>
  );
}

export function CapturaCatalogo({ marca = true }: { marca?: boolean }) {
  return (
    <Navegador url="www2.agenciatributaria.gob.es">
      <div className="pr-captura">
        <Image
          src={catalogo}
          alt="Catálogo de servicios de asistencia de la Agencia Tributaria, tal y como estaba el 27 de septiembre de 2026."
          sizes="(min-width: 960px) 640px, 100vw"
        />
        {marca && (
          <span className="pr-pin">
            La Renta está en el puesto <b>83</b> de 89
          </span>
        )}
      </div>
    </Navegador>
  );
}

// Viñetas: piezas de la interfaz Sol, decorativas (el texto de al lado ya lo cuenta).
export function VinetaRespuesta({ ladeada = true }: { ladeada?: boolean }) {
  return (
    <div className={ladeada ? 'cl-ilus pr-ilus' : 'pr-plano'} aria-hidden="true">
      <div className="cl-ilus-tarjeta pr-tarjeta">
        <span className="cl-ilus-pregunta">¿Cómo renuevo el DNI?</span>
        <span className="cl-ilus-paso">
          <em>1</em> Pide cita previa en la web de la Policía Nacional.
        </span>
        <span className="cl-ilus-cita">
          Policía Nacional <Icono n="externo" size={13} />
        </span>
        <span className="cl-ilus-paso">
          <em>2</em> Acude a la oficina el día de la cita.
        </span>
        <span className="pr-datos">
          <span>Documentación</span>
          <span className="pr-datos-sol">Coste</span>
          <span>Plazos</span>
        </span>
        <span className="cl-ilus-boton">
          Abrir la web oficial <Icono n="externo" size={15} />
        </span>
      </div>
    </div>
  );
}

export function VinetaDatos() {
  return (
    <div className="cl-ilus pr-ilus" aria-hidden="true">
      <div className="cl-ilus-tarjeta pr-tarjeta">
        <span className="cl-ilus-texto">
          Me llamo <u>Ana García</u> y quiero renovar el DNI.
        </span>
        <span className="cl-ilus-chip">
          <Icono n="protegido" size={15} /> 1 dato personal ocultado
        </span>
        <span className="cl-ilus-nota">Se protege en tu navegador antes de enviar nada.</span>
      </div>
    </div>
  );
}

export function VinetaBusqueda() {
  return (
    <div className="pr-plano" aria-hidden="true">
      <div className="cl-ilus-tarjeta pr-tarjeta">
        <span className="pr-buscador">
          <Icono n="buscar" size={16} /> renta <small>3 de 89</small>
        </span>
        {[
          'Renta',
          'Impuesto sobre la Renta de No Residentes',
          'Impuesto sobre la Renta de no Residentes',
        ].map((s, i) => (
          <span key={i} className="pr-resultado">
            {s} <b>Solicita asistencia y cita</b>
          </span>
        ))}
        <span className="cl-ilus-nota">Nombres reales del catálogo. El último está repetido.</span>
      </div>
    </div>
  );
}

// 89 servicios del catálogo; el 83 es la Renta.
export function PuntosCatalogo() {
  return (
    <figure className="pr-puntos">
      <div role="img" aria-label="89 puntos, uno por servicio. El 83, la Renta, está resaltado.">
        {Array.from({ length: 89 }, (_, i) => (
          <i key={i} data-renta={i === 82 ? '' : undefined} />
        ))}
      </div>
      <figcaption>
        <b>89 servicios</b> en una sola página, sin buscador. El que buscas, la Renta, es el{' '}
        <b className="pr-amarillo">83</b>.
      </figcaption>
    </figure>
  );
}
