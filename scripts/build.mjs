import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { designPostcss } from '@reforma-digital/design/postcss';
import { readSites, adapterPlugin, testMatches } from './sites.mjs';
import { ensureInboxPlaceholders, readPendingInbox } from './pending.mjs';

const test = process.argv.includes('--test');
const outDir = path.resolve(test ? 'dist-test' : 'dist');
const sites = await readSites();
const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const pending = await readPendingInbox();
await ensureInboxPlaceholders();

/** Intake origin for private report submissions. Empty disables submit in the UI. */
const intakeOrigin = (process.env.BG_INTAKE_ORIGIN ?? '').replace(/\/$/, '');
if (intakeOrigin) {
  try {
    const u = new URL(intakeOrigin);
    if (u.protocol !== 'https:' || u.origin !== intakeOrigin)
      throw new Error('BG_INTAKE_ORIGIN must be an https origin with no path');
  } catch (error) {
    throw new Error(`Invalid BG_INTAKE_ORIGIN: ${error.message ?? error}`);
  }
}

const shared = [
  'packages/design/src',
  'packages/react/src',
  'packages/runtime/src',
  'packages/capture/src',
].map((dir) => `${path.resolve(dir)}/**/*.{ts,tsx}`);

const extensionDefines = {
  __BG_SITES__: JSON.stringify(
    sites.map(({ id, name, homepage, status }) => ({ id, name, homepage, status })),
  ),
  __BG_PENDING__: JSON.stringify(pending),
  __BG_VERSION__: JSON.stringify(pkg.version),
  __BG_INTAKE_ORIGIN__: JSON.stringify(intakeOrigin),
};

// Popup + report page (React + design system). Separate entries so the popup
// does not pull Rampart / report code into the action popup bundle.
await build({
  configFile: false,
  logLevel: 'warn',
  root: path.resolve('apps/extension'),
  plugins: [react()],
  css: {
    postcss: {
      plugins: designPostcss({
        content: [...shared, `${path.resolve('apps/extension')}/**/*.{ts,tsx,html}`],
      }),
    },
  },
  define: extensionDefines,
  build: {
    outDir,
    emptyOutDir: true,
    sourcemap: false,
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: path.resolve('apps/extension/popup.html'),
        report: path.resolve('apps/extension/report.html'),
      },
    },
  },
});

// One content script per site: each official page loads only its own adapter.
for (const site of sites) {
  await build({
    configFile: false,
    logLevel: 'warn',
    plugins: [react(), adapterPlugin(site)],
    css: {
      postcss: {
        plugins: designPostcss({
          content: [...shared, `${path.resolve('sites', site.id, 'src')}/**/*.{ts,tsx}`],
        }),
      },
    },
    define: {
      __BG_TEST__: JSON.stringify(test),
      __BG_PENDING__: JSON.stringify(pending),
      __BG_VERSION__: JSON.stringify(pkg.version),
      'process.env.NODE_ENV': '"production"',
    },
    build: {
      outDir,
      emptyOutDir: false,
      sourcemap: false,
      lib: {
        entry: path.resolve('apps/extension/src/content.ts'),
        name: 'ReformaDigital',
        formats: ['iife'],
        fileName: () => `content/${site.id}.js`,
      },
    },
  });
}

const connectSrc = intakeOrigin ? `'self' ${intakeOrigin}` : "'self'";
const manifest = {
  manifest_version: 3,
  name: test ? 'Reforma Digital · Test' : 'Reforma Digital',
  version: pkg.version,
  description:
    'Interfaces comunitarias para trámites públicos. Procesamiento local, sin telemetría.',
  minimum_chrome_version: '120',
  permissions: ['storage'],
  optional_host_permissions: intakeOrigin ? [`${intakeOrigin}/*`] : [],
  action: { default_popup: 'popup.html', default_title: 'Reforma Digital' },
  content_scripts: sites.map((site) => ({
    matches: test ? [...site.matches, ...testMatches(site)] : site.matches,
    js: [`content/${site.id}.js`],
    run_at: 'document_idle',
    all_frames: false,
    world: 'ISOLATED',
  })),
  content_security_policy: {
    extension_pages: `script-src 'self'; object-src 'none'; connect-src ${connectSrc}; base-uri 'none'`,
  },
};

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(outDir, 'pending.json'), JSON.stringify(pending, null, 2) + '\n');

console.log(
  `Extension built in ${outDir}. ${sites.length} site adapter(s): ${sites.map((s) => s.id).join(', ')}. Intake: ${intakeOrigin || '(disabled)'}.`,
);
