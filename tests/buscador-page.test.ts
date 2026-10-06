// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { expect, it, vi } from 'vitest';
import { Buscador } from '../apps/web/app/(search)/chat/buscador';
import { protectMessages } from '../apps/web/lib/pii';

vi.mock('../apps/web/lib/pii', () => ({
  protectMessages: vi.fn(),
  warm: vi.fn(),
  ProtectionTimeoutError: class extends Error {},
}));

it('usa el chat real y al empezar de nuevo borra la conversación y cancela la consulta pendiente', async () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  const scrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
  const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value: vi.fn(),
  });
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response('{"error":"Fuentes no disponibles"}', { status: 503 }));
  vi.stubGlobal('fetch', fetch);
  vi.mocked(protectMessages).mockResolvedValueOnce([{ text: 'Consulta protegida', ranges: [] }]);
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(createElement(Buscador, { mode: 'preview' })));
    const nueva = () =>
      container.querySelector<HTMLButtonElement>('[aria-label="Nueva conversación"]')!.click();
    const pregunta = () =>
      container.querySelector<HTMLButtonElement>('.chat-empty .chat-followups button')!.click();
    await act(async () => pregunta());
    expect(fetch).toHaveBeenCalledWith(
      '/api/search',
      expect.objectContaining({
        body: JSON.stringify({ query: 'Consulta protegida', context: [] }),
      }),
    );
    expect(container.textContent).toContain('Fuentes no disponibles');
    await act(async () => nueva());
    expect(container.querySelector('.chat-turn')).toBeNull();
    expect(container.querySelector('h1')?.textContent).toBe('¿Qué necesitas hacer?');
    expect(document.activeElement).toBe(container.querySelector('textarea'));

    let finish!: (value: Awaited<ReturnType<typeof protectMessages>>) => void;
    vi.mocked(protectMessages).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await act(async () => pregunta());
    const signal = vi.mocked(protectMessages).mock.calls.at(-1)?.[1];
    expect(signal?.aborted).toBe(false);
    await act(async () => nueva());
    expect(signal?.aborted).toBe(true);
    await act(async () => finish([{ text: 'Consulta cancelada', ranges: [] }]));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(container.querySelector('.chat-turn')).toBeNull();
  } finally {
    await act(async () => root.unmount());
    container.remove();
    if (scrollIntoView) Object.defineProperty(Element.prototype, 'scrollIntoView', scrollIntoView);
    else Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
    if (close) Object.defineProperty(HTMLDialogElement.prototype, 'close', close);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
