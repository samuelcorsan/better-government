import type { Metadata } from 'next';
import Image from 'next/image';
import { ViewTransition } from 'react';
import { Icon } from '../../../components/sol/icon';
import { Header } from '../../../components/sol/header';
import { links } from '../../../lib/site';
import './core-team.css';
import { coreTeam, getContributors } from './contributors';

export const metadata: Metadata = {
  title: 'Core team · Reforma Digital',
  description:
    'Conoce a las personas detrás de Reforma Digital, una iniciativa abierta para mejorar nuestra relación con lo público.',
  robots: { index: true, follow: true },
};

export default async function CoreTeamPage() {
  const contributors = await getContributors();
  return (
    <ViewTransition enter="equipo-entra" exit="equipo-sale" default="none">
      <div className="core-team">
        <Header current="/equipo" />
        <main id="main" tabIndex={-1}>
          <section className="ct-equipo" aria-labelledby="ct-titulo">
            <h1 id="ct-titulo" className="t-titular-m">
              Core team
            </h1>
            <ul className="ct-personas">
              {coreTeam.map(({ name, login, id }, index) => (
                <li key={login}>
                  <a
                    className="ct-persona tarjeta-enlace"
                    href={`https://github.com/${login}`}
                    aria-label={`Conoce a ${name} en GitHub`}
                  >
                    <div className="ct-retrato">
                      <Image
                        src={`https://avatars.githubusercontent.com/u/${id}?s=640`}
                        width={640}
                        height={640}
                        sizes="(max-width: 600px) 100vw, (max-width: 1200px) 20vw, 240px"
                        alt=""
                        loading="eager"
                        fetchPriority={index === 0 ? 'high' : undefined}
                      />
                    </div>
                    <div className="ct-persona-info">
                      <div>
                        <h2 className="t-titular-s">{name}</h2>
                        <p className="t-texto">@{login}</p>
                      </div>
                      <span className="boton-icono ct-persona-flecha">
                        <Icon name="externo" size={20} />
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
                Ver en GitHub <Icon name="externo" size={16} />
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
                      <Image
                        src={`https://avatars.githubusercontent.com/u/${id}?s=160`}
                        width={80}
                        height={80}
                        alt=""
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
    </ViewTransition>
  );
}
