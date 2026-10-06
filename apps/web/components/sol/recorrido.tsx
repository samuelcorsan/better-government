'use client';

// Recorrido: cuatro pasos que se leen al bajar y un escenario fijo que los acompaña.
// El paso activo es el que cruza la mitad de la pantalla: el scroll manda, nunca se secuestra.
import { useId } from 'react';
import Image from 'next/image';
import catalogo from '../../landing/assets/screens/original-2-catalogo.png';
import { catalogo as cifras } from './catalogo';
import { Icono } from './icono';
import { RecorridoScroll } from './recorrido-scroll';

const pregunta = '¿Dónde pido cita para la renta?';
const { resultadosRenta: resultados, renta: puestoRenta, total } = cifras;

const pasos = [
  {
    titulo: 'Preguntas',
    texto: 'Escribe lo que necesitas con tus palabras, como se lo contarías a alguien.',
  },
  {
    titulo: 'Te respondemos con fuentes',
    texto: 'Pasos claros, el organismo que se encarga y de dónde sale cada dato.',
  },
  {
    titulo: 'Abres la web oficial',
    texto: `La de siempre. El catálogo de Hacienda tiene ${total} servicios en una sola página y la Renta está en el puesto ${puestoRenta}.`,
  },
  {
    titulo: 'La extensión la ordena',
    texto: `Pone un buscador encima. Escribes «renta» y salen ${resultados.length} resultados. El envío sigue siendo oficial.`,
  },
];

const dosCifras = (n: number) => String(n).padStart(2, '0');

function Navegador({ children }: { children: React.ReactNode }) {
  return (
    <div className="rc-navegador">
      <div className="rc-navegador-barra">
        <i />
        <i />
        <i />
        <span className="rc-url t-dato">
          <Icono n="candado" size={12} />
          www2.agenciatributaria.gob.es
        </span>
      </div>
      <div className="rc-navegador-cuerpo">{children}</div>
    </div>
  );
}

// Escenas: piezas de la interfaz, decorativas. El texto de cada paso ya cuenta lo que muestran.
export function EscenaRecorrido({ n }: { n: number }) {
  if (n === 0)
    return (
      <div className="rc-pieza rc-hero">
        <span className="rc-hero-titulo">¿Qué necesitas hacer?</span>
        <span className="rc-compositor">
          <span className="rc-compositor-texto">{pregunta}</span>
          <span className="rc-enviar">
            <Icono n="enviar" size={18} />
          </span>
        </span>
      </div>
    );
  if (n === 1)
    return (
      <div className="rc-pieza rc-sobre-sol">
        <div className="rc-respuesta caja-flota">
          <span className="rc-burbuja">{pregunta}</span>
          <span className="rc-respuesta-intro">
            Se pide en la Agencia Tributaria, desde su catálogo de servicios de asistencia.
          </span>
          <ol className="rc-lista">
            <li>
              <span className="rc-num t-dato">1</span> Abre el catálogo de servicios de asistencia.
            </li>
            <li>
              <span className="rc-num t-dato">2</span> Busca «Renta» y pulsa «Solicita asistencia y
              cita».
            </li>
            <li>
              <span className="rc-num t-dato">3</span> Ten a mano tu NIF.
            </li>
          </ol>
          <span className="rc-citas">
            <span className="pildora t-dato">
              <Icono n="fuentes" size={14} /> agenciatributaria.gob.es
            </span>
          </span>
          <span className="rc-abrir">
            Abrir la web oficial <Icono n="externo" size={16} />
          </span>
        </div>
      </div>
    );
  if (n === 2)
    return (
      <div className="rc-pieza rc-sobre-sol rc-pieza-web">
        <Navegador>
          <Image src={catalogo} alt="" sizes="(min-width: 960px) 640px, 100vw" />
        </Navegador>
        <span className="rc-marca-puesto">
          <Icono n="abajo" size={16} />
          La Renta está en el puesto <b className="t-dato">{puestoRenta}</b> de{' '}
          <span className="t-dato">{total}</span>
        </span>
      </div>
    );
  return (
    <div className="rc-pieza rc-sobre-sol rc-pieza-web">
      <Navegador>
        <div className="rc-ordenada">
          <span className="t-etiqueta rc-ordenada-etiqueta">
            Catálogo de servicios de asistencia
          </span>
          <span className="rc-buscador">
            <Icono n="buscar" size={16} />
            <span className="rc-buscador-texto">renta</span>
            <span className="rc-buscador-cuenta t-dato">
              {resultados.length} de {total}
            </span>
          </span>
          <span className="rc-resultados">
            {resultados.map((s) => (
              <span
                key={s.id}
                className="rc-resultado"
                data-elegido={s.name === 'Renta' ? '' : undefined}
              >
                <span className="rc-resultado-cat t-dato">{s.category}</span>
                <span className="rc-resultado-nombre">{s.name}</span>
              </span>
            ))}
          </span>
          <span className="rc-solicitar">
            <Icono n="calendario" size={16} /> Solicita asistencia y cita
          </span>
        </div>
      </Navegador>
    </div>
  );
}

export function Recorrido() {
  const titulo = useId();

  return (
    <RecorridoScroll
      tituloId={titulo}
      cabecera={
        <header className="rc-cabeza">
          <p className="t-etiqueta">Cómo funciona</p>
          <h2 id={titulo} className="t-titular-m">
            De tu pregunta a la web oficial, ordenada
          </h2>
        </header>
      }
      pasos={pasos.map((p, i) => ({
        titulo: p.titulo,
        etiqueta: (
          <span className="rc-paso-num t-dato" aria-hidden="true">
            {dosCifras(i + 1)}
          </span>
        ),
        texto: <p className="t-texto-l">{p.texto}</p>,
        escena: <EscenaRecorrido n={i} />,
      }))}
    />
  );
}
