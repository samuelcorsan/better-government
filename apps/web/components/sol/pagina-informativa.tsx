import type { ReactNode } from 'react';
import { Cabecera } from './cabecera';
import { Pie } from './pie';
import './informativas.css';

export function PaginaInformativa({
  children,
  lectura = false,
}: {
  children: ReactNode;
  lectura?: boolean;
}) {
  return (
    <>
      <Cabecera />
      <main id="main" tabIndex={-1} className={`info-pagina${lectura ? ' info-lectura' : ''}`}>
        {children}
      </main>
      <Pie />
    </>
  );
}
