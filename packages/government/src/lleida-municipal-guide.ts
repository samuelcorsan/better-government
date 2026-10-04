import { guideSchema, type Guide } from '@reforma-digital/core';

const url =
  'https://tramits.paeria.cat/Ciutadania/DetallTramit.aspx?IdTema=51&IdTramit=2400&IdTema=61';
const consultedAt = '2026-10-04';
const sourceUpdatedAt = '2026-03-19';
const jurisdiction = 'ES-CT-LLEIDA';
const text = (ca: string, es: string) => ({ ca, es });
const evidence = (id: string, quote: string): Guide['evidence'][number] => ({
  id,
  sourceId: 'lleida-tramits',
  url,
  originalUrl: url,
  version: sourceUpdatedAt,
  language: 'ca',
  attribution: 'Ajuntament de Lleida; adaptació pròpia sense aval municipal',
  sourceUpdatedAt,
  // Edition of the public ficha, not legal commencement of the activity regime.
  applicableFrom: sourceUpdatedAt,
  applicableUntil: null,
  informative: true,
  jurisdiction,
  quote,
});

/** Public orientation only: activity classification and authenticated screens remain unresolved. */
export const lleidaMunicipalGuide: Guide = guideSchema.parse({
  id: 'lleida-new-premises',
  revision: 1,
  title: text(
    'Obrir una activitat amb local a Lleida: classificació i tràmit municipal',
    'Abrir una actividad con local en Lleida: clasificación y trámite municipal',
  ),
  domain: 'D-06',
  subtopic: 'municipal-premises-lleida',
  profiles: ['with-premises'],
  jurisdiction,
  consultedAt,
  period: { evidenceIds: [] },
  validation: { status: 'pending' },
  evidence: [
    evidence(
      'scope',
      "Tràmits per a l'obertura, modificació i control posterior de les activitats",
    ),
    evidence('classification', "Classificació d'activitats i procediments associats"),
    evidence('certificate', "Comunicació d'inici o modificació amb certificat"),
    evidence('project', "Comunicació d'inici o modificació amb projecte i certificat"),
    evidence('licence', "Sol·licitud de llicència ambiental d'inici"),
    evidence('waste', 'En el supòsit de noves obertures'),
    evidence('office', 'Indústria i Activitats'),
  ],
  conditions: [
    {
      id: 'new-local',
      text: text(
        'Es tracta d’una nova obertura amb local al municipi de Lleida.',
        'Se trata de una nueva apertura con local en el municipio de Lleida.',
      ),
      evidenceIds: ['scope', 'waste', 'office'],
      translation: 'es',
    },
  ],
  exclusions: [
    {
      id: 'unclassified',
      text: text(
        'La fitxa general no permet triar una comunicació o llicència sense classificar l’activitat i el local; tampoc s’aplica a un altre municipi.',
        'La ficha general no permite escoger comunicación o licencia sin clasificar la actividad y el local; tampoco se aplica a otro municipio.',
      ),
      evidenceIds: ['scope', 'classification', 'office'],
      translation: 'es',
    },
  ],
  claims: [],
  steps: [
    {
      id: 'classify',
      text: text(
        'Obre la fitxa municipal i comprova la classificació de l’activitat i del local abans de triar un procediment.',
        'Abre la ficha municipal y comprueba la clasificación de la actividad y del local antes de elegir un procedimiento.',
      ),
      evidenceIds: ['scope', 'classification'],
      translation: 'es',
      dependsOn: [],
    },
    {
      id: 'select',
      text: text(
        'Segueix només el procediment que resulti de la classificació; la fitxa distingeix comunicacions amb certificat o projecte i llicències ambientals.',
        'Sigue sólo el procedimiento que resulte de la clasificación; la ficha distingue comunicaciones con certificado o proyecto y licencias ambientales.',
      ),
      evidenceIds: ['classification', 'certificate', 'project', 'licence'],
      translation: 'es',
      dependsOn: ['classify'],
    },
    {
      id: 'waste-declaration',
      text: text(
        'Per a una nova obertura, comprova i prepara el formulari municipal de declaració de residus indicat a la fitxa.',
        'Para una nueva apertura, comprueba y prepara el formulario municipal de declaración de residuos indicado en la ficha.',
      ),
      evidenceIds: ['waste'],
      translation: 'es',
      dependsOn: ['select'],
    },
  ],
});

export const lleidaMunicipalCoverage = {
  guideId: lleidaMunicipalGuide.id,
  status: 'partial' as const,
  questions: [
    text('El local és a Lleida?', '¿El local está en Lleida?'),
    text(
      'Quina activitat, superfície i característiques té el local?',
      '¿Qué actividad, superficie y características tiene el local?',
    ),
  ],
  gaps: [
    text(
      'No s’ha comprovat la classificació d’una activitat concreta, la llicència o comunicació corresponent ni la pantalla autenticada.',
      'No se ha comprobado la clasificación de una actividad concreta, la licencia o comunicación correspondiente ni la pantalla autenticada.',
    ),
  ],
};
