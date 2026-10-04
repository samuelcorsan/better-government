import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const bilingual = (ca: string, es: string) => ({ ca, es });
type Evidence = Guide['evidence'][number];

function source(
  id: string,
  sourceId: string,
  url: string,
  language: 'ca' | 'es',
  quote: string,
  sourceUpdatedAt: string | null = null,
  originalUrl = url,
): Evidence {
  return {
    id,
    sourceId,
    url,
    originalUrl,
    version: sourceUpdatedAt ?? consultedAt,
    language,
    attribution:
      sourceId === 'boe'
        ? 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado'
        : `Fuente oficial: ${new URL(url).hostname}; adaptación y traducción propias, sin aval administrativo`,
    sourceUpdatedAt,
    // First observed here; page edition dates are not legal commencement dates.
    applicableFrom: consultedAt,
    applicableUntil: null,
    informative: true,
    jurisdiction: sourceId === 'gencat-tramits' || sourceId === 'gencat-treball' ? 'ES-CT' : 'ES',
    quote,
  };
}

/** Short excerpts observed on consultedAt; these pending guides are not publication approval. */
export const employmentSources = {
  registration: source(
    'tgss-employer-registration',
    'seg-social',
    'https://www.seg-social.es/wps/portal/wss/internet/Empresarios/Inscripcion/1227/1230/115941',
    'es',
    'El empresario que por primera vez vaya a contratar trabajadores, deberá solicitar su INSCRIPCIÓN como empresa antes del inicio de actividad',
  ),
  alta: source(
    'tgss-worker-alta',
    'seg-social',
    'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/32765/32772?changeLanguage=es',
    'es',
    'Previo al incio de la relación laboral hasta 60 días naturales antes',
  ),
  contract: source(
    'boe-employment-contract',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11430',
    'es',
    'El empresario está obligado a comunicar a la oficina pública de empleo, en el plazo de los diez días siguientes a su concertación',
    '2025-12-04',
    'https://www.boe.es/buscar/doc.php?id=BOE-A-2015-11430',
  ),
  contrat: source(
    'sepe-contrata',
    'sepe',
    'https://sepe.es/HomeSepe/empresas.html',
    'es',
    'a través de la aplicación Contrat@, se facilita la contratación online y la posterior comunicación a los servicios públicos de empleo',
  ),
  contributions: source(
    'tgss-employee-contributions',
    'seg-social',
    'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/9896/38386/38389',
    'es',
    'Las cuotas de la Seguridad Social, y en su caso, los demás conceptos que se recaudan conjuntamente, se liquidarán por mensualidades',
  ),
  centre: source(
    'gencat-work-centre',
    'gencat-tramits',
    'https://tramits.gencat.cat/es/tramits/tramits-temes/Comunicacio-dobertura-dun-centre-de-treball-o-represa-dactivitats?moda=2',
    'es',
    'El empresario realizará la comunicación con carácter previo o dentro de los 30 dias siguientes al hecho que lo ha motivado.',
    '2021-11-30',
  ),
  construction: source(
    'gencat-work-centre-construction',
    'gencat-tramits',
    'https://canalempresa.gencat.cat/es/integraciodepartamentaltramit/tramit/PerTemes/Comunicacio-dobertura-dun-centre-de-treball-o-represa-dactivitats',
    'es',
    'Comunicar la apertura del centro de trabajo o la reanudación de actividades en el caso de obras de construcción',
    '2021-11-30',
  ),
  agreement: source(
    'gencat-collective-agreement',
    'gencat-treball',
    'https://treball.gencat.cat/ca/consell_relacions_laborals/convenis_colectius/cercador_de_convenis/index.html',
    'ca',
    "Aquest cercador no és un cercador de conveni aplicable per raó d'una activitat o activitats d'un sector o empresa",
  ),
  prevention: source(
    'insst-prevention-management',
    'insst',
    'https://www.insst.es/materias/transversales/gestion-prevencion',
    'es',
    'deberán llevar a cabo la evaluación de riesgos laborales y la planificación de la actividad preventiva',
  ),
  cooperation: source(
    'insst-self-employed-coordination',
    'insst',
    'https://www.insst.es/materias/transversales/gestion-prevencion/cae',
    'es',
    'la obligación de la coordinación de las actividades también resulta de aplicación a los/as trabajadores/as autónomos/as sin personal a su cargo',
  ),
  independent: source(
    'insst-self-employed-risk',
    'insst',
    'https://www.insst.es/formacion/jornada-autonomos',
    'es',
    'aquellos que ni tienen personas asalariadas a su cargo, ni concurren con otros trabajadores o trabajadoras',
  ),
} satisfies Record<string, Evidence>;

type SourceKey = keyof typeof employmentSources;
type StatementKey = 'condition' | 'exclusion' | 'fact' | 'step';
type Entry = {
  id: string;
  domain: 'D-09' | 'D-10';
  title: Guide['title'];
  profiles: string[];
  source: SourceKey;
  extra?: SourceKey;
  extraOn?: StatementKey[];
  question: Guide['title'];
  condition: Guide['title'];
  exclusion: Guide['title'];
  fact: Guide['title'];
  step: Guide['title'];
};

const entries: Entry[] = [
  {
    id: 'employer-registration',
    domain: 'D-09',
    source: 'registration',
    extra: 'alta',
    extraOn: ['fact', 'step'],
    profiles: ['with-employees'],
    title: bilingual(
      'Inscripció empresarial i alta de plantilla',
      'Inscripción empresarial y alta de plantilla',
    ),
    question: bilingual(
      'Contractaràs personal per compte d’altri per primera vegada? Quin règim correspon?',
      '¿Contratarás personal por cuenta ajena por primera vez? ¿Qué régimen corresponde?',
    ),
    condition: bilingual(
      'S’aplica si es contracta personal per compte d’altri.',
      'Se aplica si se contrata personal por cuenta ajena.',
    ),
    exclusion: bilingual(
      'L’activitat sense personal contractat no activa aquesta inscripció empresarial.',
      'La actividad sin personal contratado no activa esta inscripción empresarial.',
    ),
    fact: bilingual(
      'La primera inscripció empresarial precedeix l’inici; en règim general, l’alta de la persona treballadora també és prèvia a la relació laboral.',
      'La primera inscripción empresarial precede al inicio; en régimen general, el alta de la persona trabajadora también es previa a la relación laboral.',
    ),
    step: bilingual(
      'Comprova inscripció, codi de cotització i règim a TGSS, i presenta l’alta en règim general abans de començar si correspon.',
      'Comprueba inscripción, código de cotización y régimen en TGSS, y presenta el alta en régimen general antes de empezar si corresponde.',
    ),
  },
  {
    id: 'employment-contract',
    domain: 'D-09',
    source: 'contract',
    extra: 'contrat',
    extraOn: ['step'],
    profiles: ['with-employees'],
    title: bilingual(
      'Contracte i comunicació al servei d’ocupació',
      'Contrato y comunicación al servicio de empleo',
    ),
    question: bilingual(
      'Quina relació laboral, modalitat i data de concertació hi ha?',
      '¿Qué relación laboral, modalidad y fecha de concertación hay?',
    ),
    condition: bilingual(
      'Es tracta d’un contracte laboral per compte d’altri.',
      'Se trata de un contrato laboral por cuenta ajena.',
    ),
    exclusion: bilingual(
      'Un encàrrec mercantil o treball propi no es comunica com a contracte laboral per aquesta via.',
      'Un encargo mercantil o trabajo propio no se comunica como contrato laboral por esta vía.',
    ),
    fact: bilingual(
      'L’empresari comunica el contingut del contracte en els deu dies següents a la concertació.',
      'El empresario comunica el contenido del contrato en los diez días siguientes a su concertación.',
    ),
    step: bilingual(
      'Determina la modalitat amb el conveni aplicable i comunica el contracte pel canal oficial Contrat@ quan correspongui.',
      'Determina la modalidad con el convenio aplicable y comunica el contrato por el canal oficial Contrat@ cuando corresponda.',
    ),
  },
  {
    id: 'employee-contributions',
    domain: 'D-09',
    source: 'contributions',
    profiles: ['with-employees'],
    title: bilingual(
      'Cotització de les persones treballadores',
      'Cotización de las personas trabajadoras',
    ),
    question: bilingual(
      'Hi ha persones assalariades i quin règim de cotització correspon?',
      '¿Hay personas asalariadas y qué régimen de cotización corresponde?',
    ),
    condition: bilingual(
      'Hi ha una relació laboral inclosa en un règim de cotització.',
      'Hay una relación laboral incluida en un régimen de cotización.',
    ),
    exclusion: bilingual(
      'La quota RETA pròpia no substitueix la cotització de la plantilla.',
      'La cuota RETA propia no sustituye la cotización de la plantilla.',
    ),
    fact: bilingual(
      'Les quotes de la plantilla es liquiden per mensualitats, amb règims i excepcions particulars.',
      'Las cuotas de la plantilla se liquidan por mensualidades, con regímenes y excepciones particulares.',
    ),
    step: bilingual(
      'Contrasta el règim, les bases, els tipus i el termini del període amb TGSS abans de liquidar.',
      'Contrasta el régimen, las bases, los tipos y el plazo del período con TGSS antes de liquidar.',
    ),
  },
  {
    id: 'work-centre-opening',
    domain: 'D-09',
    source: 'centre',
    extra: 'construction',
    extraOn: ['exclusion', 'fact', 'step'],
    profiles: ['with-employees'],
    title: bilingual(
      'Obertura de centre de treball a Catalunya',
      'Apertura de centro de trabajo en Catalunya',
    ),
    question: bilingual(
      'Obres un centre de treball? És una obra de construcció?',
      '¿Abres un centro de trabajo? ¿Es una obra de construcción?',
    ),
    condition: bilingual(
      'Hi ha obertura o represa d’un centre de treball a Catalunya.',
      'Hay apertura o reanudación de un centro de trabajo en Catalunya.',
    ),
    exclusion: bilingual(
      'Una obra de construcció té una branca de comunicació pròpia; obrir qualsevol local no prova per si sol l’obligació.',
      'Una obra de construcción tiene una rama de comunicación propia; abrir cualquier local no prueba por sí solo la obligación.',
    ),
    fact: bilingual(
      'La fitxa general indica comunicació prèvia o dins els trenta dies següents al fet; la branca d’obres s’ha de comprovar separadament.',
      'La ficha general indica comunicación previa o dentro de los treinta días siguientes al hecho; la rama de obras se comprueba aparte.',
    ),
    step: bilingual(
      'Selecciona a Gencat la modalitat de centre ordinari o obra, i verifica subjecte, data i documentació de la fitxa.',
      'Selecciona en Gencat la modalidad de centro ordinario u obra, y verifica sujeto, fecha y documentación de la ficha.',
    ),
  },
  {
    id: 'collective-agreement',
    domain: 'D-09',
    source: 'agreement',
    profiles: ['with-employees'],
    title: bilingual('Identificar el conveni col·lectiu', 'Identificar el convenio colectivo'),
    question: bilingual(
      'Quina activitat, centre i conveni propi o sectorial hi ha?',
      '¿Qué actividad, centro y convenio propio o sectorial hay?',
    ),
    condition: bilingual(
      'Hi ha personal amb relació laboral i cal identificar el conveni que li correspon.',
      'Hay personal con relación laboral y hay que identificar el convenio que le corresponde.',
    ),
    exclusion: bilingual(
      'El cercador de textos no determina automàticament el conveni aplicable.',
      'El buscador de textos no determina automáticamente el convenio aplicable.',
    ),
    fact: bilingual(
      'El cercador català reuneix convenis publicats i revisions, però adverteix que no identifica el conveni aplicable només per l’activitat.',
      'El buscador catalán reúne convenios publicados y revisiones, pero advierte que no identifica el convenio aplicable solo por la actividad.',
    ),
    step: bilingual(
      'Consulta l’àmbit funcional, territorial, temporal i d’empresa; si hi ha dubte, utilitza el canal oficial de consulta.',
      'Consulta el ámbito funcional, territorial, temporal y de empresa; si hay duda, utiliza el canal oficial de consulta.',
    ),
  },
  {
    id: 'employer-prevention',
    domain: 'D-10',
    source: 'prevention',
    profiles: ['with-employees'],
    title: bilingual('Prevenció de riscos com a ocupador', 'Prevención de riesgos como empleador'),
    question: bilingual(
      'Tens plantilla, quins llocs i riscos, i com organitzes la prevenció?',
      '¿Tienes plantilla, qué puestos y riesgos, y cómo organizas la prevención?',
    ),
    condition: bilingual('S’empren persones assalariades.', 'Se emplean personas asalariadas.'),
    exclusion: bilingual(
      'Una eina genèrica no substitueix l’avaluació del lloc ni determina el servei preventiu adequat.',
      'Una herramienta genérica no sustituye la evaluación del puesto ni determina el servicio preventivo adecuado.',
    ),
    fact: bilingual(
      'La gestió preventiva inclou avaluació de riscos i planificació de l’activitat preventiva.',
      'La gestión preventiva incluye evaluación de riesgos y planificación de la actividad preventiva.',
    ),
    step: bilingual(
      'Organitza la prevenció, avalua els riscos de la plantilla i planifica mesures per activitat i lloc.',
      'Organiza la prevención, evalúa los riesgos de la plantilla y planifica medidas por actividad y puesto.',
    ),
  },
  {
    id: 'self-employed-coordination',
    domain: 'D-10',
    source: 'cooperation',
    profiles: ['without-employees', 'with-employees'],
    title: bilingual('Coordinació en centres compartits', 'Coordinación en centros compartidos'),
    question: bilingual(
      'Coincideixes en un centre amb altres empreses o autònoms? Quin paper hi tens?',
      '¿Coincides en un centro con otras empresas o autónomos? ¿Qué papel tienes?',
    ),
    condition: bilingual(
      'Hi ha concurrència d’activitats en un mateix centre.',
      'Hay concurrencia de actividades en un mismo centro.',
    ),
    exclusion: bilingual(
      'No s’imposa automàticament el pla d’un ocupador a qui treballa sol.',
      'No se impone automáticamente el plan de un empleador a quien trabaja solo.',
    ),
    fact: bilingual(
      'L’INSST inclou l’autònom sense plantilla en la coordinació d’activitats quan concorre.',
      'El INSST incluye al autónomo sin plantilla en la coordinación de actividades cuando concurre.',
    ),
    step: bilingual(
      'Identifica titular, empreses concurrents, riscos i instruccions abans d’iniciar l’activitat compartida.',
      'Identifica titular, empresas concurrentes, riesgos e instrucciones antes de iniciar la actividad compartida.',
    ),
  },
  {
    id: 'self-employed-own-risk',
    domain: 'D-10',
    source: 'independent',
    profiles: ['without-employees'],
    title: bilingual(
      'Riscos del treball propi sense plantilla',
      'Riesgos del trabajo propio sin plantilla',
    ),
    question: bilingual(
      'Treballes sense plantilla i sense concurrència amb altres persones treballadores?',
      '¿Trabajas sin plantilla y sin concurrencia con otras personas trabajadoras?',
    ),
    condition: bilingual(
      'No hi ha plantilla ni concurrència laboral comprovada.',
      'No hay plantilla ni concurrencia laboral comprobada.',
    ),
    exclusion: bilingual(
      'Aquest supòsit no exclou requisits de l’activitat, del local o del sector.',
      'Este supuesto no excluye requisitos de la actividad, del local o del sector.',
    ),
    fact: bilingual(
      'L’INSST diferencia el treball autònom sense plantilla ni concurrència de l’obligació preventiva de l’ocupador.',
      'El INSST diferencia el trabajo autónomo sin plantilla ni concurrencia de la obligación preventiva del empleador.',
    ),
    step: bilingual(
      'Confirma si hi ha concurrència i consulta les normes específiques de l’activitat i del local abans de concloure que no hi ha tràmit preventiu.',
      'Confirma si hay concurrencia y consulta las normas específicas de la actividad y del local antes de concluir que no hay trámite preventivo.',
    ),
  },
];

export const employmentGuides: Guide[] = entries.map((entry) => {
  const primary = employmentSources[entry.source];
  const extra = entry.extra ? employmentSources[entry.extra] : null;
  const evidence = [primary, ...(extra ? [extra] : [])];
  const cite = (id: StatementKey, value: Guide['title']) => ({
    id: `${entry.id}-${id}`,
    text: value,
    evidenceIds: [primary.id, ...(extra && entry.extraOn?.includes(id) ? [extra.id] : [])],
    translation: primary.language === 'ca' ? ('es' as const) : ('ca' as const),
  });
  const condition = cite('condition', entry.condition);
  return guideSchema.parse({
    id: entry.id,
    revision: 1,
    title: entry.title,
    domain: entry.domain,
    subtopic: entry.id,
    profiles: entry.profiles,
    jurisdiction: 'ES-CT',
    consultedAt,
    period: { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence,
    conditions: [condition],
    exclusions: [cite('exclusion', entry.exclusion)],
    claims: [{ ...cite('fact', entry.fact), kind: 'fact', conditionIds: [condition.id] }],
    steps: [{ ...cite('step', entry.step), dependsOn: [] }],
  });
});

export const employmentCoverage = entries.map((entry) => ({
  guideId: entry.id,
  status: 'partial' as const,
  questions: [entry.question],
  gaps: [
    bilingual(
      'Cal contrastar el supòsit, les condicions sectorials, el conveni i la fitxa vigent abans de fer un tràmit real.',
      'Hay que contrastar el supuesto, las condiciones sectoriales, el convenio y la ficha vigente antes de hacer un trámite real.',
    ),
  ],
}));
