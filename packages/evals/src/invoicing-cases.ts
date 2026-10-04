import { invoicingGuides, invoicingQuestions } from '@reforma-digital/government/invoicing-guides';
import { catalunyaCaseSchema, type CatalunyaCase } from './catalunya';

const requiredFact = new Map([
  ['invoice-obligation', 'profesional'],
  ['invoice-exceptions', 'profesional'],
  ['invoice-simplified', '400'],
  ['invoice-simplified-sector', '3.000'],
  ['irpf-professional-books', 'provisio'],
  ['vat-books', 'factur'],
  ['vat-entry-deadlines', 'liquidacio'],
  ['invoice-retention', '4'],
  ['investment-invoice-retention', 'cuatro anos'],
  ['tax-calendar-2026', '2026'],
  ['irpf-mercantile-books', 'Codigo de Comercio'],
  ['irpf-business-registers', 'ventas e ingresos'],
  ['irpf-modules-books', 'bienes de inversion'],
  ['invoice-issuance-deadline', '16'],
  ['invoice-consumer-deadline', 'momento de realizarse la operacion'],
  ['invoice-required-fields', 'Numero y, en su caso, serie'],
  ['mercantile-record-retention', 'seis anos'],
  ['sif-verifactu', '2027'],
  ['sif-manual-exception', 'manual'],
  ['sif-sii-exception', 'SII'],
  ['b2b-electronic-invoice', 'Veinticuatro meses'],
  ['b2b-large-electronic-invoice', 'Doce meses'],
  ['b2g-efact', 'e-FACT'],
]);

/** Public-source controls, not an evaluated answer from retrieval or a model. */
export const invoicingCases: CatalunyaCase[] = invoicingGuides.flatMap((guide) => {
  const questions = invoicingQuestions.find((item) => item.id === guide.id)!;
  return questions.profiles.flatMap((profile) =>
    (['ca', 'es'] as const).flatMap((language) => [
      catalunyaCaseSchema.parse({
        id: `${guide.id}-${profile}-${language}-answer`,
        query: questions.question[language],
        domain: 'D-08',
        subtopic: guide.subtopic,
        profile,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: guide.evidence.map((evidence) => ({
          sourceId: evidence.sourceId,
          documentId: evidence.id,
          version: evidence.version,
          url: evidence.url,
          jurisdiction: evidence.jurisdiction,
          consultedAt: guide.consultedAt,
          excerpt: evidence.quote,
        })),
        expected: {
          shouldAnswer: true,
          jurisdiction: 'ES-CT',
          requiredFacts: [requiredFact.get(guide.id) ?? ''],
          forbiddenFacts: [],
        },
      }),
      catalunyaCaseSchema.parse({
        id: `${guide.id}-${profile}-${language}-abstain`,
        query: questions.unknown[language],
        domain: 'D-08',
        subtopic: guide.subtopic,
        profile,
        language,
        city: null,
        year: 2026,
        critical: 'obligation',
        sources: [],
        expected: {
          shouldAnswer: false,
          jurisdiction: 'ES-CT',
          requiredFacts: [],
          forbiddenFacts: [],
        },
      }),
    ]),
  );
});

for (const year of [2025, 2027])
  for (const guideId of [
    'tax-calendar-2026',
    'invoice-simplified',
    'invoice-simplified-sector',
    'sif-verifactu',
  ])
    for (const language of ['ca', 'es'] as const)
      invoicingCases.push(
        catalunyaCaseSchema.parse({
          id: `${guideId}-${year}-${language}-abstain`,
          query:
            language === 'ca'
              ? `Quina regla i termini de ${year} aplico sense conèixer règim ni operació?`
              : `¿Qué regla y plazo de ${year} aplico sin conocer régimen ni operación?`,
          domain: 'D-08',
          subtopic: guideId,
          profile: 'unknown-regime',
          language,
          city: null,
          year,
          critical: 'deadline',
          sources: [],
          expected: {
            shouldAnswer: false,
            jurisdiction: 'ES-CT',
            requiredFacts: [],
            forbiddenFacts: ['2026'],
          },
        }),
      );

export const invoicingDataset = {
  version: '2026-10-04-controlled',
  stage: 'controlled' as const,
  description: 'Controles públicos de facturación y libros; sin evaluación de respuestas reales',
  cases: invoicingCases,
};
