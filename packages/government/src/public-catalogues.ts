import { sources } from './index';

type Page = {
  id: string;
  sourceId: string;
  url: string;
  language: 'ca' | 'es';
  pathway: 'direct' | 'coordinated';
  competence: 'municipal' | 'multiadministration';
  itemPath?: RegExp;
  title?: RegExp;
  legalUrl?: string;
  legalGrant?: RegExp;
};

/** Exact public entry points. These sources remain disabled for the legacy remote search. */
export const cataloguePages: readonly Page[] = [
  {
    id: 'fue-ca',
    sourceId: 'canal-empresa-fue',
    url: 'https://canalempresa.gencat.cat/ca/fue/',
    language: 'ca',
    pathway: 'coordinated',
    competence: 'multiadministration',
    itemPath:
      /^\/ca\/(?:integraciodepartamentaltramit\/tramit\/PerTemes\/[a-zA-Z0-9-]+|01_que_voleu_fer\/02_comencar_un_negoci\/crear-empresa-constitucio-tramits\/vull_ser_autonom\/)$/,
    title: /finestreta única empresarial/i,
    legalUrl: 'https://tramits.gencat.cat/ca/ajuda/avis_legal/',
    legalGrant: /generalitat de catalunya permet la reutilitzacio/,
  },
  {
    id: 'fue-es',
    sourceId: 'canal-empresa-fue',
    url: 'https://canalempresa.gencat.cat/es/fue/',
    language: 'es',
    pathway: 'coordinated',
    competence: 'multiadministration',
    // The Spanish FUE index currently points its self-employment guide to the Catalan route.
    itemPath:
      /^\/(?:es\/integraciodepartamentaltramit\/tramit\/PerTemes\/[a-zA-Z0-9-]+|ca\/01_que_voleu_fer\/02_comencar_un_negoci\/crear-empresa-constitucio-tramits\/vull_ser_autonom\/)$/,
    title: /ventanilla única empresarial/i,
    legalUrl: 'https://tramits.gencat.cat/es/ajuda/avis_legal/',
    legalGrant: /generalitat de cataluna permite la reutilizacion/,
  },
  {
    id: 'barcelona-ca',
    sourceId: 'barcelona-tramits',
    url: 'https://seuelectronica.ajuntament.barcelona.cat/ca/tramites-telematicos',
    language: 'ca',
    pathway: 'direct',
    competence: 'municipal',
    itemPath: /^\/oficinavirtual\/ca\/tramit\/\d+$/,
    title: /trámites telemáticos/i,
    legalUrl: 'https://seuelectronica.ajuntament.barcelona.cat/ca/legal',
    legalGrant: /ajuntament de barcelona permet reutilitzar/,
  },
  {
    id: 'barcelona-es',
    sourceId: 'barcelona-tramits',
    url: 'https://seuelectronica.ajuntament.barcelona.cat/es/tramites-telematicos',
    language: 'es',
    pathway: 'direct',
    competence: 'municipal',
    // The Spanish index currently links to /ca/ detail routes; the label is Spanish, not the destination.
    itemPath: /^\/oficinavirtual\/ca\/tramit\/\d+$/,
    title: /trámites telemáticos/i,
    legalUrl: 'https://seuelectronica.ajuntament.barcelona.cat/es/legal',
    legalGrant: /ayuntamiento de barcelona permite reutilizar/,
  },
  {
    id: 'girona-ca',
    sourceId: 'girona-tramits',
    url: 'https://seu.girona.cat/portal/girona_ca/serveis/e-registre/',
    language: 'ca',
    pathway: 'direct',
    competence: 'municipal',
  },
  {
    id: 'girona-es',
    sourceId: 'girona-tramits',
    url: 'https://seu.girona.cat/portal/girona_es/serveis/e-registre/',
    language: 'es',
    pathway: 'direct',
    competence: 'municipal',
  },
  {
    id: 'lleida-ca',
    sourceId: 'lleida-tramits',
    url: 'https://tramits.paeria.cat/',
    language: 'ca',
    pathway: 'direct',
    competence: 'municipal',
  },
  {
    id: 'tarragona-es',
    sourceId: 'tarragona-tramits',
    url: 'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&lang=ES',
    language: 'es',
    pathway: 'direct',
    competence: 'municipal',
  },
];

export type CatalogueResult = {
  sourceId: string;
  url: string;
  authority: string;
  jurisdiction: string;
  language: 'ca' | 'es';
  consultedAt: string;
  pathway: 'direct' | 'coordinated';
  competence: 'municipal' | 'multiadministration';
  legalUrl?: string;
} & (
  | { status: 'gap'; reason: 'rights-unverified' | 'unavailable' | 'changed-url' | 'changed-dom' }
  | { status: 'acquired'; sourceUpdatedAt: string | null; items: { title: string; url: string }[] }
);

function validDate(value: string): boolean {
  const date = new Date(value);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

/** Only public catalogue labels and links are acquired; individual procedure terms need separate checks. */
export function extractPublicCatalogue(
  pageId: string,
  input: {
    status: number;
    finalUrl: string;
    document?: Document;
    legalDocument?: Document;
    consultedAt: string;
  },
): CatalogueResult {
  const { status, finalUrl, document, legalDocument, consultedAt } = input;
  const page = cataloguePages.find((item) => item.id === pageId);
  if (!page || !validDate(consultedAt)) throw new Error('Invalid acquisition');
  const source = sources.find((item) => item.id === page.sourceId);
  if (!source || source.enabled || !source.publicUrls?.includes(page.url))
    throw new Error('Catalogue source is not registered as disabled and public');
  const base = {
    sourceId: page.sourceId,
    url: page.url,
    authority: source.organization,
    jurisdiction: source.jurisdictionValue,
    language: page.language,
    consultedAt,
    pathway: page.pathway,
    competence: page.competence,
    ...(page.legalUrl ? { legalUrl: page.legalUrl } : {}),
  };
  if (status === 403 || status === 401 || status === 404 || status >= 500)
    return { ...base, status: 'gap', reason: 'unavailable' };
  if (status !== 200 || finalUrl !== page.url)
    return { ...base, status: 'gap', reason: 'changed-url' };
  if (!page.legalUrl || !page.itemPath || !page.title)
    return { ...base, status: 'gap', reason: 'rights-unverified' };
  const legalText = legalDocument
    ?.querySelector('main')
    ?.textContent?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (
    legalDocument?.URL !== page.legalUrl ||
    !legalText ||
    !page.legalGrant?.test(legalText) ||
    !/(?:citar|esmentar|mencionar).{0,35}(?:font|fuente)/.test(legalText) ||
    !/no desnaturaliz|no desnaturalitz/.test(legalText)
  )
    return { ...base, status: 'gap', reason: 'rights-unverified' };
  if (document?.URL !== page.url) return { ...base, status: 'gap', reason: 'changed-url' };
  const main = document?.querySelector('main');
  if (!main || !page.title.test(document?.title ?? ''))
    return { ...base, status: 'gap', reason: 'changed-dom' };
  const items = new Map<string, string>();
  const origin = new URL(page.url).origin;
  for (const anchor of main.querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    if (!href) continue;
    let url: URL;
    try {
      url = new URL(href, page.url);
    } catch {
      continue;
    }
    if (
      url.origin !== origin ||
      !page.itemPath.test(url.pathname) ||
      url.search ||
      url.hash ||
      url.username ||
      url.password
    )
      continue;
    const title = (anchor.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!title || title.length > 180) continue;
    items.set(url.href, title);
  }
  // ponytail: fixed cap covers the observed 254 Barcelona links; review a larger real index before raising it.
  if (!items.size || items.size > 300) return { ...base, status: 'gap', reason: 'changed-dom' };
  const date = main.textContent
    ?.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .match(/ultima actualitz\w*\s+(\d{2})\/(\d{2})\/(\d{4})/i);
  const update = date ? `${date[3]}-${date[2]}-${date[1]}` : null;
  const sourceUpdatedAt = update && validDate(update) ? update : null;
  return {
    ...base,
    status: 'acquired',
    sourceUpdatedAt,
    items: [...items]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([url, title]) => ({ title, url })),
  };
}
