import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { fixtureEnemy } from '../../fixtures/run';
import { updateProjectiles } from '../../../src/game/projectiles';
import type { HeadrestProjectile } from '../../../src/game/types';

function flight(runId: number, remainingDistance = 12): HeadrestProjectile {
  return { kind: 'headrest', id: 100, ownerId: 1, activationId: 1, position: { x: 0, depth: 0 },
    previousPosition: { x: 0, depth: 0 }, direction: { x: 1, depth: 0 }, speedPerSecond: 120,
    remainingDistance, damage: 50, radius: .25 };
}

describe('Headrest projectile travel', () => {
  it('sweeps fast segments and damages the first physical contact, independent of target array and ID order', () => {
    const run = createRun(730, { fighterId: 'plates', partnerId: 'cow' });
    const laterLowId = fixtureEnemy(3, 'grunt', 1.9);
    const firstHighId = fixtureEnemy(9, 'liam', 1.0);
    run.actors.push(laterLowId, firstHighId);
    const projectile = flight(730);
    run.projectiles.push(projectile);
    const events: { type: string; tick: number; actorId?: number; targetId?: number }[] = [];
    updateProjectiles(run, events);
    expect(firstHighId.hp).toBe(1550);
    expect(laterLowId.hp).toBe(120);
    expect(run.projectiles).toEqual([]);
    expect(projectile.position.x).toBeCloseTo(.3);
  });

  it('consumes on protected contact and clips the final segment to remaining range', () => {
    const run = createRun(731, { fighterId: 'plates', partnerId: 'cow' });
    const protectedEnemy = fixtureEnemy(3, 'grunt', 1);
    protectedEnemy.protectionUntilTick = 5;
    const later = fixtureEnemy(4, 'grunt', 1.8);
    run.actors.push(protectedEnemy, later);
    run.projectiles.push(flight(731));
    updateProjectiles(run, []);
    expect(protectedEnemy.hp).toBe(120);
    expect(later.hp).toBe(120);
    expect(run.projectiles).toEqual([]);

    const missRun = createRun(732, { fighterId: 'plates', partnerId: 'cow' });
    const miss = flight(732, .15); missRun.projectiles.push(miss);
    updateProjectiles(missRun, []);
    expect(miss.position.x).toBeCloseTo(.15);
    expect(missRun.projectiles).toEqual([]);
  });
});
