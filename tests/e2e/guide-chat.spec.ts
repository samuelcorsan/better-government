import { createHash } from 'node:crypto';
import { expect } from '@playwright/test';
import { test } from './extension-fixture';

test('la guía bilingüe se despliega antes de cualquier inicio y no transmite la consulta', async ({
  extension,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const guide = {
    id: 'factura-sintetica',
    revision: 1,
    title: { ca: 'Factura sintètica', es: 'Factura sintética' },
    domain: 'D-08',
    subtopic: 'factura',
    profiles: ['persona-fisica'],
    jurisdiction: 'ES-CT',
    consultedAt: today,
    period: { from: today, evidenceIds: ['rule'] },
    validation: { status: 'verified', checkedAt: today, method: 'automatic' },
    evidence: [
      {
        id: 'rule',
        sourceId: 'oficina-sintetica',
        url: 'https://example.test/factura',
        originalUrl: 'https://example.test/factura',
        version: today,
        language: 'es',
        attribution: 'Oficina sintética',
        sourceUpdatedAt: today,
        applicableFrom: today,
        applicableUntil: null,
        informative: false,
        jurisdiction: 'ES-CT',
        quote: 'Factura sintética para una prueba de interfaz.',
      },
    ],
    conditions: [
      {
        id: 'condition',
        text: { ca: 'Si ets persona física.', es: 'Si eres persona física.' },
        evidenceIds: ['rule'],
        translation: 'ca',
      },
    ],
    exclusions: [
      {
        id: 'limit',
        text: { ca: 'No cobreix societats.', es: 'No cubre sociedades.' },
        evidenceIds: ['rule'],
        translation: 'ca',
      },
    ],
    claims: [
      {
        id: 'fact',
        text: { ca: 'Consulta la factura.', es: 'Consulta la factura.' },
        evidenceIds: ['rule'],
        translation: 'ca',
        kind: 'fact',
        conditionIds: ['condition'],
      },
    ],
    steps: [
      {
        id: 'step',
        text: { ca: 'Consulta la font.', es: 'Consulta la fuente.' },
        evidenceIds: ['rule'],
        translation: 'ca',
        dependsOn: [],
      },
    ],
  };
  const body = JSON.stringify({
    schemaVersion: 1,
    revision: 1,
    publishedAt: today,
    validUntil: '2099-12-31',
    guides: [guide],
    retiredGuides: [],
    flows: [],
  });
  const sha256 = createHash('sha256').update(body).digest('hex');
  const outbound: string[] = [];
  extension.on('request', (request) => {
    if (!request.url().startsWith('chrome-extension://')) outbound.push(request.url());
  });
  const worker = extension.serviceWorkers()[0] ?? (await extension.waitForEvent('serviceworker'));
  const page = await extension.newPage();
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(`chrome-extension://${new URL(worker.url()).host}/popup.html`);
  await page.evaluate(
    async ({ body, sha256, today }) => {
      await chrome.storage.session.set({ 'public-catalogue': { body, sha256, checkedAt: today } });
    },
    { body, sha256, today },
  );
  await page.reload();
  await expect(page.getByRole('option', { name: 'persona fisica' })).toHaveCount(1);
  await page.getByLabel('Tema o tràmit').fill('factura');
  await page.getByRole('button', { name: 'Cerca guies' }).click();
  const summary = page.locator('summary').filter({ hasText: 'Factura sintètica' });
  await expect(summary).toBeVisible();
  await expect(
    page.getByText('El portal per tramitar no està verificat en aquesta guia.'),
  ).toBeHidden();
  await summary.focus();
  await summary.press('Enter');
  await expect(
    page.getByText('El portal per tramitar no està verificat en aquesta guia.'),
  ).toBeVisible();
  await expect(page.getByText('Només guia; sense automatització verificada.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inicia el tràmit' })).toBeDisabled();
  await expect(page.getByRole('link', { name: /Oficina sintética/ })).toHaveAttribute(
    'href',
    'https://example.test/factura',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(outbound).toEqual([]);
  await page.getByLabel('Idioma de la guia').selectOption('es');
  await page.getByRole('button', { name: 'Buscar guías' }).click();
  await expect(page.locator('summary').filter({ hasText: 'Factura sintética' })).toBeVisible();
  expect(outbound).toEqual([]);
});
