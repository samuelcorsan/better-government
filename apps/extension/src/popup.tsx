import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

type Status = {
  site: string;
  name: string;
  state: string;
  reportable?: boolean;
  reason?: string | null;
  pending?: boolean;
};
const stateText: Record<string, string> = {
  active: 'Interfaz activada',
  original: 'Estás usando la interfaz original',
  disabled: 'Desactivada para este portal',
  unsupported: 'Esta pantalla conserva la interfaz original',
};
async function send(type: string): Promise<Status | { state: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab');
  return chrome.tabs.sendMessage(tab.id, { type });
}
function Popup() {
  const [status, setStatus] = useState<Status | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [noticesOff, setNoticesOff] = useState(false);
  useEffect(() => {
    void chrome.storage.local.get('reportNoticesDisabled').then((saved) => {
      setNoticesOff(saved.reportNoticesDisabled === true);
    });
    void send('status')
      .then((value) => setStatus(value as Status))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  async function toggle() {
    if (!status) return;
    setBusy(true);
    setError('');
    try {
      const saved = await chrome.storage.local.get('disabledSites');
      const ids = new Set<string>(
        Array.isArray(saved.disabledSites)
          ? saved.disabledSites.filter((v: unknown): v is string => typeof v === 'string')
          : [],
      );
      if (status.state === 'disabled') ids.delete(status.site);
      else ids.add(status.site);
      await chrome.storage.local.set({ disabledSites: [...ids] });
      if (!ids.has(status.site)) await send('enable');
      else await send('restore');
      setStatus((await send('status')) as Status);
    } catch {
      setError('No se pudo cambiar la vista. Recarga esta página e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  async function showOriginal() {
    setBusy(true);
    try {
      await send('restore');
      setStatus((await send('status')) as Status);
    } catch {
      setError('No se pudo cambiar la vista. Recarga esta página e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }
  async function openReport() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setError('No hay una pestaña activa.');
      return;
    }
    const url = chrome.runtime.getURL(`report.html?tab=${tab.id}`);
    await chrome.tabs.create({ url });
  }
  async function toggleNotices() {
    const next = !noticesOff;
    await chrome.storage.local.set({ reportNoticesDisabled: next });
    setNoticesOff(next);
  }
  return (
    <main className="bg-text space-y-3 p-4 text-[14px]">
      <header>
        <h1 className="bg-h3 leading-tight">Reforma Digital</h1>
        <p className="bg-eyebrow">Interfaz comunitaria · sitio oficial</p>
      </header>
      <section className="rounded-control bg-surface-muted p-3" aria-live="polite">
        <h2 className="bg-eyebrow">Esta pestaña</h2>
        <p className="mt-1">
          {!ready
            ? 'Comprobando esta página…'
            : status
              ? stateText[status.state]
              : 'No hay una integración disponible en esta pestaña.'}
        </p>
        {status ? <p className="bg-hint">{status.name}</p> : null}
        {status?.pending ? (
          <p className="bg-hint mt-1">Esta pantalla ya está en la cola de trabajo.</p>
        ) : null}
      </section>
      {status ? (
        <div className="space-y-2">
          {status.state === 'active' ? (
            <button
              type="button"
              className="bg-btn bg-btn-secondary w-full"
              disabled={busy}
              onClick={() => void showOriginal()}
            >
              Ver original en esta pestaña
            </button>
          ) : null}
          {status.reportable ? (
            <button
              type="button"
              className="bg-btn bg-btn-secondary w-full"
              disabled={busy}
              onClick={() => void openReport()}
            >
              Reportar pantalla sin adaptar
            </button>
          ) : null}
          <button
            type="button"
            className="bg-btn bg-btn-primary w-full"
            disabled={busy}
            onClick={() => void toggle()}
          >
            {busy
              ? 'Aplicando…'
              : status.state === 'disabled'
                ? 'Activar en este portal'
                : 'Desactivar en este portal'}
          </button>
        </div>
      ) : (
        <section>
          <h2 className="bg-eyebrow">Portales incluidos</h2>
          <ul className="mt-1 space-y-1.5">
            {__BG_SITES__.map((site) => (
              <li key={site.id}>
                <a className="bg-link" href={site.homepage} target="_blank" rel="noreferrer">
                  {site.name} ↗
                </a>
                <span className="bg-hint block">
                  {site.status === 'verified' ? 'Verificado' : 'Experimental'}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <label className="bg-hint flex items-start gap-2">
        <input type="checkbox" checked={noticesOff} onChange={() => void toggleNotices()} />
        <span>No mostrar avisos de pantallas pendientes</span>
      </label>
      {error ? (
        <p role="alert" className="bg-callout bg-callout-danger">
          {error}
        </p>
      ) : null}
      <footer className="bg-hint border-t border-line pt-3">
        Adaptaciones comunitarias. No es un servicio oficial. Sin servidores propios de formularios
        ni telemetría. La censura de reportes usa Rampart (CC BY 4.0).
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Popup />);
