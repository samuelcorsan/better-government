// Pasos de las animaciones de /elecciones, derivados del cálculo compartido de congreso.ts. Los
// mismos datos pintan la animación, su tabla equivalente y las pruebas. Sin JSON: se importa
// también en el navegador.
import { dhondt } from './congreso';

export type Resultado = {
  escanos: number;
  blanco: number;
  candidaturas: { sigla: string; nombre: string; votos: number; escanos: number }[];
};

const suma = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0);
export const validos = (votos: readonly number[], blanco: number) => suma(votos) + blanco;
/** Votos mínimos para superar el 3 % (art. 163.1.a), o 0 si se elige un solo escaño (163.2). */
export const barrera = (validos: number, escanos: number) =>
  escanos === 1 ? 0 : Math.ceil((validos * 3) / 100);

/** Art. 162: el mínimo legal y los escaños que añade la población. */
export function origenEscanos(
  p: { population: number; seats: number; seats2023: number },
  poblacionReparto: number,
) {
  const minimo = p.seats === 1 ? 1 : 2;
  // 248 escaños por población: 350 − 2 × 50 provincias − Ceuta y Melilla.
  const exacto = minimo === 1 ? 0 : (p.population * 248) / poblacionReparto;
  return {
    minimo,
    porPoblacion: p.seats - minimo,
    cuota: poblacionReparto / 248,
    exacto,
    restoMayor: p.seats - minimo > Math.floor(exacto),
    cambio: p.seats - p.seats2023,
  };
}

/**
 * D'Hondt paso a paso: el cálculo compartido decide cuántos escaños tiene cada candidatura y aquí
 * solo se ordenan sus cocientes de mayor a menor, con el mismo desempate (más votos primero).
 */
export function pasosDhondt(votos: readonly number[], blanco: number, escanos: number) {
  const reparto = dhondt(votos, blanco, escanos);
  const total = validos(votos, blanco);
  const minimo = barrera(total, escanos);
  const supera = votos.map((v) => v >= minimo);
  const orden = reparto
    .flatMap((n, i) => Array.from({ length: n }, (_, d) => ({ i, divisor: d + 1 })))
    .sort((a, b) => votos[b.i]! * a.divisor - votos[a.i]! * b.divisor || votos[b.i]! - votos[a.i]!);
  // El primer cociente que se queda sin escaño explica por qué no hay uno más.
  const siguiente = votos
    .map((v, i) => ({ i, divisor: reparto[i]! + 1, cociente: v / (reparto[i]! + 1) }))
    .filter(({ i }) => supera[i])
    .sort((a, b) => b.cociente - a.cociente)[0];
  return {
    validos: total,
    barrera: minimo,
    supera,
    reparto,
    orden,
    siguiente,
    // Columnas de la tabla: hasta el divisor del siguiente cociente de la candidatura más votada.
    divisores: Math.min(escanos, Math.max(0, ...reparto) + 1),
  };
}

/** Votos que no eligen a nadie: a candidaturas sin escaño, por barrera o por cociente. */
export function votosSinEscano(r: Resultado) {
  const total = validos(
    r.candidaturas.map((c) => c.votos),
    r.blanco,
  );
  const minimo = barrera(total, r.escanos);
  const sinEscano = r.candidaturas
    .filter((c) => c.escanos === 0)
    .map((c) => ({
      ...c,
      motivo: c.votos < minimo ? ('barrera' as const) : ('cociente' as const),
    }));
  const bajoBarrera = suma(sinEscano.filter((c) => c.motivo === 'barrera').map((c) => c.votos));
  const sinCociente = suma(sinEscano.filter((c) => c.motivo === 'cociente').map((c) => c.votos));
  return {
    validos: total,
    blanco: r.blanco,
    conEscano: total - r.blanco - bajoBarrera - sinCociente,
    bajoBarrera,
    sinCociente,
    sinEscano,
  };
}

/** Hemiciclo de 350 escaños en filas concéntricas, ordenados de izquierda a derecha. */
export function hemiciclo() {
  const total = 350;
  const filas = 10;
  const radios = Array.from({ length: filas }, (_, f) => 0.42 + (0.58 * f) / (filas - 1));
  const porFila = radios.map((r) => Math.round((total * r) / suma(radios)));
  porFila[filas - 1]! += total - suma(porFila);
  return radios
    .flatMap((r, f) =>
      Array.from({ length: porFila[f]! }, (_, k) => {
        const angulo = Math.PI * (1 - k / (porFila[f]! - 1));
        return { x: r * Math.cos(angulo), y: r * Math.sin(angulo), angulo, r };
      }),
    )
    .sort((a, b) => b.angulo - a.angulo || a.r - b.r)
    .map(({ x, y }) => ({ x: Math.round(x * 1000) / 1000, y: Math.round(y * 1000) / 1000 }));
}

// Laboratorio: candidaturas ficticias. Nunca usa nombres, siglas ni colores de partidos reales.
export const PARTIDOS = ['A', 'B', 'C', 'D'] as const;

export type Lab = {
  etiquetas: string[];
  votos: number[];
  blanco: number;
  escanos: number;
};

/** El reparto del laboratorio con el mismo cálculo; `null` si el último escaño exige sorteo. */
export function repartoLab(l: Lab) {
  const total = validos(l.votos, l.blanco);
  let escanos: number[] | null;
  try {
    escanos = dhondt(l.votos, l.blanco, l.escanos);
  } catch {
    escanos = null;
  }
  return { validos: total, barrera: barrera(total, l.escanos), escanos };
}

/** Porcentajes de los votos válidos de una provincia, redondeados a votos. */
export function labDesde(porcentajes: readonly number[], validosReales: number, escanos: number) {
  const votos = porcentajes.map((p) => Math.round((p * validosReales) / 100));
  return {
    etiquetas: [...PARTIDOS],
    votos: votos.slice(0, PARTIDOS.length),
    blanco: votos[PARTIDOS.length] ?? 0,
    escanos,
  };
}

// Experimentos guiados: el punto de partida (A, B, C, D y en blanco, en % de los votos válidos) y
// la transformación que muestra el efecto.
export const experimentos = {
  blanco: {
    titulo: 'El voto en blanco eleva la barrera',
    inicio: [41.3, 30.6, 23.1, 3.2, 1.8],
    /** Añade los votos en blanco justos para que la candidatura más pequeña que supera el 3 % quede fuera. */
    despues(l: Lab): Lab {
      const minimo = barrera(validos(l.votos, l.blanco), l.escanos);
      const dentro = l.votos.filter((v) => v >= minimo).sort((a, b) => a - b);
      if (l.escanos === 1 || dentro.length < 2) return l;
      const extra = Math.floor((dentro[0]! * 100) / 3) - validos(l.votos, l.blanco) + 1;
      return { ...l, blanco: l.blanco + extra };
    },
  },
  tamano: {
    titulo: 'Provincia pequeña frente a grande',
    inicio: [39.3, 31.6, 18.4, 8.7, 2],
    /** Los mismos porcentajes con los escaños y los votos válidos de otra provincia. */
    despues(l: Lab, otra: { escanos: number; validos: number }): Lab {
      const factor = otra.validos / validos(l.votos, l.blanco);
      return {
        ...l,
        votos: l.votos.map((v) => Math.round(v * factor)),
        blanco: Math.round(l.blanco * factor),
        escanos: otra.escanos,
      };
    },
  },
  union: {
    titulo: 'Unir dos candidaturas',
    inicio: [38.6, 28.1, 18.9, 10.4, 4],
    /** C y D se presentan juntas: sus votos se suman en una sola candidatura. */
    despues(l: Lab): Lab {
      return {
        ...l,
        // D deja de presentarse: sin etiqueta ni votos.
        etiquetas: ['A', 'B', 'C+D', ''],
        votos: [l.votos[0]!, l.votos[1]!, l.votos[2]! + l.votos[3]!, 0],
      };
    },
  },
};

export type Experimento = keyof typeof experimentos;
