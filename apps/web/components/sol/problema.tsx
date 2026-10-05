// «El sistema en España está roto»: el catálogo de la Agencia Tributaria contado con sus cifras.
import { catalogo } from './catalogo';
import { Puntos } from './puntos';
import './problema.css';

const cifras = [
  { n: catalogo.total, texto: 'servicios en una sola página, sin buscador', muestra: 'servicio' },
  { n: catalogo.renta, texto: 'es el puesto de la Renta en esa lista', muestra: 'renta' },
  { n: catalogo.repetidos, texto: 'servicios aparecen dos veces', muestra: 'repetido' },
  {
    n: catalogo.apartados,
    texto: `apartados. La Renta está en el último: «${catalogo.apartadoRenta}»`,
    muestra: null,
  },
] as const;

// Sin titular cuando el hero ya es «Problema primero»: ese hero ya enseña los puntos y el titular,
// así que aquí quedan solo las cifras.
export function Problema({ titular = true }: { titular?: boolean }) {
  const lista = (
    <dl className="pb-cifras">
      {cifras.map((c) => (
        <div key={c.n}>
          <dt className="t-cifra">{c.n}</dt>
          <dd>
            {titular && c.muestra && (
              <i
                className="pt-muestra"
                data-tipo={c.muestra === 'servicio' ? undefined : c.muestra}
              />
            )}
            {c.texto}
          </dd>
        </div>
      ))}
    </dl>
  );

  if (!titular) {
    return (
      <section className="pb pb-solo-cifras" aria-labelledby="pb-titulo">
        <h2 id="pb-titulo" className="t-etiqueta pb-antetitulo">
          El catálogo, en cifras
        </h2>
        {lista}
      </section>
    );
  }

  return (
    <section className="pb" aria-labelledby="pb-titulo">
      <div className="pb-cabeza">
        <p className="t-etiqueta pb-antetitulo">El problema</p>
        <h2 id="pb-titulo" className="t-titular-xl">
          El sistema en España está roto.
        </h2>
        <div className="pb-texto t-texto-l">
          <p>
            Hacer un trámite por internet no debería exigir saber cómo funciona la Administración.
          </p>
          <p>
            Mira el catálogo de ayuda de la Agencia Tributaria. Cada punto es un servicio, en el
            mismo orden que en su web. Antes de llegar a la Renta pasas por otros{' '}
            {catalogo.renta - 1}.
          </p>
        </div>
      </div>

      <div className="pb-datos">
        <Puntos />
        {lista}
      </div>
    </section>
  );
}
