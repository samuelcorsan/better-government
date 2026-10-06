import type { Metadata } from 'next';
import { Icono } from '../../../components/sol/icono';
import { Cabecera } from '../../../components/sol/cabecera';
import { links } from '../../../lib/site';
import './core-team.css';
import { getContributors } from './contributors';

export const metadata: Metadata = {
  title: 'Core team · Reforma Digital',
  description:
    'Conoce a las personas detrás de Reforma Digital, una iniciativa abierta para mejorar nuestra relación con lo público.',
  robots: { index: true, follow: true },
};

const coreTeam = [
  { name: 'Leo', login: 'mrloldev', id: 65485999 },
  { name: 'Samu', login: 'samuelcorsan', id: 120322525 },
  { name: 'Pablo', login: 'pdepablocom', id: 262992558 },
  { name: 'Alex Cerezo', login: 'alexcerezo', id: 92682715 },
  { name: 'Roger', login: 'rogerkernel', id: 45967941 },
];

export default async function CoreTeamPage() {
  const contributors = await getContributors();
  return (
    <div className="core-team">
      <Cabecera actual="/equipo" />
      <main id="main" tabIndex={-1}>
        <section className="ct-equipo" aria-labelledby="ct-titulo">
          <h1 id="ct-titulo" className="t-titular-m">
            Core team
          </h1>
          <ul className="ct-personas">
            {coreTeam.map(({ name, login, id }) => (
              <li key={login}>
                <a
                  className="ct-persona"
                  href={`https://github.com/${login}`}
                  aria-label={`Conoce a ${name} en GitHub`}
                >
                  <div className="ct-retrato">
                    <img
                      src={`https://avatars.githubusercontent.com/u/${id}?s=640`}
                      width={640}
                      height={640}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="ct-persona-info">
                    <div>
                      <h2 className="t-titular-s">{name}</h2>
                      <p className="t-texto">@{login}</p>
                    </div>
                    <span className="ct-persona-flecha">
                      <Icono n="externo" size={20} />
                    </span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="ct-contributors" aria-labelledby="ct-contributors-titulo">
          <header className="ct-contributors-cabecera">
            <h2 id="ct-contributors-titulo" className="t-titular-s">
              Contributors
            </h2>
            <a className="in-enlace" href={`${links.repo}/graphs/contributors`}>
              Ver en GitHub <Icono n="externo" size={16} />
            </a>
          </header>
          {contributors === null ? (
            <p className="ct-contributors-aviso">
              Ahora mismo no podemos cargar los contributors de GitHub.
            </p>
          ) : contributors.length === 0 ? (
            <p className="ct-contributors-aviso">GitHub todavía no muestra contributors.</p>
          ) : (
            <ul className="ct-contributors-lista">
              {contributors.map(({ id, login }) => (
                <li key={login}>
                  <a
                    className="ct-contributor"
                    href={`https://github.com/${encodeURIComponent(login)}`}
                  >
                    <img
                      src={`https://avatars.githubusercontent.com/u/${id}?s=160`}
                      width={80}
                      height={80}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                    <span>@{login}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
