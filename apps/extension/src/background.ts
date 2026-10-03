import {
  cancelObjective,
  confirmSubmission,
  endPersonalSession,
  markSubmissionUncertain,
  readObjective,
  saveObjective,
  submissionState,
  type ContextSelection,
  type ObjectiveContext,
} from './session-context';

const ready = chrome.storage.session.setAccessLevel({ accessLevel: 'TRUSTED_CONTEXTS' });

// ponytail: one queue serializes the small session workload; split by objective if it becomes busy.
let pending: Promise<unknown> = Promise.resolve();
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation);
  pending = result.catch(() => undefined);
  return result;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid request');
  return value;
}

function context(value: unknown): ObjectiveContext {
  if (!record(value)) throw new Error('Invalid context');
  const { activity, municipality, values } = value;
  if (
    (activity !== undefined && typeof activity !== 'string') ||
    (municipality !== undefined && typeof municipality !== 'string') ||
    (values !== undefined &&
      (!record(values) || Object.values(values).some((field) => typeof field !== 'string')))
  )
    throw new Error('Invalid context');
  return {
    ...(activity !== undefined ? { activity } : {}),
    ...(municipality !== undefined ? { municipality } : {}),
    ...(values !== undefined ? { values: values as Record<string, string> } : {}),
  };
}

function selection(value: unknown): ContextSelection {
  if (!record(value)) throw new Error('Invalid selection');
  const { activity, municipality, values } = value;
  if (
    (activity !== undefined && typeof activity !== 'boolean') ||
    (municipality !== undefined && typeof municipality !== 'boolean') ||
    (values !== undefined &&
      (!Array.isArray(values) || values.some((field) => typeof field !== 'string')))
  )
    throw new Error('Invalid selection');
  return {
    ...(activity !== undefined ? { activity } : {}),
    ...(municipality !== undefined ? { municipality } : {}),
    ...(values !== undefined ? { values: values as string[] } : {}),
  };
}

async function handle(message: unknown): Promise<unknown> {
  if (!record(message)) throw new Error('Invalid request');
  switch (message.type) {
    case 'session:save':
      return saveObjective(string(message.objective), context(message.context));
    case 'session:read':
      return readObjective(string(message.objective), selection(message.selection));
    case 'session:mark-submission':
      return markSubmissionUncertain(string(message.objective), string(message.effect));
    case 'session:submission-state':
      return submissionState(string(message.objective), string(message.effect));
    case 'session:confirm-submission':
      return confirmSubmission(string(message.objective), string(message.effect));
    case 'session:cancel':
      return cancelObjective(string(message.objective));
    case 'session:end':
      return endPersonalSession();
    default:
      throw new Error('Unknown request');
  }
}

chrome.runtime.onMessage.addListener((message: unknown, sender, sendResponse) => {
  // Content scripts carry the official page URL; only extension-owned pages may use this API.
  if (sender.id !== chrome.runtime.id || !sender.url?.startsWith(chrome.runtime.getURL(''))) return;
  void serialize(async () => {
    await ready;
    return handle(message);
  }).then(
    (value) => sendResponse({ ok: true, value }),
    () => sendResponse({ ok: false }),
  );
  return true;
});
