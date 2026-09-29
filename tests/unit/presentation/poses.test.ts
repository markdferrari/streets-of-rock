import { describe, expect, it } from 'vitest';
import { actorPose } from '../../../src/presentation/actors';

describe('readable action poses', () => {
  it('distinguishes idle, warning, strike and knockout silhouettes', () => {
    expect(actorPose('idle').lean).toBe(0);
    expect(actorPose('windup').lean).toBeLessThan(0);
    expect(actorPose('active').lean).toBeGreaterThan(0);
    expect(actorPose('knockedOut').heightScale).toBeLessThan(1);
  });
  it('makes Heavy windup and impact visibly different from Light', () => {
    expect(actorPose('windup', 'heavy').lean).toBeLessThan(actorPose('windup', 'light1').lean);
    expect(actorPose('active', 'heavy').lean).toBeGreaterThan(actorPose('active', 'light1').lean);
  });
});
