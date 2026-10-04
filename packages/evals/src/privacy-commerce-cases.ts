import {
  privacyCommerceGuides,
  privacyCommerceQuestions,
} from '@reforma-digital/government/privacy-commerce-guides';
import { catalunyaCaseSchema, type CatalunyaCase } from './catalunya';

/** Controlled public-source questions; real retrieval and T-004 scoring remain pending. */
export const privacyCommerceCases: CatalunyaCase[] = privacyCommerceGuides.flatMap((guide) => {
  const questions = privacyCommerceQuestions.find((item) => item.id === guide.id);
  if (!questions) throw new Error(`Missing questions for ${guide.id}`);
  return questions.profiles.flatMap((profile) =>
    (['ca', 'es'] as const).flatMap((language) => [
      catalunyaCaseSchema.parse({
        id: `${guide.id}-${profile}-${language}-answer`,
        query: questions.question[language],
        domain: guide.domain,
        subtopic: guide.subtopic,
        profile,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: guide.evidence.map((evidence) => ({
          sourceId: evidence.sourceId,
          documentId: evidence.id,
          version: evidence.version,
          url: evidence.url,
          jurisdiction: evidence.jurisdiction,
          consultedAt: guide.consultedAt,
          excerpt: evidence.quote,
        })),
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: [questions.factStem],
          forbiddenFacts: [],
        },
      }),
      catalunyaCaseSchema.parse({
        id: `${guide.id}-${profile}-${language}-abstain`,
        query: questions.unknown[language],
        domain: guide.domain,
        subtopic: guide.subtopic,
        profile,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT',
          requiredFacts: [],
          forbiddenFacts: [],
        },
      }),
    ]),
  );
});

for (const city of ['Barcelona', 'Girona', 'Lleida', 'Tarragona'] as const)
  for (const language of ['ca', 'es'] as const)
    privacyCommerceCases.push(
      catalunyaCaseSchema.parse({
        id: `physical-shop-${city.toLowerCase()}-${language}-local-rule`,
        query:
          language === 'ca'
            ? `Quina llicència i norma municipal de reclamacions té la meva botiga de ${city} sense saber-ne l’activitat ni l’adreça?`
            : `¿Qué licencia y norma municipal de reclamaciones tiene mi tienda de ${city} sin saber su actividad ni dirección?`,
        domain: 'D-12',
        subtopic: 'physical-complaints',
        profile: 'physical-shop',
        language,
        city,
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: `ES-CT-${city.toUpperCase()}`,
          requiredFacts: [],
          forbiddenFacts: [],
        },
      }),
    );

export const privacyCommerceDataset = {
  version: '2026-10-04-controlled',
  stage: 'controlled' as const,
  description:
    'Casos bilingües de D-11/D-12 con extractos públicos y abstenciones; falta T-004 sobre el motor real.',
  cases: privacyCommerceCases,
};
