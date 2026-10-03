import {
  DomBridge,
  fieldByLabel,
  isBindableAction,
  isBindableField,
  isVisible,
  normalizedLabel,
  textOf,
  uniqueElement,
  type FieldElement,
} from '@reforma-digital/bridge';

export type FlowMap = {
  schemaVersion: 1;
  version: string;
  origin: string;
  screens: {
    id: string;
    path: string;
    label: string;
    controls: {
      id: string;
      selector: string;
      label: string;
      restrictions: { tag: 'input' | 'textarea' | 'select' | 'button' | 'a'; type?: string };
    }[];
    transitions: {
      id: string;
      control: string;
      operation: 'fill' | 'click';
      valueRef?: { scope: 'session'; key: string };
      to: string;
      effect: { kind: 'field-change' | 'navigation' | 'submission'; description: string };
    }[];
  }[];
};

function object(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).every((key) => keys.includes(key))
  );
}

function id(value: unknown): value is string {
  return typeof value === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(value);
}

function nonempty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 200;
}

function unique(ids: string[]): boolean {
  return new Set(ids).size === ids.length;
}

/** Public maps are data only: every object has an exact set of allowed keys. */
export function parseFlowMap(raw: unknown): FlowMap {
  if (!object(raw, ['schemaVersion', 'version', 'origin', 'screens']))
    throw new Error('Invalid map');
  if (
    raw.schemaVersion !== 1 ||
    typeof raw.version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(raw.version)
  )
    throw new Error('Unsupported map version');
  if (typeof raw.origin !== 'string') throw new Error('Invalid map origin');
  let origin: URL;
  try {
    origin = new URL(raw.origin);
  } catch {
    throw new Error('Invalid map origin');
  }
  if (
    origin.protocol !== 'https:' ||
    origin.origin !== raw.origin ||
    !Array.isArray(raw.screens) ||
    !raw.screens.length
  )
    throw new Error('Invalid map origin or screens');

  const screenIds: string[] = [];
  const allTransitionIds: string[] = [];
  for (const screen of raw.screens) {
    if (!object(screen, ['id', 'path', 'label', 'controls', 'transitions']))
      throw new Error('Invalid screen');
    if (
      !id(screen.id) ||
      typeof screen.path !== 'string' ||
      !/^\/(?!\/)[^?#*]*$/.test(screen.path) ||
      !nonempty(screen.label) ||
      !Array.isArray(screen.controls) ||
      !screen.controls.length ||
      !Array.isArray(screen.transitions)
    )
      throw new Error('Invalid screen');
    screenIds.push(screen.id);
    const controlIds: string[] = [];
    for (const control of screen.controls) {
      if (!object(control, ['id', 'selector', 'label', 'restrictions']))
        throw new Error('Invalid control');
      if (
        !id(control.id) ||
        !nonempty(control.selector) ||
        !nonempty(control.label) ||
        !object(control.restrictions, ['tag', 'type'])
      )
        throw new Error('Invalid control');
      const { tag, type } = control.restrictions;
      if (
        !['input', 'textarea', 'select', 'button', 'a'].includes(String(tag)) ||
        (tag === 'input'
          ? !['text', 'email', 'tel', 'url', 'search', 'button', 'submit'].includes(String(type))
          : tag === 'button'
            ? !['button', 'submit'].includes(String(type))
            : type !== undefined)
      )
        throw new Error('Invalid control restrictions');
      controlIds.push(control.id);
    }
    if (!unique(controlIds)) throw new Error('Duplicate control');
    for (const transition of screen.transitions) {
      if (
        !object(transition, ['id', 'control', 'operation', 'valueRef', 'to', 'effect']) ||
        !id(transition.id) ||
        !controlIds.includes(String(transition.control)) ||
        !id(transition.to) ||
        !object(transition.effect, ['kind', 'description']) ||
        !nonempty(transition.effect.description)
      )
        throw new Error('Invalid transition');
      const control = screen.controls.find(
        (item: FlowMap['screens'][number]['controls'][number]) => item.id === transition.control,
      );
      const field =
        control?.restrictions.tag === 'textarea' ||
        control?.restrictions.tag === 'select' ||
        (control?.restrictions.tag === 'input' &&
          !['button', 'submit'].includes(control.restrictions.type ?? ''));
      if (transition.operation === 'fill') {
        if (
          !field ||
          transition.effect.kind !== 'field-change' ||
          transition.to !== screen.id ||
          !object(transition.valueRef, ['scope', 'key']) ||
          transition.valueRef.scope !== 'session' ||
          !id(transition.valueRef.key)
        )
          throw new Error('Invalid fill transition');
      } else if (transition.operation === 'click') {
        if (
          field ||
          transition.valueRef !== undefined ||
          !['navigation', 'submission'].includes(String(transition.effect.kind))
        )
          throw new Error('Invalid click transition');
        if (control?.restrictions.type === 'submit' && transition.effect.kind !== 'submission')
          throw new Error('Submitters require a submission effect');
      } else throw new Error('Unknown operation');
      allTransitionIds.push(transition.id);
    }
  }
  if (
    !unique(screenIds) ||
    !unique(allTransitionIds) ||
    raw.screens.some((screen: FlowMap['screens'][number]) =>
      screen.transitions.some((transition) => !screenIds.includes(transition.to)),
    )
  )
    throw new Error('Unknown transition target');
  return structuredClone(raw) as FlowMap;
}

function resolveScreen(
  map: FlowMap,
  document: Document,
): { screen: FlowMap['screens'][number]; elements: Map<string, HTMLElement> } {
  const url = new URL(document.URL);
  if (url.protocol !== 'https:' || url.origin !== map.origin || url.username || url.password)
    throw new Error('Foreign origin');
  const matches: { screen: FlowMap['screens'][number]; elements: Map<string, HTMLElement> }[] = [];
  for (const screen of map.screens.filter((item) => item.path === url.pathname)) {
    const elements = new Map<string, HTMLElement>();
    const used = new Set<HTMLElement>();
    for (const control of screen.controls) {
      const element = uniqueElement(
        document,
        control.selector,
        (item): item is HTMLElement => item instanceof HTMLElement,
      );
      if (
        !(element instanceof HTMLElement) ||
        element.tagName.toLowerCase() !== control.restrictions.tag ||
        (control.restrictions.type &&
          !(
            (element instanceof HTMLInputElement || element instanceof HTMLButtonElement) &&
            element.type === control.restrictions.type
          )) ||
        !isVisible(element) ||
        element.matches(':disabled') ||
        element.getAttribute('aria-disabled') === 'true'
      )
        break;
      if (used.has(element)) throw new Error('Ambiguous control binding');
      if (isBindableField(element)) {
        if (
          fieldByLabel(document, control.label) !== element ||
          ('readOnly' in element && element.readOnly)
        )
          break;
      } else if (
        !isBindableAction(element) ||
        normalizedLabel(
          element.getAttribute('aria-label') ??
            (element instanceof HTMLInputElement ? element.value : textOf(element)),
        ) !== normalizedLabel(control.label)
      )
        break;
      if (
        element instanceof HTMLAnchorElement &&
        (!element.hasAttribute('href') || new URL(element.href).origin !== map.origin)
      )
        break;
      if (
        (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) &&
        element.form &&
        ['submit', 'image'].includes(element.type) &&
        new URL(element.formAction || element.form.action, url).origin !== map.origin
      )
        break;
      elements.set(control.id, element);
      used.add(element);
    }
    if (elements.size === screen.controls.length) matches.push({ screen, elements });
  }
  if (matches.length !== 1) throw new Error('Unknown or ambiguous screen');
  return matches[0]!;
}

/** Recognition proves structure only. It does not verify the portal's later behavior or effect. */
export function recognizeMappedScreen(rawMap: unknown, document: Document): string {
  return resolveScreen(parseFlowMap(rawMap), document).screen.id;
}

async function submissionEffectId(
  map: FlowMap,
  screen: string,
  transition: string,
): Promise<string> {
  const bytes = new TextEncoder().encode(
    JSON.stringify([map.origin, map.version, screen, transition]),
  );
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/** Acts only on a recognized screen. The caller must observe the resulting official state. */
export async function executeMappedTransition(
  rawMap: unknown,
  document: Document,
  transitionId: string,
  options: {
    sessionValue: (key: string) => Promise<string | undefined>;
    beforeSubmission: (id: string) => Promise<boolean>;
  },
): Promise<{ status: 'paused' | 'acted'; expectedScreen?: string }> {
  const map = parseFlowMap(rawMap);
  const { screen, elements } = resolveScreen(map, document);
  const transition = screen.transitions.find((item) => item.id === transitionId);
  if (!transition) throw new Error('Unknown transition');
  const control = screen.controls.find((item) => item.id === transition.control)!;
  const element = elements.get(control.id)!;
  const stillRecognized = () => {
    const current = resolveScreen(map, document);
    return current.screen.id === screen.id && current.elements.get(control.id) === element;
  };
  if (transition.operation === 'fill') {
    const value = await options.sessionValue(transition.valueRef!.key);
    if (value === undefined) return { status: 'paused' };
    if (!stillRecognized()) return { status: 'paused' };
    const bridge = new DomBridge({
      [control.id]: { element: element as FieldElement, label: control.label },
    });
    try {
      if (!bridge.setValue(control.id, value)) return { status: 'paused' };
    } finally {
      bridge.dispose();
    }
  } else {
    if (
      transition.effect.kind === 'submission' &&
      !(await options.beforeSubmission(await submissionEffectId(map, screen.id, transition.id)))
    )
      return { status: 'paused' };
    if (!stillRecognized()) return { status: 'paused' };
    const bridge = new DomBridge({}, { [control.id]: { element, label: control.label } });
    try {
      if (!bridge.activate(control.id)) return { status: 'paused' };
    } finally {
      bridge.dispose();
    }
  }
  return { status: 'acted', expectedScreen: transition.to };
}
