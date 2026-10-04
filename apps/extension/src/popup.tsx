import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import type { LocalSearchResult } from '@reforma-digital/government/public-index';
import type { PublicCatalogue } from '@reforma-digital/government/public-release';
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
async function catalogueMessage(message: Record<string, unknown>): Promise<unknown> {
  const response: unknown = await chrome.runtime.sendMessage(message);
  if (!response || typeof response !== 'object' || !('ok' in response) || !response.ok)
    throw new Error('Catalogue unavailable');
  return 'value' in response ? response.value : undefined;
}

function CatalogueSearch() {
  const [catalogue, setCatalogue] = useState<PublicCatalogue | null>(null);
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState<'ca' | 'es'>('ca');
  const [activity, setActivity] = useState('');
  const [profile, setProfile] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [searched, setSearched] = useState<{ key: string; value: LocalSearchResult } | null>(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const copy =
    language === 'ca'
      ? {
          title: 'Guies públiques',
          privacy: 'La cerca es fa dins de l’extensió.',
          topic: 'Tema o tràmit',
          language: 'Idioma de la guia',
          activity: 'Activitat (opcional)',
          profile: 'Perfil (opcional)',
          all: 'Sense filtrar',
          municipality: 'Municipi (opcional)',
          search: 'Cerca guies',
          searching: 'Cercant…',
          error: 'No s’ha pogut consultar el catàleg local.',
          stale:
            'No hi ha una edició vigent del catàleg. Si apareixen guies anteriors, comprova-les a la font oficial.',
          uncovered: 'No hi ha cobertura municipal vigent per a',
          checkCity: 'Comprova el tràmit local amb l’ajuntament.',
          topicNeeded: 'Indica un tema, activitat o perfil per cercar.',
          empty: 'No hi ha cap guia aplicable a aquesta cerca.',
          current: 'Vigent',
          unknown: 'Vigència sense confirmar',
          consulted: 'Consultada:',
          conditions: 'Condicions que has de comprovar',
          limits: 'Límits',
          claims: 'Informació subjecta a les condicions anteriors',
          steps: 'Passos possibles, subjectes a les condicions',
          sources: 'Fonts oficials',
        }
      : {
          title: 'Guías públicas',
          privacy: 'La búsqueda se realiza dentro de la extensión.',
          topic: 'Tema o trámite',
          language: 'Idioma de la guía',
          activity: 'Actividad (opcional)',
          profile: 'Perfil (opcional)',
          all: 'Sin filtrar',
          municipality: 'Municipio (opcional)',
          search: 'Buscar guías',
          searching: 'Buscando…',
          error: 'No se pudo consultar el catálogo local.',
          stale:
            'No hay una edición vigente del catálogo. Las guías anteriores, si aparecen, requieren comprobación en la fuente oficial.',
          uncovered: 'No hay cobertura municipal vigente para',
          checkCity: 'Comprueba el trámite local con el ayuntamiento.',
          topicNeeded: 'Indica un tema, actividad o perfil para buscar.',
          empty: 'No hay una guía aplicable a esta búsqueda.',
          current: 'Vigente',
          unknown: 'Vigencia sin confirmar',
          consulted: 'Consultada:',
          conditions: 'Condiciones que debes comprobar',
          limits: 'Límites',
          claims: 'Información sujeta a las condiciones anteriores',
          steps: 'Pasos posibles, sujetos a las condiciones',
          sources: 'Fuentes oficiales',
        };
  useEffect(() => {
    void catalogueMessage({ type: 'catalog:refresh' })
      .then((value) => setCatalogue(value as PublicCatalogue))
      .catch(() => setError(true));
  }, []);
  const profiles = [
    ...new Set(catalogue?.guides.flatMap(({ guide }) => guide.profiles) ?? []),
  ].sort();
  const key = JSON.stringify([query, language, activity, profile, municipality]);
  const result = searched?.key === key ? searched.value : null;
  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    try {
      setSearched({
        key,
        value: (await catalogueMessage({
          type: 'catalog:search',
          query,
          language,
          activity,
          profile: profile || undefined,
          municipality,
        })) as LocalSearchResult,
      });
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="space-y-3 border-t border-line pt-3" aria-labelledby="catalogue-title">
      <div>
        <h2 id="catalogue-title" className="bg-h3">
          {copy.title}
        </h2>
        <p className="bg-hint">{copy.privacy}</p>
      </div>
      <form onSubmit={(event) => void search(event)} className="space-y-2" autoComplete="off">
        <label className="bg-label block" htmlFor="guide-query">
          {copy.topic}
        </label>
        <input
          id="guide-query"
          className="bg-field w-full"
          value={query}
          maxLength={300}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="bg-label block" htmlFor="guide-language">
          {copy.language}
        </label>
        <select
          id="guide-language"
          className="bg-field w-full"
          value={language}
          onChange={(event) => setLanguage(event.target.value === 'es' ? 'es' : 'ca')}
        >
          <option value="ca">Català</option>
          <option value="es">Castellano</option>
        </select>
        <label className="bg-label block" htmlFor="guide-activity">
          {copy.activity}
        </label>
        <input
          id="guide-activity"
          className="bg-field w-full"
          value={activity}
          maxLength={80}
          onChange={(event) => setActivity(event.target.value)}
        />
        <label className="bg-label block" htmlFor="guide-profile">
          {copy.profile}
        </label>
        <select
          id="guide-profile"
          className="bg-field w-full"
          value={profile}
          onChange={(event) => setProfile(event.target.value)}
        >
          <option value="">{copy.all}</option>
          {profiles.map((item) => (
            <option value={item} key={item}>
              {item.replaceAll('-', ' ')}
            </option>
          ))}
        </select>
        <label className="bg-label block" htmlFor="guide-municipality">
          {copy.municipality}
        </label>
        <input
          id="guide-municipality"
          className="bg-field w-full"
          value={municipality}
          maxLength={80}
          onChange={(event) => setMunicipality(event.target.value)}
        />
        <button type="submit" className="bg-btn bg-btn-primary w-full" disabled={busy}>
          {busy ? copy.searching : copy.search}
        </button>
      </form>
      {error ? (
        <p role="alert" className="bg-callout bg-callout-danger">
          {copy.error}
        </p>
      ) : null}
      {catalogue && !catalogue.fresh ? (
        <p role="status" className="bg-callout bg-callout-warning">
          {copy.stale}
        </p>
      ) : null}
      {result ? (
        <div className="space-y-3" aria-live="polite">
          {result.municipalCoverage === 'uncovered' ? (
            <p className="bg-callout bg-callout-warning">
              {copy.uncovered} {municipality}. {copy.checkCity}
            </p>
          ) : null}
          {result.needsTopic ? <p>{copy.topicNeeded}</p> : null}
          {!result.needsTopic && !result.hits.length ? <p>{copy.empty}</p> : null}
          {result.hits.map(({ guide, current, questions }) => (
            <article className="bg-card space-y-2 p-3" key={guide.id}>
              <h3 className="font-semibold">{guide.title[language]}</h3>
              <p className="bg-hint">
                {guide.jurisdiction} · {current ? copy.current : copy.unknown} ·{copy.consulted}{' '}
                {guide.consultedAt}
              </p>
              {questions.length ? (
                <div>
                  <h4 className="font-semibold">{copy.conditions}</h4>
                  <ul className="list-disc pl-5">
                    {questions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {guide.exclusions.length ? (
                <div>
                  <h4 className="font-semibold">{copy.limits}</h4>
                  <ul className="list-disc pl-5">
                    {guide.exclusions.map((item) => (
                      <li key={item.id}>{item.text[language]}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {current && guide.claims.length ? (
                <div>
                  <h4 className="font-semibold">{copy.claims}</h4>
                  <ul className="list-disc pl-5">
                    {guide.claims.map((item) => (
                      <li key={item.id}>{item.text[language]}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {current && guide.steps.length ? (
                <div>
                  <h4 className="font-semibold">{copy.steps}</h4>
                  <ol className="list-decimal pl-5">
                    {guide.steps.map((item) => (
                      <li key={item.id}>{item.text[language]}</li>
                    ))}
                  </ol>
                </div>
              ) : null}
              <div>
                <h4 className="font-semibold">{copy.sources}</h4>
                <ul className="list-disc pl-5">
                  {guide.evidence.map((source) => (
                    <li key={source.id}>
                      <a className="bg-link" href={source.url} target="_blank" rel="noreferrer">
                        {source.attribution} · {source.language} ↗
                      </a>
                      <p className="bg-hint">{source.sourceUpdatedAt ?? source.version}</p>
                      <blockquote className="border-l border-line pl-2">{source.quote}</blockquote>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
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
      <CatalogueSearch />
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
