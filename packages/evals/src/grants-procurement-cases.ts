import { catalunyaDatasetSchema } from './catalunya';

const youth = (language: 'ca' | 'es') =>
  `https://tramits.gencat.cat/${language}/tramits/tramits-temes/Subvencions-per-afavorir-lautoocupacio-de-joves-en-el-marc-del-Programa-FSE-00001?moda=1`;
const icf = (language: 'ca' | 'es') =>
  `https://www.icf.cat/${language}/prestecs/pimes/icf-autonoms`;
const soc = (language: 'ca' | 'es') =>
  `https://serveiocupacio.gencat.cat/${language}/entitats/subvencions-fpo/programa-forma-i-contracta-2026/preguntes-frequents/index.html`;
const tender =
  'https://contractaciopublica.cat/ca/detall-publicacio/3bb0e137-3dda-4d30-94de-e7aba5e01dd0/300740349';
const source = (sourceId: string, version: string, url: string, excerpt: string) => ({
  sourceId,
  documentId: sourceId,
  version,
  url,
  jurisdiction: 'ES-CT',
  consultedAt: '2026-10-04',
  excerpt,
});

/** Public, controlled excerpts only; no applicant, credit, supplier or session data. */
export const grantsProcurementDataset = catalunyaDatasetSchema.parse({
  version: 'grants-procurement-controlled-2026-10-04',
  stage: 'controlled',
  description:
    'D-13/D-15: plazo cerrado, préstamo frente a subvención, programa SOC distinto y aptitud contractual individual desconocida.',
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
      id: `bdns-920886-open-${language}`,
      query:
        language === 'ca'
          ? 'Veig el codi BDNS 920886 en un catàleg: això vol dir que avui puc presentar una sol·licitud nova?'
          : 'Veo el código BDNS 920886 en un catálogo: ¿eso significa que hoy puedo presentar una solicitud nueva?',
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
      id: `icf-loan-${language}`,
      query:
        language === 'ca'
          ? 'ICF Autònoms i Pimes és una subvenció a fons perdut o un préstec?'
          : '¿ICF Autónomos y Pymes es una subvención a fondo perdido o un préstamo?',
      domain: 'D-13',
      subtopic: 'public-financing-loan',
      profile: 'self-employed-financing',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [
        source(
          'icf-autonoms-pimes',
          '2026-10-04',
          icf(language),
          language === 'ca'
            ? "Finança el teu projecte amb els préstecs de l'ICF per autònoms i pimes!"
            : '¡Financia tu proyecto con los préstamos del ICF para autónomos y pymes!',
        ),
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: [language === 'ca' ? 'préstec' : 'préstamo'],
        forbiddenFacts: ['subvenció concedida', 'subvención concedida'],
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
      id: `soc-forma-contracta-${language}`,
      query:
        language === 'ca'
          ? 'Forma i Contracta 2026 és un ajut per donar-me d’alta com a autònom?'
          : '¿Forma y Contrata 2026 es una ayuda para darme de alta como autónomo?',
      domain: 'D-13',
      subtopic: 'soc-training-grant',
      profile: 'new-self-employed',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [
        source(
          'soc-forma-contracta-2026',
          '2026-10-04',
          soc(language),
          language === 'ca'
            ? 'Se sol·licita una subvenció per a la formació de treballadors que requereixin una formació professional per a l’ocupació'
            : 'Se solicita una subvención para la formación de trabajadores que requieran una formación profesional para el empleo',
        ),
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: [language === 'ca' ? 'formació' : 'formación'],
        forbiddenFacts: ['ajut per alta autònoma', 'ayuda por alta autónoma'],
      },
    },
    {
      id: `tender-2026-deadline-${language}`,
      query:
        language === 'ca'
          ? 'En format dd/mm/aaaa, quan acabava el termini d’ofertes de PR-2026-359? Continua obert per licitar?'
          : 'En formato dd/mm/aaaa, ¿cuándo terminaba el plazo de ofertas de PR-2026-359? ¿Sigue abierto para licitar?',
      domain: 'D-15',
      subtopic: 'public-tender-participation',
      profile: 'self-employed-public-supplier',
      language,
      city: null,
      year: 2026,
      critical: 'deadline',
      sources: [
        source(
          'pscp-pr-2026-359',
          '2026-10-04',
          tender,
          "Codi de l'expedient: PR-2026-359. Termini de presentació d'ofertes: 04/05/2026 12:00:00",
        ),
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: ['PR-2026-359', '04/05/2026'],
        forbiddenFacts: ['obert per presentar', 'abierto para presentar'],
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
