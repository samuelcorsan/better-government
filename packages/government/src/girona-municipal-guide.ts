import { guideSchema, type Guide } from '@reforma-digital/core';

const url = 'https://seu-e.cat/ca/web/girona/tramits-i-gestions/-/tramits/tramit/16092827';
const consultedAt = '2026-10-04';
const sourceUpdatedAt = '2023-07-05';
const jurisdiction = 'ES-CT-GIRONA';
const text = (ca: string, es: string) => ({ ca, es });
const cited = (id: string, ca: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'girona-aoc',
  url,
  originalUrl: url,
  version: sourceUpdatedAt,
  language: 'ca',
  attribution: 'Ajuntament de Girona, Seu-e; traducció pròpia al castellà, sense aval municipal',
  sourceUpdatedAt,
  // The page edition is evidence of this path, not a claim about when the law took effect.
  applicableFrom: sourceUpdatedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction,
  quote: ca,
});

/** One conditional municipal route. No address, authenticated form or local classification was checked. */
export const gironaMunicipalGuide: Guide = guideSchema.parse({
  id: 'girona-activity-technical-certificate',
  revision: 1,
  title: text(
    'Inici d’activitat amb certificat tècnic en un local de Girona',
    'Inicio de actividad con certificado técnico en un local de Girona',
  ),
  domain: 'D-06',
  subtopic: 'municipal-premises-girona',
  profiles: ['with-premises'],
  jurisdiction,
  consultedAt,
  period: { evidenceIds: [] },
  validation: { status: 'pending' },
  evidence: [
    cited('annex', 'vegeu columna corresponent a "“Certificat tècnic"'),
    cited(
      'urbanism',
      "L'activitat a desenvolupar ha de ser compatible amb el planejament urbanístic.",
    ),
    cited(
      'works',
      "Disposar de la corresponent llicència o comunicació prèvia d'obres quan correspongui.",
    ),
    cited('certificate', 'certificat tècnic justificatiu del compliment de la normativa'),
    cited('signature', 'signat per un tècnic competent'),
    cited(
      'sector',
      "Disposar de tots els títols habilitants necessaris per l'exercici de l'activitat.",
    ),
    cited('timing', "es presenta abans d'iniciar l'activitat i un cop finalitzades les obres"),
    cited(
      'intervention',
      'intervenció prèvia preceptiva segons la normativa sectorial hagi finalitzat favorablement',
    ),
    cited('fee', 'Haver fet el pagament de la taxa municipal associada a aquest tràmit.'),
    cited('authority', 'Àrea municipal de gestió de les activitats i llicències'),
    cited(
      'public-domain',
      "La comunicació no atorga a la persona o empresa titular de l'activitat, facultats sobre el domini públic",
    ),
    cited(
      'hut',
      "Amb aquest formulari no es poden comunicar els establiments turístics d'habitatges d'ús turístic",
    ),
  ],
  conditions: [
    {
      id: 'certificate-column',
      text: text(
        'Aquesta ruta només és per a una activitat del local classificada a la columna «Certificat tècnic» de l’annex de la Llei 18/2020.',
        'Esta ruta sólo corresponde a una actividad del local clasificada en la columna «Certificado técnico» del anexo de la Ley 18/2020.',
      ),
      evidenceIds: ['annex'],
      translation: 'es',
    },
  ],
  exclusions: [
    {
      id: 'different-activity-or-city',
      text: text(
        'No dedueix la classificació d’un local concret ni el tràmit d’un altre municipi. Els HUT tenen un formulari específic.',
        'No determina la clasificación de un local concreto ni el trámite de otro municipio. Las viviendas turísticas tienen formulario específico.',
      ),
      evidenceIds: ['annex', 'hut'],
      translation: 'es',
    },
    {
      id: 'public-domain',
      text: text(
        'La comunicació d’activitat no habilita per ocupar el domini públic.',
        'La comunicación de actividad no habilita para ocupar el dominio público.',
      ),
      evidenceIds: ['public-domain'],
      translation: 'es',
    },
  ],
  claims: [],
  steps: [
    {
      id: 'check-prerequisites',
      text: text(
        'Abans de comunicar, comprova la compatibilitat urbanística del local i resol la llicència o comunicació d’obres si correspon.',
        'Antes de comunicar, comprueba la compatibilidad urbanística del local y resuelve la licencia o comunicación de obras si procede.',
      ),
      evidenceIds: ['urbanism', 'works'],
      translation: 'es',
      dependsOn: [],
    },
    {
      id: 'prepare-certificate',
      text: text(
        'Disposa del certificat signat per tècnic competent, dels títols sectorials necessaris i del justificant de la taxa municipal.',
        'Dispón del certificado firmado por técnico competente, de los títulos sectoriales necesarios y del justificante de la tasa municipal.',
      ),
      evidenceIds: ['certificate', 'signature', 'sector', 'fee'],
      translation: 'es',
      dependsOn: ['check-prerequisites'],
    },
    {
      id: 'communicate-before-opening',
      text: text(
        'Un cop acabades les obres i les intervencions sectorials favorables, presenta la comunicació municipal abans d’iniciar l’activitat.',
        'Terminadas las obras y las intervenciones sectoriales favorables, presenta la comunicación municipal antes de iniciar la actividad.',
      ),
      evidenceIds: ['timing', 'intervention', 'authority'],
      translation: 'es',
      dependsOn: ['prepare-certificate'],
    },
  ],
});

export const gironaMunicipalCoverage = {
  guideId: gironaMunicipalGuide.id,
  status: 'partial' as const,
  questions: [
    text('El local és a Girona?', '¿El local está en Girona?'),
    text(
      'Quina activitat i superfície construïda té?',
      '¿Qué actividad y superficie construida tiene?',
    ),
    text(
      'Quin ús previ, obres, instal·lacions i títols sectorials hi ha?',
      '¿Qué uso previo, obras, instalaciones y títulos sectoriales hay?',
    ),
  ],
  gaps: [
    text(
      'Cal confirmar l’annex vigent, la compatibilitat urbanística i els requisits del local concret. La fitxa de 2023 i la ruta «es» parcialment catalana no acrediten la situació individual de 2026.',
      'Hay que confirmar el anexo vigente, la compatibilidad urbanística y los requisitos del local concreto. La ficha de 2023 y la ruta «es» parcialmente catalana no acreditan la situación individual de 2026.',
    ),
  ],
};
