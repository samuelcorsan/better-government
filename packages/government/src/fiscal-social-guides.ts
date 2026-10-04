import { guideSchema, type Guide } from '@reforma-digital/core';

const checkedAt = '2026-10-04';
type Pair = Guide['title'];
type Evidence = Guide['evidence'][number];
type Card = {
  id: string;
  domain: 'D-03' | 'D-04';
  subtopic: string;
  profiles: string[];
  title: Pair;
  condition: Pair;
  fact: Pair;
  kind?: 'fact' | 'obligation';
  step: Pair;
  exclusion: Pair;
  evidence: Evidence;
  additionalEvidence?: Evidence[];
  periodFrom?: string;
  periodUntil?: string;
};

const aeat = 'Agencia Estatal de Administración Tributaria';
const tgss = 'Tesorería General de la Seguridad Social';
const boe = 'Agencia Estatal Boletín Oficial del Estado';
const observed = 'observed-2026-10-04';
const aeatCensus =
  'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores.html';
const aeatActivities =
  'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/guia-practica-cumplimentacion-modelo-censal-036/capitulo-04-actividades-economicas-locales/aspectos-generales-modelo-presentacion-declaracion/obligados-declarar-actividades-economicas-modelo-036.html';
const aeatFaq =
  'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores/preguntas-frecuentes-modelos-036-037.html';
const tgssReta =
  'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10548/32825';
const tgssRates =
  'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10724/1320/1322?changeLanguage=es';
const lgss = 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724';
const retaRules = 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-4447';

function citation(
  id: string,
  sourceId: string,
  url: string,
  quote: string,
  attribution: string,
  applicableFrom = checkedAt,
  originalUrl = url,
  version = observed,
  informative = true,
): Evidence {
  return {
    id,
    sourceId,
    url,
    originalUrl,
    version,
    language: 'es',
    attribution,
    sourceUpdatedAt: null,
    applicableFrom,
    applicableUntil: null,
    informative,
    jurisdiction: 'ES',
    quote,
  };
}

const cards: Card[] = [
  {
    id: 'fiscal-036-vigente',
    domain: 'D-03',
    subtopic: 'alta-censal',
    profiles: ['persona-fisica', 'sociedad'],
    title: { ca: 'Model censal vigent', es: 'Modelo censal vigente' },
    condition: {
      ca: 'Si has de presentar una declaració censal.',
      es: 'Si debes presentar una declaración censal.',
    },
    fact: {
      ca: 'El model 037 va quedar suprimit; comprova el 036.',
      es: 'El modelo 037 quedó suprimido; comprueba el 036.',
    },
    step: {
      ca: 'Consulta el procediment vigent del model 036 abans de presentar res.',
      es: 'Consulta el procedimiento vigente del modelo 036 antes de presentar nada.',
    },
    exclusion: {
      ca: 'El model 037 suprimit no és una via d’alta actual.',
      es: 'El modelo 037 suprimido no es una vía de alta actual.',
    },
    evidence: citation(
      'boe-037',
      'boe',
      'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-410',
      'esta orden suprime el modelo 037 de Declaración censal simplificada',
      boe,
      '2025-02-03',
      'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-410',
      'BOE-A-2025-410@2025-01-09',
      false,
    ),
    periodFrom: '2025-02-03',
    additionalEvidence: [
      citation(
        'boe-036',
        'boe',
        'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-410',
        'pueda ofrecerse a los contribuyentes a través del propio modelo 036',
        boe,
        '2025-02-03',
        'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-410',
        'BOE-A-2025-410@2025-01-09',
        false,
      ),
    ],
  },
  {
    id: 'fiscal-censos-web',
    domain: 'D-03',
    subtopic: 'alta-censal',
    profiles: ['persona-fisica'],
    title: { ca: 'Alta inicial amb Censos WEB', es: 'Alta inicial con Censos WEB' },
    condition: {
      ca: 'Si ets persona física i inicies la primera activitat.',
      es: 'Si eres persona física e inicias la primera actividad.',
    },
    fact: {
      ca: 'Censos WEB ajuda a presentar el 036 d’alta inicial.',
      es: 'Censos WEB ayuda a presentar el 036 de alta inicial.',
    },
    step: {
      ca: 'Obre Censos WEB des de la fitxa pública de l’AEAT i comprova les dades abans de tramitar.',
      es: 'Abre Censos WEB desde la ficha pública de la AEAT y comprueba los datos antes de tramitar.',
    },
    exclusion: {
      ca: 'Aquesta via d’alta inicial no s’estén a les societats.',
      es: 'Esta vía de alta inicial no se extiende a las sociedades.',
    },
    evidence: citation(
      'aeat-censos-web',
      'aeat',
      aeatCensus,
      'modelo 036 de alta inicial en el censo de empresarios profesionales y retenedores',
      aeat,
    ),
  },
  {
    id: 'fiscal-pae-sin-duplicar',
    domain: 'D-03',
    subtopic: 'canal-integrado',
    profiles: ['persona-fisica', 'sociedad'],
    title: { ca: 'Comprova el resultat del PAE', es: 'Comprueba el resultado del PAE' },
    condition: {
      ca: 'Si el PAE ha tramitat el DUE per a la teva alta.',
      es: 'Si el PAE ha tramitado el DUE para tu alta.',
    },
    fact: {
      ca: 'El DUE pot substituir la declaració censal que correspongui.',
      es: 'El DUE puede sustituir la declaración censal correspondiente.',
    },
    step: {
      ca: 'Comprova el justificant i l’estat a l’AEAT abans de presentar una alta separada.',
      es: 'Comprueba el justificante y el estado en la AEAT antes de presentar un alta separada.',
    },
    exclusion: {
      ca: 'No pressuposis que el DUE s’ha registrat sense comprovar-ne el resultat.',
      es: 'No presupongas que el DUE se ha registrado sin comprobar su resultado.',
    },
    evidence: citation(
      'aeat-due',
      'aeat',
      aeatFaq,
      'Podrán sustituirse las declaraciones censales por el Documento Único Electrónico',
      aeat,
    ),
  },
  {
    id: 'fiscal-actividades-locales',
    domain: 'D-03',
    subtopic: 'actividades-locales',
    profiles: ['persona-fisica', 'sociedad'],
    title: { ca: 'Activitats i locals al cens', es: 'Actividades y locales en el censo' },
    condition: {
      ca: 'Si desenvolupes una o més activitats o tens locals afectes.',
      es: 'Si desarrollas una o más actividades o tienes locales afectos.',
    },
    fact: {
      ca: 'La declaració censal ha de reflectir totes les activitats i els locals que corresponguin.',
      es: 'La declaración censal debe reflejar todas las actividades y los locales que correspondan.',
    },
    kind: 'obligation',
    step: {
      ca: 'Enumera activitats i locals i contrasta’n la codificació amb l’eina oficial de l’AEAT.',
      es: 'Enumera actividades y locales y contrasta su codificación con la herramienta oficial de la AEAT.',
    },
    exclusion: {
      ca: 'Aquesta fitxa no determina l’epígraf d’una activitat no descrita.',
      es: 'Esta ficha no determina el epígrafe de una actividad no descrita.',
    },
    evidence: citation(
      'aeat-actividades',
      'aeat',
      aeatActivities,
      'deben declarar todas las actividades económicas que desarrollen',
      aeat,
    ),
    additionalEvidence: [
      citation(
        'aeat-locales',
        'aeat',
        aeatActivities,
        'la relación de los establecimientos o locales en los que las lleven a cabo',
        aeat,
      ),
    ],
  },
  {
    id: 'fiscal-modelos-por-actividad',
    domain: 'D-03',
    subtopic: 'modelos-tributarios',
    profiles: ['persona-fisica', 'sociedad'],
    title: { ca: 'Models segons l’activitat', es: 'Modelos según la actividad' },
    condition: {
      ca: 'Si necessites saber quines obligacions corresponen a l’activitat.',
      es: 'Si necesitas saber qué obligaciones corresponden a la actividad.',
    },
    fact: {
      ca: 'L’AEAT ofereix un cercador d’activitats i obligacions tributàries.',
      es: 'La AEAT ofrece un buscador de actividades y obligaciones tributarias.',
    },
    step: {
      ca: 'Consulta el cercador oficial i verifica el resultat segons la forma jurídica i l’activitat; no seleccionis un règim per defecte.',
      es: 'Consulta el buscador oficial y verifica el resultado según la forma jurídica y la actividad; no selecciones un régimen por defecto.',
    },
    exclusion: {
      ca: 'Ser autònom, per si sol, no identifica tots els models aplicables.',
      es: 'Ser autónomo, por sí solo, no identifica todos los modelos aplicables.',
    },
    evidence: citation(
      'aeat-buscador',
      'aeat',
      aeatCensus,
      'Buscador de actividades y sus obligaciones tributarias',
      aeat,
    ),
  },
  {
    id: 'social-reta-individual',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['persona-fisica'],
    title: { ca: 'Comprova l’enquadrament al RETA', es: 'Comprueba el encuadramiento en RETA' },
    condition: {
      ca: 'Si treballes habitualment per compte propi.',
      es: 'Si trabajas habitualmente por cuenta propia.',
    },
    fact: {
      ca: 'La inclusió al RETA depèn de les condicions legals de l’activitat, no només dels ingressos.',
      es: 'La inclusión en RETA depende de las condiciones legales de la actividad, no solo de los ingresos.',
    },
    step: {
      ca: 'Contrasta la teva activitat amb el camp d’aplicació de la Seguretat Social abans de l’alta.',
      es: 'Contrasta tu actividad con el campo de aplicación de la Seguridad Social antes del alta.',
    },
    exclusion: {
      ca: 'No s’infereix una exempció només per ingressos baixos.',
      es: 'No se infiere una exención solo por ingresos bajos.',
    },
    evidence: citation(
      'tgss-reta',
      'seg-social',
      tgssReta,
      'realiza de forma habitual, personal y directa una actividad económica a título lucrativo',
      tgss,
    ),
  },
  {
    id: 'social-reta-societario',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['socio-administrador'],
    title: {
      ca: 'Enquadrament de socis i administradors',
      es: 'Encuadramiento de socios y administradores',
    },
    condition: {
      ca: 'Si treballes en una societat de capital o l’administres.',
      es: 'Si trabajas en una sociedad de capital o la administras.',
    },
    fact: {
      ca: 'Les funcions i el control efectiu condicionen la inclusió al RETA.',
      es: 'Las funciones y el control efectivo condicionan la inclusión en RETA.',
    },
    step: {
      ca: 'Comprova funcions, participació i control efectiu abans d’escollir l’enquadrament.',
      es: 'Comprueba funciones, participación y control efectivo antes de elegir el encuadramiento.',
    },
    exclusion: {
      ca: 'La condició de soci, per si sola, no decideix el règim.',
      es: 'La condición de socio, por sí sola, no decide el régimen.',
    },
    evidence: citation(
      'boe-reta-socio',
      'boe',
      lgss,
      'siempre que posean el control efectivo, directo o indirecto, de aquella',
      boe,
      checkedAt,
      lgss,
      observed,
      false,
    ),
  },
  {
    id: 'social-reta-colaborador',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['familiar-colaborador'],
    title: { ca: 'Familiar col·laborador', es: 'Familiar colaborador' },
    condition: {
      ca: 'Si col·labores en l’activitat d’un familiar autònom.',
      es: 'Si colaboras en la actividad de un familiar autónomo.',
    },
    fact: {
      ca: 'La relació familiar no basta: també importen el treball habitual i la situació laboral.',
      es: 'La relación familiar no basta: también importan el trabajo habitual y la situación laboral.',
    },
    step: {
      ca: 'Comprova parentiu, treball efectiu i absència de relació assalariada abans de tramitar.',
      es: 'Comprueba parentesco, trabajo efectivo y ausencia de relación asalariada antes de tramitar.',
    },
    exclusion: {
      ca: 'No s’aplica aquest supòsit a una relació assalariada.',
      es: 'No se aplica este supuesto a una relación asalariada.',
    },
    evidence: citation(
      'tgss-familiar',
      'seg-social',
      tgssReta,
      'colaboren con el trabajador autónomo de forma personal, habitual y directa y no tengan la condición de asalariados',
      tgss,
    ),
  },
  {
    id: 'social-mutualidad-alternativa',
    domain: 'D-04',
    subtopic: 'mutualidad-alternativa',
    profiles: ['profesional-colegiado'],
    title: { ca: 'Mutualitat alternativa', es: 'Mutualidad alternativa' },
    condition: {
      ca: 'Si la teva professió exigeix col·legiació i disposa de mutualitat alternativa.',
      es: 'Si tu profesión exige colegiación y dispone de mutualidad alternativa.',
    },
    fact: {
      ca: 'L’excepció al RETA depèn de la mutualitat i de l’opció legalment disponible.',
      es: 'La excepción al RETA depende de la mutualidad y de la opción legalmente disponible.',
    },
    step: {
      ca: 'Comprova la professió, la mutualitat concreta i l’opció prèvia; no pressuposis una elecció universal.',
      es: 'Comprueba la profesión, la mutualidad concreta y la opción previa; no presupongas una elección universal.',
    },
    exclusion: {
      ca: 'No tota col·legiació comporta una alternativa al RETA.',
      es: 'No toda colegiación comporta una alternativa al RETA.',
    },
    evidence: citation(
      'boe-mutualidad',
      'boe',
      'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16653',
      'quedan exentos de la obligación de alta en dicho régimen especial los colegiados que opten',
      boe,
      '2026-08-01',
      'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16653',
      'BOE-A-2026-16653@2026-07-31',
      false,
    ),
    periodFrom: '2026-08-01',
  },
  {
    id: 'social-cotizacion-2026',
    domain: 'D-04',
    subtopic: 'cotizacion',
    profiles: ['persona-fisica', 'socio-administrador', 'familiar-colaborador'],
    title: { ca: 'Base i cotització el 2026', es: 'Base y cotización en 2026' },
    condition: {
      ca: 'Si cotitzes al RETA durant el 2026.',
      es: 'Si cotizas en RETA durante 2026.',
    },
    fact: {
      ca: 'La base s’escull dins del tram de rendiments aplicable, amb regles particulars per a alguns perfils.',
      es: 'La base se elige dentro del tramo de rendimientos aplicable, con reglas particulares para algunos perfiles.',
    },
    step: {
      ca: 'Contrasta rendiments previstos i supòsit especial a la taula oficial de 2026; no calculis una quota sense dades i regla confirmades.',
      es: 'Contrasta rendimientos previstos y supuesto especial en la tabla oficial de 2026; no calcules una cuota sin datos y regla confirmados.',
    },
    exclusion: {
      ca: 'La taula general no resol automàticament els supòsits amb regles especials.',
      es: 'La tabla general no resuelve automáticamente los supuestos con reglas especiales.',
    },
    evidence: {
      ...citation(
        'tgss-base-2026',
        'seg-social',
        tgssRates,
        'La base de cotización en este régimen especial será la elegida por el trabajador entre las bases mínima y máxima de su tramo de rendimientos.',
        tgss,
        '2026-01-01',
        tgssRates,
        'observed-2026-10-04-year-2026',
      ),
      applicableUntil: '2026-12-31',
    },
    periodFrom: '2026-01-01',
    periodUntil: '2026-12-31',
    additionalEvidence: [
      citation(
        'tgss-especiales-2026',
        'seg-social',
        tgssRates,
        'Familiares de la persona trabajadora autónoma y societarios/as',
        tgss,
        '2026-01-01',
        tgssRates,
        'observed-2026-10-04-year-2026',
      ),
    ],
  },
  {
    id: 'social-varias-actividades',
    domain: 'D-04',
    subtopic: 'cambios-actividad',
    profiles: ['persona-fisica'],
    title: { ca: 'Afegeix o acaba una activitat', es: 'Añade o termina una actividad' },
    condition: {
      ca: 'Si mantens l’alta RETA i canvies les activitats.',
      es: 'Si mantienes el alta RETA y cambias las actividades.',
    },
    fact: {
      ca: 'Diverses activitats incloses al RETA comporten una alta única i la comunicació de totes les activitats.',
      es: 'Varias actividades incluidas en RETA implican un alta única y la comunicación de todas las actividades.',
    },
    kind: 'obligation',
    step: {
      ca: 'Comunica la variació a la TGSS i revisa també les activitats del 036; no tramitis una segona alta RETA.',
      es: 'Comunica la variación a la TGSS y revisa también las actividades del 036; no tramites una segunda alta RETA.',
    },
    exclusion: {
      ca: 'Afegir una activitat no exigeix una segona alta RETA.',
      es: 'Añadir una actividad no exige una segunda alta RETA.',
    },
    evidence: citation(
      'boe-actividades-reta',
      'boe',
      retaRules,
      'su alta en él será única, debiendo comunicar todas sus actividades',
      boe,
      checkedAt,
      retaRules,
      observed,
      false,
    ),
    additionalEvidence: [
      citation(
        'aeat-cambio-actividades',
        'aeat',
        aeatActivities,
        'deben declarar todas las actividades económicas que desarrollen',
        aeat,
      ),
    ],
  },
  {
    id: 'social-pluriactividad-2026',
    domain: 'D-04',
    subtopic: 'pluriactividad',
    profiles: ['pluriactivo'],
    title: { ca: 'Pluriactivitat el 2026', es: 'Pluriactividad en 2026' },
    condition: {
      ca: 'Si cotitzes el 2026 per compte propi i per compte d’altri.',
      es: 'Si cotizas en 2026 por cuenta propia y ajena.',
    },
    fact: {
      ca: 'Pot correspondre un reintegrament condicionat de l’excés de cotització per contingències comunes.',
      es: 'Puede corresponder un reintegro condicionado del exceso de cotización por contingencias comunes.',
    },
    step: {
      ca: 'Consulta la regla de 2026 i espera la regularització de la TGSS; no traslladis el llindar a altres exercicis.',
      es: 'Consulta la regla de 2026 y espera la regularización de la TGSS; no traslades el umbral a otros ejercicios.',
    },
    exclusion: {
      ca: 'Aquesta regla de reintegrament no s’estén automàticament al 2027.',
      es: 'Esta regla de reintegro no se extiende automáticamente a 2027.',
    },
    evidence: {
      ...citation(
        'tgss-pluriactividad-2026',
        'seg-social',
        tgssRates,
        'durante el año 2026, teniendo en cuenta tanto las cotizaciones efectuadas en este régimen especial como las aportaciones empresariales',
        tgss,
        '2026-01-01',
        tgssRates,
        'observed-2026-10-04-year-2026',
      ),
      applicableUntil: '2026-12-31',
    },
    periodFrom: '2026-01-01',
    periodUntil: '2026-12-31',
    additionalEvidence: [
      citation(
        'tgss-reintegro-2026',
        'seg-social',
        tgssRates,
        'tendrán derecho al reintegro del 50 por ciento del exceso',
        tgss,
        '2026-01-01',
        tgssRates,
        'observed-2026-10-04-year-2026',
      ),
    ],
  },
  {
    id: 'social-beneficio-inicio',
    domain: 'D-04',
    subtopic: 'beneficios-cotizacion',
    profiles: ['persona-fisica', 'socio-administrador'],
    title: { ca: 'Reducció per inici d’activitat', es: 'Reducción por inicio de actividad' },
    condition: {
      ca: 'Si és una alta inicial o no has estat d’alta al RETA en el període exigit.',
      es: 'Si es un alta inicial o no has estado de alta en RETA en el periodo exigido.',
    },
    fact: {
      ca: 'L’accés a la quota reduïda depèn de l’historial d’altes i dels requisits vigents.',
      es: 'El acceso a la cuota reducida depende del historial de altas y de los requisitos vigentes.',
    },
    step: {
      ca: 'Comprova l’historial i les condicions oficials abans de sol·licitar el benefici; no assumeixis un import total fix.',
      es: 'Comprueba el historial y las condiciones oficiales antes de solicitar el beneficio; no presupongas un importe total fijo.',
    },
    exclusion: {
      ca: 'Aquesta reducció no s’aplica als familiars col·laboradors indicats per la norma.',
      es: 'Esta reducción no se aplica a los familiares colaboradores indicados por la norma.',
    },
    evidence: citation(
      'tgss-beneficio-inicio',
      'seg-social',
      tgssRates,
      'alta inicial o que no hubieran estado en situación de alta en los dos años inmediatamente anteriores',
      tgss,
    ),
    additionalEvidence: [
      citation(
        'tgss-beneficio-exclusion',
        'seg-social',
        tgssRates,
        'Las reducciones en la cotización previstas en este artículo no resultarán aplicables a los familiares de trabajadores autónomos',
        tgss,
      ),
      citation(
        'tgss-beneficio-socios',
        'seg-social',
        tgssRates,
        'así como a los socios de sociedades de capital y de sociedades laborales',
        tgss,
      ),
    ],
  },
];

function statement(id: string, text: Pair, evidenceIds: string[]) {
  return { id, text, evidenceIds, translation: 'ca' as const };
}

/** Curated public drafts. Structural validity does not establish applicability or publication rights. */
export const fiscalSocialGuides: Guide[] = cards.map((card) => {
  const evidence = [card.evidence, ...(card.additionalEvidence ?? [])];
  const evidenceIds = evidence.map((item) => item.id);
  return guideSchema.parse({
    id: card.id,
    revision: 1,
    title: card.title,
    domain: card.domain,
    subtopic: card.subtopic,
    profiles: card.profiles,
    jurisdiction: 'ES-CT',
    consultedAt: checkedAt,
    period: {
      ...(card.periodFrom ? { from: card.periodFrom } : {}),
      ...(card.periodUntil ? { until: card.periodUntil } : {}),
      evidenceIds,
    },
    validation: { status: 'pending' },
    evidence,
    conditions: [statement('applies', card.condition, evidenceIds)],
    exclusions: [statement('does-not-apply', card.exclusion, evidenceIds)],
    claims: [
      {
        ...statement('fact', card.fact, evidenceIds),
        kind: card.kind ?? 'fact',
        conditionIds: ['applies'],
      },
    ],
    steps: [{ ...statement('check-source', card.step, evidenceIds), dependsOn: [] }],
  });
});

/** Host notices for the cited sources; permission for each item still needs review. */
export const fiscalSocialRights = {
  aeat: 'https://sede.agenciatributaria.gob.es/Sede/condiciones-uso-sede-electronica/aviso-legal/utilizacion-informacion-contenida-web-aeat.html',
  'seg-social': 'https://www.seg-social.es/wps/portal/wss/internet/AvisoLegal/?changeLanguage=es',
  boe: 'https://www.boe.es/informacion/aviso_legal/index.php',
} as const;

export const fiscalSocialCoverage = {
  year: 2026,
  language: ['ca', 'es'],
  state: 'controlled-pending',
  partial: [
    {
      guideId: 'fiscal-036-vigente',
      gap: 'El FAQ AEAT aún menciona 037; prevalece la orden de supresión para este punto.',
    },
    {
      guideId: 'fiscal-censos-web',
      gap: 'Censos WEB solo cubre aquí el alta inicial de persona física; otros trámites requieren otra vía.',
    },
    {
      guideId: 'fiscal-pae-sin-duplicar',
      gap: 'No se conoce el resultado de un DUE individual; consultar justificante y respuesta AEAT/TGSS.',
    },
    {
      guideId: 'fiscal-actividades-locales',
      gap: 'La clasificación de actividad y local concreto requiere hechos del usuario y buscador AEAT.',
    },
    {
      guideId: 'fiscal-modelos-por-actividad',
      gap: 'IAE, IVA y declaraciones periódicas dependen de actividad y forma jurídica; no se seleccionan aquí.',
    },
    {
      guideId: 'social-reta-individual',
      gap: 'No se decide inclusión RETA con solo ingresos o sin actividad y situación laboral.',
    },
    {
      guideId: 'social-reta-societario',
      gap: 'Faltan funciones, participación y control efectivo de cada socio.',
    },
    {
      guideId: 'social-reta-colaborador',
      gap: 'Faltan parentesco, trabajo efectivo y posible relación asalariada.',
    },
    {
      guideId: 'social-mutualidad-alternativa',
      gap: 'No se verifica profesión, mutualidad concreta, opción anterior ni eventual pasarela.',
    },
    {
      guideId: 'social-cotizacion-2026',
      gap: 'No se calcula cuota sin previsión de rendimientos y regla especial aplicable.',
    },
    {
      guideId: 'social-varias-actividades',
      gap: 'El cese de una actividad con otras activas no se equipara a baja total RETA; plazo especial pendiente.',
    },
    {
      guideId: 'social-pluriactividad-2026',
      gap: 'No se calcula devolución sin cotizaciones efectivas; umbral limitado a 2026.',
    },
    {
      guideId: 'social-beneficio-inicio',
      gap: 'Historial y exclusiones requieren comprobación; no se promete importe de cuota.',
    },
  ],
  gaps: [
    'La ficha Importass no tiene permiso de reutilización confirmado para este corpus; enlazar el trámite sin reproducirlo.',
    'La regla general del RD 643/2026 sobre seis días no se extiende a cambios RETA sin verificar el artículo 46.',
    'Las fichas están pendientes de corpus oficial, revisión de licencia por pieza y gate automático T-004.',
  ],
} as const;
