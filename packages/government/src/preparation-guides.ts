import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const text = (ca: string, es: string): Guide['title'] => ({ ca, es });
type Evidence = Guide['evidence'][number];

function boe(
  id: string,
  block: string,
  updated: string,
  effective: string,
  quote: string,
  jurisdiction = 'ES',
): Evidence {
  return {
    id: `${id}-${block}`,
    sourceId: 'boe',
    url: `https://www.boe.es/buscar/act.php?id=${id}#${block}`,
    originalUrl: `https://www.boe.es/buscar/doc.php?id=${id}`,
    version: updated,
    language: 'es',
    attribution: 'Basado en datos de la Agencia Estatal Boletín Oficial del Estado',
    sourceUpdatedAt: updated,
    applicableFrom: effective,
    applicableUntil: null,
    informative: true,
    jurisdiction,
    quote,
  };
}

function gencat(id: string, url: string, updated: string, quote: string): Evidence {
  return {
    id,
    sourceId: id === 'cerca-guiada' ? 'canal-empresa-fue' : 'gencat-tramits',
    url,
    originalUrl: url,
    version: updated,
    language: 'ca',
    attribution: 'Generalitat de Catalunya; adaptació del producte, sense aval administratiu',
    sourceUpdatedAt: updated,
    // Publication of this observed information edition, not legal commencement of an activity.
    applicableFrom: updated,
    applicableUntil: null,
    informative: true,
    jurisdiction: 'ES-CT',
    quote,
  };
}

/** Short public excerpts observed on consultedAt; no licence is inherited from another host. */
export const preparationSources = {
  search: gencat(
    'cerca-guiada',
    'https://canalempresa.gencat.cat/ca/tramits-i-formularis/tramit/cerca-guiada/cerca-guiada-de-tramits/',
    '2022-02-04',
    'Les respostes condicionaran el resultat final.',
  ),
  individual: gencat(
    'alta-individual',
    'https://tramits.gencat.cat/ca/tramits/tramits-temes/Alta-dun-empresari-individual-o-treballador-autonom',
    '2026-07-21',
    'Preparar les dades i documentació',
  ),
  company: gencat(
    'constitucio-sl',
    'https://tramits.gencat.cat/ca/tramits/tramits-temes/Constitucio-duna-Societat-Limitada-SL',
    '2026-05-11',
    'Sol·licitar la certificació de denominació social',
  ),
  capital: boe(
    'BOE-A-2010-10544',
    'a4',
    '2025-01-03',
    '2022-10-19',
    'no podrá ser inferior a un euro',
  ),
  companyWork: boe(
    'BOE-A-2015-11724',
    'a305',
    '2026-07-31',
    '2023-04-01',
    'control efectivo, directo o indirecto',
  ),
  family: boe('BOE-A-2015-11724', 'a305', '2026-07-31', '2023-04-01', 'El cónyuge y los parientes'),
  mutuality: boe(
    'BOE-A-2015-11724',
    'dadecimoctava',
    '2026-07-31',
    '2026-08-01',
    'mutualidad de previsión social',
  ),
  trade: boe(
    'BOE-A-2007-13409',
    'a11',
    '2026-09-02',
    '2019-03-08',
    'deberá reunir simultáneamente las siguientes condiciones',
  ),
  tradeContract: boe(
    'BOE-A-2007-13409',
    'a12',
    '2026-09-02',
    '2011-12-11',
    'se formalizará siempre por escrito',
  ),
  profession: boe(
    'BOE-A-2006-12151',
    'a5',
    '2020-04-30',
    '2006-09-09',
    'cumplir, si procede, el resto de condiciones habilitantes legalmente establecidas',
    'ES-CT',
  ),
  professionalCompany: boe(
    'BOE-A-2007-5584',
    'a1',
    '2025-01-03',
    '2007-06-16',
    'deberán constituirse como sociedades profesionales',
  ),
  professionalRegister: boe(
    'BOE-A-2007-5584',
    'a8',
    '2025-01-03',
    '2007-06-16',
    'Registro de Sociedades Profesionales',
  ),
  identity: boe('BOE-A-2015-10565', 'a9', '2024-11-06', '2022-06-30', 'verificar la identidad'),
  representation: boe(
    'BOE-A-2015-10565',
    'a5',
    '2024-11-06',
    '2016-10-02',
    'deberá acreditarse la representación',
  ),
  signature: boe(
    'BOE-A-2015-10565',
    'a10',
    '2024-11-06',
    '2022-06-30',
    'integridad e inalterabilidad',
  ),
  signatureUse: boe('BOE-A-2015-10565', 'a11', '2024-11-06', '2016-10-02', 'Formular solicitudes'),
  electronic: boe('BOE-A-2015-10565', 'a14', '2024-11-06', '2016-10-02', 'Las personas jurídicas'),
  notice: boe(
    'BOE-A-2015-10565',
    'a41',
    '2024-11-06',
    '2016-10-02',
    'no para la práctica de notificaciones',
  ),
  notification: boe('BOE-A-2015-10565', 'a43', '2024-11-06', '2016-10-02', 'acceso a su contenido'),
} satisfies Record<string, Evidence>;

type SourceKey = keyof typeof preparationSources;
type Statement = { source: SourceKey; text: Guide['title'] };
type Entry = {
  id: string;
  domain: 'D-01' | 'D-02' | 'D-16';
  title: Guide['title'];
  profiles: string[];
  questions: Guide['title'][];
  condition: Statement;
  exclusion: Statement;
  steps: Statement[];
  gaps: { text: Guide['title']; urls: string[] }[];
};

const profiles = [
  'individual',
  'with-premises',
  'without-premises',
  'with-employees',
  'without-employees',
  'pluriactivity',
  'unemployment',
  'foreign-national',
  'societario',
  'collaborator',
  'alternative-mutuality',
  'regulated-profession',
];
const specificProcedure = {
  text: text(
    'Falta comprovar el mètode, la representació i els efectes en la fitxa i pantalla concreta del tràmit. No hi ha verificació de sessió autenticada.',
    'Falta comprobar el método, la representación y los efectos en la ficha y pantalla concreta del trámite. No hay verificación de sesión autenticada.',
  ),
  urls: [
    'https://web.gencat.cat/ca/seu-electronica/tramitacio/suport-tramitacio/durant-la-tramitacio/signar-i-identificar-digitalment/idcat-mobil',
    'https://seuelectronica.ajuntament.barcelona.cat/ca/sistemes-didentificacio-i-de-signatura-electronica',
    'https://seu.girona.cat/portal/girona_ca/faq/index.html',
    'https://tramits.paeria.cat/Ciutadania/DetallTramit.aspx?Cercador=True&IdTramit=730',
    'https://www.tarragona.cat/lajuntament/ajuntament-en-linia',
  ],
};

const entries: Entry[] = [
  {
    id: 'prepare-activity',
    domain: 'D-01',
    title: text(
      'Preparar activitat, municipi i establiment',
      'Preparar actividad, municipio y establecimiento',
    ),
    profiles,
    questions: [
      text(
        'Quina activitat, municipi i instal·lació vols iniciar?',
        '¿Qué actividad, municipio e instalación quieres iniciar?',
      ),
      text(
        'Tindràs local, obres o persones empleades?',
        '¿Tendrás local, obras o personas empleadas?',
      ),
    ],
    condition: {
      source: 'search',
      text: text(
        'La cerca parteix de l’activitat i la ubicació declarades.',
        'La búsqueda parte de la actividad y ubicación declaradas.',
      ),
    },
    exclusion: {
      source: 'search',
      text: text(
        'Un canvi de respostes pot canviar el mapa; no reutilitzis el resultat d’un altre cas.',
        'Un cambio de respuestas puede cambiar el mapa; no reutilices el resultado de otro caso.',
      ),
    },
    steps: [
      {
        source: 'search',
        text: text(
          'Obre la Cerca guiada oficial i selecciona l’activitat i el municipi.',
          'Abre la Cerca guiada oficial y selecciona la actividad y el municipio.',
        ),
      },
      {
        source: 'search',
        text: text(
          'Respon les preguntes sobre instal·lacions i consulta l’ordre, documents i organismes del resultat.',
          'Responde las preguntas sobre instalaciones y consulta el orden, documentos y organismos del resultado.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'La guia no determina llicències locals o sectorials. Barcelona, Girona, Lleida i Tarragona necessiten la seva fitxa pròpia; altres municipis queden fora de cobertura local.',
          'La guía no determina licencias locales o sectoriales. Barcelona, Girona, Lleida y Tarragona necesitan su propia ficha; otros municipios quedan fuera de cobertura local.',
        ),
        urls: [preparationSources.search.url],
      },
    ],
  },
  {
    id: 'individual-pathway',
    domain: 'D-01',
    title: text(
      'Triar la via d’inici com a persona física',
      'Elegir la vía de inicio como persona física',
    ),
    profiles: profiles.filter(
      (profile) => !['societario', 'collaborator', 'alternative-mutuality'].includes(profile),
    ),
    questions: [
      text(
        'Actuaràs com a persona física? Ja tens alguna alta?',
        '¿Actuarás como persona física? ¿Ya tienes alguna alta?',
      ),
      text(
        'Vols PAE/OGE o el canal telemàtic i tens identificació acceptada?',
        '¿Quieres PAE/OGE o el canal telemático y tienes identificación aceptada?',
      ),
    ],
    condition: {
      source: 'individual',
      text: text(
        'Aquesta via és per treballar per compte propi com a persona física.',
        'Esta vía es para trabajar por cuenta propia como persona física.',
      ),
    },
    exclusion: {
      source: 'individual',
      text: text(
        'La via de mutualitat alternativa no es gestiona des d’OGE.',
        'La vía de mutualidad alternativa no se gestiona desde OGE.',
      ),
    },
    steps: [
      {
        source: 'individual',
        text: text(
          'Revisa la fitxa resum de dades de l’alta i prepara els documents per al portal oficial.',
          'Revisa la ficha resumen de datos del alta y prepara los documentos para el portal oficial.',
        ),
      },
      {
        source: 'individual',
        text: text(
          'Tria el PAE/OGE amb cita o la via electrònica indicada. Comprova les altes incloses abans de repetir-les a AEAT o TGSS.',
          'Elige el PAE/OGE con cita o la vía electrónica indicada. Comprueba las altas incluidas antes de repetirlas en AEAT o TGSS.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'No es resolen aquí cotització, fiscalitat, prestacions, permisos de treball ni obertura del local. La regla genèrica de quota mensual de la fitxa no es publica com a universal.',
          'No se resuelven aquí cotización, fiscalidad, prestaciones, permisos de trabajo ni apertura del local. La regla genérica de cuota mensual de la ficha no se publica como universal.',
        ),
        urls: [preparationSources.individual.url],
      },
    ],
  },
  {
    id: 'limited-company',
    domain: 'D-02',
    title: text('Preparar una societat limitada', 'Preparar una sociedad limitada'),
    profiles: ['societario'],
    questions: [
      text(
        'Vols constituir una SL nova? Quins socis i administradors tindrà?',
        '¿Quieres constituir una SL nueva? ¿Qué socios y administradores tendrá?',
      ),
      text(
        'Quin capital i quina activitat professional tindrà?',
        '¿Qué capital y qué actividad profesional tendrá?',
      ),
    ],
    condition: {
      source: 'company',
      text: text(
        'La fitxa tracta la constitució d’una SL.',
        'La ficha trata la constitución de una SL.',
      ),
    },
    exclusion: {
      source: 'capital',
      text: text(
        'Amb capital inferior a 3.000 € hi ha regles addicionals; no pressuposis absència de responsabilitat.',
        'Con capital inferior a 3.000 € hay reglas adicionales; no presupongas ausencia de responsabilidad.',
      ),
    },
    steps: [
      {
        source: 'company',
        text: text(
          'Sol·licita la certificació de denominació al Registre Mercantil Central i prepara dades de socis, administració i activitat.',
          'Solicita la certificación de denominación al Registro Mercantil Central y prepara datos de socios, administración y actividad.',
        ),
      },
      {
        source: 'capital',
        text: text(
          'Consulta l’article 4 de la LSC: mínim d’1 €; per sota de 3.000 €, reserva legal d’almenys el 20 % del benefici fins que reserva i capital sumin 3.000 €, i responsabilitat solidària en liquidació en els supòsits previstos.',
          'Consulta el artículo 4 de la LSC: mínimo de 1 €; por debajo de 3.000 €, reserva legal de al menos el 20 % del beneficio hasta que reserva y capital sumen 3.000 €, y responsabilidad solidaria en liquidación en los supuestos previstos.',
        ),
      },
      {
        source: 'company',
        text: text(
          'Revisa la documentació i cita OGE de la fitxa; la notaria i el Registre Mercantil tenen funcions i costos propis.',
          'Revisa la documentación y cita OGE de la ficha; la notaría y el Registro Mercantil tienen funciones y costes propios.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'Constituir la SL no decideix l’enquadrament de cada soci ni els permisos d’obertura. S’exclou el capital antic de PDFs històrics.',
          'Constituir la SL no decide el encuadramiento de cada socio ni los permisos de apertura. Se excluye el capital antiguo de PDFs históricos.',
        ),
        urls: [preparationSources.companyWork.url],
      },
    ],
  },
  {
    id: 'societario-role',
    domain: 'D-02',
    title: text(
      'Separar soci, administrador i treball efectiu',
      'Separar socio, administrador y trabajo efectivo',
    ),
    profiles: ['societario'],
    questions: [
      text(
        'Prestes serveis o direcció? Amb quina habitualitat i remuneració?',
        '¿Prestas servicios o dirección? ¿Con qué habitualidad y remuneración?',
      ),
      text(
        'Quina participació i control directe, indirecte o familiar tens?',
        '¿Qué participación y control directo, indirecto o familiar tienes?',
      ),
    ],
    condition: {
      source: 'companyWork',
      text: text(
        'L’article 305 considera funcions, serveis i control efectiu.',
        'El artículo 305 considera funciones, servicios y control efectivo.',
      ),
    },
    exclusion: {
      source: 'companyWork',
      text: text(
        'Ser soci, sense més dades, no determina automàticament RETA.',
        'Ser socio, sin más datos, no determina automáticamente RETA.',
      ),
    },
    steps: [
      {
        source: 'companyWork',
        text: text(
          'Compara les funcions i el control amb els supòsits de l’article 305.2.b; consulta TGSS abans de seleccionar un enquadrament.',
          'Compara las funciones y el control con los supuestos del artículo 305.2.b; consulta TGSS antes de seleccionar un encuadramiento.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'La guia no determina un enquadrament individual ni una exempció fiscal.',
          'La guía no determina un encuadramiento individual ni una exención fiscal.',
        ),
        urls: [
          'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10548/32825',
        ],
      },
    ],
  },
  {
    id: 'family-collaborator',
    domain: 'D-02',
    title: text(
      'Preparar la branca de familiar col·laborador',
      'Preparar la rama de familiar colaborador',
    ),
    profiles: ['collaborator'],
    questions: [
      text(
        'Quin parentiu i convivència hi ha amb el titular?',
        '¿Qué parentesco y convivencia hay con el titular?',
      ),
      text(
        'El treball és habitual? Hi ha relació laboral per compte d’altri?',
        '¿El trabajo es habitual? ¿Hay relación laboral por cuenta ajena?',
      ),
    ],
    condition: {
      source: 'family',
      text: text(
        'Cal contrastar parentiu, treball i relació laboral amb l’article 305.2.k.',
        'Hay que contrastar parentesco, trabajo y relación laboral con el artículo 305.2.k.',
      ),
    },
    exclusion: {
      source: 'family',
      text: text(
        'El parentiu sol no resol la inclusió; l’article remet a l’article 12.',
        'El parentesco solo no resuelve la inclusión; el artículo remite al artículo 12.',
      ),
    },
    steps: [
      {
        source: 'family',
        text: text(
          'Comprova els supòsits dels articles 305 i 12 i consulta el canal oficial TGSS amb la situació declarada.',
          'Comprueba los supuestos de los artículos 305 y 12 y consulta el canal oficial TGSS con la situación declarada.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'Falten la fitxa operativa d’alta del col·laborador i la branca fiscal pròpia; no s’afirma una exempció AEAT.',
          'Faltan la ficha operativa de alta del colaborador y la rama fiscal propia; no se afirma una exención AEAT.',
        ),
        urls: [
          'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/Afiliacion/10548/32825',
        ],
      },
    ],
  },
  {
    id: 'alternative-mutuality',
    domain: 'D-02',
    title: text('Comprovar la mutualitat alternativa', 'Comprobar la mutualidad alternativa'),
    profiles: ['alternative-mutuality', 'regulated-profession'],
    questions: [
      text(
        'Quina professió, col·legi i mutualitat tens?',
        '¿Qué profesión, colegio y mutualidad tienes?',
      ),
      text(
        'Quan vas iniciar l’activitat i quina opció vas exercir? Ja hi ha alta RETA?',
        '¿Cuándo iniciaste la actividad y qué opción ejerciste? ¿Ya hay alta RETA?',
      ),
    ],
    condition: {
      source: 'mutuality',
      text: text(
        'L’alternativa depèn dels supòsits de la disposició addicional 18 de la LGSS.',
        'La alternativa depende de los supuestos de la disposición adicional 18 de la LGSS.',
      ),
    },
    exclusion: {
      source: 'mutuality',
      text: text(
        'Una mutualitat qualsevol no és automàticament alternativa al RETA.',
        'Una mutualidad cualquiera no es automáticamente alternativa al RETA.',
      ),
    },
    steps: [
      {
        source: 'mutuality',
        text: text(
          'Contrasta professió, mutualitat i antecedents d’opció amb la disposició addicional 18 reformada el 2026; consulta TGSS i el col·legi abans de tramitar.',
          'Contrasta profesión, mutualidad y antecedentes de opción con la disposición adicional 18 reformada en 2026; consulta TGSS y el colegio antes de tramitar.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'No s’ha acreditat el servei operatiu ni desenvolupament de la pasarela; no s’ofereix una transferència automàtica. La via OGE d’alta individual no cobreix aquesta opció.',
          'No se ha acreditado el servicio operativo ni desarrollo de la pasarela; no se ofrece una transferencia automática. La vía OGE de alta individual no cubre esta opción.',
        ),
        urls: [
          'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-16653',
          preparationSources.individual.url,
        ],
      },
    ],
  },
  {
    id: 'regulated-profession',
    domain: 'D-02',
    title: text(
      'Comprovar l’accés a una professió titulada',
      'Comprobar el acceso a una profesión titulada',
    ),
    profiles: ['regulated-profession', 'foreign-national', 'alternative-mutuality'],
    questions: [
      text(
        'Quina professió i títol tens? On s’ha obtingut?',
        '¿Qué profesión y título tienes? ¿Dónde se ha obtenido?',
      ),
      text(
        'Actuaràs individualment o en una societat professional?',
        '¿Actuarás individualmente o en una sociedad profesional?',
      ),
    ],
    condition: {
      source: 'profession',
      text: text(
        'L’exercici exigeix el títol i, si escau, les altres condicions legals habilitants.',
        'El ejercicio exige el título y, en su caso, las demás condiciones legales habilitantes.',
      ),
    },
    exclusion: {
      source: 'profession',
      text: text(
        'Un directori de col·legis no prova tots els requisits de la professió concreta.',
        'Un directorio de colegios no prueba todos los requisitos de la profesión concreta.',
      ),
    },
    steps: [
      {
        source: 'profession',
        text: text(
          'Localitza l’autoritat de la professió i contrasta títol, reconeixement professional i condicions específiques abans d’exercir.',
          'Localiza la autoridad de la profesión y contrasta título, reconocimiento profesional y condiciones específicas antes de ejercer.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'Falten normes per professió, assegurança i autoritzacions específiques. Per títol estranger cal la via de reconeixement aplicable; aquesta guia no acredita homologació ni permís de treball.',
          'Faltan normas por profesión, seguro y autorizaciones específicas. Para título extranjero hace falta la vía de reconocimiento aplicable; esta guía no acredita homologación ni permiso de trabajo.',
        ),
        urls: [
          'https://justicia.gencat.cat/ca/ambits/dret_i_entitats_juridiques/col_legis_professionals/',
          'https://www.ciencia.gob.es/Universidades/validate/homologacion.html',
        ],
      },
    ],
  },
  {
    id: 'professional-company',
    domain: 'D-02',
    title: text(
      'Distingir societat professional i SL ordinària',
      'Distinguir sociedad profesional y SL ordinaria',
    ),
    profiles: ['societario', 'regulated-profession'],
    questions: [
      text(
        'La societat exerceix en comú l’activitat professional sota la seva raó social?',
        '¿La sociedad ejerce en común la actividad profesional bajo su razón social?',
      ),
    ],
    condition: {
      source: 'professionalCompany',
      text: text(
        'La Llei 2/2007 delimita l’exercici professional en comú.',
        'La Ley 2/2007 delimita el ejercicio profesional en común.',
      ),
    },
    exclusion: {
      source: 'professionalCompany',
      text: text(
        'No classifiquis com a professional qualsevol societat de serveis sense comprovar l’objecte i l’exercici.',
        'No clasifiques como profesional cualquier sociedad de servicios sin comprobar el objeto y el ejercicio.',
      ),
    },
    steps: [
      {
        source: 'professionalCompany',
        text: text(
          'Compara l’objecte i el treball amb l’article 1 abans de triar el règim societari.',
          'Compara el objeto y el trabajo con el artículo 1 antes de elegir el régimen societario.',
        ),
      },
      {
        source: 'professionalRegister',
        text: text(
          'Si correspon una societat professional, prepara les inscripcions mercantil i col·legial de l’article 8 amb els organismes competents.',
          'Si corresponde una sociedad profesional, prepara las inscripciones mercantil y colegial del artículo 8 con los organismos competentes.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'La branca no determina la qualificació d’un objecte societari ambigu ni requisits de cada professió.',
          'La rama no determina la calificación de un objeto societario ambiguo ni requisitos de cada profesión.',
        ),
        urls: [preparationSources.professionalCompany.url],
      },
    ],
  },
  {
    id: 'trade',
    domain: 'D-02',
    title: text(
      'Comprovar dependència econòmica i contracte TRADE',
      'Comprobar dependencia económica y contrato TRADE',
    ),
    profiles: profiles.filter(
      (profile) => !['societario', 'collaborator', 'alternative-mutuality'].includes(profile),
    ),
    questions: [
      text(
        'Quina proporció d’ingressos prové del client principal?',
        '¿Qué proporción de ingresos procede del cliente principal?',
      ),
      text(
        'Com organitzes el treball? Tens personal, subcontractació o instal·lacions pròpies?',
        '¿Cómo organizas el trabajo? ¿Tienes personal, subcontratación o instalaciones propias?',
      ),
    ],
    condition: {
      source: 'trade',
      text: text(
        'L’article 11 exigeix condicions simultànies, no només dependència d’ingressos.',
        'El artículo 11 exige condiciones simultáneas, no solo dependencia de ingresos.',
      ),
    },
    exclusion: {
      source: 'trade',
      text: text(
        'Un 75 % d’ingressos d’un client no basta; cal comprovar excepcions i relació real.',
        'Un 75 % de ingresos de un cliente no basta; hay que comprobar excepciones y relación real.',
      ),
    },
    steps: [
      {
        source: 'trade',
        text: text(
          'Revisa tots els supòsits i excepcions de l’article 11 abans de considerar-te TRADE.',
          'Revisa todos los supuestos y excepciones del artículo 11 antes de considerarte TRADE.',
        ),
      },
      {
        source: 'tradeContract',
        text: text(
          'Si compleixes les condicions, prepara contracte escrit i consulta el registre oficial SEPE.',
          'Si cumples las condiciones, prepara contrato escrito y consulta el registro oficial SEPE.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'No s’ha acreditat aquí el termini operatiu del registre; no es determina una relació laboral individual.',
          'No se ha acreditado aquí el plazo operativo del registro; no se determina una relación laboral individual.',
        ),
        urls: [
          'https://sede.sepe.gob.es/portalSede/es/procedimientos-y-servicios/personas/contratos',
        ],
      },
    ],
  },
  {
    id: 'digital-identity',
    domain: 'D-16',
    title: text('Preparar la identificació del tràmit', 'Preparar la identificación del trámite'),
    profiles,
    questions: [
      text(
        'En quin organisme i tràmit actuaràs, per tu o una entitat?',
        '¿En qué organismo y trámite actuarás, por ti o una entidad?',
      ),
    ],
    condition: {
      source: 'identity',
      text: text(
        'Cal identificar qui intervé en el procediment.',
        'Hay que identificar quién interviene en el procedimiento.',
      ),
    },
    exclusion: {
      source: 'identity',
      text: text(
        'No pressuposis que idCAT Mòbil sigui suficient per a qualsevol actuació.',
        'No presupongas que idCAT Mòbil sea suficiente para cualquier actuación.',
      ),
    },
    steps: [
      {
        source: 'identity',
        text: text(
          'Consulta els sistemes acceptats en la fitxa oficial; identifica’t exclusivament al control oficial.',
          'Consulta los sistemas aceptados en la ficha oficial; identifícate exclusivamente en el control oficial.',
        ),
      },
    ],
    gaps: [
      specificProcedure,
      {
        text: text(
          'No es reprodueixen manuals FNMT: permís de reutilització no acreditat.',
          'No se reproducen manuales FNMT: permiso de reutilización no acreditado.',
        ),
        urls: ['https://www.sede.fnmt.gob.es/aviso-legal'],
      },
    ],
  },
  {
    id: 'representation',
    domain: 'D-16',
    title: text(
      'Preparar representació i poder suficient',
      'Preparar representación y poder suficiente',
    ),
    profiles,
    questions: [
      text(
        'A qui representes i per a quin acte? Quin poder i vigència té?',
        '¿A quién representas y para qué acto? ¿Qué poder y vigencia tiene?',
      ),
    ],
    condition: {
      source: 'representation',
      text: text(
        'Per presentar una sol·licitud aliena cal acreditar representació.',
        'Para presentar una solicitud ajena hay que acreditar representación.',
      ),
    },
    exclusion: {
      source: 'representation',
      text: text(
        'Identificar-te no acredita per si sol el poder per actuar per una altra persona.',
        'Identificarte no acredita por sí solo el poder para actuar por otra persona.',
      ),
    },
    steps: [
      {
        source: 'representation',
        text: text(
          'Comprova facultats, acte i mitjà d’acreditació admès per l’organisme abans de presentar.',
          'Comprueba facultades, acto y medio de acreditación admitido por el organismo antes de presentar.',
        ),
      },
    ],
    gaps: [
      specificProcedure,
      {
        text: text(
          'No s’acredita intercanvi universal entre REPRESENTA, AEAT i APODERA; no es copia contingut AOC ni es pressuposa permís per traduir-lo.',
          'No se acredita intercambio universal entre REPRESENTA, AEAT y APODERA; no se copia contenido AOC ni se presupone permiso para traducirlo.',
        ),
        urls: [
          'https://www.aoc.cat/avis-legal/',
          'https://sede.agenciatributaria.gob.es/Sede/ayuda/consultas-informaticas/otros-servicios-ayuda-tecnica/alta-poder-tramites-tributarios.html',
        ],
      },
    ],
  },
  {
    id: 'signature',
    domain: 'D-16',
    title: text('Distingir identificació i firma', 'Distinguir identificación y firma'),
    profiles,
    questions: [
      text(
        'Vols identificar-te, presentar, recórrer, desistir o renunciar?',
        '¿Quieres identificarte, presentar, recurrir, desistir o renunciar?',
      ),
    ],
    condition: {
      source: 'signatureUse',
      text: text(
        'Presentar sol·licituds és un dels actes per als quals es requereix firma.',
        'Presentar solicitudes es uno de los actos para los que se requiere firma.',
      ),
    },
    exclusion: {
      source: 'signature',
      text: text(
        'Identificació i firma no són sempre intercanviables.',
        'Identificación y firma no son siempre intercambiables.',
      ),
    },
    steps: [
      {
        source: 'signature',
        text: text(
          'Comprova el sistema de firma admès i utilitza el control oficial; la guia no rep claus, certificats ni contrasenyes.',
          'Comprueba el sistema de firma admitido y utiliza el control oficial; la guía no recibe claves, certificados ni contraseñas.',
        ),
      },
    ],
    gaps: [specificProcedure],
  },
  {
    id: 'electronic-channel',
    domain: 'D-16',
    title: text(
      'Comprovar si el canal electrònic és obligatori',
      'Comprobar si el canal electrónico es obligatorio',
    ),
    profiles,
    questions: [
      text(
        'Actues com a entitat, professional de col·legiació obligatòria o representant d’un subjecte obligat?',
        '¿Actúas como entidad, profesional de colegiación obligatoria o representante de un sujeto obligado?',
      ),
    ],
    condition: {
      source: 'electronic',
      text: text(
        'Les persones jurídiques estan obligades al canal electrònic.',
        'Las personas jurídicas están obligadas al canal electrónico.',
      ),
    },
    exclusion: {
      source: 'electronic',
      text: text(
        'La regla de lliure elecció d’una persona física té excepcions.',
        'La regla de libre elección de una persona física tiene excepciones.',
      ),
    },
    steps: [
      {
        source: 'electronic',
        text: text(
          'Contrasta subjecte i actuació amb l’article 14 i la normativa del tràmit abans d’escollir canal.',
          'Contrasta sujeto y actuación con el artículo 14 y la normativa del trámite antes de elegir canal.',
        ),
      },
    ],
    gaps: [specificProcedure],
  },
  {
    id: 'notifications',
    domain: 'D-16',
    title: text(
      'Distingir avís i accés a una notificació',
      'Distinguir aviso y acceso a una notificación',
    ),
    profiles,
    questions: [
      text(
        'Quin organisme notifica? És un avís o una notificació posada a disposició?',
        '¿Qué organismo notifica? ¿Es un aviso o una notificación puesta a disposición?',
      ),
    ],
    condition: {
      source: 'notification',
      text: text(
        'L’accés al contingut de la notificació electrònica produeix efectes.',
        'El acceso al contenido de la notificación electrónica produce efectos.',
      ),
    },
    exclusion: {
      source: 'notice',
      text: text(
        'L’avís de correu o dispositiu no és la notificació mateixa.',
        'El aviso de correo o dispositivo no es la notificación misma.',
      ),
    },
    steps: [
      {
        source: 'notification',
        text: text(
          'Localitza la seu de l’organisme i comprova els efectes abans d’accedir al contingut; no s’obre automàticament.',
          'Localiza la sede del organismo y comprueba los efectos antes de acceder al contenido; no se abre automáticamente.',
        ),
      },
    ],
    gaps: [
      {
        text: text(
          'No es calcula el termini de resposta o recurs des del missatge; falta l’acte, posada a disposició i regla específica. No es declara DEHú universal per a totes les notificacions.',
          'No se calcula el plazo de respuesta o recurso desde el mensaje; falta el acto, puesta a disposición y regla específica. No se declara DEHú universal para todas las notificaciones.',
        ),
        urls: [
          'https://dehu.redsara.es/faq',
          'https://web.gencat.cat/ca/seu-electronica/tramitacio/suport-tramitacio/despres-fer-un-tramit/notificacions-electroniques-tramit/rebre-notificacio-electronica-o-requeriment',
        ],
      },
    ],
  },
];

/** Product proposals, not automatically approved legal guidance or an enabled catalogue. */
export const preparationGuides: Guide[] = entries.map((entry) => {
  const statements = [entry.condition, entry.exclusion, ...entry.steps];
  const evidence = [...new Set(statements.map((item) => item.source))].map(
    (key) => preparationSources[key],
  );
  const cite = (item: Statement, id: string) => ({
    id,
    text: item.text,
    evidenceIds: [preparationSources[item.source].id],
    translation: preparationSources[item.source].language === 'ca' ? 'es' : 'ca',
  });
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
    conditions: [cite(entry.condition, 'condition')],
    exclusions: [cite(entry.exclusion, 'exclusion')],
    claims: [],
    steps: entry.steps.map((step, index) => ({
      ...cite(step, `step-${index + 1}`),
      dependsOn: index ? [`step-${index}`] : [],
    })),
  });
});

/** Public handoffs, not eligibility decisions. Multiple profiles may apply together. */
export const preparationProfileBranches = [
  {
    profile: 'with-premises',
    questions: [
      text(
        'Quina activitat, municipi, local i obres tens previstos?',
        '¿Qué actividad, municipio, local y obras tienes previstos?',
      ),
    ],
    domains: ['D-06', 'D-07'],
    urls: [preparationSources.search.url],
    limitation: text(
      'Cal la fitxa local i sectorial; constituir o donar-se d’alta no acredita obertura.',
      'Hace falta la ficha local y sectorial; constituirse o darse de alta no acredita apertura.',
    ),
  },
  {
    profile: 'without-premises',
    questions: [
      text(
        'On es farà realment l’activitat? Hi haurà instal·lacions, domicili professional o ús de l’espai públic?',
        '¿Dónde se hará realmente la actividad? ¿Habrá instalaciones, domicilio profesional o uso del espacio público?',
      ),
    ],
    domains: ['D-06', 'D-07'],
    urls: [preparationSources.search.url],
    limitation: text(
      'Sense local comercial no equival a sense requisits municipals o sectorials.',
      'Sin local comercial no equivale a sin requisitos municipales o sectoriales.',
    ),
  },
  {
    profile: 'with-employees',
    questions: [
      text(
        'Contractaràs personal? Per a quina activitat i centre de treball?',
        '¿Contratarás personal? ¿Para qué actividad y centro de trabajo?',
      ),
    ],
    domains: ['D-09', 'D-10'],
    urls: ['https://www.seg-social.es/wps/portal/wss/internet/Empresarios/Inscripcion'],
    limitation: text(
      'Falta la branca d’ocupador i prevenció; l’alta pròpia no les substitueix.',
      'Falta la rama de empleador y prevención; el alta propia no las sustituye.',
    ),
  },
  {
    profile: 'without-employees',
    questions: [
      text(
        'Treballaràs sol o amb subcontractació o altres empreses al centre?',
        '¿Trabajarás solo o con subcontratación u otras empresas en el centro?',
      ),
    ],
    domains: ['D-10'],
    urls: ['https://www.insst.es/materias/transversales/gestion-prevencion/cae'],
    limitation: text(
      'No es resolen aquí les condicions preventives sense personal ni la coordinació.',
      'No se resuelven aquí las condiciones preventivas sin personal ni la coordinación.',
    ),
  },
  {
    profile: 'pluriactivity',
    questions: [
      text(
        'Quins altres treballs i règims mantindràs i en quines dates?',
        '¿Qué otros trabajos y regímenes mantendrás y en qué fechas?',
      ),
    ],
    domains: ['D-04'],
    urls: [
      'https://portal.seg-social.gob.es/wps/portal/importass/importass/Colectivos/Trabajo%2BAutonomo',
    ],
    limitation: text(
      'Falta la branca de cotització; tenir feina assalariada no decideix per si sol el règim de l’activitat nova.',
      'Falta la rama de cotización; tener empleo asalariado no decide por sí solo el régimen de la actividad nueva.',
    ),
  },
  {
    profile: 'unemployment',
    questions: [
      text(
        'Perceps o has sol·licitat una prestació? Quina i quan vols iniciar l’activitat?',
        '¿Percibes o has solicitado una prestación? ¿Cuál y cuándo quieres iniciar la actividad?',
      ),
    ],
    domains: ['D-05'],
    urls: ['https://www.sepe.es/HomeSepe/es/autonomos.html'],
    limitation: text(
      'No s’acredita aquí compatibilitat, capitalització o suspensió; cal la branca SEPE abans de decidir.',
      'No se acredita aquí compatibilidad, capitalización o suspensión; hace falta la rama SEPE antes de decidir.',
    ),
  },
  {
    profile: 'foreign-national',
    questions: [
      text(
        'Quin règim de residència i treball tens? L’autorització cobreix compte propi i aquesta activitat?',
        '¿Qué régimen de residencia y trabajo tienes? ¿La autorización cubre cuenta propia y esta actividad?',
      ),
    ],
    domains: ['D-14'],
    urls: ['https://treball.gencat.cat/ca/ambits/estrangeria/'],
    limitation: text(
      'L’alta fiscal o de Seguretat Social no acredita per si sola autorització de treball ni reconeixement del títol.',
      'El alta fiscal o de Seguridad Social no acredita por sí sola autorización de trabajo ni reconocimiento del título.',
    ),
  },
];

/** Only public questions and references. Answers never belong to this shared corpus. */
export const preparationCoverage = entries.map((entry) => ({
  guideId: entry.id,
  status: 'partial' as const,
  questions: entry.questions,
  profileBranches: preparationProfileBranches.filter((branch) =>
    entry.profiles.includes(branch.profile),
  ),
  gaps: entry.gaps,
}));

export const preparationRights = {
  consultedAt,
  boe: {
    url: 'https://www.boe.es/informacion/aviso_legal/index.php',
    scope:
      'Textos legales citados; extractos breves y adaptación propia, no Biblioteca Jurídica Digital',
    conditions:
      'Atribución, enlace, actualización, modificación identificada y carácter informativo del consolidado; sin aval ni elementos gráficos',
  },
  gencat: {
    url: 'https://web.gencat.cat/ca/avis-legal',
    scope:
      'Texto público de las tres páginas citadas, sin formularios, PDFs de terceros, logos o datos personales',
    conditions:
      'Fuente, última actualización, sentido y licencia específica prevalente; traducción del producto identificada',
  },
  excluded: [
    {
      url: 'https://www.aoc.cat/avis-legal/',
      reason: 'No se acredita permiso para adaptar o traducir artículos de soporte',
    },
    {
      url: 'https://www.sede.fnmt.gob.es/aviso-legal',
      reason: 'Derechos reservados; autorización escrita no acreditada',
    },
  ],
};
