import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readSites } from './sites.mjs';
const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage']);
assert.deepEqual(manifest.background, { service_worker: 'background.js', type: 'module' });
assert.equal(manifest.externally_connectable, undefined);
assert.equal(manifest.web_accessible_resources, undefined);
assert.equal(manifest.host_permissions, undefined);
const sites = await readSites();
// One isolated content script per enabled site, injected only on that site's exact routes.
assert.deepEqual(
  manifest.content_scripts.map((entry) => entry.js),
  sites.map((site) => [`content/${site.id}.js`]),
);
for (const [index, site] of sites.entries()) {
  const entry = manifest.content_scripts[index];
  assert.equal(entry.world, 'ISOLATED');
  assert.equal(entry.all_frames, false);
  assert.deepEqual(entry.matches, site.matches);
}
assert.ok(!JSON.stringify(manifest).includes('127.0.0.1'));
const forbidden = [
  /\beval\s*\(/,
  /new\s+Function\s*\(/,
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bsendBeacon\s*\(/,
  /\bdocument\.cookie\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
];
for (const file of await readdir('dist', { recursive: true })) {
  if (!/\.(js|html|css)$/.test(file)) continue;
  const code = await readFile(path.join('dist', file), 'utf8');
  assert.ok(!code.includes('TRUSTED_AND_UNTRUSTED_CONTEXTS'), `${file}: session exposed`);
  for (const pattern of forbidden)
    assert.ok(!pattern.test(code), `${file}: forbidden runtime capability ${pattern}`);
  assert.ok(!/<script[^>]+src=["']https?:/i.test(code));
}
console.log(
  'Bundle audit passed: packaged scripts, exact site matches, no detected networking or page storage APIs. This static check is not a security audit.',
);
