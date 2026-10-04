import { lleidaMunicipalGuide } from '@reforma-digital/government/lleida-municipal-guide';
import { catalunyaDatasetSchema } from './catalunya';

/** Controlled public-source scenarios; the official T-004 evaluation has not run. */
export const lleidaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'lleida-municipal-v1',
  stage: 'controlled',
  description: 'Nueva apertura con local en Lleida; abstención fuera del municipio.',
  cases: (['ca', 'es'] as const).flatMap((language) => {
    const quotes = lleidaMunicipalGuide.evidence.filter((item) =>
      ['classification', 'certificate', 'project', 'licence', 'office'].includes(item.id),
    );
    return [
      {
        id: `lleida-local-${language}-answer`,
        query:
          language === 'ca'
            ? 'Quins procediments municipals i quina oficina he de revisar per obrir un local nou a Lleida?'
            : '¿Qué procedimientos municipales y qué oficina debo revisar para abrir un local nuevo en Lleida?',
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
          requiredFacts: ['ambiental', 'Indústria i Activitats'],
          forbiddenFacts: ['licencia concedida', 'llicència concedida'],
        },
      },
      {
        id: `barcelona-local-${language}-abstain`,
        query:
          language === 'ca'
            ? 'Quina llicència municipal necessito per obrir un restaurant de 90 m² a Barcelona segons aquesta fitxa de Lleida?'
            : '¿Qué licencia municipal necesito para abrir un restaurante de 90 m² en Barcelona según esta ficha de Lleida?',
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
          forbiddenFacts: ['llicència concedida', 'licencia concedida'],
        },
      },
    ];
  }),
});
