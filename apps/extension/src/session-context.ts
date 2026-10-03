/** Use only from extension-owned pages or workers, never from portal content scripts.
 * Chrome's storage.session stays in memory and excludes content scripts by default.
 */
const prefix = 'personal-context:';

export type ObjectiveContext = {
  activity?: string;
  municipality?: string;
  values?: Record<string, string>;
};

export type ContextSelection = {
  activity?: boolean;
  municipality?: boolean;
  values?: readonly string[];
};

function validId(id: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,63}$/.test(id)) throw new Error('Invalid context ID');
  return id;
}

function contextKey(objective: string): string {
  return `${prefix}${validId(objective)}:context`;
}

function effectKey(objective: string, effect: string): string {
  return `${prefix}${validId(objective)}:effect:${validId(effect)}`;
}

/** Replace one objective's values; callers must not pass credentials or portal tokens. */
export async function saveObjective(objective: string, context: ObjectiveContext): Promise<void> {
  await chrome.storage.session.set({ [contextKey(objective)]: context });
}

/** Return only the fields needed by the current step, never the whole profile. */
export async function readObjective(
  objective: string,
  selection: ContextSelection,
): Promise<ObjectiveContext> {
  const storageKey = contextKey(objective);
  const saved = (await chrome.storage.session.get(storageKey))[storageKey] as
    ObjectiveContext | undefined;
  if (!saved) return {};
  const result: ObjectiveContext = {};
  if (selection.activity && saved.activity !== undefined) result.activity = saved.activity;
  if (selection.municipality && saved.municipality !== undefined)
    result.municipality = saved.municipality;
  if (selection.values?.length) {
    const entries: [string, string][] = [];
    for (const field of selection.values) {
      if (!saved.values || !Object.hasOwn(saved.values, field)) continue;
      const value = saved.values[field];
      if (value !== undefined) entries.push([field, value]);
    }
    if (entries.length) result.values = Object.fromEntries(entries);
  }
  return result;
}

/** Write before the official click. The executor must serialize each objective: storage has no CAS.
 * After interruption, only observation of the official result can resolve the marker.
 */
export async function markSubmissionUncertain(objective: string, effect: string): Promise<boolean> {
  const storageKey = effectKey(objective, effect);
  if ((await chrome.storage.session.get(storageKey))[storageKey] !== undefined) return false;
  await chrome.storage.session.set({ [storageKey]: 'uncertain' });
  return true;
}

export async function submissionState(
  objective: string,
  effect: string,
): Promise<'uncertain' | 'confirmed' | undefined> {
  const storageKey = effectKey(objective, effect);
  return (await chrome.storage.session.get(storageKey))[storageKey] as
    'uncertain' | 'confirmed' | undefined;
}

/** Call only after observing the official outcome; neither state authorizes a retry. */
export async function confirmSubmission(objective: string, effect: string): Promise<void> {
  const storageKey = effectKey(objective, effect);
  if ((await chrome.storage.session.get(storageKey))[storageKey] !== 'uncertain')
    throw new Error('No uncertain submission to confirm');
  await chrome.storage.session.set({ [storageKey]: 'confirmed' });
}

async function clearMatching(prefixToClear: string): Promise<void> {
  const stored = await chrome.storage.session.get(null);
  const keys = Object.keys(stored).filter((name) => name.startsWith(prefixToClear));
  if (keys.length) await chrome.storage.session.remove(keys);
}

/** Cancelling an objective removes its values and effect markers, leaving other objectives intact. */
export async function cancelObjective(objective: string): Promise<void> {
  await clearMatching(`${prefix}${validId(objective)}:`);
}

/** Explicit end of product session. Chrome also clears storage.session on browser/extension restart. */
export async function endPersonalSession(): Promise<void> {
  await clearMatching(prefix);
}
