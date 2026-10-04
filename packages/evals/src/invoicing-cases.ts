import { invoicingGuides, invoicingQuestions } from '@reforma-digital/government/invoicing-guides';
import { catalunyaCaseSchema, type CatalunyaCase } from './catalunya';

const requiredFact: Record<string, { ca: string; es: string }> = {
  'invoice-obligation': { ca: 'empresar', es: 'empresario' },
  'invoice-exceptions': { ca: 'empresar', es: 'empresario' },
  'invoice-simplified': { ca: '400', es: '400' },
  'invoice-simplified-sector': { ca: '3.000', es: '3.000' },
  'irpf-professional-books': { ca: 'provisio', es: 'provisio' },
  'vat-books': { ca: 'factur', es: 'factur' },
  'vat-entry-deadlines': { ca: 'liquidacio', es: 'liquidacio' },
  'invoice-retention': { ca: '4', es: '4' },
  'investment-invoice-retention': { ca: 'quatre anys', es: 'cuatro años' },
  'tax-calendar-2026': { ca: '2026', es: '2026' },
  'irpf-mercantile-books': { ca: 'Codi de Comerç', es: 'Código de Comercio' },
  'irpf-business-registers': { ca: 'ingres', es: 'ingres' },
  'irpf-modules-books': { ca: 'inversio', es: 'inversio' },
  'invoice-issuance-deadline': { ca: '16', es: '16' },
  'invoice-consumer-deadline': { ca: 'operacio', es: 'operacio' },
  'invoice-required-fields': { ca: 'serie', es: 'serie' },
  'mercantile-record-retention': { ca: 'sis anys', es: 'seis años' },
  'sif-verifactu': { ca: '2027', es: '2027' },
  'sif-manual-exception': { ca: 'manual', es: 'manual' },
  'sif-sii-exception': { ca: 'SII', es: 'SII' },
  'b2b-electronic-invoice': { ca: 'vint-i-quatre mesos', es: 'Veinticuatro meses' },
  'b2b-large-electronic-invoice': { ca: 'dotze mesos', es: 'Doce meses' },
  'b2g-efact': { ca: 'e-FACT', es: 'e-FACT' },
};

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
          requiredFacts: [requiredFact[guide.id]?.[language] ?? ''],
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
