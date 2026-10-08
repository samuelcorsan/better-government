import type { ReactNode } from 'react';
import { Header } from './header';
import { Footer } from './footer';
import './info-page.css';

export function InfoPage({ children, narrow = false }: { children: ReactNode; narrow?: boolean }) {
  return (
    <>
      <Header />
      <main id="main" tabIndex={-1} className={`info-pagina${narrow ? ' info-lectura' : ''}`}>
        {children}
      </main>
      <Footer />
    </>
  );
}
