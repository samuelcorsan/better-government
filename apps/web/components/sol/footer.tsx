import Link from 'next/link';
import { Button } from '@reforma-digital/design/sol';
import { links } from '../../lib/site';
import { Icon } from './icon';
import { Logo } from './logo';
import './footer.css';

const secciones = [
  ['La iniciativa', '/#iniciativa'],
  ['Buscador', '/chat'],
  ['Equipo', '/equipo'],
  ['Cómo funciona', '/how-it-works'],
  ['Fuentes oficiales', '/sources'],
] as const;

export function Footer() {
  return (
    <footer className="pie" aria-labelledby="pie-titulo">
      <div className="pie-sol">
        <h2 id="pie-titulo" className="pie-titulo">
          Lo público es de todos. Su web, también.
        </h2>
        <div className="pie-acciones">
          <Button href={links.contributing}>
            <Icon name="contacto" /> Cuéntanos dónde te atascaste
          </Button>
          <Button variant="secondary" href={links.repo}>
            Ver el código en GitHub <Icon name="externo" size={16} />
          </Button>
        </div>
        <div className="pie-legal">
          <span className="pie-marca marca">
            <Logo />
          </span>
          <nav aria-label="Secciones">
            <ul>
              {secciones.map(([texto, href]) => (
                <li key={href}>
                  <Link href={href} prefetch={false}>
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="pie-nota">Proyecto independiente. Las adaptaciones son experimentales.</p>
          <nav className="pie-nota" aria-label="Información legal">
            <ul>
              <li>
                <Link href="/privacy" prefetch={false}>
                  Privacidad
                </Link>
              </li>
              <li>
                <a href={links.license}>Licencia MIT</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
