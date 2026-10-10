import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Una imagen por página compartible. El slug coincide con `og` en lib/seo.ts.
const pages = [
  {
    slug: 'portada',
    escena: 'producto',
    etiqueta: 'Iniciativa abierta',
    titular: 'Lo público, a la altura de las personas.',
    texto: 'Herramientas y propuestas para una Administración más clara, accesible y sencilla.',
  },
  {
    slug: 'buscador',
    escena: 'producto',
    etiqueta: 'Buscador de trámites',
    titular: '¿Qué necesitas hacer?',
    texto: 'Pregunta con tus palabras. Te orientamos con fuentes oficiales que puedes comprobar.',
  },
  {
    slug: 'fuentes',
    escena: 'marca',
    etiqueta: 'Información con origen',
    titular: 'Las fuentes importan.',
    texto: 'Cada respuesta se construye con documentos de organismos oficiales aprobados.',
  },
  {
    slug: 'como-funciona',
    escena: 'marca',
    etiqueta: 'Cómo funciona',
    titular: 'De la pregunta al trámite.',
    texto:
      'Un punto de partida para entender la Administración, con el documento oficial al alcance.',
  },
  {
    slug: 'equipo',
    escena: 'marca',
    etiqueta: 'Equipo',
    titular: 'Las personas detrás de la reforma.',
    texto: 'Diseño, textos y código: una iniciativa que cualquiera puede mejorar.',
  },
  {
    slug: 'privacidad',
    escena: 'marca',
    etiqueta: 'Privacidad',
    titular: 'Pregunta sin identificarte.',
    texto: 'Sin cuenta. Tu navegador intenta ocultar los datos personales antes de enviar nada.',
  },
];

// Logo principal: R blanca y doblez #A50E0E sobre cuadrado rojo. `r` es el alto de la R en px;
// en los tamaños de favicon es múltiplo de 4 para que cada módulo caiga en píxeles enteros.
const icons = [
  { file: 'public/icon-512.png', size: 512, r: 300 },
  { file: 'public/icon-192.png', size: 192, r: 112 },
  { file: 'app/apple-icon.png', size: 180, r: 108 },
];
const favicon = [
  { size: 16, r: 12, radius: 3 },
  { size: 32, r: 24, radius: 7 },
  { size: 48, r: 32, radius: 10 },
];

const icon = ({ size, r, radius = 0 }) => {
  const w = (r * 3) / 4;
  return `<!doctype html>
<body style="margin:0;background:transparent">
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${radius}" fill="#df1717" />
    <svg x="${Math.round((size - w) / 2)}" y="${(size - r) / 2}" width="${w}" height="${r}" viewBox="0 0 144 192" shape-rendering="${size <= 48 ? 'crispEdges' : 'auto'}">
      <path fill="#fff" d="M48 0H96V48H48V96H96V144H48V192H0V48H48Z" />
      <path fill="#a50e0e" d="M0 48L48 0V48Z" />
      <rect x="96" y="48" width="48" height="48" fill="#fff" />
      <rect x="96" y="144" width="48" height="48" fill="#fff" />
    </svg>
  </svg>
</body>`;
};

// ICO con entradas PNG: cabecera, un directorio de 16 bytes por imagen y los PNG seguidos.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

const out = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url));
mkdirSync(out('public/og'), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
  });
  // Geist se descarga de Google Fonts: hace falta red para generar las imágenes.
  await page.setContent(readFileSync(new URL('../og/template.html', import.meta.url), 'utf8'), {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  for (const { slug, ...copy } of pages) {
    await page.evaluate(({ escena, etiqueta, titular, texto }) => {
      document.body.dataset.escena = escena;
      document.getElementById('etiqueta').textContent = etiqueta;
      document.getElementById('titular').textContent = titular;
      document.getElementById('texto').textContent = texto;
    }, copy);
    // JPEG: con PNG cada imagen pasa de 600 KB y algunas redes no muestran la vista previa.
    const jpg = await page.screenshot({ type: 'jpeg', quality: 90 });
    writeFileSync(out(`public/og/${slug}.jpg`), jpg);
    console.log(`wrote public/og/${slug}.jpg (${jpg.length} bytes)`);
  }

  const renderIcon = async (spec) => {
    const iconPage = await browser.newPage({ viewport: { width: spec.size, height: spec.size } });
    await iconPage.setContent(icon(spec));
    const png = await iconPage.screenshot({ type: 'png', omitBackground: true });
    await iconPage.close();
    return png;
  };
  for (const spec of icons) {
    writeFileSync(out(spec.file), await renderIcon(spec));
    console.log(`wrote ${spec.file}`);
  }
  const images = [];
  for (const spec of favicon) images.push({ size: spec.size, png: await renderIcon(spec) });
  writeFileSync(out('app/favicon.ico'), ico(images));
  console.log('wrote app/favicon.ico');
} finally {
  await browser.close();
}
