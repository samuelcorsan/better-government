import { expect, type Page, type Request } from '@playwright/test';
import { test } from './extension-fixture';

/**
 * Cita previa de Extranjería on the local playground, with HTML captured from the real official
 * pages (sites/extranjeria/fixtures). Official scripts and stylesheets are not in the fixtures;
 * requests that would leave 127.0.0.1 are recorded and aborted.
 */
const base = 'http://127.0.0.1:4173';
const landing = `${base}/pagina/index/directorio/icpplus`;
const provincias = `${base}/icpplus/index.html`;
const tramites = `${base}/icpplustiem/citar?p=28&locale=es`;
const info = `${base}/icpplustiem/acInfo`;

async function open(page: Page, url: string) {
  const external: Request[] = [];
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4173)/, (route) => {
    external.push(route.request());
    return route.abort();
  });
  await page.goto(url);
  return external;
}
const panel = (page: Page) => page.locator('[data-bg-host]');
/** Records clicks that reach an official control, from the page's own world. */
const watchClicks = (page: Page, selector: string) =>
  page.evaluate((s) => {
    document
      .querySelector(s)!
      .addEventListener('click', () => (document.body.dataset.officialClick = s));
  }, selector);

test('landing: guide, community bar and the official button behind "Empezar"', async ({
  extension,
}) => {
  const page = await extension.newPage();
  const external = await open(page, landing);
  await expect(panel(page)).toHaveCount(3);
  await expect(page.getByText('Interfaz comunitaria · sitio oficial')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-bg-page', 'landing');
  // The official privacy notice stays visible; the replicated official button is hidden.
  await expect(page.locator('#mainWindow fieldset')).toBeVisible();
  await expect(page.locator('form#formulario input[type="submit"]')).toBeHidden();
  await page.getByRole('button', { name: /Empezar en la web oficial/ }).click();
  await expect
    .poll(() => external.map((r) => `${r.method()} ${r.url()}`))
    .toContain('POST https://icp.administracionelectronica.gob.es/icpplus/index.html');
});

test('provinces: search, official select synchronization and official "Aceptar"', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await open(page, provincias);
  await expect(panel(page)).toHaveCount(3);
  await page.getByLabel('Buscar provincia').fill('mala');
  await expect(page.getByRole('radio')).toHaveCount(1);
  await page.getByRole('radio', { name: 'Málaga', exact: true }).check();
  await expect
    .poll(() =>
      page.$eval('select#form', (s: HTMLSelectElement) => s.options[s.selectedIndex]!.text),
    )
    .toBe('Málaga');
  await watchClicks(page, '#btnAceptar');
  await page.getByRole('button', { name: /Continuar con Málaga/ }).click();
  await expect(page.locator('body')).toHaveAttribute('data-official-click', '#btnAceptar');
});

test('trámites: grouped search and one synchronized official group', async ({ extension }) => {
  const page = await extension.newPage();
  await open(page, tramites);
  const continuar = page.getByRole('button', { name: /^Continuar/ });
  await expect(continuar).toBeDisabled();
  await page.getByLabel('Buscar trámite').fill('huellas');
  await page.getByRole('radio').first().check();
  await expect
    .poll(() => page.$eval('[id="tramiteGrupo[0]"]', (s: HTMLSelectElement) => s.value))
    .toBe('4010');
  await expect(continuar).toBeEnabled();
  // Province notices remain in the page.
  await expect(page.locator('#divMensajesProv')).toBeVisible();
});

test('info: equivalent official options; the personal-data form keeps its original UI', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await open(page, info);
  await expect(page.getByRole('button', { name: /Presentación con Cl@ve/ })).toBeVisible();
  await expect(page.locator('form[name="info"] .show_code')).toBeVisible();
  await page.getByRole('button', { name: /Presentación sin Cl@ve/ }).click();
  await page.waitForURL(/acEntrada/);
  await expect(page.getByText('Pantalla sin adaptación')).toBeVisible();
  await expect(page.locator('[data-bg-host]')).toHaveCount(0);
  await expect(page.locator('[data-bg-notice]')).toHaveCount(1);
  await expect(page.locator('[data-bg-notice]')).toContainText('icono de Reforma Digital');
});

test('"Ver original" restores official controls and removes the page theme', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await open(page, provincias);
  await expect(page.locator('select#form')).toBeHidden();
  await page.getByRole('button', { name: 'Ver original', exact: true }).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(page.locator('select#form')).toBeVisible();
  await expect(page.locator('html')).not.toHaveAttribute('data-bg-site');
});

test('an expected screen with an unexpected DOM stays original and shows a notice', async ({
  extension,
}) => {
  test.setTimeout(45_000);
  const page = await extension.newPage();
  await page.route(provincias, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<!doctype html><html lang="es"><body><h1>Página bloqueada</h1></body></html>',
    }),
  );
  await page.goto(provincias);
  await expect(page.getByText('Reforma Digital · web original')).toBeVisible({ timeout: 20_000 });
  await expect(panel(page)).toHaveCount(0);
});
