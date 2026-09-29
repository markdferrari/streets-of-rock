import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { stepRun, type TickStage } from '../../../src/game/step';
import type { EnemyState } from '../../../src/game/types';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { buildArenaContext } from '../../../src/game/arena';

describe('tick pipeline', () => {
  it('uses the supplied visible arena when the partner chooses a target', () => {
    const run = fixtureRun();
    getPartner(run).position.x = 1;
    run.actors.push({ ...run.actors[1]!, id: 3, role: 'grunt', team: 'enemy', hp: 120, maxHp: 120,
      position: { x: 2, depth: 0 } } as EnemyState);
    run.actors.push({ ...run.actors[1]!, id: 4, role: 'zoner', team: 'enemy', hp: 180, maxHp: 180,
      position: { x: 15, depth: 0 } } as EnemyState);
    run.encounter.status = 'active';
    run.encounter.aliveEnemyIds = [3, 4];
    const context = buildArenaContext(run,
      { anchorX: 2, anchorDepth: 0, anchorHeight: 1.2, halfHeight: 2, aspect: 2 },
      { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.5, maxDepth: .5 }, 'partner');
    stepRun(run, { move: { x: 0, depth: 0 } }, undefined, context);
    expect(getPartner(run).targetId).toBe(3);
  });
  it('continues after selected partner knockout and gives selected player defeat precedence on a tie', () => {
    const run = createRun(30, { fighterId: 'crow', partnerId: 'cow' });
    getPartner(run).hp = 0;
    getPartner(run).active = false;
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.result).toBeNull();
    const boss = { ...run.actors[1]!, id: 50, role: 'liam' as const, team: 'enemy' as const,
      hp: 0, maxHp: 1600 } as EnemyState;
    run.actors.push(boss);
    getPlayer(run).hp = 0;
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.result).toBe('defeat');
  });
  it('executes deterministic stages and gives each tick a fresh event list', () => {
    const run = fixtureRun();
    const called: string[] = [];
    const stages: TickStage[] = ['input', 'ai', 'movement', 'contacts', 'damage', 'terminal', 'progression'].map(name => ({
      name,
      apply: (_state, _input, events) => { called.push(name); events.push({ type: name, tick: run.tick }); },
    }));
    const first = stepRun(run, { move: { x: 0, depth: 0 } }, stages);
    expect(called).toEqual(['input', 'ai', 'movement', 'contacts', 'damage', 'terminal', 'progression']);
    expect(first.map(event => event.tick)).toEqual(Array(7).fill(0));
    expect(run.tick).toBe(1);
    const second = stepRun(run, { move: { x: 0, depth: 0 } }, stages);
    expect(second).not.toBe(first);
    expect(first.length).toBe(7);
    expect(second[0]?.tick).toBe(1);
  });

  it('does not advance a terminal run', () => {
    const run = fixtureRun();
    run.result = 'defeat';
    expect(stepRun(run, { move: { x: 1, depth: 0 } })).toEqual([]);
    expect(run.tick).toBe(0);
  });

  it('resolves a lethal tie as defeat before progression', () => {
    const run = fixtureRun();
    run.actors.push({ ...run.actors[1]!, id: 3, role: 'liam', combatClass: 'boss', team: 'enemy', hp: 0, maxHp: 1600 } as EnemyState);
    run.actors[0]!.hp = 0;
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.result).toBe('defeat');
  });

  it('runs actions, AI and damage through the default pipeline', () => {
    const run = fixtureRun();
    run.actors.push({ ...run.actors[1]!, id: 3, role: 'grunt', combatClass: 'normal', team: 'enemy', hp: 120, maxHp: 120, position: { x: 1, depth: 0 } } as EnemyState);
    run.nextEntityId = 4;
    run.encounter.status = 'active';
    run.encounter.aliveEnemyIds = [3];
    const input = { move: { x: 0, depth: 0 } };
    stepRun(run, { ...input, requests: [{ kind: 'light' as const, sourcePointerId: -1, order: 0 }] });
    for (let i = 0; i < 35; i++) stepRun(run, input);
    expect(run.actors[2]!.hp).toBe(100);
    expect(run.actors[0]).toMatchObject({ specialMeter: 10 });
    expect(run.actors[0]!.hp).toBeLessThan(500);
  });
  it('applies mutually lethal contacts in one tick before choosing defeat', () => {
    const run = fixtureRun();
    const cow = run.actors[0]!;
    cow.hp = 18;
    run.actors.push({ ...run.actors[1]!, id: 3, role: 'liam', team: 'enemy', hp: 12, maxHp: 1600, position: { x: 1, depth: 0 } } as EnemyState);
    run.attacks.push(
      { id: 1, ownerId: 1, moveId: 'light1', origin: { x: 0, depth: 0 }, facing: 1, activeUntilTick: 1, range: 1.3, depthTolerance: .45, damage: 12, hitTargetIds: [] },
      { id: 2, ownerId: 3, moveId: 'close', origin: { x: 1, depth: 0 }, facing: -1, activeUntilTick: 1, range: 1.3, depthTolerance: .45, damage: 18, hitTargetIds: [] },
    );
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.actors[2]!.hp).toBe(0);
    expect(cow.hp).toBe(0);
    expect(run.result).toBe('defeat');
  });
  it('starts the first wave and never spawns after a terminal defeat', () => {
    const run = fixtureRun();
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.encounter.aliveEnemyIds).toHaveLength(3);
    for (const id of run.encounter.aliveEnemyIds) run.actors.find(actor => actor.id === id)!.hp = 0;
    run.actors[0]!.hp = 0;
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.result).toBe('defeat');
    expect(run.encounter.waveIndex).toBe(0);
  });
});
