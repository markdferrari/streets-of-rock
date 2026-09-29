export interface Settings {
  readonly schemaVersion: 1;
  readonly musicVolume: number;
  readonly effectsVolume: number;
  readonly screenShake: boolean;
}

export const DEFAULT_SETTINGS: Settings = Object.freeze({
  schemaVersion: 1, musicVolume: .7, effectsVolume: .8, screenShake: true,
});
const KEY = 'sor.settings.v1';

function volume(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;
}

export class SettingsStore {
  private current: Settings = DEFAULT_SETTINGS;
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null) {}

  read(): Settings {
    try {
      const raw = this.storage?.getItem(KEY);
      if (!raw) return this.current;
      const value = JSON.parse(raw) as Record<string, unknown>;
      if (value?.schemaVersion !== 1) return this.current = DEFAULT_SETTINGS;
      this.current = Object.freeze({
        schemaVersion: 1,
        musicVolume: volume(value.musicVolume, DEFAULT_SETTINGS.musicVolume),
        effectsVolume: volume(value.effectsVolume, DEFAULT_SETTINGS.effectsVolume),
        screenShake: typeof value.screenShake === 'boolean' ? value.screenShake : DEFAULT_SETTINGS.screenShake,
      });
    } catch { /* Storage may be denied; retain playable in-memory preferences. */ }
    return this.current;
  }

  write(change: Partial<Omit<Settings, 'schemaVersion'>>): Settings {
    this.current = Object.freeze({
      schemaVersion: 1,
      musicVolume: volume(change.musicVolume, this.current.musicVolume),
      effectsVolume: volume(change.effectsVolume, this.current.effectsVolume),
      screenShake: typeof change.screenShake === 'boolean' ? change.screenShake : this.current.screenShake,
    });
    try { this.storage?.setItem(KEY, JSON.stringify(this.current)); } catch { /* Keep memory value. */ }
    return this.current;
  }
}
