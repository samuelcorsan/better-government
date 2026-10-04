/** Public legal-source snapshots. No portal session or document body is retained. */
export type LegalSnapshot = {
  source: 'boe' | 'portal-juridic';
  id: string;
  eli: string | null;
  language: 'es' | 'ca';
  version: string;
  versionDate: string;
  publishedAt: string;
  originalUrl: string;
  informativeUrl: string | null;
  reportedStatus: 'in_force' | 'repealed' | 'ceased';
  observation: 'consolidated' | 'original_only';
  metadataRevision: string | null;
  materialDigest: string | null;
};

export type LegalAcquisition =
  | { ok: true; snapshot: LegalSnapshot }
  | {
      ok: false;
      source: LegalSnapshot['source'];
      id: string;
      reason: 'input' | 'http' | 'timeout' | 'parser' | 'version';
    };

const boeId = /^BOE-A-\d{4}-\d{1,8}$/;
const controlNumber = /^\d{1,12}$/;
const day = /^\d{4}-\d{2}-\d{2}$/;

function date(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)
      ? value.slice(0, 10)
      : '';
  const parsed = Date.parse(normalized);
  return day.test(normalized) &&
    !Number.isNaN(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === normalized
    ? normalized
    : null;
}

function officialUrl(value: unknown, host: string, path: RegExp): string | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === host &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.hash &&
      path.test(url.pathname)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

async function publicResponse(
  url: string,
  accept: string,
  fetcher: typeof fetch,
): Promise<Response> {
  return fetcher(url, {
    headers: { Accept: accept },
    credentials: 'omit',
    redirect: 'error',
    signal: AbortSignal.timeout(15_000),
  });
}

function failure(
  source: LegalSnapshot['source'],
  id: string,
  reason: Extract<LegalAcquisition, { ok: false }>['reason'],
): LegalAcquisition {
  return { ok: false, source, id, reason };
}

function networkFailure(
  source: LegalSnapshot['source'],
  id: string,
  error: unknown,
): LegalAcquisition {
  const name = error && typeof error === 'object' && 'name' in error ? error.name : null;
  return failure(source, id, name === 'AbortError' || name === 'TimeoutError' ? 'timeout' : 'http');
}

function xmlDocument(xml: string): Document | null {
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) return null;
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return doc.querySelector('parsererror') ? null : doc;
}

async function digest(value: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Fetches only the documented public metadata and versioned consolidated XML. */
export async function acquireBoe(
  id: string,
  fetcher: typeof fetch = fetch,
  asOf = new Date().toISOString().slice(0, 10),
): Promise<LegalAcquisition> {
  if (!boeId.test(id) || !day.test(asOf) || date(asOf) !== asOf) return failure('boe', id, 'input');
  const base = `https://www.boe.es/datosabiertos/api/legislacion-consolidada/id/${id}`;
  let metadata: Response;
  let text: Response;
  try {
    metadata = await publicResponse(`${base}/metadatos`, 'application/json', fetcher);
    text = await publicResponse(`${base}/texto`, 'application/xml', fetcher);
  } catch (error) {
    return networkFailure('boe', id, error);
  }
  if (!metadata.ok || !text.ok) return failure('boe', id, 'http');
  try {
    const payload: unknown = await metadata.json();
    const record = (payload as { status?: { code?: unknown }; data?: unknown })?.data;
    const item = Array.isArray(record) && record.length === 1 ? record[0] : null;
    if (
      (payload as { status?: { code?: unknown } })?.status?.code !== '200' ||
      !item ||
      typeof item !== 'object'
    )
      return failure('boe', id, 'parser');
    const m = item as Record<string, unknown>;
    const publishedAt = date(m.fecha_publicacion);
    const metadataRevision =
      typeof m.fecha_actualizacion === 'string' &&
      /^\d{8}T\d{6}Z$/.test(m.fecha_actualizacion) &&
      date(m.fecha_actualizacion.slice(0, 8))
        ? m.fecha_actualizacion
        : null;
    const eli = m.url_eli == null ? null : officialUrl(m.url_eli, 'www.boe.es', /^\/eli\/es\//);
    const informativeUrl = officialUrl(
      m.url_html_consolidada,
      'www.boe.es',
      /^\/buscar\/act\.php$/,
    );
    if (
      m.identificador !== id ||
      (m.ambito as { codigo?: unknown } | undefined)?.codigo !== '1' ||
      !publishedAt ||
      !metadataRevision ||
      !informativeUrl ||
      (m.url_eli && !eli) ||
      !['S', 'N'].includes(String(m.estatus_derogacion)) ||
      !['S', 'N'].includes(String(m.estatus_anulacion)) ||
      !['S', 'N'].includes(String(m.vigencia_agotada))
    )
      return failure('boe', id, 'parser');
    const informativeQuery = new URL(informativeUrl).searchParams;
    if (
      informativeQuery.size !== 1 ||
      informativeQuery.get('id') !== id ||
      (eli && new URL(eli).search)
    )
      return failure('boe', id, 'parser');

    const document = xmlDocument(await text.text());
    if (!document || document.querySelector('response > status > code')?.textContent !== '200')
      return failure('boe', id, 'parser');
    const blocks = [...document.querySelectorAll('data > texto > bloque')];
    if (!blocks.length) return failure('boe', id, 'version');
    const selected: string[] = [];
    let versionDate = publishedAt;
    for (const block of blocks) {
      const expires = block.getAttribute('fecha_caducidad');
      if (expires && !date(expires)) return failure('boe', id, 'version');
      if (expires && date(expires)! <= asOf) continue;
      const versions = [...block.children].filter((child) => child.tagName === 'version');
      if (!block.getAttribute('id') || !versions.length) return failure('boe', id, 'version');
      if (
        versions.some(
          (version) =>
            !date(version.getAttribute('fecha_vigencia')) ||
            !date(version.getAttribute('fecha_publicacion')) ||
            !version.getAttribute('id_norma'),
        )
      )
        return failure('boe', id, 'version');
      const eligible = versions
        .map((version) => ({ version, effective: date(version.getAttribute('fecha_vigencia')) }))
        .filter((entry) => entry.effective && entry.effective <= asOf)
        .sort((a, b) => b.effective!.localeCompare(a.effective!));
      if (!eligible.length) continue;
      const latest = eligible[0]!;
      versionDate = latest.effective! > versionDate ? latest.effective! : versionDate;
      const serializer = new XMLSerializer();
      selected.push(
        `${block.getAttribute('id')}\0${[...latest.version.childNodes].map((node) => serializer.serializeToString(node)).join('')}`,
      );
    }
    if (!selected.length) return failure('boe', id, 'version');
    return {
      ok: true,
      snapshot: {
        source: 'boe',
        id,
        eli,
        language: 'es',
        version: versionDate,
        versionDate,
        publishedAt,
        originalUrl: `https://www.boe.es/buscar/doc.php?id=${id}`,
        informativeUrl,
        reportedStatus:
          m.estatus_derogacion === 'S'
            ? 'repealed'
            : m.estatus_anulacion === 'S' || m.vigencia_agotada === 'S'
              ? 'ceased'
              : 'in_force',
        observation: 'consolidated',
        metadataRevision,
        materialDigest: await digest(selected.join('\n')),
      },
    };
  } catch {
    return failure('boe', id, 'parser');
  }
}

/** The dataset exposes the original DOGC publication; it does not prove a current consolidation. */
export async function acquireCatalan(
  control: string,
  language: 'ca' | 'es',
  fetcher: typeof fetch = fetch,
): Promise<LegalAcquisition> {
  if (!controlNumber.test(control) || !['ca', 'es'].includes(language))
    return failure('portal-juridic', control, 'input');
  const query = new URL('https://analisi.transparenciacatalunya.cat/resource/n6hn-rmy7.json');
  query.searchParams.set('$where', `n_mero_de_control='${control}'`);
  query.searchParams.set('$limit', '2');
  let response: Response;
  try {
    response = await publicResponse(query.href, 'application/json', fetcher);
  } catch (error) {
    return networkFailure('portal-juridic', control, error);
  }
  if (!response.ok) return failure('portal-juridic', control, 'http');
  try {
    const payload: unknown = await response.json();
    if (
      !Array.isArray(payload) ||
      payload.length !== 1 ||
      typeof payload[0] !== 'object' ||
      !payload[0]
    )
      return failure('portal-juridic', control, 'parser');
    const row = payload[0] as Record<string, unknown>;
    const value = row[language === 'ca' ? 'format_html' : 'url_es_formato_html'];
    const originalUrl = officialUrl(
      (value as { url?: unknown } | undefined)?.url,
      'portaljuridic.gencat.cat',
      new RegExp(
        `^/eli/es-ct/[a-z]+/\\d{4}/\\d{2}/\\d{2}/[^/]+/dof/${language === 'ca' ? 'cat' : 'spa'}/html$`,
      ),
    );
    const publishedAt = date(row.data_de_publicaci_del_diari);
    if (
      row.n_mero_de_control !== control ||
      !originalUrl ||
      new URL(originalUrl).search !== '' ||
      !publishedAt ||
      !['Vigent', 'Derogada'].includes(String(row.vig_ncia_de_la_norma))
    )
      return failure('portal-juridic', control, 'parser');
    const eli = originalUrl.replace(/\/dof\/(?:cat|spa)\/html$/, '');
    return {
      ok: true,
      snapshot: {
        source: 'portal-juridic',
        id: control,
        eli,
        language,
        version: 'dof',
        versionDate: publishedAt,
        publishedAt,
        originalUrl,
        informativeUrl: null,
        reportedStatus: row.vig_ncia_de_la_norma === 'Vigent' ? 'in_force' : 'repealed',
        observation: 'original_only',
        metadataRevision: null,
        materialDigest: null,
      },
    };
  } catch {
    return failure('portal-juridic', control, 'parser');
  }
}

/** A material change requires observed versioned text on both sides. */
export function compareLegalSnapshots(
  previous: LegalSnapshot,
  next: LegalSnapshot,
): 'material' | 'metadata' | 'unchanged' | 'stale' | 'unverifiable' {
  if (
    previous.source !== next.source ||
    previous.id !== next.id ||
    previous.language !== next.language
  )
    return 'unverifiable';
  if (
    next.versionDate < previous.versionDate ||
    (next.metadataRevision &&
      previous.metadataRevision &&
      next.metadataRevision < previous.metadataRevision)
  )
    return 'stale';
  if (
    previous.materialDigest &&
    next.materialDigest &&
    previous.materialDigest !== next.materialDigest
  )
    return 'material';
  if (
    previous.reportedStatus !== next.reportedStatus ||
    previous.metadataRevision !== next.metadataRevision ||
    previous.eli !== next.eli ||
    previous.publishedAt !== next.publishedAt ||
    previous.version !== next.version ||
    previous.observation !== next.observation ||
    previous.originalUrl !== next.originalUrl ||
    previous.informativeUrl !== next.informativeUrl
  )
    return 'metadata';
  return previous.materialDigest && next.materialDigest ? 'unchanged' : 'unverifiable';
}
