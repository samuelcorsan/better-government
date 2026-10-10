import { DefaultChatTransport, type ChatTransport } from 'ai';
import { protectMessages, ProtectionTimeoutError } from './pii';
import type { ChatMessage } from './chat-message';

export const textOf = (message: ChatMessage | undefined) =>
  (message?.parts ?? [])
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
    .trim();

const http = new DefaultChatTransport<ChatMessage>({
  api: '/api/search',
  prepareSendMessagesRequest: ({ body }) => ({ body: body ?? {} }),
});

/**
 * Sends only the protected questions: earlier answers and their evidence stay in the browser.
 * The spans hidden from the model come back as the first part of the reply.
 */
export const chatTransport: ChatTransport<ChatMessage> = {
  async sendMessages(options) {
    const questions = options.messages.filter((m) => m.role === 'user');
    const context = questions.slice(0, -1).slice(-6).map(textOf);
    const attachment = [...questions].reverse().find((m) => m.metadata?.attachment)
      ?.metadata?.attachment;
    const outgoing = [textOf(questions.at(-1)), ...context];
    if (attachment) outgoing.push(attachment.text);
    let safe;
    try {
      safe = await protectMessages(outgoing, options.abortSignal ?? new AbortController().signal);
    } catch (error) {
      if (options.abortSignal?.aborted || error instanceof ProtectionTimeoutError) throw error;
      throw new Error(
        'No hemos podido proteger tus datos personales en este dispositivo, así que no se ha enviado la consulta. Inténtalo de nuevo.',
      );
    }
    options.abortSignal?.throwIfAborted();
    const texts = safe.map((message) => message.text);
    const stream = await http.sendMessages({
      ...options,
      body: {
        query: texts[0],
        context: texts.slice(1, 1 + context.length),
        ...(attachment ? { attachmentContext: texts.at(-1) } : {}),
      },
    });
    const hidden = safe[0]?.ranges ?? [];
    if (!hidden.length) return stream;
    let sent = false;
    return stream.pipeThrough(
      new TransformStream({
        transform(chunk, controller) {
          controller.enqueue(chunk);
          if (sent) return;
          sent = true;
          controller.enqueue({ type: 'data-privacy', id: 'privacy', data: { hidden } });
        },
      }),
    );
  },
  reconnectToStream: () => Promise.resolve(null),
};
