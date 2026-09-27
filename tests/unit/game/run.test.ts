import { describe, expect, it } from 'vitest';
import { allocateAttackId, allocateEntityId, createRun } from '../../../src/game/run';

describe('fresh run', () => {
  it('starts two living allies and fresh encounter resources', () => {
    const run = createRun(42);
    expect(run.runId).toBe(42);
    expect(run.tick).toBe(0);
    expect(run.actors.map(actor => actor.role)).toEqual(['cow', 'crow']);
    expect(run.actors.every(actor => actor.hp === actor.maxHp)).toBe(true);
    expect(run.actors[0]).toMatchObject({ specialMeter: 0 });
    expect(run.attacks).toEqual([]);
    expect(run.projectiles).toEqual([]);
    expect(run.pickups).toEqual([]);
    expect(run.result).toBeNull();
    run.actors[0]!.hp = 1;
    expect(createRun(43).actors[0]!.hp).toBe(500);
  });

  it('allocates monotonically increasing entity and attack IDs', () => {
    const run = createRun(1);
    expect(run.actors.map(actor => actor.id)).toEqual([1, 2]);
    expect([allocateEntityId(run), allocateEntityId(run)]).toEqual([3, 4]);
    expect([allocateAttackId(run), allocateAttackId(run)]).toEqual([1, 2]);
  });
});
