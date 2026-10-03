import { normalizeText, type Source } from '@reforma-digital/core';

const jurisdictionAliases = new Map([
  ['es', 'ES'],
  ['espana', 'ES'],
  ['espanya', 'ES'],
  ['es md', 'ES-MD'],
  ['comunidad de madrid', 'ES-MD'],
  ['es md madrid', 'ES-MD-MADRID'],
  ['madrid', 'ES-MD-MADRID'],
  ['es ct', 'ES-CT'],
  ['cataluna', 'ES-CT'],
  ['catalunya', 'ES-CT'],
  ['es ct barcelona', 'ES-CT-BARCELONA'],
  ['barcelona', 'ES-CT-BARCELONA'],
  ['es ct girona', 'ES-CT-GIRONA'],
  ['girona', 'ES-CT-GIRONA'],
  ['gerona', 'ES-CT-GIRONA'],
  ['es ct lleida', 'ES-CT-LLEIDA'],
  ['lleida', 'ES-CT-LLEIDA'],
  ['lerida', 'ES-CT-LLEIDA'],
  ['es ct tarragona', 'ES-CT-TARRAGONA'],
  ['tarragona', 'ES-CT-TARRAGONA'],
]);

export function resolveJurisdictionAlias(alias: string): string | undefined {
  return jurisdictionAliases.get(normalizeText(alias));
}

const define = (
  id: string,
  name: string,
  baseUrl: string,
  hosts: string[],
  jurisdictionValue: string,
): Source => ({
  id,
  name,
  baseUrl,
  hosts,
  organization: name,
  jurisdictionType:
    jurisdictionValue === 'ES'
      ? 'country'
      : jurisdictionValue.split('-').length === 2
        ? 'region'
        : 'municipality',
  jurisdictionValue,
  authorityScore: id === 'administracion' ? 80 : 100,
  enabled: true,
});
const publicSource = (
  id: string,
  name: string,
  jurisdiction: string,
  languages: ('ca' | 'es')[],
  publicUrls: string[],
): Source => {
  const url = new URL(publicUrls[0]!);
  return {
    ...define(id, name, url.origin, [url.hostname], jurisdiction),
    languages,
    publicUrls,
    enabled: false,
  };
};
export const sources: Source[] = [
  define(
    'administracion',
    'Punto de Acceso General',
    'https://administracion.gob.es',
    ['administracion.gob.es'],
    'ES',
  ),
  define(
    'interior',
    'Ministerio del Interior',
    'https://www.interior.gob.es',
    ['www.interior.gob.es', 'interior.gob.es'],
    'ES',
  ),
  define('boe', 'Boletín Oficial del Estado', 'https://www.boe.es', ['www.boe.es', 'boe.es'], 'ES'),
  define(
    'aeat',
    'Agencia Tributaria',
    'https://sede.agenciatributaria.gob.es',
    ['sede.agenciatributaria.gob.es', 'www3.agenciatributaria.gob.es'],
    'ES',
  ),
  define(
    'seg-social',
    'Seguridad Social · Importass',
    'https://portal.seg-social.gob.es',
    ['portal.seg-social.gob.es', 'www.seg-social.es', 'sede.seg-social.gob.es'],
    'ES',
  ),
  define(
    'dgt',
    'Dirección General de Tráfico',
    'https://sede.dgt.gob.es',
    ['sede.dgt.gob.es', 'www.dgt.es'],
    'ES',
  ),
  define(
    'sepe',
    'Servicio Público de Empleo Estatal',
    'https://www.sepe.es',
    ['www.sepe.es', 'sede.sepe.gob.es'],
    'ES',
  ),
  define(
    'educacion',
    'Ministerio de Educación',
    'https://www.becaseducacion.gob.es',
    ['www.becaseducacion.gob.es', 'www.educacionfpydeportes.gob.es', 'sede.educacion.gob.es'],
    'ES',
  ),
  define(
    'comunidad-madrid',
    'Comunidad de Madrid',
    'https://www.comunidad.madrid',
    ['www.comunidad.madrid', 'sede.comunidad.madrid'],
    'ES-MD',
  ),
  define(
    'ayuntamiento-madrid',
    'Ayuntamiento de Madrid',
    'https://sede.madrid.es',
    ['sede.madrid.es', 'www.madrid.es'],
    'ES-MD-MADRID',
  ),
  publicSource(
    'gencat-tramits',
    'Generalitat de Catalunya · Tràmits',
    'ES-CT',
    ['ca', 'es'],
    [
      'https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html',
      'https://tramits.gencat.cat/es/tramits/tramits-temes/index.html',
      'https://tramits.gencat.cat/ca/tramits/tramits-temes/Alta-dun-empresari-individual-o-treballador-autonom',
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Alta-dun-empresari-individual-o-treballador-autonom',
    ],
  ),
  publicSource(
    'canal-empresa-fue',
    'Canal Empresa · FUE',
    'ES-CT',
    ['ca', 'es'],
    [
      'https://canalempresa.gencat.cat/ca/fue/',
      'https://canalempresa.gencat.cat/es/fue/',
      'https://canalempresa.gencat.cat/ca/01_que_voleu_fer/02_comencar_un_negoci/crear-empresa-constitucio-tramits/vull_ser_autonom',
    ],
  ),
  publicSource(
    'portal-juridic-catalunya',
    'Portal Jurídic de Catalunya',
    'ES-CT',
    ['ca'],
    ['https://portaljuridic.gencat.cat/ca/normativa/dret-a-catalunya/'],
  ),
  publicSource(
    'dogc',
    'Diari Oficial de la Generalitat de Catalunya',
    'ES-CT',
    ['ca', 'es'],
    [
      'https://dogc.gencat.cat/ca/document-del-dogc/',
      'https://dogc.gencat.cat/es/document-del-dogc/',
    ],
  ),
  publicSource(
    'aoc-etram',
    'Consorci AOC · e-TRAM',
    'ES-CT',
    ['ca'],
    ['https://www.aoc.cat/serveis-aoc/e-tram/'],
  ),
  publicSource(
    'barcelona-tramits',
    'Ajuntament de Barcelona · Tràmits',
    'ES-CT-BARCELONA',
    ['ca', 'es'],
    [
      'https://seuelectronica.ajuntament.barcelona.cat/ca/tramites-telematicos',
      'https://seuelectronica.ajuntament.barcelona.cat/es/tramites-telematicos',
    ],
  ),
  publicSource(
    'girona-tramits',
    'Ajuntament de Girona · Tràmits',
    'ES-CT-GIRONA',
    ['ca', 'es'],
    [
      'https://seu.girona.cat/portal/girona_ca/serveis/e-registre/',
      'https://seu.girona.cat/portal/girona_es/serveis/e-registre/',
    ],
  ),
  publicSource(
    'lleida-tramits',
    'Ajuntament de Lleida · Tràmits',
    'ES-CT-LLEIDA',
    ['ca'],
    [
      'https://tramits.paeria.cat/',
      'https://tramits.paeria.cat/Ciutadania/DetallTramit.aspx?IdTramit=960',
    ],
  ),
  publicSource(
    'tarragona-tramits',
    'Ajuntament de Tarragona · Tràmits',
    'ES-CT-TARRAGONA',
    ['ca', 'es'],
    [
      'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&lang=CA',
      'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&lang=ES',
    ],
  ),
  publicSource(
    'atc-irpf',
    'Agència Tributària de Catalunya · IRPF',
    'ES-CT',
    ['ca', 'es'],
    ['https://atc.gencat.cat/ca/tributs/irpf/', 'https://atc.gencat.cat/es/tributs/irpf/'],
  ),
  publicSource(
    'soc-autonoms',
    'Servei Públic d’Ocupació de Catalunya · Autònoms',
    'ES-CT',
    ['ca', 'es'],
    [
      'https://serveiocupacio.gencat.cat/ca/soc/ocupacio-juvenil/emprenedoria/ajuts-per-a-persones-emprenedores-i-treballadores-autonomes/index.html',
      'https://serveiocupacio.gencat.cat/es/soc/ocupacio-juvenil/emprenedoria/ajuts-per-a-persones-emprenedores-i-treballadores-autonomes/',
    ],
  ),
];
export function approvedSource(url: string, sourceId?: string): Source | undefined {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return;
    return sources.find(
      (s) =>
        s.enabled &&
        (!sourceId || s.id === sourceId) &&
        s.hosts.includes(u.hostname) &&
        (!s.publicUrls || s.publicUrls.includes(u.origin + u.pathname + u.search)),
    );
  } catch {
    return;
  }
}
export function canonicalize(url: string): string {
  const u = new URL(url);
  u.hash = '';
  for (const key of [...u.searchParams.keys()])
    if (/^(utm_|fbclid|gclid|print$|imprimir$)/i.test(key)) u.searchParams.delete(key);
  u.searchParams.sort();
  return u.toString();
}
export function sourceById(id: string): Source {
  const s = sources.find((s) => s.id === id && s.enabled);
  if (!s) throw new Error('Fuente no aprobada: ' + id);
  return s;
}
// A place name can disqualify a general source, but cannot establish a narrower scope.
const territorialSignal =
  /\b(?:asturias|andalucia|aragon|illes balears|islas baleares|canarias|cantabria|castilla la mancha|castilla y leon|cataluna|catalunya|comunitat valenciana|comunidad valenciana|extremadura|galicia|madrid|murcia|navarra|pais vasco|euskadi|la rioja|ceuta|melilla|barcelona|girona|gerona|lleida|lerida|tarragona)\b/;

export function documentJurisdiction(
  source: Source,
  text: string,
  url: string,
): string | undefined {
  if (source.jurisdictionValue !== 'ES') return source.jurisdictionValue;
  try {
    return territorialSignal.test(normalizeText(text + ' ' + decodeURI(url))) ? undefined : 'ES';
  } catch {
    return undefined;
  }
}
export function documentYear(title: string, url: string): number | null {
  const match = (title + ' ' + url).match(
    /(?:irpf[ -]|manual[^/]*?|renta[ -]|curso[ -])(20\d{2})/i,
  );
  return match ? Number(match[1]) : null;
}
