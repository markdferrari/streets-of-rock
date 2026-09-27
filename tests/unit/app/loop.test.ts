import { describe, expect, it } from 'vitest';
import { FixedStepLoop } from '../../../src/app/loop';

describe('fixed-step scheduler', () => {
  it('steps at 60 Hz and caps a long frame to five steps', () => {
    let ticks = 0;
    const loop = new FixedStepLoop(() => ticks++);
    loop.frame(0, true);
    loop.frame(1000 / 30, true);
    expect(ticks).toBe(2);
    expect(loop.frame(1033, true)).toBe(5);
    expect(ticks).toBe(7);
    loop.frame(1050, true);
    expect(ticks).toBeLessThanOrEqual(8);
  });
  it('drops accumulator on pause so resumed play has no catch-up burst', () => {
    let ticks = 0;
    const loop = new FixedStepLoop(() => ticks++);
    loop.frame(0, true);
    loop.frame(5000, false);
    loop.frame(10_000, true);
    expect(ticks).toBe(0);
    loop.frame(10_017, true);
    expect(ticks).toBe(1);
    loop.reset();
    loop.frame(20_000, true);
    expect(ticks).toBe(1);
  });
});
