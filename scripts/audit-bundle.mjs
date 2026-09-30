import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readSites } from './sites.mjs';

const manifest = JSON.parse(await readFile('dist/manifest.json', 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage']);
assert.equal(manifest.background, undefined);
assert.equal(manifest.externally_connectable, undefined);
assert.equal(manifest.web_accessible_resources, undefined);
assert.equal(manifest.host_permissions, undefined);

const intakeOrigin = (process.env.BG_INTAKE_ORIGIN ?? '').replace(/\/$/, '');
if (intakeOrigin) {
  assert.deepEqual(manifest.optional_host_permissions, [`${intakeOrigin}/*`]);
  assert.match(
    manifest.content_security_policy.extension_pages,
    new RegExp(`connect-src 'self' ${intakeOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
  );
} else {
  assert.deepEqual(manifest.optional_host_permissions ?? [], []);
  assert.match(manifest.content_security_policy.extension_pages, /connect-src 'self'/);
  assert.doesNotMatch(manifest.content_security_policy.extension_pages, /connect-src[^;]*https?:/);
}

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
  /\bXMLHttpRequest\b/,
  /\bWebSocket\b/,
  /\bsendBeacon\s*\(/,
  /\bdocument\.cookie\b/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
];

function isReportBundle(file) {
  return (
    file === 'report.html' || file.startsWith('assets/report') || /(^|\/)report[-.]/.test(file)
  );
}

for (const file of await readdir('dist', { recursive: true })) {
  if (!/\.(js|html|css)$/.test(file)) continue;
  const code = await readFile(path.join('dist', file), 'utf8');
  for (const pattern of forbidden)
    assert.ok(!pattern.test(code), `${file}: forbidden runtime capability ${pattern}`);
  assert.ok(!/<script[^>]+src=["']https?:/i.test(code));

  // fetch is only allowed in the report page bundle, and only targeting the intake origin.
  if (/\bfetch\s*\(/.test(code)) {
    assert.ok(isReportBundle(file), `${file}: fetch is only allowed in report/*`);
    if (intakeOrigin) {
      assert.ok(
        code.includes(intakeOrigin),
        `${file}: report fetch must reference the configured intake origin`,
      );
    }
  }
}

// Content scripts and popup must remain offline.
for (const file of await readdir('dist', { recursive: true })) {
  if (!/\.js$/.test(file)) continue;
  if (isReportBundle(file)) continue;
  const code = await readFile(path.join('dist', file), 'utf8');
  assert.ok(!/\bfetch\s*\(/.test(code), `${file}: content/popup must not call fetch`);
}

assert.ok(
  await readFile('dist/report.html', 'utf8').then(
    () => true,
    () => false,
  ),
  'report.html must be packaged',
);

console.log(
  'Bundle audit passed: packaged scripts, exact site matches, report-only networking, no page storage APIs. This static check is not a security audit.',
);
