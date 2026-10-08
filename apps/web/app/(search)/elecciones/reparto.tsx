import type { ReactNode } from 'react';
import { cocientes } from '../../../lib/congreso';
import { averagePerSeat, SEATS, type Provincia } from '../../../lib/elecciones';
import { RepartoDhondt } from './animaciones';

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const porcentaje = new Intl.NumberFormat('es-ES', { style: 'percent', maximumFractionDigits: 1 });
// Partes pequeñas del Congreso o de la población, como 0,57 %: dos cifras significativas.
const cuota = new Intl.NumberFormat('es-ES', { style: 'percent', maximumSignificantDigits: 2 });
const loreg163 = 'https://www.boe.es/buscar/act.php?id=BOE-A-1985-11672#a163';

// Cómo se eligen los diputados de la provincia elegida: sus escaños, el reparto de 2023, los votos
// que no eligieron a nadie y su peso en el Congreso.
export function Reparto({ p }: { p: Provincia }) {
  const r = p.results2023;
  return (
    <section id="reparto" className="el-reparto" aria-labelledby="el-reparto-titulo">
      <h2 id="el-reparto-titulo">Cómo se eligen los diputados de {p.name}</h2>
      <Bloque
        n="01"
        titulo="De dónde salen sus escaños"
        texto={
          <p>
            {p.seats === 1
              ? 'La ley da un escaño a Ceuta y otro a Melilla.'
              : 'Primero, los 2 escaños que la ley da a cada provincia; después, los que le tocan por su población.'}
          </p>
        }
      >
        <EscanosProvincia p={p} />
      </Bloque>
      <Bloque
        n="02"
        titulo="El reparto de 2023, escaño a escaño"
        texto={
          <>
            <p>
              Los votos de cada candidatura se dividen entre 1, 2, 3… y los escaños van, uno a uno,
              a los cocientes más altos: es el método D'Hondt (
              <a className="enlace" href={loreg163}>
                art. 163 de la LOREG
              </a>
              ).
            </p>
            <p>
              {r.seats === 1
                ? `Así se eligió el escaño de ${p.name} en las generales de julio de 2023.`
                : `Así se repartieron los ${r.seats} escaños de ${p.name} en las generales de julio de 2023${r.seats === p.seats ? '' : `; en 2026 elige ${p.seats}`}.`}
            </p>
          </>
        }
      >
        <RepartoDhondt
          key={p.id}
          escanos={r.seats}
          blanco={r.blank}
          candidaturas={r.candidatures}
        />
      </Bloque>
      <Bloque
        n="03"
        titulo="Votos que no eligieron a nadie"
        texto={
          <p>
            Los votos a candidaturas que se quedan sin escaño no eligen a ningún diputado. Tampoco
            los votos en blanco{r.seats > 1 && ', que sí cuentan para calcular la barrera del 3 %'},
            ni los nulos.
          </p>
        }
      >
        <VotosSinEscano p={p} />
      </Bloque>
      <Bloque
        n="04"
        titulo="Sus escaños entre los 350"
        texto={
          <p>
            Los diputados de las 52 circunscripciones forman el Congreso. Cada punto es un escaño;
            {p.seats === 1 ? ' el' : ' los'} de {p.name}, en amarillo.
          </p>
        }
      >
        <Hemiciclo p={p} />
      </Bloque>
    </section>
  );
}

function Bloque({
  n,
  titulo,
  texto,
  children,
}: {
  n: string;
  titulo: string;
  texto: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="el-bloque" aria-labelledby={`el-bloque-${n}`}>
      <div className="el-bloque-texto">
        <span className="t-etiqueta">{n}</span>
        <h3 id={`el-bloque-${n}`} className="t-titular-s">
          {titulo}
        </h3>
        {texto}
      </div>
      <div>{children}</div>
    </section>
  );
}

// 01: los escaños que la ley da a cada provincia y los que le tocan por su población, sin animación.
function EscanosProvincia({ p }: { p: Provincia }) {
  const cambio = p.seats - p.seats2023;
  return (
    <>
      <div aria-hidden="true">
        <div className="el-escanos">
          {/* Si tenía más escaños en 2023, el que pierde se dibuja vacío. */}
          {Array.from({ length: Math.max(p.seats, p.seats2023) }, (_, i) => (
            <span
              key={i}
              className="el-escano"
              data-tipo={
                i < 2 ? 'ley' : i >= p.seats ? 'perdido' : i >= p.seats2023 ? 'nuevo' : 'poblacion'
              }
            />
          ))}
        </div>
        <ul className="el-leyenda">
          <li>
            <span className="el-escano" data-tipo="ley" /> Por ley
          </li>
          {p.seats > 2 && (
            <li>
              <span className="el-escano" data-tipo="poblacion" /> Por población
            </li>
          )}
          {cambio > 0 && (
            <li>
              <span className="el-escano" data-tipo="nuevo" /> Nuevo frente a 2023
            </li>
          )}
          {cambio < 0 && (
            <li>
              <span className="el-escano" data-tipo="perdido" /> Lo elegía en 2023
            </li>
          )}
        </ul>
      </div>
      {p.seats > 1 && (
        <p className="el-paso">
          {p.seats === 2
            ? 'Por población no le corresponde ninguno más: elige 2.'
            : `Por población le corresponden ${p.seats - 2} más: elige ${p.seats}.`}
          {cambio !== 0 &&
            ` En 2023 elegía ${p.seats2023}; ahora elige ${Math.abs(cambio)} ${cambio > 0 ? 'más' : 'menos'}.`}
        </p>
      )}
    </>
  );
}

// 03: votos emitidos en 2023 según su destino, en total de la provincia y sin siglas.
function VotosSinEscano({ p }: { p: Provincia }) {
  const r = p.results2023;
  const dentro = new Set(
    cocientes(
      r.candidatures.map((c) => c.votes),
      r.blank,
      r.seats,
    ).map((q) => q.i),
  );
  const votos = (f: (seats: number, i: number) => boolean) =>
    r.candidatures.reduce((sum, c, i) => (f(c.seats, i) ? sum + c.votes : sum), 0);
  const sinEscano = votos((seats) => seats === 0);
  const noVotaron = r.census - r.voters;
  const filas = [
    { tono: 'escano', texto: 'A candidaturas con escaño', votos: votos((seats) => seats > 0) },
    // Ceuta y Melilla no tienen barrera.
    ...(r.seats === 1
      ? [{ tono: 'sin', texto: 'A candidaturas sin escaño', votos: sinEscano }]
      : [
          {
            tono: 'sin',
            texto: 'A candidaturas sin escaño que superaron el 3 %',
            votos: votos((seats, i) => seats === 0 && dentro.has(i)),
          },
          {
            tono: 'bajo',
            texto: 'A candidaturas por debajo del 3 %',
            votos: votos((_, i) => !dentro.has(i)),
          },
        ]),
    { tono: 'blanco', texto: 'En blanco', votos: r.blank },
    { tono: 'nulo', texto: 'Nulos', votos: r.invalid },
  ];
  return (
    <>
      <p className="el-votos-cifra">
        En 2023, <strong className="t-dato">{numero.format(sinEscano)}</strong> votos, el{' '}
        {porcentaje.format(sinEscano / r.voters)} de los emitidos, fueron a candidaturas que no
        obtuvieron escaño.
      </p>
      <div className="el-votos" aria-hidden="true">
        {filas.map((f) => (
          <span key={f.tono} data-tono={f.tono} style={{ flexGrow: f.votos }} />
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            Votos emitidos en {p.name} en 2023, según su destino
          </caption>
          <thead>
            <tr>
              <th scope="col">Destino del voto</th>
              <th scope="col">Votos</th>
              <th scope="col">% de los emitidos</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.tono}>
                <th scope="row">
                  <span className="el-muestra" data-tono={f.tono} aria-hidden="true" />
                  {f.texto}
                </th>
                <td>{numero.format(f.votos)}</td>
                <td>{porcentaje.format(f.votos / r.voters)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Votos emitidos</th>
              <td>{numero.format(r.voters)}</td>
              <td>{porcentaje.format(1)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="el-paso">
        {`Además, ${numero.format(noVotaron)} personas con derecho a voto no votaron: el ${porcentaje.format(noVotaron / r.census)} del censo, que incluye a quienes viven en el extranjero.`}
      </p>
    </>
  );
}

// Hemiciclo de 350 escaños en 10 filas, cada una con escaños en proporción a su radio para que
// queden igual de separados. Van de izquierda a derecha: los de una provincia forman una cuña.
const radios = Array.from({ length: 10 }, (_, f) => 40 + (60 * f) / 9);
const sumaRadios = radios.reduce((a, b) => a + b, 0);
const asientos = radios
  .flatMap((r) => {
    const n = Math.round((SEATS * r) / sumaRadios);
    return Array.from({ length: n }, (_, k) => {
      const a = Math.PI * (1 - k / (n - 1));
      return { a, x: +(r * Math.cos(a)).toFixed(1), y: +(-r * Math.sin(a)).toFixed(1) };
    });
  })
  .sort((p, q) => q.a - p.a);

// 04: los escaños de la provincia entre los 350 del Congreso, sin animación.
function Hemiciclo({ p }: { p: Provincia }) {
  return (
    <>
      <svg className="el-svg el-hemiciclo" viewBox="-104 -104 208 108" aria-hidden="true">
        {asientos.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="2.6" data-tuyo={i < p.seats ? '' : undefined} />
        ))}
        <line x1="0" y1="-104" x2="0" y2="0" />
      </svg>
      <p className="el-paso">
        {`${p.name} elige ${p.seats} ${p.seats === 1 ? 'escaño' : 'escaños'}, el ${cuota.format(p.seats / SEATS)} del Congreso, y tiene el ${cuota.format(p.population / (averagePerSeat * SEATS))} de la población de España. La línea marca la mitad: la mayoría absoluta son 176.`}
      </p>
    </>
  );
}
