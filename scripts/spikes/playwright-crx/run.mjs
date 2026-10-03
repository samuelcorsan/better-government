import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const here = path.dirname(fileURLToPath(import.meta.url));
const temporary = await mkdtemp(path.join(os.tmpdir(), 'reforma-digital-crx-spike-'));
const extension = path.join(temporary, 'extension');
let browser;
let contextRequests = 0;
let contextLogs = 0;
let controlErrors = 0;
let externalRequests = 0;
const fixtureResponses = { main: 0, frame: 0, crossSiteFrame: 0 };
const fixture = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>Synthetic fixture, no personal data</title>
<form><label>Original synthetic value<input id="original"></label>
<label>Connected synthetic value<input id="connected"></label>
<button type="submit">Apply locally</button></form>
<script>
document.querySelector('#original').value = 'RD-SYNTHETIC-CONTEXT-' + crypto.randomUUID();
document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  document.documentElement.dataset.applied = String(
    document.querySelector('#original').value === document.querySelector('#connected').value);
  document.documentElement.dataset.clicks = String(
    Number(document.documentElement.dataset.clicks || 0) + 1);
});
</script>`;
// Only booleans/counts are retained. The fixture creates its marker in the browser.
const server = createServer((request, response) => {
  if (request.url === '/main') fixtureResponses.main++;
  if (request.url === '/frame') fixtureResponses.frame++;
  if (request.headers.host?.startsWith('localhost:') && request.url === '/frame')
    fixtureResponses.crossSiteFrame++;
  if (request.url?.includes('RD-SYNTHETIC-CONTEXT-')) contextRequests++;
  request.on('data', (chunk) => {
    if (chunk.toString().includes('RD-SYNTHETIC-CONTEXT-')) contextRequests++;
  });
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  const port = server.address().port;
  response.end(
    fixture +
      (request.url === '/main'
        ? `<iframe id="same-origin" src="/frame"></iframe>
           <iframe id="cross-origin" src="http://localhost:${port}/frame"></iframe>`
        : ''),
  );
});

try {
  // Package the published ESM files unchanged. No runtime downloads or Node polyfills added here.
  const candidate = path.join(here, 'node_modules/playwright-crx/lib');
  const entry = await readFile(path.join(candidate, 'index.mjs'), 'utf8');
  const modules = [
    'index.mjs',
    ...new Set([...entry.matchAll(/from "\.\/(index-[\w-]+\.mjs)"/g)].map((match) => match[1])),
  ];
  await mkdir(path.join(extension, 'candidate'), { recursive: true });
  let bundle = '';
  for (const name of modules) {
    await cp(path.join(candidate, name), path.join(extension, 'candidate', name));
    bundle += await readFile(path.join(candidate, name), 'utf8');
  }
  const manifest = {
    manifest_version: 3,
    name: 'Reforma Digital Playwright synthetic spike',
    version: '0.0.1',
    permissions: ['debugger', 'tabs', 'storage'],
    background: { service_worker: 'worker.js', type: 'module' },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'none'; connect-src 'none'",
    },
  };
  assert.ok(!manifest.permissions.includes('nativeMessaging'));
  assert.equal(manifest.host_permissions, undefined);
  await writeFile(path.join(extension, 'manifest.json'), JSON.stringify(manifest));
  for (const name of ['worker.js', 'control.html', 'control.js'])
    await cp(path.join(here, name), path.join(extension, name));
  // These remain library capabilities, not approved production features.
  const audit = {
    bundleBytes: Buffer.byteLength(bundle),
    remoteImports: /(?:from|import\s*\()\s*['"]https?:/.test(bundle),
    containsNetworkAPI: /\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(bundle),
    containsRecorder: bundle.includes('recorder'),
    containsTracing: bundle.includes('tracing'),
  };
  assert.equal(audit.remoteImports, false);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launchPersistentContext(path.join(temporary, 'profile'), {
    channel: 'chromium',
    headless: true,
    ...(process.env.BG_CHROMIUM_PATH ? { executablePath: process.env.BG_CHROMIUM_PATH } : {}),
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  browser.on('console', (message) => {
    if (message.text().includes('RD-SYNTHETIC-CONTEXT-')) contextLogs++;
  });
  browser.on('request', (request) => {
    if ((request.url() + (request.postData() ?? '')).includes('RD-SYNTHETIC-CONTEXT-'))
      contextRequests++;
    if (
      /^https?:/.test(request.url()) &&
      !request.url().startsWith(origin + '/') &&
      !request.url().startsWith(`http://localhost:${server.address().port}/`)
    )
      externalRequests++;
  });
  const worker = browser.serviceWorkers()[0] ?? (await browser.waitForEvent('serviceworker'));
  const id = new URL(worker.url()).host;
  const control = await browser.newPage();
  control.on('pageerror', () => controlErrors++);
  await control.goto(`chrome-extension://${id}/control.html`);
  await control.evaluate((fixtureOrigin) => {
    location.hash = new URLSearchParams({ origin: fixtureOrigin }).toString();
  }, origin);
  await control.getByRole('button', { name: 'Run synthetic checks' }).click();
  try {
    await control.locator('#report').filter({ hasText: 'checks' }).waitFor({ timeout: 30_000 });
  } catch (error) {
    const status = await worker.evaluate(() => ({ stage: globalThis.spikeStage ?? 'module-load' }));
    console.log(
      JSON.stringify(
        {
          candidate: 'playwright-crx@0.15.0',
          status,
          failure: error.name,
          contextRequests,
          contextLogs,
          externalRequests,
        },
        null,
        2,
      ),
    );
    throw new Error('Spike did not complete; subsequent capabilities remain unverified');
  }
  const report = JSON.parse(await control.locator('#report').textContent());
  const storage = await worker.evaluate(async () => {
    const areas = await Promise.all([
      chrome.storage.local.get(null),
      chrome.storage.sync.get(null),
      chrome.storage.session.get(null),
    ]);
    return areas.every((values) => Object.keys(values).length === 0);
  });
  const extensionHeap = await worker.evaluate(() => {
    const memory = performance.memory;
    return memory ? { usedBytes: memory.usedJSHeapSize, totalBytes: memory.totalJSHeapSize } : null;
  });
  const evidence = {
    candidate: 'playwright-crx@0.15.0',
    browser: browser.browser().version(),
    audit,
    ...report,
    contextRequests,
    contextLogs,
    externalRequests,
    emptyExtensionStorage: storage,
    extensionHeap,
    fixtureResponses,
    controlErrors,
  };
  console.log(JSON.stringify(evidence, null, 2));
  assert.equal(contextRequests, 0, 'Synthetic context reached a request');
  assert.equal(contextLogs, 0, 'Synthetic context reached browser logs');
  assert.equal(controlErrors, 0, 'The laboratory control page failed');
  assert.equal(externalRequests, 0, 'Unexpected external request');
  assert.equal(storage, true, 'Extension storage is not empty');
  assert.ok(fixtureResponses.crossSiteFrame > 0, 'Cross-origin fixture was not served');
  assert.ok(
    Object.values(report.checks).every(Boolean),
    'A spike check failed; see sanitized report',
  );
} finally {
  await browser?.close();
  server.close();
  await rm(temporary, { recursive: true, force: true });
}
