'use client';

import { useEffect, useId, useState } from 'react';
import { cocientes } from '../../../lib/congreso';

const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
const lista = new Intl.ListFormat('es', { type: 'conjunction' });

/** 02: D'Hondt con los resultados de 2023, escaño a escaño, hasta el reparto oficial. */
export function RepartoDhondt({
  escanos,
  blanco,
  candidaturas,
}: {
  escanos: number;
  blanco: number;
  candidaturas: readonly { acronym: string; votes: number }[];
}) {
  const votos = candidaturas.map((c) => c.votes);
  const todos = cocientes(votos, blanco, escanos);
  // Los cocientes ganadores, en el orden en que se llevan cada escaño.
  const orden = todos.slice(0, escanos);
  const ganados = (i: number, paso: number) => orden.slice(0, paso).filter((q) => q.i === i).length;
  const pasan = new Set(todos.map((q) => q.i));
  const dentro = candidaturas.flatMap((c, i) => (pasan.has(i) ? [{ ...c, i }] : []));
  const fuera = candidaturas.filter((_, i) => !pasan.has(i));
  const validos = votos.reduce((sum, v) => sum + v, blanco);
  const maximo = Math.max(...votos);
  const final = lista.format(
    dentro
      .filter((c) => ganados(c.i, escanos) > 0)
      .map((c) => `${c.acronym} (${ganados(c.i, escanos)})`),
  );
  const pasos = [
    escanos === 1
      ? `${numero.format(validos)} votos válidos. Con un único escaño gana la candidatura más votada: no hay barrera del 3 %.`
      : `${numero.format(validos)} votos válidos, ${numero.format(blanco)} de ellos en blanco. Para entrar en el reparto hace falta el 3 %: ${numero.format(Math.ceil((validos * 3) / 100))} votos.`,
    ...orden.map(
      (q, k) =>
        `Escaño ${k + 1} de ${escanos}: ${candidaturas[q.i]?.acronym}, ${numero.format(q.votes)} ÷ ${q.divisor} = ${numero.format(q.votes / q.divisor)}.`,
    ),
    // El resumen, que es también el estado inicial, no resalta ninguna candidatura.
    `Así quedó el reparto oficial de 2023: ${final}.`,
  ];
  // Hasta el primer cociente que ya no gana escaño en la candidatura con más escaños.
  const divisores = Math.min(escanos, Math.max(...dentro.map((c) => ganados(c.i, escanos))) + 1);

  // Animación por pasos, cada uno con su frase. Empieza en el estado final, con toda la información, y
  // «Reproducir» la recorre una vez desde el principio; «Pausar» la detiene donde está. La frase calla
  // mientras se reproduce. Con movimiento reducido, el CSS quita las transiciones: los pasos no cambian.
  const ultimo = pasos.length - 1;
  const [paso, setPaso] = useState(ultimo);
  const [reproduciendo, setReproduciendo] = useState(false);
  const ayuda = useId();
  // 12 s como mucho: el reparto de Madrid tiene 39 pasos.
  const intervalo = Math.min(1200, 12_000 / pasos.length);

  useEffect(() => {
    if (!reproduciendo) return;
    const t = setTimeout(() => {
      setPaso(paso + 1);
      if (paso + 1 === ultimo) setReproduciendo(false);
    }, intervalo);
    return () => clearTimeout(t);
  }, [reproduciendo, paso, ultimo, intervalo]);

  return (
    <>
      <ol className="el-dhondt" aria-hidden="true">
        {dentro.map((c) => {
          const n = ganados(c.i, paso);
          const resumen = paso > escanos;
          // Cociente con el que opta al escaño de este paso: el de quien gana es el más alto,
          // y encoge en el paso siguiente. En el resumen, la barra son los votos.
          const divisor = resumen ? 1 : ganados(c.i, Math.max(0, paso - 1)) + 1;
          return (
            <li key={c.i} data-escanos={n} data-gana={orden[paso - 1]?.i === c.i ? '' : undefined}>
              <span className="el-siglas">{c.acronym}</span>
              <span className="el-dhondt-escanos">
                {Array.from({ length: n }, (_, k) => (
                  <i key={k} />
                ))}{' '}
                {n}
              </span>
              <span className="el-dhondt-barra">
                <i style={{ transform: `scaleX(${c.votes / divisor / maximo})` }} />
              </span>
              <span className="el-dhondt-cociente t-dato">
                {resumen
                  ? `${numero.format(c.votes)} votos`
                  : `÷${divisor} = ${numero.format(c.votes / divisor)}`}
              </span>
            </li>
          );
        })}
      </ol>
      {fuera.length > 0 && (
        <p className="el-dhondt-fuera">
          Por debajo del 3 %, fuera del reparto: {fuera.length}{' '}
          {fuera.length === 1 ? 'candidatura' : 'candidaturas'} con{' '}
          {numero.format(fuera.reduce((sum, c) => sum + c.votes, 0))} votos.
        </p>
      )}
      <div className="el-pasos">
        <button
          type="button"
          className="boton-claro"
          aria-describedby={ayuda}
          onClick={() => {
            if (!reproduciendo && paso === ultimo) setPaso(0);
            setReproduciendo(!reproduciendo);
          }}
        >
          {reproduciendo ? 'Pausar' : 'Reproducir'}
        </button>
        <span id={ayuda}>Muestra paso a paso cómo se llega a este resultado.</span>
      </div>
      <p className="el-paso" aria-live={reproduciendo ? 'off' : 'polite'}>
        {pasos[paso]}
      </p>
      <details className="el-tabla">
        <summary>Ver la tabla de divisores</summary>
        <div className="table-scroll">
          <table className="el-divisores">
            <caption>
              {escanos === 1
                ? 'Votos de cada candidatura: el más alto gana el escaño.'
                : `Votos de cada candidatura que supera la barrera, divididos entre 1, 2, 3… Ganan escaño los ${escanos} cocientes más altos; entre paréntesis, su orden.`}
            </caption>
            <thead>
              <tr>
                <th scope="col">Divisor</th>
                {dentro.map((c) => (
                  <th key={c.i} scope="col">
                    {c.acronym}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: divisores }, (_, d) => (
                <tr key={d}>
                  <th scope="row">÷ {d + 1}</th>
                  {dentro.map((c) => {
                    const k = orden.findIndex((q) => q.i === c.i && q.divisor === d + 1);
                    const ganado = k >= 0 && k < paso;
                    return (
                      <td
                        key={c.i}
                        data-escano={ganado ? '' : undefined}
                        data-gana={ganado && k === paso - 1 ? '' : undefined}
                      >
                        {numero.format(c.votes / (d + 1))}
                        {ganado ? ` (${k + 1}.º)` : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </>
  );
}
