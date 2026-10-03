import type { ReactNode } from 'react';
import ReadingProgress from './ReadingProgress';

import Banner from './Banner';
import Hero from './Hero';
import Footer from './Footer';
import Figure from './Figure';
import Annotated from './Annotated';
import Actors from './Actors';
import DemoTransform from './DemoTransform';
import GithubIcon from './GithubIcon';
import { links } from './site';
import { categorias, servicios } from './data/aeat';

const sources = [
  {
    id: 1,
    text: 'Ley 11/2007, de 22 de junio, de acceso electrónico de los ciudadanos a los Servicios Públicos, artículo 1. Boletín Oficial del Estado.',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-12352',
  },
  {
    id: 2,
    text: 'Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas, artículo 14.2. Boletín Oficial del Estado.',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565',
  },
  {
    id: 3,
    text: 'Comisión Europea, eGovernment Benchmark 2024, dentro del Informe sobre el estado de la Década Digital.',
    href: 'https://digital-strategy.ec.europa.eu/en/library/digital-decade-2024-egovernment-benchmark',
  },
];

const ref = (n: number) => `#fuente-${n}`;

const renta = servicios.findIndex((s) => s.name === 'Renta') + 1;
const cartas = servicios.filter((s) => s.category === 'Asistencia sobre cartas recibidas');
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9ñáéíóú]/g, '');
const repetidos = cartas.filter((c) =>
  servicios.some((s) => s.category !== c.category && norm(s.name) === norm(c.name)),
).length;

const stats = [
  {
    value: String(servicios.length),
    label: `Servicios en una sola página, sin buscador, en ${categorias.length} categorías`,
  },
  {
    value: `${renta}.º`,
    label: 'Puesto de «Renta» en la lista, dentro de «Asistencia sobre cartas recibidas»',
  },
  {
    value: String(repetidos),
    label: 'Servicios que aparecen dos veces, en dos categorías distintas',
  },
];

const layers = [
  {
    name: 'Ley y procedimiento',
    text: 'Qué se pide, a quién y en qué plazo. La escriben las Cortes y la aplica cada organismo.',
    tag: 'No cambia',
  },
  {
    name: 'Sede electrónica',
    text: 'Servidores, sesión, validación de los datos y envío oficial.',
    tag: 'No cambia',
  },
  {
    name: 'Interfaz',
    text: 'Textos, orden de los pasos, buscadores y lugar de cada aviso.',
    tag: 'Se mejora en abierto',
    ours: true,
  },
];

const gains: { icon: 'person' | 'company' | 'state'; title: string; text: string }[] = [
  {
    icon: 'person',
    title: 'Ciudadanía',
    text: 'Sabe en qué paso está y cuántos quedan. Encuentra su servicio escribiendo "clave" o "embargo", y lee los avisos oficiales antes de elegir, no después. No necesita pagar a nadie para entender la página.',
  },
  {
    icon: 'company',
    title: 'Empresas',
    text: 'Todas las pantallas adaptadas siguen el mismo sistema de diseño, con pasos numerados y buscadores. Lo que aprenden en un trámite les sirve en el siguiente.',
  },
  {
    icon: 'state',
    title: 'Administración',
    text: 'Recibe un estudio de usabilidad abierto y gratuito. Cada pantalla adaptada queda documentada en el repositorio con lo que hemos cambiado y por qué, y cualquier equipo público puede llevarlo a su web.',
  },
];

const horizon = [
  {
    when: 'Corto plazo',
    title: 'La extensión adapta los trámites portal a portal.',
    text: 'Ya cubre Asistencia y Cita de la Agencia Tributaria, la cita previa del DNI y la de Extranjería, en fase experimental.',
    tag: 'Hoy',
  },
  {
    when: 'Medio plazo',
    title: 'Un sistema de diseño público y abierto.',
    text: 'Componentes probados en trámites reales que cualquier sede electrónica puede usar en su propio código.',
  },
  {
    when: 'Largo plazo',
    title: 'Las mejoras llegan a las webs oficiales.',
    text: 'Cuando eso ocurra, la extensión dejará de hacer falta.',
    tag: 'Objetivo',
  },
];

const costs: { icon: 'person' | 'company' | 'state'; title: string; text: string }[] = [
  {
    icon: 'person',
    title: 'Quien hace el trámite',
    text: 'Pierde horas y a veces necesita que un familiar o un gestor le ayude.',
  },
  {
    icon: 'company',
    title: 'Quien emprende',
    text: 'Dedica a los formularios un tiempo que no dedica a su negocio.',
  },
  {
    icon: 'state',
    title: 'La Administración',
    text: 'Recibe solicitudes con errores y tiene que pedir que se subsanen.',
  },
];

const timeline = [
  { when: 'Hasta 2007', text: 'Tratar con la Administración significa ir a una ventanilla.' },
  {
    when: '2007',
    text: 'La Ley 11/2007 reconoce el derecho a relacionarse por medios electrónicos.',
    ref: 1,
  },
  {
    when: '2015',
    text: 'La Ley 39/2015 lo convierte en obligación para empresas y asociaciones.',
    ref: 2,
  },
  {
    when: '2024',
    text: 'España ocupa el puesto 12 de la UE en el eGovernment Benchmark, con 79 puntos sobre 100.',
    ref: 3,
  },
];

export default function Landing({ composer }: { composer?: ReactNode }) {
  return (
    <>
      <ReadingProgress />
      <Banner />
      <Hero composer={composer} />
      <div className="full-landing">
        <main id="main" className="full-article">
          <section id="resumen" aria-labelledby="resumen-title">
            <h2 id="resumen-title">Resumen</h2>
            <p>
              España ha llevado a internet casi todos sus trámites, y la relación entre el Estado y
              la gente ya ocurre sobre todo en una pantalla. Esa pantalla sigue pensada para quien
              conoce el procedimiento. La persona que la usa casi nunca lo conoce, y la diferencia
              cuesta horas, errores y, en algunos casos, dinero pagado a intermediarios.
            </p>
            <p>
              La web oficial es hoy la cara visible del Estado. Para mucha gente es la única
              ventanilla que visita en todo el año, y de ella sale con confianza o con desgana.
              Proponemos diseñar esas páginas con el mismo rigor con el que se redacta una ley, sin
              cambiar ninguna norma ni tocar un servidor.
            </p>
            <p>
              Este es el comienzo de una nueva forma de relacionarnos con el Estado: digital, clara
              y pensada para quien la usa.
            </p>
          </section>

          <p className="section-label" id="texto">
            01 · Situación
          </p>
          <h2>El Estado ya se visita desde una pantalla</h2>
          <p>
            España ha reformado su Administración muchas veces. Lo hicieron las reformas borbónicas
            del siglo XVIII, el reformismo ilustrado de Carlos III y las reformas liberales del XIX.
            Todas tuvieron detractores, y todas dejaron un Estado que funcionaba mejor que el
            anterior.
          </p>
          <blockquote className="my-10 text-balance font-serif text-[clamp(28px,3.2vw,36px)] font-normal italic leading-[1.2] tracking-[-0.01em] text-ink">
            Cada época ha tenido su reforma de la Administración. La nuestra es la digital.
          </blockquote>
          <p>
            Durante décadas, tratar con la Administración significaba ir a una ventanilla. Hoy casi
            todo pasa por una pantalla, y España lo ha hecho bien.
          </p>

          <Figure n={1} caption={<> De la ventanilla a la pantalla, en cuatro fechas. </>}>
            <ol className="relative m-0 grid list-none grid-cols-4 p-0 before:absolute before:left-0 before:right-0 before:top-[7px] before:border-t before:border-dashed before:border-line-strong max-sm:grid-cols-1 max-sm:gap-5 max-sm:pl-7 max-sm:before:bottom-0 max-sm:before:left-1.5 max-sm:before:right-auto max-sm:before:top-0 max-sm:before:border-l max-sm:before:border-t-0">
              {timeline.map((t) => (
                <li
                  key={t.when}
                  className="relative grid content-start gap-1.5 pb-0 pr-4 pt-7 before:absolute before:left-0 before:top-0 before:size-3.5 before:rounded-full before:border-[1.5px] before:border-brand-900 before:bg-surface last:before:bg-brand-900 max-sm:p-0 max-sm:before:left-[-28px] max-sm:before:top-1"
                >
                  <span className="font-serif text-[26px] leading-none text-ink">{t.when}</span>
                  <span className="text-sm leading-normal text-ink-muted">
                    {t.text}
                    {t.ref && (
                      <sup>
                        <a href={ref(t.ref)}>{t.ref}</a>
                      </sup>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Figure>

          <p>
            Cuando la mayor parte de la relación con el Estado ocurre en una pantalla, el diseño de
            esa pantalla se convierte en política pública. Una persona se forma buena parte de su
            opinión sobre la Administración en los minutos que pasa frente a un formulario. Si lo
            entiende a la primera, termina el trámite y sigue con su día. Si necesita que alguien se
            lo explique, se queda con la idea de que el Estado no está pensado para ella.
          </p>

          <p className="section-label">02 · Problema</p>
          <h2>Digitalizar un trámite no lo hace sencillo</h2>
          <p>
            Llevar un trámite a internet y hacerlo fácil de usar son dos trabajos distintos. El
            primero está casi terminado. El segundo queda en manos de cada sede electrónica, y el
            resultado es desigual.
          </p>
          <p>
            Basta con entrar en casi cualquier web del Estado para comprobarlo. Un ejemplo es
            Asistencia y Cita de la Agencia Tributaria, la página con la que cualquier contribuyente
            pide ayuda a Hacienda por un certificado, el NIF, una deuda o una carta que no entiende.
            Solo en su catálogo de servicios encontramos cuatro problemas.
          </p>

          <Figure
            n={2}
            caption={
              <>
                El catálogo de servicios de asistencia el 27 de septiembre de 2026, sin Reforma
                Digital.
              </>
            }
          >
            <Annotated />
          </Figure>

          <p>
            Los datos de la web son correctos y el servidor responde. Los cuatro problemas están en
            la interfaz.
          </p>

          <h3>Quién paga la diferencia</h3>
          <p>Esa distancia tiene un coste para los tres.</p>
          <div className="my-6 mb-8">
            <Actors items={costs} />
          </div>

          <p>
            Por la Agencia Tributaria pasa, antes o después, casi cualquier persona que trabaja en
            España. Si busca ayuda con la Renta, la encuentra en el puesto {renta} de{' '}
            {servicios.length}, dentro de una categoría sobre cartas recibidas. Cuando encontrar el
            botón correcto cuesta tanto, mucha gente acaba pidiendo ayuda a un familiar o pagando a
            un gestor por algo que podría hacer sola.
          </p>

          <Figure
            n={3}
            caption={
              <>
                El catálogo de servicios de asistencia de la Agencia Tributaria, contado sobre el
                HTML de la web oficial el 27 de septiembre de 2026.
              </>
            }
          >
            <dl className="m-0 grid grid-cols-1 overflow-hidden rounded-xl border border-line sm:grid-cols-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-1.5 border-t border-line px-5 py-6 first:border-t-0 sm:border-l sm:border-t-0 sm:first:border-l-0"
                >
                  <dt className="order-1 text-[13px] leading-snug text-ink-subtle">{s.label}</dt>
                  <dd className="m-0 font-serif text-[clamp(34px,4vw,44px)] font-normal leading-none tracking-[-0.02em] text-ink">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Figure>

          <p>
            Una interfaz mejor no crea citas ni cambia un impuesto. Reduce el número de personas que
            necesitan pagar a alguien para entender una página pública.
          </p>

          <p className="section-label">03 · Solución</p>
          <h2>Una capa pública para la interfaz</h2>
          <p>
            Un trámite digital tiene tres capas. La ley define qué se pide y a quién. La sede
            electrónica guarda los datos y hace el envío. La interfaz decide cómo se presenta todo
            eso a una persona.
          </p>

          <Figure
            n={4}
            caption={
              <>Las tres capas de un trámite digital. Reforma Digital trabaja solo en la tercera.</>
            }
          >
            <ol className="m-0 grid list-none gap-2.5 p-0">
              {layers.map((l, i) => (
                <li
                  key={l.name}
                  className={[
                    'grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-1.5 rounded-xl px-5 py-4 sm:grid-cols-[auto_1fr_auto]',
                    l.ours ? 'border border-ink' : 'border border-dashed border-line-strong',
                  ].join(' ')}
                >
                  <span className="font-mono text-xs text-ink-subtle">{i + 1}</span>
                  <span className="grid gap-0.5 text-[15px] leading-normal">
                    <strong className="font-semibold text-ink">{l.name}</strong>
                    <span>{l.text}</span>
                  </span>
                  <span
                    className={[
                      'col-start-2 text-left font-mono text-[11px] uppercase tracking-[0.06em] sm:col-start-auto sm:text-right',
                      l.ours ? 'text-ink' : 'text-ink-subtle',
                    ].join(' ')}
                  >
                    {l.tag}
                  </span>
                </li>
              ))}
            </ol>
          </Figure>

          <p>
            Proponemos tratar esa tercera capa como un bien común. Igual que el software libre,
            cualquiera que la use puede mejorarla, en abierto y con cada cambio documentado. Para
            que un catálogo de
            {servicios.length} servicios tenga buscador no hace falta modificar una ley ni licitar
            un contrato.
          </p>
          <blockquote className="my-10 text-balance font-serif text-[clamp(28px,3.2vw,36px)] font-normal italic leading-[1.2] tracking-[-0.01em] text-ink">
            Queremos que Reforma Digital sea la primera reforma administrativa que se instala con un
            clic.
          </blockquote>

          <h3>La primera pieza, una extensión de Chrome</h3>
          <p>
            Hoy esa capa llega a tu navegador a través de una extensión. Es la forma más rápida de
            ponerla en manos de la gente. Se instala en un clic, funciona sobre las webs oficiales
            que ya existen y se desactiva con otro clic.
          </p>

          <Figure
            n={5}
            wide
            caption={
              <>
                Recreación del catálogo de servicios de asistencia de la Agencia Tributaria, con sus{' '}
                {servicios.length}
                servicios reales. A la izquierda, la web original; a la derecha, la misma página con
                Reforma Digital. Prueba a buscar "clave" o "renta": las dos webs comparten el
                servicio que elijas.
              </>
            }
          >
            <DemoTransform />
          </Figure>

          <p>
            El panel no sustituye a la web oficial. Cada control del panel está conectado a su
            control original. Cuando eliges un servicio y pulsas Solicitar, la extensión pulsa el
            botón oficial «Solicita asistencia y cita» de ese mismo servicio. La sede electrónica
            sigue validando los datos y haciendo el envío.
          </p>

          <p>
            La extensión tiene límites claros. No rellena datos, no resuelve el CAPTCHA, no entra en
            Cl@ve, no envía formularios y no guarda lo que escribes. No tiene servidores propios.
            Solo actúa en pantallas revisadas una a una, y si algo no encaja se retira y deja la web
            original.
          </p>

          <p className="section-label">04 · Beneficio</p>
          <h2>Qué gana cada uno</h2>
          <p>
            La interfaz es el único punto que comparten la ciudadanía, las empresas y la
            Administración. Por eso una mejora en ella llega a los tres a la vez.
          </p>
          <div className="my-6 mb-8">
            <Actors items={gains} />
          </div>
          <p>
            Para el Estado en conjunto, cada trámite que se entiende a la primera es una persona
            menos que sale convencida de que la Administración no está pensada para ella.
          </p>

          <p className="section-label" id="horizonte">
            05 · Horizonte
          </p>
          <h2>De la extensión a la web oficial</h2>
          <p>La extensión es el comienzo. La propuesta se escalona en tres plazos.</p>

          <Figure
            n={6}
            caption={<> Recomendación escalonada. Cada plazo se apoya en el anterior. </>}
          >
            <ol className="m-0 list-none rounded-xl border border-line p-0">
              {horizon.map((h) => (
                <li
                  key={h.when}
                  className="grid grid-cols-1 gap-1.5 border-t border-line p-5 first:border-t-0 sm:grid-cols-[130px_1fr] sm:gap-4"
                >
                  <span className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
                    {h.when}
                  </span>
                  <span className="grid justify-items-start gap-1 text-[15px] leading-[1.55]">
                    <strong className="font-semibold text-ink">{h.title}</strong>
                    <span>{h.text}</span>
                    {h.tag && (
                      <span className="mt-2 rounded-full border border-line px-2 py-0.5 font-mono text-[11px] text-ink-muted">
                        {h.tag}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </Figure>

          <p>
            Hoy estamos al principio del primer plazo. Reforma Digital está en la versión 0.1. Cubre
            Asistencia y Cita de la Agencia Tributaria y la cita previa de Extranjería, que
            recorrimos en las webs oficiales el 27 de septiembre de 2026, y la del DNI y el
            pasaporte, verificada el 10 de septiembre. Todavía no hemos validado ningún trámite
            completo de principio a fin, y la interfaz solo está en castellano.
          </p>

          <p className="section-label" id="participar">
            06 · Participar
          </p>
          <h2>Cómo sumarte</h2>
          <p>
            Reforma Digital es una iniciativa en construcción y toda ayuda es bienvenida. Puedes
            proponer mejoras, abrir incidencias o enviar código en el repositorio de GitHub, y
            contar el proyecto en Twitter para que llegue a más gente.
          </p>
          <p>
            Si quieres echar una mano o trabajas en una sede electrónica, escríbenos por mensaje
            directo a <a href="https://x.com/disamdev">Samu</a> o a{' '}
            <a href="https://x.com/mrloldev">Leo</a>.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-900 px-[18px] text-[15px] font-medium !text-white !no-underline hover:bg-[#333]"
              href={links.repo}
            >
              <GithubIcon size={17} />
              Ver el código en GitHub
            </a>
            <a
              className="inline-flex h-11 items-center rounded-full border border-line bg-white px-[18px] text-[15px] font-medium !text-ink !no-underline hover:border-[#94a3b8]"
              href={links.contributing}
            >
              Guía para contribuir
            </a>
          </div>

          <h2 id="fuentes" className="!mt-24">
            Fuentes
          </h2>
          <ol className="m-0 grid list-decimal gap-2.5 pl-5 text-sm leading-normal text-ink-subtle [&_li]:scroll-mt-20 [&_li:target]:text-ink">
            {sources.map((s) => (
              <li key={s.id} id={`fuente-${s.id}`}>
                {s.text} <a href={s.href}>{new URL(s.href).hostname}</a>
              </li>
            ))}
          </ol>

          <p className="!mt-24 text-center text-[15px] text-ink-muted">
            Gracias a <a href="https://pdepablo.com">pdepablo</a> por la ayuda con el diseño.
          </p>
        </main>
        <Footer />
      </div>
    </>
  );
}
