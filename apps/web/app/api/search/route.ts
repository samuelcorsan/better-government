import {
  MAX_SEARCH_BODY_BYTES,
  readSearchBody,
  SearchBodyTooLargeError,
  searchRequestSchema,
} from '../../../lib/search-request';
import { createUIMessageStream, createUIMessageStreamResponse, type InferUIMessageChunk } from 'ai';
import { search } from '@reforma-digital/ai';
import { db, searches } from '@reforma-digital/db';
import {
  sameOrigin,
  rateLimit,
  feedbackToken,
  redactQuery,
  databaseAvailable,
  searchMode,
} from '../../../lib/security';
import type { ChatMessage } from '../../../lib/chat-message';
export const runtime = 'nodejs';
export const maxDuration = 120;
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Origen no permitido' }, { status: 403 });
  if (Number(request.headers.get('content-length') ?? 0) > MAX_SEARCH_BODY_BYTES)
    return Response.json({ error: 'Consulta demasiado larga' }, { status: 413 });
  try {
    if (!(await rateLimit(request)))
      return Response.json(
        {
          error: 'Has hecho muchas consultas. Espera un minuto e inténtalo de nuevo.',
        },
        { status: 429 },
      );
    const body = await readSearchBody(request);
    let json: unknown;
    try {
      json = JSON.parse(body);
    } catch {
      return Response.json({ error: 'JSON inválido' }, { status: 400 });
    }
    const parsed = searchRequestSchema.safeParse(json);
    if (!parsed.success)
      return Response.json(
        {
          error:
            'La consulta debe contener al menos 4 caracteres y respetar los límites de texto protegido.',
        },
        { status: 400 },
      );
    const cancellation = new AbortController();
    const chunks = createUIMessageStream<ChatMessage>({
      async execute({ writer }) {
        writer.write({ type: 'start' });
        const result = await search(redactQuery(parsed.data.query), {
          mode: searchMode(),
          signal: AbortSignal.any([request.signal, cancellation.signal]),
          context: parsed.data.context?.map(redactQuery),
          attachmentContext: parsed.data.attachmentContext
            ? redactQuery(parsed.data.attachmentContext)
            : undefined,
          onStage: (stage) =>
            writer.write({ type: 'data-stage', data: { stage }, transient: true }),
          onEvidence: (items) =>
            writer.write({ type: 'data-evidence', id: 'evidence', data: { items } }),
          // Only validated claims are streamed. Partial model JSON is never shown to citizens.
          onClaim: (block) => writer.write({ type: 'data-claim', id: block.claim.id, data: block }),
        });
        let token: string | null = null;
        if (databaseAvailable() && process.env.FEEDBACK_SECRET) {
          await db().insert(searches).values({ id: result.id, result });
          token = feedbackToken(result.id);
        }
        // The final answer is authoritative: re-sent parts replace the streamed ones by id.
        writer.write({ type: 'data-evidence', id: 'evidence', data: { items: result.evidence } });
        for (const claim of result.answer.claims)
          writer.write({
            type: 'data-claim',
            id: claim.id,
            data: {
              claim,
              citations: result.answer.citations.filter((c) => c.claimId === claim.id),
            },
          });
        if (!result.answer.claims.length) {
          writer.write({ type: 'text-start', id: 'answer' });
          writer.write({ type: 'text-delta', id: 'answer', delta: result.answer.answer });
          writer.write({ type: 'text-end', id: 'answer' });
        }
        writer.write({
          type: 'finish',
          messageMetadata: {
            searchId: result.id,
            feedbackToken: token,
            status: result.answer.status,
            incomplete: result.answer.incomplete,
            region: result.understanding.region,
          },
        });
      },
      onError(e) {
        const message = e instanceof Error ? e.message : 'Error';
        console.error(
          'search_failed',
          message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]').slice(0, 300),
        );
        return 'No hemos podido consultar las fuentes. Inténtalo de nuevo en un momento.';
      },
    });
    // Stopping in the browser cancels the response; that must also stop the provider calls.
    const reader = chunks.getReader();
    const stream = new ReadableStream<InferUIMessageChunk<ChatMessage>>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) controller.close();
        else controller.enqueue(value);
      },
      cancel(reason) {
        cancellation.abort();
        return reader.cancel(reason);
      },
    });
    return createUIMessageStreamResponse({
      stream,
      headers: {
        'Cache-Control': 'no-cache, no-store',
        'X-Accel-Buffering': 'no',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (e) {
    if (e instanceof SearchBodyTooLargeError)
      return Response.json({ error: 'Consulta demasiado larga' }, { status: 413 });
    const message = e instanceof Error ? e.message : 'Error';
    console.error(
      'search_rejected',
      message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]').slice(0, 300),
    );
    return Response.json({ error: 'No se ha podido procesar la consulta.' }, { status: 503 });
  }
}
