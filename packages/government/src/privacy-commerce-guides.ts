import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
type Pair = Guide['title'];
type Evidence = Guide['evidence'][number];
const pair = (ca: string, es: string): Pair => ({ ca, es });

function source(
  id: string,
  sourceId: string,
  url: string,
  quote: string,
  language: 'ca' | 'es',
  jurisdiction: 'ES' | 'ES-CT',
  updatedAt: string | null = null,
): Evidence {
  return {
    id,
    sourceId,
    url,
    originalUrl: url,
    version: updatedAt ?? consultedAt,
    language,
    attribution: `${sourceId === 'boe' ? 'Agencia Estatal Boletín Oficial del Estado' : sourceId === 'aepd' ? 'Agencia Española de Protección de Datos' : 'Agència Catalana del Consum'}; adaptació pròpia sense aval`,
    sourceUpdatedAt: updatedAt,
    applicableFrom: consultedAt,
    applicableUntil: null,
    informative: true,
    jurisdiction,
    quote,
  };
}

const consum =
  'https://consum.gencat.cat/ca/empreses/requisits-obligatoris/obligacions-generals-per-a-les-empreses/';
const consumFaq =
  'https://consum.gencat.cat/ca/lagencia/codi-de-consum-de-catalunya/preguntes-frequeents/';
const lssi = 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758';
const consumerLaw = 'https://www.boe.es/buscar/act.php?id=BOE-A-2007-20555';

/** Short observed public excerpts; these candidates are not an approved legal corpus. */
export const privacyCommerceSources = {
  facilita: source(
    'aepd-facilita',
    'aepd',
    'https://www.aepd.es/guias-y-herramientas/herramientas/facilita-rgpd',
    'La obtención de los documentos no implica el cumplimiento automático del RGPD.',
    'es',
    'ES',
  ),
  facilitaRisk: source(
    'aepd-facilita-risk',
    'aepd',
    'https://www.aepd.es/guias-y-herramientas/herramientas/facilita-rgpd',
    'Facilita RGPD no podrá utilizarse para tratamientos que impliquen un alto riesgo',
    'es',
    'ES',
  ),
  shop: source(
    'boe-lssi-identification',
    'boe',
    `${lssi}#a10`,
    'Su nombre o denominación social; su residencia o domicilio',
    'es',
    'ES',
    '2025-01-23',
  ),
  cookies: source(
    'boe-lssi-cookies',
    'boe',
    `${lssi}#a22`,
    'hayan dado su consentimiento después de que se les haya facilitado información clara y completa',
    'es',
    'ES',
    '2025-01-23',
  ),
  cookieChoice: source(
    'aepd-cookie-choice',
    'aepd',
    'https://www.aepd.es/recurso-multimedia/guia-sobre-el-uso-de-las-cookies',
    'La opción para rechazar las cookies deberá ofrecerse en la misma capa y al mismo nivel',
    'es',
    'ES',
  ),
  technicalCookies: source(
    'boe-lssi-technical-cookies',
    'boe',
    `${lssi}#a22`,
    'almacenamiento o acceso de índole técnica al solo fin de efectuar la transmisión de una comunicación por una red de comunicaciones electrónicas o, en la medida que resulte estrictamente necesario, para la prestación de un servicio de la sociedad de la información expresamente solicitado por el destinatario.',
    'es',
    'ES',
    '2025-01-23',
  ),
  marketing: source(
    'boe-lssi-marketing',
    'boe',
    `${lssi}#a21`,
    'no hubieran sido solicitadas o expresamente autorizadas',
    'es',
    'ES',
    '2025-01-23',
  ),
  marketingExisting: source(
    'boe-lssi-marketing-existing',
    'boe',
    `${lssi}#a21`,
    'relación contractual previa, siempre que el prestador hubiera obtenido de forma lícita los datos de contacto',
    'es',
    'ES',
    '2025-01-23',
  ),
  distance: source(
    'boe-distance-information',
    'boe',
    `${consumerLaw}#a97`,
    'Antes de que el consumidor y usuario quede vinculado por cualquier contrato a distancia',
    'es',
    'ES',
  ),
  withdrawal: source(
    'boe-distance-withdrawal',
    'boe',
    `${consumerLaw}#a102`,
    'Salvo las excepciones previstas en el artículo 103, el consumidor o usuario tendrá derecho a desistir del contrato durante un periodo de catorce días naturales',
    'es',
    'ES',
  ),
  prices: source(
    'consum-prices',
    'consum',
    consum,
    'Heu d’exhibir el preu de venda de les mercaderies i productes tant a l’aparador com a l’interior dels establiments.',
    'ca',
    'ES-CT',
  ),
  servicePrices: source(
    'consum-service-prices',
    'consum',
    consum,
    'Heu de mostrar el preu dels serveis en un rètol, tarifa o fullet.',
    'ca',
    'ES-CT',
  ),
  serviceEstimate: source(
    'consum-service-estimate',
    'consum',
    'https://consum.gencat.cat/ca/lagencia/codi-de-consum-de-catalunya/sintesi-de-les-obligacions-de-les-empreses/obligacions-en-la-prestacio-de-serveis/',
    "Han de lliurar a la persona consumidora un pressupost previ del servei si la persona consumidora no pot calcular directament el preu, llevat que aquesta renunciï a l'elaboració del pressupost expressament, de manera manuscrita i amb la seva signatura.",
    'ca',
    'ES-CT',
    '2024-09-05',
  ),
  complaints: source(
    'consum-complaints',
    'consum',
    consum,
    'Tots els establiments comercials han de disposar de fulls oficials de queixa, reclamació i denúncia',
    'ca',
    'ES-CT',
  ),
  complaintResponse: source(
    'consum-complaint-response',
    'consum',
    consum,
    'Heu de donar resposta a les persones consumidores que us adrecin queixes, reclamacions o incidències derivades de la relació de consum al més aviat possible i, en qualsevol cas, en el termini màxim d’un mes.',
    'ca',
    'ES-CT',
  ),
  complaintsException: source(
    'consum-complaints-exception',
    'consum',
    consum,
    'Totes les activitats que disposen de normativa específica en matèria de fulls de queixa, reclamació o denúncia.',
    'ca',
    'ES-CT',
  ),
  language: source(
    'consum-language',
    'consum',
    consumFaq,
    'han d’estar en condicions de poder atendre els consumidors i consumidores en qualsevol de les llengües oficials',
    'ca',
    'ES-CT',
  ),
  webLanguage: source(
    'consum-web-language',
    'consum',
    consumFaq,
    'Amb caràcter general no hi ha cap normativa que obligui les empreses a disposar de web en llengua catalana',
    'ca',
    'ES-CT',
  ),
  webOfferLanguage: source(
    'consum-web-offer-language',
    'consum',
    consumFaq,
    'aquestes informacions han d’estar disponibles, almenys, en català',
    'ca',
    'ES-CT',
  ),
  productLanguage: source(
    'consum-product-language',
    'consum',
    consumFaq,
    'informacions necessàries per al consum i l’ús adequat dels béns que hi hagi a l’etiquetatge',
    'ca',
    'ES-CT',
  ),
} satisfies Record<string, Evidence>;

type SourceKey = keyof typeof privacyCommerceSources;
type Entry = {
  id: string;
  domain: 'D-11' | 'D-12';
  kind: 'fact' | 'obligation';
  title: Pair;
  profiles: string[];
  source: SourceKey;
  question: Pair;
  unknown: Pair;
  condition: Pair;
  exclusion: Pair;
  fact: Pair;
  step: Pair;
  factStem: string;
};

const entries: Entry[] = [
  {
    id: 'personal-data-low-risk',
    kind: 'fact',
    domain: 'D-11',
    source: 'facilita',
    title: pair('Tractament de dades de baix risc', 'Tratamiento de datos de bajo riesgo'),
    profiles: ['sole-trader', 'online-seller'],
    question: pair(
      'FACILITA acredita el compliment del RGPD?',
      '¿FACILITA acredita el cumplimiento del RGPD?',
    ),
    unknown: pair(
      'Sense saber quines dades tracto, FACILITA certifica el meu negoci?',
      'Sin saber qué datos trato, ¿FACILITA certifica mi negocio?',
    ),
    condition: pair(
      'Identifica dades, finalitats i riscos de cada tractament.',
      'Identifica datos, finalidades y riesgos de cada tratamiento.',
    ),
    exclusion: pair(
      'FACILITA és una ajuda, no un certificat ni compliment automàtic.',
      'FACILITA es una ayuda, no un certificado ni cumplimiento automático.',
    ),
    fact: pair(
      'Els documents de FACILITA no impliquen compliment automàtic del RGPD.',
      'Los documentos de FACILITA no implican cumplimiento automático del RGPD.',
    ),
    step: pair(
      'Comprova el risc i adapta la documentació de la AEPD a cada tractament.',
      'Comprueba el riesgo y adapta la documentación de la AEPD a cada tratamiento.',
    ),
    factStem: 'rgpd',
  },
  {
    id: 'personal-data-high-risk',
    kind: 'fact',
    domain: 'D-11',
    source: 'facilitaRisk',
    title: pair('Tractaments de risc alt', 'Tratamientos de riesgo alto'),
    profiles: ['health-data', 'large-scale-data'],
    question: pair(
      'Puc usar FACILITA amb dades de salut o tractament massiu?',
      '¿Puedo usar FACILITA con datos de salud o tratamiento masivo?',
    ),
    unknown: pair(
      'Sense identificar dades i escala, és baix el meu risc?',
      'Sin identificar datos y escala, ¿es bajo mi riesgo?',
    ),
    condition: pair(
      'Comprova naturalesa, escala i risc del tractament.',
      'Comprueba naturaleza, escala y riesgo del tratamiento.',
    ),
    exclusion: pair(
      'No extrapolis els documents del baix risc a salut o tractaments massius.',
      'No extrapoles los documentos del bajo riesgo a salud o tratamientos masivos.',
    ),
    fact: pair(
      'FACILITA RGPD no és per a tractaments d’alt risc.',
      'FACILITA RGPD no es para tratamientos de alto riesgo.',
    ),
    step: pair(
      'Obre l’orientació AEPD i analitza el risc del tractament específic.',
      'Abre la orientación AEPD y analiza el riesgo del tratamiento específico.',
    ),
    factStem: 'facilita',
  },
  {
    id: 'online-shop-identity',
    kind: 'obligation',
    domain: 'D-11',
    source: 'shop',
    title: pair('Identificació a la botiga digital', 'Identificación en la tienda digital'),
    profiles: ['online-seller', 'digital-service'],
    question: pair(
      'Quines dades identificatives ha de mostrar una botiga digital?',
      '¿Qué datos identificativos debe mostrar una tienda digital?',
    ),
    unknown: pair(
      'Una pàgina personal sense activitat econòmica necessita el mateix avís legal?',
      '¿Una página personal sin actividad económica necesita el mismo aviso legal?',
    ),
    condition: pair(
      'Confirma que prestes un servei de la societat de la informació.',
      'Confirma que prestas un servicio de la sociedad de la información.',
    ),
    exclusion: pair(
      'La fitxa no determina autoritzacions ni dades col·legials sectorials.',
      'La ficha no determina autorizaciones ni datos colegiales sectoriales.',
    ),
    fact: pair(
      'El prestador facilita nom o denominació i domicili de forma accessible.',
      'El prestador facilita nombre o denominación y domicilio de forma accesible.',
    ),
    step: pair(
      'Revisa les dades d’identificació exigides per l’article 10 de la LSSI.',
      'Revisa los datos de identificación exigidos por el artículo 10 de la LSSI.',
    ),
    factStem: 'domicil',
  },
  {
    id: 'cookies-consent',
    kind: 'obligation',
    domain: 'D-11',
    source: 'cookies',
    title: pair(
      'Consentiment de cookies no necessàries',
      'Consentimiento de cookies no necesarias',
    ),
    profiles: ['website-operator', 'online-seller'],
    question: pair(
      'Què cal abans d’instal·lar cookies que no són estrictament necessàries?',
      '¿Qué hace falta antes de instalar cookies no estrictamente necesarias?',
    ),
    unknown: pair(
      'Sense inventariar cookies i finalitats, puc ometre el consentiment?',
      'Sin inventariar cookies y fines, ¿puedo omitir el consentimiento?',
    ),
    condition: pair(
      'Identifica finalitat i caràcter necessari de cada accés al terminal.',
      'Identifica finalidad y carácter necesario de cada acceso al terminal.',
    ),
    exclusion: pair(
      'No presumeixis que tota cookie necessita o queda exempta de consentiment.',
      'No presupongas que toda cookie necesita o queda exenta de consentimiento.',
    ),
    fact: pair(
      'Per a cookies no exceptuades, informa i obtén consentiment abans d’usar-les.',
      'Para cookies no exceptuadas, informa y obtén consentimiento antes de usarlas.',
    ),
    step: pair(
      'Inventaria cookies i contrasta-les amb l’article 22 i la guia AEPD.',
      'Inventaría cookies y contrástalas con el artículo 22 y la guía AEPD.',
    ),
    factStem: 'consent',
  },
  {
    id: 'cookies-technical-exception',
    kind: 'fact',
    domain: 'D-11',
    source: 'technicalCookies',
    title: pair('Excepció tècnica de cookies', 'Excepción técnica de cookies'),
    profiles: ['website-operator', 'online-seller'],
    question: pair(
      'Quan hi ha excepció per a un accés tècnic necessari?',
      '¿Cuándo hay excepción para un acceso técnico necesario?',
    ),
    unknown: pair(
      'Una cookie analítica és necessària només perquè la botiga la fa servir?',
      '¿Una cookie analítica es necesaria solo porque la tienda la usa?',
    ),
    condition: pair(
      'Comprova si l’accés és tècnic per a la transmissió o estrictament necessari per al servei sol·licitat.',
      'Comprueba si el acceso es técnico para la transmisión o estrictamente necesario para el servicio solicitado.',
    ),
    exclusion: pair(
      'Una finalitat publicitària o analítica no esdevé tècnica només pel seu nom.',
      'Una finalidad publicitaria o analítica no se vuelve técnica solo por su nombre.',
    ),
    fact: pair(
      'L’article 22 exceptua l’accés tècnic de transmissió o el necessari per al servei sol·licitat.',
      'El artículo 22 exceptúa el acceso técnico de transmisión o el necesario para el servicio solicitado.',
    ),
    step: pair(
      'Documenta finalitat i necessitat abans d’aplicar l’excepció.',
      'Documenta finalidad y necesidad antes de aplicar la excepción.',
    ),
    factStem: 'tecnic',
  },
  {
    id: 'cookies-accept-reject',
    kind: 'obligation',
    domain: 'D-11',
    source: 'cookieChoice',
    title: pair('Acceptar i rebutjar cookies', 'Aceptar y rechazar cookies'),
    profiles: ['website-operator', 'online-seller'],
    question: pair(
      'Com s’han de presentar les opcions d’acceptar i rebutjar cookies?',
      '¿Cómo deben presentarse las opciones de aceptar y rechazar cookies?',
    ),
    unknown: pair(
      'Puc ocultar el rebuig sense saber si aquestes cookies requereixen consentiment?',
      '¿Puedo ocultar el rechazo sin saber si esas cookies requieren consentimiento?',
    ),
    condition: pair(
      'Comprova si hi ha cookies no exceptuades que requereixen consentiment.',
      'Comprueba si hay cookies no exceptuadas que requieren consentimiento.',
    ),
    exclusion: pair(
      'La guia no exigeix un bàner quan totes les cookies són exceptuades.',
      'La guía no exige un banner cuando todas las cookies están exceptuadas.',
    ),
    fact: pair(
      'L’opció de rebutjar cookies s’ofereix al mateix nivell que acceptar-les.',
      'La opción de rechazar cookies se ofrece al mismo nivel que aceptarlas.',
    ),
    step: pair(
      'Dóna la mateixa visibilitat a acceptació i rebuig en el primer nivell.',
      'Da la misma visibilidad a aceptación y rechazo en la primera capa.',
    ),
    factStem: 'nive',
  },
  {
    id: 'email-advertising',
    kind: 'obligation',
    domain: 'D-11',
    source: 'marketing',
    title: pair('Publicitat per correu electrònic', 'Publicidad por correo electrónico'),
    profiles: ['online-seller', 'marketer'],
    question: pair(
      'Puc enviar publicitat per correu sense sol·licitud o autorització?',
      '¿Puedo enviar publicidad por correo sin solicitud o autorización?',
    ),
    unknown: pair(
      'Puc fer campanya a tots els contactes sense saber-ne l’origen?',
      '¿Puedo hacer campaña a todos los contactos sin saber su origen?',
    ),
    condition: pair(
      'Identifica canal, origen del contacte i base de l’enviament.',
      'Identifica canal, origen del contacto y base del envío.',
    ),
    exclusion: pair(
      'Contrasta separadament l’excepció de relació contractual prèvia.',
      'Contrasta por separado la excepción de relación contractual previa.',
    ),
    fact: pair(
      'La publicitat electrònica no sol·licitada requereix autorització prèvia, llevat de l’excepció legal.',
      'La publicidad electrónica no solicitada requiere autorización previa, salvo la excepción legal.',
    ),
    step: pair(
      'Verifica consentiment o excepció abans d’enviar; facilita oposició.',
      'Verifica consentimiento o excepción antes de enviar; facilita oposición.',
    ),
    factStem: 'autor',
  },
  {
    id: 'email-existing-customer',
    kind: 'fact',
    domain: 'D-11',
    source: 'marketingExisting',
    title: pair('Publicitat a clients previs', 'Publicidad a clientes previos'),
    profiles: ['online-seller', 'marketer'],
    question: pair(
      'Quan es pot considerar l’excepció de client previ?',
      '¿Cuándo se puede considerar la excepción de cliente previo?',
    ),
    unknown: pair(
      'Una adreça comprada equival a relació contractual prèvia?',
      '¿Una dirección comprada equivale a relación contractual previa?',
    ),
    condition: pair(
      'Comprova relació contractual, obtenció lícita i similitud dels productes propis.',
      'Comprueba relación contractual, obtención lícita y similitud de los productos propios.',
    ),
    exclusion: pair(
      'Una llista comprada o una relació passada qualsevol no acrediten l’excepció.',
      'Una lista comprada o cualquier relación pasada no acreditan la excepción.',
    ),
    fact: pair(
      'L’excepció exigeix relació contractual prèvia i contacte obtingut lícitament.',
      'La excepción exige relación contractual previa y contacto obtenido lícitamente.',
    ),
    step: pair(
      'Comprova els requisits i ofereix oposició fàcil i gratuïta en cada missatge.',
      'Comprueba los requisitos y ofrece oposición fácil y gratuita en cada mensaje.',
    ),
    factStem: 'contractual',
  },
  {
    id: 'distance-precontract',
    kind: 'obligation',
    domain: 'D-12',
    source: 'distance',
    title: pair(
      'Informació abans de la compra a distància',
      'Información antes de la compra a distancia',
    ),
    profiles: ['online-seller', 'distance-service'],
    question: pair(
      'Quan s’ha de donar la informació prèvia en una compra en línia?',
      '¿Cuándo debe darse la información previa en una compra en línea?',
    ),
    unknown: pair(
      'Puc ometre el preu final sense saber producte ni costos de lliurament?',
      '¿Puedo omitir el precio final sin saber producto ni costes de entrega?',
    ),
    condition: pair(
      'Confirma contracte amb persona consumidora a distància.',
      'Confirma contrato con persona consumidora a distancia.',
    ),
    exclusion: pair(
      'No extrapolis aquesta branca a contractes entre empreses ni a totes les excepcions sectorials.',
      'No extrapoles esta rama a contratos entre empresas ni a todas las excepciones sectoriales.',
    ),
    fact: pair(
      'La informació precontractual s’ha de donar abans que la persona consumidora quedi vinculada.',
      'La información precontractual debe darse antes de que la persona consumidora quede vinculada.',
    ),
    step: pair(
      'Revisa característiques, identitat, preu total, lliurament i desistiment abans del pagament.',
      'Revisa características, identidad, precio total, entrega y desistimiento antes del pago.',
    ),
    factStem: 'consumidor',
  },
  {
    id: 'distance-withdrawal',
    kind: 'fact',
    domain: 'D-12',
    source: 'withdrawal',
    title: pair('Comprovar el desistiment a distància', 'Comprobar el desistimiento a distancia'),
    profiles: ['online-seller', 'distance-service'],
    question: pair(
      'El desistiment a distància té excepcions?',
      '¿El desistimiento a distancia tiene excepciones?',
    ),
    unknown: pair(
      'Puc prometre desistiment universal sense saber quin bé o servei venc?',
      '¿Puedo prometer desistimiento universal sin saber qué bien o servicio vendo?',
    ),
    condition: pair(
      'Identifica bé o servei i si el contracte entra en l’àmbit de la norma.',
      'Identifica bien o servicio y si el contrato entra en el ámbito de la norma.',
    ),
    exclusion: pair(
      'L’article 103 conté excepcions; no prometis el mateix dret per a tots els productes.',
      'El artículo 103 contiene excepciones; no prometas el mismo derecho para todos los productos.',
    ),
    fact: pair(
      'El termini general és de catorze dies naturals, llevat de les excepcions de l’article 103.',
      'El plazo general es de catorce días naturales, salvo las excepciones del artículo 103.',
    ),
    step: pair(
      'Consulta els articles 102 i 103 abans de publicar la política de desistiment.',
      'Consulta los artículos 102 y 103 antes de publicar la política de desistimiento.',
    ),
    factStem: 'cator',
  },
  {
    id: 'physical-prices',
    kind: 'obligation',
    domain: 'D-12',
    source: 'prices',
    title: pair('Preus en un establiment presencial', 'Precios en un establecimiento presencial'),
    profiles: ['physical-shop', 'mixed-channel'],
    question: pair(
      'On s’ha d’exhibir el preu dels productes en una botiga?',
      '¿Dónde debe exhibirse el precio de productos en una tienda?',
    ),
    unknown: pair(
      'El mateix cartell serveix sense saber si venc productes o serveis?',
      '¿Sirve el mismo cartel sin saber si vendo productos o servicios?',
    ),
    condition: pair(
      'Identifica si ofereixes mercaderies en un establiment comercial.',
      'Identifica si ofreces mercancías en un establecimiento comercial.',
    ),
    exclusion: pair(
      'Els preus dels serveis, les ofertes especials i determinats sectors tenen regles pròpies.',
      'Los precios de servicios, ofertas especiales y algunos sectores tienen reglas propias.',
    ),
    fact: pair(
      'Els productes s’han d’exhibir amb preu a l’aparador i dins l’establiment.',
      'Los productos deben exhibir precio en el escaparate y dentro del establecimiento.',
    ),
    step: pair(
      'Revisa els rètols de preu complet i els requisits del producte concret.',
      'Revisa los carteles de precio completo y los requisitos del producto concreto.',
    ),
    factStem: 'product',
  },
  {
    id: 'physical-complaints',
    kind: 'obligation',
    domain: 'D-12',
    source: 'complaints',
    title: pair('Fulls de reclamació en establiments', 'Hojas de reclamación en establecimientos'),
    profiles: ['physical-shop', 'mixed-channel'],
    question: pair(
      'Cal tenir fulls oficials de reclamació en un establiment comercial?',
      '¿Hay que tener hojas oficiales de reclamación en un establecimiento comercial?',
    ),
    unknown: pair(
      'Una activitat regulada usa els mateixos fulls sense consultar-ne la norma?',
      '¿Una actividad regulada usa las mismas hojas sin consultar su norma?',
    ),
    condition: pair(
      'Comprova que és un establiment comercial i si hi ha règim sectorial.',
      'Comprueba que es un establecimiento comercial y si hay régimen sectorial.',
    ),
    exclusion: pair(
      'Hi ha excepcions per activitats amb normativa específica i altres supòsits.',
      'Hay excepciones para actividades con normativa específica y otros supuestos.',
    ),
    fact: pair(
      'En general, l’establiment comercial posa fulls oficials de queixa, reclamació i denúncia a disposició.',
      'En general, el establecimiento comercial pone hojas oficiales de queja, reclamación y denuncia a disposición.',
    ),
    step: pair(
      'Obté els fulls oficials i el cartell a Consum; verifica les excepcions.',
      'Obtén las hojas oficiales y el cartel en Consum; verifica las excepciones.',
    ),
    factStem: 'reclam',
  },
  {
    id: 'service-prices',
    kind: 'obligation',
    domain: 'D-12',
    source: 'servicePrices',
    title: pair('Preus de serveis presencials', 'Precios de servicios presenciales'),
    profiles: ['service-provider', 'mixed-channel'],
    question: pair(
      'Com mostro el preu dels serveis a l’establiment?',
      '¿Cómo muestro el precio de servicios en el establecimiento?',
    ),
    unknown: pair(
      'Puc aplicar el preu de productes a un servei sense identificar-lo?',
      '¿Puedo aplicar el precio de productos a un servicio sin identificarlo?',
    ),
    condition: pair(
      'Confirma que ofereixes un servei presencial a consumidores.',
      'Confirma que ofreces un servicio presencial a consumidores.',
    ),
    exclusion: pair(
      'No confonguis la tarifa de serveis amb l’etiqueta d’un producte.',
      'No confundas la tarifa de servicios con la etiqueta de un producto.',
    ),
    fact: pair(
      'El preu del servei es mostra en un rètol, tarifa o fullet.',
      'El precio del servicio se muestra en un cartel, tarifa o folleto.',
    ),
    step: pair(
      'Publica la tarifa visible i comprova càrrecs i normativa del sector.',
      'Publica la tarifa visible y comprueba cargos y normativa del sector.',
    ),
    factStem: 'tarifa',
  },
  {
    id: 'service-estimate',
    kind: 'obligation',
    domain: 'D-12',
    source: 'serviceEstimate',
    title: pair('Pressupost previ del servei', 'Presupuesto previo del servicio'),
    profiles: ['service-provider', 'mixed-channel'],
    question: pair(
      'Quan cal pressupost previ per un servei?',
      '¿Cuándo hace falta presupuesto previo para un servicio?',
    ),
    unknown: pair(
      'Puc ometre el pressupost sense saber si es pot calcular el preu ni si hi ha renúncia?',
      '¿Puedo omitir el presupuesto sin saber si se puede calcular el precio ni si hay renuncia?',
    ),
    condition: pair(
      'Confirma servei a consumidora, si pot calcular directament el preu i si hi ha renúncia expressa manuscrita i signada.',
      'Confirma servicio a consumidora, si puede calcular directamente el precio y si hay renuncia expresa manuscrita y firmada.',
    ),
    exclusion: pair(
      'Si la persona pot calcular directament el preu, no generalitzis aquesta branca.',
      'Si la persona puede calcular directamente el precio, no generalices esta rama.',
    ),
    fact: pair(
      'Si no es pot calcular directament el preu, cal pressupost previ llevat de renúncia expressa manuscrita i signada.',
      'Si no puede calcularse directamente el precio, hace falta presupuesto previo salvo renuncia expresa manuscrita y firmada.',
    ),
    step: pair(
      'Comprova el preu i prepara el pressupost o verifica la renúncia aplicable.',
      'Comprueba el precio y prepara el presupuesto o verifica la renuncia aplicable.',
    ),
    factStem: 'pres',
  },
  {
    id: 'complaint-response',
    kind: 'obligation',
    domain: 'D-12',
    source: 'complaintResponse',
    title: pair('Respondre una reclamació de consum', 'Responder una reclamación de consumo'),
    profiles: ['physical-shop', 'online-seller', 'service-provider'],
    question: pair(
      'Quin termini de resposta té una reclamació de consum?',
      '¿Qué plazo de respuesta tiene una reclamación de consumo?',
    ),
    unknown: pair(
      'Una queixa d’un tercer no client és una reclamació de consum sense més dades?',
      '¿Una queja de un tercero no cliente es una reclamación de consumo sin más datos?',
    ),
    condition: pair(
      'Confirma que la queixa deriva d’una relació de consum amb el negoci.',
      'Confirma que la queja deriva de una relación de consumo con el negocio.',
    ),
    exclusion: pair(
      'No confonguis resposta a l’empresa amb la tramitació posterior davant Consum.',
      'No confundas respuesta de la empresa con la tramitación posterior ante Consum.',
    ),
    fact: pair(
      'Cal respondre al més aviat possible i com a màxim en un mes.',
      'Hay que responder lo antes posible y como máximo en un mes.',
    ),
    step: pair(
      'Habilita una via de recepció i respon a la reclamació dins del termini.',
      'Habilita una vía de recepción y responde a la reclamación dentro del plazo.',
    ),
    factStem: 'mes',
  },
  {
    id: 'complaints-sector-exception',
    kind: 'fact',
    domain: 'D-12',
    source: 'complaintsException',
    title: pair(
      'Excepcions sectorials dels fulls de reclamació',
      'Excepciones sectoriales de hojas de reclamación',
    ),
    profiles: ['regulated-service'],
    question: pair(
      'Una activitat amb normativa pròpia de reclamacions usa els fulls generals?',
      '¿Una actividad con normativa propia de reclamaciones usa las hojas generales?',
    ),
    unknown: pair(
      'Sense saber el sector, puc assegurar que m’aplica l’excepció?',
      'Sin saber el sector, ¿puedo asegurar que me aplica la excepción?',
    ),
    condition: pair(
      'Identifica l’activitat i la norma de reclamacions aplicable.',
      'Identifica la actividad y la norma de reclamaciones aplicable.',
    ),
    exclusion: pair(
      'No prescindir de les vies de reclamació només per ser una professió regulada.',
      'No prescindir de las vías de reclamación solo por ser una profesión regulada.',
    ),
    fact: pair(
      'La regla general de fulls exceptua activitats amb normativa específica de reclamacions.',
      'La regla general de hojas exceptúa actividades con normativa específica de reclamaciones.',
    ),
    step: pair(
      'Localitza la normativa sectorial i comprova quin full i canal exigeix.',
      'Localiza la normativa sectorial y comprueba qué hoja y canal exige.',
    ),
    factStem: 'normativa',
  },
  {
    id: 'consumer-language',
    kind: 'obligation',
    domain: 'D-12',
    source: 'language',
    title: pair('Atenció en llengües oficials', 'Atención en lenguas oficiales'),
    profiles: ['physical-shop', 'online-seller', 'service-provider'],
    question: pair(
      'Què vol dir atendre una persona consumidora en les llengües oficials?',
      '¿Qué significa atender a una persona consumidora en las lenguas oficiales?',
    ),
    unknown: pair(
      'Una atenció automatitzada en un sol idioma compleix tots els casos?',
      '¿Una atención automatizada en un solo idioma cumple todos los casos?',
    ),
    condition: pair(
      'Confirma oferta de béns o serveis a persones consumidores a Catalunya.',
      'Confirma oferta de bienes o servicios a personas consumidoras en Catalunya.',
    ),
    exclusion: pair(
      'Entendre la llengua escollida no obliga per si sol a parlar-la.',
      'Entender la lengua elegida no obliga por sí solo a hablarla.',
    ),
    fact: pair(
      'Cal poder entendre la persona consumidora en qualsevol llengua oficial.',
      'Hay que poder entender a la persona consumidora en cualquier lengua oficial.',
    ),
    step: pair(
      'Prepara atenció i documentació segons el canal i la relació de consum.',
      'Prepara atención y documentación según el canal y la relación de consumo.',
    ),
    factStem: 'oficial',
  },
  {
    id: 'web-language',
    kind: 'fact',
    domain: 'D-12',
    source: 'webLanguage',
    title: pair('Llengua de la web i de l’oferta', 'Lengua de la web y de la oferta'),
    profiles: ['online-seller', 'digital-service'],
    question: pair(
      'És obligatori tenir tota la web en català?',
      '¿Es obligatorio tener toda la web en catalán?',
    ),
    unknown: pair(
      'Sense saber a qui es dirigeix l’oferta, puc ometre el català comercial?',
      'Sin saber a quién se dirige la oferta, ¿puedo omitir el catalán comercial?',
    ),
    condition: pair(
      'Distingeix web general d’oferta activa a consumidores de Catalunya.',
      'Distingue web general de oferta activa a consumidores de Catalunya.',
    ),
    exclusion: pair(
      'No dedueixis que tota la web ha de ser en català ni que la informació comercial està exempta.',
      'No deduzcas que toda la web debe estar en catalán ni que la información comercial está exenta.',
    ),
    fact: pair(
      'No hi ha obligació general de web íntegrament en català.',
      'No hay obligación general de web íntegramente en catalán.',
    ),
    step: pair(
      'Comprova el públic destinatari i la informació comercial que requereix català.',
      'Comprueba el público destinatario y la información comercial que requiere catalán.',
    ),
    factStem: 'web',
  },
  {
    id: 'web-offer-language',
    kind: 'obligation',
    domain: 'D-12',
    source: 'webOfferLanguage',
    title: pair(
      'Informació comercial digital en català',
      'Información comercial digital en catalán',
    ),
    profiles: ['online-seller', 'digital-service'],
    question: pair(
      'Quan cal català en l’oferta comercial de la web?',
      '¿Cuándo hace falta catalán en la oferta comercial de la web?',
    ),
    unknown: pair(
      'Qualsevol web visible a Catalunya és una oferta activa a consumidores catalans?',
      '¿Cualquier web visible en Catalunya es una oferta activa a consumidores catalanes?',
    ),
    condition: pair(
      'Comprova si l’oferta s’adreça activament a consumidores de Catalunya.',
      'Comprueba si la oferta se dirige activamente a consumidores de Catalunya.',
    ),
    exclusion: pair(
      'La simple accessibilitat de la web no prova l’oferta activa.',
      'La mera accesibilidad de la web no prueba la oferta activa.',
    ),
    fact: pair(
      'La informació comercial d’aquesta oferta ha d’estar almenys en català.',
      'La información comercial de esa oferta debe estar al menos en catalán.',
    ),
    step: pair(
      'Identifica invitacions de compra, contractes i pressupostos i revisa’n l’idioma.',
      'Identifica invitaciones de compra, contratos y presupuestos y revisa su idioma.',
    ),
    factStem: 'catal',
  },
  {
    id: 'product-label-language',
    kind: 'obligation',
    domain: 'D-12',
    source: 'productLanguage',
    title: pair(
      'Informació necessària de producte en català',
      'Información necesaria de producto en catalán',
    ),
    profiles: ['physical-shop', 'online-seller'],
    question: pair(
      'Quina informació de l’etiqueta de producte ha d’estar en català?',
      '¿Qué información de la etiqueta de producto debe estar en catalán?',
    ),
    unknown: pair(
      'Tots els textos d’un envàs requereixen el mateix tractament sense saber el producte?',
      '¿Todos los textos de un envase requieren el mismo tratamiento sin saber el producto?',
    ),
    condition: pair(
      'Identifica el producte i les informacions necessàries per al seu ús.',
      'Identifica el producto y la información necesaria para su uso.',
    ),
    exclusion: pair(
      'No generalitzis a tot el text de l’envàs ni substitueixis regles sectorials.',
      'No generalices a todo el texto del envase ni sustituyas reglas sectoriales.',
    ),
    fact: pair(
      'La informació necessària per a l’ús adequat del producte ha de constar almenys en català.',
      'La información necesaria para el uso adecuado del producto debe constar al menos en catalán.',
    ),
    step: pair(
      'Revisa etiquetatge obligatori i advertiments del tipus de producte.',
      'Revisa etiquetado obligatorio y advertencias del tipo de producto.',
    ),
    factStem: 'inform',
  },
];

/** Pending guides expose conditions and unanswered branches; they are not publishable until source and T-004 gates pass. */
export const privacyCommerceGuides: Guide[] = entries.map((entry) => {
  const evidence = privacyCommerceSources[entry.source];
  const cited = (id: string, value: Pair) => ({
    id,
    text: value,
    evidenceIds: [evidence.id],
    translation: (evidence.language === 'es' ? 'ca' : 'es') as 'ca' | 'es',
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
    evidence: [evidence],
    conditions: [cited('condition', entry.condition)],
    exclusions: [cited('exclusion', entry.exclusion)],
    claims: [{ ...cited('fact', entry.fact), kind: entry.kind, conditionIds: ['condition'] }],
    steps: [{ ...cited('step', entry.step), dependsOn: [] }],
  });
});

export const privacyCommerceQuestions = entries.map(
  ({ id, profiles, question, unknown, factStem }) => ({
    id,
    profiles,
    question,
    unknown,
    factStem,
  }),
);
