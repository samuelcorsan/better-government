'use client';

// Escenas del buscador y de la extensión, para los proyectos de la portada.
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@reforma-digital/design/sol';
import { savePendingQuestion } from '../../lib/pending-question';
import { catalogo as cifras } from './catalogo';
import { Icon } from './icon';

const pregunta = '¿Dónde pido cita para la renta?';
const { resultadosRenta: resultados, total } = cifras;

function Navegador({ children }: { children: React.ReactNode }) {
  return (
    <div className="rc-navegador">
      <div className="rc-navegador-barra">
        <i />
        <i />
        <i />
        <span className="rc-url t-dato">
          <Icon name="candado" size={12} />
          www2.agenciatributaria.gob.es
        </span>
      </div>
      <div className="rc-navegador-cuerpo">{children}</div>
    </div>
  );
}

// El compositor de la portada abre el chat con la pregunta. Sin JavaScript, el formulario solo
// abre /chat: el campo no tiene name para que la pregunta no viaje en la URL.
function Compositor() {
  const id = useId();
  const router = useRouter();
  const [texto, setTexto] = useState('');
  return (
    <form
      className="rc-pieza rc-hero"
      action="/chat"
      onSubmit={(e) => {
        e.preventDefault();
        savePendingQuestion(texto.trim());
        router.push('/chat');
      }}
    >
      <label className="rc-hero-titulo" htmlFor={id}>
        ¿Qué necesitas hacer?
      </label>
      <span className="rc-compositor">
        <input
          id={id}
          className="rc-compositor-texto"
          type="text"
          autoComplete="off"
          placeholder={pregunta}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <Button
          variant="send"
          type="submit"
          aria-label="Enviar pregunta"
          disabled={texto.trim().length < 4}
        >
          <Icon name="enviar" size={20} />
        </Button>
      </span>
    </form>
  );
}

// Escenas: piezas de la interfaz. Solo el compositor del buscador es real; el resto es decorativo
// y el texto de cada paso ya cuenta lo que muestra.
export function ProjectScene({ project }: { project: 'search' | 'extension' }) {
  if (project === 'search') return <Compositor />;

  return (
    <div className="rc-pieza rc-sobre-sol rc-pieza-web" aria-hidden="true">
      <Navegador>
        <div className="rc-ordenada">
          <span className="t-etiqueta rc-ordenada-etiqueta">
            Catálogo de servicios de asistencia
          </span>
          <span className="rc-buscador">
            <Icon name="buscar" size={16} />
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
            <Icon name="calendario" size={16} /> Solicita asistencia y cita
          </span>
        </div>
      </Navegador>
    </div>
  );
}
