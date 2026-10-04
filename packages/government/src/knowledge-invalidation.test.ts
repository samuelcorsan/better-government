import { guideSchema, type Guide } from '@reforma-digital/core';
import { describe, expect, it } from 'vitest';
import { reviseKnowledgeCatalog, type EvidenceCheck } from './knowledge-invalidation';
import type { LegalSnapshot } from './legal-versions';

// Entirely synthetic rules and public-document observations, not real portal captures.
function guide(city: 'BARCELONA' | 'GIRONA'): Guide {
  const base = `https://example.test/${city.toLowerCase()}`;
  const cited = (id: string, es: string, ca: string, evidenceId: string) => ({
    id,
    text: { ca, es },
    evidenceIds: [evidenceId],
    translation: 'ca' as const,
  });
  return guideSchema.parse({
    id: `synthetic-${city.toLowerCase()}`,
    revision: 1,
    title: { ca: 'Guia fictícia', es: 'Guía ficticia' },
    domain: 'D-01',
    subtopic: 'synthetic',
    profiles: ['general'],
    jurisdiction: `ES-CT-${city}`,
    consultedAt: '2026-10-01',
    period: { from: '2026-01-01', evidenceIds: ['deadline'] },
    validation: { status: 'verified', checkedAt: '2026-10-02', method: 'automatic' },
    evidence: [
      {
        id: 'deadline',
        sourceId: 'synthetic-office',
        url: `${base}/deadline`,
        originalUrl: `${base}/deadline`,
        version: 'v1',
        language: 'es',
        attribution: 'Oficina ficticia',
        sourceUpdatedAt: '2026-01-01',
        applicableFrom: '2026-01-01',
        applicableUntil: null,
        informative: false,
        jurisdiction: `ES-CT-${city}`,
        quote: 'Plazo ficticio desde 2026-01-01 hasta 2026-11-01.',
      },
      {
        id: 'independent',
        sourceId: 'synthetic-region',
        url: 'https://example.test/region/independent',
        originalUrl: 'https://example.test/region/independent',
        version: 'v1',
        language: 'es',
        attribution: 'Región ficticia',
        sourceUpdatedAt: '2026-01-01',
        applicableFrom: '2026-01-01',
        applicableUntil: null,
        informative: false,
        jurisdiction: 'ES-CT',
        quote: 'Consulta independiente ficticia.',
      },
    ],
    conditions: [cited('condition', 'Condición ficticia.', 'Condició fictícia.', 'deadline')],
    exclusions: [],
    claims: [
      {
        ...cited('claim', 'Obligación ficticia.', 'Obligació fictícia.', 'deadline'),
        kind: 'obligation',
        conditionIds: ['condition'],
      },
    ],
    steps: [
      {
        ...cited(
          'start',
          'Plazo ficticio desde 2026-01-01 hasta 2026-11-01.',
          'Termini fictici des de 2026-01-01 fins al 2026-11-01.',
          'deadline',
        ),
        dependsOn: [],
      },
      {
        ...cited(
          'follow',
          'Continúa el proceso ficticio.',
          'Continua el procés fictici.',
          'independent',
        ),
        dependsOn: ['start'],
      },
      {
        ...cited(
          'free',
          'Consulta independiente ficticia.',
          'Consulta independent fictícia.',
          'independent',
        ),
        dependsOn: [],
      },
    ],
  });
}

const barcelona = guide('BARCELONA');
const girona = guide('GIRONA');
const identity = {
  evidenceId: 'deadline',
  version: 'v1',
  originalUrl: 'https://example.test/barcelona/deadline',
  checkedAt: '2026-10-04',
};
const material: EvidenceCheck = {
  ...identity,
  kind: 'content',
  previousDigest: 'a'.repeat(64),
  currentDigest: 'b'.repeat(64),
};

describe('invalidación de conocimiento público sintético', () => {
  it('retira el plazo y la cadena dependiente en ambos idiomas, conserva otra rama y es idempotente', () => {
    const first = reviseKnowledgeCatalog([barcelona, girona], [material], '2026-10-04');
    expect(first.guides).toHaveLength(2);
    expect(first.guides[0]).toMatchObject({
      revision: 2,
      validation: { status: 'pending' },
      claims: [],
      conditions: [],
      period: { evidenceIds: [] },
    });
    expect(first.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
    expect(first.guides[0]?.steps[0]?.text).toEqual(barcelona.steps[2]?.text);
    expect(first.reports[0]).toMatchObject({
      status: 'revised',
      invalidEvidenceIds: ['deadline'],
      invalidStatementIds: ['claim', 'condition'],
      invalidStepIds: ['follow', 'start'],
    });
    expect(first.guides[1]).toEqual(girona);
    expect(first.reports[1]?.status).toBe('unchanged');
    const repeated = reviseKnowledgeCatalog(first.guides, [material], '2026-10-04');
    expect(repeated.guides).toEqual(first.guides);
    expect(repeated.reports.every((item) => item.status === 'unchanged')).toBe(true);
  });

  it('registra timeout y errores de origen sin confundirlos con baja confirmada', () => {
    const timeout: EvidenceCheck = { ...identity, kind: 'unavailable', reason: 'timeout' };
    const failed = reviseKnowledgeCatalog([barcelona, girona], [timeout], '2026-10-04');
    expect(failed.guides).toEqual([barcelona, girona]);
    expect(failed.reports[0]).toMatchObject({
      status: 'unchanged',
      uncertainEvidenceIds: ['deadline'],
      invalidEvidenceIds: [],
    });
    const removed = reviseKnowledgeCatalog(
      [barcelona, girona],
      [
        {
          ...identity,
          kind: 'removed',
          proof: 'official-catalogue',
          proofUrl: 'https://example.test/catalogue',
        },
      ],
      '2026-10-04',
    );
    expect(removed.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
    expect(removed.guides[1]).toEqual(girona);
  });

  it('retira evidencia caducada sin observación y no acepta un periodo global vencido', () => {
    const expired = guideSchema.parse({
      ...barcelona,
      evidence: barcelona.evidence.map((item) =>
        item.id === 'deadline' ? { ...item, applicableUntil: '2026-09-30' } : item,
      ),
    });
    const result = reviseKnowledgeCatalog([expired], [], '2026-10-04');
    expect(result.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
    expect(result.reports[0]?.invalidEvidenceIds).toEqual(['deadline']);
    const periodExpired = guideSchema.parse({
      ...barcelona,
      period: { from: '2026-01-01', until: '2026-11-01', evidenceIds: ['deadline'] },
    });
    const afterPeriod = reviseKnowledgeCatalog([periodExpired], [], '2026-11-02');
    expect(afterPeriod.guides).toEqual([]);
    expect(afterPeriod.reports[0]?.status).toBe('withdrawn');
  });

  it('distingue cambio legal material, metadatos y caída puntual', () => {
    const originalUrl = 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-1';
    const previous: LegalSnapshot = {
      source: 'boe',
      id: 'BOE-A-2026-1',
      eli: null,
      language: 'es',
      version: '2026-01-01',
      versionDate: '2026-01-01',
      publishedAt: '2026-01-01',
      originalUrl,
      informativeUrl: 'https://www.boe.es/buscar/act.php?id=BOE-A-2026-1',
      reportedStatus: 'in_force',
      observation: 'consolidated',
      metadataRevision: '20260101T000000Z',
      materialDigest: 'a'.repeat(64),
    };
    const legalGuide = guideSchema.parse({
      ...barcelona,
      evidence: barcelona.evidence.map((item) =>
        item.id === 'deadline'
          ? {
              ...item,
              sourceId: 'boe',
              originalUrl,
              url: previous.informativeUrl,
              jurisdiction: 'ES',
              version: `BOE-A-2026-1@2026-01-01#${previous.materialDigest}`,
            }
          : item,
      ),
    });
    const legalIdentity = { ...identity, originalUrl, version: legalGuide.evidence[0]!.version };
    const observe = (current: EvidenceCheck) =>
      reviseKnowledgeCatalog([legalGuide], [current], '2026-10-04');
    const metadata = observe({
      ...legalIdentity,
      kind: 'legal',
      previous,
      current: { ok: true, snapshot: { ...previous, metadataRevision: '20261004T000000Z' } },
    });
    expect(metadata.guides).toEqual([legalGuide]);
    const changed = observe({
      ...legalIdentity,
      kind: 'legal',
      previous,
      current: { ok: true, snapshot: { ...previous, materialDigest: 'b'.repeat(64) } },
    });
    expect(changed.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
    const timeout = observe({
      ...legalIdentity,
      kind: 'legal',
      previous,
      current: { ok: false, source: 'boe', id: previous.id, reason: 'timeout' },
    });
    expect(timeout.guides).toEqual([legalGuide]);
    expect(timeout.reports[0]?.uncertainEvidenceIds).toEqual(['deadline']);
    const withoutMaterial = {
      ...previous,
      observation: 'original_only' as const,
      materialDigest: null,
    };
    const uncertain = observe({
      ...legalIdentity,
      kind: 'legal',
      previous: withoutMaterial,
      current: { ok: true, snapshot: { ...withoutMaterial, metadataRevision: '20261004T000000Z' } },
    });
    expect(uncertain.guides).toEqual([legalGuide]);
    expect(uncertain.reports[0]?.uncertainEvidenceIds).toEqual(['deadline']);
    const officialRepeal = observe({
      ...legalIdentity,
      kind: 'legal',
      previous: withoutMaterial,
      current: { ok: true, snapshot: { ...withoutMaterial, reportedStatus: 'repealed' } },
    });
    expect(officialRepeal.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
    const repealed = observe({
      ...legalIdentity,
      kind: 'legal',
      previous,
      current: { ok: true, snapshot: { ...previous, reportedStatus: 'repealed' } },
    });
    expect(repealed.guides[0]?.steps.map((item) => item.id)).toEqual(['free']);
  });
});
