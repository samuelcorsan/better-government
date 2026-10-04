import { describe, expect, it } from 'vitest';
import { tarragonaMunicipalGuide, tarragonaMunicipalUrls } from './tarragona-municipal-guide';

describe('Tarragona municipal route', () => {
  it('keeps the Annex III case local, conditional and pending', () => {
    expect(tarragonaMunicipalGuide.jurisdiction).toBe('ES-CT-TARRAGONA');
    expect(tarragonaMunicipalGuide.validation.status).toBe('pending');
    expect(tarragonaMunicipalGuide.conditions[0]?.text.ca).toContain('Annex III');
    expect(tarragonaMunicipalGuide.profiles).toEqual(['with-premises']);
    expect(tarragonaMunicipalUrls.ca).toContain('lang=CA');
    expect(tarragonaMunicipalUrls.es).toContain('lang=ES');
    expect(
      tarragonaMunicipalGuide.evidence.every((item) => item.url === tarragonaMunicipalUrls.ca),
    ).toBe(true);
    expect(tarragonaMunicipalGuide.steps.at(-1)?.evidenceIds).toContain('authority');
  });
});
