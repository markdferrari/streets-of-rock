import { describe, expect, it } from 'vitest';
import { EntryCountdown } from '../../../src/app/countdown';

describe('entry countdown', () => {
  it('shows each numeral for a full active second and completes once', () => {
    let now = 0;
    const clock = new EntryCountdown(() => now);
    expect(clock.snapshot()).toEqual({ number: 3, numberElapsedMs: 0, paused: false, completed: false });
    now = 999; expect(clock.frame()).toBe(false); expect(clock.snapshot().number).toBe(3);
    now = 1000; expect(clock.frame()).toBe(true); expect(clock.snapshot().number).toBe(2);
    now = 2000; expect(clock.frame()).toBe(true); expect(clock.snapshot().number).toBe(1);
    now = 3000; expect(clock.frame()).toBe(true); expect(clock.snapshot().completed).toBe(true);
    now = 4000; expect(clock.frame()).toBe(false);
  });

  it('retains 400 ms of every numeral across a long interruption', () => {
    for (const number of [3, 2, 1] as const) {
      let now = 0;
      const clock = new EntryCountdown(() => now);
      for (let current = 3; current > number; current--) { now += 1000; clock.frame(); }
      now += 400; clock.pause();
      expect(clock.snapshot()).toMatchObject({ number, numberElapsedMs: 400, paused: true });
      now += 30000; expect(clock.frame()).toBe(false);
      clock.resume();
      now += 599; expect(clock.frame()).toBe(false);
      now += 1; expect(clock.frame()).toBe(true);
      expect(clock.snapshot().number).toBe(number === 1 ? null : number - 1);
    }
  });

  it('does not skip numerals after a foreground frame stall', () => {
    let now = 0;
    const clock = new EntryCountdown(() => now);
    now = 2500; clock.frame();
    expect(clock.snapshot()).toMatchObject({ number: 2, numberElapsedMs: 0 });
    now = 2600; clock.frame();
    expect(clock.snapshot()).toMatchObject({ number: 2, numberElapsedMs: 100 });
  });
});
