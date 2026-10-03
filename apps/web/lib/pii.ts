import type { ChatGuard } from '@nationaldesignstudio/rampart';
import type { SearchContext } from '@reforma-digital/core';
import { redactQuery } from './redact';
import { protectionDetails, type ProtectedText } from './pii-display';
let guard: Promise<ChatGuard> | undefined;
export const PROTECTION_TIMEOUT_MS = 60_000;
export class ProtectionTimeoutError extends Error {
  constructor() {
    super(
      'La protección de datos ha tardado demasiado. No se ha enviado la consulta. Inténtalo de nuevo.',
    );
    this.name = 'ProtectionTimeoutError';
  }
}
// Browser only. Rejects if Rampart cannot load or run, so nothing is sent unprotected.
async function protectMessage(text: string): Promise<ProtectedText> {
  guard ??= import('@nationaldesignstudio/rampart').then((m) => m.createGuard());
  const current = guard;
  try {
    const loaded = await current;
    const result = await loaded.protect(redactQuery(text));
    return protectionDetails(text, result.text, result.placeholders ?? [], (token) =>
      loaded.reveal(token),
    );
  } catch (e) {
    if (guard === current) guard = undefined;
    throw e;
  }
}

// Bound the whole batch, including model loading. Late results never reach fetch.
export async function protectMessages(
  texts: string[],
  signal: AbortSignal,
): Promise<ProtectedText[]> {
  signal.throwIfAborted();
  const cancellation = new AbortController();
  const workSignal = AbortSignal.any([signal, cancellation.signal]);
  let timer: ReturnType<typeof setTimeout>;
  let abort: () => void;
  const interrupted = new Promise<never>((_, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
    timer = setTimeout(() => reject(new ProtectionTimeoutError()), PROTECTION_TIMEOUT_MS);
  });
  const work = (async () => {
    const safe: ProtectedText[] = [];
    for (const text of texts) {
      workSignal.throwIfAborted();
      safe.push(await protectMessage(text));
    }
    return safe;
  })();
  const current = guard;
  try {
    return await Promise.race([work, interrupted]);
  } catch (error) {
    // A stalled instance must not hold up retries or run concurrently with them.
    if (guard === current) guard = undefined;
    throw error;
  } finally {
    cancellation.abort();
    clearTimeout(timer!);
    signal.removeEventListener('abort', abort!);
  }
}

export async function protectSearchRequest(
  query: string,
  { context = [], attachmentContext }: SearchContext,
  signal: AbortSignal,
) {
  const protectedMessages = await protectMessages(
    [
      query,
      ...context.map((message) => message.content),
      ...(attachmentContext ? [attachmentContext] : []),
    ],
    signal,
  );
  return {
    question: protectedMessages[0]!,
    context: context.map((message, i) => ({
      ...message,
      content: protectedMessages[i + 1]!.text,
    })),
    attachmentContext: attachmentContext ? protectedMessages.at(-1)!.text : undefined,
  };
}
