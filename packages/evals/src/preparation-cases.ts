import {
  preparationGuides,
  preparationSources,
} from '@reforma-digital/government/preparation-guides';
import { catalunyaDatasetSchema, type CatalunyaDataset } from './catalunya';

// Expectations reference separately observed public excerpts, never a generated step.
// These are controlled regression cases; the official runner must re-acquire and approve them.
const scenarios = [
  {
    id: 'prepare-activity',
    source: preparationSources.search,
    fact: 'resp',
    ca: 'Què condiciona el resultat de la Cerca guiada?',
    es: '¿Qué condiciona el resultado de la Cerca guiada?',
    negativeCa:
      'Quina llicència exacta necessita el meu local sense indicar activitat ni municipi?',
    negativeEs: '¿Qué licencia exacta necesita mi local sin indicar actividad ni municipio?',
  },
  {
    id: 'individual-pathway',
    source: preparationSources.individual,
    fact: 'documentacio',
    ca: 'Què cal preparar abans de la via d’alta individual?',
    es: '¿Qué hay que preparar antes de la vía de alta individual?',
    negativeCa:
      'Quina mutualitat alternativa concreta puc triar sense indicar professió ni col·legi?',
    negativeEs:
      '¿Qué mutualidad alternativa concreta puedo elegir sin indicar profesión ni colegio?',
  },
  {
    id: 'limited-company',
    source: preparationSources.capital,
    also: [preparationSources.company],
    fact: 'un euro',
    ca: 'Quin límit inferior descriu la LSC per al capital d’una SL?',
    es: '¿Qué límite inferior describe la LSC para el capital de una SL?',
    negativeCa: 'Quin capital concret em convé per a la SL sense conèixer aportacions ni socis?',
    negativeEs: '¿Qué capital concreto me conviene para la SL sin conocer aportaciones ni socios?',
  },
  {
    id: 'societario-role',
    source: preparationSources.companyWork,
    fact: 'control',
    ca: 'Quin control considera l’article 305 per als serveis d’un soci?',
    es: '¿Qué control considera el artículo 305 para los servicios de un socio?',
    negativeCa: 'Quin règim em correspon com a soci sense conèixer serveis ni control efectiu?',
    negativeEs: '¿Qué régimen me corresponde como socio sin conocer servicios ni control efectivo?',
  },
  {
    id: 'family-collaborator',
    source: preparationSources.family,
    fact: 'par',
    ca: 'Quina relació considera la branca familiar de l’article 305?',
    es: '¿Qué relación considera la rama familiar del artículo 305?',
    negativeCa:
      'Quina fiscalitat exacta correspon al familiar col·laborador sense saber la seva relació laboral?',
    negativeEs:
      '¿Qué fiscalidad exacta corresponde al familiar colaborador sin conocer su relación laboral?',
  },
  {
    id: 'alternative-mutuality',
    source: preparationSources.mutuality,
    fact: 'mutuali',
    ca: 'Quin sistema descriu la disposició addicional 18, condicionat al seu supòsit?',
    es: '¿Qué sistema describe la disposición adicional 18, condicionado a su supuesto?',
    negativeCa:
      'Puc optar a la mutualitat de la meva professió sense indicar col·legi, alta prèvia ni mutualitat?',
    negativeEs:
      '¿Puedo optar a la mutualidad de mi profesión sin indicar colegio, alta previa ni mutualidad?',
  },
  {
    id: 'regulated-profession',
    source: preparationSources.profession,
    fact: 'condicion',
    ca: 'Què cal comprovar a més del títol per exercir una professió titulada?',
    es: '¿Qué hay que comprobar además del título para ejercer una profesión titulada?',
    negativeCa:
      'Estic habilitat per exercir aquesta professió sense indicar títol, país ni professió?',
    negativeEs:
      '¿Estoy habilitado para ejercer esta profesión sin indicar título, país ni profesión?',
  },
  {
    id: 'professional-company',
    source: preparationSources.professionalCompany,
    also: [preparationSources.professionalRegister],
    fact: 'prof',
    ca: 'Quina forma descriu la llei per a l’exercici professional en comú?',
    es: '¿Qué forma describe la ley para el ejercicio profesional en común?',
    negativeCa:
      'La meva societat ha d’inscriure’s com a professional sense conèixer l’objecte i la forma d’exercici?',
    negativeEs:
      '¿Debe mi sociedad inscribirse como profesional sin conocer el objeto y la forma de ejercicio?',
  },
  {
    id: 'trade',
    source: preparationSources.trade,
    also: [preparationSources.tradeContract],
    fact: 'simult',
    ca: 'Les condicions TRADE de l’article 11 són alternatives o simultànies?',
    es: '¿Las condiciones TRADE del artículo 11 son alternativas o simultáneas?',
    negativeCa: 'Soc TRADE sense conèixer totes les condicions de la relació amb el client?',
    negativeEs: '¿Soy TRADE sin conocer todas las condiciones de la relación con el cliente?',
  },
  {
    id: 'digital-identity',
    source: preparationSources.identity,
    fact: 'identi',
    ca: 'Què ha de verificar l’Administració en la identificació?',
    es: '¿Qué debe verificar la Administración en la identificación?',
    negativeCa: 'Puc usar idCAT Mòbil en el meu tràmit sense indicar organisme ni actuació?',
    negativeEs: '¿Puedo usar idCAT Mòbil en mi trámite sin indicar organismo ni actuación?',
  },
  {
    id: 'representation',
    source: preparationSources.representation,
    fact: 'representac',
    ca: 'Què cal acreditar per actuar en una sol·licitud per una altra persona?',
    es: '¿Qué hay que acreditar para actuar en una solicitud por otra persona?',
    negativeCa:
      'El meu poder concret serveix per representar una altra persona sense indicar acte ni organisme?',
    negativeEs:
      '¿Sirve mi poder concreto para representar a otra persona sin indicar acto ni organismo?',
  },
  {
    id: 'signature',
    source: preparationSources.signature,
    also: [preparationSources.signatureUse],
    fact: 'integr',
    ca: 'Quina propietat del document ha de garantir la firma?',
    es: '¿Qué propiedad del documento debe garantizar la firma?',
    negativeCa: 'He de firmar el meu tràmit concret sense indicar quin acte presento?',
    negativeEs: '¿Debo firmar mi trámite concreto sin indicar qué acto presento?',
  },
  {
    id: 'electronic-channel',
    source: preparationSources.electronic,
    fact: 'person',
    ca: 'Quin subjecte identifica l’article 14 entre els obligats?',
    es: '¿Qué sujeto identifica el artículo 14 entre los obligados?',
    negativeCa:
      'Quin canal és obligatori per al meu tràmit sense indicar organisme, professió ni forma jurídica?',
    negativeEs:
      '¿Qué canal es obligatorio para mi trámite sin indicar organismo, profesión ni forma jurídica?',
  },
  {
    id: 'notifications',
    source: preparationSources.notification,
    also: [preparationSources.notice],
    fact: 'acces',
    ca: 'Quina actuació sobre el contingut té efectes de notificació?',
    es: '¿Qué actuación sobre el contenido tiene efectos de notificación?',
    negativeCa: 'Quan venç el meu recurs si només tinc un avís SMS sense l’acte notificat?',
    negativeEs: '¿Cuándo vence mi recurso si solo tengo un aviso SMS sin el acto notificado?',
  },
];

export const preparationDataset: CatalunyaDataset = catalunyaDatasetSchema.parse({
  version: 'preparation-v1',
  stage: 'controlled',
  description:
    'Regresiones de D-01/D-02/D-16 basadas en extractos públicos; no certifican publicación ni interpretaciones individuales.',
  cases: [
    ...scenarios.flatMap((scenario) => {
      const guide = preparationGuides.find((item) => item.id === scenario.id);
      if (!guide || !scenario.source.sourceUpdatedAt)
        throw new Error('Missing guide or source version');
      return guide.profiles.flatMap((profile) =>
        (['ca', 'es'] as const).flatMap((language) =>
          [true, false].map((shouldAnswer) => ({
            id: `${scenario.id}-${profile}-${language}-${shouldAnswer ? 'answer' : 'abstain'}`,
            query: shouldAnswer
              ? scenario[language]
              : language === 'ca'
                ? scenario.negativeCa
                : scenario.negativeEs,
            domain: guide.domain,
            subtopic: guide.subtopic,
            profile,
            language,
            city: null,
            year: 2026,
            critical: scenario.id === 'notifications' && !shouldAnswer ? 'deadline' : 'obligation',
            sources: shouldAnswer
              ? [scenario.source, ...(scenario.also ?? [])].map((source) => ({
                  sourceId: source.sourceId,
                  documentId: source.id,
                  version: source.version,
                  url: source.url,
                  jurisdiction: source.jurisdiction,
                  consultedAt: '2026-10-04',
                  excerpt: source.quote,
                }))
              : [],
            expected: {
              shouldAnswer,
              jurisdiction: 'ES-CT',
              requiredFacts: shouldAnswer ? [scenario.fact] : [],
              forbiddenFacts: [],
            },
          })),
        ),
      );
    }),
    ...(['Barcelona', 'Girona', 'Lleida', 'Tarragona'] as const).flatMap((city) =>
      (['ca', 'es'] as const).map((language) => ({
        id: `digital-identity-${city.toLowerCase()}-${language}-unknown-procedure`,
        query:
          language === 'ca'
            ? `Quin mètode de firma admet el meu tràmit de ${city} sense indicar-ne el nom?`
            : `¿Qué método de firma admite mi trámite de ${city} sin indicar su nombre?`,
        domain: 'D-16',
        subtopic: 'digital-identity',
        profile: 'individual',
        language,
        city,
        year: 2026,
        critical: 'jurisdiction',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: `ES-CT-${city.toUpperCase()}`,
          requiredFacts: [],
          forbiddenFacts: [],
        },
      })),
    ),
  ],
});

export const preparationCases = preparationDataset.cases;
