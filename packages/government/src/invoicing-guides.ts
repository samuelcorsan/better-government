import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
type Pair = Guide['title'];
type Evidence = Guide['evidence'][number];
const pair = (ca: string, es: string): Pair => ({ ca, es });

function aeat(id: string, path: string, quote: string): Evidence {
  const url = `https://sede.agenciatributaria.gob.es/Sede/${path}`;
  return {
    id,
    sourceId: 'aeat',
    url,
    originalUrl: url,
    version: consultedAt,
    language: 'es',
    attribution: 'Agencia Estatal de Administración Tributaria; adaptación propia sin aval',
    sourceUpdatedAt: null,
    applicableFrom: consultedAt,
    applicableUntil: null,
    informative: true,
    jurisdiction: 'ES',
    quote,
  };
}

function official(
  id: string,
  sourceId: 'boe' | 'canal-empresa-fue',
  url: string,
  quote: string,
): Evidence {
  return {
    id,
    sourceId,
    url,
    originalUrl: url,
    version: consultedAt,
    language: 'es',
    attribution: `${sourceId === 'boe' ? 'Agencia Estatal Boletín Oficial del Estado' : 'Generalitat de Catalunya'}; adaptación propia sin aval`,
    sourceUpdatedAt: null,
    applicableFrom: consultedAt,
    applicableUntil: null,
    informative: true,
    jurisdiction: sourceId === 'boe' ? 'ES' : 'ES-CT',
    quote,
  };
}

const sources = {
  obligation: aeat(
    'aeat-invoice-obligation',
    'iva/facturacion-registro/facturacion-iva/obligacion-facturar.html',
    'Cuando el destinatario sea un empresario o profesional y actúe como tal.',
  ),
  exceptions: aeat(
    'aeat-invoice-exceptions',
    'iva/facturacion-registro/facturacion-iva/excepciones-obligacion-facturar.html',
    'Debes expedir factura en los cuatro supuestos citados cuando el destinatario sea un empresario o profesional',
  ),
  simple: aeat(
    'aeat-invoice-simple',
    'iva/facturacion-registro/facturacion-iva/tipos-factura.html',
    'Facturas cuyo importe no supere los 400 euros',
  ),
  simpleSector: aeat(
    'aeat-invoice-simple-sector',
    'iva/facturacion-registro/facturacion-iva/tipos-factura.html',
    'Las siguientes operaciones que no excedan de 3.000 euros, IVA incluido:',
  ),
  professionalBooks: aeat(
    'aeat-irpf-professional-books',
    'irpf/empresarios-individuales-profesionales/obligaciones-contables-registrales/actividades-profesionales-estimacion-directa.html',
    'un libro registro de provisiones de fondos y suplidos',
  ),
  vatBooks: aeat(
    'aeat-vat-books',
    'iva/libros-registro.html',
    'Libro registro de facturas expedidas.',
  ),
  vatEntries: aeat(
    'aeat-vat-entry-deadlines',
    'iva/facturacion-registro/libros-registro-iva/plazos-anotaciones-registrales.html',
    'antes de que finalice el plazo legal para realizar la referida liquidación y pago en período voluntario.',
  ),
  retention: aeat(
    'aeat-invoice-retention',
    'iva/facturacion-registro/facturacion-iva/obligacion-conservar-facturas.html',
    'durante el plazo de prescripción de 4 años',
  ),
  investmentRetention: aeat(
    'aeat-investment-retention',
    'iva/facturacion-registro/facturacion-iva/obligacion-conservar-facturas.html',
    'período de regularización y los cuatro años siguientes',
  ),
  calendar: {
    ...aeat(
      'aeat-calendar-2026',
      'ayuda/calendario-contribuyente/calendario-contribuyente-2026.html',
      'Índice de Calendario del contribuyente 2026',
    ),
    applicableUntil: '2026-12-31',
  },
  mercantileBooks: aeat(
    'aeat-irpf-mercantile-books',
    'irpf/empresarios-individuales-profesionales/obligaciones-contables-registrales/actividades-empresariales-caracter-mercantil-estimacion-normal.html',
    'contabilidad ajustada al Código de Comercio y al Plan General de Contabilidad',
  ),
  nonMercantileBooks: aeat(
    'aeat-irpf-non-mercantile-books',
    'irpf/empresarios-individuales-profesionales/obligaciones-contables-registrales/actividades-empresariales-no-mercantiles-estimacion-normal.html',
    'un libro registro de ventas e ingresos',
  ),
  modulesBooks: aeat(
    'aeat-irpf-modules-books',
    'irpf/empresarios-individuales-profesionales/obligaciones-contables-registrales/actividades-empresariales-estimacion-objetiva.html',
    'un libro registro de bienes de inversión (si te deduces las amortizaciones)',
  ),
  invoiceDeadline: official(
    'boe-invoice-deadline',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11',
    'antes del día 16 del mes siguiente',
  ),
  invoiceConsumerDeadline: official(
    'boe-invoice-consumer-deadline',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696#a11',
    'en el momento de realizarse la operación',
  ),
  invoiceFields: aeat(
    'aeat-invoice-fields',
    'iva/facturacion-registro/facturacion-iva/contenido-facturas.html',
    'Número y, en su caso, serie.',
  ),
  mercantileRetention: official(
    'boe-mercantile-retention',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-1885-6627#art30',
    'durante seis años, a partir del último asiento realizado en los libros',
  ),
  sif: {
    ...aeat(
      'aeat-sif-scope',
      'iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html',
      'antes del 1 de julio de 2027',
    ),
    // La recomendación sobre un plazo futuro caduca al pasar el vencimiento.
    applicableUntil: '2027-06-30',
  },
  sifManual: aeat(
    'aeat-sif-manual',
    'iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html',
    'NO facturen exclusivamente de forma manual',
  ),
  sifSii: aeat(
    'aeat-sif-sii',
    'iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/cuestiones-generales-ambitos-aplicacion.html',
    'NO estén adscritos, de forma obligatoria o voluntaria, a las exigencias del conocido como Suministro Inmediato de Información o SII',
  ),
  b2b: official(
    'boe-b2b-electronic',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#df-4',
    'Veinticuatro meses después, para el resto de los empresarios y profesionales',
  ),
  b2bLarge: official(
    'boe-b2b-large',
    'boe',
    'https://www.boe.es/buscar/act.php?id=BOE-A-2026-7295#df-4',
    'Doce meses después, para los empresarios y profesionales cuyo volumen de operaciones',
  ),
  b2g: official(
    'gencat-b2g-efact',
    'canal-empresa-fue',
    'https://canalempresa.gencat.cat/es/01_que_voleu_fer/03_creixer_i_consolidar-vos/treballar-amb-administracio/factura-electronica/',
    'es el servicio e-FACT',
  ),
} satisfies Record<string, Evidence>;

type SourceKey = keyof typeof sources;
type Entry = {
  id: string;
  title: Pair;
  profiles: string[];
  source: SourceKey;
  question: Pair;
  unknown: Pair;
  condition: Pair;
  exclusion: Pair;
  fact: Pair;
  step: Pair;
};

const entries: Entry[] = [
  {
    id: 'invoice-obligation',
    title: pair('Comprovar l’obligació de factura', 'Comprobar la obligación de factura'),
    profiles: ['business-customer'],
    source: 'obligation',
    question: pair(
      'Facturo a una empresa: he d’emetre factura?',
      'Facturo a una empresa: ¿debo emitir factura?',
    ),
    unknown: pair(
      'He de facturar sempre si no sé qui és el client?',
      '¿Debo facturar siempre si no sé quién es el cliente?',
    ),
    condition: pair(
      'Determina qui rep la prestació i si actua com a empresari o professional.',
      'Determina quién recibe la prestación y si actúa como empresario o profesional.',
    ),
    exclusion: pair(
      'La sola etiqueta d’autònom no resol una operació exempta o especial.',
      'La sola etiqueta de autónomo no resuelve una operación exenta o especial.',
    ),
    fact: pair(
      'Si el destinatari actua com a empresari o professional, s’ha d’expedir factura.',
      'Si el destinatario actúa como empresario o profesional, debe expedirse factura.',
    ),
    step: pair(
      'Consulta l’obligació i les excepcions de l’AEAT abans de triar el tipus de factura.',
      'Consulta la obligación y las excepciones de la AEAT antes de elegir el tipo de factura.',
    ),
  },
  {
    id: 'invoice-exceptions',
    title: pair('Contrastar excepcions de facturació', 'Contrastar excepciones de facturación'),
    profiles: ['exempt-operation', 'equivalence-surcharge', 'simplified-vat'],
    source: 'exceptions',
    question: pair(
      'Una excepció d’IVA elimina sempre la factura?',
      '¿Una excepción de IVA elimina siempre la factura?',
    ),
    unknown: pair(
      'No conec l’operació ni el client; puc ometre la factura?',
      'No conozco la operación ni el cliente; ¿puedo omitir la factura?',
    ),
    condition: pair(
      'Identifica operació, règim d’IVA, territori i destinatari.',
      'Identifica operación, régimen de IVA, territorio y destinatario.',
    ),
    exclusion: pair(
      'Una excepció general pot deixar d’aplicar-se segons el destinatari.',
      'Una excepción general puede dejar de aplicarse según el destinatario.',
    ),
    fact: pair(
      'Amb un destinatari empresari o professional poden persistir obligacions de factura.',
      'Con un destinatario empresario o profesional pueden persistir obligaciones de factura.',
    ),
    step: pair(
      'Contrasta la llista d’excepcions i les seves excepcions internes a l’AEAT.',
      'Contrasta la lista de excepciones y sus excepciones internas en la AEAT.',
    ),
  },
  {
    id: 'invoice-simplified',
    title: pair('Triar factura simplificada o completa', 'Elegir factura simplificada o completa'),
    profiles: ['consumer'],
    source: 'simple',
    question: pair(
      'Puc fer factura simplificada de 400 € IVA inclòs?',
      '¿Puedo hacer factura simplificada de 400 € IVA incluido?',
    ),
    unknown: pair(
      'Sense import, activitat ni operació, puc usar sempre tiquet?',
      'Sin importe, actividad ni operación, ¿puedo usar siempre tique?',
    ),
    condition: pair(
      'Comprova import amb IVA, tipus d’operació i necessitat de deducció del destinatari.',
      'Comprueba importe con IVA, tipo de operación y necesidad de deducción del destinatario.',
    ),
    exclusion: pair(
      'El llindar sectorial de 3.000 € i les operacions prohibides requereixen comprovació separada.',
      'El umbral sectorial de 3.000 € y las operaciones prohibidas requieren comprobación separada.',
    ),
    fact: pair(
      'La regla general de factura simplificada inclou imports que no superen 400 € amb IVA.',
      'La regla general de factura simplificada incluye importes que no superan 400 € con IVA.',
    ),
    step: pair(
      'Comprova els tipus i el contingut requerit a la fitxa AEAT de l’exercici pertinent.',
      'Comprueba los tipos y el contenido exigido en la ficha AEAT del ejercicio pertinente.',
    ),
  },
  {
    id: 'invoice-simplified-sector',
    title: pair(
      'Factura simplificada en activitats enumerades',
      'Factura simplificada en actividades enumeradas',
    ),
    profiles: ['retail', 'hospitality'],
    source: 'simpleSector',
    question: pair(
      'Puc aplicar el límit sectorial de 3.000 € a venda minorista o hostaleria?',
      '¿Puedo aplicar el límite sectorial de 3.000 € a venta minorista u hostelería?',
    ),
    unknown: pair(
      'Sense activitat, import i destinatari, puc aplicar 3.000 €?',
      'Sin actividad, importe y destinatario, ¿puedo aplicar 3.000 €?',
    ),
    condition: pair(
      'Comprova que l’operació figura a la llista tancada i que l’import inclou IVA.',
      'Comprueba que la operación figura en la lista cerrada y que el importe incluye IVA.',
    ),
    exclusion: pair(
      'El límit de 3.000 € no és general ni elimina les prohibicions de factura simplificada.',
      'El límite de 3.000 € no es general ni elimina las prohibiciones de factura simplificada.',
    ),
    fact: pair(
      'Algunes operacions enumerades admeten factura simplificada fins a 3.000 € IVA inclòs.',
      'Algunas operaciones enumeradas admiten factura simplificada hasta 3.000 € IVA incluido.',
    ),
    step: pair(
      'Obre la llista AEAT i verifica l’operació concreta abans d’emetre.',
      'Abre la lista AEAT y verifica la operación concreta antes de emitir.',
    ),
  },
  {
    id: 'irpf-professional-books',
    title: pair('Llibres IRPF de professionals', 'Libros IRPF de profesionales'),
    profiles: ['professional-direct-estimation'],
    source: 'professionalBooks',
    question: pair(
      'Quins llibres IRPF reviso si sóc professional en estimació directa?',
      '¿Qué libros IRPF reviso si soy profesional en estimación directa?',
    ),
    unknown: pair(
      'No sé si la meva activitat és professional: quins llibres exactes porto?',
      'No sé si mi actividad es profesional: ¿qué libros exactos llevo?',
    ),
    condition: pair(
      'Confirma naturalesa professional i estimació directa normal o simplificada.',
      'Confirma naturaleza profesional y estimación directa normal o simplificada.',
    ),
    exclusion: pair(
      'La regla no classifica activitat mercantil, mòduls ni llibres d’IVA.',
      'La regla no clasifica actividad mercantil, módulos ni libros de IVA.',
    ),
    fact: pair(
      'A més dels llibres d’ingressos, despeses i béns d’inversió, revisa provisions de fons i suplerts.',
      'Además de ingresos, gastos y bienes de inversión, revisa provisiones de fondos y suplidos.',
    ),
    step: pair(
      'Consulta la relació de l’AEAT segons l’activitat i l’exercici abans de preparar els llibres.',
      'Consulta la relación de la AEAT según actividad y ejercicio antes de preparar los libros.',
    ),
  },
  {
    id: 'vat-books',
    title: pair('Llibres de registre d’IVA', 'Libros registro de IVA'),
    profiles: ['general-vat', 'monthly-vat'],
    source: 'vatBooks',
    question: pair(
      'Quins llibres d’IVA he de contrastar en règim general?',
      '¿Qué libros de IVA debo contrastar en régimen general?',
    ),
    unknown: pair(
      'Sense conèixer el règim d’IVA, quins llibres em pertoquen?',
      'Sin conocer el régimen de IVA, ¿qué libros me corresponden?',
    ),
    condition: pair(
      'Comprova règim d’IVA, operacions intracomunitàries i periodicitat.',
      'Comprueba régimen de IVA, operaciones intracomunitarias y periodicidad.',
    ),
    exclusion: pair(
      'SII i règims especials poden alterar la forma de portar els llibres.',
      'SII y regímenes especiales pueden alterar la forma de llevar los libros.',
    ),
    fact: pair(
      'El règim general inclou el llibre de factures expedides; revisa també rebudes, inversió i certes intracomunitàries.',
      'El régimen general incluye el libro de facturas expedidas; revisa también recibidas, inversión y ciertas intracomunitarias.',
    ),
    step: pair(
      'Consulta la llista AEAT i la fitxa del règim abans d’anotar operacions.',
      'Consulta la lista AEAT y la ficha del régimen antes de anotar operaciones.',
    ),
  },
  {
    id: 'vat-entry-deadlines',
    title: pair('Separar anotació i autoliquidació', 'Separar anotación y autoliquidación'),
    profiles: ['general-vat'],
    source: 'vatEntries',
    question: pair(
      'L’anotació d’IVA té el mateix termini que emetre factura?',
      '¿La anotación de IVA tiene el mismo plazo que emitir factura?',
    ),
    unknown: pair(
      'Sense període de liquidació ni tipus d’operació, quin és el dia exacte?',
      'Sin período de liquidación ni tipo de operación, ¿cuál es el día exacto?',
    ),
    condition: pair(
      'Identifica el període de liquidació i si l’operació té factura.',
      'Identifica el período de liquidación y si la operación tiene factura.',
    ),
    exclusion: pair(
      'Operacions sense factura i intracomunitàries poden seguir altres terminis.',
      'Operaciones sin factura e intracomunitarias pueden seguir otros plazos.',
    ),
    fact: pair(
      'L’anotació ordinària ha de constar abans que acabi el termini de liquidació voluntària.',
      'La anotación ordinaria debe constar antes de que termine el plazo de liquidación voluntaria.',
    ),
    step: pair(
      'Consulta el termini de l’anotació AEAT i, separadament, el de l’autoliquidació aplicable.',
      'Consulta el plazo de anotación AEAT y, por separado, el de la autoliquidación aplicable.',
    ),
  },
  {
    id: 'invoice-retention',
    title: pair('Conservar factures i justificants', 'Conservar facturas y justificantes'),
    profiles: ['self-employed'],
    source: 'retention',
    question: pair(
      'Puc destruir totes les factures al cap de quatre anys?',
      '¿Puedo destruir todas las facturas tras cuatro años?',
    ),
    unknown: pair(
      'No sé si hi ha interrupcions ni béns d’inversió: quan esborro?',
      'No sé si hay interrupciones ni bienes de inversión: ¿cuándo borro?',
    ),
    condition: pair(
      'Distingeix document tributari, llibre mercantil, bé regularitzable i inici de prescripció.',
      'Distingue documento tributario, libro mercantil, bien regularizable e inicio de prescripción.',
    ),
    exclusion: pair(
      'El termini general no autoritza a destruir fitxers automàticament.',
      'El plazo general no autoriza a destruir archivos automáticamente.',
    ),
    fact: pair(
      'La regla tributària general cita un termini de prescripció de 4 anys.',
      'La regla tributaria general cita un plazo de prescripción de 4 años.',
    ),
    step: pair(
      'Consulta la conservació AEAT i comprova interrupcions i terminis especials abans de decidir.',
      'Consulta la conservación AEAT y comprueba interrupciones y plazos especiales antes de decidir.',
    ),
  },
  {
    id: 'investment-invoice-retention',
    title: pair(
      'Conservar factures de béns regularitzables',
      'Conservar facturas de bienes regularizables',
    ),
    profiles: ['investment-goods'],
    source: 'investmentRetention',
    question: pair(
      'Quant conservo factures de béns d’inversió amb IVA regularitzable?',
      '¿Cuánto conservo facturas de bienes de inversión con IVA regularizable?',
    ),
    unknown: pair(
      'Sense període de regularització conegut, puc eliminar factures als quatre anys?',
      'Sin período de regularización conocido, ¿puedo eliminar facturas a los cuatro años?',
    ),
    condition: pair(
      'Confirma que la deducció d’IVA és regularitzable i determina el seu període.',
      'Confirma que la deducción de IVA es regularizable y determina su período.',
    ),
    exclusion: pair(
      'La regla general tributària no substitueix aquest termini especial ni el mercantil.',
      'La regla general tributaria no sustituye este plazo especial ni el mercantil.',
    ),
    fact: pair(
      'Cal conservar durant el període de regularització i els quatre anys següents.',
      'Hay que conservar durante el período de regularización y los cuatro años siguientes.',
    ),
    step: pair(
      'Consulta l’AEAT i verifica període i possibles interrupcions abans de decidir.',
      'Consulta la AEAT y verifica período y posibles interrupciones antes de decidir.',
    ),
  },
  {
    id: 'tax-calendar-2026',
    title: pair('Consultar el calendari tributari 2026', 'Consultar el calendario tributario 2026'),
    profiles: ['self-employed'],
    source: 'calendar',
    question: pair(
      'On comprovo el calendari de models de 2026?',
      '¿Dónde compruebo el calendario de modelos de 2026?',
    ),
    unknown: pair(
      'Quina data tinc sense saber model ni exercici?',
      '¿Qué fecha tengo sin saber modelo ni ejercicio?',
    ),
    condition: pair(
      'Determina exercici, model i periodicitat abans de consultar un venciment.',
      'Determina ejercicio, modelo y periodicidad antes de consultar un vencimiento.',
    ),
    exclusion: pair(
      'El calendari de models no fixa el termini d’emetre factura.',
      'El calendario de modelos no fija el plazo de emitir factura.',
    ),
    fact: pair(
      'L’AEAT publica un calendari del contribuent específic de 2026.',
      'La AEAT publica un calendario del contribuyente específico de 2026.',
    ),
    step: pair(
      'Obre el calendari de l’exercici correcte i comprova-hi el model aplicable.',
      'Abre el calendario del ejercicio correcto y comprueba allí el modelo aplicable.',
    ),
  },
  {
    id: 'irpf-mercantile-books',
    title: pair('Comptabilitat d’activitat mercantil', 'Contabilidad de actividad mercantil'),
    profiles: ['mercantile-business-direct-normal'],
    source: 'mercantileBooks',
    question: pair(
      'Quins llibres corresponen a una activitat mercantil en directa normal?',
      '¿Qué libros corresponden a una actividad mercantil en directa normal?',
    ),
    unknown: pair(
      'Sense saber si sóc mercantil ni el règim, quins llibres porto?',
      'Sin saber si soy mercantil ni el régimen, ¿qué libros llevo?',
    ),
    condition: pair(
      'Confirma activitat empresarial mercantil i estimació directa normal.',
      'Confirma actividad empresarial mercantil y estimación directa normal.',
    ),
    exclusion: pair(
      'Aquesta ruta no cobreix professions, estimació simplificada ni llibres d’IVA.',
      'Esta ruta no cubre profesiones, estimación simplificada ni libros de IVA.',
    ),
    fact: pair(
      'La comptabilitat s’ajusta al Codi de Comerç i al Pla General de Comptabilitat.',
      'La contabilidad se ajusta al Código de Comercio y al Plan General de Contabilidad.',
    ),
    step: pair(
      'Contrasta la classificació censal i obre la fitxa AEAT abans de preparar la comptabilitat.',
      'Contrasta la clasificación censal y abre la ficha AEAT antes de preparar la contabilidad.',
    ),
  },
  {
    id: 'irpf-business-registers',
    title: pair(
      'Llibres IRPF de negoci no mercantil o directa simplificada',
      'Libros IRPF de negocio no mercantil o directa simplificada',
    ),
    profiles: ['non-mercantile-business-direct-normal', 'business-direct-simplified'],
    source: 'nonMercantileBooks',
    question: pair(
      'Quins llibres IRPF reviso en directa simplificada o negoci no mercantil?',
      '¿Qué libros IRPF reviso en directa simplificada o negocio no mercantil?',
    ),
    unknown: pair(
      'Desconec activitat i estimació: quins registres exactes calen?',
      'Desconozco actividad y estimación: ¿qué registros exactos hacen falta?',
    ),
    condition: pair(
      'Verifica que ets empresari no mercantil en directa normal o empresari en directa simplificada.',
      'Verifica que eres empresario no mercantil en directa normal o empresario en directa simplificada.',
    ),
    exclusion: pair(
      'No substitueix la comptabilitat mercantil de directa normal ni els llibres d’IVA.',
      'No sustituye la contabilidad mercantil de directa normal ni los libros de IVA.',
    ),
    fact: pair(
      'Revisa vendes i ingressos, compres i despeses, i béns d’inversió.',
      'Revisa ventas e ingresos, compras y gastos, y bienes de inversión.',
    ),
    step: pair(
      'Comprova la modalitat d’IRPF i consulta el format dels llibres de l’exercici a l’AEAT.',
      'Comprueba la modalidad de IRPF y consulta el formato de los libros del ejercicio en la AEAT.',
    ),
  },
  {
    id: 'irpf-modules-books',
    title: pair('Llibres i justificants de mòduls', 'Libros y justificantes de módulos'),
    profiles: ['business-objective-estimation'],
    source: 'modulesBooks',
    question: pair(
      'Quins llibres i justificants reviso si tributo per mòduls?',
      '¿Qué libros y justificantes reviso si tributo por módulos?',
    ),
    unknown: pair(
      'Sense saber si aplico mòduls ni amortitzacions, quin llibre concret cal?',
      'Sin saber si aplico módulos ni amortizaciones, ¿qué libro concreto hace falta?',
    ),
    condition: pair(
      'Confirma estimació objectiva, amortitzacions i si el rendiment depèn del volum.',
      'Confirma estimación objetiva, amortizaciones y si el rendimiento depende del volumen.',
    ),
    exclusion: pair(
      'El llibre d’inversió i el de vendes depenen de condicions diferents.',
      'El libro de inversión y el de ventas dependen de condiciones distintas.',
    ),
    fact: pair(
      'Hi ha llibre de béns d’inversió si dedueixes amortitzacions; conserva factures i justificants dels mòduls.',
      'Hay libro de bienes de inversión si deduces amortizaciones; conserva facturas y justificantes de los módulos.',
    ),
    step: pair(
      'Revisa a l’AEAT el llibre que activa cada condició i els comprovants de l’activitat.',
      'Revisa en la AEAT el libro que activa cada condición y los justificantes de la actividad.',
    ),
  },
  {
    id: 'invoice-issuance-deadline',
    title: pair('Termini d’expedició de factura', 'Plazo de expedición de factura'),
    profiles: ['business-customer'],
    source: 'invoiceDeadline',
    question: pair(
      'Quan s’expedeix una factura segons el destinatari?',
      '¿Cuándo se expide una factura según el destinatario?',
    ),
    unknown: pair(
      'Sense data de meritació ni destinatari, quin és el meu venciment?',
      'Sin fecha de devengo ni destinatario, ¿cuál es mi vencimiento?',
    ),
    condition: pair(
      'Identifica operació, meritació, destinatari i tipus de factura.',
      'Identifica operación, devengo, destinatario y tipo de factura.',
    ),
    exclusion: pair(
      'No confonguis expedició amb remissió, anotació o declaració.',
      'No confundas expedición con remisión, anotación o declaración.',
    ),
    fact: pair(
      'En una operació B2B ordinària, s’expedeix abans del dia 16 del mes següent a la meritació.',
      'En una operación B2B ordinaria, se expide antes del día 16 del mes siguiente al devengo.',
    ),
    step: pair(
      'Consulta l’article 11 i comprova si hi ha regla especial o factura recapitulativa.',
      'Consulta el artículo 11 y comprueba si hay regla especial o factura recapitulativa.',
    ),
  },
  {
    id: 'invoice-required-fields',
    title: pair(
      'Dades de factura completa i simplificada',
      'Datos de factura completa y simplificada',
    ),
    profiles: ['full-invoice', 'simplified-invoice'],
    source: 'invoiceFields',
    question: pair(
      'On comprovo les dades obligatòries de cada tipus de factura?',
      '¿Dónde compruebo los datos obligatorios de cada tipo de factura?',
    ),
    unknown: pair(
      'Sense tipus de factura ni operació, quines dades exactes exigeix?',
      'Sin tipo de factura ni operación, ¿qué datos exactos exige?',
    ),
    condition: pair(
      'Classifica la factura completa, simplificada o rectificativa i el destinatari.',
      'Clasifica la factura completa, simplificada o rectificativa y el destinatario.',
    ),
    exclusion: pair(
      'Una simplificada per deduir IVA necessita dades addicionals del destinatari.',
      'Una simplificada para deducir IVA necesita datos adicionales del destinatario.',
    ),
    fact: pair(
      'La numeració i, si escau, la sèrie formen part del contingut que cal comprovar.',
      'La numeración y, en su caso, la serie forman parte del contenido que hay que comprobar.',
    ),
    step: pair(
      'Obre la fitxa de contingut AEAT abans d’emplenar els camps en el sistema d’emissió.',
      'Abre la ficha de contenido AEAT antes de rellenar los campos en el sistema de emisión.',
    ),
  },
  {
    id: 'invoice-consumer-deadline',
    title: pair('Expedir factura al consumidor', 'Expedir factura al consumidor'),
    profiles: ['consumer'],
    source: 'invoiceConsumerDeadline',
    question: pair(
      'Quan expedeixo una factura ordinària a un consumidor?',
      '¿Cuándo expido una factura ordinaria a un consumidor?',
    ),
    unknown: pair(
      'Sense operació ni data, quin dia exacte he d’emetre?',
      'Sin operación ni fecha, ¿qué día exacto debo emitir?',
    ),
    condition: pair(
      'Confirma que el destinatari és consumidor i quan es fa l’operació.',
      'Confirma que el destinatario es consumidor y cuándo se realiza la operación.',
    ),
    exclusion: pair(
      'Anticipis i operacions especials exigeixen una revisió pròpia.',
      'Anticipos y operaciones especiales exigen una revisión propia.',
    ),
    fact: pair(
      'La factura ordinària s’expedeix en el moment de l’operació.',
      'La factura ordinaria se expide en el momento de la operación.',
    ),
    step: pair(
      'Consulta l’article 11 i confirma la meritació i el tipus de factura.',
      'Consulta el artículo 11 y confirma el devengo y el tipo de factura.',
    ),
  },
  {
    id: 'mercantile-record-retention',
    title: pair('Conservació de llibres mercantils', 'Conservación de libros mercantiles'),
    profiles: ['mercantile-business'],
    source: 'mercantileRetention',
    question: pair(
      'Quant conservo llibres i documents mercantils?',
      '¿Cuánto conservo libros y documentos mercantiles?',
    ),
    unknown: pair(
      'Sense data de darrer assentament ni altres obligacions, puc eliminar-los?',
      'Sin fecha de último asiento ni otras obligaciones, ¿puedo eliminarlos?',
    ),
    condition: pair(
      'Identifica llibres i documents mercantils i el darrer assentament.',
      'Identifica libros y documentos mercantiles y el último asiento.',
    ),
    exclusion: pair(
      'El termini mercantil és diferent del tributari i el cessament no l’elimina.',
      'El plazo mercantil es distinto del tributario y el cese no lo elimina.',
    ),
    fact: pair(
      'La regla mercantil és de sis anys des del darrer assentament.',
      'La regla mercantil es de seis años desde el último asiento.',
    ),
    step: pair(
      'Comprova el darrer assentament i altres terminis aplicables abans de decidir conservar o destruir.',
      'Comprueba el último asiento y otros plazos aplicables antes de decidir conservar o destruir.',
    ),
  },
  {
    id: 'sif-verifactu',
    title: pair('Distingir SIF i VERI*FACTU', 'Distinguir SIF y VERI*FACTU'),
    profiles: ['irpf-sif-issuer'],
    source: 'sif',
    question: pair(
      'Com comprovo si m’afecta el RRSIF i el termini del meu SIF?',
      '¿Cómo compruebo si me afecta el RRSIF y el plazo de mi SIF?',
    ),
    unknown: pair(
      'Sense saber si uso SIF, SII o normativa foral, em toca VERI*FACTU?',
      'Sin saber si uso SIF, SII o normativa foral, ¿me toca VERI*FACTU?',
    ),
    condition: pair(
      'Verifica emissió real amb SIF, SII, jurisdicció fiscal i resolucions d’exempció.',
      'Verifica emisión real con SIF, SII, jurisdicción fiscal y resoluciones de exención.',
    ),
    exclusion: pair(
      'Facturació només manual, SII i subjecció foral tenen tractament diferent; VERI*FACTU és una modalitat, no tota la norma.',
      'Facturación solo manual, SII y sujeción foral tienen trato distinto; VERI*FACTU es una modalidad, no toda la norma.',
    ),
    fact: pair(
      'Per a la resta d’obligats de l’article 3.1, el SIF adaptat ha d’estar operatiu abans de l’1 de juliol de 2027.',
      'Para el resto de obligados del artículo 3.1, el SIF adaptado debe estar operativo antes del 1 de julio de 2027.',
    ),
    step: pair(
      'Contrasta els quatre criteris AEAT i el calendari legal actual abans de triar un sistema.',
      'Contrasta los cuatro criterios AEAT y el calendario legal actual antes de elegir un sistema.',
    ),
  },
  {
    id: 'sif-manual-exception',
    title: pair('Facturació només manual i RRSIF', 'Facturación solo manual y RRSIF'),
    profiles: ['manual-invoicing'],
    source: 'sifManual',
    question: pair(
      'Si totes les factures són manuals, em cobreix el RRSIF?',
      'Si todas las facturas son manuales, ¿me cubre el RRSIF?',
    ),
    unknown: pair(
      'Sense saber si el programa emet factures, puc excloure el RRSIF?',
      'Sin saber si el programa emite facturas, ¿puedo excluir el RRSIF?',
    ),
    condition: pair(
      'Verifica que totes les factures s’expedeixen sense SIF.',
      'Verifica que todas las facturas se expiden sin SIF.',
    ),
    exclusion: pair(
      'Un programa que emet factures pot activar la norma encara que en diguis manual.',
      'Un programa que emite facturas puede activar la norma aunque lo llames manual.',
    ),
    fact: pair(
      'La facturació exclusivament manual queda fora del col·lectiu afectat per SIF.',
      'La facturación exclusivamente manual queda fuera del colectivo afectado por SIF.',
    ),
    step: pair(
      'Comprova la funció real del programa a la FAQ de l’AEAT.',
      'Comprueba la función real del programa en la FAQ de la AEAT.',
    ),
  },
  {
    id: 'sif-sii-exception',
    title: pair('Separar SII i RRSIF', 'Separar SII y RRSIF'),
    profiles: ['sii-issuer'],
    source: 'sifSii',
    question: pair(
      'Si estic adscrit al SII, s’aplica el mateix RRSIF?',
      'Si estoy adscrito al SII, ¿se aplica el mismo RRSIF?',
    ),
    unknown: pair(
      'Sense saber si estic adscrit al SII, puc excloure el SIF?',
      'Sin saber si estoy adscrito al SII, ¿puedo excluir el SIF?',
    ),
    condition: pair(
      'Confirma l’adscripció efectiva, obligatòria o voluntària, al SII.',
      'Confirma la adscripción efectiva, obligatoria o voluntaria, al SII.',
    ),
    exclusion: pair(
      'No infereixis SII només per presentar IVA mensualment.',
      'No infieras SII solo por presentar IVA mensualmente.',
    ),
    fact: pair(
      'L’adscripció al SII és un criteri d’exclusió de l’àmbit RRSIF.',
      'La adscripción al SII es un criterio de exclusión del ámbito RRSIF.',
    ),
    step: pair(
      'Contrasta l’adscripció i les obligacions del SII a l’AEAT.',
      'Contrasta la adscripción y las obligaciones del SII en la AEAT.',
    ),
  },
  {
    id: 'b2b-electronic-invoice',
    title: pair('Factura electrònica entre empreses', 'Factura electrónica entre empresas'),
    profiles: ['business-customer'],
    source: 'b2b',
    question: pair(
      'Puc fixar ja la data obligatòria de factura electrònica B2B?',
      '¿Puedo fijar ya la fecha obligatoria de factura electrónica B2B?',
    ),
    unknown: pair(
      'Sense ordre tècnica ni volum de l’any anterior, quina data exacta tinc?',
      'Sin orden técnica ni volumen del año anterior, ¿qué fecha exacta tengo?',
    ),
    condition: pair(
      'Comprova l’entrada en vigor de l’ordre tècnica i el volum de l’any anterior.',
      'Comprueba la entrada en vigor de la orden técnica y el volumen del año anterior.',
    ),
    exclusion: pair(
      'L’entrada en vigor del reial decret no inicia tota sola el termini; B2B no és e-FACT B2G ni VERI*FACTU.',
      'La entrada en vigor del real decreto no inicia por sí sola el plazo; B2B no es e-FACT B2G ni VERI*FACTU.',
    ),
    fact: pair(
      'Per a la resta d’empresaris, l’efecte arriba 24 mesos després de l’entrada en vigor de l’ordre tècnica.',
      'Para el resto de empresarios, el efecto llega 24 meses después de entrar en vigor la orden técnica.',
    ),
    step: pair(
      'Consulta al BOE la disposició final quarta i verifica si s’ha publicat l’ordre.',
      'Consulta en el BOE la disposición final cuarta y verifica si se ha publicado la orden.',
    ),
  },
  {
    id: 'b2g-efact',
    title: pair('Facturar a la Generalitat per e-FACT', 'Facturar a la Generalitat por e-FACT'),
    profiles: ['generalitat-supplier'],
    source: 'b2g',
    question: pair(
      'Quin punt d’entrada consulto per facturar a la Generalitat?',
      '¿Qué punto de entrada consulto para facturar a la Generalitat?',
    ),
    unknown: pair(
      'Sense identificar administració receptora ni contracte, puc enviar a e-FACT?',
      'Sin identificar administración receptora ni contrato, ¿puedo enviar a e-FACT?',
    ),
    condition: pair(
      'Confirma l’ens públic receptor i les condicions del contracte.',
      'Confirma el ente público receptor y las condiciones del contrato.',
    ),
    exclusion: pair(
      'El canal B2G no és la factura electrònica B2B; verifica excepcions i format del receptor.',
      'El canal B2G no es la factura electrónica B2B; verifica excepciones y formato del receptor.',
    ),
    fact: pair(
      'El punt d’entrada de la Generalitat i el seu sector públic és e-FACT.',
      'El punto de entrada de la Generalitat y su sector público es e-FACT.',
    ),
    step: pair(
      'Comprova receptor, codis DIR3 i requisits de signatura abans d’usar el portal oficial.',
      'Comprueba receptor, códigos DIR3 y requisitos de firma antes de usar el portal oficial.',
    ),
  },
  {
    id: 'b2b-large-electronic-invoice',
    title: pair('Fase B2B de volum elevat', 'Fase B2B de volumen elevado'),
    profiles: ['business-high-turnover'],
    source: 'b2bLarge',
    question: pair(
      'Quina fase B2B correspon al volum superior a vuit milions?',
      '¿Qué fase B2B corresponde al volumen superior a ocho millones?',
    ),
    unknown: pair(
      'Sense volum de l’any anterior ni ordre tècnica, quina data exacta tinc?',
      'Sin volumen del año anterior ni orden técnica, ¿qué fecha exacta tengo?',
    ),
    condition: pair(
      'Comprova volum de l’any natural anterior i vigència de l’ordre tècnica.',
      'Comprueba volumen del año natural anterior y vigencia de la orden técnica.',
    ),
    exclusion: pair(
      'Aquesta fase no s’aplica automàticament a tot autònom.',
      'Esta fase no se aplica automáticamente a todo autónomo.',
    ),
    fact: pair(
      'Per al tram superior a vuit milions, l’efecte arriba dotze mesos després de l’ordre tècnica.',
      'Para el tramo superior a ocho millones, el efecto llega doce meses después de la orden técnica.',
    ),
    step: pair(
      'Consulta el BOE i calcula el tram només amb dades del període corresponent.',
      'Consulta el BOE y calcula el tramo solo con datos del período correspondiente.',
    ),
  },
];

/** Controlled public candidates: source authenticity, semantic translation and applicability are still pending. */
export const invoicingGuides: Guide[] = entries.map((entry) => {
  const evidence = sources[entry.source];
  const cited = (id: string, value: Pair) => ({
    id,
    text: value,
    evidenceIds: [evidence.id],
    translation: 'ca' as const,
  });
  return guideSchema.parse({
    id: entry.id,
    revision: 1,
    title: entry.title,
    domain: 'D-08',
    subtopic: entry.id,
    profiles: entry.profiles,
    jurisdiction: 'ES-CT',
    consultedAt,
    period:
      entry.id === 'tax-calendar-2026'
        ? { until: '2026-12-31', evidenceIds: [evidence.id] }
        : entry.id === 'sif-verifactu'
          ? { until: '2027-06-30', evidenceIds: [evidence.id] }
          : { evidenceIds: [] },
    validation: { status: 'pending' },
    evidence: entry.id === 'invoice-simplified' ? [evidence, sources.simpleSector] : [evidence],
    conditions: [cited('condition', entry.condition)],
    exclusions: [
      entry.id === 'invoice-simplified'
        ? { ...cited('exclusion', entry.exclusion), evidenceIds: [sources.simpleSector.id] }
        : cited('exclusion', entry.exclusion),
    ],
    claims: [{ ...cited('fact', entry.fact), kind: 'fact', conditionIds: ['condition'] }],
    steps: [{ ...cited('step', entry.step), dependsOn: [] }],
  });
});

export const invoicingQuestions = entries.map(({ id, profiles, question, unknown }) => ({
  id,
  profiles,
  question,
  unknown,
}));
