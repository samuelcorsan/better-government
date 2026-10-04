import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const text = (ca: string, es: string) => ({ ca, es });
const pending = {
  revision: 1,
  consultedAt,
  period: { evidenceIds: [] },
  validation: { status: 'pending' },
} as const;
type PublicPage = {
  id: string;
  url: string;
  version: string;
  updatedAt: string | null;
  language: 'ca' | 'es';
  jurisdiction: string;
  attribution: string;
};
const evidence = (id: string, page: PublicPage, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: page.id,
  url: page.url,
  originalUrl: page.url,
  version: page.version,
  language: page.language,
  attribution: page.attribution,
  sourceUpdatedAt: page.updatedAt,
  // Source edition/observation is a conservative candidate date, not legal commencement.
  applicableFrom: page.updatedAt ?? consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction: page.jurisdiction,
  quote,
});

const youthCa: PublicPage = {
  id: 'gencat-youth-fse-2026',
  url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Subvencions-per-afavorir-lautoocupacio-de-joves-en-el-marc-del-Programa-FSE-00001?moda=1',
  version: '2026-07-27',
  updatedAt: '2026-07-27',
  language: 'ca',
  jurisdiction: 'ES-CT',
  attribution: 'Tràmits Gencat, Departament d’Empresa i Treball; adaptació sense aval',
};
const youthEs: PublicPage = {
  ...youthCa,
  url: 'https://tramits.gencat.cat/es/tramits/tramits-temes/Subvencions-per-afavorir-lautoocupacio-de-joves-en-el-marc-del-Programa-FSE-00001?moda=1',
  language: 'es',
  attribution: 'Trámites Gencat, Departament d’Empresa i Treball; adaptación sin aval',
};
const lgs: PublicPage = {
  id: 'boe-lgs',
  url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2003-20977',
  version: '2024-08-02',
  updatedAt: '2024-08-02',
  language: 'es',
  jurisdiction: 'ES',
  attribution: 'BOE, Ley 38/2003, texto consolidado informativo; traducción propia al catalán',
};
const icfCa: PublicPage = {
  id: 'icf-autonoms-pimes',
  url: 'https://www.icf.cat/ca/prestecs/pimes/icf-autonoms',
  version: 'observed-2026-10-04',
  updatedAt: null,
  language: 'ca',
  jurisdiction: 'ES-CT',
  attribution: 'Institut Català de Finances; adaptació sense aval',
};
const icfEs: PublicPage = {
  ...icfCa,
  url: 'https://www.icf.cat/es/prestecs/pimes/icf-autonoms',
  language: 'es',
  attribution: 'Institut Català de Finances; adaptación sin aval',
};
const socCa: PublicPage = {
  id: 'soc-forma-contracta-2026',
  url: 'https://serveiocupacio.gencat.cat/ca/entitats/subvencions-fpo/programa-forma-i-contracta-2026/preguntes-frequents/index.html',
  version: 'observed-2026-10-04',
  updatedAt: null,
  language: 'ca',
  jurisdiction: 'ES-CT',
  attribution:
    'Servei Públic d’Ocupació de Catalunya, FAQ Forma i Contracta 2026; adaptació sense aval',
};
const socEs: PublicPage = {
  ...socCa,
  url: 'https://serveiocupacio.gencat.cat/es/entitats/subvencions-fpo/programa-forma-i-contracta-2026/preguntes-frequents/index.html',
  language: 'es',
  attribution:
    'Servicio Público de Empleo de Catalunya, FAQ Forma y Contrata 2026; adaptación sin aval',
};
const lcsp: PublicPage = {
  id: 'boe-lcsp',
  url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2017-12902',
  version: '2026-04-09',
  updatedAt: '2026-04-09',
  language: 'es',
  jurisdiction: 'ES',
  attribution: 'BOE, Ley 9/2017, texto consolidado informativo; traducción propia al catalán',
};
const tender: PublicPage = {
  id: 'pscp-pr-2026-359',
  url: 'https://contractaciopublica.cat/ca/detall-publicacio/3bb0e137-3dda-4d30-94de-e7aba5e01dd0/300740349',
  version: 'observed-2026-10-04',
  updatedAt: null,
  language: 'ca',
  jurisdiction: 'ES-CT',
  attribution:
    'PSCP, Departament de la Presidència; extracte públic, sense validar pliegos ni fase posterior',
};

/** Candidate public guidance; no call or tender is offered as open without a fresh official check. */
export const grantsProcurementGuides: Guide[] = [
  guideSchema.parse({
    ...pending,
    id: 'catalunya-youth-fse-2026-closed',
    title: text(
      'Autoocupació juvenil FSE+ 2026: termini de sol·licitud vençut',
      'Autoempleo juvenil FSE+ 2026: plazo de solicitud vencido',
    ),
    domain: 'D-13',
    subtopic: 'youth-self-employment-grant',
    profiles: ['young-self-employed'],
    jurisdiction: 'ES-CT',
    evidence: [
      evidence(
        'youth-id-ca',
        youthCa,
        "Resolució EMT/2615/2026, de 20 de juliol, per la qual s'aprova la convocatòria",
      ),
      evidence(
        'youth-id-es',
        youthEs,
        'Resolución EMT/2615/2026, de 20 de julio, por la que se aprueba la convocatoria',
      ),
      evidence('youth-deadline-ca', youthCa, 'fins al 22 de setembre de 2026, a les 14:00 h'),
      evidence('youth-deadline-es', youthEs, 'hasta el 22 de septiembre de 2026, a las 14:00 h'),
      evidence('youth-eligible-ca', youthCa, 'A joves d’edats compreses entre 18 i 29 anys'),
      evidence('youth-eligible-es', youthEs, 'A jóvenes de edades comprendidos entre 18 y 29 años'),
      evidence(
        'youth-guarantee-ca',
        youthCa,
        "el dia anterior a donar-se d'alta com a treballadors autònoms estiguin inscrits al Programa de Garantia Juvenil",
      ),
      evidence(
        'youth-guarantee-es',
        youthEs,
        'el día anterior a darse de alta como trabajadores autónomos estén inscritos al Programa de Garantía Juvenil',
      ),
      evidence(
        'lgs-compatibility',
        lgs,
        'La normativa reguladora de la subvención determinará el régimen de compatibilidad o incompatibilidad',
      ),
      evidence(
        'lgs-justification',
        lgs,
        'La justificación del cumplimiento de las condiciones impuestas y de la consecución de los objetivos previstos',
      ),
    ],
    conditions: [
      {
        id: '2026-youth-call',
        text: text(
          'La consulta es refereix a la convocatòria EMT/2615/2026 d’autoocupació juvenil, no a una convocatòria nova.',
          'La consulta se refiere a la convocatoria EMT/2615/2026 de autoempleo juvenil, no a una convocatoria nueva.',
        ),
        evidenceIds: ['youth-id-ca', 'youth-id-es'],
        translation: null,
      },
      {
        id: 'youth-profile',
        text: text(
          'La fitxa s’adreça a joves de 18 a 29 anys inscrits a Garantia Juvenil el dia anterior a l’alta autònoma; cal comprovar la resta de requisits de les bases.',
          'La ficha se dirige a jóvenes de 18 a 29 años inscritos en Garantía Juvenil el día anterior al alta de autónomo; hay que comprobar los demás requisitos de las bases.',
        ),
        evidenceIds: [
          'youth-eligible-ca',
          'youth-eligible-es',
          'youth-guarantee-ca',
          'youth-guarantee-es',
        ],
        translation: null,
      },
    ],
    exclusions: [
      {
        id: 'no-new-application',
        text: text(
          'El termini de sol·licitud publicat va acabar el 22 de setembre de 2026 a les 14:00; no s’ofereix com a convocatòria oberta.',
          'El plazo de solicitud publicado terminó el 22 de septiembre de 2026 a las 14:00; no se ofrece como convocatoria abierta.',
        ),
        evidenceIds: ['youth-deadline-ca', 'youth-deadline-es'],
        translation: null,
      },
    ],
    claims: [
      {
        id: 'general-compatibility',
        text: text(
          'La compatibilitat amb altres ajuts depèn de les bases de la subvenció concreta; no es dedueix del nom del programa.',
          'La compatibilidad con otras ayudas depende de las bases de la subvención concreta; no se deduce del nombre del programa.',
        ),
        evidenceIds: ['lgs-compatibility'],
        translation: 'ca',
        kind: 'fact',
        conditionIds: [],
      },
      {
        id: 'specific-justification',
        text: text(
          'La justificació exigeix consultar les bases i l’acte de concessió d’aquesta convocatòria; la fitxa resumida no en fixa aquí la modalitat.',
          'La justificación exige consultar las bases y el acto de concesión de esta convocatoria; la ficha resumida no fija aquí la modalidad.',
        ),
        evidenceIds: ['lgs-justification'],
        translation: 'ca',
        kind: 'fact',
        conditionIds: [],
      },
    ],
    steps: [
      {
        id: 'check-current-call',
        text: text(
          'No iniciïs una sol·licitud nova de la convocatòria 2026; comprova al Departament si hi ha una altra convocatòria vigent.',
          'No inicies una solicitud nueva de la convocatoria 2026; comprueba en el Departament si hay otra convocatoria vigente.',
        ),
        evidenceIds: ['youth-deadline-ca', 'youth-deadline-es'],
        translation: null,
        dependsOn: [],
      },
    ],
  }),
  guideSchema.parse({
    ...pending,
    id: 'catalunya-soc-forma-contracta-2026-closed',
    title: text(
      'SOC Forma i Contracta 2026: formació, no alta autònoma',
      'SOC Forma y Contrata 2026: formación, no alta de autónomo',
    ),
    domain: 'D-13',
    subtopic: 'soc-training-grant',
    profiles: ['training-provider-or-employer'],
    jurisdiction: 'ES-CT',
    evidence: [
      evidence('soc-id-ca', socCa, 'Resolució EMT/3044/2026'),
      evidence('soc-id-es', socEs, 'Resolución EMT/3044/2026'),
      evidence(
        'soc-purpose-ca',
        socCa,
        'Se sol·licita una subvenció per a la formació de treballadors',
      ),
      evidence(
        'soc-purpose-es',
        socEs,
        'Se solicita una subvención para la formación de trabajadores',
      ),
      evidence('soc-deadline-es', socEs, 'hasta las 15:00 horas del 30 de septiembre de 2026'),
      evidence('soc-execution-es', socEs, 'Ejecución: hasta el 30 de noviembre de 2027'),
      evidence(
        'soc-justification-es',
        socEs,
        'Justificación: los plazos y las condiciones que establecen las bases 21 y 10.1',
      ),
    ],
    conditions: [
      {
        id: 'soc-specific-call',
        text: text(
          'Es tracta de la convocatòria SOC Forma i Contracta 2026, EMT/3044/2026.',
          'Se trata de la convocatoria SOC Forma y Contrata 2026, EMT/3044/2026.',
        ),
        evidenceIds: ['soc-id-ca', 'soc-id-es'],
        translation: null,
      },
    ],
    exclusions: [
      {
        id: 'soc-not-self-employment',
        text: text(
          'Finança formació de treballadors; no és una subvenció per donar-se d’alta com a autònom.',
          'Financia formación de trabajadores; no es una subvención por darse de alta como autónomo.',
        ),
        evidenceIds: ['soc-purpose-ca', 'soc-purpose-es'],
        translation: null,
      },
      {
        id: 'soc-application-closed',
        text: text(
          'La sol·licitud 2026 va acabar el 30 de setembre de 2026 a les 15:00; l’execució segueix un calendari diferent.',
          'La solicitud 2026 terminó el 30 de septiembre de 2026 a las 15:00; la ejecución sigue un calendario distinto.',
        ),
        evidenceIds: ['soc-deadline-es', 'soc-execution-es'],
        translation: 'ca',
      },
    ],
    claims: [],
    steps: [
      {
        id: 'soc-check-bases',
        text: text(
          'Si ja hi participes, comprova les bases 21 i 10.1 per a la justificació; no dedueixis compatibilitat ni drets individuals de la FAQ.',
          'Si ya participas, comprueba las bases 21 y 10.1 para la justificación; no deduzcas compatibilidad ni derechos individuales de la FAQ.',
        ),
        evidenceIds: ['soc-justification-es'],
        translation: 'ca',
        dependsOn: [],
      },
    ],
  }),
  guideSchema.parse({
    ...pending,
    id: 'catalunya-icf-autonoms-pimes',
    title: text('Préstec ICF Autònoms i Pimes', 'Préstamo ICF Autónomos y Pymes'),
    domain: 'D-13',
    subtopic: 'public-financing-loan',
    profiles: ['self-employed-financing'],
    jurisdiction: 'ES-CT',
    evidence: [
      evidence('icf-product-ca', icfCa, "préstecs de l'ICF per autònoms i pimes"),
      evidence('icf-product-es', icfEs, 'préstamos del ICF para autónomos y pymes'),
      evidence(
        'icf-profile-ca',
        icfCa,
        'persones treballadores per compte propi i pimes amb seu social o operativa a Catalunya',
      ),
      evidence(
        'icf-profile-es',
        icfEs,
        'personas trabajadoras por cuenta propia y pymes con sede social u operativa en Cataluña',
      ),
      evidence('icf-terms-ca', icfCa, 'A determinar segons projecte i termini.'),
      evidence('icf-terms-es', icfEs, 'A determinar en función del proyecto y plazo.'),
    ],
    conditions: [
      {
        id: 'icf-profile',
        text: text(
          'El producte s’adreça a persones autònomes i pimes amb seu social o operativa a Catalunya que necessiten finançament.',
          'El producto se dirige a autónomos y pymes con sede social u operativa en Cataluña que necesitan financiación.',
        ),
        evidenceIds: ['icf-profile-ca', 'icf-profile-es'],
        translation: null,
      },
    ],
    exclusions: [
      {
        id: 'loan-not-grant',
        text: text(
          'És un préstec, no una subvenció a fons perdut ni una aprovació creditícia automàtica.',
          'Es un préstamo, no una subvención a fondo perdido ni una aprobación crediticia automática.',
        ),
        evidenceIds: ['icf-product-ca', 'icf-product-es'],
        translation: null,
      },
    ],
    claims: [],
    steps: [
      {
        id: 'check-current-terms',
        text: text(
          'Consulta al mateix ICF la disponibilitat, les condicions del projecte, les garanties i la compatibilitat abans de demanar-lo.',
          'Consulta al propio ICF la disponibilidad, las condiciones del proyecto, las garantías y la compatibilidad antes de solicitarlo.',
        ),
        evidenceIds: ['icf-terms-ca', 'icf-terms-es'],
        translation: null,
        dependsOn: [],
      },
    ],
  }),
  guideSchema.parse({
    ...pending,
    id: 'catalunya-procurement-pr-2026-359',
    title: text(
      'Licitació PR-2026-359: termini vençut i solvència per verificar',
      'Licitación PR-2026-359: plazo vencido y solvencia por verificar',
    ),
    domain: 'D-15',
    subtopic: 'public-tender-participation',
    profiles: ['self-employed-public-supplier'],
    jurisdiction: 'ES-CT',
    evidence: [
      evidence(
        'lcsp-capacity',
        lcsp,
        'Solo podrán contratar con el sector público las personas naturales o jurídicas',
      ),
      evidence(
        'lcsp-pliego',
        lcsp,
        'En los pliegos de cláusulas administrativas particulares se incluirán los criterios de solvencia y adjudicación del contrato',
      ),
      evidence('tender-id', tender, 'PR-2026-359'),
      evidence('tender-deadline', tender, '04/05/2026 12:00:00'),
    ],
    conditions: [
      {
        id: 'specific-tender',
        text: text(
          'L’exemple concret és l’expedient PR-2026-359 del Departament de la Presidència.',
          'El ejemplo concreto es el expediente PR-2026-359 del Departament de la Presidència.',
        ),
        evidenceIds: ['tender-id'],
        translation: 'es',
      },
    ],
    exclusions: [
      {
        id: 'tender-deadline-passed',
        text: text(
          'El termini publicat per presentar ofertes a PR-2026-359 era el 4 de maig de 2026 a les 12:00; no és una oferta oberta.',
          'El plazo publicado para presentar ofertas a PR-2026-359 era el 4 de mayo de 2026 a las 12:00; no es una oferta abierta.',
        ),
        evidenceIds: ['tender-deadline'],
        translation: 'es',
      },
    ],
    claims: [
      {
        id: 'natural-person-possible',
        text: text(
          'La persona física pot licitar si compleix capacitat, absència de prohibicions i solvència exigida; l’alta autònoma no acredita per si sola l’aptitud.',
          'La persona física puede licitar si cumple capacidad, ausencia de prohibiciones y solvencia exigida; el alta de autónomo no acredita por sí sola la aptitud.',
        ),
        evidenceIds: ['lcsp-capacity'],
        translation: 'ca',
        kind: 'fact',
        conditionIds: [],
      },
    ],
    steps: [
      {
        id: 'read-current-tender',
        text: text(
          'Per a una licitació vigent, llegeix l’anunci i el PCAP del mateix expedient abans de calcular terminis o solvència; comprova les rectificacions.',
          'Para una licitación vigente, lee el anuncio y el PCAP del mismo expediente antes de calcular plazos o solvencia; comprueba las rectificaciones.',
        ),
        evidenceIds: ['lcsp-pliego', 'tender-deadline'],
        translation: 'ca',
        dependsOn: [],
      },
    ],
  }),
];

export const grantsProcurementCoverage = [
  {
    guideId: grantsProcurementGuides[0]!.id,
    gap: text(
      'Compatibilitat i justificació de la convocatòria 2026 pendents de llegir en bases i resolució; cap sol·licitud nova.',
      'Compatibilidad y justificación de la convocatoria 2026 pendientes de comprobar en bases y resolución; ninguna solicitud nueva.',
    ),
  },
  {
    guideId: grantsProcurementGuides[1]!.id,
    gap: text(
      'Bases i resolució SOC 2026 pendents de cotejar per compatibilitat i justificació; sol·licituds tancades.',
      'Bases y resolución SOC 2026 pendientes de cotejar para compatibilidad y justificación; solicitudes cerradas.',
    ),
  },
  {
    guideId: grantsProcurementGuides[2]!.id,
    gap: text(
      'Disponibilitat, concessió i compatibilitat del préstec no confirmades; cap dada financera personal fora del navegador.',
      'Disponibilidad, concesión y compatibilidad del préstamo sin confirmar; ningún dato financiero personal fuera del navegador.',
    ),
  },
  {
    guideId: grantsProcurementGuides[3]!.id,
    gap: text(
      'Fase actual i PCAP/PPT de PR-2026-359 no verificats en sessió accessible; cap solvència individual inferida.',
      'Fase actual y PCAP/PPT de PR-2026-359 no verificados en sesión accesible; ninguna solvencia individual inferida.',
    ),
  },
];
