import { describe, expect, it } from 'vitest';
import { ActiveClock } from '../../../src/app/clock';

describe('active wall clock', () => {
  it('counts active wall time and excludes all paused intervals', () => {
    let now = 100;
    const clock = new ActiveClock(() => now);
    clock.start();
    now = 600;
    expect(clock.elapsedMs()).toBe(500);
    clock.pause();
    now = 1600;
    expect(clock.elapsedMs()).toBe(500);
    clock.start();
    now = 1700;
    expect(clock.elapsedMs()).toBe(600);
    clock.reset();
    expect(clock.elapsedMs()).toBe(0);
  });
  it('does not double count repeated starts and pauses', () => {
    let now = 0;
    const clock = new ActiveClock(() => now);
    clock.start(); clock.start();
    now = 100;
    clock.pause(); clock.pause();
    expect(clock.elapsedMs()).toBe(100);
  });
});
