// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, expect, it, vi } from 'vitest';
import type { Evidence } from '../packages/core/src/index';
import { SourcePopover } from '../apps/web/components/source-popover';

const evidence: Evidence = {
  chunkId: 'synthetic-chunk',
  documentId: 'synthetic-document',
  sourceId: 'synthetic-source',
  canonicalUrl: 'https://example.test/tramite?documento=synthetic#requisitos',
  title: 'Trámite sintético',
  heading: 'Documentación',
  content:
    '### Documentación\n\n**Presenta** el formulario oficial. [Consulta](https://example.test) ![imagen](https://example.test/image.png)\n\n- [x] Documento\n\n<script>alert(1)</script>',
  organization: 'Organismo sintético',
  jurisdiction: 'ES',
  authorityScore: 100,
  crawledAt: '2026-10-03T00:00:00Z',
  sourceUpdatedAt: null,
  score: 1,
  available: true,
};
let root: Root | undefined;
afterEach(async () => {
  await act(async () => root?.unmount());
  document.body.replaceChildren();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function render(items: Evidence[] = [evidence], href?: string) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  const container = document.createElement('p');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(
      createElement(SourcePopover, {
        evidence: items,
        className: 'citation',
        children: 'Fuentes',
        ...(href ? { href } : {}),
      }),
    );
  });
  const trigger = container.querySelector<HTMLElement>('button, a')!;
  const panel = document.querySelector<HTMLDivElement>('[popover]')!;
  return { container, trigger, panel };
}
function toggle(panel: HTMLElement, state: 'open' | 'closed') {
  const event = new Event('toggle');
  Object.defineProperty(event, 'newState', { value: state });
  panel.dispatchEvent(event);
}

it('agrupa fuentes, renderiza Markdown y abre la web directamente sin otra petición', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  const second = { ...evidence, chunkId: 'second-chunk', content: 'Segundo fragmento literal.' };
  const { container, trigger, panel } = await render(
    [evidence, evidence, second],
    evidence.canonicalUrl,
  );
  await act(async () => toggle(panel, 'open'));
  expect(container.querySelector('[role="dialog"]')).toBeNull();
  expect(trigger.tagName).toBe('A');
  expect(trigger.getAttribute('href')).toBe(evidence.canonicalUrl);
  expect(trigger.getAttribute('popovertarget')).toBeNull();
  expect(trigger.getAttribute('rel')).toBe('noopener noreferrer');
  expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
  expect(panel.getAttribute('popover')).toBe('auto');
  expect(panel.querySelectorAll('.source-popover-card')).toHaveLength(1);
  expect(panel.querySelector('.source-popover-excerpt')?.textContent).toContain(
    'Presenta el formulario oficial.',
  );
  expect(panel.querySelector('.source-popover-excerpt h3')?.textContent).toBe('Documentación');
  expect(panel.querySelector('.source-popover-excerpt strong')?.textContent).toBe('Presenta');
  expect(panel.querySelector('.source-popover-excerpt')?.textContent).not.toContain('###');
  expect(panel.querySelector('details')).toBeNull();
  expect(panel.querySelector('li > a')?.getAttribute('href')).toBe(evidence.canonicalUrl);
  expect(panel.querySelector('li > a')?.getAttribute('rel')).toBe('noopener noreferrer');
  expect(panel.querySelector('.source-popover-excerpt :is(a, img, input, script)')).toBeNull();
  const favicon = panel.querySelector<HTMLImageElement>('.agency-badge img')!;
  const faviconUrl = new URL(favicon.src);
  expect(faviconUrl.origin).toBe('https://www.google.com');
  expect(faviconUrl.pathname).toBe('/s2/favicons');
  expect([...faviconUrl.searchParams]).toEqual([
    ['domain', 'example.test'],
    ['sz', '32'],
  ]);
  expect(favicon.getAttribute('referrerpolicy')).toBe('no-referrer');
  expect(favicon.alt).toBe('');
  await act(async () => favicon.dispatchEvent(new Event('error')));
  expect(panel.querySelector('.agency-badge img')).toBeNull();
  expect(panel.querySelector('.agency-badge')?.textContent).toBe('OS');
  expect(fetch).not.toHaveBeenCalled();
});

it.each([undefined, evidence.canonicalUrl])(
  'abre con hover y conserva el foco (%s)',
  async (href) => {
    vi.useFakeTimers();
    const { trigger, panel } = await render([evidence], href);
    expect(trigger.getAttribute('popovertarget')).toBe(href ? null : panel.id);
    let open = false;
    const matches = panel.matches.bind(panel);
    vi.spyOn(panel, 'matches').mockImplementation((selector) =>
      selector === ':popover-open' ? open : matches(selector),
    );
    const show = vi.fn(() => {
      open = true;
      toggle(panel, 'open');
    });
    const hide = vi.fn(() => {
      open = false;
      toggle(panel, 'closed');
    });
    Object.defineProperties(panel, { showPopover: { value: show }, hidePopover: { value: hide } });
    function pointer(target: Element, type: string, pointerType = 'mouse') {
      const event = new MouseEvent(type, { bubbles: true });
      Object.defineProperty(event, 'pointerType', { value: pointerType });
      target.dispatchEvent(event);
    }
    await act(async () => pointer(trigger, 'pointerover', 'touch'));
    expect(show).not.toHaveBeenCalled();
    await act(async () => pointer(trigger, 'pointerover'));
    expect(show).toHaveBeenCalledWith({ source: trigger });
    await act(async () => {
      pointer(trigger, 'pointerout', 'touch');
      vi.advanceTimersByTime(200);
    });
    expect(hide).not.toHaveBeenCalled();
    await act(async () => {
      pointer(trigger, 'pointerout');
      vi.advanceTimersByTime(100);
      pointer(panel, 'pointerover');
      vi.advanceTimersByTime(200);
    });
    expect(hide).not.toHaveBeenCalled();
    await act(async () => {
      panel.querySelector('a')!.focus();
      pointer(panel, 'pointerout');
      vi.advanceTimersByTime(200);
    });
    expect(hide).not.toHaveBeenCalled();
    await act(async () => {
      panel.querySelector('a')!.blur();
      vi.advanceTimersByTime(200);
    });
    expect(hide).toHaveBeenCalledOnce();
    if (href) {
      await act(async () => trigger.focus());
      expect(show).toHaveBeenCalledTimes(2);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
    }
  },
);
