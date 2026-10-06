import type { Metadata } from 'next';
import { fuentesSol } from '../../../components/sol/fuentes';
import '../../../components/sol/tokens.css';
import './versiones.css';

export const metadata: Metadata = {
  title: 'Versiones de la portada · Reforma Digital',
  robots: { index: false, follow: false },
};

// Índice de todas las versiones de la portada propuestas, para compararlas y decidir.
const versiones = [
  {
    href: '/versiones/iniciativa',
    nombre: 'Sol · La iniciativa y sus proyectos',
    texto:
      'Portada centrada en la iniciativa: qué queremos mejorar, los proyectos y cómo participar.',
  },
  {
    href: '/versiones/iniciativa/core-team',
    nombre: 'Sol · Core team',
    texto: 'Las personas detrás de Reforma Digital y una invitación a construir en comunidad.',
  },
  {
    href: '/versiones/iniciativa/buscador',
    nombre: 'Sol · Buscador y chatbot',
    texto: 'Página propia para consultar trámites, con el chat actual y el nuevo diseño.',
  },
  {
    href: '/nueva',
    nombre: 'Sol v2 · Portada completa',
    texto:
      'La versión más reciente: hero con chat, el problema con datos, recorrido, demo y datos.',
  },
  {
    href: '/proto/sol',
    nombre: 'Sol v2 · Tres heroes',
    texto:
      'La misma portada con hero Chat, Problema o Extensión, y el chat en modo panel (teclas 1–4).',
  },
  {
    href: '/nueva/antes-y-despues',
    nombre: 'Sol v2 · Antes y después',
    texto: 'Página aparte con la comparativa «Hoy / Con Reforma Digital».',
  },
  {
    href: '/versiones/ilustraciones-y-demo',
    nombre: 'Ilustraciones y demo',
    texto: 'Versión anterior: pasos 01–04 con ilustraciones y la demo Original/Mejorada.',
  },
  {
    href: '/versiones/prototipo?v=1',
    nombre: 'Escaparate',
    texto: 'Versión anterior: la imagen manda, una frase por bloque, alternando lados.',
  },
  {
    href: '/versiones/prototipo?v=2',
    nombre: 'Recorrido (con botones)',
    texto: 'Versión anterior: un escenario que cambia al pulsar cada paso.',
  },
  {
    href: '/versiones/prototipo?v=3',
    nombre: 'Antes y después (primera)',
    texto: 'Versión anterior: cada problema como pareja «Hoy» frente a «Con Reforma Digital».',
  },
];

export default function VersionesPage() {
  return (
    <main className={`sol-raiz ${fuentesSol} vs`}>
      <p className="t-etiqueta">Propuestas de portada</p>
      <h1 className="t-titular-m">Todas las versiones</h1>
      <p className="t-texto-l vs-intro">
        Cada versión funciona por separado. Las anteriores se conservan para comparar; la más
        reciente es Sol v2.
      </p>
      <ul className="vs-lista">
        {versiones.map((v) => (
          <li key={v.href}>
            <a href={v.href} className="caja-gris vs-item">
              <span className="vs-nombre">{v.nombre}</span>
              <span className="vs-texto">{v.texto}</span>
              <span className="t-dato vs-ruta">{v.href}</span>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
