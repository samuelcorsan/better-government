import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const stored = new Map<string, unknown>();

beforeEach(() => {
  stored.clear();
  vi.stubGlobal('chrome', {
    storage: {
      session: {
        async get(key: string | null) {
          return Object.fromEntries(
            key === null ? stored : stored.has(key) ? [[key, stored.get(key)]] : [],
          );
        },
        async set(items: Record<string, unknown>) {
          for (const [key, value] of Object.entries(items)) stored.set(key, value);
        },
        async remove(keys: string[]) {
          for (const key of keys) stored.delete(key);
        },
      },
    },
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('session context', () => {
  it('shares only requested fields across extension contexts and isolates objectives', async () => {
    const { saveObjective, readObjective, cancelObjective, endPersonalSession } =
      await import('../apps/extension/src/session-context');
    await saveObjective('alta', {
      activity: 'ACTIVIDAD_SINTETICA',
      municipality: 'MUNICIPIO_SINTETICO',
      values: { fieldA: 'VALOR_A', fieldB: 'VALOR_B' },
    });
    await saveObjective('baja', { activity: 'OTRA_ACTIVIDAD' });
    stored.set('other-feature', 'leave-me');

    vi.resetModules(); // A new extension context reads the same Chrome session area.
    const { readObjective: readInAnotherTab } =
      await import('../apps/extension/src/session-context');
    expect(await readInAnotherTab('alta', { municipality: true, values: ['fieldA'] })).toEqual({
      municipality: 'MUNICIPIO_SINTETICO',
      values: { fieldA: 'VALOR_A' },
    });
    expect(await readInAnotherTab('baja', { activity: true, values: ['fieldA'] })).toEqual({
      activity: 'OTRA_ACTIVIDAD',
    });
    await cancelObjective('alta');
    expect(await readObjective('alta', { activity: true })).toEqual({});
    expect(await readObjective('baja', { activity: true })).toEqual({
      activity: 'OTRA_ACTIVIDAD',
    });
    await endPersonalSession();
    expect(await readObjective('baja', { activity: true })).toEqual({});
    expect(stored.get('other-feature')).toBe('leave-me');
    await expect(cancelObjective('alta:other')).rejects.toThrow('Invalid context ID');
  });

  it('keeps an uncertain submission blocked after a simulated worker restart', async () => {
    const { markSubmissionUncertain } = await import('../apps/extension/src/session-context');
    expect(await markSubmissionUncertain('alta', 'submit')).toBe(true);

    vi.resetModules();
    const {
      submissionState,
      markSubmissionUncertain: retry,
      confirmSubmission,
      cancelObjective,
    } = await import('../apps/extension/src/session-context');
    expect(await submissionState('alta', 'submit')).toBe('uncertain');
    expect(await retry('alta', 'submit')).toBe(false);
    await confirmSubmission('alta', 'submit');
    expect(await submissionState('alta', 'submit')).toBe('confirmed');
    expect(await retry('alta', 'submit')).toBe(false);

    await cancelObjective('alta');
    expect(await submissionState('alta', 'submit')).toBeUndefined();
    await retry('alta', 'submit');
    stored.clear(); // Chrome clears storage.session on browser/extension restart.
    expect(await submissionState('alta', 'submit')).toBeUndefined();
  });
});
