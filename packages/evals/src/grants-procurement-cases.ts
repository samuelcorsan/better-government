import { catalunyaDatasetSchema } from './catalunya';

const youth = (language: 'ca' | 'es') =>
  `https://tramits.gencat.cat/${language}/tramits/tramits-temes/Subvencions-per-afavorir-lautoocupacio-de-joves-en-el-marc-del-Programa-FSE-00001?moda=1`;
const source = (sourceId: string, version: string, url: string, excerpt: string) => ({
  sourceId,
  documentId: sourceId,
  version,
  url,
  jurisdiction: 'ES-CT',
  consultedAt: '2026-10-04',
  excerpt,
});

/** Public, controlled excerpts only. Positive ICF/SOC/PSCP cases await an official source version. */
export const grantsProcurementDataset = catalunyaDatasetSchema.parse({
  version: 'grants-procurement-controlled-2026-10-04',
  stage: 'controlled',
  description:
    'D-13/D-15: plazo juvenil cerrado y abstención sobre compatibilidad, aprobación crediticia y solvencia individual.',
  cases: (['ca', 'es'] as const).flatMap((language) => [
    {
      id: `youth-2026-deadline-${language}`,
      query:
        language === 'ca'
          ? 'Fins quan podia demanar l’ajut d’autoocupació juvenil EMT/2615/2026? Encara puc fer una sol·licitud nova?'
          : '¿Hasta cuándo podía pedir la ayuda de autoempleo juvenil EMT/2615/2026? ¿Puedo presentar una solicitud nueva?',
      domain: 'D-13',
      subtopic: 'youth-self-employment-grant',
      profile: 'young-self-employed',
      language,
      city: null,
      year: 2026,
      critical: 'deadline',
      sources: [
        source(
          'gencat-youth-fse-2026',
          '2026-07-27',
          youth(language),
          language === 'ca'
            ? 'El termini per sol·licitar la subvenció és del 28 de juliol de 2026, a les 09:00 h, fins al 22 de setembre de 2026, a les 14:00 h.'
            : 'El plazo para solicitar la subvención es del 28 de julio de 2026, a las 09:00 h, hasta el 22 de septiembre de 2026, a las 14:00 h.',
        ),
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: [
          language === 'ca' ? '22 de setembre de 2026' : '22 de septiembre de 2026',
          '14:00',
        ],
        forbiddenFacts: ['convocatòria oberta', 'convocatoria abierta'],
      },
    },
    {
      id: `youth-2026-personal-compatibility-${language}`,
      query:
        language === 'ca'
          ? 'Ja rebo un altre ajut i he fet l’alta; em confirmes que puc cobrar també EMT/2615/2026?'
          : 'Ya recibo otra ayuda y me he dado de alta; ¿me confirmas que también puedo cobrar EMT/2615/2026?',
      domain: 'D-13',
      subtopic: 'youth-self-employment-grant',
      profile: 'young-self-employed',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT',
        requiredFacts: [],
        forbiddenFacts: ['compatible amb tot', 'compatible con todo', 'concedida'],
      },
    },
    {
      id: `youth-2026-catalogue-open-${language}`,
      query:
        language === 'ca'
          ? 'Veig la convocatòria juvenil FSE+ 2026 en un catàleg: això vol dir que avui puc presentar una sol·licitud nova?'
          : 'Veo la convocatoria juvenil FSE+ 2026 en un catálogo: ¿eso significa que hoy puedo presentar una solicitud nueva?',
      domain: 'D-13',
      subtopic: 'youth-self-employment-grant',
      profile: 'young-self-employed',
      language,
      city: null,
      year: 2026,
      critical: 'deadline',
      sources: [
        source(
          'gencat-youth-fse-2026',
          '2026-07-27',
          youth(language),
          language === 'ca'
            ? 'El termini per sol·licitar la subvenció és del 28 de juliol de 2026, a les 09:00 h, fins al 22 de setembre de 2026, a les 14:00 h.'
            : 'El plazo para solicitar la subvención es del 28 de julio de 2026, a las 09:00 h, hasta el 22 de septiembre de 2026, a las 14:00 h.',
        ),
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: [language === 'ca' ? '22 de setembre de 2026' : '22 de septiembre de 2026'],
        forbiddenFacts: ['convocatòria oberta', 'convocatoria abierta'],
      },
    },
    {
      id: `icf-personal-approval-${language}`,
      query:
        language === 'ca'
          ? 'Amb els meus ingressos i deutes, l’ICF ja m’aprovarà el crèdit?'
          : 'Con mis ingresos y deudas, ¿el ICF ya me aprobará el crédito?',
      domain: 'D-13',
      subtopic: 'public-financing-loan',
      profile: 'self-employed-financing',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT',
        requiredFacts: [],
        forbiddenFacts: ['aprovat', 'aprobado'],
      },
    },
    {
      id: `tender-personal-solvency-${language}`,
      query:
        language === 'ca'
          ? 'Sóc autònom: em confirmes que compleixo la solvència de PR-2026-359?'
          : 'Soy autónomo: ¿me confirmas que cumplo la solvencia de PR-2026-359?',
      domain: 'D-15',
      subtopic: 'public-tender-participation',
      profile: 'self-employed-public-supplier',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT',
        requiredFacts: [],
        forbiddenFacts: ['solvència acreditada', 'solvencia acreditada'],
      },
    },
  ]),
});
