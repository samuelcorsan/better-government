import { barcelonaMunicipalGuide } from '@reforma-digital/government/barcelona-municipal-guide';
import { catalunyaDatasetSchema } from './catalunya';

/** Controlled public-source scenarios; the official T-004 evaluation has not run. */
export const barcelonaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'barcelona-municipal-v1',
  stage: 'controlled',
  description:
    'Inicio con local incluido en un Plan de usos de Barcelona; abstención fuera del municipio.',
  cases: (['ca', 'es'] as const).flatMap((language) => {
    const quote = barcelonaMunicipalGuide.evidence.find(
      (item) => item.id === `consult-${language}`,
    )!;
    return [
      {
        id: `barcelona-local-${language}-answer`,
        query:
          language === 'ca'
            ? 'Què necessito abans de demanar l’informe urbanístic per a un local inclòs en un Pla d’usos de Barcelona?'
            : '¿Qué necesito antes de pedir el informe urbanístico para un local incluido en un Plan de usos de Barcelona?',
        domain: 'D-06',
        subtopic: barcelonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Barcelona',
        year: 2026,
        critical: 'jurisdiction',
        sources: [
          {
            sourceId: quote.sourceId,
            documentId: quote.id,
            version: '2026-10-04',
            url: quote.url,
            jurisdiction: quote.jurisdiction,
            consultedAt: barcelonaMunicipalGuide.consultedAt,
            excerpt: quote.quote,
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT-BARCELONA',
          requiredFacts: [language === 'ca' ? 'consulta prèvia' : 'consulta previa'],
          forbiddenFacts: ['licencia concedida', 'llicència concedida'],
        },
      },
      {
        id: `girona-local-${language}-abstain`,
        query:
          language === 'ca'
            ? 'Aquest informe de Barcelona serveix per al meu local a Girona?'
            : '¿Este informe de Barcelona sirve para mi local en Girona?',
        domain: 'D-06',
        subtopic: barcelonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Girona',
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-GIRONA',
          requiredFacts: [],
          forbiddenFacts: ['Barcelona'],
        },
      },
    ];
  }),
});
