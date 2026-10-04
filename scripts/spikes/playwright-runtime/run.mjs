import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, writeFile, cp, rm } from 'node:fs/promises';
import { once } from 'node:events';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { build } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
assert.ok(process.argv.slice(2).every((argument) => argument === '--before-navigation'));
const mode = process.argv.includes('--before-navigation') ? 'before-navigation' : 'existing-loaded';
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
<form><label>Original synthetic value<input id="original" type="text"></label>
<label>Connected synthetic value<input id="connected" type="text"></label>
<button type="submit">Apply locally</button></form>
<a href="/next">Continue locally</a>
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
  // Copy published ESM assets and apply the explicit laboratory adaptation below.
  const candidate = path.join(here, '../playwright-crx/node_modules/playwright-crx/lib');
  const metadata = JSON.parse(await readFile(path.join(candidate, '../package.json'), 'utf8'));
  assert.equal(metadata.version, '0.15.0', 'Install the locked candidate from the #50 laboratory');
  const entry = await readFile(path.join(candidate, 'index.mjs'), 'utf8');
  const modules = [
    'index.mjs',
    ...new Set([...entry.matchAll(/from "\.\/(index-[\w-]+\.mjs)"/g)].map((match) => match[1])),
  ];
  await mkdir(path.join(extension, 'candidate'), { recursive: true });
  let bundle = '';
  for (const name of modules) {
    let code = await readFile(path.join(candidate, name), 'utf8');
    if (code.includes('class FrameSession')) {
      const start = code.indexOf('class FrameSession');
      const end = code.indexOf('class CRBrowser', start);
      let frame = code.slice(start, end);
      const replacements = [
        ['let lifecycleEventsEnabled;', 'let lifecycleEventsEnabled; let frameTreeReady;'],
        [
          'this._client.send("Page.getFrameTree").then(({ frameTree }) => {',
          'frameTreeReady = this._client.send("Page.getFrameTree").then(({ frameTree }) => {',
        ],
        [
          'this._client.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true })',
          'frameTreeReady.then(() => this._client.send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: true, flatten: true }))',
        ],
        ['this._client.send("Log.enable", {}),', ''],
        ['this._crPage._networkManager.addSession(this._client, void 0, this._isMainFrame()),', ''],
        ['grantUniveralAccess: true,', 'grantUniveralAccess: false,'],
      ];
      for (const [before, after] of replacements) {
        assert.equal(frame.split(before).length, 2, 'Candidate shape changed');
        frame = frame.replace(before, after);
      }
      code = code.slice(0, start) + frame + code.slice(end);
    }
    await writeFile(path.join(extension, 'candidate', name), code);
    bundle += code;
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
  for (const name of ['worker.js', 'control.js'])
    await cp(path.join(here, name), path.join(extension, name));
  await cp(path.join(here, '../playwright-crx/control.html'), path.join(extension, 'control.html'));
  await build({
    root: here,
    configFile: false,
    publicDir: false,
    logLevel: 'silent',
    build: {
      outDir: extension,
      emptyOutDir: false,
      target: 'chrome126',
      minify: false,
      lib: { entry: path.join(here, 'worker.js'), formats: ['es'], fileName: () => 'worker.js' },
      rolldownOptions: { external: ['./candidate/index.mjs'] },
    },
  });
  await cp(path.join(candidate, '../LICENSE'), path.join(extension, 'LICENSE-playwright-crx'));
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
  await control.evaluate(
    (parameters) => {
      location.hash = new URLSearchParams(parameters).toString();
    },
    { origin, mode },
  );
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
    candidate: 'playwright-crx@0.15.0 (experimental adaptation)',
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
  for (const name of [
    'inputAndOfficialAction',
    'same-origin',
    'cross-origin',
    'nativeNavigation',
    'twoTabs',
    'error',
    'cancellationByDetach',
    'reattachAfterCancellation',
    'tabClosedDuringAction',
    'heapMeasurement',
    'closeAndDisconnect',
    'noNetworkEvents',
    'privacy',
  ])
    assert.equal(typeof report.checks[name], 'boolean', `Unverified phase: ${name}`);
  assert.ok(
    Object.values(report.checks).every(Boolean),
    'A spike check failed; see sanitized report',
  );
} finally {
  try {
    await browser?.close();
  } finally {
    server.close();
    await rm(temporary, { recursive: true, force: true });
  }
}
