import { tarragonaMunicipalGuide } from '@reforma-digital/government/tarragona-municipal-guide';
import { catalunyaDatasetSchema } from './catalunya';

/** Only abstentions are scorable until the municipal page has a verified source version. */
export const tarragonaMunicipalDataset = catalunyaDatasetSchema.parse({
  version: 'tarragona-municipal-v1',
  stage: 'controlled',
  description:
    'Abstenciones por clasificación y municipio sin atribuir fecha de versión a la sede.',
  cases: (['ca', 'es'] as const).flatMap((language) => {
    return [
      {
        id: `tarragona-annex-iii-${language}-unclassified`,
        query:
          language === 'ca'
            ? 'Quina comunicació municipal concreta correspon al meu local de Tarragona si encara no he identificat l’activitat ni comprovat si consta a l’Annex III?'
            : '¿Qué comunicación municipal concreta corresponde a mi local de Tarragona si aún no he identificado la actividad ni comprobado si figura en el Anexo III?',
        domain: 'D-06',
        subtopic: tarragonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Tarragona',
        year: 2026,
        critical: 'obligation',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-TARRAGONA',
          requiredFacts: [],
          forbiddenFacts: [],
        },
      },
      {
        id: `lleida-premises-${language}-unclassified`,
        query:
          language === 'ca'
            ? 'Quin tràmit municipal exacte he de presentar per obrir un local a Lleida si no he identificat l’activitat ni les condicions del local?'
            : '¿Qué trámite municipal exacto debo presentar para abrir un local en Lleida si no he identificado la actividad ni las condiciones del local?',
        domain: 'D-06',
        subtopic: tarragonaMunicipalGuide.subtopic,
        profile: 'with-premises',
        language,
        city: 'Lleida',
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT-LLEIDA',
          requiredFacts: [],
          forbiddenFacts: [],
        },
      },
    ];
  }),
});

export const tarragonaMunicipalCases = tarragonaMunicipalDataset.cases;
