import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Form from 'next/form';
import Link from 'next/link';
import { PaginaInformativa } from '../../../components/sol/pagina-informativa';
import {
  averagePerSeat,
  bands,
  cartograma,
  poblacionReparto,
  provinciaDe,
  provincias,
  recuadroCanarias,
  resultado2023,
  SEATS,
  type Provincia,
} from '../../../lib/elecciones';
import { EligeProvincia } from './elige-provincia';
import { InfoDato } from './info-dato';
import { Laboratorio } from './laboratorio';
import { DhondtPasoAPaso, Hemiciclo, OrigenEscanos, VotosPerdidos } from './reparto';
import { TablaProvincias } from './tabla-provincias';
import './elecciones.css';
import './reparto.css';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const escanosDe = (n: number) => `${n} ${n === 1 ? 'escaño' : 'escaños'}`;
const fuentes = {
  escanos: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-20742',
  poblacion: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-25362',
  loreg: 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#a162',
  resultados2023:
    'https://infoelectoral.interior.gob.es/es/elecciones-celebradas/area-de-descargas/',
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const provincia = provinciaDe((await searchParams).provincia);
  const title = provincia
    ? `${provincia.name}: ¿cuánto vale tu voto? · Reforma Digital`
    : '¿Cuánto vale tu voto? · Reforma Digital';
  const description = provincia
    ? `${provincia.name} elige ${provincia.seats} de los ${SEATS} escaños del Congreso el 29 de noviembre de 2026: ${numero.format(provincia.perSeat)} habitantes por escaño.`
    : `Cuántos escaños elige cada provincia el 29 de noviembre de 2026 y cuántos habitantes hay por escaño, con datos oficiales.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [provincia ? `/elecciones/og/${provincia.id}` : '/og.png'],
    },
  };
}

export default async function Elecciones({ searchParams }: Props) {
  const params = await searchParams;
  const provincia = provinciaDe(params.provincia);
  const escanos = params.vista === 'escanos';
  const href = (id: string | undefined, vistaEscanos: boolean) => {
    const query = new URLSearchParams();
    if (id) query.set('provincia', id);
    if (vistaEscanos) query.set('vista', 'escanos');
    return `/elecciones${query.size ? `?${query}` : ''}`;
  };

  return (
    <PaginaInformativa>
      <span className="t-etiqueta info-etiqueta">
        Elecciones generales · 29 de noviembre de 2026
      </span>
      <h1>¿Cuánto vale tu voto?</h1>
      <p className="info-entradilla">
        El Congreso tiene {SEATS} escaños repartidos entre 52 circunscripciones. Elige tu provincia
        para ver cuántos diputados elige, cuántos habitantes hay por escaño y por qué.
      </p>

      <section className="info-mapa el-mapa" aria-labelledby="el-mapa-titulo">
        <h2 id="el-mapa-titulo" className="sr-only">
          Mapa de circunscripciones
        </h2>
        <div className="el-barra">
          <nav className="el-vistas" aria-label="Vista del mapa">
            <Link
              href={href(provincia?.id, false)}
              scroll={false}
              aria-current={escanos ? undefined : 'true'}
            >
              Mapa
            </Link>
            <Link
              href={href(provincia?.id, true)}
              scroll={false}
              aria-current={escanos ? 'true' : undefined}
            >
              Tamaño según escaños
            </Link>
          </nav>
          <Form action="/elecciones" scroll={false}>
            <label htmlFor="el-elige">Elige tu provincia</label>
            <EligeProvincia
              actual={provincia?.id}
              opciones={provincias
                .map(({ id, name }) => ({ id, name }))
                .sort((a, b) => a.name.localeCompare(b.name, 'es'))}
            />
            {escanos && <input type="hidden" name="vista" value="escanos" />}
            {/* Sin JavaScript el cambio no envía el formulario. */}
            <noscript>
              <button className="boton" type="submit">
                Ver
              </button>
            </noscript>
          </Form>
        </div>

        <div className="el-contenido">
          <div>
            <svg
              className="el-svg"
              viewBox="0 0 600 520"
              role="group"
              aria-labelledby="el-svg-titulo el-svg-descripcion"
            >
              <title id="el-svg-titulo">
                {escanos ? 'Provincias según sus escaños' : 'Mapa de provincias'}
              </title>
              <desc id="el-svg-descripcion">
                {escanos
                  ? 'Cada círculo es una provincia, sobre su lugar en el mapa, y su área es proporcional a los escaños que elige.'
                  : 'Canarias está representada en un recuadro separado.'}{' '}
                El tono indica los habitantes por escaño. También puedes elegirla en el desplegable
                o en la tabla de datos.
              </desc>
              <rect className="el-recuadro" {...recuadroCanarias} />
              {escanos && (
                <path
                  className="el-silueta"
                  d={provincias.map((p) => p.path).join('')}
                  fillRule="evenodd"
                  aria-hidden="true"
                />
              )}
              <text className="el-rotulo" x="12" y="420" aria-hidden="true">
                Canarias
              </text>
              {provincias.map((p) => {
                const circulo = cartograma.find((c) => c.id === p.id);
                return (
                  <Link
                    key={p.id}
                    href={href(p.id, escanos)}
                    scroll={false}
                    className="el-provincia"
                    aria-label={`${p.name}: ${escanosDe(p.seats)}`}
                    aria-current={provincia?.id === p.id ? 'true' : undefined}
                  >
                    <title>{`${p.name}: ${escanosDe(p.seats)}`}</title>
                    {escanos && circulo ? (
                      <>
                        <circle cx={circulo.x} cy={circulo.y} r={circulo.r} data-band={p.band} />
                        {circulo.r >= 12 && (
                          <text
                            className="el-cifra"
                            x={circulo.x}
                            y={circulo.y}
                            data-band={p.band}
                            aria-hidden="true"
                          >
                            {p.seats}
                          </text>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Ceuta y Melilla miden unas pocas unidades: área de pulsación y rótulo. */}
                        {p.id === '51' && (
                          <rect x="170" y="398" width="76" height="30" fill="transparent" />
                        )}
                        {p.id === '52' && (
                          <rect x="268" y="430" width="84" height="30" fill="transparent" />
                        )}
                        <path
                          d={p.path}
                          data-band={p.band}
                          fillRule="evenodd"
                          vectorEffect="non-scaling-stroke"
                        />
                        {(p.id === '51' || p.id === '52') && (
                          <circle cx={p.centro.x} cy={p.centro.y} r={6} data-band={p.band} />
                        )}
                        {p.id === '51' && (
                          <text className="el-rotulo" x="196" y="420" aria-hidden="true">
                            Ceuta
                          </text>
                        )}
                        {p.id === '52' && (
                          <text className="el-rotulo" x="286" y="450" aria-hidden="true">
                            Melilla
                          </text>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </svg>
            <p id="el-leyenda-titulo" className="el-leyenda-titulo">
              Habitantes por escaño:
            </p>
            <ul className="el-leyenda" aria-labelledby="el-leyenda-titulo">
              {bands.map((b, i) => (
                <li key={b.label}>
                  <span className="el-muestra" data-band={i} aria-hidden="true" />
                  {b.label}
                </li>
              ))}
            </ul>
            <p className="el-credito">
              Cartografía: Instituto Geográfico Nacional, vía{' '}
              <a href="https://www.geoboundaries.org/">geoBoundaries</a>.{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. Geometría
              simplificada y adaptada.
            </p>
          </div>

          <div id="el-ficha" className="el-ficha" aria-live="polite" aria-atomic>
            {provincia ? (
              <Ficha p={provincia} />
            ) : (
              <p>
                Elige una provincia en el mapa o en el desplegable. En toda España hay{' '}
                {numero.format(averagePerSeat)} habitantes por escaño.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Alternativa al mapa que no depende del color; plegada para no cargar la página. */}
      <details className="el-tabla">
        <summary>Ver todos los datos en una tabla</summary>
        <TablaProvincias
          items={provincias.map(({ id, name, seats, seats2023, population, perSeat }) => ({
            // La ficha está arriba: el enlace baja hasta ella.
            href: `${href(id, escanos)}#el-ficha`,
            name,
            seats,
            seats2023,
            population,
            perSeat,
          }))}
        />
      </details>

      {provincia && <RepartoProvincia key={provincia.id} p={provincia} />}

      <div className="info-prosa">
        <h2>Cómo se reparten los escaños.</h2>
        <p>
          La ley electoral da dos escaños a cada provincia y uno a Ceuta y otro a Melilla. Los 248
          restantes se reparten según la población de cada provincia (
          <a className="enlace" href={fuentes.loreg}>
            art. 162 de la LOREG
          </a>
          ). Por eso el número de habitantes por escaño cambia de una provincia a otra.
        </p>
        <p>
          Escaños:{' '}
          <a className="enlace" href={fuentes.escanos}>
            Real Decreto 806/2026
          </a>
          . Población a 1 de enero de 2025:{' '}
          <a className="enlace" href={fuentes.poblacion}>
            Real Decreto 1117/2025
          </a>
          . Resultados de 2023:{' '}
          <a className="enlace" href={fuentes.resultados2023}>
            Ministerio del Interior
          </a>
          .
        </p>
      </div>
    </PaginaInformativa>
  );
}

function Dato({ titulo, ayuda, children }: { titulo: string; ayuda: string; children: ReactNode }) {
  return (
    <div>
      <InfoDato titulo={titulo} ayuda={ayuda} />
      <dd>{children}</dd>
    </div>
  );
}

function Ficha({ p }: { p: Provincia }) {
  const media = Math.round((p.perSeat / averagePerSeat - 1) * 100);
  const diferencia = p.seats - p.seats2023;
  return (
    <>
      <h3>{p.name}</h3>
      <dl>
        <Dato
          titulo="Escaños en 2026"
          ayuda="Diputados que elige esta provincia en el Congreso el 29 de noviembre de 2026. Los fija el Real Decreto 806/2026 según la población."
        >
          <strong className="t-dato">{p.seats}</strong>{' '}
          {diferencia !== 0 &&
            `(${Math.abs(diferencia)} ${diferencia > 0 ? 'más' : 'menos'} que en 2023)`}
        </Dato>
        <Dato
          titulo="Habitantes"
          ayuda="Personas empadronadas en la provincia el 1 de enero de 2025, la cifra oficial vigente al convocar las elecciones. Incluye a quienes no votan, como menores o extranjeros."
        >
          <strong className="t-dato">{numero.format(p.population)}</strong>
        </Dato>
        <Dato
          titulo="Habitantes por escaño"
          ayuda="Habitantes divididos entre escaños: cuántas personas hay, de media, por cada diputado de la provincia. La media de España divide toda la población entre los 350 escaños."
        >
          <strong className="t-dato">{numero.format(p.perSeat)}</strong>{' '}
          {media === 0
            ? 'igual que la media de España'
            : `un ${Math.abs(media)} % ${media > 0 ? 'más' : 'menos'} que la media de España`}{' '}
          ({numero.format(averagePerSeat)})
        </Dato>
        <Dato
          titulo="Votos por escaño en 2023"
          ayuda="En las generales de julio de 2023, los votos válidos (a candidaturas y en blanco, sin los nulos) divididos entre los escaños que elegía la provincia: cuántos votos hubo, de media, por cada diputado elegido allí."
        >
          <strong className="t-dato">{numero.format(p.validVotesPerSeat2023)}</strong>
        </Dato>
      </dl>
      <p>
        {p.seats === 1
          ? `${p.name} elige un único escaño, fijado por la ley.`
          : p.seats === 2
            ? 'Tiene los 2 escaños que la ley da a cada provincia; por población no le corresponde ninguno más.'
            : `Tiene los 2 escaños que la ley da a cada provincia y ${p.seats - 2} más por su población.`}{' '}
        <a className="enlace" href={fuentes.loreg}>
          Art. 162 de la LOREG
        </a>
      </p>
      <p className="el-fuentes">
        Fuentes: escaños,{' '}
        <a className="enlace" href={fuentes.escanos}>
          Real Decreto 806/2026
        </a>
        ; población,{' '}
        <a className="enlace" href={fuentes.poblacion}>
          Real Decreto 1117/2025
        </a>
        ; resultados de 2023,{' '}
        <a className="enlace" href={fuentes.resultados2023}>
          Ministerio del Interior
        </a>
        .
      </p>
    </>
  );
}

const validosDe = (r: ReturnType<typeof resultado2023>) =>
  r.candidaturas.reduce((sum, c) => sum + c.votos, r.blanco);

const escenas = [
  { id: 'rp-origen', titulo: 'De dónde salen sus escaños' },
  { id: 'rp-dhondt', titulo: "D'Hondt paso a paso" },
  { id: 'rp-sin-escano', titulo: 'Votos sin escaño' },
  { id: 'rp-laboratorio', titulo: 'Laboratorio con partidos ficticios' },
  { id: 'rp-hemiciclo', titulo: 'Sus escaños entre los 350' },
];

function Escena({ n, intro, children }: { n: number; intro: ReactNode; children: ReactNode }) {
  const { id, titulo } = escenas[n]!;
  return (
    <section className="rp-seccion" id={id} aria-labelledby={`${id}-titulo`}>
      <span className="t-etiqueta info-etiqueta">
        {n + 1} de {escenas.length}
      </span>
      <h3 id={`${id}-titulo`} className="t-titular-s">
        {titulo}
      </h3>
      <p className="rp-intro">{intro}</p>
      {children}
    </section>
  );
}

// Cinco escenas animadas sobre la provincia elegida. Cada una tiene pasos, pausa y una tabla o un
// texto con la misma información; sin JavaScript o con movimiento reducido se ve el estado final.
function RepartoProvincia({ p }: { p: Provincia }) {
  const r = resultado2023(p.id);
  // Pequeña frente a grande: Soria si esta provincia es grande; Madrid si no.
  const otra = provincias.find((x) => x.id === (p.seats >= 10 ? '42' : '28'))!;
  const indice = provincias.indexOf(p);
  const poblacion = provincias.reduce((sum, x) => sum + x.population, 0);
  return (
    <section className="rp" aria-labelledby="rp-titulo">
      <h2 id="rp-titulo">Cómo se reparte el voto en {p.name}</h2>
      <nav aria-label="Escenas">
        <ol className="rp-indice">
          {escenas.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`}>{e.titulo}</a>
            </li>
          ))}
        </ol>
      </nav>

      <Escena
        n={0}
        intro="Cada provincia tiene un mínimo de escaños por ley y el resto depende de su población."
      >
        <OrigenEscanos nombre={p.name} provincia={p} poblacionReparto={poblacionReparto} />
      </Escena>

      <Escena
        n={1}
        intro={
          <>
            Cómo se convirtieron en escaños los votos de {p.name} en las generales de 2023, con los{' '}
            <a className="enlace" href={fuentes.resultados2023}>
              resultados oficiales
            </a>{' '}
            (art. 163 de la LOREG). Son datos de solo lectura.
          </>
        }
      >
        <DhondtPasoAPaso nombre={p.name} resultado={r} nulos={r.nulos} />
      </Escena>

      <Escena n={2} intro={`Votos de 2023 en ${p.name} que no eligieron a ningún diputado.`}>
        <VotosPerdidos nombre={p.name} resultado={r} />
      </Escena>

      <Escena
        n={3}
        intro={`Cuatro partidos inventados, A, B, C y D, con ${p.seats === 1 ? 'el escaño' : `los ${p.seats} escaños`} de ${p.name} en 2026 y sus votos válidos de 2023. No representan a ningún partido real ni son una encuesta o una proyección: sirven para ver cómo funciona la regla.`}
      >
        <Laboratorio
          nombre={p.name}
          escanos={p.seats}
          validos={validosDe(r)}
          otra={{
            nombre: otra.name,
            escanos: otra.seats,
            validos: validosDe(resultado2023(otra.id)),
          }}
        />
      </Escena>

      <Escena n={4} intro="Los escaños de la provincia dentro del Congreso.">
        <Hemiciclo
          nombre={p.name}
          escanos={p.seats}
          bloques={provincias.map((x) => x.seats)}
          inicio={provincias.slice(0, indice).reduce((sum, x) => sum + x.seats, 0)}
          poblacion={p.population / poblacion}
        />
      </Escena>
    </section>
  );
}
