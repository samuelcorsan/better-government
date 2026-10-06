import { links } from '../../lib/site';
import { Icono } from './icono';
import { Logotipo } from './marca';
import './pie.css';

const legal = [
  ['La iniciativa', '/#iniciativa'],
  ['Buscador', '/chat'],
  ['Equipo', '/equipo'],
  ['Cómo funciona', '/how-it-works'],
  ['Fuentes oficiales', '/sources'],
  ['Privacidad', '/privacy'],
  ['Licencia MIT', links.license],
] as const;

export function Pie() {
  return (
    <footer className="pie" aria-labelledby="pie-titulo">
      <div className="pie-sol">
        <h2 id="pie-titulo" className="pie-titulo">
          Lo público es de todos. Su web, también.
        </h2>
        <div className="pie-acciones">
          <a className="boton" href={links.contributing}>
            <Icono n="contacto" /> Cuéntanos dónde te atascaste
          </a>
          <a className="boton-claro" href={links.repo}>
            Ver el código en GitHub <Icono n="externo" size={16} />
          </a>
        </div>
        <div className="pie-legal">
          <span className="pie-marca marca">
            <Logotipo />
          </span>
          <nav aria-label="Información legal">
            <ul>
              {legal.map(([texto, href]) => (
                <li key={href}>
                  <a href={href}>{texto}</a>
                </li>
              ))}
            </ul>
          </nav>
          <p>Proyecto independiente. Las adaptaciones son experimentales.</p>
        </div>
      </div>
    </footer>
  );
}
