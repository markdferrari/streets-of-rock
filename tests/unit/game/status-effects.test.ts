import { describe, expect, it } from 'vitest';
import { fixtureRun, fixtureEnemy } from '../../fixtures/run';
import { applyStun, updateEnemyStatuses } from '../../../src/game/status-effects';
import type { EnemyState } from '../../../src/game/types';

function normal(id: number): EnemyState {
  return { ...fixtureEnemy(id), combatClass: 'normal' } as EnemyState;
}

describe('normal enemy stun lifecycle', () => {
  it('cancels owned attacks and slots and resumes with a fresh decision at exact expiry', () => {
    const run = fixtureRun();
    const enemy = normal(3);
    enemy.action = { kind: 'active', moveId: 'charge', startedTick: 2, endTick: 20 };
    enemy.attackSlot = true;
    run.actors.push(enemy);
    run.attacks.push({ id: 99, ownerId: enemy.id, moveId: 'charge', origin: { x: 1, depth: 0 }, facing: -1,
      activeUntilTick: 20, range: 2, depthTolerance: 1, damage: 10, hitTargetIds: [] });
    run.tick = 10;
    expect(applyStun(run, enemy.id, 120)).toBe(true);
    expect(enemy.stunnedUntilTick).toBe(130);
    expect(enemy.action.kind).toBe('idle');
    expect(enemy.attackSlot).toBe(false);
    expect(run.attacks).toEqual([]);
    run.tick = 129;
    expect(updateEnemyStatuses(run).stunnedIds).toEqual([3]);
    run.tick = 130;
    expect(updateEnemyStatuses(run).expiredIds).toEqual([3]);
    expect(enemy.decisionReadyTick).toBe(130);
    expect(enemy.stunnedUntilTick).toBeUndefined();
  });

  it('refreshes duration, ignores bosses and clears status on death', () => {
    const run = fixtureRun();
    const enemy = normal(3);
    run.actors.push(enemy);
    run.tick = 10;
    applyStun(run, enemy.id, 120);
    run.tick = 60;
    applyStun(run, enemy.id, 120);
    expect(enemy.stunnedUntilTick).toBe(180);
    enemy.hp = 0;
    updateEnemyStatuses(run);
    expect(enemy.stunnedUntilTick).toBeUndefined();
    const boss = { ...fixtureEnemy(4, 'liam'), combatClass: 'boss' } as EnemyState;
    run.actors.push(boss);
    expect(applyStun(run, boss.id, 120)).toBe(false);
    expect(boss.stunnedUntilTick).toBeUndefined();
  });
});
