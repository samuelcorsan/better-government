import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

/**
 * Collect pending inbox entries from sites/<id>/fixtures/inbox/<hash>/meta.json
 * for the extension build (no network).
 */
export async function readPendingInbox() {
  const pending = [];
  let sites;
  try {
    sites = await readdir('sites', { withFileTypes: true });
  } catch {
    return [];
  }
  for (const site of sites) {
    if (!site.isDirectory()) continue;
    const inbox = path.join('sites', site.name, 'fixtures', 'inbox');
    let entries;
    try {
      entries = await readdir(inbox, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      try {
        const meta = JSON.parse(await readFile(path.join(inbox, entry.name, 'meta.json'), 'utf8'));
        if (
          typeof meta.siteId === 'string' &&
          typeof meta.url === 'string' &&
          typeof meta.fingerprint === 'string' &&
          /^[a-f0-9]{64}$/.test(meta.fingerprint)
        ) {
          pending.push({
            siteId: meta.siteId,
            url: meta.url,
            fingerprint: meta.fingerprint,
          });
        }
      } catch {
        /* skip malformed */
      }
    }
  }
  return pending;
}

/** Ensure inbox README placeholders exist so the folder is tracked. */
export async function ensureInboxPlaceholders() {
  for (const site of await readdir('sites', { withFileTypes: true })) {
    if (!site.isDirectory()) continue;
    const dir = path.join('sites', site.name, 'fixtures', 'inbox');
    await mkdir(dir, { recursive: true });
    try {
      await readFile(path.join(dir, '.gitkeep'));
    } catch {
      await writeFile(
        path.join(dir, '.gitkeep'),
        '# Pending page captures land here via the report intake workflow.\n',
      );
    }
  }
}
