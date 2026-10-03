import { afterEach, describe, expect, it, vi } from 'vitest';
import { search } from '../packages/ai/src/index';
import { defaultConfig } from '../packages/core/src/index';

const interpretation = {
  intent: 'procedure',
  location: null,
  jurisdiction: 'ES',
  clarification: null,
  temporal: false,
  requestedYear: null,
};
const excerpt = 'Puedes solicitar el informe de vida laboral en Importass.';
const citation = (url: string, content = excerpt) => ({
  type: 'url_citation',
  url_citation: { url, title: 'Vida laboral', content, start_index: 0, end_index: 10 },
});
function completion(content: unknown, annotations: unknown[] = []) {
  return Response.json({
    id: 'test',
    model: defaultConfig.generationModel,
    created: 0,
    choices: [
      {
        index: 0,
        finish_reason: 'stop',
        message: { role: 'assistant', content: JSON.stringify(content), annotations },
      },
    ],
    usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3, cost: 0.0001 },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('chat web retrieval', () => {
  it('uses Luna high web search and filters original source excerpts after interpreting jurisdiction', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-only-key');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('LANGFUSE_SECRET_KEY', '');
    const fetch = vi.fn(async (_input, _init) =>
      completion(interpretation, [
        citation('https://portal.seg-social.gob.es/vida-laboral'),
        citation('https://portal.seg-social.gob.es/vida-laboral?utm_source=test'),
        citation('https://example.com/vida-laboral'),
        citation('https://portal.seg-social.gob.es/no-excerpt', ''),
        citation('https://sede.madrid.es/local'),
        citation('https://portal.seg-social.gob.es.evil.com/vida-laboral'),
      ]),
    );
    vi.stubGlobal('fetch', fetch);
    const result = await search('Cómo obtener mi vida laboral', {
      mode: 'live',
      retrievalOnly: true,
    });
    expect(fetch).toHaveBeenCalledOnce();
    expect(String(fetch.mock.calls[0]![0])).toBe('https://openrouter.ai/api/v1/chat/completions');
    const request = JSON.parse(String((fetch.mock.calls[0]![1] as RequestInit).body));
    expect(request).toMatchObject({
      model: defaultConfig.generationModel,
      reasoning: { effort: 'high', exclude: true },
      response_format: { type: 'json_schema' },
      tools: [
        { type: 'openrouter:web_search', parameters: { engine: 'parallel', max_results: 8 } },
      ],
      max_tool_calls: 3,
    });
    expect(request.tools[0].parameters.allowed_domains).toContain('portal.seg-social.gob.es');
    expect(request.tools[0].parameters.allowed_domains).toContain('sede.madrid.es');
    expect(result.evidence).toHaveLength(1);
    expect(result.evidence[0]).toMatchObject({
      content: excerpt,
      sourceId: 'seg-social',
      jurisdiction: 'ES',
    });
    expect(result.tokens).toBe(3);
    expect(result.costUsd).toBe(0.0001);
  });

  it('returns the model municipality question without generating claims or accepting sources', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-only-key');
    const fetch = vi.fn(async () =>
      completion(
        {
          ...interpretation,
          jurisdiction: null,
          clarification: '¿En qué municipio quieres empadronarte?',
        },
        [citation('https://sede.madrid.es/local')],
      ),
    );
    vi.stubGlobal('fetch', fetch);
    const result = await search('Cómo empadronarme', { mode: 'live' });
    expect(fetch).toHaveBeenCalledOnce();
    expect(result.answer.status).toBe('needs_clarification');
    expect(result.answer.answer).toBe('¿En qué municipio quieres empadronarte?');
    expect(result.answer.claims).toEqual([]);
    expect(result.evidence).toEqual([]);
  });

  it.each([
    'He recibido una carta de Hacienda, ¿qué hago?',
    '¿Cuánto tiempo puedo percibir el paro?',
    'Posibilidad de aplazar el pago del IRPF',
  ])(
    'lets the model interpret the original query instead of blocking on keyword matches: %s',
    async (query) => {
      vi.stubEnv('OPENROUTER_API_KEY', 'test-only-key');
      const fetch = vi.fn(async (_input, _init) => completion(interpretation));
      vi.stubGlobal('fetch', fetch);
      const result = await search(query, { mode: 'live', retrievalOnly: true });
      expect(fetch).toHaveBeenCalledOnce();
      const request = JSON.parse(String((fetch.mock.calls[0]![1] as RequestInit).body));
      expect(JSON.parse(request.messages.at(-1).content).query).toBe(query);
      expect(result.understanding.clarification).toBeUndefined();
      expect(result).not.toHaveProperty('resolvedQuery');
    },
  );

  it.each(['evidence-v1', 'evidence-v2'] as const)(
    'preserves the original question, both conversation roles and PDF in search and %s generation',
    async (promptVersion) => {
      vi.stubEnv('OPENROUTER_API_KEY', 'test-only-key');
      const context = [
        { role: 'user' as const, content: '¿Cómo obtengo mi vida laboral?' },
        {
          role: 'assistant' as const,
          content: 'Primera opción: descargarla. Segunda opción: solicitarla por correo.',
        },
      ];
      const attachmentContext =
        'Documento protegido: no tengo certificado digital. [GOVERNMENT_ID_1]';
      const query = '¿Y la segunda opción?';
      const inputs: Record<string, unknown>[] = [];
      const fetch = vi.fn(async (_input, init) => {
        const request = JSON.parse(init.body);
        const input = JSON.parse(request.messages.at(-1).content);
        inputs.push(input);
        if (request.tools)
          return completion(interpretation, [
            citation('https://portal.seg-social.gob.es/vida-laboral'),
          ]);
        if (!input.evidence)
          return completion(
            promptVersion === 'evidence-v1'
              ? { claims: [{ id: 'a', supported: true, reason: 'Respaldado' }] }
              : { supported: true, reason: 'Respaldado' },
          );
        const { documentId, chunkId } = input.evidence[0];
        if (!request.stream)
          return completion({
            status: 'answered',
            answer: 'Consulta las fuentes',
            claims: [{ id: 'a', kind: 'step', text: excerpt }],
            citations: [{ claimId: 'a', documentId, chunkId }],
            relatedOfficialLinks: [{ documentId }],
          });
        const chunk = {
          id: 'stream',
          model: defaultConfig.generationModel,
          created: 0,
          choices: [
            {
              index: 0,
              finish_reason: 'stop',
              delta: {
                role: 'assistant',
                content: JSON.stringify({
                  elements: [{ kind: 'step', text: excerpt, citations: [{ documentId, chunkId }] }],
                }),
              },
            },
          ],
          usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
        };
        return new Response(`data: ${JSON.stringify(chunk)}\n\ndata: [DONE]\n\n`, {
          headers: { 'Content-Type': 'text/event-stream' },
        });
      });
      vi.stubGlobal('fetch', fetch);
      const result = await search(query, {
        mode: 'live',
        config: { ...defaultConfig, promptVersion },
        context,
        attachmentContext,
      });
      expect(fetch).toHaveBeenCalledTimes(3); // Search, generation, verification; no rewriting call.
      expect(inputs[0]).toMatchObject({ query, context, userDocumentContext: attachmentContext });
      expect(inputs[1]).toMatchObject({ query, context, userDocumentContext: attachmentContext });
      expect(result.answer.status).toBe('answered');
      expect(result.answer.claims[0]?.text).toBe(excerpt);
      expect(result.evidence).toHaveLength(1);
      expect(result.evidence[0]?.content).toBe(excerpt);
    },
  );

  it('rejects an invalid model interpretation without falling back to regex', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-only-key');
    const fetch = vi.fn(async () => completion({ ...interpretation, jurisdiction: 'invented' }));
    vi.stubGlobal('fetch', fetch);
    await expect(search('Cómo obtener mi vida laboral', { mode: 'live' })).rejects.toThrow();
    expect(fetch).toHaveBeenCalledOnce();
  });
});
