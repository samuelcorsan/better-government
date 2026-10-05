'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AntesDespues from './antes-despues';
import ChatDemo from './chat-demo';
import Escaparate from './escaparate';
import Recorrido from './recorrido';
import { Hero, Pie } from './shared';
import { FamiliaContext, faltan, familias, type Familia } from './iconos';
import '../ilustraciones/chat-landing.css';
import './proto.css';

const nombres = ['Escaparate', 'Recorrido', 'Antes y después'];

function irAlChat() {
  window.scrollTo({ top: 0, behavior: 'instant' });
  document.getElementById('question')?.focus();
}

export default function Harness() {
  const [actual, setActual] = useState(0);
  const [pregunta, setPregunta] = useState<string | null>(null);
  const [familia, setFamilia] = useState<Familia>('ui');
  const picker = useRef<HTMLElement>(null);
  const highlight = useRef<HTMLSpanElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);

  const elegir = (i: number) => {
    if (i < 0 || i >= nombres.length) return;
    setActual(i);
    const url = new URL(location.href);
    url.searchParams.set('v', String(i + 1));
    history.replaceState(null, '', url);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const v = parseInt(params.get('v') ?? '', 10);
    if (v >= 1 && v <= nombres.length) setActual(v - 1);
    const i = params.get('i');
    if (i && i in familias) setFamilia(i as Familia);
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
  }, [actual, pregunta]);

  useEffect(() => {
    const teclas = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= nombres.length) elegir(n - 1);
      else if (e.key === 'ArrowRight' && !t.closest('[role="tablist"]'))
        elegir((actual + 1) % nombres.length);
      else if (e.key === 'ArrowLeft' && !t.closest('[role="tablist"]'))
        elegir((actual - 1 + nombres.length) % nombres.length);
    };
    document.addEventListener('keydown', teclas);
    return () => document.removeEventListener('keydown', teclas);
  });

  const cambiarFamilia = (f: Familia) => {
    setFamilia(f);
    const url = new URL(location.href);
    url.searchParams.set('i', f);
    history.replaceState(null, '', url);
  };
  const sinEquivalente = faltan(familia);
  const panel = (
    <aside className="proto-panel" aria-label="Familia de iconos">
      <label htmlFor="proto-iconos">Iconos</label>
      <select
        id="proto-iconos"
        value={familia}
        onChange={(e) => cambiarFamilia(e.target.value as Familia)}
      >
        {(Object.keys(familias) as Familia[]).map((f) => (
          <option key={f} value={f}>
            {familias[f].nombre}
          </option>
        ))}
      </select>
      <small>
        {sinEquivalente.length
          ? `Sin equivalente, usa Feather: ${sinEquivalente.join(', ')}`
          : 'Todas las interacciones cubiertas'}
      </small>
    </aside>
  );

  if (pregunta !== null) {
    return (
      <FamiliaContext.Provider value={familia}>
        {panel}
        <ChatDemo
          inicial={pregunta}
          onHome={() => {
            setPregunta(null);
            window.scrollTo({ top: 0, behavior: 'instant' });
          }}
        />
      </FamiliaContext.Provider>
    );
  }

  return (
    <FamiliaContext.Provider value={familia}>
      {panel}
      <div className="cl pr">
        <Hero onAsk={setPregunta} />
        {actual === 0 && <Escaparate onAsk={irAlChat} />}
        {actual === 1 && <Recorrido />}
        {actual === 2 && <AntesDespues />}
        <Pie />
      </div>
      <nav
        ref={picker}
        className="proto-picker"
        data-position="top"
        aria-label="Prototype variants"
      >
        <span ref={highlight} className="proto-picker-highlight" aria-hidden="true"></span>
        {nombres.map((n, i) => (
          <button
            key={n}
            ref={(el) => {
              items.current[i] = el;
            }}
            className="proto-picker-item"
            data-active={actual === i ? '' : undefined}
            aria-current={actual === i ? 'true' : undefined}
            onClick={() => elegir(i)}
          >
            {n}
          </button>
        ))}
      </nav>
    </FamiliaContext.Provider>
  );
}
