import {
  activityClosureGuides,
  activityClosureQuestions,
} from '@reforma-digital/government/activity-closure-guides';
import { catalunyaCaseSchema, type CatalunyaCase } from './catalunya';

/** Controlled questions only; no user values or live T-004 result is recorded here. */
export const activityClosureCases: CatalunyaCase[] = activityClosureGuides.flatMap((guide) => {
  const questions = activityClosureQuestions.find((item) => item.id === guide.id);
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
        sources: guide.evidence.map((item) => ({
          sourceId: item.sourceId,
          documentId: item.id,
          version: guide.consultedAt,
          url: item.url,
          jurisdiction: item.jurisdiction,
          consultedAt: guide.consultedAt,
          excerpt: item.quote,
        })),
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: questions.fact ? [questions.fact] : [],
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
        critical: guide.domain === 'D-17' ? 'deadline' : 'obligation',
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
    activityClosureCases.push(
      catalunyaCaseSchema.parse({
        id: `close-local-${city.toLowerCase()}-${language}-abstain`,
        query:
          language === 'ca'
            ? `Quin formulari municipal exacte he de presentar en tancar un local a ${city} sense dir-ne activitat ni adreça?`
            : `¿Qué formulario municipal exacto debo presentar al cerrar un local en ${city} sin indicar actividad ni dirección?`,
        domain: 'D-18',
        subtopic: 'close-physical-establishment',
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

export const activityClosureDataset = {
  version: '2026-10-04-controlled',
  stage: 'controlled' as const,
  description:
    'Casos bilingües de D-17/D-18 con extractos oficiales observados y abstenciones; faltan T-004 y versiones verificadas.',
  cases: activityClosureCases,
};
