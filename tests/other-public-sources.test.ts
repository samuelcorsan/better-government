import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  extractOtherPublicSource,
  otherPublicSources,
  type OtherPublicResponse,
} from '../packages/government/src/other-public-sources';

// Synthetic content only. Official identities/URLs describe the channel, not verified legal rules.
const [manual, call] = otherPublicSources;
const html = `<!doctype html><html lang="es"><main id="acc-main"><h1>Presentación</h1>
<p>Manual sintético del ejercicio 2025. Texto inventado para probar el canal.</p>
<script>syntheticUnwantedScript</script><nav>syntheticUnwantedNavigation</nav></main></html>`;
const payload = {
  codigoBDNS: '845745',
  organo: { nivel1: 'AUTONOMICA', nivel2: 'CATALUÑA', nivel3: "DEPARTAMENT D'EMPRESA I TREBALL" },
  regiones: [{ descripcion: 'ES51 - CATALUÑA' }],
  descripcion: 'Convocatoria sintética: ninguna obligación ni ayuda real.',
  advertencia: 'Aviso sintético de reutilización para conservar sin modificar.',
  abierto: false,
  fechaRecepcion: '2025-01-02',
  fechaInicioSolicitud: '2025-02-01',
  fechaFinSolicitud: '2025-09-16',
  textInicio: null,
  textFin: null,
  documentos: [{ id: 1, datPublicacion: '2025-01-03', datMod: '2025-01-04' }],
};

function manualResponse(content = html): OtherPublicResponse {
  return {
    status: 200,
    finalUrl: manual.url,
    contentType: 'text/html; charset=utf-8',
    consultedAt: '2026-03-01',
    targetExercise: 2025,
    document: new JSDOM(content, { url: manual.url }).window.document,
  };
}

function callResponse(json: unknown = payload): OtherPublicResponse {
  return {
    status: 200,
    finalUrl: call.url,
    contentType: 'application/json',
    consultedAt: '2025-06-01',
    targetExercise: 2025,
    json,
  };
}

describe('lector acotado de otras fuentes públicas', () => {
  it('lee HTML sin mutar el documento y conserva identidad, idioma, ejercicio y fechas separadas', () => {
    const response = manualResponse();
    const result = extractOtherPublicSource(manual.id, response);
    expect(result.status).toBe('acquired');
    if (result.status === 'gap') throw new Error(result.reason);
    expect(result.snapshot.source).toMatchObject({
      sourceId: 'aeat',
      jurisdiction: 'ES',
      language: 'es',
      exercise: 2025,
      documentRole: 'general-guide',
      organization: manual.organization,
    });
    expect(result.snapshot).toMatchObject({
      consultedAt: '2026-03-01',
      updatedAt: null,
      receivedAt: null,
      temporalStatus: 'matches-exercise',
    });
    expect(result.snapshot.text).toContain('Texto inventado');
    expect(result.snapshot.text).not.toContain('syntheticUnwanted');
    expect(response.document?.querySelector('script')).not.toBeNull();
    expect(result.snapshot.source.attribution).toContain('cedido gratuitamente');
  });

  it('lee JSON de convocatoria específica sin convertir el publicador estatal en competencia estatal', () => {
    const result = extractOtherPublicSource(call.id, callResponse());
    expect(result.status).toBe('acquired');
    if (result.status === 'gap') throw new Error(result.reason);
    expect(result.snapshot.source).toMatchObject({
      sourceId: 'bdns',
      jurisdiction: 'ES-CT',
      language: 'es',
      exercise: 2025,
      publisher: 'Intervención General de la Administración del Estado',
      documentRole: 'specific-call',
      organization: call.organization,
    });
    expect(result.snapshot).toMatchObject({
      receivedAt: '2025-01-02',
      updatedAt: null,
      documentDates: [{ id: 1, publishedAt: '2025-01-03', updatedAt: '2025-01-04' }],
      applicationWindow: { from: '2025-02-01', to: '2025-09-16', indefinite: false },
      temporalStatus: 'within-window',
      reuseNotice: payload.advertencia,
    });
  });

  it.each([
    'http://sede.agenciatributaria.gob.es/Sede/ayuda/manuales-videos-folletos/manuales-practicos/irpf-2025/presentacion.html',
    manual.url + '?session=synthetic',
    manual.url + '/extra',
    manual.url.replace(
      'sede.agenciatributaria.gob.es',
      'sede.agenciatributaria.gob.es.example.test',
    ),
    manual.url.replace('https://', 'https://synthetic@'),
    manual.url.replace('presentacion.html', 'private.html'),
  ])('excluye host/ruta/parámetros no aprobados: %s', (finalUrl) => {
    expect(extractOtherPublicSource(manual.id, { ...manualResponse(), finalUrl })).toEqual({
      status: 'gap',
      reason: 'unapproved-url',
    });
  });

  it('rechaza redirecciones, otros registros y canales inesperados', () => {
    expect(extractOtherPublicSource('boe', callResponse())).toEqual({
      status: 'gap',
      reason: 'unapproved-source',
    });
    expect(
      extractOtherPublicSource(call.id, {
        ...callResponse(),
        finalUrl: call.url.replace('845745', '123'),
      }),
    ).toEqual({ status: 'gap', reason: 'unapproved-url' });
    expect(
      extractOtherPublicSource(call.id, { ...callResponse(), contentType: 'text/html' }),
    ).toEqual({ status: 'gap', reason: 'wrong-channel' });
    expect(extractOtherPublicSource(manual.id, { ...manualResponse(), json: payload })).toEqual({
      status: 'gap',
      reason: 'wrong-channel',
    });
    const response = manualResponse();
    response.document = new JSDOM(html, { url: 'https://example.test/private' }).window.document;
    expect(extractOtherPublicSource(manual.id, response)).toEqual({
      status: 'gap',
      reason: 'unapproved-url',
    });
  });

  it('excluye login, acceso bloqueado y errores HTTP sin extraer el contenido', () => {
    expect(
      extractOtherPublicSource(manual.id, manualResponse(html + '<input type="password">')),
    ).toEqual({ status: 'gap', reason: 'login' });
    for (const status of [401, 403])
      expect(extractOtherPublicSource(call.id, { ...callResponse(), status })).toEqual({
        status: 'gap',
        reason: 'login',
      });
    expect(extractOtherPublicSource(call.id, { ...callResponse(), status: 500 })).toEqual({
      status: 'gap',
      reason: 'http-error',
    });
  });

  it('no presenta un manual de otro ejercicio ni una ayuda cerrada como información actual', () => {
    const historical = extractOtherPublicSource(manual.id, {
      ...manualResponse(),
      targetExercise: 2026,
    });
    expect(historical.status).toBe('reference');
    if (historical.status === 'gap') throw new Error(historical.reason);
    expect(historical.snapshot.source.exercise).toBe(2025);
    expect(historical.snapshot.temporalStatus).toBe('other-exercise');
    const closed = extractOtherPublicSource(call.id, {
      ...callResponse(),
      consultedAt: '2026-03-01',
    });
    expect(closed.status).toBe('reference');
    if (closed.status === 'gap') throw new Error(closed.reason);
    expect(closed.snapshot.temporalStatus).toBe('closed');
  });

  it('no confirma apertura durante los días límite sin información de hora', () => {
    for (const consultedAt of ['2025-02-01', '2025-09-16']) {
      const result = extractOtherPublicSource(call.id, { ...callResponse(), consultedAt });
      expect(result.status).toBe('reference');
      if (result.status === 'gap') throw new Error(result.reason);
      expect(result.snapshot.temporalStatus).toBe('unknown');
    }
    const scheduled = extractOtherPublicSource(call.id, {
      ...callResponse(),
      consultedAt: '2025-01-15',
    });
    expect(scheduled.status).toBe('reference');
    if (scheduled.status === 'gap') throw new Error(scheduled.reason);
    expect(scheduled.snapshot.temporalStatus).toBe('not-yet-open');
  });

  it('no interpreta abierto como estado actual ni resuelve fechas relativas o contradictorias', () => {
    const unknown = extractOtherPublicSource(
      call.id,
      callResponse({
        ...payload,
        abierto: true,
        fechaInicioSolicitud: null,
        fechaFinSolicitud: null,
        textInicio: 'Plazo sintético relativo',
      }),
    );
    expect(unknown.status).toBe('reference');
    if (unknown.status === 'gap') throw new Error(unknown.reason);
    expect(unknown.snapshot.temporalStatus).toBe('unknown');
    expect(unknown.snapshot.applicationWindow?.textFrom).toBe('Plazo sintético relativo');
    for (const json of [
      { ...payload, textFin: '29 de octubre de 2021' },
      { ...payload, abierto: true },
      { ...payload, fechaInicioSolicitud: '2025-10-01' },
    ])
      expect(extractOtherPublicSource(call.id, callResponse(json))).toEqual({
        status: 'gap',
        reason: 'ambiguous-response',
      });
  });

  it('valida fechas reales y no utiliza consulta/recepción como actualización o vigencia', () => {
    for (const consultedAt of ['2026-02-30', '2026-13-01', 'today'])
      expect(extractOtherPublicSource(manual.id, { ...manualResponse(), consultedAt })).toEqual({
        status: 'gap',
        reason: 'invalid-date',
      });
    expect(
      extractOtherPublicSource(manual.id, { ...manualResponse(), updatedAt: '2027-01-01' }),
    ).toEqual({ status: 'gap', reason: 'invalid-date' });
    for (const json of [
      { ...payload, fechaRecepcion: '2027-01-01' },
      { ...payload, fechaFinSolicitud: '2025-02-30' },
      { ...payload, documentos: [{ id: 1, datPublicacion: '2025-02-30', datMod: null }] },
    ])
      expect(extractOtherPublicSource(call.id, callResponse(json))).toEqual({
        status: 'gap',
        reason: 'invalid-date',
      });
  });

  it('informa fallos de extracción y rechaza identidades/ámbitos ambiguos', () => {
    for (const content of [
      html.replace('id="acc-main"', ''),
      html.replace('</main>', '</main><main id="acc-main"></main>'),
    ])
      expect(extractOtherPublicSource(manual.id, manualResponse(content))).toEqual({
        status: 'gap',
        reason: 'extraction-failed',
      });
    expect(
      extractOtherPublicSource(
        manual.id,
        manualResponse(html.replace('ejercicio 2025', 'ejercicio 2024')),
      ),
    ).toEqual({ status: 'gap', reason: 'ambiguous-response' });
    for (const json of [
      [],
      null,
      { ...payload, codigoBDNS: '123' },
      { ...payload, regiones: [{ descripcion: 'ES41 - CASTILLA Y LEON' }] },
      { ...payload, organo: {} },
    ])
      expect(extractOtherPublicSource(call.id, callResponse(json)).status).toBe('gap');
  });
});
