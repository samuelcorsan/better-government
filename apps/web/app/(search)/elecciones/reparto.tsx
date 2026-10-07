'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  hemiciclo,
  origenEscanos,
  pasosDhondt,
  votosSinEscano,
  type Resultado,
} from '../../../lib/reparto';

export const numero = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 });
export const porcentaje = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 1,
});
// Con dos decimales: 2,96 % no se confunde con un 3 % que supera la barrera.
export const porcentajeFino = new Intl.NumberFormat('es-ES', {
  style: 'percent',
  maximumFractionDigits: 2,
});
const decimal = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 });
export const escanosDe = (n: number) => `${n} ${n === 1 ? 'escaño' : 'escaños'}`;

/**
 * Secuencia de pasos con reproducción. Sin JavaScript o con movimiento reducido se queda en el
 * último paso, que reúne toda la información; si no, vuelve al principio antes de verse y se
 * reproduce una vez al llegar a ella.
 */
export function useSecuencia(total: number, ritmo: number, auto = true) {
  const ultimo = total - 1;
  // Sin reproducción automática (el laboratorio), empieza por el principio.
  const [paso, setPaso] = useState(auto ? ultimo : 0);
  const [reproduciendo, setReproduciendo] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!auto || !el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Lo que ya está en pantalla no salta al principio.
    if (el.getBoundingClientRect().top < innerHeight) return;
    setPaso(0);
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setReproduciendo(true);
          observador.disconnect();
        }
      },
      { rootMargin: '0px 0px -35% 0px' },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, [auto]);

  useEffect(() => {
    if (!reproduciendo) return;
    const t = setTimeout(() => {
      setPaso(Math.min(paso + 1, ultimo));
      if (paso + 1 >= ultimo) setReproduciendo(false);
    }, ritmo);
    return () => clearTimeout(t);
  }, [reproduciendo, paso, ultimo, ritmo]);

  const ir = (n: number) => {
    setReproduciendo(false);
    setPaso(Math.max(0, Math.min(ultimo, n)));
  };
  return {
    ref,
    paso,
    total,
    reproduciendo,
    ir,
    alternar() {
      if (reproduciendo) return setReproduciendo(false);
      if (paso >= ultimo) setPaso(0);
      setReproduciendo(true);
    },
  };
}

type Secuencia = ReturnType<typeof useSecuencia>;

/** Reproducir o pausar, paso anterior y siguiente, y el texto del paso como equivalente. */
export function Controles({
  s,
  nombre,
  textos,
}: {
  s: Secuencia;
  nombre: string;
  textos: readonly ReactNode[];
}) {
  const ultimo = s.total - 1;
  // aria-disabled en lugar de disabled: el foco no se pierde al llegar al primer o último paso.
  return (
    <>
      <div className="rp-controles" role="group" aria-label={`Pasos: ${nombre}`}>
        <button type="button" className="boton-claro" onClick={s.alternar}>
          {s.reproduciendo ? 'Pausar' : s.paso >= ultimo ? 'Volver a ver' : 'Reproducir'}
        </button>
        <button
          type="button"
          className="boton-claro"
          aria-disabled={s.paso === 0}
          onClick={() => s.ir(s.paso - 1)}
        >
          Anterior
        </button>
        <button
          type="button"
          className="boton-claro"
          aria-disabled={s.paso === ultimo}
          onClick={() => s.ir(s.paso + 1)}
        >
          Siguiente
        </button>
        <span className="t-etiqueta rp-contador">
          Paso {s.paso + 1} de {s.total}
        </span>
      </div>
      {/* Mientras se reproduce no se anuncia cada paso; al pausar o avanzar a mano, sí. */}
      <p className="rp-narracion" aria-live={s.reproduciendo ? 'off' : 'polite'}>
        {textos[s.paso]}
      </p>
    </>
  );
}

export const visible = (si: boolean) => (si ? '' : undefined);

export function OrigenEscanos({
  nombre,
  provincia,
  poblacionReparto,
}: {
  nombre: string;
  provincia: { population: number; seats: number; seats2023: number };
  poblacionReparto: number;
}) {
  const o = origenEscanos(provincia, poblacionReparto);
  const s = useSecuencia(3, 1600);
  const base = Math.floor(o.exacto);
  const cambio =
    o.cambio === 0
      ? `En 2023 también elegía ${provincia.seats2023}.`
      : `En 2023 elegía ${provincia.seats2023}: ahora ${o.cambio > 0 ? 'gana' : 'pierde'} ${escanosDe(Math.abs(o.cambio))}.`;
  const textos =
    o.minimo === 1
      ? [
          `${nombre} elige un único escaño, fijado por la ley (art. 162.2 de la LOREG).`,
          `No entra en el reparto por población: los 248 escaños restantes son para las 50 provincias.`,
          cambio,
        ]
      : [
          `${nombre} parte de 2 escaños: el mínimo que la ley da a cada provincia (art. 162.2).`,
          `Los 248 escaños restantes se reparten por población, uno por cada ${numero.format(o.cuota)} habitantes. ${nombre}, con ${numero.format(provincia.population)}, suma ${decimal.format(o.exacto)}: ${escanosDe(base)}${o.restoMayor ? ' y uno más por tener uno de los restos más altos' : ''}. En total, ${escanosDe(provincia.seats)}.`,
          cambio,
        ];
  const fila = (n: number, anio: string, marcar: (i: number) => string) => (
    <div className="rp-fila-escanos">
      <span className="t-etiqueta">{anio}</span>
      <span className="rp-puntos">
        {Array.from({ length: n }, (_, i) => (
          <i key={i} data-tipo={marcar(i)} style={{ transitionDelay: `${i * 30}ms` }} />
        ))}
      </span>
    </div>
  );

  return (
    <div ref={s.ref} className="rp-escenario" data-paso={s.paso}>
      <div className="rp-lienzo" aria-hidden="true">
        {fila(Math.max(provincia.seats, provincia.seats2023), '2026', (i) =>
          i >= provincia.seats
            ? s.paso >= 2
              ? 'perdido'
              : 'oculto'
            : i < o.minimo
              ? 'minimo'
              : s.paso < 1
                ? 'oculto'
                : s.paso >= 2 && i >= provincia.seats2023
                  ? 'nuevo'
                  : 'poblacion',
        )}
        <div className="rp-aparece" data-visible={visible(s.paso >= 2)}>
          {fila(provincia.seats2023, '2023', () => 'antes')}
        </div>
        <ul className="rp-leyenda">
          <li>
            <i data-tipo="minimo" /> Mínimo legal
          </li>
          {o.minimo === 2 && (
            <li>
              <i data-tipo="poblacion" /> Por población
            </li>
          )}
          {o.cambio > 0 && (
            <li>
              <i data-tipo="nuevo" /> Nuevo frente a 2023
            </li>
          )}
          {o.cambio < 0 && (
            <li>
              <i data-tipo="perdido" /> Perdido frente a 2023
            </li>
          )}
        </ul>
      </div>
      <Controles s={s} nombre="de dónde salen tus escaños" textos={textos} />
      <div className="table-scroll">
        <table className="rp-tabla rp-tabla-corta">
          <caption className="sr-only">Origen de los escaños de {nombre}</caption>
          <tbody>
            <tr>
              <th scope="row">Mínimo legal (art. 162.2)</th>
              <td>{o.minimo}</td>
            </tr>
            <tr>
              <th scope="row">Por población (art. 162.3)</th>
              <td>
                {o.porPoblacion}
                {o.minimo === 2 &&
                  ` (cuota ${decimal.format(o.exacto)}${o.restoMayor ? `: ${base} + 1 por resto mayor` : ''})`}
              </td>
            </tr>
            <tr>
              <th scope="row">Total en 2026</th>
              <td>{provincia.seats}</td>
            </tr>
            <tr>
              <th scope="row">En 2023</th>
              <td>{provincia.seats2023}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DhondtPasoAPaso({
  nombre,
  resultado,
  nulos,
}: {
  nombre: string;
  resultado: Resultado;
  nulos: number;
}) {
  const { candidaturas, escanos, blanco } = resultado;
  const votos = candidaturas.map((c) => c.votos);
  const d = pasosDhondt(votos, blanco, escanos);
  // Más rápido cuanto más escaños: Madrid no tarda más de medio minuto.
  const s = useSecuencia(3 + escanos, Math.max(500, Math.min(1400, 20000 / escanos)));
  const asignados = Math.max(0, s.paso - 2);
  const fuera = d.supera.filter((x) => !x).length;
  const contenedor = useRef<HTMLDivElement>(null);
  const oficial = candidaturas.every((c, i) => c.escanos === d.reparto[i]);

  // Sigue al escaño actual en la tabla sin mover la página. Al cargar, la tabla empieza a la
  // izquierda, con las candidaturas y sus escaños a la vista.
  const pasoMostrado = useRef(s.paso);
  useEffect(() => {
    if (pasoMostrado.current === s.paso) return;
    pasoMostrado.current = s.paso;
    const c = contenedor.current;
    const celda = c?.querySelector('[data-actual]');
    if (!c || !celda) return;
    const a = c.getBoundingClientRect();
    const b = celda.getBoundingClientRect();
    const fija = c.querySelector('tbody th')?.getBoundingClientRect().width ?? 0;
    if (b.left < a.left + fija) c.scrollLeft -= a.left + fija - b.left;
    else if (b.right > a.right) c.scrollLeft += b.right - a.right;
  }, [s.paso]);

  const textos = [
    `En 2023, ${nombre} elegía ${escanosDe(escanos)}. Hubo ${numero.format(d.validos)} votos válidos: ${numero.format(d.validos - blanco)} a candidaturas y ${numero.format(blanco)} en blanco. Los ${numero.format(nulos)} nulos no cuentan.`,
    escanos === 1
      ? 'Con un solo escaño no hay barrera: gana la candidatura más votada (art. 163.2).'
      : `Barrera del 3 %: hacen falta ${numero.format(d.barrera)} votos. ${fuera === 0 ? 'Todas las candidaturas la superan.' : `${fuera === 1 ? 'Una candidatura se queda fuera' : `${fuera} candidaturas se quedan fuera`}.`}`,
    `Se divide el voto de cada candidatura entre 1, 2, 3… Los ${escanos === 1 ? 'cociente más alto se lleva' : `${escanos} cocientes más altos se llevan`} un escaño.`,
    ...d.orden.map((q, k) => {
      const c = candidaturas[q.i]!;
      const linea = `Escaño ${k + 1} de ${escanos}: ${c.sigla}, ${numero.format(c.votos)} ÷ ${q.divisor} = ${numero.format(c.votos / q.divisor)}.`;
      if (k < escanos - 1) return linea;
      const siguiente = d.siguiente && candidaturas[d.siguiente.i];
      return `${linea} ${siguiente ? `El siguiente cociente, de ${siguiente.sigla} (${numero.format(d.siguiente!.cociente)}), ya no entra.` : ''} ${oficial ? 'El resultado coincide con el reparto oficial de 2023.' : ''}`;
    }),
  ];

  return (
    <div ref={s.ref} className="rp-escenario" data-paso={s.paso}>
      <dl className="rp-cifras">
        <div>
          <dt>Votos válidos</dt>
          <dd className="t-dato">{numero.format(d.validos)}</dd>
        </div>
        <div className="rp-aparece" data-visible={visible(s.paso >= 1)}>
          <dt>Barrera del 3 %</dt>
          <dd className="t-dato">{escanos === 1 ? 'Sin barrera' : numero.format(d.barrera)}</dd>
        </div>
        <div>
          <dt>Escaños asignados</dt>
          <dd className="t-dato">
            {asignados} de {escanos}
          </dd>
        </div>
      </dl>
      <Controles s={s} nombre="D'Hondt" textos={textos} />
      <div className="table-scroll rp-dhondt" ref={contenedor}>
        <table className="rp-tabla">
          <caption className="sr-only">
            Cocientes de D&apos;Hondt en {nombre} con los resultados oficiales de 2023. Los marcados
            con su número de escaño son los que obtienen escaño.
          </caption>
          <thead>
            <tr>
              <th scope="col">Candidatura</th>
              <th scope="col">Escaños</th>
              {Array.from({ length: d.divisores }, (_, k) => (
                <th scope="col" key={k}>
                  ÷ {k + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidaturas.map((c, i) => {
              const ganados = d.orden.slice(0, asignados).filter((q) => q.i === i).length;
              const out = s.paso >= 1 && !d.supera[i];
              return (
                <tr key={c.sigla + i} data-fuera={visible(out)}>
                  <th scope="row">
                    <abbr title={c.nombre}>{c.sigla}</abbr>
                  </th>
                  <td>
                    <span className="rp-escanos">
                      <span className="t-dato">{ganados}</span>
                      <span className="rp-mini" aria-hidden="true">
                        {Array.from({ length: c.escanos }, (_, k) => (
                          <i key={k} data-visible={visible(k < ganados)} />
                        ))}
                      </span>
                    </span>
                  </td>
                  {d.supera[i] ? (
                    Array.from({ length: d.divisores }, (_, k) => {
                      const orden = d.orden.findIndex((q) => q.i === i && q.divisor === k + 1);
                      const elegido = orden >= 0 && orden < asignados;
                      return (
                        <td
                          key={k}
                          className="t-dato"
                          data-elegido={visible(elegido)}
                          data-actual={visible(elegido && orden === asignados - 1)}
                        >
                          {/* Votos ÷ 1 son los propios votos: se ven desde el principio. */}
                          <span
                            className="rp-aparece"
                            data-visible={visible(k === 0 || s.paso >= 2)}
                          >
                            {numero.format(c.votos / (k + 1))}
                          </span>
                          {elegido && <span className="rp-orden">{orden + 1}.º</span>}
                        </td>
                      );
                    })
                  ) : (
                    <td colSpan={d.divisores}>
                      <span className="t-dato">{numero.format(c.votos)}</span>
                      {out && <span className="rp-nota"> · no llega al 3 %</span>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function VotosPerdidos({ nombre, resultado }: { nombre: string; resultado: Resultado }) {
  const v = votosSinEscano(resultado);
  const s = useSecuencia(4, 1800);
  const pct = (n: number) => porcentaje.format(n / v.validos);
  const total = v.bajoBarrera + v.sinCociente;
  const segmentos = [
    { tipo: 'cociente', votos: v.sinCociente, desde: 3, texto: 'Superan el 3 %, sin escaño' },
    { tipo: 'barrera', votos: v.bajoBarrera, desde: 2, texto: 'No llegan al 3 %' },
    { tipo: 'blanco', votos: v.blanco, desde: 1, texto: 'En blanco' },
  ];
  let izquierda = v.conEscano;
  const textos = [
    `En 2023 hubo ${numero.format(v.validos)} votos válidos en ${nombre}.`,
    `${numero.format(v.blanco)} fueron en blanco (${pct(v.blanco)}): cuentan para calcular la barrera, pero no eligen a nadie.`,
    resultado.escanos === 1
      ? 'Con un solo escaño no hay barrera del 3 %: ninguna candidatura queda fuera por ella.'
      : `${numero.format(v.bajoBarrera)} fueron a candidaturas que no llegaron al 3 % (${pct(v.bajoBarrera)}).`,
    `${numero.format(v.sinCociente)} fueron a candidaturas que ${resultado.escanos === 1 ? 'no ganaron el escaño' : 'superaron el 3 % pero no lograron escaño'} (${pct(v.sinCociente)}). En total, ${numero.format(total)} votos (${pct(total)}) fueron a candidaturas sin escaño.`,
  ];

  return (
    <div ref={s.ref} className="rp-escenario" data-paso={s.paso}>
      <div className="rp-lienzo" aria-hidden="true">
        <div className="rp-barra">
          {segmentos.map((g) => {
            const left = (izquierda / v.validos) * 100;
            izquierda += g.votos;
            return (
              <i
                key={g.tipo}
                data-tipo={g.tipo}
                data-visible={visible(s.paso >= g.desde)}
                style={{ left: `${left}%`, width: `${(g.votos / v.validos) * 100}%` }}
              />
            );
          })}
        </div>
        <ul className="rp-leyenda">
          <li>
            <i data-tipo="con" /> A candidaturas con escaño: {pct(v.conEscano)}
          </li>
          {[...segmentos].reverse().map((g) => (
            <li key={g.tipo} className="rp-aparece" data-visible={visible(s.paso >= g.desde)}>
              <i data-tipo={g.tipo} /> {g.texto}: {pct(g.votos)}
            </li>
          ))}
        </ul>
      </div>
      <Controles s={s} nombre="votos sin escaño" textos={textos} />
      <div className="table-scroll">
        <table className="rp-tabla">
          <caption className="sr-only">Votos a candidaturas sin escaño en {nombre} en 2023</caption>
          <thead>
            <tr>
              <th scope="col">Candidatura</th>
              <th scope="col">Votos</th>
              <th scope="col">De los válidos</th>
              <th scope="col">Por qué no logra escaño</th>
            </tr>
          </thead>
          <tbody>
            {v.sinEscano.map((c, i) => (
              <tr key={c.sigla + i}>
                <th scope="row">
                  <abbr title={c.nombre}>{c.sigla}</abbr>
                </th>
                <td className="t-dato">{numero.format(c.votos)}</td>
                <td className="t-dato">{porcentajeFino.format(c.votos / v.validos)}</td>
                <td>{c.motivo === 'barrera' ? 'No llega al 3 %' : 'Cociente insuficiente'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total sin escaño</th>
              <td className="t-dato">{numero.format(total)}</td>
              <td className="t-dato">{pct(total)}</td>
              <td />
            </tr>
            <tr>
              <th scope="row">En blanco</th>
              <td className="t-dato">{numero.format(v.blanco)}</td>
              <td className="t-dato">{pct(v.blanco)}</td>
              <td>No eligen a nadie</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

const asientos = hemiciclo();

export function Hemiciclo({
  nombre,
  escanos,
  bloques,
  inicio,
  poblacion,
}: {
  nombre: string;
  escanos: number;
  /** Escaños de cada circunscripción, en el orden en que se colocan. */
  bloques: number[];
  inicio: number;
  /** Parte de la población de España, de 0 a 1. */
  poblacion: number;
}) {
  const s = useSecuencia(3, 1600);
  const bloque = bloques.flatMap((n, b) => Array.from({ length: n }, () => b));
  const textos = [
    `El Congreso tiene ${asientos.length} escaños.`,
    `Se eligen en ${bloques.length} circunscripciones: cada franja del hemiciclo es una.`,
    `De los ${asientos.length} escaños, elegidos en ${bloques.length} circunscripciones, ${nombre} elige ${escanosDe(escanos)}: el ${porcentaje.format(escanos / asientos.length)} del Congreso. Tiene el ${porcentaje.format(poblacion)} de la población de España.`,
  ];
  const punto = (i: number) => ({ cx: 200 + asientos[i]!.x * 190, cy: 200 - asientos[i]!.y * 190 });

  return (
    <div ref={s.ref} className="rp-escenario" data-paso={s.paso}>
      <svg className="rp-hemiciclo" viewBox="0 0 400 210" aria-hidden="true">
        {asientos.map((_, i) => (
          <circle key={i} {...punto(i)} r="5.2" className="rp-asiento" />
        ))}
        <g className="rp-aparece" data-visible={visible(s.paso >= 1)}>
          {asientos.map((_, i) =>
            bloque[i]! % 2 ? <circle key={i} {...punto(i)} r="5.2" className="rp-franja" /> : null,
          )}
        </g>
        {asientos.slice(inicio, inicio + escanos).map((_, k) => (
          <circle
            key={k}
            {...punto(inicio + k)}
            r="5.2"
            className="rp-tuyo"
            data-visible={visible(s.paso >= 2)}
          />
        ))}
        <text x="200" y="196" className="rp-total">
          {s.paso >= 2 ? `${escanos} de ${asientos.length}` : asientos.length}
        </text>
      </svg>
      <Controles s={s} nombre="del hemiciclo a lo nacional" textos={textos} />
    </div>
  );
}
