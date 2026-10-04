import { expect, it } from 'vitest';
import { cataloguePages, extractPublicCatalogue } from './public-catalogues';

const day = '2026-10-04';
function page(url: string, html: string): Document {
  const document = new DOMParser().parseFromString(html, 'text/html');
  Object.defineProperty(document, 'URL', { value: url });
  return document;
}
const legalText =
  '<main>La Generalitat de Catalunya permet la reutilització. Cal citar sempre la font i no desnaturalitzar la informació.</main>';
const fue = cataloguePages.find((item) => item.id === 'fue-ca')!;
const fueInput = {
  status: 200,
  finalUrl: fue.url,
  document: page(
    fue.url,
    '<title>Finestreta única empresarial</title><h1>Finestreta única empresarial</h1><main>' +
      '<a href="/ca/integraciodepartamentaltramit/tramit/PerTemes/Alta-autonom">Alta d’autònom</a>' +
      '<a href="/ca/integraciodepartamentaltramit/tramit/PerTemes/Alta-autonom">Alta d’autònom</a>' +
      '<a href="https://foreign.test/ca/integraciodepartamentaltramit/tramit/PerTemes/other">Fora</a>' +
      '<a href="/ca/integraciodepartamentaltramit/tramit/PerTemes/other?session=private">Sessió</a>' +
      '<a href="https://canalempresa.gencat.cat/ca/area-privada">Àrea privada</a></main>',
  ),
  legalDocument: page(fue.legalUrl!, legalText),
  consultedAt: day,
};

it('adquiere solo fichas públicas FUE con competencia y vía coordinada, de forma idempotente', () => {
  const first = extractPublicCatalogue(fue.id, fueInput);
  expect(first).toEqual(extractPublicCatalogue(fue.id, fueInput));
  expect(first).toMatchObject({
    status: 'acquired',
    sourceId: 'canal-empresa-fue',
    jurisdiction: 'ES-CT',
    language: 'ca',
    competence: 'multiadministration',
    pathway: 'coordinated',
    consultedAt: day,
    items: [
      {
        title: 'Alta d’autònom',
        url: 'https://canalempresa.gencat.cat/ca/integraciodepartamentaltramit/tramit/PerTemes/Alta-autonom',
      },
    ],
  });
});

it('frena 403, redirecciones, cambios de DOM y condiciones de uso no demostradas', () => {
  expect(() => extractPublicCatalogue(fue.id, { ...fueInput, consultedAt: '2026-02-30' })).toThrow(
    'Invalid acquisition',
  );
  expect(extractPublicCatalogue(fue.id, { ...fueInput, status: 403 })).toMatchObject({
    status: 'gap',
    reason: 'unavailable',
  });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      finalUrl: 'https://canalempresa.gencat.cat/ca/privada',
    }),
  ).toMatchObject({ status: 'gap', reason: 'changed-url' });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      document: page('https://foreign.test/', '<title>Finestreta única empresarial</title>'),
    }),
  ).toMatchObject({ status: 'gap', reason: 'changed-url' });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      document: page(fue.url, '<title>Canvi</title><h1>Canvi</h1><main>No hi ha fitxes</main>'),
    }),
  ).toMatchObject({ status: 'gap', reason: 'changed-dom' });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      document: page(
        fue.url,
        '<title>Acceso restringido</title><main><a href="/ca/integraciodepartamentaltramit/tramit/PerTemes/Alta-autonom">Alta</a></main>',
      ),
    }),
  ).toMatchObject({ status: 'gap', reason: 'changed-dom' });
  expect(extractPublicCatalogue(fue.id, { ...fueInput, legalDocument: undefined })).toMatchObject({
    status: 'gap',
    reason: 'rights-unverified',
  });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      legalDocument: page(fue.legalUrl!, '<main>Todos los derechos reservados.</main>'),
    }),
  ).toMatchObject({ status: 'gap', reason: 'rights-unverified' });
  expect(
    extractPublicCatalogue(fue.id, {
      ...fueInput,
      legalDocument: page(
        fue.legalUrl!,
        '<main>No permet la reutilització. Cal citar la font i no desnaturalitzar la informació.</main>',
      ),
    }),
  ).toMatchObject({ status: 'gap', reason: 'rights-unverified' });
});

it('distingue Barcelona directo de los tres municipios pendientes de condiciones', () => {
  const barcelona = cataloguePages.find((item) => item.id === 'barcelona-ca')!;
  const result = extractPublicCatalogue(barcelona.id, {
    status: 200,
    finalUrl: barcelona.url,
    document: page(
      barcelona.url,
      '<title>Trámites telemáticos</title><main><a href="/oficinavirtual/ca/tramit/1234">Activitats</a><small>Última actualització 23/09/2026</small></main>',
    ),
    legalDocument: page(
      barcelona.legalUrl!,
      '<main>L’Ajuntament de Barcelona permet reutilitzar informació. Cal esmentar la font i no desnaturalitzar el sentit.</main>',
    ),
    consultedAt: day,
  });
  expect(result).toMatchObject({
    status: 'acquired',
    sourceId: 'barcelona-tramits',
    jurisdiction: 'ES-CT-BARCELONA',
    competence: 'municipal',
    pathway: 'direct',
    sourceUpdatedAt: '2026-09-23',
    items: [
      { url: 'https://seuelectronica.ajuntament.barcelona.cat/oficinavirtual/ca/tramit/1234' },
    ],
  });
  const spanish = cataloguePages.find((item) => item.id === 'barcelona-es')!;
  expect(
    extractPublicCatalogue(spanish.id, {
      status: 200,
      finalUrl: spanish.url,
      document: page(
        spanish.url,
        '<title>Trámites telemáticos</title><main><a href="/oficinavirtual/ca/tramit/1234">Actividades</a></main>',
      ),
      legalDocument: page(
        spanish.legalUrl!,
        '<main>El Ayuntamiento de Barcelona permite reutilizar información. Hay que mencionar la fuente y no desnaturalizar el sentido.</main>',
      ),
      consultedAt: day,
    }),
  ).toMatchObject({
    status: 'acquired',
    language: 'es',
    items: [
      {
        title: 'Actividades',
        url: 'https://seuelectronica.ajuntament.barcelona.cat/oficinavirtual/ca/tramit/1234',
      },
    ],
  });
  for (const city of ['girona', 'lleida', 'tarragona']) {
    const item = cataloguePages.find((candidate) => candidate.id.startsWith(city))!;
    expect(
      extractPublicCatalogue(item.id, {
        status: 200,
        finalUrl: item.url,
        document: page(item.url, '<h1>Tràmits</h1><main><a href="/public">Tràmit</a></main>'),
        consultedAt: day,
      }),
    ).toMatchObject({ status: 'gap', sourceId: `${city}-tramits`, reason: 'rights-unverified' });
  }
});
