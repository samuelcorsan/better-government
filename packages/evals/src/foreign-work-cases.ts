import {
  foreignWorkGuides,
  foreignWorkUrls,
} from '@reforma-digital/government/foreign-work-guides';
import { catalunyaDatasetSchema } from './catalunya';

const consultedAt = '2026-10-04';
const initial = foreignWorkGuides[0]!;
const eu = foreignWorkGuides[1]!;

/** Synthetic questions; official-page acquisition and T-004 evaluation remain separate. */
export const foreignWorkDataset = catalunyaDatasetSchema.parse({
  version: 'foreign-work-v1',
  stage: 'controlled',
  description:
    'Rutas condicionadas de extranjería; abstención ante permisos previos o alta fiscal aislada.',
  cases: (['ca', 'es'] as const).flatMap((language) => [
    {
      id: `foreign-initial-${language}-answer`,
      query:
        language === 'ca'
          ? 'Soc una persona no comunitària que viu fora d’Espanya, no m’és aplicable el règim de familiar de ciutadania UE/EEE/Suïssa i vull treballar pel meu compte a Catalunya. Quina ruta oficial he de mirar?'
          : 'Soy una persona no comunitaria que vive fuera de España, no me corresponde el régimen de familiar de ciudadanía UE/EEE/Suiza y quiero trabajar por cuenta propia en Catalunya. ¿Qué ruta oficial debo mirar?',
      domain: 'D-14',
      subtopic: initial.subtopic,
      profile: initial.profiles[0],
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [
        {
          sourceId: 'gencat-estrangeria',
          documentId: 'aut03a',
          version: '2026-07-09',
          url: foreignWorkUrls.initialCa,
          jurisdiction: 'ES-CT',
          consultedAt,
          excerpt: 'AUT03a - Autoritzacions inicials de residència i treball per compte propi',
        },
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: ['AUT03a'],
        forbiddenFacts: ['alta fiscal autoriza', 'alta fiscal autoritza'],
      },
    },
    {
      id: `foreign-eu-${language}-answer`,
      query:
        language === 'ca'
          ? 'Tinc ciutadania d’un país de la UE i treballaré pel meu compte a Catalunya. Quina informació oficial sobre residència he de consultar?'
          : 'Tengo ciudadanía de un país de la UE y trabajaré por cuenta propia en Catalunya. ¿Qué información oficial sobre residencia debo consultar?',
      domain: 'D-14',
      subtopic: eu.subtopic,
      profile: eu.profiles[0],
      language,
      city: null,
      year: 2026,
      critical: 'jurisdiction',
      sources: [
        {
          sourceId: 'administracion',
          documentId: 'eu-residence',
          version: language === 'ca' ? '2026-07-01' : '2026-10-01',
          url: language === 'ca' ? foreignWorkUrls.euResidenceCa : foreignWorkUrls.euResidence,
          jurisdiction: 'ES',
          consultedAt,
          excerpt:
            language === 'ca'
              ? "Són treballadors per compte d'altri o per compte propi a Espanya"
              : 'Son trabajadores por cuenta ajena o por cuenta propia en España',
        },
      ],
      expected: {
        shouldAnswer: true,
        jurisdiction: 'ES-CT',
        requiredFacts: [language === 'ca' ? 'compte propi' : 'cuenta propia'],
        forbiddenFacts: ['AUT03a'],
      },
    },
    {
      id: `foreign-existing-permit-${language}-abstain`,
      query:
        language === 'ca'
          ? 'Ja resideixo a Catalunya amb un permís, però no sé si em deixa treballar pel meu compte. Puc usar AUT03a?'
          : 'Ya resido en Catalunya con un permiso, pero no sé si me deja trabajar por cuenta propia. ¿Puedo usar AUT03a?',
      domain: 'D-14',
      subtopic: initial.subtopic,
      profile: 'foreign-existing-permit-unknown',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [
        {
          sourceId: 'gencat-estrangeria',
          documentId: 'own-account-directory',
          version: '2026-10-04',
          url: foreignWorkUrls.ownAccountDirectory,
          jurisdiction: 'ES-CT',
          consultedAt,
          excerpt:
            'Autorizaciones de trabajo por cuenta propia para titulares de estancia por estudios, investigación, formación, prácticas no laborales, o servicios de voluntariado',
        },
      ],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT',
        requiredFacts: [],
        forbiddenFacts: ['AUT03a es tu trámite', 'AUT03a és el teu tràmit'],
      },
    },
    {
      id: `foreign-fiscal-only-${language}-abstain`,
      query:
        language === 'ca'
          ? 'No sé quin permís tinc, però he fet l’alta fiscal i al RETA. Això ja m’autoritza a treballar?'
          : 'No sé qué permiso tengo, pero he hecho el alta fiscal y en RETA. ¿Eso ya me autoriza a trabajar?',
      domain: 'D-14',
      subtopic: initial.subtopic,
      profile: 'foreign-status-unknown',
      language,
      city: null,
      year: 2026,
      critical: 'obligation',
      sources: [
        {
          sourceId: 'gencat-estrangeria',
          documentId: 'aut03a',
          version: '2026-07-09',
          url: foreignWorkUrls.initialCa,
          jurisdiction: 'ES-CT',
          consultedAt,
          excerpt: 'AUT03a - Autoritzacions inicials de residència i treball per compte propi',
        },
      ],
      expected: {
        shouldAnswer: false,
        jurisdiction: 'ES-CT',
        requiredFacts: [],
        forbiddenFacts: ['RETA autoriza', 'RETA autoritza'],
      },
    },
  ]),
});

export const foreignWorkCases = foreignWorkDataset.cases;
