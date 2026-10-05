// Cifras del catálogo de ayuda de la Agencia Tributaria, calculadas una vez desde landing/data/aeat.ts
// (captura del 27/09/2026). Sin 'use client': lo usan componentes de cliente y de servidor.
import { categorias, servicios } from '../../landing/data/aeat';
import { normalize } from '../../landing/site';

export type Punto = { i: number; nombre: string; original?: number; copias: number[] };

// Repetidos: mismo nombre una vez normalizado (sin tildes ni arrobas).
const porNombre = new Map<string, number[]>();
for (const [i, s] of servicios.entries()) {
  const clave = normalize(s.name);
  porNombre.set(clave, [...(porNombre.get(clave) ?? []), i]);
}
export const puntos = servicios.map((s, i): Punto => {
  const [primero = i, ...resto] = porNombre.get(normalize(s.name)) ?? [];
  return primero === i
    ? { i, nombre: s.name, copias: resto }
    : { i, nombre: s.name, original: primero, copias: [] };
});

const renta = servicios.find((s) => s.name === 'Renta');
if (!renta) throw new Error('El catálogo de aeat.ts ya no incluye la Renta');
export const iRenta = servicios.indexOf(renta);

export const catalogo = {
  total: servicios.length,
  renta: iRenta + 1,
  repetidos: puntos.filter((p) => p.original !== undefined).length,
  apartados: categorias.length,
  apartadoRenta: renta.category,
  fuente: 'Agencia Tributaria · catálogo consultado el 27/09/2026',
  // Lo que encuentra el buscador de la extensión al escribir «renta», con su puesto en la lista.
  resultadosRenta: servicios
    .map((s, i) => ({ ...s, puesto: i + 1 }))
    .filter((s) => normalize(s.name).includes('renta')),
};
