import { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createGuard } from '@nationaldesignstudio/rampart';
import { REPORT_SCHEMA, type PageSnapshot, type RedactionCounts } from '@reforma-digital/capture';
import { markReportSent } from './report-storage';
import './popup.css';

declare const __BG_INTAKE_ORIGIN__: string;
declare const __BG_VERSION__: string;

type Status = {
  site: string;
  name: string;
  state: string;
  reportable?: boolean;
  reason?: 'unsupported' | 'mismatch' | null;
  pending?: boolean;
  url?: string;
};

function tabIdFromQuery(): number | null {
  const raw = new URLSearchParams(location.search).get('tab');
  if (!raw) return null;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function loadStatus(tabId: number): Promise<Status> {
  return chrome.tabs.sendMessage(tabId, { type: 'status' });
}

async function loadCapture(
  tabId: number,
): Promise<{ ok: true; snapshot: PageSnapshot } | { ok: false; error: string }> {
  return chrome.tabs.sendMessage(tabId, { type: 'capture' });
}

/** Apply Rampart (heuristics) + optional manual blanks over every text-ish field. */
async function deepenRedaction(
  snapshot: PageSnapshot,
  manual: string[],
): Promise<{ snapshot: PageSnapshot; texts: string[] }> {
  const guard = await createGuard({ heuristicsOnly: true });
  const protect = async (text: string) => {
    let out = text;
    for (const m of manual) {
      if (m.trim().length > 0) out = out.split(m).join('[MANUAL]');
    }
    const safe = await guard.protect(out);
    return safe.text;
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(snapshot.html, 'text/html');
  const texts: string[] = [];
  const walker = doc.createTreeWalker(doc.documentElement!, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const parent = node.parentElement;
    if (!parent || parent.tagName === 'STYLE' || parent.tagName === 'SCRIPT') continue;
    const raw = node.nodeValue ?? '';
    if (!raw.trim()) continue;
    const next = await protect(raw);
    node.nodeValue = next;
    texts.push(next);
  }
  for (const el of doc.querySelectorAll('[title],[alt],[placeholder],[aria-label]')) {
    for (const attr of ['title', 'alt', 'placeholder', 'aria-label'] as const) {
      if (!el.hasAttribute(attr)) continue;
      const next = await protect(el.getAttribute(attr) ?? '');
      el.setAttribute(attr, next);
      texts.push(next);
    }
  }
  const title = doc.querySelector('title');
  if (title?.textContent) {
    title.textContent = await protect(title.textContent);
    texts.push(title.textContent);
  }
  const css = await protect(snapshot.css);
  const counts: RedactionCounts = { ...snapshot.counts };
  return {
    snapshot: {
      ...snapshot,
      html: doc.documentElement!.outerHTML,
      css,
      counts,
    },
    texts: [...new Set(texts.map((t) => t.trim()).filter((t) => t.length > 0))],
  };
}

function ReportApp() {
  const tabId = useMemo(() => tabIdFromQuery(), []);
  const [status, setStatus] = useState<Status | null>(null);
  const [snapshot, setSnapshot] = useState<PageSnapshot | null>(null);
  const [texts, setTexts] = useState<string[]>([]);
  const [manual, setManual] = useState('');
  const [blanked, setBlanked] = useState<string[]>([]);
  const [reviewed, setReviewed] = useState(false);
  const [busy, setBusy] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const intake = __BG_INTAKE_ORIGIN__;

  useEffect(() => {
    if (!tabId) {
      setError('Falta la pestaña de origen. Abre el reporte desde el popup de la extensión.');
      setBusy(false);
      return;
    }
    void (async () => {
      try {
        const st = await loadStatus(tabId);
        setStatus(st);
        if (!st.reportable) {
          setError('Esta pestaña no se puede reportar (interfaz activa, excluida o desconocida).');
          setBusy(false);
          return;
        }
        const captured = await loadCapture(tabId);
        if (!captured.ok) {
          setError(captured.error);
          setBusy(false);
          return;
        }
        const deepened = await deepenRedaction(captured.snapshot, []);
        setSnapshot(deepened.snapshot);
        setTexts(deepened.texts);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : 'No se pudo capturar la página. Recarga la pestaña e inténtalo de nuevo.',
        );
      } finally {
        setBusy(false);
      }
    })();
  }, [tabId]);

  async function reapplyManual() {
    if (!snapshot || !tabId) return;
    setBusy(true);
    setError('');
    try {
      const captured = await loadCapture(tabId);
      if (!captured.ok) {
        setError(captured.error);
        return;
      }
      const extras = [
        ...blanked,
        ...manual
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
      ];
      const deepened = await deepenRedaction(captured.snapshot, extras);
      setSnapshot(deepened.snapshot);
      setTexts(deepened.texts);
    } catch {
      setError('No se pudo volver a censurar la captura.');
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!snapshot || !reviewed || !intake) return;
    setSending(true);
    setError('');
    try {
      const origin = new URL(intake).origin;
      const granted = await chrome.permissions.request({ origins: [`${origin}/*`] });
      if (!granted) throw new Error('Necesitas permitir el envío al buzón privado una sola vez.');
      const body = { ...snapshot, schema: REPORT_SCHEMA };
      const response = await fetch(new URL('/v1/reports', intake), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'omit',
        cache: 'no-store',
        redirect: 'error',
      });
      if (response.status !== 201 && response.status !== 200) {
        const detail = await response.text().catch(() => '');
        throw new Error(
          `El buzón respondió ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ''}`,
        );
      }
      if (status?.url) await markReportSent(status.url);
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'No se pudo enviar el informe. Comprueba la conexión e inténtalo de nuevo.',
      );
    } finally {
      setSending(false);
    }
  }

  const previewDoc = snapshot
    ? `<!doctype html><html><head><meta charset="utf-8"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; script-src 'none';"/><style>${snapshot.css.slice(0, 200_000)}</style></head><body>${snapshot.html}</body></html>`
    : '';

  return (
    <main className="bg-text mx-auto max-w-content space-y-4 p-4 text-[14px]">
      <header>
        <h1 className="bg-h3 leading-tight">Reportar pantalla sin adaptar</h1>
        <p className="bg-eyebrow">
          Reforma Digital {__BG_VERSION__} · censura local · sin telemetría
        </p>
      </header>

      {busy ? <p>Preparando captura y censura local…</p> : null}
      {error ? (
        <p role="alert" className="bg-callout bg-callout-danger">
          {error}
        </p>
      ) : null}
      {done ? (
        <section className="bg-callout rounded-control p-3">
          <p>
            Informe enviado al buzón privado. Quien mantiene el repositorio lo revisará antes de
            publicarlo. Gracias.
          </p>
        </section>
      ) : null}

      {status ? (
        <section className="rounded-control bg-surface-muted p-3">
          <h2 className="bg-eyebrow">Pestaña</h2>
          <p className="mt-1">{status.name}</p>
          <p className="bg-hint break-all">{snapshot?.url ?? status.url}</p>
          {status.pending ? (
            <p className="bg-hint mt-1">Esta ruta ya figura en la cola pública.</p>
          ) : null}
        </section>
      ) : null}

      {snapshot && !done ? (
        <>
          <section className="space-y-2">
            <h2 className="bg-eyebrow">Vista previa censurada</h2>
            <iframe
              title="Vista previa del HTML censurado"
              sandbox=""
              srcDoc={previewDoc}
              className="h-[320px] w-full rounded-control border border-line bg-surface"
            />
          </section>

          <section className="space-y-2">
            <h2 className="bg-eyebrow">Textos que quedan</h2>
            <p className="bg-hint">
              Revisa la lista. Si aparece algo personal, selecciónalo o escríbelo abajo para
              tacharlo antes de enviar.
            </p>
            <ul className="max-h-48 space-y-1 overflow-auto rounded-control border border-line p-2 text-[13px]">
              {texts.slice(0, 200).map((text) => (
                <li key={text}>
                  <button
                    type="button"
                    className="bg-link text-left"
                    onClick={() =>
                      setBlanked((prev) => (prev.includes(text) ? prev : [...prev, text]))
                    }
                  >
                    {text.length > 120 ? `${text.slice(0, 120)}…` : text}
                  </button>
                </li>
              ))}
            </ul>
            {blanked.length ? <p className="bg-hint">A tachar: {blanked.join(' · ')}</p> : null}
            <label className="block">
              <span className="bg-eyebrow">Textos adicionales a eliminar (uno por línea)</span>
              <textarea
                className="bg-field mt-1 w-full"
                rows={3}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="bg-btn bg-btn-secondary"
              disabled={busy}
              onClick={() => void reapplyManual()}
            >
              Volver a censurar
            </button>
          </section>

          <section className="space-y-3 rounded-control border border-line p-3">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
              />
              <span>
                He revisado que no aparecen mis datos personales en la vista previa ni en la lista
                de textos.
              </span>
            </label>
            <p className="bg-hint">
              Al enviar, el informe censurado llega a un buzón privado. No se publica en el
              repositorio hasta que alguien del equipo lo acepte. Powered by{' '}
              <a
                className="bg-link"
                href="https://github.com/nationaldesignstudio/rampart"
                target="_blank"
                rel="noreferrer"
              >
                Rampart
              </a>{' '}
              (CC BY 4.0).
            </p>
            <button
              type="button"
              className="bg-btn bg-btn-primary"
              disabled={!reviewed || sending || !intake || busy}
              onClick={() => void submit()}
            >
              {sending
                ? 'Enviando…'
                : !intake
                  ? 'Buzón no configurado'
                  : 'Enviar informe censurado'}
            </button>
          </section>
        </>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<ReportApp />);
