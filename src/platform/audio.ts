import type { Settings } from './settings';

export type SoundEffect = 'attack' | 'hit' | 'damage' | 'pickup' | 'result';
const EFFECT_TONE: Record<SoundEffect, number> = {
  attack: 330, hit: 180, damage: 110, pickup: 660, result: 440,
};

export class AudioController {
  private music: HTMLAudioElement | null = null;
  private context: AudioContext | null = null;
  private readonly buffers: Partial<Record<SoundEffect, AudioBuffer>> = {};
  private effectsLoading = false;
  private running = false;
  private preferences: Settings;

  constructor(
    private readonly musicUrl: string,
    settings: Settings,
    private readonly makeMusic: (url: string) => HTMLAudioElement = url => new Audio(url),
    private readonly makeContext: () => AudioContext | null = () => typeof AudioContext === 'undefined' ? null : new AudioContext(),
  ) { this.preferences = settings; }

  get musicInstanceCount(): number { return this.music ? 1 : 0; }
  get effectsVolume(): number { return this.preferences.effectsVolume; }

  private media(): HTMLAudioElement {
    if (!this.music) {
      this.music = this.makeMusic(this.musicUrl);
      this.music.loop = true;
      this.music.volume = 0;
    }
    return this.music;
  }

  unlock(): void {
    const media = this.media();
    media.volume = 0;
    try {
      const result = media.play();
      void Promise.resolve(result).then(() => { if (!this.running) media.pause(); }).catch(() => {});
    } catch { /* Playback permission is optional. */ }
    try {
      this.context ??= this.makeContext();
      void this.context?.resume().catch(() => {});
      this.loadEffects();
    } catch { /* Effects are optional. */ }
  }

  private loadEffects(): void {
    if (!this.context || this.effectsLoading) return;
    this.effectsLoading = true;
    const context = this.context;
    for (const name of Object.keys(EFFECT_TONE) as SoundEffect[]) {
      void fetch(`/assets/audio/sfx-${name}.wav`).then(response => {
        if (!response.ok) throw new Error(`Effect ${name} unavailable`);
        return response.arrayBuffer();
      }).then(data => context.decodeAudioData(data)).then(buffer => {
        if (this.context === context) this.buffers[name] = buffer;
      }).catch(() => {});
    }
  }

  startRun(): void {
    if (this.running) return;
    this.running = true;
    const media = this.media();
    media.volume = this.preferences.musicVolume;
    try { void Promise.resolve(media.play()).catch(() => {}); } catch { /* Silent play remains playable. */ }
  }

  pause(): void {
    this.running = false;
    try { this.music?.pause(); } catch { /* Ignore unavailable media. */ }
  }

  setSettings(settings: Settings): void {
    this.preferences = settings;
    if (this.music) this.music.volume = this.running ? settings.musicVolume : 0;
  }

  effect(name: SoundEffect): void {
    if (!this.running || !this.context || this.preferences.effectsVolume <= 0) return;
    try {
      const buffer = this.buffers[name];
      if (buffer) {
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        source.buffer = buffer;
        gain.gain.value = this.preferences.effectsVolume;
        source.connect(gain).connect(this.context.destination);
        source.start();
        return;
      }
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = EFFECT_TONE[name];
      gain.gain.setValueAtTime(this.preferences.effectsVolume * .12, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, this.context.currentTime + .12);
      oscillator.connect(gain).connect(this.context.destination);
      oscillator.start();
      oscillator.stop(this.context.currentTime + .12);
    } catch { /* An effects failure cannot interrupt gameplay. */ }
  }

  dispose(): void {
    this.pause();
    try { void this.context?.close().catch(() => {}); } catch { /* Ignore unavailable context. */ }
    this.context = null;
  }
}
