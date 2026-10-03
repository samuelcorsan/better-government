import { createHash } from 'node:crypto';
import {
  compatibleJurisdiction,
  type Evidence,
  type QueryUnderstanding,
  type SearchConfig,
} from '@reforma-digital/core';
import {
  approvedSource,
  canonicalize,
  documentJurisdiction,
  documentYear,
  sources,
} from '@reforma-digital/government';
import { searchWebSources } from './models';

export async function retrieveWebEvidence(
  query: string,
  understanding: QueryUnderstanding,
  config: SearchConfig,
): Promise<Evidence[]> {
  const domains = sources
    .filter(
      (source) =>
        source.enabled &&
        compatibleJurisdiction(source.jurisdictionValue, understanding.jurisdiction),
    )
    .flatMap((source) => source.hosts);
  const results = await searchWebSources(query, config, [...new Set(domains)]);
  const evidence: Evidence[] = [];
  const seen = new Set<string>();
  for (const result of results) {
    if (result.sourceType !== 'url') continue;
    const source = approvedSource(result.url);
    const content = result.providerMetadata?.openrouter?.content;
    // A generated summary is never substituted for the search engine's source excerpt.
    if (
      !source ||
      !compatibleJurisdiction(source.jurisdictionValue, understanding.jurisdiction) ||
      typeof content !== 'string' ||
      content.trim().length < 8
    )
      continue;
    const canonicalUrl = canonicalize(result.url);
    const jurisdiction = documentJurisdiction(
      source,
      `${result.title ?? ''} ${content}`,
      canonicalUrl,
    );
    if (!jurisdiction || !compatibleJurisdiction(jurisdiction, understanding.jurisdiction))
      continue;
    if (seen.has(canonicalUrl)) continue;
    seen.add(canonicalUrl);
    const documentId = createHash('sha256').update(canonicalUrl).digest('hex');
    const chunkId = createHash('sha256')
      .update(documentId + content)
      .digest('hex');
    evidence.push({
      documentId,
      chunkId,
      sourceId: source.id,
      canonicalUrl,
      title: result.title || source.name,
      heading: '',
      content: content.trim().slice(0, 12000),
      organization: source.organization,
      jurisdiction,
      applicabilityYear: documentYear(result.title ?? '', canonicalUrl),
      authorityScore: source.authorityScore,
      crawledAt: new Date().toISOString(),
      sourceUpdatedAt: null,
      score: 1 / (evidence.length + 1),
      available: true,
    });
    if (evidence.length >= config.finalEvidenceCount) break;
  }
  return evidence;
}
