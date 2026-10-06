import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(readFileSync(new URL('../og/template.html', import.meta.url), 'utf8'));
  const png = await page.screenshot({ type: 'png' });
  const out = fileURLToPath(new URL('../public/og.png', import.meta.url));
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
} finally {
  await browser.close();
}
