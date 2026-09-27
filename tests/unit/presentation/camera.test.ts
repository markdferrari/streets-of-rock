import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { cameraCenterX } from '../../../src/presentation/camera';

describe('level camera', () => {
  it('holds an active arena and follows a cleared transition', () => {
    const run = fixtureRun();
    run.encounter.status = 'active';
    expect(cameraCenterX(run)).toBe(8);
    run.encounter.status = 'cleared';
    run.actors[0]!.position.x = 17;
    expect(cameraCenterX(run)).toBeGreaterThan(8);
    run.areaIndex = 1;
    run.encounter.status = 'active';
    expect(cameraCenterX(run)).toBe(26);
  });
});
