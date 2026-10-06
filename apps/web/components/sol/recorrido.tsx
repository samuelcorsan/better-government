// Representaciones decorativas del buscador y de la extensión, para los proyectos de la portada.
import { catalogo as cifras } from './catalogo';
import { Icono } from './icono';

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
          <Icono n="candado" size={12} />
          www2.agenciatributaria.gob.es
        </span>
      </div>
      <div className="rc-navegador-cuerpo">{children}</div>
    </div>
  );
}

// Escenas: piezas de la interfaz, decorativas. El texto de cada paso ya cuenta lo que muestran.
export function EscenaRecorrido({ proyecto }: { proyecto: 'buscador' | 'extension' }) {
  if (proyecto === 'buscador')
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
