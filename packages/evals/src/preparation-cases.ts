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
    fact: 'respostes',
    ca: 'Què condiciona el resultat de la Cerca guiada?',
    es: '¿Qué condiciona el resultado de la Cerca guiada?',
    negativeCa: 'La Cerca guiada acredita la llicència per a qualsevol local?',
    negativeEs: '¿La Cerca guiada acredita la licencia para cualquier local?',
  },
  {
    id: 'individual-pathway',
    source: preparationSources.individual,
    fact: 'documentació',
    ca: 'Què cal preparar abans de la via d’alta individual?',
    es: '¿Qué hay que preparar antes de la vía de alta individual?',
    negativeCa: 'La via OGE resol una alta per mutualitat alternativa?',
    negativeEs: '¿La vía OGE resuelve un alta por mutualidad alternativa?',
  },
  {
    id: 'limited-company',
    source: preparationSources.capital,
    also: [preparationSources.company],
    fact: 'un euro',
    ca: 'Quin límit inferior descriu la LSC per al capital d’una SL?',
    es: '¿Qué límite inferior describe la LSC para el capital de una SL?',
    negativeCa: 'Un capital d’1 € elimina totes les regles addicionals de la SL?',
    negativeEs: '¿Un capital de 1 € elimina todas las reglas adicionales de la SL?',
  },
  {
    id: 'societario-role',
    source: preparationSources.companyWork,
    fact: 'control efectivo',
    ca: 'Quin control considera l’article 305 per als serveis d’un soci?',
    es: '¿Qué control considera el artículo 305 para los servicios de un socio?',
    negativeCa: 'Ser soci sense conèixer serveis ni control determina RETA?',
    negativeEs: '¿Ser socio sin conocer servicios ni control determina RETA?',
  },
  {
    id: 'family-collaborator',
    source: preparationSources.family,
    fact: 'parientes',
    ca: 'Quina relació considera la branca familiar de l’article 305?',
    es: '¿Qué relación considera la rama familiar del artículo 305?',
    negativeCa: 'El parentiu sol acredita una exempció fiscal del col·laborador?',
    negativeEs: '¿El parentesco solo acredita una exención fiscal del colaborador?',
  },
  {
    id: 'alternative-mutuality',
    source: preparationSources.mutuality,
    fact: 'mutualidad',
    ca: 'Quin sistema descriu la disposició addicional 18, condicionat al seu supòsit?',
    es: '¿Qué sistema describe la disposición adicional 18, condicionado a su supuesto?',
    negativeCa: 'Puc executar ara una transferència automàtica de mutualitat?',
    negativeEs: '¿Puedo ejecutar ahora una transferencia automática de mutualidad?',
  },
  {
    id: 'regulated-profession',
    source: preparationSources.profession,
    fact: 'condiciones habilitantes',
    ca: 'Què cal comprovar a més del títol per exercir una professió titulada?',
    es: '¿Qué hay que comprobar además del título para ejercer una profesión titulada?',
    negativeCa: 'El directori professional acredita la meva habilitació i permís de treball?',
    negativeEs: '¿El directorio profesional acredita mi habilitación y permiso de trabajo?',
  },
  {
    id: 'professional-company',
    source: preparationSources.professionalCompany,
    also: [preparationSources.professionalRegister],
    fact: 'sociedades profesionales',
    ca: 'Quina forma descriu la llei per a l’exercici professional en comú?',
    es: '¿Qué forma describe la ley para el ejercicio profesional en común?',
    negativeCa: 'Qualsevol societat d’intermediació és automàticament professional?',
    negativeEs: '¿Cualquier sociedad de intermediación es automáticamente profesional?',
  },
  {
    id: 'trade',
    source: preparationSources.trade,
    also: [preparationSources.tradeContract],
    fact: 'simultáneamente',
    ca: 'Les condicions TRADE de l’article 11 són alternatives o simultànies?',
    es: '¿Las condiciones TRADE del artículo 11 son alternativas o simultáneas?',
    negativeCa: 'Tenir el 75 % dels ingressos d’un client basta per acreditar TRADE?',
    negativeEs: '¿Tener el 75 % de ingresos de un cliente basta para acreditar TRADE?',
  },
  {
    id: 'digital-identity',
    source: preparationSources.identity,
    fact: 'identidad',
    ca: 'Què ha de verificar l’Administració en la identificació?',
    es: '¿Qué debe verificar la Administración en la identificación?',
    negativeCa: 'idCAT Mòbil permet qualsevol firma en totes les administracions?',
    negativeEs: '¿idCAT Mòbil permite cualquier firma en todas las administraciones?',
  },
  {
    id: 'representation',
    source: preparationSources.representation,
    fact: 'representación',
    ca: 'Què cal acreditar per actuar en una sol·licitud per una altra persona?',
    es: '¿Qué hay que acreditar para actuar en una solicitud por otra persona?',
    negativeCa: 'El meu poder AEAT serveix universalment a tots els ajuntaments?',
    negativeEs: '¿Mi poder AEAT sirve universalmente en todos los ayuntamientos?',
  },
  {
    id: 'signature',
    source: preparationSources.signature,
    also: [preparationSources.signatureUse],
    fact: 'integridad',
    ca: 'Quina propietat del document ha de garantir la firma?',
    es: '¿Qué propiedad del documento debe garantizar la firma?',
    negativeCa: 'Identificar-me sempre substitueix firmar una sol·licitud?',
    negativeEs: '¿Identificarme siempre sustituye firmar una solicitud?',
  },
  {
    id: 'electronic-channel',
    source: preparationSources.electronic,
    fact: 'personas jurídicas',
    ca: 'Quin subjecte identifica l’article 14 entre els obligats?',
    es: '¿Qué sujeto identifica el artículo 14 entre los obligados?',
    negativeCa: 'Tots els autònoms poden escollir lliurement qualsevol canal?',
    negativeEs: '¿Todos los autónomos pueden elegir libremente cualquier canal?',
  },
  {
    id: 'notifications',
    source: preparationSources.notification,
    also: [preparationSources.notice],
    fact: 'acceso',
    ca: 'Quina actuació sobre el contingut té efectes de notificació?',
    es: '¿Qué actuación sobre el contenido tiene efectos de notificación?',
    negativeCa: 'Pots calcular el recurs només amb la data del SMS?',
    negativeEs: '¿Puedes calcular el recurso solo con la fecha del SMS?',
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
            critical: 'obligation',
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
            ? `Puc firmar amb idCAT qualsevol tràmit de ${city} sense consultar la fitxa?`
            : `¿Puedo firmar con idCAT cualquier trámite de ${city} sin consultar la ficha?`,
        domain: 'D-16',
        subtopic: 'digital-identity',
        profile: 'individual',
        language,
        city,
        year: 2026,
        critical: 'obligation',
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
