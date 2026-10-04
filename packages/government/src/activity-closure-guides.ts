import { guideSchema, type Guide } from '@reforma-digital/core';

type Pair = Guide['title'];
type Evidence = Guide['evidence'][number];
const observedAt = '2026-10-04';
const pair = (ca: string, es: string): Pair => ({ ca, es });

function evidence(
  id: string,
  sourceId: string,
  url: string,
  quote: string,
  language: 'ca' | 'es',
  jurisdiction: 'ES' | 'ES-CT' = 'ES',
): Evidence {
  return {
    id,
    sourceId,
    url,
    originalUrl: url,
    version: `observation-${observedAt}`,
    language,
    attribution: `${sourceId}; síntesis propia sin aval del organismo`,
    sourceUpdatedAt: null,
    applicableFrom: observedAt,
    applicableUntil: null,
    informative: true,
    jurisdiction,
    quote,
  };
}

const aeatChange = evidence(
  'aeat-census-change',
  'aeat',
  'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores/preguntas-frecuentes-modelos-036-037/modificaciones-censales/datos-relativos-actividades-economicas-locales.html',
  'se cumplimentará en la declaración censal, modelo 036, la modificación de datos relativos a actividades y locales',
  'es',
);
const tgssChange = evidence(
  'tgss-autonomous-change',
  'seg-social',
  'https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/Trabajo%2BAutonomo/guia?1dmy=&urile=wcm%3Apath%3A%2Fwps%2Fwcm%2Fconnect%2Fimportass%2Fimportass_contenidos%2Fcolectivos%2Ftrabajo+autonomo%2Fguia',
  'Si quieres actualizar tu domicilio de actividad debes comunicarlo desde el servicio de tu área personal.',
  'es',
);
const correction = evidence(
  'boe-request-correction',
  'boe',
  'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a68',
  'se requerirá al interesado para que, en un plazo de diez días, subsane la falta',
  'es',
);
const notification = evidence(
  'boe-notification-remedies',
  'boe',
  'https://www.boe.es/buscar/act.php?id=BOE-A-2015-10565#a40',
  'la expresión de los recursos que procedan, en su caso, en vía administrativa y judicial',
  'es',
);
const aeatPartial = evidence(
  'aeat-partial-cessation',
  'aeat',
  'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores/preguntas-frecuentes-modelos-036-037/modificaciones-censales/dejar-ejercer-todas-actividades-empresariales-profesionales.html',
  'mediante la presentación de una declaración censal (modelo 036) de modificación',
  'es',
);
const aeatPartialRemain = evidence(
  'aeat-remaining-activities',
  'aeat',
  aeatPartial.url,
  'manteniendo las restantes actividades en ejercicio y las obligaciones tributarias derivadas',
  'es',
);
const tgssPartial = evidence(
  'tgss-partial-cessation',
  'seg-social',
  tgssChange.url,
  'Esto no supondrá tu baja en el Régimen Especial de Trabajadores Autónomos',
  'es',
);
const aeatFull = evidence(
  'aeat-full-cessation',
  'aeat',
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/guia-practica-cumplimentacion-modelo-censal-036/capitulo-01-cuestiones-generales/causas-presentacion-obligados-declarar/baja-modelo-036.html',
  'cesa en el desarrollo de todo tipo de actividades empresariales o profesionales',
  'es',
);
const aeatFullModel = evidence('aeat-full-model', 'aeat', aeatFull.url, 'Baja [Modelo 036]', 'es');
const tgssFull = evidence(
  'tgss-full-cessation',
  'seg-social',
  tgssChange.url,
  'Si vas a finalizar tu actividad por cuenta propia tendrás que comunicar tu baja a la Seguridad Social',
  'es',
);
const closure = evidence(
  'canal-empresa-closure',
  'canal-empresa-fue',
  'https://canalempresa.gencat.cat/ca/01_que_voleu_fer/04_canvis_i_tancament/proces-de-tancament/',
  "ha de comunicar la baixa de l'empresa a tots els registres administratius i declaracions censals",
  'ca',
  'ES-CT',
);
const employees = evidence(
  'tgss-employee-cessation',
  'seg-social',
  'https://www.seg-social.es/wps/portal/wss/internet/InformacionUtil/44539/44113/44136?changeLanguage=es',
  'Está obligado el empresario a solicitar el alta, la baja y a comunicar las variaciones de datos de todos sus trabajadores.',
  'es',
);
const employmentCertificate = evidence(
  'sepe-employment-certificate',
  'sepe',
  'https://www.sepe.es/HomeSepe/empresas/certificados',
  'Certificado de Empresa',
  'es',
);
const aid = evidence(
  'boe-grant-records',
  'boe',
  'https://www.boe.es/buscar/act.php?id=BOE-A-2003-20977#a14',
  'Conservar los documentos justificativos de la aplicación de los fondos recibidos',
  'es',
);
const aidJustification = evidence(
  'boe-grant-justification',
  'boe',
  aid.url,
  'Justificar ante el órgano concedente o la entidad colaboradora',
  'es',
);
const aidRecovery = evidence(
  'boe-grant-recovery',
  'boe',
  aid.url,
  'Proceder al reintegro de los fondos percibidos en los supuestos contemplados en el artículo 37',
  'es',
);
const finalReturns = evidence(
  'aeat-final-returns',
  'aeat',
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/guia-practica-cumplimentacion-modelo-censal-036/capitulo-01-cuestiones-generales/causas-presentacion-obligados-declarar/baja-modelo-036/casilla-152-fecha-efectiva-baja_.html',
  'sin perjuicio de la presentación de las declaraciones que correspondan al período en el que se produce el cese',
  'es',
);
const keepInvoices = evidence(
  'aeat-keep-invoices',
  'aeat',
  'https://sede.agenciatributaria.gob.es/Sede/iva/facturacion-registro/facturacion-iva/obligacion-conservar-facturas.html',
  'conservar las facturas y justificantes que tengan relación con sus obligaciones tributarias',
  'es',
);

type Entry = {
  id: string;
  domain: 'D-17' | 'D-18';
  profiles: string[];
  title: Pair;
  condition: Pair;
  exclusion: Pair;
  action: Pair;
  evidence: Evidence[];
  question: Pair;
  unknown: Pair;
  fact?: string;
};

const entries: Entry[] = [
  {
    id: 'change-tax-census',
    domain: 'D-17',
    profiles: ['general', 'multi-activity', 'physical-shop'],
    title: pair('Canviar dades censals', 'Modificar datos censales'),
    condition: pair(
      'Si canvien les dades fiscals de l’activitat o del local.',
      'Si cambian los datos fiscales de la actividad o del local.',
    ),
    exclusion: pair(
      'No tracta els canvis comunicats només a la Seguretat Social.',
      'No cubre los cambios comunicados solo a la Seguridad Social.',
    ),
    action: pair(
      'Revisa la modificació del model 036 de l’AEAT per a les dades afectades.',
      'Revisa la modificación del modelo 036 de la AEAT para los datos afectados.',
    ),
    evidence: [aeatChange],
    question: pair(
      'He canviat les dades de l’activitat o local declarades a Hisenda. Què reviso?',
      'He cambiado datos de actividad o local declarados a Hacienda. ¿Qué reviso?',
    ),
    unknown: pair(
      'Quin termini exacte tinc per a un canvi censal sense indicar la data ni el tipus de canvi?',
      '¿Qué plazo exacto tengo para un cambio censal sin indicar la fecha ni el tipo de cambio?',
    ),
    fact: '036',
  },
  {
    id: 'change-tgss-activity',
    domain: 'D-17',
    profiles: ['general', 'multi-activity', 'physical-shop'],
    title: pair(
      'Canviar dades d’activitat a Importass',
      'Modificar datos de actividad en Importass',
    ),
    condition: pair(
      'Si canvia una dada de l’activitat comunicada a la TGSS.',
      'Si cambia un dato de la actividad comunicada a la TGSS.',
    ),
    exclusion: pair(
      'No substitueix una modificació censal davant l’AEAT.',
      'No sustituye una modificación censal ante la AEAT.',
    ),
    action: pair(
      'Comprova les activitats i modifica la dada que correspongui a Importass.',
      'Comprueba las actividades y modifica el dato que corresponda en Importass.',
    ),
    evidence: [tgssChange],
    question: pair(
      'He canviat el domicili de l’activitat davant la TGSS. On ho reviso?',
      'He cambiado el domicilio de actividad ante la TGSS. ¿Dónde lo reviso?',
    ),
    unknown: pair(
      'Quina quota exacta tindré després del canvi sense conèixer la meva base?',
      '¿Qué cuota exacta tendré tras el cambio sin conocer mi base?',
    ),
  },
  {
    id: 'respond-correction-request',
    domain: 'D-17',
    profiles: ['general', 'aid-recipient'],
    title: pair('Atendre un requeriment d’esmena', 'Atender un requerimiento de subsanación'),
    condition: pair(
      'Si reps un requeriment relatiu a una sol·licitud presentada.',
      'Si recibes un requerimiento relativo a una solicitud presentada.',
    ),
    exclusion: pair(
      'No assumeix que qualsevol incidència és una esmena ni calcula el termini individual.',
      'No presupone que toda incidencia sea subsanación ni calcula el plazo individual.',
    ),
    action: pair(
      'Identifica l’organisme, l’expedient, el document requerit i la notificació abans d’aportar-lo pel canal indicat.',
      'Identifica el organismo, el expediente, el documento requerido y la notificación antes de aportarlo por el canal indicado.',
    ),
    evidence: [correction],
    question: pair(
      'He rebut un requeriment d’esmena. Què he de comprovar abans de respondre?',
      'He recibido un requerimiento de subsanación. ¿Qué compruebo antes de responder?',
    ),
    unknown: pair(
      'Quin dia venç la meva esmena si no tinc la notificació?',
      '¿Qué día vence mi subsanación si no tengo la notificación?',
    ),
  },
  {
    id: 'identify-appeal',
    domain: 'D-17',
    profiles: ['general', 'aid-recipient', 'physical-shop'],
    title: pair('Identificar un acte recurrible', 'Identificar un acto recurrible'),
    condition: pair(
      'Si hi ha una resolució o un altre acte administratiu notificat.',
      'Si hay una resolución u otro acto administrativo notificado.',
    ),
    exclusion: pair(
      'Sense organisme, acte i data de notificació no es determina el recurs ni el seu venciment.',
      'Sin organismo, acto y fecha de notificación no se determina el recurso ni su vencimiento.',
    ),
    action: pair(
      'Llegeix l’acte complet, l’organisme i la data de notificació; comprova els recursos indicats abans de triar una via.',
      'Lee el acto completo, el organismo y la fecha de notificación; comprueba los recursos indicados antes de elegir una vía.',
    ),
    evidence: [notification],
    question: pair(
      'Tinc una resolució notificada. Quines dades calen abans de parlar del recurs?',
      'Tengo una resolución notificada. ¿Qué datos hacen falta antes de hablar del recurso?',
    ),
    unknown: pair(
      'Quan venç el meu recurs sense dir quin organisme, acte o data de notificació?',
      '¿Cuándo vence mi recurso sin indicar organismo, acto ni fecha de notificación?',
    ),
  },
  {
    id: 'stop-one-activity',
    domain: 'D-18',
    profiles: ['multi-activity'],
    title: pair('Cessar només una activitat', 'Cesar solo una actividad'),
    condition: pair(
      'Si deixes una activitat però en mantens una altra.',
      'Si dejas una actividad pero mantienes otra.',
    ),
    exclusion: pair(
      'La baixa censal total i la baixa al RETA no es dedueixen d’aquest cessament parcial.',
      'La baja censal total y la baja en RETA no se deducen de este cese parcial.',
    ),
    action: pair(
      'Revisa la modificació censal 036 a l’AEAT i comunica la fi d’aquella activitat a la TGSS sense donar per acabades les altres.',
      'Revisa la modificación censal 036 en AEAT y comunica el fin de esa actividad a TGSS sin dar por terminadas las demás.',
    ),
    evidence: [aeatPartial, aeatPartialRemain, tgssPartial],
    question: pair(
      'Tanco una de dues activitats autònomes. He de donar-me de baixa del tot?',
      'Cierro una de dos actividades autónomas. ¿Debo darme de baja por completo?',
    ),
    unknown: pair(
      'Quin import exacte de quota pagaré després de deixar una activitat?',
      '¿Qué importe exacto de cuota pagaré tras dejar una actividad?',
    ),
    fact: '036',
  },
  {
    id: 'stop-all-activities',
    domain: 'D-18',
    profiles: ['general', 'multi-activity'],
    title: pair('Cessar totes les activitats', 'Cesar todas las actividades'),
    condition: pair(
      'Si una persona física cessa totes les seves activitats per compte propi.',
      'Si una persona física cesa todas sus actividades por cuenta propia.',
    ),
    exclusion: pair(
      'No és una baixa automàtica de registres sectorials, ajuntament, contractes ni ajuts.',
      'No es una baja automática de registros sectoriales, ayuntamiento, contratos ni ayudas.',
    ),
    action: pair(
      'Revisa la baixa censal 036 a l’AEAT i, separadament, la baixa de treball autònom a Importass.',
      'Revisa la baja censal 036 en AEAT y, por separado, la baja de trabajo autónomo en Importass.',
    ),
    evidence: [aeatFull, aeatFullModel, tgssFull, closure],
    question: pair(
      'Deixo completament l’activitat autònoma. Quines baixes bàsiques he de distingir?',
      'Dejo por completo la actividad autónoma. ¿Qué bajas básicas debo distinguir?',
    ),
    unknown: pair(
      'Quins registres sectorials concrets he de cancel·lar sense indicar l’activitat?',
      '¿Qué registros sectoriales concretos debo cancelar sin indicar la actividad?',
    ),
    fact: '036',
  },
  {
    id: 'close-physical-establishment',
    domain: 'D-18',
    profiles: ['physical-shop'],
    title: pair('Tancar un local o establiment', 'Cerrar un local o establecimiento'),
    condition: pair(
      'Si l’activitat tenia un local, títol o registre administratiu propi.',
      'Si la actividad tenía un local, título o registro administrativo propio.',
    ),
    exclusion: pair(
      'El tràmit municipal o sectorial concret depèn de l’activitat i el municipi; no es dedueix de la baixa fiscal.',
      'El trámite municipal o sectorial concreto depende de la actividad y el municipio; no se deduce de la baja fiscal.',
    ),
    action: pair(
      'Inventaria els registres i títols d’inici i consulta el cessament amb cada organisme competent.',
      'Inventaría los registros y títulos del inicio y consulta el cese con cada organismo competente.',
    ),
    evidence: [closure],
    question: pair(
      'Tanco el meu local a Catalunya. Com detecto les comunicacions pendents?',
      'Cierro mi local en Catalunya. ¿Cómo detecto las comunicaciones pendientes?',
    ),
    unknown: pair(
      'Quin formulari municipal exacte correspon al meu local sense activitat ni adreça?',
      '¿Qué formulario municipal exacto corresponde a mi local sin actividad ni dirección?',
    ),
  },
  {
    id: 'close-with-employees',
    domain: 'D-18',
    profiles: ['employer'],
    title: pair('Cessar amb persones contractades', 'Cesar con personas contratadas'),
    condition: pair(
      'Si hi ha persones treballadores amb contracte vigent.',
      'Si hay personas trabajadoras con contrato vigente.',
    ),
    exclusion: pair(
      'La baixa pròpia al RETA no extingeix contractes ni tramita les baixes de plantilla.',
      'La baja propia en RETA no extingue contratos ni tramita las bajas de plantilla.',
    ),
    action: pair(
      'Revisa cada contracte i la seva causa d’extinció; tramita per separat les baixes laborals davant la TGSS i el certificat que pertoqui davant el SEPE.',
      'Revisa cada contrato y su causa de extinción; tramita por separado las bajas laborales ante TGSS y el certificado que corresponda ante SEPE.',
    ),
    evidence: [employees, employmentCertificate, closure],
    question: pair(
      'Cesso com a autònom i tinc personal contractat. La meva baixa resol els contractes?',
      'Ceso como autónomo y tengo personal contratado. ¿Mi baja resuelve los contratos?',
    ),
    unknown: pair(
      'Quina indemnització exacta correspon a tota la plantilla sense conèixer contractes ni causa?',
      '¿Qué indemnización exacta corresponde a toda la plantilla sin conocer contratos ni causa?',
    ),
  },
  {
    id: 'close-with-grant',
    domain: 'D-18',
    profiles: ['aid-recipient'],
    title: pair('Cessar amb un ajut concedit', 'Cesar con una ayuda concedida'),
    condition: pair(
      'Si hi ha una subvenció concedida o cobrada vinculada a l’activitat.',
      'Si hay una subvención concedida o cobrada vinculada a la actividad.',
    ),
    exclusion: pair(
      'La baixa d’activitat no elimina per si sola la justificació, conservació o possible reintegrament.',
      'La baja de actividad no elimina por sí sola la justificación, conservación o posible reintegro.',
    ),
    action: pair(
      'Identifica l’òrgan concedent, la convocatòria i la resolució; revisa les obligacions de justificació i conserva els justificants.',
      'Identifica el órgano concedente, la convocatoria y la resolución; revisa las obligaciones de justificación y conserva los justificantes.',
    ),
    evidence: [aid, aidJustification, aidRecovery],
    question: pair(
      'Tanco després de rebre una subvenció. Què he de revisar?',
      'Cierro tras recibir una subvención. ¿Qué debo revisar?',
    ),
    unknown: pair(
      'He de reintegrar exactament l’ajut sense indicar convocatòria ni resolució?',
      '¿Debo reintegrar exactamente la ayuda sin indicar convocatoria ni resolución?',
    ),
  },
  {
    id: 'file-final-tax-returns',
    domain: 'D-18',
    profiles: ['general', 'multi-activity'],
    title: pair(
      'Revisar declaracions del període de cessament',
      'Revisar declaraciones del período de cese',
    ),
    condition: pair(
      'Si s’ha produït un cessament fiscal total.',
      'Si se ha producido un cese fiscal total.',
    ),
    exclusion: pair(
      'La baixa censal no determina per si sola els models ni els imports finals.',
      'La baja censal no determina por sí sola los modelos ni importes finales.',
    ),
    action: pair(
      'Revisa les declaracions que corresponguin al període en què cessa l’activitat.',
      'Revisa las declaraciones que correspondan al período en que cesa la actividad.',
    ),
    evidence: [finalReturns],
    question: pair(
      'Després de la baixa censal, he de revisar declaracions del període de cessament?',
      'Tras la baja censal, ¿debo revisar declaraciones del período de cese?',
    ),
    unknown: pair(
      'Quin import exacte em sortirà a l’última declaració sense dades comptables?',
      '¿Qué importe exacto saldrá en mi última declaración sin datos contables?',
    ),
  },
  {
    id: 'retain-tax-invoices',
    domain: 'D-18',
    profiles: ['general', 'physical-shop'],
    title: pair('Conservar factures després del cessament', 'Conservar facturas tras el cese'),
    condition: pair(
      'Si tens factures i justificants relacionats amb obligacions tributàries.',
      'Si tienes facturas y justificantes relacionados con obligaciones tributarias.',
    ),
    exclusion: pair(
      'El termini de conservació concret pot variar per regularitzacions o altres normes.',
      'El plazo concreto de conservación puede variar por regularizaciones u otras normas.',
    ),
    action: pair(
      'Conserva les factures i justificants tributaris després del cessament i consulta el termini aplicable al teu cas.',
      'Conserva las facturas y justificantes tributarios después del cese y consulta el plazo aplicable a tu caso.',
    ),
    evidence: [keepInvoices],
    question: pair(
      'Puc destruir les factures tributàries quan em dono de baixa?',
      '¿Puedo destruir las facturas tributarias al darme de baja?',
    ),
    unknown: pair(
      'Quin dia exacte puc destruir totes les factures sense saber-ne les dates ni operacions?',
      '¿Qué día exacto puedo destruir todas las facturas sin conocer fechas ni operaciones?',
    ),
  },
];

export const activityClosureQuestions = entries.map(
  ({ id, profiles, question, unknown, fact }) => ({
    id,
    profiles,
    question,
    unknown,
    fact,
  }),
);

/** Candidate knowledge only: source rights, applicability and T-004 still require automatic checks. */
export const activityClosureGuides: Guide[] = entries.map((entry) => {
  const evidenceIds = entry.evidence.map((item) => item.id);
  const translated = entry.evidence[0]!.language === 'ca' ? 'es' : 'ca';
  return guideSchema.parse({
    id: entry.id,
    revision: 1,
    title: entry.title,
    domain: entry.domain,
    subtopic: entry.id,
    profiles: entry.profiles,
    jurisdiction: 'ES-CT',
    consultedAt: observedAt,
    period: { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence: entry.evidence,
    conditions: [{ id: 'case', text: entry.condition, evidenceIds, translation: translated }],
    exclusions: [{ id: 'limit', text: entry.exclusion, evidenceIds, translation: translated }],
    claims: [],
    steps: [
      { id: 'check', text: entry.action, evidenceIds, translation: translated, dependsOn: [] },
    ],
  });
});
