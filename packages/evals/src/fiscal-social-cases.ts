import { catalunyaCaseSchema, type CatalunyaCase } from './catalunya';

type Pair = { ca: string; es: string };
type Seed = {
  id: string;
  domain: 'D-03' | 'D-04';
  subtopic: string;
  profiles: string[];
  sourceId: string;
  url: string;
  version: string;
  excerpt: string;
  required: string;
  query: Pair;
  unsupported: Pair;
  unsupportedYear?: number;
};

// Short excerpts transcribed from the listed public pages on 2026-10-04.
// Controlled cases exercise the contract; they are not an approved official corpus.
const seeds: Seed[] = [
  {
    id: 'fiscal-036-vigente',
    domain: 'D-03',
    subtopic: 'alta-censal',
    profiles: ['persona-fisica', 'sociedad'],
    sourceId: 'boe',
    url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2025-410',
    version: '2025-01-09',
    excerpt: 'esta orden suprime el modelo 037 de Declaración censal simplificada',
    required: 'suprim',
    query: {
      ca: 'El model 037 segueix vigent per a l’alta censal?',
      es: '¿Sigue vigente el modelo 037 para el alta censal?',
    },
    unsupported: {
      ca: 'Quina casella exacta d’IVA he de marcar sense descriure l’activitat?',
      es: '¿Qué casilla exacta de IVA debo marcar sin describir la actividad?',
    },
  },
  {
    id: 'fiscal-censos-web',
    domain: 'D-03',
    subtopic: 'alta-censal',
    profiles: ['persona-fisica'],
    sourceId: 'aeat',
    url: 'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores.html',
    version: '2026-10-04',
    excerpt: 'modelo 036 de alta inicial en el censo de empresarios profesionales y retenedores',
    required: '036',
    query: {
      ca: 'Quin model permet tramitar Censos WEB a una persona física que comença?',
      es: '¿Qué modelo permite tramitar Censos WEB a una persona física que empieza?',
    },
    unsupported: {
      ca: 'Puc fer servir Censos WEB per una societat concreta sense comprovar la seva situació?',
      es: '¿Puedo usar Censos WEB para una sociedad concreta sin comprobar su situación?',
    },
  },
  {
    id: 'fiscal-pae-sin-duplicar',
    domain: 'D-03',
    subtopic: 'canal-integrado',
    profiles: ['persona-fisica', 'sociedad'],
    sourceId: 'aeat',
    url: 'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores/preguntas-frecuentes-modelos-036-037.html',
    version: '2026-10-04',
    excerpt: 'Documento Único Electrónico (DUE',
    required: 'DUE',
    query: {
      ca: 'Si he usat un PAE, he de comprovar si el DUE ja ha cobert l’alta censal?',
      es: 'Si usé un PAE, ¿debo comprobar si el DUE ya cubrió el alta censal?',
    },
    unsupported: {
      ca: 'Pots confirmar que el meu DUE personal ja ha estat registrat?',
      es: '¿Puedes confirmar que mi DUE personal ya se registró?',
    },
  },
  {
    id: 'fiscal-actividades-locales',
    domain: 'D-03',
    subtopic: 'actividades-locales',
    profiles: ['persona-fisica', 'sociedad'],
    sourceId: 'aeat',
    url: 'https://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/guia-practica-cumplimentacion-modelo-censal-036/capitulo-04-actividades-economicas-locales/aspectos-generales-modelo-presentacion-declaracion/obligados-declarar-actividades-economicas-modelo-036.html',
    version: '2026-10-04',
    excerpt:
      'actividades económicas que desarrollen, así como, en su caso, la relación de los establecimientos o locales',
    required: 'local',
    query: {
      ca: 'He de revisar totes les activitats i locals al cens?',
      es: '¿Debo revisar todas las actividades y locales en el censo?',
    },
    unsupported: {
      ca: 'Quin epígraf concret em correspon sense dir què faig?',
      es: '¿Qué epígrafe concreto me corresponde sin decir a qué me dedico?',
    },
  },
  {
    id: 'fiscal-modelos-por-actividad',
    domain: 'D-03',
    subtopic: 'modelos-tributarios',
    profiles: ['persona-fisica', 'sociedad'],
    sourceId: 'aeat',
    url: 'https://sede.agenciatributaria.gob.es/Sede/censos-nif-domicilio-fiscal/tramites-censales-relacionados-empresarios-profesionales-retenedores.html',
    version: '2026-10-04',
    excerpt: 'Buscador de actividades y sus obligaciones tributarias',
    required: 'activ',
    query: {
      ca: 'On puc contrastar models i obligacions segons l’activitat?',
      es: '¿Dónde puedo contrastar modelos y obligaciones según la actividad?',
    },
    unsupported: {
      ca: 'Quins models exactes em corresponen només sabent que sóc autònom?',
      es: '¿Qué modelos exactos me corresponden solo por ser autónomo?',
    },
  },
  {
    id: 'social-reta-individual',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['persona-fisica'],
    sourceId: 'seg-social',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10548/32825',
    version: '2026-10-04',
    excerpt:
      'realiza de forma habitual, personal y directa una actividad económica a título lucrativo',
    required: 'habitual',
    query: {
      ca: 'Quines condicions he de contrastar per saber si entro al RETA?',
      es: '¿Qué condiciones debo contrastar para saber si entro en RETA?',
    },
    unsupported: {
      ca: 'Pots confirmar la meva alta RETA només amb aquesta pregunta?',
      es: '¿Puedes confirmar mi alta RETA solo con esta pregunta?',
    },
  },
  {
    id: 'social-reta-societario',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['socio-administrador'],
    sourceId: 'boe',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
    version: '2026-10-04',
    excerpt: 'siempre que posean el control efectivo, directo o indirecto, de aquella',
    required: 'control',
    query: {
      ca: 'Què he de comprovar per l’enquadrament d’un soci administrador?',
      es: '¿Qué debo comprobar para encuadrar a un socio administrador?',
    },
    unsupported: {
      ca: 'Quin és el meu règim exacte sense indicar funcions ni participació?',
      es: '¿Cuál es mi régimen exacto sin indicar funciones ni participación?',
    },
  },
  {
    id: 'social-reta-colaborador',
    domain: 'D-04',
    subtopic: 'encuadramiento-reta',
    profiles: ['familiar-colaborador'],
    sourceId: 'seg-social',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10548/32825',
    version: '2026-10-04',
    excerpt:
      'colaboren con el trabajador autónomo de forma personal, habitual y directa y no tengan la condición de asalariados',
    required: 'habitual',
    query: {
      ca: 'Què he de comprovar si col·laboro en l’activitat d’un familiar autònom?',
      es: '¿Qué debo comprobar si colaboro en la actividad de un familiar autónomo?',
    },
    unsupported: {
      ca: 'Em correspon l’alta de familiar sense saber el parentiu ni la relació laboral?',
      es: '¿Me corresponde el alta de familiar sin saber parentesco ni relación laboral?',
    },
  },
  {
    id: 'social-mutualidad-alternativa',
    domain: 'D-04',
    subtopic: 'mutualidad-alternativa',
    profiles: ['profesional-colegiado'],
    sourceId: 'boe',
    url: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16653',
    version: '2026-07-31',
    excerpt:
      'quedan exentos de la obligación de alta en dicho régimen especial los colegiados que opten',
    required: 'alta',
    query: {
      ca: 'Què he de contrastar abans d’optar per una mutualitat alternativa?',
      es: '¿Qué debo contrastar antes de optar por una mutualidad alternativa?',
    },
    unsupported: {
      ca: 'La meva mutualitat concreta és alternativa sense comprovar-la?',
      es: '¿Mi mutualidad concreta es alternativa sin comprobarla?',
    },
  },
  {
    id: 'social-cotizacion-2026',
    domain: 'D-04',
    subtopic: 'cotizacion',
    profiles: ['persona-fisica', 'socio-administrador', 'familiar-colaborador'],
    sourceId: 'seg-social',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10724/1320/1322?changeLanguage=es',
    version: '2026-10-04',
    excerpt:
      'Durante el año 2026, la tabla general y la tabla reducida y las bases máximas y mínimas aplicables',
    required: '2026',
    query: {
      ca: 'He de comprovar el tram de rendiments i la taula de 2026?',
      es: '¿Debo comprobar el tramo de rendimientos y la tabla de 2026?',
    },
    unsupported: {
      ca: 'Quina quota exacta he de pagar sense rendiments ni supòsit especial?',
      es: '¿Qué cuota exacta debo pagar sin rendimientos ni supuesto especial?',
    },
  },
  {
    id: 'social-varias-actividades',
    domain: 'D-04',
    subtopic: 'cambios-actividad',
    profiles: ['persona-fisica'],
    sourceId: 'boe',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-1996-4447',
    version: '2026-10-04',
    excerpt: 'su alta en él será única, debiendo comunicar todas sus actividades',
    required: 'alta',
    query: {
      ca: 'Si afegeixo una activitat inclosa al RETA, necessito una altra alta?',
      es: 'Si añado otra actividad incluida en RETA, ¿necesito otra alta?',
    },
    unsupported: {
      ca: 'Quin és el meu termini exacte per comunicar el cessament d’una sola activitat RETA?',
      es: '¿Cuál es mi plazo exacto para comunicar el fin de una sola actividad RETA?',
    },
  },
  {
    id: 'social-pluriactividad-2026',
    domain: 'D-04',
    subtopic: 'pluriactividad',
    profiles: ['pluriactivo'],
    sourceId: 'seg-social',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10724/1320/1322?changeLanguage=es',
    version: '2026-10-04',
    excerpt:
      'durante el año 2026, teniendo en cuenta tanto las cotizaciones efectuadas en este régimen especial como las aportaciones empresariales',
    required: '2026',
    query: {
      ca: 'La regla de reintegrament de pluriactivitat està vinculada a l’exercici 2026?',
      es: '¿La regla de reintegro por pluriactividad está vinculada al ejercicio 2026?',
    },
    unsupported: {
      ca: 'Quin serà el llindar del reintegrament per pluriactivitat el 2027?',
      es: '¿Cuál será el umbral de reintegro por pluriactividad en 2027?',
    },
    unsupportedYear: 2027,
  },
  {
    id: 'social-beneficio-inicio',
    domain: 'D-04',
    subtopic: 'beneficios-cotizacion',
    profiles: ['persona-fisica', 'socio-administrador'],
    sourceId: 'seg-social',
    url: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/10721/10724/1320/1322?changeLanguage=es',
    version: '2026-10-04',
    excerpt:
      'alta inicial o que no hubieran estado en situación de alta en los dos años inmediatamente anteriores',
    required: 'alta',
    query: {
      ca: 'L’historial d’altes afecta la reducció per inici d’activitat?',
      es: '¿El historial de altas afecta la reducción por inicio de actividad?',
    },
    unsupported: {
      ca: 'Em correspon la quota reduïda sense comprovar l’historial?',
      es: '¿Me corresponde la cuota reducida sin comprobar mi historial?',
    },
  },
];

export const fiscalSocialCases: CatalunyaCase[] = seeds.flatMap((seed) =>
  seed.profiles.flatMap((profile) =>
    (['ca', 'es'] as const).flatMap((language) => [
      catalunyaCaseSchema.parse({
        id: `${seed.id}-${profile}-${language}-answer`,
        query: seed.query[language],
        domain: seed.domain,
        subtopic: seed.subtopic,
        profile,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [
          {
            sourceId: seed.sourceId,
            documentId: seed.id,
            version: seed.version,
            url: seed.url,
            jurisdiction: 'ES',
            consultedAt: '2026-10-04',
            excerpt: seed.excerpt,
          },
        ],
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: [seed.required],
          forbiddenFacts: [],
        },
      }),
      catalunyaCaseSchema.parse({
        id: `${seed.id}-${profile}-${language}-abstain`,
        query: seed.unsupported[language],
        domain: seed.domain,
        subtopic: seed.subtopic,
        profile,
        language,
        city: null,
        year: seed.unsupportedYear ?? 2026,
        critical: 'obligation',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT',
          requiredFacts: [],
          forbiddenFacts: [],
        },
      }),
    ]),
  ),
);
