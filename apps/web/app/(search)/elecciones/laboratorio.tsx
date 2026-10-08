'use client';

import { type ReactNode, useId, useState } from 'react';
import { cocientes, dhondt } from '../../../lib/congreso';
import { Bloque } from './bloque';

type Circunscripcion = { name: string; seats: number; validos: number };

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const porcentaje = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const lista = new Intl.ListFormat('es', { type: 'conjunction' });
const escanos = (n: number) => (n === 1 ? '1 escaño' : `${n} escaños`);

// Partidos ficticios y voto en blanco, en décimas de punto: siempre suman 1000, el 100 %.
const PARTIDOS = ['A', 'B', 'C', 'D'];
const INICIO = [380, 290, 170, 110, 50];
const EXPERIMENTOS = [
  { id: 'blanco', nombre: 'El blanco eleva la barrera', escenario: [360, 310, 241, 29, 60] },
  { id: 'tamano', nombre: 'Provincia pequeña y grande', escenario: [340, 280, 180, 140, 60] },
  { id: 'unir', nombre: 'Presentarse juntos: C + D', escenario: [400, 280, 140, 120, 60] },
  // Sin escenario: compara los porcentajes que haya.
  { id: 'participacion', nombre: '¿Y si vota más gente?' },
] as const;
const EMPATE = 'Hay un empate exacto en el último escaño: la ley lo resuelve por sorteo.';

/** Fija el valor `i` y reparte el resto entre los demás en proporción a lo que tenían. */
function ajustar(valores: readonly number[], i: number, valor: number) {
  const resto = valores.reduce((sum, v, j) => (j === i ? sum : sum + v), 0);
  const libre = 1000 - valor;
  const cuotas = valores.map((v, j) =>
    j === i ? valor : resto ? (v * libre) / resto : libre / (valores.length - 1),
  );
  const nuevos = cuotas.map(Math.floor);
  // Restos mayores, para que la suma vuelva a ser exactamente 1000.
  const faltan = 1000 - nuevos.reduce((sum, v) => sum + v, 0);
  for (const { j } of cuotas
    .map((c, j) => ({ j, resto: c - Math.floor(c) }))
    .sort((a, b) => b.resto - a.resto)
    .slice(0, faltan))
    nuevos[j] = (nuevos[j] ?? 0) + 1;
  return nuevos;
}

// El D'Hondt de #104. Con votos idénticos en el último escaño la ley sortea: no hay reparto.
function reparto(votos: readonly number[], blanco: number, seats: number) {
  try {
    return dhondt(votos, blanco, seats);
  } catch {
    return null;
  }
}
const sobreBarrera = (votos: readonly number[], blanco: number, seats: number) =>
  new Set(cocientes(votos, blanco, seats).map((q) => q.i));

/** Votos que tendría que sumar el partido `i`, con los demás iguales, para lograr un escaño más. */
function faltan(votos: readonly number[], blanco: number, seats: number, i: number, tiene: number) {
  const gana = (x: number) =>
    (reparto(
      votos.map((v, j) => (j === i ? v + x : v)),
      blanco,
      seats,
    )?.[i] ?? 0) > tiene;
  // Más votos nunca le quitan escaños: basta con buscar el primero que se lo da.
  let hasta = 1;
  while (!gana(hasta)) hasta *= 2;
  let desde = hasta / 2;
  while (hasta - desde > 1) {
    const medio = Math.floor((desde + hasta) / 2);
    if (gana(medio)) hasta = medio;
    else desde = medio;
  }
  return hasta;
}

/** Laboratorio con partidos ficticios sobre los escaños y los votos válidos de la provincia. */
export function Laboratorio({
  n,
  titulo,
  texto,
  provincia,
  comparar,
}: {
  n: string;
  titulo: string;
  texto: ReactNode;
  provincia: Circunscripcion;
  comparar: readonly Circunscripcion[];
}) {
  const [valores, setValores] = useState(INICIO);
  const [experimento, setExperimento] = useState<(typeof EXPERIMENTOS)[number]['id']>();
  const id = useId();
  const votos = valores.slice(0, 4);
  const blanco = valores[4] ?? 0;
  const { name, seats, validos } = provincia;
  const resultado = reparto(votos, blanco, seats);
  const dentro = sobreBarrera(votos, blanco, seats);
  const filas = [...PARTIDOS, 'En blanco'];
  // En votos de verdad, para decir cuántos le faltan a cada partido.
  const reales = votos.map((v) => (v * validos) / 1000);

  return (
    <Bloque
      n={n}
      titulo={titulo}
      texto={
        <>
          {texto}
          {/* Junto al texto que los anuncia; la explicación sale bajo los deslizadores. */}
          <div className="el-pasos el-experimentos" role="group" aria-label="Experimentos">
            {EXPERIMENTOS.map((x) => (
              <button
                key={x.id}
                type="button"
                className="boton-claro"
                aria-pressed={experimento === x.id}
                onClick={() => {
                  if (experimento === x.id) return setExperimento(undefined);
                  setExperimento(x.id);
                  if ('escenario' in x) setValores([...x.escenario]);
                }}
              >
                {x.nombre}
              </button>
            ))}
          </div>
        </>
      }
    >
      <ol className="el-dhondt el-lab">
        {filas.map((nombre, i) => {
          const v = valores[i] ?? 0;
          const n = resultado?.[i];
          const falta =
            n !== undefined && i < 4 && n < seats
              ? faltan(reales, (blanco * validos) / 1000, seats, i, n)
              : undefined;
          return (
            <li key={nombre}>
              <span className="el-siglas">
                <label htmlFor={`${id}-${i}`}>
                  {i < 4 && <span className="sr-only">Partido </span>}
                  {nombre}
                </label>{' '}
                {/* Sin anunciar: al mover uno cambian todos; los escaños los dice el resumen. */}
                <output htmlFor={`${id}-${i}`} aria-live="off" className="t-dato">
                  {porcentaje.format(v / 1000)}
                </output>
              </span>
              {i < 4 && (
                <span className="el-dhondt-escanos">
                  {seats > 1 && !dentro.has(i) ? (
                    'por debajo del 3 %'
                  ) : n === undefined ? (
                    '—'
                  ) : (
                    <>
                      {Array.from({ length: n }, (_, k) => (
                        <i key={k} aria-hidden="true" />
                      ))}{' '}
                      {n}
                      <span className="sr-only">{n === 1 ? ' escaño' : ' escaños'}</span>
                    </>
                  )}
                </span>
              )}
              <input
                id={`${id}-${i}`}
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={v / 10}
                aria-valuetext={porcentaje.format(v / 1000)}
                onChange={(e) =>
                  setValores(ajustar(valores, i, Math.round(Number(e.target.value) * 10)))
                }
              />
              {falta !== undefined && (
                <span className="el-faltan">
                  Le {falta === 1 ? 'falta 1 voto' : `faltan ${numero.format(falta)} votos`} para{' '}
                  {n ? 'otro escaño' : 'su primer escaño'}.
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="el-paso" aria-live="polite">
        <span className="sr-only">
          {resultado
            ? `Escaños: ${lista.format(PARTIDOS.map((p, i) => `${p}, ${resultado[i]}`))}. `
            : `${EMPATE} `}
        </span>
        {seats === 1
          ? 'Con un único escaño no hay barrera: gana el más votado.'
          : `Barrera del 3 %: ${numero.format(Math.ceil((validos * 3) / 100))} votos.`}
      </p>
      {experimento && (
        <div className="el-experimento caja-gris">
          {experimento === 'blanco' && <p>{textoBlanco(provincia, votos, blanco)}</p>}
          {experimento === 'tamano' && <Tamano comparar={comparar} votos={votos} blanco={blanco} />}
          {experimento === 'unir' && <p>{textoUnir(provincia, votos, blanco)}</p>}
          {experimento === 'participacion' && <p>{textoParticipacion(provincia, votos, blanco)}</p>}
        </div>
      )}
      <details className="el-tabla">
        <summary>Ver la tabla</summary>
        <div className="table-scroll">
          <table>
            <caption className="sr-only">
              Reparto de los {escanos(seats)} de {name} entre los partidos ficticios
            </caption>
            <thead>
              <tr>
                <th scope="col">Partido</th>
                <th scope="col">%</th>
                <th scope="col">Votos</th>
                <th scope="col">Escaños</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((nombre, i) => (
                <tr key={nombre}>
                  <th scope="row">{nombre}</th>
                  <td>{porcentaje.format((valores[i] ?? 0) / 1000)}</td>
                  <td>{numero.format(((valores[i] ?? 0) * validos) / 1000)}</td>
                  <td>{i < 4 ? (resultado?.[i] ?? '—') : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </Bloque>
  );
}

// Los mismos votos de A–D, con y sin el blanco: solo cambia la barrera.
function textoBlanco({ name, seats, validos }: Circunscripcion, votos: number[], blanco: number) {
  const queEs = 'El voto en blanco es un sobre vacío: cuenta como válido, pero no elige a nadie.';
  if (seats === 1)
    return `${queEs} En ${name}, con un único escaño, no hay barrera: el blanco no cambia nada.`;
  if (blanco === 0) return `${queEs} Ahora no hay ninguno: súbelo y mira cómo sube la barrera.`;
  const con = numero.format(Math.ceil((validos * 3) / 100));
  const sin = numero.format(Math.ceil((validos * (1000 - blanco) * 3) / 100_000));
  // Quienes superan el 3 % sin el blanco pero no con él.
  const dentro = sobreBarrera(votos, blanco, seats);
  const fuera = [...sobreBarrera(votos, 0, seats)].filter((i) => !dentro.has(i));
  if (fuera.length === 0)
    return `${queEs} Por eso sube la barrera del 3 % de ${sin} a ${con} votos. Aquí ningún partido está entre esas dos cifras, así que no cambia ningún escaño.`;
  const nombres = lista.format(fuera.map((i) => PARTIDOS[i] ?? ''));
  const uno = fuera.length === 1;
  const barrera = `${queEs} Por eso sube la barrera del 3 %: con él es de ${con} votos, y ${nombres}, con ${lista.format(fuera.map((i) => numero.format(((votos[i] ?? 0) * validos) / 1000)))}, se ${uno ? 'queda' : 'quedan'} fuera.`;
  const sinBlanco = reparto(votos, 0, seats);
  const conBlanco = reparto(votos, blanco, seats);
  if (!sinBlanco || !conBlanco) return `${barrera} ${EMPATE}`;
  const pierden = fuera.filter((i) => (sinBlanco[i] ?? 0) > 0);
  if (pierden.length === 0)
    return `${barrera} Sin el blanco bajaría a ${sin}, pero ${nombres} ${uno ? 'seguiría' : 'seguirían'} sin escaño: con ${seats} escaños, el 3 % no basta para lograr uno.`;
  const ganan = PARTIDOS.filter((_, i) => (conBlanco[i] ?? 0) > (sinBlanco[i] ?? 0));
  return `${barrera} Sin esos votos en blanco, la barrera bajaría a ${sin} y ${lista.format(pierden.map((i) => `${PARTIDOS[i]} tendría ${escanos(sinBlanco[i] ?? 0)}`))}, que ahora se ${ganan.length === 1 ? 'lleva' : 'llevan'} ${lista.format(ganan)}.`;
}

// Los mismos porcentajes en provincias de distinto tamaño, de menos a más escaños.
function Tamano({
  comparar,
  votos,
  blanco,
}: {
  comparar: readonly Circunscripcion[];
  votos: number[];
  blanco: number;
}) {
  const repartos = comparar.map((c) => ({ ...c, r: reparto(votos, blanco, c.seats) }));
  return (
    <>
      <p>
        {`Con los mismos porcentajes logran escaño: ${repartos
          .map(
            (c) =>
              `en ${c.name}, ${c.r ? lista.format(PARTIDOS.filter((_, i) => (c.r?.[i] ?? 0) > 0)) : 'empate en el último escaño'}`,
          )
          .join('; ')}.`}
      </p>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">Escaños con los mismos porcentajes</caption>
          <thead>
            <tr>
              <th scope="col">Partido</th>
              {repartos.map((c) => (
                <th key={c.name} scope="col">
                  {c.name} ({c.seats})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PARTIDOS.map((p, i) => (
              <tr key={p}>
                <th scope="row">{p}</th>
                {repartos.map((c) => (
                  <td key={c.name}>{c.r?.[i] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// C y D en listas separadas o en una sola lista, decidida antes de votar, con la suma de sus votos.
function textoUnir({ name, seats }: Circunscripcion, votos: number[], blanco: number) {
  const coalicion =
    'Antes de las elecciones, dos partidos pueden presentarse juntos en una sola lista.';
  const [a = 0, b = 0, c = 0, d = 0] = votos;
  const separadas = reparto(votos, blanco, seats);
  const juntas = reparto([a, b, c + d, 0], blanco, seats);
  if (!separadas || !juntas) return `${coalicion} ${EMPATE}`;
  const [sc = 0, sd = 0] = separadas.slice(2);
  const antes = sc + sd;
  const despues = juntas[2] ?? 0;
  const porSeparado = `En ${name}, por separado, con el ${porcentaje.format(c / 1000)} y el ${porcentaje.format(d / 1000)}, ${antes ? `C y D conseguirían ${sc} y ${sd} escaños` : 'ni C ni D conseguirían escaño'}.`;
  const juntos = `Juntos, con el ${porcentaje.format((c + d) / 1000)},`;
  if (antes === despues)
    return `${coalicion} ${porSeparado} ${juntos} ${antes ? `también ${antes}: no ganan nada` : 'tampoco'}.`;
  const pierden = ['A', 'B'].filter((_, i) => (juntas[i] ?? 0) < (separadas[i] ?? 0));
  const mas = despues - antes;
  return `${coalicion} ${porSeparado} ${juntos} conseguirían ${antes ? `${despues}: ${mas === 1 ? 'uno' : mas} más` : escanos(despues)}, a costa de ${lista.format(pierden)}. Con D'Hondt, juntos pueden sacar más que por separado.`;
}

// Los mismos porcentajes con un 10 % más de votos válidos: el reparto en votos de verdad.
function textoParticipacion({ seats, validos }: Circunscripcion, votos: number[], blanco: number) {
  const mas = Math.round(validos / 10);
  const repartoCon = (total: number) =>
    reparto(
      votos.map((v) => Math.round((v * total) / 1000)),
      Math.round((blanco * total) / 1000),
      seats,
    );
  const ahora = repartoCon(validos);
  const despues = repartoCon(validos + mas);
  if (!ahora || !despues) return EMPATE;
  const iguales = ahora.every((n, i) => n === despues[i]);
  const barrera = (total: number) => numero.format(Math.ceil((total * 3) / 100));
  return `Si votara un 10 % más de gente, ${numero.format(mas)} votos válidos más, con los mismos porcentajes, los escaños ${iguales ? "no cambiarían: D'Hondt solo mira las proporciones" : 'cambiarían por el redondeo de los votos'}.${seats > 1 ? ` Lo que sí sube es la barrera del 3 %: de ${barrera(validos)} a ${barrera(validos + mas)} votos.` : ''}`;
}
