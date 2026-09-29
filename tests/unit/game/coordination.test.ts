import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { assignAttackSlots } from '../../../src/game/ai/attack-slots';
import { updateGrunts } from '../../../src/game/ai/grunt';
import type { EnemyState } from '../../../src/game/types';

function enemy(id: number): EnemyState {
  return { id, role: 'grunt', combatClass: 'normal', team: 'enemy', position: { x: 1 + id * .1, depth: 0 }, facing: -1,
    hp: 120, maxHp: 120, action: { kind: 'idle', startedTick: 0, endTick: 0 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1 };
}

describe('enemy coordination', () => {
  it('reserves at most two slots in stable ID order and frees dead owners', () => {
    const run = fixtureRun();
    run.actors.push(enemy(3), enemy(4), enemy(5));
    expect(assignAttackSlots(run).map(actor => actor.id)).toEqual([3, 4]);
    expect(run.actors[4]!.attackSlot).toBe(false);
    run.actors[2]!.hp = 0;
    expect(assignAttackSlots(run).map(actor => actor.id)).toEqual([4, 5]);
  });
  it('warns before a grunt attack and allows waiting enemies to reposition', () => {
    const run = fixtureRun();
    run.actors.push(enemy(3), enemy(4), enemy(5));
    const events: { type: string; tick: number; actorId?: number }[] = [];
    const originalDepth = run.actors[4]!.position.depth;
    updateGrunts(run, events);
    expect(events.filter(event => event.type === 'enemy-warning')).toHaveLength(2);
    expect(run.actors[4]!.position.depth).not.toBe(originalDepth);
    expect(run.actors[4]!.action.kind).toBe('idle');
    expect(run.actors[2]!.action.kind).toBe('windup');
    run.tick = 27;
    updateGrunts(run, events);
    expect(run.attacks.some(attack => attack.ownerId === 3)).toBe(true);
  });
});
