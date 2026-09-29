import { afterEach, describe, expect, it, vi } from 'vitest';
import { AudioController } from '../../../src/platform/audio';
import { DEFAULT_SETTINGS } from '../../../src/platform/settings';

function fixture(rejectPlay = false) {
  const media = { volume: 0, muted: false, loop: false, paused: true,
    play: vi.fn().mockImplementation(() => rejectPlay ? Promise.reject(new Error('denied')) : Promise.resolve()),
    pause: vi.fn(),
  };
  const controller = new AudioController('/music.wav', DEFAULT_SETTINGS, () => media as unknown as HTMLAudioElement, () => null);
  return { media, controller };
}

describe('optional game audio', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('tries unlock synchronously and stays silent until run launch', async () => {
    const { media, controller } = fixture();
    controller.unlock();
    expect(media.play).toHaveBeenCalledTimes(1);
    expect(media.volume).toBe(0);
    await Promise.resolve();
    expect(media.pause).toHaveBeenCalledTimes(1);
    controller.startRun();
    expect(media.volume).toBe(.7);
    expect(media.play).toHaveBeenCalledTimes(2);
    controller.pause();
    expect(media.pause).toHaveBeenCalledTimes(2);
    controller.startRun();
    expect(media.play).toHaveBeenCalledTimes(3);
    expect(controller.musicInstanceCount).toBe(1);
  });

  it('keeps music and effects volumes independent and swallows denied playback', async () => {
    const { media, controller } = fixture(true);
    expect(() => controller.unlock()).not.toThrow();
    await Promise.resolve();
    expect(() => controller.startRun()).not.toThrow();
    controller.setSettings({ ...DEFAULT_SETTINGS, musicVolume: 0, effectsVolume: .3 });
    expect(media.volume).toBe(0);
    expect(controller.effectsVolume).toBe(.3);
    expect(() => controller.effect('hit')).not.toThrow();
  });
  it('loads bundled local effect samples and plays one through the independent gain', async () => {
    const fetched: string[] = [];
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      fetched.push(url);
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    }));
    const source = { buffer: null, connect: vi.fn().mockReturnThis(), start: vi.fn() };
    const gain = { gain: { value: 0 }, connect: vi.fn().mockReturnThis() };
    const context = { resume: vi.fn().mockResolvedValue(undefined), decodeAudioData: vi.fn().mockResolvedValue({}),
      createBufferSource: vi.fn(() => source), createGain: vi.fn(() => gain), destination: {}, currentTime: 0 };
    const media = { volume: 0, loop: false, play: vi.fn().mockResolvedValue(undefined), pause: vi.fn() };
    const controller = new AudioController('/music.wav', DEFAULT_SETTINGS,
      () => media as unknown as HTMLAudioElement, () => context as unknown as AudioContext);
    controller.unlock();
    controller.startRun();
    await vi.waitFor(() => expect(fetched).toContain('/assets/audio/sfx-hit.wav'));
    await vi.waitFor(() => { controller.effect('hit'); expect(source.start).toHaveBeenCalled(); });
    expect(gain.gain.value).toBe(.8);
  });
});
