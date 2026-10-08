import type { ReactNode } from 'react';

// Un apartado de «Cómo se eligen los diputados»: número, título y texto a un lado; el gráfico al otro.
export function Bloque({
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
