'use client';

// Prototipo desechable (/proto/sol): las 3 opciones de hero sobre la misma portada y, como cuarta
// vista, el chat en modo panel (la visión de la extensión).
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ChatDemo } from '../../components/sol/chat/chat-demo';
import { fuentesSol } from '../../components/sol/fuentes';
import { Pagina, type Hero } from '../../components/sol/pagina';
import './picker.css';

const variantes: { vista: Hero | 'panel'; nombre: string }[] = [
  { vista: 'chat', nombre: 'Chat' },
  { vista: 'problema', nombre: 'Problema' },
  { vista: 'extension', nombre: 'Extensión' },
  { vista: 'panel', nombre: 'Panel' },
];

function VistaPanel() {
  return (
    <div className={`sol-raiz ${fuentesSol} proto-panel`}>
      <main id="main" tabIndex={-1}>
        <h1 className="t-etiqueta">Chat en modo panel · 380 px junto a la web oficial</h1>
        <div className="proto-panel-marco">
          <ChatDemo modo="panel" />
        </div>
      </main>
    </div>
  );
}

export default function Harness({ inicial }: { inicial: number }) {
  const [actual, setActual] = useState(inicial >= 0 && inicial < variantes.length ? inicial : 0);
  const [montaje, setMontaje] = useState(0);
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const elegir = (i: number) => {
    if (i < 0 || i >= variantes.length) return;
    setActual(i);
    setMontaje((m) => m + 1);
    const url = new URL(location.href);
    url.searchParams.set('v', String(i + 1));
    history.replaceState(null, '', url);
  };
  const repetir = () => setMontaje((m) => m + 1);

  useEffect(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => picker.current?.setAttribute('data-ready', '')),
    );
  }, []);

  useLayoutEffect(() => {
    const mover = () => {
      const el = items.current[actual];
      if (!el || !highlight.current) return;
      highlight.current.style.width = `${el.offsetWidth}px`;
      highlight.current.style.transform = `translateX(${el.offsetLeft}px)`;
    };
    mover();
    window.addEventListener('resize', mover);
    return () => window.removeEventListener('resize', mover);
  }, [actual]);

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      const t = e.target;
      if (
        t instanceof HTMLElement &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Con el chat de página abierto, las teclas son suyas: cambiar de variante lo borraría.
      if (document.querySelector(".ch[data-modo='pagina']")) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= variantes.length) elegir(n - 1);
      else if (e.key === 'ArrowRight') elegir((actual + 1) % variantes.length);
      else if (e.key === 'ArrowLeft') elegir((actual - 1 + variantes.length) % variantes.length);
      else if (e.key === 'r' || e.key === 'R') repetir();
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  });

  // `actual` siempre está en rango: lo acotan el estado inicial y `elegir`.
  const vista = variantes[actual]!.vista;

  return (
    <>
      {vista === 'panel' ? <VistaPanel key={montaje} /> : <Pagina key={montaje} hero={vista} />}
      <nav
        ref={picker}
        className="proto-picker"
        data-position="top"
        aria-label="Prototype variants"
      >
        <span ref={highlight} className="proto-picker-highlight" aria-hidden="true"></span>
        {variantes.map((v, i) => (
          <button
            key={v.vista}
            ref={(el) => {
              items.current[i] = el;
            }}
            className="proto-picker-item"
            data-active={actual === i ? '' : undefined}
            aria-current={actual === i ? 'true' : undefined}
            onClick={() => elegir(i)}
          >
            {v.nombre}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true"></span>
        <button
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={repetir}
        >
          ↻
        </button>
      </nav>
    </>
  );
}
