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
          requiredFacts: [
            language === 'ca'
              ? "Número identificador de la consulta prèvia d'activitats"
              : 'Número identificador de la consulta previa de actividades',
          ],
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
          forbiddenFacts: [
            language === 'ca'
              ? 'demana aquest informe de Barcelona per al local de Girona'
              : 'solicita este informe de Barcelona para el local de Girona',
          ],
        },
      },
      {
        id: `barcelona-local-${language}-unclassified`,
        query:
          language === 'ca'
            ? 'Tinc un local a Barcelona. He de demanar aquest informe sense saber l’activitat ni si està inclosa en un Pla d’usos?'
            : 'Tengo un local en Barcelona. ¿Debo pedir este informe sin saber la actividad ni si está incluida en un Plan de usos?',
        domain: 'D-06',
        subtopic: barcelonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Barcelona',
        year: 2026,
        critical: 'obligation',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-BARCELONA',
          requiredFacts: [],
          forbiddenFacts: [
            language === 'ca'
              ? 'informe obligatori per a qualsevol activitat'
              : 'informe obligatorio para cualquier actividad',
          ],
        },
      },
    ];
  }),
});
