import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, SettingsStore } from '../../../src/platform/settings';

describe('settings storage', () => {
  it('uses versioned defaults and validates each stored field separately', () => {
    const storage = new Map<string, string>();
    const fake = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => { storage.set(key, value); },
    } as Storage;
    const settings = new SettingsStore(fake);
    expect(settings.read()).toEqual(DEFAULT_SETTINGS);
    storage.set('sor.settings.v1', JSON.stringify({ schemaVersion: 1, musicVolume: .2, effectsVolume: 8, screenShake: false }));
    expect(settings.read()).toEqual({ schemaVersion: 1, musicVolume: .2, effectsVolume: .8, screenShake: false });
    settings.write({ musicVolume: 0, effectsVolume: 1, screenShake: true });
    expect(JSON.parse(storage.get('sor.settings.v1')!)).toEqual({ schemaVersion: 1, musicVolume: 0, effectsVolume: 1, screenShake: true });
    storage.set('sor.settings.v1', JSON.stringify({ schemaVersion: 2, musicVolume: .1 }));
    expect(settings.read()).toEqual(DEFAULT_SETTINGS);
  });

  it('continues with defaults when storage is denied or contains malformed JSON', () => {
    const denied = { getItem: () => { throw new Error('denied'); }, setItem: () => { throw new Error('denied'); } } as unknown as Storage;
    const settings = new SettingsStore(denied);
    expect(settings.read()).toEqual(DEFAULT_SETTINGS);
    expect(() => settings.write({ musicVolume: .4 })).not.toThrow();
    expect(settings.read().musicVolume).toBe(.4);
    const malformed = { getItem: () => '{', setItem: () => {} } as unknown as Storage;
    expect(new SettingsStore(malformed).read()).toEqual(DEFAULT_SETTINGS);
  });
});
