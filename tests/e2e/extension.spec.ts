import { expect } from '@playwright/test';
import { test } from './extension-fixture';

const login = 'http://127.0.0.1:4173/citaPreviaDni/InicioDNINIE.action';

test('real MV3 content script synchronizes input in the isolated world and preserves submission', async ({
  extension,
}) => {
  const page = await extension.newPage();
  const requests: string[] = [];
  page.on('request', (req) => requests.push(req.url()));
  await page.goto(login);
  await expect(page.locator('[data-bg-host]')).toHaveCount(6);
  const pairs = [
    ['document', '00000000'],
    ['letter', 'A'],
    ['team', '000000'],
    ['expiry', '01/01/2030'],
    ['support', 'AAA000000'],
  ];
  for (const [id, value] of pairs) await page.locator(`[data-binding="${id}"] input`).fill(value!);
  expect(await page.locator('#dni').inputValue()).toBe('00000000');
  await page.evaluate(() => {
    document.querySelector<HTMLInputElement>('#team')!.value = '111111';
  });
  await expect(page.locator('[data-binding="team"] input')).toHaveValue('111111');
  await page.locator('#captcha').fill('ABCD');
  await page.locator('#submit').click();
  const receipt = JSON.parse(await page.locator('#result').innerText());
  expect(receipt).toMatchObject({
    numero: '00000000',
    equipo: '111111',
    csrf: 'fixture-csrf-not-a-secret',
    operation: 'continue',
    captcha: 'ABCD',
  });
  expect(
    requests.every(
      (url) => url.startsWith('http://127.0.0.1:4173/') || url.startsWith('chrome-extension://'),
    ),
  ).toBe(true);
});

test('validation reveals original controls and keeps entered values', async ({ extension }) => {
  const page = await extension.newPage();
  await page.goto(login);
  await page.locator('[data-binding="document"] input').fill('123');
  await page.locator('#submit').click();
  await expect(page.locator('[data-bg-host]')).toHaveCount(0);
  await expect(page.locator('#dni')).toBeVisible();
  await expect(page.locator('#dni')).toHaveValue('123');
  await expect(page.locator('#dni')).toBeFocused();
  expect(await page.locator('body').getAttribute('data-submitted')).toBeNull();
});

test('reset, fieldset disabled state and an unexpected DOM replacement are handled', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await page.goto(login);
  await page.locator('[data-binding="document"] input').fill('00000000');
  await page.getByRole('button', { name: 'Borrar', exact: true }).click();
  await expect(page.locator('[data-binding="document"] input')).toHaveValue('');
  await page.evaluate(() => {
    document.querySelector<HTMLInputElement>('#dni')!.disabled = true;
  });
  await expect(page.locator('[data-binding="document"] input')).toBeDisabled();
  await page.evaluate(() => {
    document.querySelector('#team')!.replaceWith(document.createElement('input'));
  });
  await expect(page.locator('[data-bg-host]')).toHaveCount(0);
  await expect(page.locator('#dni')).toBeVisible();
});

test('manual restore changes neither values, tokens, DOM ancestry nor existing listeners', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await page.goto(login);
  await page.locator('[data-binding="document"] input').fill('00000000');
  await page.getByRole('button', { name: 'Ver original' }).click();
  await expect(page.locator('[data-bg-host]')).toHaveCount(0);
  expect(await page.locator('#dni').evaluate((input: HTMLInputElement) => input.form?.id)).toBe(
    'official-form',
  );
  await expect(page.locator('#dni')).toHaveValue('00000000');
  await expect(page.locator('input[name="csrf"]')).toHaveValue('fixture-csrf-not-a-secret');
  await page.locator('#refresh-captcha').click();
  await expect(page.locator('#captcha-image')).toContainText('EFGH');
});

test('certificate, cookies and CAPTCHA actions retain genuine user events', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await page.goto('http://127.0.0.1:4173/citaPreviaDni/Inicio.action');
  await expect(page.locator('[data-bg-host]')).toHaveCount(2);
  await page.locator('#certificate').click();
  expect(await page.locator('body').getAttribute('data-certificate-trusted')).toBe('true');
  await page.locator('#cookies').click();
  await expect(page.locator('#cookie-notice')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Acceder con DNI o NIE/ })).toHaveAttribute(
    'href',
    'https://www.citapreviadnie.es/citaPreviaDni/InicioDNINIE.action',
  );
  await page.goto(login);
  await page.locator('#audio').click();
  expect(await page.locator('body').getAttribute('data-audio-trusted')).toBe('true');
});

test('field identity changes trigger recovery without accepting a new target', async ({
  extension,
}) => {
  const page = await extension.newPage();
  await page.goto(login);
  await expect(page.locator('[data-bg-host]')).toHaveCount(6);
  await page.evaluate(() => {
    document.querySelector<HTMLInputElement>('#dni')!.type = 'password';
  });
  await expect(page.locator('[data-bg-host]')).toHaveCount(0);
  await expect(page.locator('#dni')).toBeVisible();
});

test('unrecognized routes and page messages cannot activate a redesign', async ({ extension }) => {
  const page = await extension.newPage();
  await page.goto('http://127.0.0.1:4173/citaPreviaDni/Unknown.action');
  await page.evaluate(() => window.postMessage({ type: 'enable', site: 'dni' }, '*'));
  await expect(page.locator('[data-bg-site]')).toHaveCount(0);
});

test('unsupported site routes show a reportable notice without calling the network', async ({
  extension,
}) => {
  const page = await extension.newPage();
  const requests: string[] = [];
  page.on('request', (req) => requests.push(req.url()));
  await page.goto('http://127.0.0.1:4173/citaPreviaDni/Unknown.action');
  await expect(page.locator('[data-bg-notice]')).toHaveCount(1);
  await expect(page.locator('[data-bg-notice]')).toContainText('icono de Reforma Digital');
  expect(
    requests.every(
      (url) => url.startsWith('http://127.0.0.1:4173/') || url.startsWith('chrome-extension://'),
    ),
  ).toBe(true);
});
