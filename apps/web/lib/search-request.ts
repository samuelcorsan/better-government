import { z } from 'zod';
import { conversationMessageSchema } from '@reforma-digital/core';

// The composer still allows 1,200 characters and PDF extraction 6,000.
// Wire limits include a bounded allowance for longer redaction markers.
export const MAX_SEARCH_BODY_BYTES = 300_000;
export class SearchBodyTooLargeError extends Error {}
export async function readSearchBody(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();
      bytes += value.byteLength;
      if (bytes > MAX_SEARCH_BODY_BYTES) {
        await reader.cancel();
        throw new SearchBodyTooLargeError();
      }
      body += decoder.decode(value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}
export const searchRequestSchema = z.object({
  query: z.string().trim().min(4).max(6_000),
  attachmentContext: z.string().max(30_000).optional(),
  context: z.array(conversationMessageSchema).max(12).optional(),
});
