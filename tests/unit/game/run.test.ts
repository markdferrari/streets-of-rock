import { describe, expect, it } from 'vitest';
import { allocateAttackId, allocateEntityId, createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';

describe('fresh run', () => {
  it('rejects a missing duo instead of silently constructing a default', () => {
    expect(() => createRun(1, undefined as never)).toThrow();
  });
  it('starts two living allies and fresh encounter resources', () => {
    const run = createRun(42, { fighterId: 'cow', partnerId: 'crow' });
    expect(run.runId).toBe(42);
    expect(run.tick).toBe(0);
    expect(run.actors.map(actor => actor.role)).toEqual(['player', 'partner']);
    expect(run.actors.every(actor => actor.hp === actor.maxHp)).toBe(true);
    expect(run.actors[0]).toMatchObject({ specialMeter: 0 });
    expect(run.attacks).toEqual([]);
    expect(run.projectiles).toEqual([]);
    expect(run.pickups).toEqual([]);
    expect(run.result).toBeNull();
    run.actors[0]!.hp = 1;
    expect(createRun(43, { fighterId: 'cow', partnerId: 'crow' }).actors[0]!.hp).toBe(500);
  });

  it('allocates monotonically increasing entity and attack IDs', () => {
    const run = createRun(1, { fighterId: 'cow', partnerId: 'crow' });
    expect(run.actors.map(actor => actor.id)).toEqual([1, 2]);
    expect([allocateEntityId(run), allocateEntityId(run)]).toEqual([3, 4]);
    expect([allocateAttackId(run), allocateAttackId(run)]).toEqual([1, 2]);
  });

  it('constructs both valid duos with identity separate from player and partner role', () => {
    for (const [fighterId, partnerId, health] of [['cow', 'crow', 500], ['crow', 'cow', 240]] as const) {
      const run = createRun(9, { fighterId, partnerId });
      expect(run.duo).toEqual({ fighterId, partnerId });
      expect(getPlayer(run)).toMatchObject({ id: 1, role: 'player', characterId: fighterId, hp: health, maxHp: health, specialMeter: 0 });
      expect(getPartner(run)).toMatchObject({ id: 2, role: 'partner', characterId: partnerId, active: true });
      expect(run.tick).toBe(0);
    }
  });
  it('fails fast if a malformed run contains duplicate controlled roles', () => {
    const run = createRun(10, { fighterId: 'cow', partnerId: 'crow' });
    run.actors.push({ ...run.actors[0]!, id: 99 });
    expect(() => getPlayer(run)).toThrow('exactly one player');
    run.actors.pop();
    run.actors.push({ ...run.actors[1]!, id: 99 });
    expect(() => getPartner(run)).toThrow('exactly one partner');
  });
});
