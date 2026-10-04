import { webcrypto } from 'node:crypto';
import { guideSchema } from '@reforma-digital/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  parsePublicRelease,
  readPublicRelease,
  refreshPublicRelease,
  type PublicRelease,
} from './public-release';

beforeEach(() => vi.stubGlobal('crypto', webcrypto));
afterEach(() => vi.unstubAllGlobals());

const guide = guideSchema.parse({
  id: 'synthetic-start',
  revision: 1,
  title: { ca: 'Guia fictícia', es: 'Guía ficticia' },
  domain: 'D-01',
  subtopic: 'synthetic',
  profiles: ['general'],
  jurisdiction: 'ES-CT',
  consultedAt: '2026-10-02',
  period: { from: '2026-10-01', evidenceIds: ['rule'] },
  validation: { status: 'verified', checkedAt: '2026-10-03', method: 'automatic' },
  evidence: [
    {
      id: 'rule',
      sourceId: 'synthetic-office',
      url: 'https://example.test/rule',
      originalUrl: 'https://example.test/rule',
      version: 'v1',
      language: 'es',
      attribution: 'Oficina ficticia',
      sourceUpdatedAt: '2026-10-01',
      applicableFrom: '2026-10-01',
      applicableUntil: null,
      informative: false,
      jurisdiction: 'ES-CT',
      quote: 'Regla ficticia desde 2026-10-01.',
    },
  ],
  conditions: [],
  exclusions: [],
  claims: [
    {
      id: 'fact',
      text: { ca: 'Regla fictícia.', es: 'Regla ficticia.' },
      evidenceIds: ['rule'],
      translation: 'ca',
      kind: 'fact',
      conditionIds: [],
    },
  ],
  steps: [],
});

const first: PublicRelease = {
  schemaVersion: 1,
  revision: 1,
  publishedAt: '2026-10-04',
  validUntil: '2026-10-31',
  guides: [guide],
  retiredGuides: [],
  flows: [{ id: 'synthetic-flow', version: '1.0.0', status: 'available' }],
};

async function digest(body: string): Promise<string> {
  const bytes = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
  return Buffer.from(bytes).toString('hex');
}

async function publish(release: PublicRelease, wrongDigest = false) {
  const body = JSON.stringify(release);
  const sha256 = wrongDigest ? '0'.repeat(64) : await digest(body);
  const pointer = JSON.stringify({ schemaVersion: 1, revision: release.revision, sha256 });
  const requests: { url: string; options: RequestInit }[] = [];
  vi.stubGlobal('fetch', async (url: string, options: RequestInit) => {
    requests.push({ url, options });
    const value = url.endsWith('latest.json') ? pointer : body;
    return { ok: true, arrayBuffer: async () => new TextEncoder().encode(value).buffer };
  });
  return requests;
}

describe('catálogo público versionado', () => {
  it('descarga solo rutas fijas, comprueba la huella y ofrece guías y estados vigentes', async () => {
    const requests = await publish(first);
    const result = await refreshPublicRelease(null, '2026-10-04', [
      { id: 'synthetic-flow', version: '1.0.0' },
    ]);
    expect(result.catalogue).toMatchObject({
      revision: 1,
      publishedAt: '2026-10-04',
      fresh: true,
      guides: [{ current: true }],
      flows: [{ status: 'available' }],
    });
    expect(
      await readPublicRelease(result.stored, '2026-10-04', [
        { id: 'synthetic-flow', version: '1.0.0' },
      ]),
    ).toEqual(result.catalogue);
    expect(requests.map((item) => item.url)).toEqual([
      'https://raw.githubusercontent.com/samuelcorsan/reforma-digital/main/catalogue/latest.json',
      'https://raw.githubusercontent.com/samuelcorsan/reforma-digital/main/catalogue/releases/1.json',
    ]);
    expect(
      requests.every(
        ({ options }) =>
          options.method === 'GET' &&
          options.credentials === 'omit' &&
          options.referrerPolicy === 'no-referrer' &&
          !options.headers &&
          !options.body,
      ),
    ).toBe(true);
    expect((await refreshPublicRelease(null, '2026-10-04')).catalogue.flows[0]?.status).toBe(
      'unknown',
    );
  });

  it('conserva la última versión íntegra y fecha de las guías si la descarga falla o se corrompe', async () => {
    await publish(first);
    const valid = await refreshPublicRelease(null, '2026-10-04');
    expect(valid.stored).not.toBeNull();
    await publish({ ...first, revision: 2 }, true);
    const failed = await refreshPublicRelease(valid.stored, '2026-10-05');
    expect(failed.stored).toEqual({ ...valid.stored, checkedAt: null });
    expect(failed.catalogue).toMatchObject({
      revision: 1,
      publishedAt: '2026-10-04',
      fresh: false,
      guides: [{ current: false }],
      flows: [{ status: 'unknown' }],
    });
    vi.stubGlobal('fetch', async () => {
      throw new Error('offline');
    });
    expect((await refreshPublicRelease(valid.stored, '2026-10-05')).catalogue).toEqual(
      failed.catalogue,
    );
    expect(
      await readPublicRelease(failed.stored, '2026-10-05', [
        { id: 'synthetic-flow', version: '1.0.0' },
      ]),
    ).toEqual(failed.catalogue);
    expect(
      await readPublicRelease({ body: valid.stored!.body, sha256: '0'.repeat(64) }, '2026-10-05'),
    ).toMatchObject({ revision: null, guides: [], flows: [] });
  });

  it('exige bajas explícitas, conserva las retiradas y rechaza un rollback', async () => {
    await publish(first);
    const valid = await refreshPublicRelease(null, '2026-10-04');
    const next: PublicRelease = {
      ...first,
      revision: 2,
      publishedAt: '2026-10-05',
      guides: [],
      flows: [{ id: 'synthetic-flow', version: '1.0.0', status: 'retired' }],
    };
    await publish(next);
    const incomplete = await refreshPublicRelease(valid.stored, '2026-10-05');
    expect(incomplete.catalogue.revision).toBe(1);
    await publish({ ...next, retiredGuides: ['synthetic-start'] });
    const retired = await refreshPublicRelease(valid.stored, '2026-10-05');
    expect(retired.catalogue).toMatchObject({
      revision: 2,
      guides: [],
      flows: [{ status: 'retired' }],
    });
    await publish(first);
    const rollback = await refreshPublicRelease(retired.stored, '2026-10-06');
    expect(rollback.catalogue).toMatchObject({
      revision: 2,
      fresh: false,
      flows: [{ status: 'retired' }],
    });
  });

  it('rechaza cambios silenciosos del contenido de una guía sin subir su revisión', async () => {
    await publish(first);
    const valid = await refreshPublicRelease(null, '2026-10-04');
    await publish({
      ...first,
      revision: 2,
      publishedAt: '2026-10-05',
      guides: [{ ...guide, title: { ca: 'Un altre títol', es: 'Otro título' } }],
    });
    expect((await refreshPublicRelease(valid.stored, '2026-10-05')).catalogue.revision).toBe(1);
  });

  it('archiva al caducar y rechaza cargas con campos ejecutables o guías pendientes', async () => {
    await publish(first);
    expect((await refreshPublicRelease(null, '2026-11-01')).catalogue).toMatchObject({
      fresh: false,
      guides: [{ current: false }],
      flows: [{ status: 'unknown' }],
    });
    expect(() => parsePublicRelease({ ...first, script: 'alert(1)' })).toThrow();
    expect(() =>
      parsePublicRelease({ ...first, guides: [{ ...guide, validation: { status: 'pending' } }] }),
    ).toThrow();
    expect(() =>
      parsePublicRelease({ ...first, flows: [{ ...first.flows[0], map: { screens: [] } }] }),
    ).toThrow();
  });

  it('no anticipa una publicación ni la vigencia futura de una guía', async () => {
    const future = guideSchema.parse({
      ...guide,
      period: { from: '2026-10-10', evidenceIds: ['rule'] },
      evidence: [
        {
          ...guide.evidence[0],
          applicableFrom: '2026-10-10',
          quote: 'Regla ficticia desde 2026-10-10.',
        },
      ],
    });
    const release = { ...first, guides: [future] };
    await publish(release);
    const early = await refreshPublicRelease(null, '2026-10-04');
    expect(early.catalogue.guides[0]?.current).toBe(false);
    expect((await readPublicRelease(early.stored, '2026-10-04')).guides[0]?.current).toBe(false);
    expect((await refreshPublicRelease(null, '2026-10-10')).catalogue.guides[0]?.current).toBe(
      true,
    );

    const body = JSON.stringify({ ...first, publishedAt: '2026-10-10' });
    const stored = { body, sha256: await digest(body), checkedAt: '2026-10-04' };
    expect((await readPublicRelease(stored, '2026-10-04')).fresh).toBe(false);
  });
});
