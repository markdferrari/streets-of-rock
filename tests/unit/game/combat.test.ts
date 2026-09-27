import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { moveCow } from '../../../src/game/movement';
import { attackHits, resolveActorOverlaps, sweptCircleContact } from '../../../src/game/collision';
import { clearCowPendingAction, updateCowAction } from '../../../src/game/actions';
import { applyAttack } from '../../../src/game/damage';
import type { ActionRequest, AttackInstance, CowState, EnemyState } from '../../../src/game/types';

function tap(kind: ActionRequest['kind']): ActionRequest { return { kind, sourcePointerId: -1, order: 0 }; }
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
  it('detects fast travel through a target without requiring an end-point overlap', () => {
    expect(sweptCircleContact({ x: 0, depth: 0 }, { x: 4, depth: 0 }, { x: 2, depth: .1 }, .3)).toBe(true);
    expect(sweptCircleContact({ x: 0, depth: 0 }, { x: 4, depth: 0 }, { x: 2, depth: 1 }, .3)).toBe(false);
  });
  it('keeps allies nonblocking while separating an enemy overlap', () => {
    const run = fixtureRun();
    run.actors[0]!.position.x = 1;
    run.actors[1]!.position.x = 1;
    run.actors.push(grunt(3, 1, 0));
    resolveActorOverlaps(run);
    expect(run.actors[0]!.position.x).toBe(1);
    expect(run.actors[1]!.position.x).toBe(1);
    expect(Math.abs(run.actors[2]!.position.x - 1)).toBeGreaterThanOrEqual(.6);
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
  it('ends protection at its exclusive tick boundary', () => {
    const run = fixtureRun();
    run.actors.push(grunt());
    const incoming = { ...strike(), ownerId: 3, origin: { x: 1, depth: 0 }, facing: -1 as const, damage: 18 };
    applyAttack(run, incoming, []);
    run.tick = 35;
    applyAttack(run, { ...incoming, id: 2, hitTargetIds: [] }, []);
    expect(run.actors[0]!.hp).toBe(482);
    run.tick = 36;
    applyAttack(run, { ...incoming, id: 3, hitTargetIds: [] }, []);
    expect(run.actors[0]!.hp).toBe(464);
  });
  it('spin hits nearby enemies once without refilling its meter and knocks them back', () => {
    const run = fixtureRun();
    run.actors.push(grunt(3, 4, 0), grunt(4, 2, 0), grunt(5, 6, 0));
    const cow = run.actors[0] as CowState;
    cow.position.x = 3;
    cow.specialMeter = 0;
    const attack = { ...strike(), moveId: 'spin' as const, origin: { x: 3, depth: 0 }, range: 2, damage: 60 };
    applyAttack(run, attack, []);
    applyAttack(run, attack, []);
    expect(run.actors.slice(2).map(actor => actor.hp)).toEqual([60, 60, 120]);
    expect(cow.specialMeter).toBe(0);
    expect(run.actors[2]!.position.x).toBeGreaterThan(4);
    expect(run.actors[3]!.position.x).toBeLessThan(2);
  });
});

describe('Cow actions', () => {
  it('starts one slower Heavy strike, resets Light combo, and cannot cancel recovery', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    cow.comboStep = 2;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'heavy', sourcePointerId: 7, order: 1 }] }, []);
    expect(cow.action).toMatchObject({ kind: 'windup', moveId: 'cowHeavy', endTick: 14 });
    expect(cow.comboStep).toBe(0);
    run.tick = 14;
    updateCowAction(run, { move: { x: 0, depth: 0 } }, []);
    expect(run.attacks[0]).toMatchObject({ moveId: 'cowHeavy', damage: 30 });
    run.tick = 20;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'light', sourcePointerId: 8, order: 2 }] }, []);
    expect(cow.action.kind).toBe('recovery');
    run.tick = 44;
    updateCowAction(run, { move: { x: 0, depth: 0 } }, []);
    expect(cow.action.kind).toBe('idle');
    expect(cow.pendingAction).toBeUndefined();
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'light', sourcePointerId: 9, order: 3 }] }, []);
    expect(cow.action.moveId).toBe('cow1');
  });
  it('keeps one eligible buffer and ignores an unavailable request', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    cow.action = { kind: 'recovery', startedTick: 0, endTick: 5 };
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'light', sourcePointerId: 1, order: 1 }] }, []);
    run.tick = 1;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'special', sourcePointerId: 2, order: 2 }] }, []);
    expect(cow.pendingAction?.kind).toBe('light');
    run.tick = 2;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'heavy', sourcePointerId: 3, order: 3 }] }, []);
    expect(cow.pendingAction?.kind).toBe('heavy');
    run.tick = 3;
    updateCowAction(run, { move: { x: 0, depth: 0 }, canceledPointerIds: [3] }, []);
    expect(cow.pendingAction).toBeUndefined();
  });
  it('gives same-tick Special priority and meters only one accepted Heavy enemy hit', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    cow.specialMeter = 100;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [
      { kind: 'heavy', sourcePointerId: 1, order: 2 },
      { kind: 'special', sourcePointerId: 2, order: 1 },
    ] }, []);
    expect(cow.action.moveId).toBe('spin');
    expect(cow.specialMeter).toBe(0);
    cow.action = { kind: 'idle', startedTick: 1, endTick: 1 };
    run.tick = 1;
    run.actors.push(grunt(3, 1, 0));
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [{ kind: 'heavy', sourcePointerId: 3, order: 3 }] }, []);
    run.tick = 15;
    updateCowAction(run, { move: { x: 0, depth: 0 } }, []);
    const heavy = run.attacks.at(-1)!;
    applyAttack(run, heavy, []);
    applyAttack(run, heavy, []);
    expect(run.actors[2]!.hp).toBe(90);
    expect(cow.specialMeter).toBe(10);
  });
  it('starts an attack, accepts one buffered continuation, and expires an old combo', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    const events: { type: string; tick: number }[] = [];
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('light')] }, events);
    expect(cow.action).toMatchObject({ kind: 'windup', moveId: 'cow1' });
    for (let tick = 1; tick < 32; tick++) {
      run.tick = tick;
      updateCowAction(run, { move: { x: 0, depth: 0 }, requests: tick === 26 ? [tap('light')] : [] }, events);
    }
    expect(cow.action.moveId).toBe('cow2');
    for (let tick = 32; tick < 120; tick++) {
      run.tick = tick;
      updateCowAction(run, { move: { x: 0, depth: 0 } }, events);
    }
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('light')] }, events);
    expect(cow.action.moveId).toBe('cow1');
  });
  it('drops a buffered tap that expires before recovery ends', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('light')] }, []);
    for (let tick = 1; tick < 35; tick++) {
      run.tick = tick;
      updateCowAction(run, { move: { x: 0, depth: 0 }, requests: tick === 1 ? [tap('light')] : [] }, []);
    }
    expect(cow.action.kind).toBe('idle');
    expect(cow.pendingAction).toBeUndefined();
  });
  it('clears buffered commands on interruption without changing the current attack', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('light')] }, []);
    run.tick = 1;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('light')] }, []);
    expect(cow.pendingAction).toBeDefined();
    clearCowPendingAction(run);
    expect(cow.pendingAction).toBeUndefined();
    expect(cow.action.kind).toBe('windup');
  });
  it('uses full meter once, and rejects special before full meter', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('special')] }, []);
    expect(cow.action.kind).toBe('idle');
    cow.specialMeter = 100;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('special')] }, []);
    expect(cow.action.moveId).toBe('spin');
    expect(cow.specialMeter).toBe(0);
  });
  it('dodges once until cooldown, with protection ending before movement', () => {
    const run = fixtureRun();
    const cow = run.actors[0]! as CowState;
    updateCowAction(run, { move: { x: 1, depth: 0 }, requests: [tap('dodge')] }, []);
    expect(cow.action.kind).toBe('dodge');
    expect(cow.protectionUntilTick).toBe(12);
    run.tick = 18;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('dodge')] }, []);
    expect(cow.action.kind).toBe('idle');
    run.tick = 54;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('dodge')] }, []);
    expect(cow.action.kind).toBe('dodge');
  });
  it('captures joystick dodge direction and uses facing at neutral input', () => {
    const run = fixtureRun();
    const cow = run.actors[0] as CowState;
    cow.position.x = 5;
    updateCowAction(run, { move: { x: 0, depth: -1 }, requests: [tap('dodge')] }, []);
    moveCow(run, { move: { x: 1, depth: 1 } });
    expect(cow.position.depth).toBeLessThan(0);
    expect(cow.position.x).toBe(5);
    run.tick = 54;
    cow.action = { kind: 'idle', startedTick: 54, endTick: 54 };
    cow.facing = -1;
    updateCowAction(run, { move: { x: 0, depth: 0 }, requests: [tap('dodge')] }, []);
    moveCow(run, { move: { x: 0, depth: 0 } });
    expect(cow.position.x).toBeLessThan(5);
  });
});
