import { describe, expect, it } from 'vitest';
import { millisecondsToTicks, tuning } from '../../../src/content/tuning';
import { validateTuning } from '../../../src/content/validate';

describe('combat tuning', () => {
  it('accepts the provisional baseline and converts time with ceiling', () => {
    expect(() => validateTuning(tuning)).not.toThrow();
    expect(millisecondsToTicks(1)).toBe(1);
    expect(millisecondsToTicks(150)).toBe(9);
    expect(millisecondsToTicks(200)).toBe(12);
  });
  it('rejects nonfinite values, invalid bounds and incompatible attack pressure', () => {
    for (const change of [
      { cowHp: 0 }, { cowSpeed: Number.POSITIVE_INFINITY }, { attackRange: -1 },
      { attackDepthTolerance: Number.NaN }, { concurrentAttackers: 0 },
      { healFraction: 1.1 }, { meterPerHit: 101 }, { ticksPerSecond: 0 },
    ]) expect(() => validateTuning({ ...tuning, ...change })).toThrow();
    expect(() => millisecondsToTicks(-1)).toThrow();
    expect(() => millisecondsToTicks(Infinity)).toThrow();
  });
});
