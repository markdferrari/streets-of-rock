import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { updatePlayerAction } from '../../../src/game/actions';
import { applyAttacksBatch } from '../../../src/game/damage';
import { fixtureEnemy } from '../../fixtures/run';

describe('ROAR release integration', () => {
  it('samples the release-time radius, stuns normal targets, and batches boss-only damage', () => {
    const run = createRun(880, { fighterId: 'lion', partnerId: 'plates' });
    const player = getPlayer(run);
    const partner = getPartner(run);
    const boundary = fixtureEnemy(3, 'grunt', 3);
    const outside = fixtureEnemy(4, 'zoner', 3.01);
    const boss = fixtureEnemy(5, 'liam', 2);
    boss.action = { kind: 'windup', moveId: 'rope', startedTick: 0, endTick: 50 };
    run.actors.push(boundary, outside, boss);
    player.specialMeter = 100;
    const events: { type: string; tick: number; actorId?: number; targetId?: number }[] = [];
    updatePlayerAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'special', sourcePointerId: 8, order: 1 }] }, events);
    boundary.position.x = 2;
    for (let tick = 1; tick <= 18; tick++) {
      run.tick = tick;
      updatePlayerAction(run, { move: { x: 0, depth: 0 } }, events);
    }
    expect(boundary.stunnedUntilTick).toBe(138);
    expect(outside.stunnedUntilTick).toBeUndefined();
    expect(boundary.hp).toBe(boundary.maxHp);
    expect(boss.hp).toBe(boss.maxHp);
    expect(boss.action).toEqual({ kind: 'windup', moveId: 'rope', startedTick: 0, endTick: 50 });
    expect(partner.hp).toBe(partner.maxHp);
    expect(player.specialMeter).toBe(0);
    expect(run.pendingSpecialDamage).toHaveLength(1);
    applyAttacksBatch(run, [], events);
    expect(boss.hp).toBe(boss.maxHp - 60);
    expect(player.specialMeter).toBe(0);
  });
});
