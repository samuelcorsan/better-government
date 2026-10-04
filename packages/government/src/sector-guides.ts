import { guideSchema, type Guide } from '@reforma-digital/core';

// These public-page observations are candidates, not an approved legal corpus.
const observedAt = '2026-10-04';
type Sector = {
  id: string;
  title: Guide['title'];
  url: string;
  urlEs: string;
  source: string;
  updated: string;
  updatedEs?: string;
  quote: string;
  quoteEs: string;
  exceptionQuote?: string;
  exceptionQuoteEs?: string;
  condition: Guide['title'];
  exclusion: Guide['title'];
  action: Guide['title'];
  authority: Guide['title'];
  questions: Guide['title'][];
  gap: Guide['title'];
};

/** One narrowly scoped path per sector; unanswered profile questions block personal routing. */
const sectors: Sector[] = [
  {
    id: 'food-rsipac',
    title: { ca: 'Aliments d’origen animal i RSIPAC', es: 'Alimentos de origen animal y RSIPAC' },
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Registre-sanitari-dindustries-i-productes-alimentaris-de-Catalunya-RSIPAC-00001?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Registre-sanitari-dindustries-i-productes-alimentaris-de-Catalunya-RSIPAC-00001?moda=1',
    source: 'Departament de Salut',
    updated: '2025-11-13',
    quote: "han de sol·licitar una autorització prèvia abans d'iniciar l'activitat",
    quoteEs: 'deben solicitar una autorización previa antes de iniciar la actividad',
    condition: {
      ca: 'Si l’establiment entra al Reglament CE 853/2004, cal autorització prèvia abans de començar.',
      es: 'Si el establecimiento entra en el Reglamento CE 853/2004, hace falta autorización previa antes de empezar.',
    },
    exclusion: {
      ca: 'No pressuposis que una botiga minorista o la venda en línia segueixin aquesta branca.',
      es: 'No presupongas que una tienda minorista o la venta en línea sigan esta rama.',
    },
    action: {
      ca: 'Comprova amb Salut la classificació i, si escau, sol·licita autorització i inscripció al RSIPAC.',
      es: 'Comprueba con Salut la clasificación y, si procede, solicita autorización e inscripción en RSIPAC.',
    },
    authority: {
      ca: 'ASPCAT; registre municipal si la branca minorista ho exigeix',
      es: 'ASPCAT; registro municipal si lo exige la rama minorista',
    },
    questions: [
      {
        ca: 'Quins aliments, operacions i destinataris té l’activitat?',
        es: '¿Qué alimentos, operaciones y destinatarios tiene la actividad?',
      },
    ],
    gap: {
      ca: 'Falten criteris vigents de minoristes i de modalitat d’autorització prèvia.',
      es: 'Faltan criterios vigentes de minoristas y modalidad de autorización previa.',
    },
  },
  {
    id: 'tourism-hut',
    title: { ca: 'Habitatge d’ús turístic', es: 'Vivienda de uso turístico' },
    url: 'https://canalempresa.gencat.cat/ca/03_sectors_d_activitat/06_hostaleria_i_turisme/establiments_turistics/habitatges_d_us_turistic/DL3_2023/',
    urlEs:
      'https://canalempresa.gencat.cat/es/03_sectors_d_activitat/06_hostaleria_i_turisme/establiments_turistics/habitatges_d_us_turistic/DL3_2023/',
    source: 'Canal Empresa',
    updated: '2023-11-09',
    quote:
      'una llicència urbanística municipal i una autorització turística prèviament a l’obertura',
    quoteEs:
      'una licencia urbanística municipal y una autorización turística previamente a la apertura',
    condition: {
      ca: 'Un HUT nou en un municipi afectat requereix llicència urbanística municipal i autorització turística prèvies a l’obertura.',
      es: 'Un HUT nuevo en un municipio afectado requiere licencia urbanística municipal y autorización turística previas a la apertura.',
    },
    exclusion: {
      ca: 'Aquesta branca no classifica hotels, càmpings ni llars compartides.',
      es: 'Esta rama no clasifica hoteles, campings ni hogares compartidos.',
    },
    action: {
      ca: 'Consulta el planejament i tramita la llicència municipal i l’autorització turística abans de la comunicació d’inici.',
      es: 'Consulta el planeamiento y tramita la licencia municipal y la autorización turística antes de la comunicación de inicio.',
    },
    authority: {
      ca: 'Ajuntament per a urbanisme; autoritat turística per a l’autorització; Canal Empresa per a la comunicació',
      es: 'Ayuntamiento para urbanismo; autoridad turística para la autorización; Canal Empresa para la comunicación',
    },
    questions: [
      {
        ca: 'És un HUT nou, en quin municipi, i quin és el seu estat urbanístic?',
        es: '¿Es un HUT nuevo, en qué municipio y cuál es su situación urbanística?',
      },
    ],
    gap: {
      ca: 'El planejament i les suspensions municipals actuals no són aquí verificats.',
      es: 'El planeamiento y las suspensiones municipales actuales no están aquí verificados.',
    },
  },
  {
    id: 'health-centre',
    title: { ca: 'Inici d’un centre sanitari', es: 'Inicio de un centro sanitario' },
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Autoritzacio-de-centres-o-serveis-sanitaris?moda=2',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Autoritzacio-de-centres-o-serveis-sanitaris?moda=2',
    source: 'Departament de Salut',
    updated: '2026-07-21',
    quote: 'S’ha de disposar d’aquesta autorització abans de l’inici de l’activitat',
    quoteEs: 'Se tiene que disponer de esta autorización antes del inicio de la actividad',
    condition: {
      ca: 'Si és un centre o servei sanitari cobert per aquest procediment, cal autorització abans de començar.',
      es: 'Si es un centro o servicio sanitario cubierto por este procedimiento, hace falta autorización antes de empezar.',
    },
    exclusion: {
      ca: 'Farmàcies, òptiques, ortopèdies i audiopròtesis tenen normativa específica.',
      es: 'Farmacias, ópticas, ortopedias y audioprótesis tienen normativa específica.',
    },
    action: {
      ca: 'Selecciona la modalitat d’inici i sol·licita l’autorització sanitària al Departament de Salut.',
      es: 'Selecciona la modalidad de inicio y solicita la autorización sanitaria al Departament de Salut.',
    },
    authority: { ca: 'Departament de Salut', es: 'Departament de Salut' },
    questions: [
      {
        ca: 'Quina oferta assistencial i quin tipus de centre es projecta?',
        es: '¿Qué oferta asistencial y qué tipo de centro se proyecta?',
      },
    ],
    gap: {
      ca: 'Llicències d’obres i obertura municipal s’han de comprovar per local.',
      es: 'Las licencias de obras y apertura municipal deben comprobarse por local.',
    },
  },
  {
    id: 'transport-mdsl',
    title: { ca: 'Transport lleuger MDSL a Catalunya', es: 'Transporte ligero MDSL en Catalunya' },
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Autoritzacio-de-transport-public-lleuger-de-mercaderies-per-carretera-al-territori-catala-MDSL?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Autoritzacio-de-transport-public-lleuger-de-mercaderies-per-carretera-al-territori-catala-MDSL?moda=1',
    source: 'Departament de Territori',
    updated: '2023-03-24',
    quote:
      'una massa màxima autoritzada entre 2 tones i 3,5 tones exclusivament en el territori català',
    quoteEs:
      'una masa máxima autorizada entre 2 toneladas y 3,5 toneladas exclusivamente en el territorio catalán',
    condition: {
      ca: 'MDSL descriu transport remunerat de mercaderies d’altri amb MMA entre 2 i 3,5 tones només dins Catalunya.',
      es: 'MDSL describe transporte remunerado de mercancías ajenas con MMA entre 2 y 3,5 toneladas solo dentro de Catalunya.',
    },
    exclusion: {
      ca: 'No extrapolar a transport propi, viatgers ni rutes internacionals.',
      es: 'No extrapolar a transporte propio, viajeros ni rutas internacionales.',
    },
    action: {
      ca: 'Comprova massa, titular i territori; si encaixa, obre la modalitat d’alta MDSL.',
      es: 'Comprueba masa, titular y territorio; si encaja, abre la modalidad de alta MDSL.',
    },
    authority: {
      ca: 'Departament de Territori; seu estatal de transports com a canal',
      es: 'Departament de Territori; sede estatal de transportes como canal',
    },
    questions: [
      {
        ca: 'Compte propi o aliè, MMA del vehicle i territori real?',
        es: '¿Cuenta propia o ajena, MMA del vehículo y territorio real?',
      },
    ],
    gap: {
      ca: 'Cal reconfirmar els requisits normatius i la modalitat d’alta actuals.',
      es: 'Falta reconfirmar los requisitos normativos y la modalidad de alta actuales.',
    },
  },
  {
    id: 'industry-workshop',
    title: { ca: 'Inici d’un taller de vehicles', es: 'Inicio de un taller de vehículos' },
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Taller-de-reparacio-de-vehicles-automobils?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Taller-de-reparacio-de-vehicles-automobils?moda=1',
    source: 'Departament d’Empresa i Treball',
    updated: '2026-07-07',
    quote: 'han de presentar a l’Administració una declaració responsable',
    quoteEs: 'deben presentar a la Administración una declaración responsable',
    condition: {
      ca: 'Per iniciar un taller de reparació de vehicles cal declarar el compliment dels requisits sectorials.',
      es: 'Para iniciar un taller de reparación de vehículos hay que declarar el cumplimiento de los requisitos sectoriales.',
    },
    exclusion: {
      ca: 'No aplicar aquesta declaració a una fàbrica, ITV o instal·lador.',
      es: 'No aplicar esta declaración a una fábrica, ITV o instalador.',
    },
    action: {
      ca: 'Revisa la modalitat d’inici del taller i presenta la declaració sectorial quan correspongui.',
      es: 'Revisa la modalidad de inicio del taller y presenta la declaración sectorial cuando corresponda.',
    },
    authority: {
      ca: 'Departament d’Empresa i Treball, RASIC',
      es: 'Departament d’Empresa i Treball, RASIC',
    },
    questions: [
      {
        ca: 'Taller nou, trasllat o canvi de titular? Quines instal·lacions té?',
        es: '¿Taller nuevo, traslado o cambio de titular? ¿Qué instalaciones tiene?',
      },
    ],
    gap: {
      ca: 'La declaració sectorial no resol el règim ambiental ni municipal del local.',
      es: 'La declaración sectorial no resuelve el régimen ambiental ni municipal del local.',
    },
  },
  {
    id: 'environment-annex',
    title: {
      ca: 'Classificació ambiental d’una activitat',
      es: 'Clasificación ambiental de una actividad',
    },
    url: 'https://canalempresa.gencat.cat/ca/02_serveis_per_temes/04_sostenibilitat/01_afectacio_al_medi/03_prevencio_i_control_ambiental_de_les_activitats_empresarials/',
    urlEs:
      'https://canalempresa.gencat.cat/es/integraciodepartamentaltramit/tramit/PerTemes/Comunicacio-previa-ambiental-Annex-III',
    source: 'Canal Empresa',
    updated: '2014-02-12',
    updatedEs: '2016-03-11',
    quote: 'les descrites a l’annex III de la Llei de prevenció i control ambiental',
    quoteEs:
      'Se someten a este régimen las actividades relacionadas en el Anexo III de la Ley 20/2009',
    condition: {
      ca: 'La comunicació ambiental municipal és una via per a activitats classificades a l’annex III.',
      es: 'La comunicación ambiental municipal es una vía para actividades clasificadas en el anexo III.',
    },
    exclusion: {
      ca: 'El nom comercial o CNAE no acrediten per si sols l’annex aplicable.',
      es: 'El nombre comercial o CNAE no acreditan por sí solos el anexo aplicable.',
    },
    action: {
      ca: 'Determina l’annex i comprova si cal llicència, autorització o comunicació abans de triar formulari.',
      es: 'Determina el anexo y comprueba si procede licencia, autorización o comunicación antes de elegir formulario.',
    },
    authority: {
      ca: 'Ajuntament per a annexos II/III; Generalitat per a autorització ambiental',
      es: 'Ayuntamiento para anexos II/III; Generalitat para autorización ambiental',
    },
    questions: [
      {
        ca: 'Procés, capacitat, emissions, residus i ubicació protegida?',
        es: '¿Proceso, capacidad, emisiones, residuos y ubicación protegida?',
      },
    ],
    gap: {
      ca: 'No s’assigna annex ni llindar sense norma consolidada i dades tècniques.',
      es: 'No se asigna anexo ni umbral sin norma consolidada y datos técnicos.',
    },
  },
  {
    id: 'shows-extraordinary',
    title: { ca: 'Espectacle públic extraordinari', es: 'Espectáculo público extraordinario' },
    url: 'https://interior.gencat.cat/ca/arees_dactuacio/espectacles/espectacles_i_activitats_caracter_extraordinari/index.html',
    urlEs:
      'https://interior.gencat.cat/es/arees_dactuacio/espectacles/espectacles_i_activitats_caracter_extraordinari/index.html',
    source: 'Departament d’Interior',
    updated: '2026-06-19',
    updatedEs: '2016-01-19',
    quote:
      'en espais oberts, de caràcter públic o privat, supòsits en els quals estan sotmesos a llicència municipal',
    quoteEs:
      'en espacios abiertos, de carácter público o privado, supuestos en los que están sometidos a licencia municipal',
    exceptionQuote:
      'no caldrà tramitar llicència (llevat que les ordenances o reglaments municipals estableixin el contrari)',
    exceptionQuoteEs:
      'no es necesario tramitar licencia (a menos que las ordenanzas o reglamentos municipales establezcan lo contrario)',
    condition: {
      ca: 'Un espectacle extraordinari en espai obert entra en la branca municipal, subjecta a les excepcions legals.',
      es: 'Un espectáculo extraordinario en espacio abierto entra en la rama municipal, sujeta a las excepciones legales.',
    },
    exclusion: {
      ca: 'Alguns actes municipals festius, esportius esporàdics o culturals d’aforament reduït poden quedar exempts de llicència; comprova l’ordenança i si cal comunicació.',
      es: 'Algunos actos municipales festivos, deportivos esporádicos o culturales de aforo reducido pueden quedar exentos de licencia; comprueba la ordenanza y si hace falta comunicación.',
    },
    action: {
      ca: 'Comprova amb l’ajuntament el tipus d’acte, lloc, aforament i ordenança abans de triar llicència o comunicació.',
      es: 'Comprueba con el ayuntamiento el tipo de acto, lugar, aforo y ordenanza antes de elegir licencia o comunicación.',
    },
    authority: {
      ca: 'Ajuntament en espai obert; altres supòsits poden correspondre a Interior',
      es: 'Ayuntamiento en espacio abierto; otros supuestos pueden corresponder a Interior',
    },
    questions: [
      {
        ca: 'És extraordinari, en quin espai, amb quin aforament i llicència existent?',
        es: '¿Es extraordinario, en qué espacio, con qué aforo y licencia existente?',
      },
    ],
    gap: {
      ca: 'L’aplicació de les excepcions i els requisits de seguretat s’han de revisar per acte.',
      es: 'La aplicación de las excepciones y los requisitos de seguridad deben revisarse por acto.',
    },
  },
  {
    id: 'installations-low-voltage',
    title: { ca: 'Posada en servei de baixa tensió', es: 'Puesta en servicio de baja tensión' },
    url: 'https://tramits.gencat.cat/ca/tramits/tramits-temes/Presentacio-de-la-declaracio-responsable-per-a-installacions-electriques-de-baixa-tensio-posada-en-servei-modificacions-i-baixa?moda=1',
    urlEs:
      'https://tramits.gencat.cat/es/tramits/tramits-temes/Presentacio-de-la-declaracio-responsable-per-a-installacions-electriques-de-baixa-tensio-posada-en-servei-modificacions-i-baixa?moda=1',
    source: 'Departament d’Empresa i Treball',
    updated: '2026-06-29',
    quote:
      'Has de presentar la declaració responsable abans de posar en funcionament la instal·lació',
    quoteEs:
      'Tienes que presentar la declaración responsable antes de poner en funcionamiento la instalación',
    condition: {
      ca: 'El titular d’una instal·lació de baixa tensió ha de declarar abans de posar-la en servei.',
      es: 'El titular de una instalación de baja tensión debe declarar antes de ponerla en servicio.',
    },
    exclusion: {
      ca: 'RITSIC d’una instal·lació no és el RASIC de l’empresa instal·ladora.',
      es: 'RITSIC de una instalación no es el RASIC de la empresa instaladora.',
    },
    action: {
      ca: 'Reuneix projecte o memòria i certificats segons el cas; presenta la declaració de la instal·lació.',
      es: 'Reúne proyecto o memoria y certificados según el caso; presenta la declaración de la instalación.',
    },
    authority: {
      ca: 'Departament d’Empresa i Treball, RITSIC',
      es: 'Departament d’Empresa i Treball, RITSIC',
    },
    questions: [
      {
        ca: 'Nova instal·lació, modificació, baixa o autoconsum? Requereix projecte o inspecció?',
        es: '¿Instalación nueva, modificación, baja o autoconsumo? ¿Requiere proyecto o inspección?',
      },
    ],
    gap: {
      ca: 'Autoconsum i habilitació de l’instal·lador tenen tràmits propis.',
      es: 'Autoconsumo y habilitación del instalador tienen trámites propios.',
    },
  },
];

export const sectorCoverage = sectors.map(({ id, title, authority, questions, gap }) => ({
  id,
  title,
  authority,
  questions,
  gap,
}));

/** Pending orientation only: the automatic source/applicability gate has not run. */
export const sectorGuides: Guide[] = sectors.map((sector) => {
  const evidence = (
    [
      {
        language: 'ca',
        url: sector.url,
        version: sector.updated,
        quote: sector.quote,
        exception: sector.exceptionQuote,
        attribution: `${sector.source}; adaptació del producte, sense aval administratiu`,
      },
      {
        language: 'es',
        url: sector.urlEs,
        version: sector.updatedEs ?? sector.updated,
        quote: sector.quoteEs,
        exception: sector.exceptionQuoteEs,
        attribution: `${sector.source}; adaptación del producto, sin aval administrativo`,
      },
    ] as const
  ).flatMap(({ language, url, version, quote, exception, attribution }) =>
    [quote, ...(exception ? [exception] : [])].map((excerpt, index) => ({
      id: `${sector.id}-${language}${index ? '-exception' : ''}`,
      sourceId: sector.source,
      url,
      originalUrl: url,
      version,
      language,
      attribution,
      sourceUpdatedAt: version,
      // Observation date, not a claim about when the legal rule took effect.
      applicableFrom: observedAt,
      applicableUntil: null,
      informative: true,
      jurisdiction: 'ES-CT',
      quote: excerpt,
    })),
  );
  const citation = { evidenceIds: evidence.map(({ id }) => id), translation: null };
  return guideSchema.parse({
    id: `catalunya-sector-${sector.id}`,
    revision: 1,
    title: sector.title,
    domain: 'D-07',
    subtopic: sector.id,
    profiles: [sector.id],
    jurisdiction: 'ES-CT',
    consultedAt: observedAt,
    period: { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence,
    conditions: [{ id: `${sector.id}-condition`, text: sector.condition, ...citation }],
    exclusions: [{ id: `${sector.id}-exclusion`, text: sector.exclusion, ...citation }],
    claims: [],
    steps: [{ id: `${sector.id}-action`, text: sector.action, ...citation, dependsOn: [] }],
  });
});
