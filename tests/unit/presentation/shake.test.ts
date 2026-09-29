import { describe, expect, it } from 'vitest';
import { cameraShakeOffset } from '../../../src/presentation/shake';

describe('optional hit shake', () => {
  it('stays off when disabled or reduced motion and decays after impact', () => {
    expect(cameraShakeOffset(40, false)).toBe(0);
    expect(cameraShakeOffset(40, true, true)).toBe(0);
    expect(cameraShakeOffset(0, true)).toBe(0);
    expect(Math.abs(cameraShakeOffset(40, true))).toBeGreaterThan(0);
    expect(Math.abs(cameraShakeOffset(40, true))).toBeLessThan(.2);
    expect(cameraShakeOffset(200, true)).toBe(0);
  });
});
