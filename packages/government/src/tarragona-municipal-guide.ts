import { guideSchema, type Guide } from '@reforma-digital/core';

const consultedAt = '2026-10-04';
const jurisdiction = 'ES-CT-TARRAGONA';
const text = (ca: string, es: string) => ({ ca, es });

/** The `lang=ES` shell still renders the procedure body in Catalan on the observed page. */
export const tarragonaMunicipalUrls = {
  ca: 'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&DETALLE=6269000003495161199500&PAGE_CODE=CATALOGO&lang=CA',
  es: 'https://seu.tarragona.cat/sta/CarpetaPublic/doEvent?APP_CODE=STA&DETALLE=6269000003495161199500&PAGE_CODE=CATALOGO&lang=ES',
};

const evidence = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'tarragona-tramits',
  url: tarragonaMunicipalUrls.ca,
  originalUrl: tarragonaMunicipalUrls.ca,
  version: 'observed-2026-10-04',
  language: 'ca',
  attribution: 'Ajuntament de Tarragona; adaptació i traducció pròpies, sense aval municipal',
  sourceUpdatedAt: null,
  // Observation of a public page, not the date when this legal regime took effect.
  applicableFrom: consultedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction,
  quote,
});

/** One Annex III route, conditional on classification; no authenticated form was verified. */
export const tarragonaMunicipalGuide: Guide = guideSchema.parse({
  id: 'tarragona-annex-iii-premises',
  revision: 1,
  title: text(
    'Local a Tarragona: comunicació prèvia ambiental (Annex III)',
    'Local en Tarragona: comunicación previa ambiental (Anexo III)',
  ),
  domain: 'D-06',
  subtopic: 'municipal-premises-tarragona',
  profiles: ['with-premises'],
  jurisdiction,
  consultedAt,
  period: { evidenceIds: [] },
  validation: { status: 'pending' },
  evidence: [
    evidence('annex', 'Comunicació prèvia ambiental (Annex III)'),
    evidence('purpose', 'Annex III de la Llei 20/2009'),
    evidence('urbanism', 'Informe urbanístic favorable'),
    evidence('works', 'llicència o presentació de la comunicació prèvia d’obres'),
    evidence('sector', 'certificacions o llicències específiques'),
    evidence('project', 'Projecte tècnic justificatiu'),
    evidence('certificate', 'Certificat tècnic acreditatiu'),
    evidence('authority', "Departament d'obertura d'establiments"),
  ],
  conditions: [
    {
      id: 'tarragona-annex-iii',
      text: text(
        'El local és a Tarragona i l’activitat consta efectivament a l’Annex III de la Llei 20/2009.',
        'El local está en Tarragona y la actividad consta efectivamente en el Anexo III de la Ley 20/2009.',
      ),
      evidenceIds: ['annex', 'purpose', 'authority'],
      translation: 'es',
    },
  ],
  exclusions: [
    {
      id: 'other-regime-or-town',
      text: text(
        'La fitxa no classifica un local concret ni determina una llicència per a una altra activitat o municipi.',
        'La ficha no clasifica un local concreto ni determina una licencia para otra actividad o municipio.',
      ),
      evidenceIds: ['annex', 'authority'],
      translation: 'es',
    },
  ],
  claims: [],
  steps: [
    {
      id: 'classify-activity',
      text: text(
        'Comprova que l’activitat està a l’Annex III i si el local necessita informe urbanístic abans de seleccionar aquesta comunicació.',
        'Comprueba que la actividad está en el Anexo III y si el local necesita informe urbanístico antes de elegir esta comunicación.',
      ),
      evidenceIds: ['purpose', 'urbanism'],
      translation: 'es',
      dependsOn: [],
    },
    {
      id: 'resolve-prerequisites',
      text: text(
        'Resol la llicència o comunicació d’obres i els títols sectorials que corresponguin al cas.',
        'Resuelve la licencia o comunicación de obras y los títulos sectoriales que correspondan al caso.',
      ),
      evidenceIds: ['works', 'sector'],
      translation: 'es',
      dependsOn: ['classify-activity'],
    },
    {
      id: 'prepare-and-open',
      text: text(
        'Prepara el projecte i el certificat tècnics, i obre la fitxa original del Departament d’Obertura d’Establiments per verificar tota la documentació i presentar-la.',
        'Prepara el proyecto y certificado técnicos, y abre la ficha original del Departamento de Apertura de Establecimientos para verificar toda la documentación y presentarla.',
      ),
      evidenceIds: ['project', 'certificate', 'authority'],
      translation: 'es',
      dependsOn: ['resolve-prerequisites'],
    },
  ],
});

export const tarragonaMunicipalCoverage = {
  guideId: tarragonaMunicipalGuide.id,
  status: 'partial' as const,
  questions: [
    text(
      'El local és al terme municipal de Tarragona?',
      '¿El local está en el término municipal de Tarragona?',
    ),
    text(
      'L’activitat consta a l’Annex III de la Llei 20/2009?',
      '¿La actividad consta en el Anexo III de la Ley 20/2009?',
    ),
    text(
      'Hi haurà obres, ús nou o autoritzacions sectorials?',
      '¿Habrá obras, nuevo uso o autorizaciones sectoriales?',
    ),
  ],
  gaps: [
    text(
      'Falta comprovar la classificació i els requisits del local concret. La fitxa pública no acredita l’estat del formulari identificat ni la vigència de 2026.',
      'Falta comprobar la clasificación y los requisitos del local concreto. La ficha pública no acredita el estado del formulario identificado ni la vigencia de 2026.',
    ),
  ],
};
