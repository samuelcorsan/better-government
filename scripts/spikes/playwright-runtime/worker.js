import { crx } from './candidate/index.mjs';

globalThis.spikeStage = 'installing-guards';
// Synthetic laboratory only. Values stay in the browser and its extension.
const privacy = { network: 0, storage: 0, files: 0, contextLogs: 0, blockedProtocolCommands: 0 };
const commands = {};
const events = {};
const childEvents = {};
chrome.debugger.onEvent.addListener((source, method) => {
  events[method] = (events[method] ?? 0) + 1;
  if (source.sessionId) childEvents[method] = (childEvents[method] ?? 0) + 1;
});
const containsContext = (value) => JSON.stringify(value)?.includes('RD-SYNTHETIC-CONTEXT-');
globalThis.fetch = async () => {
  privacy.network++;
  throw new Error('Network disabled in the spike worker');
};
for (const area of [chrome.storage.local, chrome.storage.sync, chrome.storage.session]) {
  area.set = async () => {
    privacy.storage++;
    throw new Error('Storage disabled in the spike worker');
  };
}
for (const method of ['writeFile', 'writeFileSync', 'createWriteStream']) {
  crx.fs[method] = () => {
    privacy.files++;
    throw new Error('Files disabled in the spike worker');
  };
}
for (const method of ['log', 'info', 'warn', 'error', 'debug', 'trace']) {
  const original = console[method].bind(console);
  console[method] = (...values) => {
    if (containsContext(values)) privacy.contextLogs++;
    else original(...values);
  };
}
const sendCommand = chrome.debugger.sendCommand.bind(chrome.debugger);
chrome.debugger.sendCommand = (target, method, parameters, ...rest) => {
  commands[method] = (commands[method] ?? 0) + 1;
  if (/^(Network|Fetch|Storage|Log)\./.test(method) || /Cookies/.test(method)) {
    privacy.blockedProtocolCommands++;
    return Promise.reject(new Error('Network/session inspection disabled'));
  }
  return sendCommand(target, method, parameters, ...rest);
};

async function run(origin, mode) {
  globalThis.spikeStage = 'starting-candidate';
  const checks = {};
  const failures = {};
  const attached = new Set();
  const tabIds = new Map();
  let app;
  let target;
  let heap = null;
  async function check(name, operation) {
    globalThis.spikeStage = name;
    try {
      checks[name] = Boolean(await operation());
    } catch (error) {
      checks[name] = false;
      // Return error class only: messages/stacks can contain field values.
      failures[name] = error instanceof Error ? error.name : 'UnknownError';
    }
  }
  try {
    let existing;
    if (mode === 'existing-loaded') {
      globalThis.spikeStage = 'loading-existing-fixture';
      existing = await chrome.tabs.create({ url: origin + '/main', active: false });
      let loaded = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        if ((await chrome.tabs.get(existing.id)).status === 'complete') {
          loaded = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      if (!loaded) throw new Error('Synthetic fixture did not finish loading');
    }
    app = await crx.start();
    app.context().setDefaultTimeout(2_000);
    globalThis.spikeStage = 'opening-fixture';
    app.on('attached', ({ page, tabId }) => {
      attached.add(tabId);
      tabIds.set(page, tabId);
    });
    app.on('detached', (tabId) => attached.delete(tabId));
    const page = existing ? await app.attach(existing.id) : await app.newPage();
    if (!existing) await page.goto(origin + '/main');
    await check('inputAndOfficialAction', async () => {
      const value = await page.getByLabel('Original synthetic value').inputValue();
      await page.getByLabel('Connected synthetic value').fill(value);
      await page.getByRole('button', { name: 'Apply locally' }).click();
      return page.evaluate(() => document.documentElement.dataset.applied === 'true');
    });
    for (const frameId of ['same-origin', 'cross-origin']) {
      await check(frameId, async () => {
        const frame = page.frameLocator('#' + frameId);
        const value = await frame.getByLabel('Original synthetic value').inputValue();
        await frame.getByLabel('Connected synthetic value').fill(value);
        await frame.getByRole('button', { name: 'Apply locally' }).click();
        return frame
          .locator('html')
          .getAttribute('data-applied')
          .then((v) => v === 'true');
      });
    }
    await check('nativeNavigation', async () => {
      await page.getByRole('link', { name: 'Continue locally' }).click();
      await page.getByLabel('Original synthetic value').waitFor();
      return new URL(page.url()).pathname === '/next';
    });
    const another = await app.newPage({ url: origin + '/frame' });
    target = tabIds.get(another);
    await check('twoTabs', async () => app.pages().length === 2);
    await check('error', async () => {
      try {
        await another.getByRole('button', { name: 'Does not exist' }).click({ timeout: 100 });
        return false;
      } catch (error) {
        return error instanceof Error && error.name === 'TimeoutError';
      }
    });
    await check('cancellationByDetach', async () => {
      const pending = another
        .getByRole('button', { name: 'Cancelled action' })
        .click({ timeout: 5_000 })
        .then(
          () => false,
          () => true,
        );
      // Wait until the pending operation has entered the extension's command loop.
      await new Promise((resolve) => setTimeout(resolve, 50));
      const before = performance.now();
      await app.detach(another);
      return (await pending) && performance.now() - before < 2_000;
    });
    await check('reattachAfterCancellation', async () => {
      const resumed = await app.attach(tabIds.get(another));
      await resumed.getByRole('button', { name: 'Apply locally' }).click();
      return resumed.evaluate(() => document.documentElement.dataset.clicks === '1');
    });
    await check('tabClosedDuringAction', async () => {
      const pending = page
        .getByRole('button', { name: 'Pending while closing' })
        .click({ timeout: 5_000 })
        .then(
          () => false,
          () => true,
        );
      await chrome.tabs.remove(tabIds.get(page));
      return pending;
    });
    await check('heapMeasurement', async () => {
      const usage = await sendCommand({ tabId: target }, 'Runtime.getHeapUsage');
      heap = { usedBytes: usage.usedSize, totalBytes: usage.totalSize };
      return heap.usedBytes > 0;
    });
  } catch (error) {
    checks.start = false;
    failures.start = error instanceof Error ? error.name : 'UnknownError';
  } finally {
    if (app) {
      await check('closeAndDisconnect', async () => {
        await app.close();
        if (!Number.isInteger(target)) return false;
        await chrome.tabs.get(target);
        try {
          // getTargets().attached also includes the laboratory's outer test driver.
          await sendCommand({ tabId: target }, 'Runtime.getHeapUsage');
          return false;
        } catch (error) {
          return (
            error instanceof Error &&
            error.message.includes('Debugger is not attached') &&
            attached.size === 0
          );
        }
      });
    }
  }
  checks.noNetworkEvents = !Object.keys(events).some((name) =>
    /^(Network|Fetch|Storage|Log)\./.test(name),
  );
  checks.privacy = Object.values(privacy).every((count) => count === 0);
  globalThis.spikeStage = 'complete';
  return {
    mode,
    checks,
    failures,
    privacy,
    commands,
    events,
    childEvents,
    productionEnabled: false,
    fixturePageHeap: heap,
  };
}

let running = false;
globalThis.spikeStage = 'ready';
chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (
    sender.id !== chrome.runtime.id ||
    sender.url?.split('#')[0] !== chrome.runtime.getURL('control.html')
  )
    return;
  if (
    message?.type !== 'run' ||
    !['existing-loaded', 'before-navigation'].includes(message.mode) ||
    running
  )
    return;
  let url;
  try {
    url = new URL(message.origin);
  } catch {
    return;
  }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.origin !== message.origin)
    return;
  running = true;
  run(url.origin, message.mode).then(reply, () => reply({ checks: { runner: false } }));
  return true;
});
