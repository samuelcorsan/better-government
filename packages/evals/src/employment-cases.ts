import { employmentGuides, employmentSources } from '@reforma-digital/government/employment-guides';
import { catalunyaDatasetSchema } from './catalunya';

// Controlled excerpts and expectations only; T-004 must independently re-acquire official sources.
const scenarios = [
  {
    id: 'employer-registration',
    source: employmentSources.registration,
    fact: 'inscrip',
    ca: 'Quan es demana la primera inscripció empresarial si contracto personal?',
    es: '¿Cuándo se solicita la primera inscripción empresarial si contrato personal?',
    negativeCa: 'Si treballa un familiar al meu negoci, quin règim i alta concrets li corresponen?',
    negativeEs:
      'Si trabaja un familiar en mi negocio, ¿qué régimen y alta concretos le corresponden?',
  },
  {
    id: 'employment-contract',
    source: employmentSources.contract,
    fact: 'comunic',
    ca: 'Quin termini general indica l’Estatut per comunicar un contracte laboral?',
    es: '¿Qué plazo general indica el Estatuto para comunicar un contrato laboral?',
    negativeCa:
      'Una persona em presta serveis de tant en tant: és relació laboral i quin contracte he de comunicar?',
    negativeEs:
      'Una persona me presta servicios ocasionalmente: ¿es relación laboral y qué contrato debo comunicar?',
  },
  {
    id: 'employee-contributions',
    source: employmentSources.contributions,
    fact: 'mensual',
    ca: 'Com es liquiden ordinàriament les quotes de la plantilla?',
    es: '¿Cómo se liquidan ordinariamente las cuotas de la plantilla?',
    negativeCa: 'Quina base, tipus i quota exacta he de liquidar per la meva plantilla aquest mes?',
    negativeEs: '¿Qué base, tipo y cuota exacta debo liquidar por mi plantilla este mes?',
  },
  {
    id: 'work-centre-opening',
    source: employmentSources.centre,
    fact: 'comunic',
    ca: 'Quina finestra indica la fitxa general de comunicació d’obertura de centre?',
    es: '¿Qué ventana indica la ficha general de comunicación de apertura de centro?',
    negativeCa:
      'El meu local concret necessita la modalitat d’obra de construcció o de centre ordinari?',
    negativeEs:
      '¿Mi local concreto necesita la modalidad de obra de construcción o de centro ordinario?',
  },
  {
    id: 'collective-agreement',
    source: employmentSources.agreement,
    fact: 'conveni',
    ca: 'El cercador de textos determina per si sol el conveni aplicable?',
    es: '¿El buscador de textos determina por sí solo el convenio aplicable?',
    negativeCa: 'Quin conveni concret s’aplica a la meva empresa i a aquest centre?',
    negativeEs: '¿Qué convenio concreto se aplica a mi empresa y a este centro?',
  },
  {
    id: 'employer-prevention',
    source: employmentSources.prevention,
    fact: 'prevent',
    ca: 'Quins instruments bàsics exigeix la gestió preventiva amb plantilla?',
    es: '¿Qué instrumentos básicos exige la gestión preventiva con plantilla?',
    negativeCa: 'Quin servei preventiu exacte he de contractar per aquest lloc i aquests riscos?',
    negativeEs: '¿Qué servicio preventivo exacto debo contratar para este puesto y estos riesgos?',
  },
  {
    id: 'self-employed-coordination',
    source: employmentSources.cooperation,
    fact: 'coordin',
    ca: 'La coordinació en un centre compartit pot afectar un autònom sense plantilla?',
    es: '¿La coordinación en un centro compartido puede afectar a un autónomo sin plantilla?',
    negativeCa: 'Quines instruccions específiques m’ha de donar el titular d’aquest centre?',
    negativeEs: '¿Qué instrucciones específicas debe darme el titular de este centro?',
  },
  {
    id: 'self-employed-own-risk',
    source: employmentSources.independent,
    fact: 'alariad',
    extraFact: 'concurr',
    ca: 'Quines dues condicions descriu l’INSST per al treball propi sense plantilla ni concurrència?',
    es: '¿Qué dos condiciones describe el INSST para el trabajo propio sin plantilla ni concurrencia?',
    negativeCa: 'Quines obligacions preventives sectorials concretes té la meva activitat?',
    negativeEs: '¿Qué obligaciones preventivas sectoriales concretas tiene mi actividad?',
  },
] as const;

export const employmentDataset = catalunyaDatasetSchema.parse({
  version: 'employment-controlled-v1',
  stage: 'controlled',
  description:
    'Casos D-09/D-10 de extractos públicos; no acreditan publicación ni pantallas autenticadas.',
  cases: scenarios.flatMap((scenario) => {
    const guide = employmentGuides.find((item) => item.id === scenario.id);
    if (!guide) throw new Error(`Missing employment guide ${scenario.id}`);
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
            ? [
                {
                  sourceId: scenario.source.sourceId,
                  documentId: scenario.source.id,
                  version: scenario.source.version,
                  url: scenario.source.url,
                  jurisdiction: scenario.source.jurisdiction,
                  consultedAt: '2026-10-04',
                  excerpt: scenario.source.quote,
                },
              ]
            : [],
          expected: {
            shouldAnswer,
            jurisdiction: 'ES-CT',
            requiredFacts: shouldAnswer
              ? [scenario.fact, ...('extraFact' in scenario ? [scenario.extraFact] : [])]
              : [],
            forbiddenFacts: [],
          },
        })),
      ),
    );
  }),
});

export const employmentCases = employmentDataset.cases;
