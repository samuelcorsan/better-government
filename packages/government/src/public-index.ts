import { compatibleJurisdiction, normalizeText, type Guide } from '@reforma-digital/core';
import type { PublicCatalogue } from './public-release';

export type LocalSearchInput = {
  query: string;
  language: 'ca' | 'es';
  activity?: string;
  profile?: string;
  municipality?: string;
};
export type LocalSearchHit = {
  guide: Guide;
  current: boolean;
  questions: string[];
};
export type LocalSearchResult = {
  hits: LocalSearchHit[];
  municipalCoverage: 'not-requested' | 'covered' | 'uncovered';
  needsTopic: boolean;
};

const stopWords = new Set([
  'com',
  'con',
  'del',
  'els',
  'las',
  'les',
  'los',
  'per',
  'por',
  'que',
  'una',
  'uno',
]);
function words(value: string): string[] {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word.length >= 3 && !stopWords.has(word));
}
function matches(term: string, text: string): boolean {
  return words(text).some(
    (word) =>
      word === term ||
      (word.length >= 5 && term.length >= 5 && word.slice(0, 5) === term.slice(0, 5)),
  );
}
function rank(guide: Guide, input: LocalSearchInput, terms: string[]): number {
  const lang = input.language;
  const title = guide.title[lang];
  const detail = [...guide.conditions, ...guide.exclusions, ...guide.claims, ...guide.steps]
    .map((item) => item.text[lang])
    .join(' ');
  return terms.reduce(
    (score, term) =>
      score +
      (matches(term, title) ? 4 : 0) +
      (matches(term, guide.subtopic) ? 2 : 0) +
      (matches(term, detail) ? 1 : 0),
    0,
  );
}

/** Read-only retrieval of public guides. Neither this function nor its caller sends the query to a server. */
export function searchPublicCatalogue(
  catalogue: PublicCatalogue,
  input: LocalSearchInput,
  asOf: string,
): LocalSearchResult {
  const terms = [...new Set([...words(input.query), ...words(input.activity ?? '')])];
  const needsTopic = !terms.length && !input.profile;
  const city =
    input.municipality && normalizeText(input.municipality).replaceAll(' ', '-').toUpperCase();
  const territory = city ? `ES-CT-${city}` : 'ES-CT';
  const eligible = catalogue.guides.filter(
    ({ guide }) =>
      compatibleJurisdiction(guide.jurisdiction, territory) &&
      (!guide.period.from || guide.period.from <= asOf) &&
      (!input.profile || guide.profiles.includes(input.profile)),
  );
  const relevant = needsTopic
    ? []
    : eligible
        .map(({ guide, current }) => ({ guide, current, score: rank(guide, input, terms) }))
        .filter(({ score }) => score > 0 || (!terms.length && !!input.profile));
  const municipalCoverage =
    !city || needsTopic
      ? 'not-requested'
      : relevant.some(({ guide, current }) => guide.jurisdiction === territory && current)
        ? 'covered'
        : 'uncovered';
  const hits = relevant
    .sort(
      (a, b) =>
        Number(b.current) - Number(a.current) ||
        b.score - a.score ||
        a.guide.id.localeCompare(b.guide.id),
    )
    .slice(0, 6)
    .map(({ guide, current }) => ({
      guide,
      current,
      questions: guide.conditions.map((condition) =>
        input.language === 'ca'
          ? `Es compleix aquesta condició? ${condition.text.ca}`
          : `¿Se cumple esta condición? ${condition.text.es}`,
      ),
    }));
  return { hits, municipalCoverage, needsTopic };
}
