import { tarragonaMunicipalGuide } from '@reforma-digital/government/tarragona-municipal-guide';
import { catalunyaDatasetSchema } from './catalunya';

/** Controlled cases; T-004 must independently acquire the current municipal page. */
export const tarragonaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'tarragona-municipal-v1',
  stage: 'controlled',
  description: 'Ruta municipal de Annex III condicionada; abstención para otro municipio.',
  cases: (['ca', 'es'] as const).flatMap((language) => {
    const evidence = tarragonaMunicipalGuide.evidence.find((item) => item.id === 'annex');
    if (!evidence) throw new Error('Missing Tarragona source');
    return [
      {
        id: `tarragona-annex-iii-${language}-answer`,
        query:
          language === 'ca'
            ? 'Si la meva activitat amb local a Tarragona consta a l’Annex III, quina fitxa municipal he de consultar?'
            : 'Si mi actividad con local en Tarragona consta en el Anexo III, ¿qué ficha municipal debo consultar?',
        domain: 'D-06',
        subtopic: tarragonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Tarragona',
        year: 2026,
        critical: 'jurisdiction',
        sources: [
          {
            sourceId: evidence.sourceId,
            documentId: evidence.id,
            version: '2026-10-04',
            url: evidence.url,
            jurisdiction: evidence.jurisdiction,
            consultedAt: tarragonaMunicipalGuide.consultedAt,
            excerpt: evidence.quote,
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT-TARRAGONA',
          requiredFacts: ['ambiental'],
          forbiddenFacts: ['llicència concedida', 'licencia concedida'],
        },
      },
      {
        id: `lleida-annex-iii-${language}-abstain`,
        query:
          language === 'ca'
            ? 'Puc usar aquesta fitxa de Tarragona per obrir un local a Lleida?'
            : '¿Puedo usar esta ficha de Tarragona para abrir un local en Lleida?',
        domain: 'D-06',
        subtopic: tarragonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Lleida',
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-LLEIDA',
          requiredFacts: [],
          forbiddenFacts: ['Tarragona'],
        },
      },
    ];
  }),
});

export const tarragonaMunicipalCases = tarragonaMunicipalDataset.cases;
