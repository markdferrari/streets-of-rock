import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { moveCow } from '../../../src/game/movement';
import { attackHits } from '../../../src/game/collision';
import { updateCowAction } from '../../../src/game/actions';
import { applyAttack } from '../../../src/game/damage';
import type { AttackInstance, CowState, EnemyState } from '../../../src/game/types';

function grunt(id = 3, x = 1, depth = 0): EnemyState {
  return { id, role: 'grunt', team: 'enemy', position: { x, depth }, facing: -1,
    hp: 120, maxHp: 120, action: { kind: 'idle', startedTick: 0, endTick: 0 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1 };
}
function strike(id = 1): AttackInstance {
  return { id, ownerId: 1, moveId: 'cow1', origin: { x: 0, depth: 0 }, facing: 1,
    activeUntilTick: 10, range: 1.3, depthTolerance: .45, damage: 12, hitTargetIds: [] };
}

describe('movement and hits', () => {
  it('retains facing for depth-only movement and clamps bounds', () => {
    const run = fixtureRun();
    moveCow(run, { move: { x: 0, depth: 1 } });
    expect(run.actors[0]!.facing).toBe(1);
    for (let i = 0; i < 300; i++) moveCow(run, { move: { x: 1, depth: 1 } });
    expect(run.actors[0]!.position.x).toBeLessThanOrEqual(16);
    expect(run.actors[0]!.position.depth).toBeLessThanOrEqual(3);
    moveCow(run, { move: { x: -1, depth: 0 } });
    expect(run.actors[0]!.facing).toBe(-1);
  });
  it('requires range, facing and depth and only damages an actor once per strike', () => {
    const run = fixtureRun();
    run.actors.push(grunt(3, 1, .6));
    const attack = strike();
    expect(attackHits(attack, run.actors[2]!)).toBe(false);
    run.actors[2]!.position.depth = 0;
    expect(attackHits(attack, run.actors[2]!)).toBe(true);
    const events: { type: string; tick: number }[] = [];
    applyAttack(run, attack, events);
    applyAttack(run, attack, events);
    expect(run.actors[2]!.hp).toBe(108);
    expect(run.actors[0]).toMatchObject({ specialMeter: 10 });
    expect(run.actors[1]!.hp).toBe(240);
    expect(attack.hitTargetIds).toEqual([3]);
  });
  it('grants damage protection and rejects attacks from allies', () => {
    const run = fixtureRun();
    run.actors.push(grunt());
    const attack: AttackInstance = { ...strike(), ownerId: 3, origin: { x: 1, depth: 0 }, facing: -1, damage: 18 };
    applyAttack(run, attack, []);
    expect(run.actors[0]!.hp).toBe(482);
    applyAttack(run, { ...attack, id: 2, hitTargetIds: [] }, []);
    expect(run.actors[0]!.hp).toBe(482);
  });
});

describe('Cow actions', () => {
  it('starts an attack, accepts one buffered continuation, and expires an old combo', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    const events: { type: string; tick: number }[] = [];
    updateCowAction(run, { move: { x: 0, depth: 0 }, attack: true }, events);
    expect(cow.action).toMatchObject({ kind: 'windup', moveId: 'cow1' });
    for (let tick = 1; tick < 32; tick++) {
      run.tick = tick;
      updateCowAction(run, { move: { x: 0, depth: 0 }, attack: tick === 26 }, events);
    }
    expect(cow.action.moveId).toBe('cow2');
    for (let tick = 32; tick < 120; tick++) {
      run.tick = tick;
      updateCowAction(run, { move: { x: 0, depth: 0 } }, events);
    }
    updateCowAction(run, { move: { x: 0, depth: 0 }, attack: true }, events);
    expect(cow.action.moveId).toBe('cow1');
  });
  it('uses full meter once, and rejects special before full meter', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    updateCowAction(run, { move: { x: 0, depth: 0 }, special: true }, []);
    expect(cow.action.kind).toBe('idle');
    cow.specialMeter = 100;
    updateCowAction(run, { move: { x: 0, depth: 0 }, special: true }, []);
    expect(cow.action.moveId).toBe('spin');
    expect(cow.specialMeter).toBe(0);
  });
  it('dodges once until cooldown, with protection ending before movement', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    updateCowAction(run, { move: { x: 1, depth: 0 }, dodge: true }, []);
    expect(cow.action.kind).toBe('dodge');
    expect(cow.protectionUntilTick).toBe(12);
    run.tick = 18;
    updateCowAction(run, { move: { x: 0, depth: 0 }, dodge: true }, []);
    expect(cow.action.kind).toBe('idle');
    run.tick = 54;
    updateCowAction(run, { move: { x: 0, depth: 0 }, dodge: true }, []);
    expect(cow.action.kind).toBe('dodge');
  });
});
