import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const text = (ca: string, es: string) => ({ ca, es });

export const foreignWorkUrls = {
  initialCa:
    'https://treball.gencat.cat/ca/ambits/estrangeria/cerca_tramits/tramits/autoritzacions_compte_propi/aut03a/',
  initialEs:
    'https://treball.gencat.cat/es/ambits/estrangeria/cerca_tramits/tramits/autoritzacions_compte_propi/aut03a/',
  euResidence:
    'https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/info-general',
  euResidenceCa:
    'https://administracion.gob.es/ca/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/info-general',
  euRegistration:
    'https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/residencia/obtencion-residencia/inscribirte-residente',
  ownAccountDirectory:
    'https://treball.gencat.cat/es/ambits/estrangeria/cerca_tramits/tramits/autoritzacions_compte_propi/',
  ministryInitial:
    'https://www.inclusion.gob.es/es/web/migraciones/w/autorizacion-inicial-de-residencia-temporal-y-trabajo-por-cuenta-propia',
  regulation: 'https://www.boe.es/buscar/act.php?id=BOE-A-2024-24099',
};

const gencat = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'gencat-estrangeria',
  url: foreignWorkUrls.initialCa,
  originalUrl: foreignWorkUrls.initialCa,
  version: 'updated-2026-07-09',
  language: 'ca',
  attribution: 'Generalitat de Catalunya, Departament de Treball; adaptació i traducció pròpies',
  sourceUpdatedAt: '2026-07-09',
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction: 'ES-CT',
  quote,
});

const state = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'administracion',
  url: foreignWorkUrls.euResidence,
  originalUrl: foreignWorkUrls.euResidence,
  version: 'updated-2026-10-01',
  language: 'es',
  attribution: 'Punto de Acceso General, Administración General del Estado; traducció pròpia',
  sourceUpdatedAt: '2026-10-01',
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction: 'ES',
  quote,
});

const ministry = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'ministerio-migraciones',
  url: foreignWorkUrls.ministryInitial,
  originalUrl: foreignWorkUrls.ministryInitial,
  version: 'updated-2025-05',
  language: 'es',
  attribution: 'Ministerio de Inclusión, Seguridad Social y Migraciones',
  sourceUpdatedAt: null,
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction: 'ES',
  quote,
});

const regulation = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'boe-extranjeria',
  url: foreignWorkUrls.regulation,
  originalUrl: foreignWorkUrls.regulation,
  version: 'consolidated-2026-09-22',
  language: 'es',
  attribution: 'BOE, Real Decreto 1155/2024, artículos 39.1 y 85.1; traducción propia',
  sourceUpdatedAt: '2026-09-22',
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: false,
  jurisdiction: 'ES',
  quote,
});

/** Orientation only. Existing residence or another authorization needs its own route. */
export const foreignWorkGuides: Guide[] = [
  guideSchema.parse({
    id: 'foreign-initial-own-account-catalunya',
    revision: 1,
    title: text(
      'Treball per compte propi: autorització inicial per a persona no resident',
      'Trabajo por cuenta propia: autorización inicial para persona no residente',
    ),
    domain: 'D-14',
    subtopic: 'foreign-work-authorization',
    profiles: ['foreign-non-eu-nonresident'],
    jurisdiction: 'ES-CT',
    consultedAt,
    period: { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence: [
      gencat('route', 'AUT03a - Autoritzacions inicials de residència i treball per compte propi'),
      gencat('applicant', 'La persona estrangera que vol treballar pel seu compte a Catalunya.'),
      gencat(
        'consulate',
        'Cal presentar la sol·licitud de visat i d’autorització a la missió diplomàtica o consular d’Espanya al país de residència',
      ),
      gencat('project', "documentació acreditativa de l'activitat empresarial o professional"),
      ministry(
        'ministry-scope',
        'No ser ciudadano de un Estado de la Unión Europea, del Espacio Económico Europeo o de Suiza, o familiar de ciudadanos de estos países a los que les sea de aplicación el régimen de ciudadano de la Unión.',
      ),
      ministry(
        'ministry-nonresident',
        'una persona extranjera no residente en España para la realización de una actividad lucrativa por cuenta propia',
      ),
      regulation(
        'visa-request',
        'conllevará la solicitud de la correspondiente autorización de residencia temporal',
      ),
      regulation(
        'initial-visa',
        'deberá presentar una solicitud de visado de residencia conforme a lo establecido en los artículos 38 y 39',
      ),
    ],
    conditions: [
      {
        id: 'initial-nonresident',
        text: text(
          'La persona no és ciutadana de la UE, l’EEE o Suïssa, no resideix a Espanya i projecta activitat per compte propi a Catalunya; cal comprovar també si li és aplicable un règim familiar diferent.',
          'La persona no es ciudadana de la UE, el EEE o Suiza, no reside en España y proyecta actividad por cuenta propia en Catalunya; hay que comprobar también si le corresponde otro régimen familiar.',
        ),
        evidenceIds: ['route', 'applicant', 'ministry-scope', 'ministry-nonresident'],
        translation: null,
      },
    ],
    exclusions: [
      {
        id: 'other-status',
        text: text(
          'Una residència, estada per estudis, autorització de treball prèvia o règim familiar pot requerir un tràmit diferent. Aquesta fitxa no decideix aquests casos.',
          'Una residencia, estancia por estudios, autorización de trabajo previa o régimen familiar puede requerir otro trámite. Esta ficha no decide esos casos.',
        ),
        evidenceIds: ['route', 'applicant', 'ministry-scope'],
        translation: 'es',
      },
      {
        id: 'registration-is-not-authorization',
        text: text(
          'L’alta fiscal o a la Seguretat Social no substitueix l’autorització de residència i treball exigible.',
          'El alta fiscal o en la Seguridad Social no sustituye la autorización de residencia y trabajo exigible.',
        ),
        evidenceIds: ['route', 'consulate'],
        translation: 'es',
      },
    ],
    claims: [],
    steps: [
      {
        id: 'check-status',
        text: text(
          'Confirma nacionalitat, país de residència i qualsevol autorització o règim familiar previ abans de triar la ruta.',
          'Confirma nacionalidad, país de residencia y cualquier autorización o régimen familiar previo antes de elegir la ruta.',
        ),
        evidenceIds: ['route', 'applicant', 'ministry-scope'],
        translation: 'es',
        dependsOn: [],
      },
      {
        id: 'open-aut03a',
        text: text(
          'Si es compleixen aquestes condicions, obre la fitxa AUT03a de la Generalitat. Comprova el pagament, els documents del projecte i la sol·licitud inicial de visat que inclou la d’autorització davant la missió o oficina consular espanyola competent.',
          'Si se cumplen estas condiciones, abre la ficha AUT03a de la Generalitat. Comprueba el pago, los documentos del proyecto y la solicitud inicial de visado que conlleva la de autorización ante la misión u oficina consular española competente.',
        ),
        evidenceIds: ['route', 'project', 'consulate', 'visa-request', 'initial-visa'],
        translation: 'es',
        dependsOn: ['check-status'],
      },
    ],
  }),
  guideSchema.parse({
    id: 'foreign-eu-own-account-catalunya',
    revision: 1,
    title: text(
      'Treball per compte propi: ciutadania UE, EEE o Suïssa',
      'Trabajo por cuenta propia: ciudadanía UE, EEE o Suiza',
    ),
    domain: 'D-14',
    subtopic: 'foreign-work-authorization',
    profiles: ['foreign-eu-eea-swiss'],
    jurisdiction: 'ES-CT',
    consultedAt,
    period: { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence: [
      state(
        'eu-nationality',
        'Los ciudadanos de un Estado miembro de la Unión Europea o de otro Estado parte en el Acuerdo sobre el Espacio Económico Europeo y de Suiza',
      ),
      state('eu-self-employed', 'Son trabajadores por cuenta ajena o por cuenta propia en España'),
      {
        ...state(
          'eu-self-employed-ca',
          "Són treballadors per compte d'altri o per compte propi a Espanya",
        ),
        url: foreignWorkUrls.euResidenceCa,
        originalUrl: foreignWorkUrls.euResidenceCa,
        version: 'updated-2026-07-01',
        language: 'ca',
        attribution: "Punt d'Accés General, Administració General de l'Estat",
        sourceUpdatedAt: '2026-07-01',
      },
      {
        ...state(
          'eu-registration',
          'La solicitud deberá presentarse en el plazo de tres meses contados desde la fecha de entrada en España',
        ),
        url: foreignWorkUrls.euRegistration,
        originalUrl: foreignWorkUrls.euRegistration,
        version: 'updated-2026-03-25',
        sourceUpdatedAt: '2026-03-25',
      },
    ],
    conditions: [
      {
        id: 'eu-citizen',
        text: text(
          'La persona té ciutadania de la UE, l’EEE o Suïssa i treballarà per compte propi a Espanya.',
          'La persona tiene ciudadanía de la UE, el EEE o Suiza y trabajará por cuenta propia en España.',
        ),
        evidenceIds: ['eu-nationality', 'eu-self-employed', 'eu-self-employed-ca'],
        translation: 'ca',
      },
    ],
    exclusions: [
      {
        id: 'non-eu-family',
        text: text(
          'La nacionalitat d’un familiar no comunitari no permet deduir automàticament quin règim li correspon.',
          'La nacionalidad de un familiar no comunitario no permite deducir automáticamente qué régimen le corresponde.',
        ),
        evidenceIds: ['eu-nationality'],
        translation: 'ca',
      },
    ],
    claims: [],
    steps: [
      {
        id: 'open-eu-residence',
        text: text(
          'Consulta el Punt d’Accés General sobre el dret de residència per a més de tres mesos i la fitxa d’inscripció, que indica el termini des de l’entrada a Espanya.',
          'Consulta el Punto de Acceso General sobre el derecho de residencia por más de tres meses y la ficha de inscripción, que indica el plazo desde la entrada en España.',
        ),
        evidenceIds: [
          'eu-nationality',
          'eu-self-employed',
          'eu-self-employed-ca',
          'eu-registration',
        ],
        translation: 'ca',
        dependsOn: [],
      },
    ],
  }),
];

export const foreignWorkCoverage = {
  status: 'partial' as const,
  questions: [
    text(
      'Quina nacionalitat o règim familiar de la UE correspon?',
      '¿Qué nacionalidad o régimen familiar de la UE corresponde?',
    ),
    text(
      'On resideix ara la persona i amb quin tipus de permís?',
      '¿Dónde reside ahora la persona y con qué tipo de permiso?',
    ),
    text(
      'L’autorització existent permet expressament el treball per compte propi?',
      '¿La autorización existente permite expresamente el trabajo por cuenta propia?',
    ),
  ],
  gaps: [
    text(
      'Les persones ja residents, estudiants, transfrontereres o familiars de ciutadania UE necessiten seleccionar el tràmit específic; sense aquest context, abstenció i directori oficial.',
      'Quienes ya residen, estudian, trabajan en frontera o son familiares de ciudadanía UE necesitan seleccionar el trámite específico; sin ese contexto, abstención y directorio oficial.',
    ),
  ],
};
