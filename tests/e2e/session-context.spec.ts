import { expect } from '@playwright/test';
import { test } from './extension-fixture';

test('MV3 session context crosses extension tabs, serializes effects and clears on exit', async ({
  extension,
}) => {
  const outbound: string[] = [];
  extension.on('request', (request) => {
    if (!request.url().startsWith('chrome-extension://')) outbound.push(request.url());
  });
  const worker = extension.serviceWorkers()[0] ?? (await extension.waitForEvent('serviceworker'));
  const popup = `chrome-extension://${new URL(worker.url()).host}/popup.html`;
  const first = await extension.newPage();
  const second = await extension.newPage();
  await Promise.all([first.goto(popup), second.goto(popup)]);

  const saved = await first.evaluate(() =>
    chrome.runtime.sendMessage({
      type: 'session:save',
      objective: 'alta',
      context: {
        activity: 'ACTIVIDAD_SINTETICA',
        municipality: 'MUNICIPIO_SINTETICO',
        values: { relevant: 'VALOR_SINTETICO', hidden: 'OTRO_VALOR' },
      },
    }),
  );
  expect(saved).toEqual({ ok: true });

  const read = await second.evaluate(() =>
    chrome.runtime.sendMessage({
      type: 'session:read',
      objective: 'alta',
      selection: { municipality: true, values: ['relevant'] },
    }),
  );
  expect(read).toEqual({
    ok: true,
    value: { municipality: 'MUNICIPIO_SINTETICO', values: { relevant: 'VALOR_SINTETICO' } },
  });
  expect(await first.evaluate(() => chrome.storage.local.get(null))).not.toHaveProperty(
    'personal-context:alta:context',
  );

  const marks = await Promise.all(
    [first, second].map((page) =>
      page.evaluate(() =>
        chrome.runtime.sendMessage({
          type: 'session:mark-submission',
          objective: 'alta',
          effect: 'send',
        }),
      ),
    ),
  );
  expect(marks.map((mark) => mark.value).sort()).toEqual([false, true]);
  const cdp = await extension.newCDPSession(first);
  await cdp.send('ServiceWorker.enable');
  await cdp.send('ServiceWorker.stopAllWorkers');
  await cdp.detach();
  expect(
    await second.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'session:submission-state',
        objective: 'alta',
        effect: 'send',
      }),
    ),
  ).toEqual({ ok: true, value: 'uncertain' });
  expect(
    await second.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'session:mark-submission',
        objective: 'alta',
        effect: 'send',
      }),
    ),
  ).toEqual({ ok: true, value: false });

  await first.getByRole('button', { name: 'Finalizar sesión personal' }).click();
  await expect(first.getByRole('status')).toHaveText(
    'Se han borrado los datos de esta sesión de la extensión.',
  );
  expect(
    await second.evaluate(() =>
      chrome.runtime.sendMessage({
        type: 'session:read',
        objective: 'alta',
        selection: { activity: true, municipality: true, values: ['relevant'] },
      }),
    ),
  ).toEqual({ ok: true, value: {} });
  expect(outbound).toEqual([]);
});
