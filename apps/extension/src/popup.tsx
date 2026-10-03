import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

type Status = { site: string; name: string; state: string };
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
  const [sessionEnded, setSessionEnded] = useState(false);
  useEffect(() => {
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
  async function endSession() {
    setBusy(true);
    setError('');
    try {
      const response: unknown = await chrome.runtime.sendMessage({ type: 'session:end' });
      if (!response || typeof response !== 'object' || !('ok' in response) || !response.ok)
        throw new Error('Session was not cleared');
      setSessionEnded(true);
    } catch {
      setError('No se pudo finalizar la sesión personal. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
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
      {error ? (
        <p role="alert" className="bg-callout bg-callout-danger">
          {error}
        </p>
      ) : null}
      <section className="border-t border-line pt-3">
        <button
          type="button"
          className="bg-btn bg-btn-secondary w-full"
          disabled={busy}
          onClick={() => void endSession()}
        >
          Finalizar sesión personal
        </button>
        {sessionEnded ? (
          <p className="bg-hint mt-1" role="status">
            Se han borrado los datos de esta sesión de la extensión.
          </p>
        ) : null}
      </section>
      <footer className="bg-hint border-t border-line pt-3">
        Adaptaciones comunitarias. No es un servicio oficial. Sin servidores propios ni telemetría.
      </footer>
    </main>
  );
}
createRoot(document.getElementById('root')!).render(<Popup />);
