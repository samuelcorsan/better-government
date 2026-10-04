import { catalunyaDatasetSchema } from './catalunya';

const url = 'https://seu-e.cat/ca/web/girona/tramits-i-gestions/-/tramits/tramit/16092827';

/** Controlled excerpts from the public Catalan page; Spanish expectations use its official term. */
export const gironaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'girona-municipal-controlled-2026-10-04',
  stage: 'controlled',
  description:
    'Inicio con local previamente clasificado en la columna de certificado técnico; abstención por clasificación o municipio desconocidos.',
  cases: (['ca', 'es'] as const).flatMap((language) => [
    {
      id: `girona-premises-${language}-answer`,
      query:
        language === 'ca'
          ? 'Si ja he confirmat que l’activitat del local de Girona és de la columna «Certificat tècnic», quin document tècnic exigeix la fitxa abans de comunicar l’inici?'
          : 'Si ya he confirmado que la actividad del local de Girona está en la columna «Certificat tècnic», ¿qué documento técnico exige la ficha antes de comunicar el inicio?',
      domain: 'D-06',
      subtopic: 'municipal-premises-girona',
      profile: 'with-premises',
      language,
      city: 'Girona',
      year: 2026,
      critical: 'obligation',
      sources: [
        {
          sourceId: 'girona-aoc',
          documentId: 'girona-technical-certificate',
          version: '2023-07-05',
          url,
          jurisdiction: 'ES-CT-GIRONA',
          consultedAt: '2026-10-04',
          excerpt:
            "Disposar del certificat tècnic justificatiu del compliment de la normativa que regeix l'activitat, instal·lació o establiment, signat per un tècnic competent",
        },
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT-GIRONA',
        requiredFacts: ['certificat tècnic'],
        forbiddenFacts: ['llicència concedida', 'licencia concedida'],
      },
    },
    {
      id: `girona-premises-${language}-unclassified`,
      query:
        language === 'ca'
          ? 'Puc obrir el meu local a Girona amb aquesta comunicació sense saber l’activitat, la columna de l’annex ni si hi ha obres?'
          : '¿Puedo abrir mi local en Girona con esta comunicación sin saber la actividad, la columna del anexo ni si hay obras?',
      domain: 'D-06',
      subtopic: 'municipal-premises-girona',
      profile: 'with-premises',
      language,
      city: 'Girona',
      year: 2026,
      critical: 'obligation',
      sources: [],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT-GIRONA',
        requiredFacts: [],
        forbiddenFacts: ['obertura autoritzada', 'apertura autorizada'],
      },
    },
    {
      id: `girona-premises-${language}-other-city`,
      query:
        language === 'ca'
          ? 'Serveix la comunicació de Girona per obrir un local a Barcelona?'
          : '¿Sirve la comunicación de Girona para abrir un local en Barcelona?',
      domain: 'D-06',
      subtopic: 'municipal-premises-girona',
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
        forbiddenFacts: ['la mateixa comunicació', 'la misma comunicación'],
      },
    },
  ]),
});
