import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ChatGuard } from '../apps/web/node_modules/@nationaldesignstudio/rampart';

const createGuard = vi.hoisted(() => vi.fn());
// Path, not package name: Rampart is only a dependency of apps/web.
vi.mock(
  import('../apps/web/node_modules/@nationaldesignstudio/rampart'),
  async (importOriginal) => ({
    ...(await importOriginal()),
    createGuard,
  }),
);

const guard = (protect: (text: string) => Promise<{ text: string }>) => ({ protect });

describe('pii protection', () => {
  beforeEach(() => {
    vi.resetModules();
    createGuard.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('cancels a pending model load immediately and allows retry', async () => {
    let finish!: (value: unknown) => void;
    createGuard.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const { protectMessages } = await import('../apps/web/lib/pii');
    const controller = new AbortController();
    const pending = protectMessages(['Soy Ana', 'segunda pregunta'], controller.signal);
    const rejected = expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    await vi.waitFor(() => expect(createGuard).toHaveBeenCalledOnce());
    controller.abort();
    await rejected;
    const oldProtect = vi.fn(async (text: string) => ({ text }));
    createGuard.mockResolvedValue(guard(async (text) => ({ text })));
    expect(await protectMessages(['Otra pregunta'], new AbortController().signal)).toMatchObject([
      { text: 'Otra pregunta' },
    ]);
    finish(guard(oldProtect));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(oldProtect).toHaveBeenCalledTimes(1);
  });

  it('bounds the whole batch and discards a late inference without starting the next text', async () => {
    let finish!: (value: { text: string }) => void;
    const inference = vi.fn(
      () =>
        new Promise<{ text: string }>((resolve) => {
          finish = resolve;
        }),
    );
    createGuard.mockResolvedValue(guard(inference));
    const { protectMessages, PROTECTION_TIMEOUT_MS } = await import('../apps/web/lib/pii');
    vi.useFakeTimers();
    const pending = protectMessages(
      ['Primera pregunta', 'segunda pregunta'],
      new AbortController().signal,
    );
    const rejected = expect(pending).rejects.toMatchObject({ name: 'ProtectionTimeoutError' });
    await vi.advanceTimersByTimeAsync(PROTECTION_TIMEOUT_MS);
    await rejected;
    finish({ text: 'late result' });
    await vi.advanceTimersByTimeAsync(0);
    expect(inference).toHaveBeenCalledTimes(1);
    createGuard.mockResolvedValue(guard(async (text) => ({ text })));
    expect(await protectMessages(['Reintento'], new AbortController().signal)).toMatchObject([
      { text: 'Reintento' },
    ]);
  });

  it('never initializes protection for an already cancelled request', async () => {
    const { protectMessages } = await import('../apps/web/lib/pii');
    const controller = new AbortController();
    controller.abort();
    await expect(protectMessages(['Pregunta'], controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
    expect(createGuard).not.toHaveBeenCalled();
  });

  it('hands Rampart text that the Spanish rules already redacted', async () => {
    const seen: string[] = [];
    createGuard.mockResolvedValue(
      guard(async (text) => {
        seen.push(text);
        return { text: text.replace('Ana', '[GIVEN_NAME_1]') };
      }),
    );
    const { protectMessages } = await import('../apps/web/lib/pii');
    expect(
      await protectMessages(['Soy Ana, DNI 12345678Z'], new AbortController().signal),
    ).toMatchObject([{ text: 'Soy [GIVEN_NAME_1], DNI [DNI omitido]' }]);
    expect(seen).toEqual(['Soy Ana, DNI [DNI omitido]']);
  });

  it('protects Spanish identifiers and whole email addresses before Rampart', async () => {
    createGuard.mockResolvedValue(new ChatGuard());
    const { protectMessages } = await import('../apps/web/lib/pii');
    const original =
      '12345678Z y ES91 2100 0418 4502 0005 1332. Correo 12345678Z@example.test y 612345678@example.test';
    const [protectedText] = await protectMessages([original], new AbortController().signal);
    expect(protectedText?.text).toBe(
      '[DNI omitido] y [IBAN omitido]. Correo [correo omitido] y [correo omitido]',
    );
    expect(protectedText?.ranges.map(({ start, end }) => original.slice(start, end))).toEqual([
      '12345678Z',
      'ES91 2100 0418 4502 0005 1332',
      '12345678Z@example.test',
      '612345678@example.test',
    ]);
  });

  it('fails closed when Rampart cannot load, then retries', async () => {
    createGuard.mockRejectedValueOnce(new Error('model unavailable'));
    createGuard.mockResolvedValue(guard(async (text) => ({ text })));
    const { protectMessages } = await import('../apps/web/lib/pii');
    await expect(protectMessages(['Soy Ana'], new AbortController().signal)).rejects.toThrow(
      'model unavailable',
    );
    expect(await protectMessages(['Soy Ana'], new AbortController().signal)).toMatchObject([
      { text: 'Soy Ana' },
    ]);
  });

  it('protects the question, both conversation roles and the PDF without losing their order', async () => {
    createGuard.mockResolvedValue(
      guard(async (text) => ({ text: text.replace('Ana', '[GIVEN_NAME_1]') })),
    );
    const { protectSearchRequest } = await import('../apps/web/lib/pii');
    const result = await protectSearchRequest(
      '¿Y la segunda opción, Ana?',
      {
        context: [
          { role: 'user', content: 'Soy Ana, DNI 12345678Z' },
          {
            role: 'assistant',
            content: 'Ana, primera opción: informe. Segunda opción: requisitos.',
          },
        ],
        attachmentContext: 'Documento de Ana, NIE X1234567L',
      },
      new AbortController().signal,
    );
    expect(result.question.text).toBe('¿Y la segunda opción, [GIVEN_NAME_1]?');
    expect(result.context).toEqual([
      { role: 'user', content: 'Soy [GIVEN_NAME_1], DNI [DNI omitido]' },
      {
        role: 'assistant',
        content: '[GIVEN_NAME_1], primera opción: informe. Segunda opción: requisitos.',
      },
    ]);
    expect(result.attachmentContext).toBe('Documento de [GIVEN_NAME_1], NIE [NIE omitido]');
  });

  it('fails closed when Rampart throws while protecting', async () => {
    createGuard.mockResolvedValue(
      guard(async () => {
        throw new Error('inference failed');
      }),
    );
    const { protectMessages } = await import('../apps/web/lib/pii');
    await expect(protectMessages(['Soy Ana'], new AbortController().signal)).rejects.toThrow(
      'inference failed',
    );
  });
});
