import {
  MAX_SEARCH_BODY_BYTES,
  readSearchBody,
  SearchBodyTooLargeError,
  searchRequestSchema,
} from '../../../lib/search-request';
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
    const encoder = new TextEncoder();
    const cancellation = new AbortController();
    let open = true;
    const signal = AbortSignal.any([request.signal, cancellation.signal]);
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          if (open)
            try {
              controller.enqueue(
                encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
              );
            } catch {
              open = false;
            }
        };
        request.signal.addEventListener(
          'abort',
          () => {
            open = false;
          },
          { once: true },
        );
        try {
          const result = await search(redactQuery(parsed.data.query), {
            mode: searchMode(),
            signal,
            context: parsed.data.context?.map(redactQuery),
            attachmentContext: parsed.data.attachmentContext
              ? redactQuery(parsed.data.attachmentContext)
              : undefined,
            onEvidence: (evidence) => send('evidence', evidence),
            onClaim: (claim) => send('claim', claim),
            onStage: (s) => send('stage', s),
          });
          let token: string | null = null;
          if (databaseAvailable() && process.env.FEEDBACK_SECRET) {
            await db().insert(searches).values({ id: result.id, result });
            token = feedbackToken(result.id);
          }
          // Only validated claims are streamed. Partial model JSON is never shown to citizens.
          send('result', {
            id: result.id,
            query: result.query,
            understanding: result.understanding,
            evidence: result.evidence,
            answer: result.answer,
            mode: result.mode,
            feedbackToken: token,
          });
        } catch (e) {
          const message = e instanceof Error ? e.message : 'Error';
          console.error(
            'search_failed',
            message.replace(/[a-z][a-z0-9+.-]*:\/\/\S+/gi, '[url]').slice(0, 300),
          );
          send('error', 'No hemos podido consultar las fuentes. Inténtalo de nuevo en un momento.');
        } finally {
          if (open) controller.close();
        }
      },
      cancel() {
        open = false;
        cancellation.abort();
      },
    });
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
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
