import { describe, expect, it } from 'vitest';
import { approvedSource, sources } from '../packages/government/src/index';

const catalanSources = [
  'gencat-tramits',
  'canal-empresa-fue',
  'portal-juridic-catalunya',
  'dogc',
  'aoc-etram',
  'barcelona-tramits',
  'girona-tramits',
  'lleida-tramits',
  'tarragona-tramits',
  'atc-irpf',
  'soc-autonoms',
];

describe('inventario público de Catalunya', () => {
  it.each(catalanSources)('registra %s con host, idioma y rutas HTTPS verificadas', (id) => {
    const source = sources.find((item) => item.id === id);
    expect(source).toBeDefined();
    expect(source?.enabled).toBe(false);
    expect(source?.languages?.length).toBeGreaterThan(0);
    expect(source?.publicUrls?.length).toBeGreaterThan(0);
    for (const publicUrl of source?.publicUrls ?? []) {
      const url = new URL(publicUrl);
      expect(url.protocol).toBe('https:');
      expect(source?.hosts).toContain(url.hostname);
      expect(url.username).toBe('');
      expect(url.password).toBe('');
      expect(approvedSource(publicUrl, id)).toBeUndefined();
    }
  });

  it('mantiene las cuatro capitales como ámbitos distintos', () => {
    expect(
      ['barcelona', 'girona', 'lleida', 'tarragona'].map(
        (city) => sources.find((source) => source.id === `${city}-tramits`)?.jurisdictionValue,
      ),
    ).toEqual(['ES-CT-BARCELONA', 'ES-CT-GIRONA', 'ES-CT-LLEIDA', 'ES-CT-TARRAGONA']);
  });

  it.each([
    'https://tramits.gencat.cat.evil.example/ca/tramits/tramits-temes/index.html',
    'https://sesion.tramits.gencat.cat/ca/tramits/tramits-temes/index.html',
    'https://tramits.gencat.cat/ca/tramits/area-privada/',
    'https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html/sesion',
    'https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html?token=private',
    'https://seuelectronica.ajuntament.barcelona.cat/oficinavirtual/ca/tramit/privat',
    'https://portaljuridic.gencat.cat/ca/normativa/dret-estatal/',
    'https://www.aoc.cat/serveis-aoc/e-tram/',
    'https://tramits.paeria.cat/Ciutadania/Tramits/Formularis/form.aspx',
    'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=LOGIN&lang=CA',
  ])('rechaza host, sesión, parámetro o candidato no aprobado: %s', (url) => {
    expect(approvedSource(url)).toBeUndefined();
  });

  it('no incluye páginas nuevas en la búsqueda remota heredada', () => {
    expect(
      approvedSource('https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html'),
    ).toBeUndefined();
    expect(
      approvedSource('https://seuelectronica.ajuntament.barcelona.cat/es/tramites-telematicos'),
    ).toBeUndefined();
  });

  it('limita un candidato habilitado en la prueba a sus URLs públicas exactas', () => {
    const source = sources.find((item) => item.id === 'gencat-tramits');
    if (!source) throw new Error('Falta la fuente Gencat');
    source.enabled = true;
    try {
      expect(
        approvedSource('https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html')?.id,
      ).toBe('gencat-tramits');
      expect(approvedSource('https://tramits.gencat.cat/ca/tramits/area-privada/')).toBeUndefined();
      expect(
        approvedSource('https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html?token=x'),
      ).toBeUndefined();
      expect(
        approvedSource('https://sesion.tramits.gencat.cat/ca/tramits/tramits-temes/index.html'),
      ).toBeUndefined();
      expect(
        approvedSource(
          'https://tramits.gencat.cat/ca/tramits/tramits-temes/index.html',
          'barcelona-tramits',
        ),
      ).toBeUndefined();
    } finally {
      source.enabled = false;
    }
  });

  it('mantiene fuera del registro una URL publicada cuyo contenido no se pudo verificar', () => {
    const source = sources.find((item) => item.id === 'tarragona-tramits');
    if (!source) throw new Error('Falta la fuente Tarragona');
    const pending =
      'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&lang=CA';
    expect(source.publicUrls).not.toContain(pending);
    source.enabled = true;
    try {
      expect(
        approvedSource(
          'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&PAGE_CODE=CATALOGO&lang=ES',
        )?.id,
      ).toBe('tarragona-tramits');
      expect(approvedSource(pending)).toBeUndefined();
    } finally {
      source.enabled = false;
    }
  });
});
