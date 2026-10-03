import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { executeMappedTransition, parseFlowMap, recognizeMappedScreen } from './flow-map';

const url = new URL('https://example.test/tramite/inicio');
const map = {
  schemaVersion: 1,
  version: '1.0.0',
  origin: url.origin,
  screens: [
    {
      id: 'start',
      path: url.pathname,
      label: 'Inicio',
      controls: [
        {
          id: 'activity',
          selector: '#activity',
          label: 'Actividad',
          restrictions: { tag: 'input', type: 'text' },
        },
        {
          id: 'next',
          selector: '#next',
          label: 'Continuar',
          restrictions: { tag: 'button', type: 'button' },
        },
        {
          id: 'send',
          selector: '#send',
          label: 'Presentar',
          restrictions: { tag: 'button', type: 'submit' },
        },
      ],
      transitions: [
        {
          id: 'fill-activity',
          control: 'activity',
          operation: 'fill',
          valueRef: { scope: 'session', key: 'activity' },
          to: 'start',
          effect: { kind: 'field-change', description: 'Escribe en el control original' },
        },
        {
          id: 'continue',
          control: 'next',
          operation: 'click',
          to: 'done',
          effect: { kind: 'navigation', description: 'Abre la pantalla siguiente' },
        },
        {
          id: 'submit',
          control: 'send',
          operation: 'click',
          to: 'done',
          effect: { kind: 'submission', description: 'Presenta el trámite' },
        },
      ],
    },
    {
      id: 'done',
      path: '/tramite/fin',
      label: 'Fin',
      controls: [
        {
          id: 'status',
          selector: '#status',
          label: 'Estado',
          restrictions: { tag: 'input', type: 'text' },
        },
      ],
      transitions: [],
    },
  ],
};

const options = {
  sessionValue: vi.fn(async () => 'ACTIVIDAD_SINTETICA'),
  beforeSubmission: vi.fn(async (_id: string) => true),
};

beforeEach(() => {
  Object.defineProperty(document, 'URL', { configurable: true, value: url.href });
  document.body.innerHTML =
    '<form action="https://example.test/tramite/inicio"><label for="activity">Actividad</label><input id="activity" type="text"><button id="next" type="button">Continuar</button><button id="send" type="submit">Presentar</button></form>';
  vi.spyOn(HTMLElement.prototype, 'offsetParent', 'get').mockReturnValue(document.body);
  vi.clearAllMocks();
});
afterEach(() => {
  Reflect.deleteProperty(document, 'URL');
  vi.restoreAllMocks();
});

it('recognizes structure, reads a session reference and leaves the official control in charge', async () => {
  expect(recognizeMappedScreen(map, document)).toBe('start');
  expect(await executeMappedTransition(map, document, 'fill-activity', options)).toEqual({
    status: 'acted',
    expectedScreen: 'start',
  });
  expect(options.sessionValue).toHaveBeenCalledWith('activity');
  expect((document.querySelector('#activity') as HTMLInputElement).value).toBe(
    'ACTIVIDAD_SINTETICA',
  );
  const click = vi.fn();
  document.querySelector('#next')!.addEventListener('click', click);
  expect(await executeMappedTransition(map, document, 'continue', options)).toEqual({
    status: 'acted',
    expectedScreen: 'done',
  });
  expect(click).toHaveBeenCalledOnce();
  expect(recognizeMappedScreen(map, document)).toBe('start'); // An expected transition is not verified behavior.
});

it('fails closed on unknown state, transition, effect and ambiguous selector', async () => {
  expect(() => parseFlowMap({ ...map, script: 'alert(1)' })).toThrow();
  expect(() =>
    parseFlowMap({ ...map, origin: { toString: () => 'https://example.test' } }),
  ).toThrow('Invalid map origin');
  expect(() => parseFlowMap({ ...map, schemaVersion: 2 })).toThrow('Unsupported map version');
  expect(() =>
    parseFlowMap({
      ...map,
      screens: [
        {
          ...map.screens[0],
          transitions: [{ ...map.screens[0]!.transitions[0], value: 'VALOR_INCRUSTADO' }],
        },
        ...map.screens.slice(1),
      ],
    }),
  ).toThrow();
  expect(() =>
    parseFlowMap({
      ...map,
      screens: [
        {
          ...map.screens[0],
          transitions: [{ ...map.screens[0]!.transitions[1], effect: undefined }],
        },
        ...map.screens.slice(1),
      ],
    }),
  ).toThrow();
  expect(() =>
    parseFlowMap({
      ...map,
      screens: [
        {
          ...map.screens[0],
          transitions: [
            {
              ...map.screens[0]!.transitions[2],
              effect: { kind: 'navigation', description: 'No declarado' },
            },
          ],
        },
        ...map.screens.slice(1),
      ],
    }),
  ).toThrow();
  await expect(executeMappedTransition(map, document, 'unknown', options)).rejects.toThrow(
    'Unknown transition',
  );
  Object.defineProperty(document, 'URL', {
    configurable: true,
    value: 'https://foreign.test/tramite/inicio',
  });
  expect(() => recognizeMappedScreen(map, document)).toThrow('Foreign origin');
  Object.defineProperty(document, 'URL', { configurable: true, value: url.href });
  document.body.append(document.querySelector('#activity')!.cloneNode(true));
  expect(() => recognizeMappedScreen(map, document)).toThrow('Unknown or ambiguous screen');
});

it('accepts an exact root route and rejects two controls bound to one element', () => {
  Object.defineProperty(document, 'URL', { configurable: true, value: url.origin + '/' });
  const start = map.screens[0]!;
  const root = {
    ...map,
    screens: [{ ...start, path: '/' }, map.screens[1]!],
  };
  expect(recognizeMappedScreen(root, document)).toBe('start');
  const duplicate = {
    ...root,
    screens: [
      {
        ...root.screens[0],
        controls: [...start.controls, { ...start.controls[1]!, id: 'also-next' }],
      },
      root.screens[1],
    ],
  };
  expect(() => recognizeMappedScreen(duplicate, document)).toThrow('Ambiguous control binding');
});

it('rejects a foreign destination and two screens claiming the same DOM', () => {
  const extraScreen = {
    ...map.screens[0],
    id: 'duplicate',
    transitions: [],
  };
  expect(() =>
    recognizeMappedScreen({ ...map, screens: [...map.screens, extraScreen] }, document),
  ).toThrow('Unknown or ambiguous screen');
  document.body.innerHTML = '<a id="next" href="https://foreign.test/next">Continuar</a>';
  const linkMap = {
    ...map,
    screens: [
      {
        ...map.screens[0],
        controls: [
          { id: 'next', selector: '#next', label: 'Continuar', restrictions: { tag: 'a' } },
        ],
        transitions: [map.screens[0]!.transitions[1]],
      },
      map.screens[1],
    ],
  };
  expect(() => recognizeMappedScreen(linkMap, document)).toThrow('Unknown or ambiguous screen');
});

it('does not act when session value is missing or the DOM changes during an await', async () => {
  const field = document.querySelector('#activity') as HTMLInputElement;
  expect(
    await executeMappedTransition(map, document, 'fill-activity', {
      ...options,
      sessionValue: async () => undefined,
    }),
  ).toEqual({ status: 'paused' });
  expect(field.value).toBe('');
  await expect(
    executeMappedTransition(map, document, 'fill-activity', {
      ...options,
      sessionValue: async () => {
        field.remove();
        return 'VALOR_SINTETICO';
      },
    }),
  ).rejects.toThrow('Unknown or ambiguous screen');
  expect(field.value).toBe('');
});

it('requires the submission marker before clicking and rechecks after the callback', async () => {
  const click = vi.fn();
  document.querySelector('#send')!.addEventListener('click', click);
  document.querySelector('form')!.addEventListener('submit', (event) => event.preventDefault());
  expect(
    await executeMappedTransition(map, document, 'submit', {
      ...options,
      beforeSubmission: async () => false,
    }),
  ).toEqual({ status: 'paused' });
  expect(click).not.toHaveBeenCalled();
  expect(await executeMappedTransition(map, document, 'submit', options)).toEqual({
    status: 'acted',
    expectedScreen: 'done',
  });
  expect(options.beforeSubmission).toHaveBeenCalledWith(expect.stringMatching(/^[0-9a-f]{64}$/));
  expect(click).toHaveBeenCalledOnce();
  click.mockClear();
  const earlierId = options.beforeSubmission.mock.lastCall?.[0];
  await executeMappedTransition({ ...map, version: '1.0.1' }, document, 'submit', {
    ...options,
    beforeSubmission: async (effectId) => {
      expect(effectId).not.toBe(earlierId);
      return false;
    },
  });
  expect(click).not.toHaveBeenCalled();
  await expect(
    executeMappedTransition(map, document, 'submit', {
      ...options,
      beforeSubmission: async () => {
        Object.defineProperty(document, 'URL', {
          configurable: true,
          value: 'https://foreign.test/tramite/inicio',
        });
        return true;
      },
    }),
  ).rejects.toThrow('Foreign origin');
  expect(click).not.toHaveBeenCalled();
  Object.defineProperty(document, 'URL', { configurable: true, value: url.href });
  await expect(
    executeMappedTransition(map, document, 'submit', {
      ...options,
      beforeSubmission: async () => {
        document.querySelector('#send')!.remove();
        return true;
      },
    }),
  ).rejects.toThrow('Unknown or ambiguous screen');
  expect(click).not.toHaveBeenCalled();
});

it('treats a native input submitter as submission and rejects a foreign form action', async () => {
  document.querySelector('#send')!.outerHTML = '<input id="send" type="submit" value="Presentar">';
  const inputMap = {
    ...map,
    screens: [
      {
        ...map.screens[0],
        controls: map.screens[0]!.controls.map((control) =>
          control.id === 'send'
            ? { ...control, restrictions: { tag: 'input', type: 'submit' } }
            : control,
        ),
      },
      map.screens[1],
    ],
  };
  const click = vi.fn();
  document.querySelector('#send')!.addEventListener('click', click);
  expect(
    await executeMappedTransition(inputMap, document, 'submit', {
      ...options,
      beforeSubmission: async () => false,
    }),
  ).toEqual({ status: 'paused' });
  expect(click).not.toHaveBeenCalled();
  document.querySelector('form')!.setAttribute('action', 'https://foreign.test/submit');
  expect(() => recognizeMappedScreen(inputMap, document)).toThrow('Unknown or ambiguous screen');
});
