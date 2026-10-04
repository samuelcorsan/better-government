import { webcrypto } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { acquireBoe, acquireCatalan, compareLegalSnapshots } from './legal-versions';

beforeAll(() => vi.stubGlobal('crypto', webcrypto));
afterAll(() => vi.unstubAllGlobals());

const metadata = (status = 'N', revision = '20261004T000000Z') => ({
  status: { code: '200' },
  data: [
    {
      identificador: 'BOE-A-2020-123',
      fecha_publicacion: '20200101',
      fecha_actualizacion: revision,
      ambito: { codigo: '1', texto: 'Estatal' },
      estatus_derogacion: status,
      estatus_anulacion: 'N',
      vigencia_agotada: 'N',
      url_eli: 'https://www.boe.es/eli/es/l/2020/01/01/1',
      url_html_consolidada: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-123',
    },
  ],
});

const boeXml = (word: string, effective = '20210101') => `<?xml version="1.0"?>
<response><status><code>200</code></status><data><texto>
<bloque id="a1" tipo="precepto"><version id_norma="BOE-A-2020-123" fecha_publicacion="20200101" fecha_vigencia="20200102"><p>Texto anterior</p></version>
<version id_norma="BOE-A-2020-124" fecha_publicacion="20210101" fecha_vigencia="${effective}"><p>${word}</p></version></bloque>
</texto></data></response>`;

function boeFetch(record: unknown, xml: string) {
  return vi.fn(
    async (url: string | URL | Request, _init?: RequestInit) =>
      new Response(String(url).endsWith('/metadatos') ? JSON.stringify(record) : xml, {
        status: 200,
      }),
  );
}

const catalanRow = {
  n_mero_de_control: '12345',
  data_de_publicaci_del_diari: '2026-07-09T00:00:00.000',
  vig_ncia_de_la_norma: 'Vigent',
  format_html: { url: 'https://portaljuridic.gencat.cat/eli/es-ct/d/2026/07/07/103/dof/cat/html' },
  url_es_formato_html: {
    url: 'https://portaljuridic.gencat.cat/eli/es-ct/d/2026/07/07/103/dof/spa/html',
  },
};

describe('public legal versions', () => {
  it('keeps the BOE original distinct from its informative consolidation and picks the effective version', async () => {
    const fetcher = boeFetch(metadata(), boeXml('Texto modificado', '20270101'));
    const result = await acquireBoe('BOE-A-2020-123', fetcher, '2026-10-04');
    expect(result).toMatchObject({
      ok: true,
      snapshot: {
        source: 'boe',
        version: '2020-01-02',
        originalUrl: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2020-123',
        informativeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-123',
        observation: 'consolidated',
        reportedStatus: 'in_force',
      },
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[0]?.[0]).toMatch(/\/metadatos$/);
    expect(fetcher.mock.calls[1]?.[0]).toMatch(/\/texto$/);
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ credentials: 'omit', redirect: 'error' });
  });

  it('distinguishes metadata, text, repeal and older observations', async () => {
    const first = await acquireBoe(
      'BOE-A-2020-123',
      boeFetch(metadata(), boeXml('Primera versión')),
      '2026-10-04',
    );
    const changedMetadata = await acquireBoe(
      'BOE-A-2020-123',
      boeFetch(metadata('S', '20261005T000000Z'), boeXml('Primera versión')),
      '2026-10-04',
    );
    const changedText = await acquireBoe(
      'BOE-A-2020-123',
      boeFetch(metadata('S', '20261006T000000Z'), boeXml('Segunda versión')),
      '2026-10-04',
    );
    expect(first.ok && changedMetadata.ok && changedText.ok).toBe(true);
    if (!first.ok || !changedMetadata.ok || !changedText.ok) return;
    expect(changedMetadata.snapshot.reportedStatus).toBe('repealed');
    expect(compareLegalSnapshots(first.snapshot, changedMetadata.snapshot)).toBe('metadata');
    expect(compareLegalSnapshots(changedMetadata.snapshot, changedText.snapshot)).toBe('material');
    expect(compareLegalSnapshots(changedText.snapshot, first.snapshot)).toBe('stale');
  });

  it('acquires only a public Catalan original and never labels it a current consolidation', async () => {
    const fetcher = vi.fn(
      async (_url: string | URL | Request, _init?: RequestInit) =>
        new Response(JSON.stringify([catalanRow]), { status: 200 }),
    );
    const result = await acquireCatalan('12345', 'ca', fetcher);
    expect(result).toMatchObject({
      ok: true,
      snapshot: {
        source: 'portal-juridic',
        language: 'ca',
        version: 'dof',
        originalUrl: catalanRow.format_html.url,
        informativeUrl: null,
        observation: 'original_only',
        metadataRevision: null,
        materialDigest: null,
      },
    });
    if (result.ok)
      expect(compareLegalSnapshots(result.snapshot, result.snapshot)).toBe('unverifiable');
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toContain('/resource/n6hn-rmy7.json?');
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ credentials: 'omit', redirect: 'error' });
    const repealed = await acquireCatalan(
      '12345',
      'es',
      vi.fn(
        async () =>
          new Response(JSON.stringify([{ ...catalanRow, vig_ncia_de_la_norma: 'Derogada' }])),
      ),
    );
    expect(repealed).toMatchObject({
      ok: true,
      snapshot: {
        language: 'es',
        originalUrl: catalanRow.url_es_formato_html.url,
        reportedStatus: 'repealed',
        observation: 'original_only',
      },
    });
  });

  it('refuses hostile identifiers, wrong jurisdictions, malformed versions and HTML pretending to be XML', async () => {
    const fetcher = vi.fn(async () => new Response('[]'));
    expect(await acquireCatalan("123' OR 1=1", 'ca', fetcher)).toMatchObject({
      ok: false,
      reason: 'input',
    });
    expect(fetcher).not.toHaveBeenCalled();
    expect(
      await acquireCatalan(
        '12345',
        'ca',
        vi.fn(
          async () =>
            new Response(
              JSON.stringify([
                {
                  ...catalanRow,
                  format_html: {
                    url: 'https://portaljuridic.gencat.cat/eli/es/l/2026/07/07/103/dof/cat/html',
                  },
                },
              ]),
            ),
        ),
      ),
    ).toMatchObject({ ok: false, reason: 'parser' });
    expect(
      await acquireBoe(
        'BOE-A-2020-123',
        boeFetch(
          {
            ...metadata(),
            data: [
              {
                ...metadata().data[0],
                url_html_consolidada: 'https://www.boe.es/buscar/act.php?id=BOE-A-2020-999',
              },
            ],
          },
          boeXml('Texto'),
        ),
      ),
    ).toMatchObject({ ok: false, reason: 'parser' });
    expect(
      await acquireBoe('BOE-A-2020-123', boeFetch(metadata(), '<html>access denied</html>')),
    ).toMatchObject({ ok: false, reason: 'parser' });
    expect(
      await acquireBoe(
        'BOE-A-2020-123',
        boeFetch(
          { ...metadata(), data: [{ ...metadata().data[0], ambito: { codigo: '2' } }] },
          boeXml('Texto'),
        ),
      ),
    ).toMatchObject({ ok: false, reason: 'parser' });
    expect(
      await acquireBoe('BOE-A-2020-123', boeFetch(metadata(), boeXml('Texto', 'bad-date'))),
    ).toMatchObject({ ok: false, reason: 'version' });
  });

  it('reports a timeout without manufacturing a newer snapshot', async () => {
    const fetcher = vi.fn(async () => {
      throw new DOMException('deadline', 'TimeoutError');
    });
    expect(await acquireBoe('BOE-A-2020-123', fetcher)).toEqual({
      ok: false,
      source: 'boe',
      id: 'BOE-A-2020-123',
      reason: 'timeout',
    });
  });
});
