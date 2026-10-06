import type { Metadata } from 'next';
import { sources } from '@reforma-digital/government';
import { Icono } from '../../components/sol/icono';
import { Cabecera } from '../../components/sol/cabecera';
import { Pie } from '../../components/sol/pie';
import { EscenaRecorrido } from '../../components/sol/recorrido';
import { RecorridoScroll } from '../../components/sol/recorrido-scroll';
import { links } from '../../lib/site';
import { Contribucion } from '../../components/sol/contribucion';
import '../../components/sol/iniciativa.css';

export const metadata: Metadata = {
  title: 'Una reforma hecha en comunidad · Reforma Digital',
  description:
    'Una iniciativa abierta para mejorar nuestra relación con la Administración. Descubre el buscador, la extensión y las fuentes oficiales.',
  robots: { index: true, follow: true },
};

export default function IniciativaPage() {
  return (
    <div className="iniciativa">
      <main id="main" tabIndex={-1}>
        <section className="in-hero" aria-labelledby="in-titulo">
          <Cabecera />
          <div className="in-hero-interior">
            <h1 id="in-titulo" className="t-titular-xl">
              Lo público, a la altura de las personas.
            </h1>
            <p className="t-texto-l in-hero-texto">
              Hacer un trámite no debería exigir entender cómo funciona toda la Administración.
              Creamos herramientas y propuestas para que relacionarnos con ella sea más claro,
              accesible y sencillo. Lo hacemos en comunidad y con código abierto.
            </p>
            <a className="in-hero-enlace" href="#proyectos">
              Conoce los proyectos <Icono n="abajo" size={16} />
            </a>
          </div>
        </section>

        <section id="iniciativa" className="in-seccion in-manifiesto" aria-labelledby="in-idea">
          <div>
            <p className="t-etiqueta in-etiqueta">La iniciativa</p>
            <h2 id="in-idea" className="t-titular-m">
              Que hacer un trámite no sea otro trámite.
            </h2>
            <a className="in-enlace" href="/equipo">
              Conoce al equipo <Icono n="derecha" size={16} />
            </a>
          </div>
          <div className="in-lectura t-texto-l">
            <p>
              Pedir una cita, buscar una ayuda o responder a una notificación empieza, muchas veces,
              con una pantalla que cuesta entender. Queremos que las webs públicas acompañen a quien
              las usa: qué necesitas, dónde estás y cuál es el siguiente paso.
            </p>
            <p>
              Empezamos con herramientas que podemos probar y mejorar en comunidad. El horizonte es
              llevar esas mejoras a las propias sedes, con un sistema de diseño público y abierto
              que sus equipos puedan reutilizar.
            </p>
          </div>
        </section>

        <div id="proyectos" className="in-proyectos">
          <RecorridoScroll
            tituloId="in-proyectos-titulo"
            unidad="Proyecto"
            cabecera={
              <header className="in-seccion-cabecera">
                <div>
                  <p className="t-etiqueta in-etiqueta">Los proyectos</p>
                  <h2 id="in-proyectos-titulo" className="t-titular-m">
                    La idea, puesta en práctica.
                  </h2>
                </div>
                <p className="t-texto-l">
                  Creamos proyectos para hacer más clara, accesible y sencilla nuestra relación con
                  lo público. Estas son algunas de las herramientas que estamos construyendo, y un
                  adelanto de lo que viene.
                </p>
              </header>
            }
            pasos={[
              {
                titulo: 'Encuentra por dónde empezar.',
                etiqueta: <span className="in-proyecto-tipo">01 · Buscador de trámites</span>,
                texto: (
                  <>
                    <p className="t-texto-l">
                      Pregunta con tus palabras. El buscador te orienta con respuestas, enlaces y
                      fragmentos de fuentes oficiales que puedes consultar.
                    </p>
                    <a className="boton" href="/chat">
                      Abrir el buscador <Icono n="derecha" size={16} />
                    </a>
                  </>
                ),
                escena: <EscenaRecorrido proyecto="buscador" />,
              },
              {
                titulo: 'La web oficial, más fácil de usar.',
                etiqueta: <span className="in-proyecto-tipo">02 · Extensión para Chrome</span>,
                texto: (
                  <>
                    <p className="t-texto-l">
                      Prueba otra interfaz en pantallas de DNI, Extranjería, Hacienda y Registro de
                      asociaciones. Los formularios y los envíos siguen en la sede oficial.
                    </p>
                    <div className="in-acciones">
                      <a className="boton" href={links.install}>
                        Descargar la extensión <Icono n="descargar" size={16} />
                      </a>
                    </div>
                  </>
                ),
                escena: (
                  <div className="rc-pieza in-proyecto-sol">
                    <EscenaRecorrido proyecto="extension" />
                  </div>
                ),
              },
              {
                titulo: 'La información tiene un origen.',
                etiqueta: <span className="in-proyecto-tipo">03 · Mapa de fuentes</span>,
                texto: (
                  <>
                    <p className="t-texto-l">
                      Explora los organismos oficiales que consulta el buscador y accede a sus webs.
                      Un punto de partida para conocer su cobertura y comprobar la información.
                    </p>
                    <a className="in-enlace" href="/sources">
                      Explorar las fuentes <Icono n="derecha" size={16} />
                    </a>
                  </>
                ),
                escena: (
                  <div className="rc-pieza rc-sobre-sol">
                    <div className="rc-respuesta caja-flota">
                      <span className="t-etiqueta">Fuentes oficiales</span>
                      {sources.slice(0, 3).map((source) => (
                        <span className="in-fuente" key={source.id}>
                          <strong>{source.name}</strong>
                          <span className="t-dato">{new URL(source.baseUrl).hostname}</span>
                        </span>
                      ))}
                      <span className="rc-abrir">
                        Consulta el origen de cada dato <Icono n="fuentes" size={16} />
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                titulo: 'Participar empieza por entender.',
                etiqueta: (
                  <div className="in-acciones">
                    <span className="in-proyecto-tipo">04 · Elecciones</span>
                    <span className="in-proximo" lang="en">
                      Coming soon
                    </span>
                  </div>
                ),
                texto: (
                  <p className="t-texto-l">
                    Elegir también requiere información clara. Estamos preparando nuevos proyectos
                    para acercar las elecciones a las personas. Pronto te contaremos más.
                  </p>
                ),
                escena: (
                  <div className="rc-pieza in-elecciones">
                    <p className="in-elecciones-lema">Lo público también se elige.</p>
                    <svg viewBox="120 40 390 430" fill="none" aria-hidden="true">
                      <ellipse
                        cx="315"
                        cy="438"
                        rx="148"
                        ry="18"
                        fill="var(--doblez)"
                        opacity=".2"
                      />
                      <path
                        d="M170 245 330 200 460 265 300 315Z"
                        fill="var(--blanco)"
                        fillOpacity=".9"
                      />
                      <path
                        d="M170 245 300 315V445L170 375Z"
                        fill="var(--blanco)"
                        fillOpacity=".7"
                      />
                      <path
                        d="M300 315 460 265V392L300 445Z"
                        fill="var(--blanco)"
                        fillOpacity=".4"
                      />
                      <path
                        d="M170 245 300 315 460 265M300 315V445"
                        stroke="var(--blanco)"
                        strokeOpacity=".6"
                        strokeWidth="2"
                      />
                      <path d="M246 261 353 232 372 242 265 272Z" fill="var(--doblez)" />
                      <path d="M250 90 368 120 338 238 220 208Z" fill="var(--blanco)" />
                      <path d="M250 90 368 120 309 153Z" fill="var(--superficie)" />
                      <path d="M220 208 285 174 338 238" stroke="var(--linea)" strokeWidth="2" />
                      <circle cx="292" cy="174" r="24" fill="var(--rojo)" />
                      <path
                        d="m281 173 8 9 16-16"
                        stroke="var(--blanco)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="m352 342 15 8v24l-15-8Z" fill="var(--blanco)" fillOpacity=".6" />
                      <path d="m376 331 15 8v24l-15-8Z" fill="var(--blanco)" fillOpacity=".3" />
                      <path d="m400 320 15 8v24l-15-8Z" fill="var(--blanco)" fillOpacity=".3" />
                    </svg>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <section
          id="participar"
          className="in-seccion in-comunidad"
          aria-labelledby="in-comunidad-titulo"
        >
          <p className="t-etiqueta in-etiqueta">Cómo contribuir</p>
          <h2 id="in-comunidad-titulo" className="t-titular-m">
            Tu experiencia puede ser el próximo cambio.
          </h2>
          <p className="t-texto-l">
            No necesitas programar para aportar. Una idea, un texto más claro o una revisión de
            accesibilidad también ayudan. Nos organizamos en GitHub: ahí compartimos propuestas y
            construimos las mejoras en comunidad.
          </p>
          <div className="in-contribuir">
            <ol className="in-contribuir-pasos" role="list">
              <li>
                <span className="t-dato" aria-hidden="true">
                  01
                </span>
                <div>
                  <h3 className="t-titular-s">Entra en GitHub.</h3>
                  <p>
                    Crea una cuenta o inicia sesión y abre el repositorio. En el README puedes
                    conocer los proyectos y cómo se organizan.
                  </p>
                  <a className="in-enlace" href={links.repo}>
                    Abrir el repositorio <Icono n="externo" size={16} />
                  </a>
                </div>
              </li>
              <li>
                <span className="t-dato" aria-hidden="true">
                  02
                </span>
                <div>
                  <h3 className="t-titular-s">Comparte lo que mejorarías.</h3>
                  <p>
                    Busca en Issues si alguien ya ha planteado tu idea. Si no, abre una issue:
                    cuenta qué ocurre, dónde y qué te gustaría que cambiara.
                  </p>
                  <a className="in-enlace" href={`${links.repo}/issues`}>
                    Ver ideas y propuestas <Icono n="externo" size={16} />
                  </a>
                </div>
              </li>
              <li>
                <span className="t-dato" aria-hidden="true">
                  03
                </span>
                <div>
                  <h3 className="t-titular-s">Dale forma a una propuesta.</h3>
                  <p>
                    Aporta diseño, textos, accesibilidad o código. Para cambiar el código, lee la
                    guía, haz un fork, crea una rama y envía una pull request para revisarla en
                    comunidad.
                  </p>
                  <a className="in-enlace" href={links.contributing}>
                    Leer la guía de contribución <Icono n="externo" size={16} />
                  </a>
                </div>
              </li>
            </ol>
            <Contribucion />
          </div>
        </section>
      </main>
      <Pie />
    </div>
  );
}
