import { lleidaMunicipalGuide } from '@reforma-digital/government/lleida-municipal-guide';
import { catalunyaDatasetSchema } from './catalunya';

/** Controlled public-source scenarios; the official T-004 evaluation has not run. */
export const lleidaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'lleida-municipal-v1',
  stage: 'controlled',
  description: 'Nueva apertura con local en Lleida; abstención fuera del municipio.',
  cases: (['ca', 'es'] as const).flatMap((language) => {
    const quotes = lleidaMunicipalGuide.evidence.filter((item) =>
      ['classification', 'certificate', 'project', 'licence'].includes(item.id),
    );
    return [
      {
        id: `lleida-local-${language}-answer`,
        query:
          language === 'ca'
            ? 'Quins procediments municipals he de revisar per obrir un local nou a Lleida?'
            : '¿Qué procedimientos municipales debo revisar para abrir un local nuevo en Lleida?',
        domain: 'D-06',
        subtopic: lleidaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Lleida',
        year: 2026,
        critical: 'jurisdiction',
        sources: quotes.map((quote) => ({
          sourceId: quote.sourceId,
          documentId: quote.id,
          version: '2026-03-19',
          url: quote.url,
          jurisdiction: quote.jurisdiction,
          consultedAt: lleidaMunicipalGuide.consultedAt,
          excerpt: quote.quote,
        })),
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT-LLEIDA',
          requiredFacts: ['ambiental'],
          forbiddenFacts: ['licencia concedida', 'llicència concedida'],
        },
      },
      {
        id: `barcelona-local-${language}-abstain`,
        query:
          language === 'ca'
            ? 'Aquests procediments de Lleida serveixen per al meu local a Barcelona?'
            : '¿Estos procedimientos de Lleida sirven para mi local en Barcelona?',
        domain: 'D-06',
        subtopic: lleidaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Barcelona',
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-BARCELONA',
          requiredFacts: [],
          forbiddenFacts: ['Lleida'],
        },
      },
    ];
  }),
});
