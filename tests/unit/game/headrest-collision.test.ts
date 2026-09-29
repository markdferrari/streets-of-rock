import { describe, expect, it } from 'vitest';
import { segmentCircleEntryFraction, sweptCircleContact } from '../../../src/game/collision';

describe('segment-circle entry fraction', () => {
  it('returns first crossing, tangency, and initial overlap fractions', () => {
    expect(segmentCircleEntryFraction({ x: 0, depth: 0 }, { x: 4, depth: 0 }, { x: 2, depth: 0 }, .5)).toBeCloseTo(.375);
    expect(segmentCircleEntryFraction({ x: 0, depth: .5 }, { x: 4, depth: .5 }, { x: 2, depth: 0 }, .5)).toBeCloseTo(.5);
    expect(segmentCircleEntryFraction({ x: 1.8, depth: 0 }, { x: 4, depth: 0 }, { x: 2, depth: 0 }, .5)).toBe(0);
  });
  it('returns null for misses and invalid segments without changing the boolean wrapper', () => {
    expect(segmentCircleEntryFraction({ x: 0, depth: 2 }, { x: 4, depth: 2 }, { x: 2, depth: 0 }, .5)).toBeNull();
    expect(segmentCircleEntryFraction({ x: 0, depth: 0 }, { x: Number.NaN, depth: 0 }, { x: 2, depth: 0 }, .5)).toBeNull();
    expect(sweptCircleContact({ x: 0, depth: 0 }, { x: 4, depth: 0 }, { x: 2, depth: 0 }, .5)).toBe(true);
  });
});
