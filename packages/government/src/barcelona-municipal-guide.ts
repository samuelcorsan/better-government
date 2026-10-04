import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const jurisdiction = 'ES-CT-BARCELONA';
const source = 'barcelona-tramits';
const caUrl =
  'https://seuelectronica.ajuntament.barcelona.cat/APPS/portaltramits/ca/ciudadano/descripcio/T814i/PTCIU.html';
const esUrl =
  'https://seuelectronica.ajuntament.barcelona.cat/APPS/portaltramits/es/ciudadano/descripcio/T814i/PTCIU.html';
const text = (ca: string, es: string) => ({ ca, es });
const cited = (id: string) => [`${id}-ca`, `${id}-es`];
const evidence = (id: string, language: 'ca' | 'es', quote: string): Guide['evidence'][number] => ({
  id: `${id}-${language}`,
  sourceId: source,
  url: language === 'ca' ? caUrl : esUrl,
  originalUrl: language === 'ca' ? caUrl : esUrl,
  version: 'observed-2026-10-04',
  language,
  attribution:
    language === 'ca'
      ? 'Ajuntament de Barcelona; adaptació pròpia sense aval municipal'
      : 'Ajuntament de Barcelona; adaptación propia sin aval municipal',
  sourceUpdatedAt: null,
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction,
  quote,
});

/** Public municipal case only. No authenticated form or activity classification was verified. */
export const barcelonaMunicipalGuide: Guide = guideSchema.parse({
  id: 'barcelona-plan-usos-local',
  revision: 1,
  title: text(
    'Local a Barcelona: informe urbanístic previ en un Pla d’usos',
    'Local en Barcelona: informe urbanístico previo en un Plan de usos',
  ),
  domain: 'D-06',
  subtopic: 'municipal-premises-barcelona',
  profiles: ['with-premises'],
  jurisdiction,
  consultedAt,
  period: { evidenceIds: [] },
  validation: { status: 'pending' },
  evidence: [
    evidence('scope', 'ca', "activitat inclosa en els Plans d'usos"),
    evidence('scope', 'es', 'actividad incluida en los Planes de usos'),
    evidence('consult', 'ca', "Número identificador de la consulta prèvia d'activitats"),
    evidence('consult', 'es', 'Número identificador de la consulta previa de actividades'),
    evidence(
      'documents',
      'ca',
      'Memòria explicativa amb les dades de superfície útil, públic, etc. amb plànols de planta i secció',
    ),
    evidence(
      'documents',
      'es',
      'Memoria explicativa con los datos de superficie útil, público, etc. con planos de planta y sección',
    ),
    evidence(
      'upload',
      'ca',
      'Adjunteu els arxius o fitxers de la documentació necessària pel tràmit.',
    ),
    evidence(
      'upload',
      'es',
      'Adjunte los archivos o ficheros de la documentación necesaria para el trámite.',
    ),
    evidence('form', 'ca', 'Signeu la sol·licitud per presentar-la al registre telemàtic.'),
    evidence('form', 'es', 'Firme la solicitud para presentarla en el registro telemático.'),
    evidence('payment', 'ca', 'Efectueu el pagament en línia.'),
    evidence('payment', 'es', 'Efectúe el pago en línea.'),
    evidence(
      'authority',
      'ca',
      "Ajuntament de Barcelona / Gerència d'Àrea d'Urbanisme i Habitatge",
    ),
    evidence(
      'authority',
      'es',
      'Ayuntamiento de Barcelona / Gerencia de Área de Urbanismo y Vivienda',
    ),
  ],
  conditions: [
    {
      id: 'plan-usos',
      text: text(
        'L’activitat del local a Barcelona està inclosa en un Pla d’usos del districte o de ciutat.',
        'La actividad del local en Barcelona está incluida en un Plan de usos del distrito o de ciudad.',
      ),
      evidenceIds: cited('scope'),
      translation: null,
    },
  ],
  exclusions: [
    {
      id: 'other-case',
      text: text(
        'Aquesta fitxa no determina el permís d’un altre municipi ni classifica una activitat que no s’hagi comprovat en el Pla d’usos.',
        'Esta ficha no determina el permiso de otro municipio ni clasifica una actividad no comprobada en el Plan de usos.',
      ),
      evidenceIds: [...cited('scope'), ...cited('authority')],
      translation: null,
    },
  ],
  claims: [],
  steps: [
    {
      id: 'consult-activity',
      text: text(
        'Abans de demanar l’informe, tingues a mà el número identificador de la consulta prèvia d’activitats que demana aquesta fitxa.',
        'Antes de pedir el informe, ten a mano el número identificador de la consulta previa de actividades que pide esta ficha.',
      ),
      evidenceIds: cited('consult'),
      translation: null,
      dependsOn: [],
    },
    {
      id: 'prepare-plan',
      text: text(
        'Prepara la memòria amb superfície útil i plànols de planta i secció que justifiquin el Pla d’usos; comprova si el cas exigeix més documents.',
        'Prepara la memoria con superficie útil y planos de planta y sección que justifiquen el Plan de usos; comprueba si el caso exige más documentos.',
      ),
      evidenceIds: cited('documents'),
      translation: null,
      dependsOn: ['consult-activity'],
    },
    {
      id: 'request-report',
      text: text(
        'Obre la fitxa municipal de l’informe urbanístic previ i segueix el formulari original per adjuntar la documentació, signar i pagar si correspon.',
        'Abre la ficha municipal del informe urbanístico previo y sigue el formulario original para adjuntar la documentación, firmar y pagar si corresponde.',
      ),
      evidenceIds: [...cited('upload'), ...cited('form'), ...cited('payment')],
      translation: null,
      dependsOn: ['prepare-plan'],
    },
  ],
});

export const barcelonaMunicipalCoverage = {
  guideId: barcelonaMunicipalGuide.id,
  status: 'partial' as const,
  questions: [
    text('El local és a Barcelona?', '¿El local está en Barcelona?'),
    text(
      'L’activitat i l’adreça estan incloses en un Pla d’usos?',
      '¿La actividad y la dirección están incluidas en un Plan de usos?',
    ),
    text('Hi haurà obres o altres autoritzacions?', '¿Habrá obras u otras autorizaciones?'),
  ],
  gaps: [
    text(
      'La consulta no substitueix la comunicació o llicència d’activitat; cal comprovar el règim del cas i la pantalla autenticada abans d’automatitzar-la.',
      'La consulta no sustituye la comunicación o licencia de actividad; hay que comprobar el régimen del caso y la pantalla autenticada antes de automatizarla.',
    ),
  ],
};
