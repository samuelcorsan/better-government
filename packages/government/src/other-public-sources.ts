import { normalizeText } from '@reforma-digital/core';

// Approval is per document/channel, independent of the legacy remote-search registry.
export const otherPublicSources = [
  {
    id: 'aeat-renta-2025-presentacion',
    sourceId: 'aeat',
    channel: 'html',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/presentacion.html',
    documentUrl:
      'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/presentacion.html',
    organization: 'Agencia Estatal de Administración Tributaria',
    publisher: 'Agencia Estatal de Administración Tributaria',
    jurisdiction: 'ES',
    language: 'es',
    exercise: 2025,
    documentRole: 'general-guide',
    legalUrl:
      'https://sede.agenciatributaria.gob.es/Sede/condiciones-uso-sede-electronica/aviso-legal/cesion-manuales-programas-ayuda.html',
    attribution: 'Manual práctico cedido gratuitamente por la Agencia Tributaria',
  },
  {
    id: 'bdns-consolidat-2025',
    sourceId: 'bdns',
    channel: 'json',
    url: 'https://www.infosubvenciones.es/bdnstrans/api/convocatorias?numConv=845745',
    documentUrl: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatoria/845745',
    organization: 'Generalitat de Catalunya · Departament d’Empresa i Treball',
    publisher: 'Intervención General de la Administración del Estado',
    jurisdiction: 'ES-CT',
    language: 'es',
    exercise: 2025,
    documentRole: 'specific-call',
    legalUrl: 'https://www.infosubvenciones.es/bdnstrans/GE/es/avisolegal',
    attribution: 'Origen de los datos: Intervención General de la Administración del Estado',
  },
] as const;

type SourcePlan = (typeof otherPublicSources)[number];
type TemporalStatus =
  'matches-exercise' | 'other-exercise' | 'within-window' | 'closed' | 'not-yet-open' | 'unknown';

export type OtherPublicSnapshot = {
  source: SourcePlan;
  title: string;
  text: string;
  consultedAt: string;
  updatedAt: string | null;
  receivedAt: string | null;
  documentDates: { id: number; publishedAt: string | null; updatedAt: string | null }[];
  applicationWindow: {
    from: string | null;
    to: string | null;
    textFrom: string | null;
    textTo: string | null;
    indefinite: boolean;
  } | null;
  reuseNotice: string | null;
  temporalStatus: TemporalStatus;
};

export type OtherPublicResult =
  | { status: 'acquired' | 'reference'; snapshot: OtherPublicSnapshot }
  | {
      status: 'gap';
      reason:
        | 'unapproved-source'
        | 'unapproved-url'
        | 'http-error'
        | 'invalid-date'
        | 'wrong-channel'
        | 'login'
        | 'extraction-failed'
        | 'ambiguous-response';
    };

export type OtherPublicResponse = {
  status: number;
  finalUrl: string;
  contentType: string;
  consultedAt: string;
  targetExercise: number;
  document?: Document;
  json?: unknown;
  /** A source-supplied update date, never the acquisition date or legal effective date. */
  updatedAt?: string | null;
};

function isoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 12_000;
}

function boundedDate(value: unknown, consultedAt: string): value is string | null {
  return value === null || (isoDate(value) && value <= consultedAt);
}

function acquired(snapshot: OtherPublicSnapshot): OtherPublicResult {
  const status = ['matches-exercise', 'within-window'].includes(snapshot.temporalStatus)
    ? 'acquired'
    : 'reference';
  return { status, snapshot };
}

/** Extract an inert public response acquired by the offline builder; performs no requests. */
export function extractOtherPublicSource(
  documentId: string,
  response: OtherPublicResponse,
): OtherPublicResult {
  const source = otherPublicSources.find((item) => item.id === documentId);
  if (!source) return { status: 'gap', reason: 'unapproved-source' };
  // Exact comparison also excludes other paths, session queries, credentials and redirects.
  if (response.finalUrl !== source.url) return { status: 'gap', reason: 'unapproved-url' };
  if (response.status === 401 || response.status === 403) return { status: 'gap', reason: 'login' };
  if (response.status !== 200) return { status: 'gap', reason: 'http-error' };
  if (
    !isoDate(response.consultedAt) ||
    !Number.isInteger(response.targetExercise) ||
    response.targetExercise < 1000 ||
    response.targetExercise > 9999 ||
    !boundedDate(response.updatedAt ?? null, response.consultedAt)
  )
    return { status: 'gap', reason: 'invalid-date' };
  const snapshot = {
    source,
    consultedAt: response.consultedAt,
    updatedAt: response.updatedAt ?? null,
    receivedAt: null,
    documentDates: [],
    applicationWindow: null,
    reuseNotice: null,
  };
  const contentType = response.contentType.split(';')[0]?.trim().toLowerCase();
  if (source.channel === 'html') {
    if (contentType !== 'text/html' || !response.document || response.json !== undefined)
      return { status: 'gap', reason: 'wrong-channel' };
    const document = response.document;
    if (document.URL !== source.url) return { status: 'gap', reason: 'unapproved-url' };
    if (document.querySelector('input[type="password"], form[action*="login" i]'))
      return { status: 'gap', reason: 'login' };
    const roots = document.querySelectorAll('#acc-main');
    const headings = document.querySelectorAll('h1');
    const root = roots[0];
    const heading = headings[0]?.textContent;
    if (!root || roots.length !== 1 || headings.length !== 1 || !text(heading))
      return { status: 'gap', reason: 'extraction-failed' };
    const inert = document.createElement('div');
    inert.append(root.cloneNode(true));
    inert.querySelectorAll('script, style, noscript, nav, form').forEach((item) => item.remove());
    const content = inert.textContent?.trim();
    if (
      document.documentElement.lang !== source.language ||
      normalizeText(heading) !== 'presentacion' ||
      !content ||
      content.length > 100_000 ||
      !normalizeText(content).includes('ejercicio 2025')
    )
      return { status: 'gap', reason: 'ambiguous-response' };
    return acquired({
      ...snapshot,
      title: heading,
      text: content,
      temporalStatus:
        response.targetExercise === source.exercise ? 'matches-exercise' : 'other-exercise',
    });
  }
  if (contentType !== 'application/json' || response.document || !record(response.json))
    return { status: 'gap', reason: 'wrong-channel' };
  const data = response.json;
  if (
    data.codigoBDNS !== '845745' ||
    !record(data.organo) ||
    data.organo.nivel1 !== 'AUTONOMICA' ||
    data.organo.nivel2 !== 'CATALUÑA' ||
    !text(data.organo.nivel3) ||
    normalizeText(data.organo.nivel3) !== 'departament d empresa i treball' ||
    !Array.isArray(data.regiones) ||
    data.regiones.length !== 1 ||
    !record(data.regiones[0]) ||
    data.regiones[0].descripcion !== 'ES51 - CATALUÑA' ||
    !text(data.descripcion) ||
    !text(data.advertencia) ||
    typeof data.abierto !== 'boolean' ||
    (data.textInicio !== null && typeof data.textInicio !== 'string') ||
    (data.textFin !== null && typeof data.textFin !== 'string') ||
    (typeof data.textInicio === 'string' && data.textInicio.length > 12_000) ||
    (typeof data.textFin === 'string' && data.textFin.length > 12_000) ||
    !Array.isArray(data.documentos)
  )
    return { status: 'gap', reason: 'extraction-failed' };
  if (!isoDate(data.fechaRecepcion) || data.fechaRecepcion > response.consultedAt)
    return { status: 'gap', reason: 'invalid-date' };
  const documentDates: OtherPublicSnapshot['documentDates'] = [];
  for (const item of data.documentos) {
    if (
      !record(item) ||
      typeof item.id !== 'number' ||
      !Number.isSafeInteger(item.id) ||
      !boundedDate(item.datPublicacion, response.consultedAt) ||
      !boundedDate(item.datMod, response.consultedAt)
    )
      return { status: 'gap', reason: 'invalid-date' };
    documentDates.push({ id: item.id, publishedAt: item.datPublicacion, updatedAt: item.datMod });
  }
  const from = data.fechaInicioSolicitud;
  const to = data.fechaFinSolicitud;
  if ((from !== null && !isoDate(from)) || (to !== null && !isoDate(to)))
    return { status: 'gap', reason: 'invalid-date' };
  // No interpretation of relative deadlines or competing prose; never choose one silently.
  if (
    (from !== null && text(data.textInicio) && data.textInicio !== from) ||
    (to !== null && text(data.textFin) && data.textFin !== to) ||
    (data.abierto && to !== null) ||
    (from !== null && to !== null && from > to)
  )
    return { status: 'gap', reason: 'ambiguous-response' };
  const temporalStatus =
    to !== null && to < response.consultedAt
      ? 'closed'
      : from !== null && from > response.consultedAt
        ? 'not-yet-open'
        : from !== null && to !== null && from < response.consultedAt && response.consultedAt < to
          ? 'within-window'
          : 'unknown';
  return acquired({
    ...snapshot,
    title: data.descripcion,
    text: data.descripcion,
    receivedAt: data.fechaRecepcion,
    documentDates,
    applicationWindow: {
      from,
      to,
      textFrom: data.textInicio,
      textTo: data.textFin,
      indefinite: data.abierto,
    },
    reuseNotice: data.advertencia,
    temporalStatus,
  });
}
