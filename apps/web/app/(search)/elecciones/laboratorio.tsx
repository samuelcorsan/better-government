'use client';

import { useState } from 'react';
import {
  experimentos,
  labDesde,
  PARTIDOS,
  repartoLab,
  type Experimento,
  type Lab,
} from '../../../lib/reparto';
import {
  Controles,
  escanosDe,
  numero,
  porcentaje,
  porcentajeFino,
  useSecuencia,
  visible,
} from './reparto';

const reparto = (l: Lab, escanos: number[]) =>
  l.etiquetas
    .map((e, i) => (e ? `${e} ${escanos[i]}` : ''))
    .filter(Boolean)
    .join(', ');
const nombres: Experimento[] = ['blanco', 'tamano', 'union'];

// Partidos ficticios A, B, C y D: nunca nombres, siglas ni colores de partidos reales.
export function Laboratorio({
  nombre,
  escanos,
  validos,
  otra,
}: {
  nombre: string;
  escanos: number;
  /** Votos válidos reales de la provincia en 2023. */
  validos: number;
  /** Provincia de contraste, pequeña si esta es grande y al revés. */
  otra: { nombre: string; escanos: number; validos: number };
}) {
  const [experimento, setExperimento] = useState<Experimento>('blanco');
  const [porcentajes, setPorcentajes] = useState<number[]>(experimentos.blanco.inicio);
  const s = useSecuencia(2, 1400, false);

  const antes = labDesde(porcentajes, validos, escanos);
  const despues = experimentos[experimento].despues(antes, otra);
  const ra = repartoLab(antes);
  const rd = repartoLab(despues);
  const actual = s.paso === 0 ? { l: antes, r: ra } : { l: despues, r: rd };
  // Escala común a los dos estados: la barra mide la parte de los votos válidos.
  const maximo = Math.max(
    ...antes.votos.map((v) => v / ra.validos),
    ...despues.votos.map((v) => v / rd.validos),
  );
  const donde = (l: Lab) => (l.escanos === escanos ? nombre : otra.nombre);
  const empate =
    'Empate a votos en el último escaño: la ley lo resuelve por sorteo. Mueve un poco los votos.';

  const textoAntes = ra.escanos
    ? `En ${nombre}, con ${escanosDe(escanos)} y ${numero.format(ra.validos)} votos válidos, la barrera del 3 % está en ${numero.format(ra.barrera)} votos. Reparto: ${reparto(antes, ra.escanos)}.`
    : empate;
  let textoDespues = empate;
  if (ra.escanos && rd.escanos) {
    if (experimento === 'blanco') {
      const extra = despues.blanco - antes.blanco;
      const caida = antes.votos.findIndex((v) => v >= ra.barrera && v < rd.barrera);
      textoDespues =
        escanos === 1
          ? 'Con un solo escaño no hay barrera del 3 %: el voto en blanco no deja a nadie fuera.'
          : caida < 0
            ? 'Para ver el efecto, al menos dos candidaturas tienen que superar la barrera.'
            : `Si ${numero.format(extra)} personas más votan en blanco, los votos válidos suben a ${numero.format(rd.validos)} y la barrera, a ${numero.format(rd.barrera)}. ${PARTIDOS[caida]} queda fuera${ra.escanos[caida] ? ` y pierde ${escanosDe(ra.escanos[caida]!)}` : ': no tenía escaño, así que el reparto no cambia. Con tan pocos escaños, lo que decide no es la barrera sino el número de escaños'}. Reparto: ${reparto(despues, rd.escanos)}.`;
    } else if (experimento === 'tamano') {
      textoDespues = `Con los mismos porcentajes en ${otra.nombre} (${escanosDe(otra.escanos)}): ${reparto(despues, rd.escanos)}. Cuantos más escaños, más se parece el reparto a los porcentajes de voto.`;
    } else {
      const separadas = ra.escanos[2]! + ra.escanos[3]!;
      const juntas = rd.escanos[2]!;
      textoDespues = `Juntas, C+D suman ${numero.format(despues.votos[2]!)} votos y logran ${escanosDe(juntas)}; por separado tenían ${separadas}. ${juntas === separadas ? 'En este caso, unirse no cambia el reparto.' : `Unirse ${juntas > separadas ? 'les da' : 'les quita'} ${escanosDe(Math.abs(juntas - separadas))}.`} Reparto: ${reparto(despues, rd.escanos)}.`;
    }
  }

  const elegir = (e: Experimento) => {
    setExperimento(e);
    setPorcentajes(experimentos[e].inicio);
    s.ir(0);
  };
  const etiquetasControl = [...PARTIDOS, 'En blanco'];
  const suma = porcentajes.reduce((a, b) => a + b, 0);

  return (
    <div className="rp-escenario rp-lab" data-paso={s.paso}>
      <fieldset className="rp-experimentos">
        <legend>Experimento</legend>
        {nombres.map((e) => (
          <label key={e} className="pildora">
            <input
              type="radio"
              name="rp-experimento"
              checked={experimento === e}
              onChange={() => elegir(e)}
            />
            {experimentos[e].titulo}
          </label>
        ))}
      </fieldset>

      <div className="rp-lienzo" aria-hidden="true">
        <p className="t-etiqueta">
          {s.paso === 0 ? 'Antes' : 'Después'} · {donde(actual.l)} · {escanosDe(actual.l.escanos)}
        </p>
        <div className="rp-lab-filas">
          {actual.l.etiquetas.map((e, i) => {
            const parte = actual.l.votos[i]! / actual.r.validos;
            const fuera = actual.l.votos[i]! < actual.r.barrera;
            return (
              <div className="rp-lab-fila" key={i} data-fuera={visible(fuera)}>
                <span className="rp-lab-letra">{e || PARTIDOS[i]}</span>
                <span className="rp-lab-pista">
                  <i style={{ transform: `scaleX(${parte / maximo})` }} />
                  {actual.r.barrera > 0 && (
                    <b
                      className="rp-lab-barrera"
                      style={{
                        transform: `translateX(${(actual.r.barrera / actual.r.validos / maximo) * 100}%)`,
                      }}
                    />
                  )}
                </span>
                <span className="rp-lab-dato t-dato">
                  {e ? porcentajeFino.format(parte) : 'unida a C'}
                  {e && fuera && <small>fuera</small>}
                </span>
                <span className="rp-mini">
                  {Array.from({ length: actual.r.escanos?.[i] ?? 0 }, (_, k) => (
                    <i key={k} data-visible="" />
                  ))}
                </span>
              </div>
            );
          })}
        </div>
        <p className="rp-lab-leyenda">La línea vertical marca la barrera del 3 %.</p>
      </div>

      <Controles
        s={s}
        nombre={experimentos[experimento].titulo}
        textos={[textoAntes, textoDespues]}
      />

      <div className="table-scroll">
        <table className="rp-tabla">
          <caption className="sr-only">
            {experimentos[experimento].titulo}: votos y escaños antes y después
          </caption>
          <thead>
            <tr>
              <th scope="col">Candidatura ficticia</th>
              <th scope="col">Votos antes</th>
              <th scope="col">Escaños antes</th>
              <th scope="col">Votos después</th>
              <th scope="col">Escaños después</th>
            </tr>
          </thead>
          <tbody>
            {PARTIDOS.map((p, i) => (
              <tr key={p}>
                <th scope="row">{p}</th>
                <td className="t-dato">{numero.format(antes.votos[i]!)}</td>
                <td className="t-dato">{ra.escanos?.[i] ?? '—'}</td>
                {despues.etiquetas[i] ? (
                  <>
                    <td className="t-dato">
                      {numero.format(despues.votos[i]!)}
                      {despues.etiquetas[i] !== p && ` (${despues.etiquetas[i]})`}
                    </td>
                    <td className="t-dato">{rd.escanos?.[i] ?? '—'}</td>
                  </>
                ) : (
                  <td colSpan={2}>Unida a C</td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">En blanco</th>
              <td className="t-dato">{numero.format(antes.blanco)}</td>
              <td />
              <td className="t-dato">{numero.format(despues.blanco)}</td>
              <td />
            </tr>
            <tr>
              <th scope="row">Barrera del 3 %</th>
              <td className="t-dato">{ra.barrera ? numero.format(ra.barrera) : 'Sin barrera'}</td>
              <td />
              <td className="t-dato">{rd.barrera ? numero.format(rd.barrera) : 'Sin barrera'}</td>
              <td />
            </tr>
            <tr>
              <th scope="row">Escaños en juego</th>
              <td />
              <td className="t-dato">{antes.escanos}</td>
              <td />
              <td className="t-dato">{despues.escanos}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <fieldset className="rp-mandos">
        <legend>Prueba con otros votos, en % de los votos válidos de {nombre} en 2023</legend>
        {etiquetasControl.map((e, i) => (
          <label key={e}>
            {e === 'En blanco' ? e : `Partido ${e}`}
            <output className="t-dato">
              <span>{porcentajeFino.format(porcentajes[i]! / 100)}</span>
              <span>{numero.format(Math.round((porcentajes[i]! * validos) / 100))} votos</span>
            </output>
            <input
              type="range"
              min={0}
              max={60}
              step={0.1}
              value={porcentajes[i]}
              onChange={(ev) =>
                setPorcentajes(
                  porcentajes.map((x, j) => (j === i ? Number(ev.currentTarget.value) : x)),
                )
              }
            />
          </label>
        ))}
        {Math.abs(suma - 100) > 0.05 && (
          <p className="rp-nota">
            Suman {porcentaje.format(suma / 100)}: es como si votaran {suma > 100 ? 'más' : 'menos'}{' '}
            personas que en 2023.
          </p>
        )}
      </fieldset>
    </div>
  );
}
