import { catalunyaCaseSchema, catalunyaDatasetSchema } from './catalunya';

/** Controlled public-source cases; these do not count as an official publication corpus. */
const baseCases = [
  catalunyaCaseSchema.parse({
    id: 'd05-compatibility-ca',
    query: 'Cobro una prestació contributiva i començaré com a autònom: puc compatibilitzar-la?',
    domain: 'D-05',
    subtopic: 'compatibility',
    profile: 'contributory',
    language: 'ca',
    city: null,
    year: 2026,
    critical: 'obligation',
    sources: [
      {
        sourceId: 'BOE-A-2007-13409',
        documentId: 'BOE-A-2007-13409-art33',
        version: '2015-09-10',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409#a33',
        jurisdiction: 'ES',
        consultedAt: '2026-10-04',
        excerpt: 'por un máximo de 270 días o por el tiempo inferior pendiente de percibir',
      },
    ],
    expected: {
      shouldAnswer: true,
      jurisdiction: 'ES-CT',
      requiredFacts: ['270'],
      forbiddenFacts: ['subsidio compatible', '15 días hábiles'],
    },
  }),
  catalunyaCaseSchema.parse({
    id: 'd05-capitalization-es',
    query:
      'Voy a iniciar una actividad por cuenta propia: ¿existe el pago único del paro contributivo?',
    domain: 'D-05',
    subtopic: 'capitalization',
    profile: 'contributory',
    language: 'es',
    city: null,
    year: 2026,
    critical: 'obligation',
    sources: [
      {
        sourceId: 'BOE-A-2007-13409',
        documentId: 'BOE-A-2007-13409-art34',
        version: '2015-09-10',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-13409#a34',
        jurisdiction: 'ES',
        consultedAt: '2026-10-04',
        excerpt:
          'a los beneficiarios de prestaciones por desempleo de nivel contributivo hasta el 100 por cien',
      },
    ],
    expected: {
      shouldAnswer: true,
      jurisdiction: 'ES-CT',
      requiredFacts: ['nivel contributivo'],
      forbiddenFacts: ['100 % en metálico para todos', 'subsidio'],
    },
  }),
  catalunyaCaseSchema.parse({
    id: 'd05-subsidy-ca-abstain',
    query: 'Cobro un subsidi, no sé quin; puc mantenir-lo si em dono d’alta com a autònom?',
    domain: 'D-05',
    subtopic: 'subsidy',
    profile: 'subsidy-unknown',
    language: 'ca',
    city: null,
    year: 2026,
    critical: 'obligation',
    sources: [],
    expected: {
      shouldAnswer: false,
      jurisdiction: 'ES-CT',
      requiredFacts: [],
      forbiddenFacts: ['270 dies', '270 días', 'compatible'],
    },
  }),
  catalunyaCaseSchema.parse({
    id: 'd05-youth-grant-es-abstain',
    query: '¿Qué ayuda catalana de autoempleo juvenil está abierta hoy para mi caso?',
    domain: 'D-05',
    subtopic: 'youth-grant-2026',
    profile: 'young-self-employed',
    language: 'es',
    city: null,
    year: 2026,
    critical: 'deadline',
    sources: [
      {
        sourceId: 'EMT-2615-2026',
        documentId: 'EMT-2615-2026-call',
        version: '2026-07-27',
        url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Subvencions-per-afavorir-lautoocupacio-de-joves-en-el-marc-del-Programa-FSE-00001?moda=1',
        jurisdiction: 'ES-CT',
        consultedAt: '2026-10-04',
        excerpt: 'fins al 22 de setembre de 2026, a les 14:00 h',
      },
    ],
    expected: {
      shouldAnswer: false,
      jurisdiction: 'ES-CT',
      requiredFacts: [],
      forbiddenFacts: ['solicitud abierta', 'convocatoria abierta', '17.094'],
    },
  }),
  catalunyaCaseSchema.parse({
    id: 'd05-suspension-es',
    query:
      'Tenía prestación contributiva suspendida por trabajo autónomo; ¿qué vía debo revisar al cesar?',
    domain: 'D-05',
    subtopic: 'suspension-resumption',
    profile: 'contributory-suspended',
    language: 'es',
    city: null,
    year: 2026,
    critical: 'obligation',
    sources: [
      {
        sourceId: 'BOE-A-2015-11724',
        documentId: 'BOE-A-2015-11724-art271',
        version: '2026-02-04',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a271',
        jurisdiction: 'ES',
        consultedAt: '2026-10-04',
        excerpt:
          'mientras el titular del derecho realice un trabajo por cuenta propia de duración inferior a sesenta meses',
      },
    ],
    expected: {
      shouldAnswer: true,
      jurisdiction: 'ES-CT',
      requiredFacts: ['sesenta meses'],
      forbiddenFacts: ['subsidio compatible', 'pago único automático'],
    },
  }),
  catalunyaCaseSchema.parse({
    id: 'd05-cessation-ca',
    query: 'He cessat com a autònom: qui gestiona la prestació per cessament?',
    domain: 'D-05',
    subtopic: 'cessation-protection',
    profile: 'self-employed-ceased',
    language: 'ca',
    city: null,
    year: 2026,
    critical: 'obligation',
    sources: [
      {
        sourceId: 'BOE-A-2015-11724',
        documentId: 'BOE-A-2015-11724-art337',
        version: '2022-09-07',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724#a337',
        jurisdiction: 'ES',
        consultedAt: '2026-10-04',
        excerpt:
          'deberán solicitar a la mutua colaboradora con la Seguridad Social a la que se encuentren adheridos',
      },
    ],
    expected: {
      shouldAnswer: true,
      jurisdiction: 'ES-CT',
      requiredFacts: ['mutua'],
      forbiddenFacts: ['SEPE gestiona el alta', 'baja voluntaria suficiente'],
    },
  }),
];

const counterpart = (originalId: string, language: 'ca' | 'es', query: string) => {
  const original = baseCases.find((item) => item.id === originalId);
  if (!original) throw new Error(`Missing D-05 case ${originalId}`);
  return catalunyaCaseSchema.parse({
    ...original,
    id: original.id.replace(/-(ca|es)(?=-|$)/, `-${language}`),
    language,
    query,
  });
};

export const unemploymentDataset = catalunyaDatasetSchema.parse({
  version: 'unemployment-v2',
  stage: 'controlled',
  description:
    'Rutas de desempleo y servicios SOC condicionadas, con convocatoria juvenil cerrada.',
  cases: [
    ...baseCases,
    counterpart(
      'd05-compatibility-ca',
      'es',
      'Cobro prestación contributiva y voy a empezar como autónomo: ¿qué compatibilidad debo consultar?',
    ),
    counterpart(
      'd05-capitalization-es',
      'ca',
      'Encara no he començat l’activitat i cobro prestació contributiva: on consulto el pagament únic?',
    ),
    counterpart(
      'd05-suspension-es',
      'ca',
      'Tenia la prestació contributiva suspesa pel treball autònom; quina via he de revisar en cessar?',
    ),
    counterpart(
      'd05-cessation-ca',
      'es',
      'He cesado como autónomo: ¿quién gestiona la protección por cese de actividad?',
    ),
    counterpart(
      'd05-subsidy-ca-abstain',
      'es',
      'Cobro un subsidio, pero desconozco cuál; ¿puedo mantenerlo al empezar a trabajar como autónomo?',
    ),
    counterpart(
      'd05-youth-grant-es-abstain',
      'ca',
      'Quin ajut català d’autoocupació juvenil està obert avui per al meu cas?',
    ),
    ...(['ca', 'es'] as const).flatMap((language) => [
      catalunyaCaseSchema.parse({
        id: `d05-subsidy-resumption-${language}`,
        query:
          language === 'ca'
            ? 'El meu subsidi estava suspès mentre treballava per compte propi i ara he cessat. Quina fitxa del SEPE he de revisar?'
            : 'Mi subsidio estaba suspendido mientras trabajaba por cuenta propia y ahora he cesado. ¿Qué ficha del SEPE debo revisar?',
        domain: 'D-05',
        subtopic: 'subsidy-resumption',
        profile: 'subsidy-suspended-after-self-employment',
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [
          {
            sourceId: 'SEPE-suspension-reanudacion',
            documentId: 'sepe-subsidy-resumption',
            version: '2026-10-04',
            url: 'https://sepe.es/HomeSepe/prestaciones-desempleo/quiero-cobrar-el-paro/Suspension_reanudacion_extincion.html',
            jurisdiction: 'ES',
            consultedAt: '2026-10-04',
            excerpt:
              'En el caso de ser persona perceptora del subsidio por desempleo, que cumples el requisito de carencia de rentas o de responsabilidades familiares',
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: ['subsidio'],
          forbiddenFacts: ['270 días', '270 dies', 'reanudación automática', 'represa automàtica'],
        },
      }),
      catalunyaCaseSchema.parse({
        id: `d05-soc-guidance-${language}`,
        query:
          language === 'ca'
            ? 'Estic preparant un negoci a Catalunya: com demano orientació professional al SOC?'
            : 'Estoy preparando un negocio en Catalunya: ¿cómo pido orientación profesional al SOC?',
        domain: 'D-05',
        subtopic: 'soc-services',
        profile: 'unemployed-planning-self-employment',
        language,
        city: null,
        year: 2026,
        critical: 'jurisdiction',
        sources: [
          {
            sourceId: 'SOC-orientacio-professional',
            documentId: 'soc-orientation-service',
            version: '2026-10-04',
            url: 'https://serveiocupacio.gencat.cat/ca/soc/ambits-actuacio/orientacio-professional/index.html',
            jurisdiction: 'ES-CT',
            consultedAt: '2026-10-04',
            excerpt:
              'Si vols sol·licitar el servei d’orientació professional, truca al telèfon del SOC: 930 886 200',
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: ['SOC'],
          forbiddenFacts: ['ayuda concedida', 'ajut concedit', 'SEPE decideix'],
        },
      }),
      catalunyaCaseSchema.parse({
        id: `d05-mutuality-resumption-${language}`,
        query:
          language === 'ca'
            ? 'Tenia la prestació contributiva suspesa i treballava amb mutualitat alternativa al RETA. Quin límit he de comprovar al SEPE abans de demanar la represa?'
            : 'Tenía la prestación contributiva suspendida y trabajaba con mutualidad alternativa al RETA. ¿Qué límite debo comprobar en el SEPE antes de pedir la reanudación?',
        domain: 'D-05',
        subtopic: 'suspension-resumption',
        profile: 'mutuality-alternative',
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [
          {
            sourceId: 'SEPE-suspension-reanudacion',
            documentId: 'sepe-mutuality-suspension',
            version: '2026-10-04',
            url: 'https://sepe.es/HomeSepe/prestaciones-desempleo/quiero-cobrar-el-paro/Suspension_reanudacion_extincion.html',
            jurisdiction: 'ES',
            consultedAt: '2026-10-04',
            excerpt:
              'De duración inferior a veinticuatro meses, en el caso de actividades con alta en alguna mutualidad de previsión social alternativa',
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: ['veinticuatro meses'],
          forbiddenFacts: ['sesenta meses', 'seixanta mesos'],
        },
      }),
    ]),
  ],
});

export const unemploymentCases = unemploymentDataset.cases;
