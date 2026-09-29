import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { getPlayer } from '../../../src/game/selectors';
import { updatePlayerAction } from '../../../src/game/actions';
import { playerMoveTuning } from '../../../src/game/moves';
import { applyAttacksBatch } from '../../../src/game/damage';
import { fixtureEnemy } from '../../fixtures/run';

const quiet = { move: { x: 0, depth: 0 } } as const;

describe('Lion player profile and ROAR', () => {
  it('keeps the broad Heavy, Dodge, meter, and shared action rules', () => {
    const run = createRun(710, { fighterId: 'lion', partnerId: 'cow' });
    const player = getPlayer(run);
    expect(playerMoveTuning(run, 'heavy')).toMatchObject({ range: 1.8, depthTolerance: .6, damage: 44 });
    player.specialMeter = 90;
    updatePlayerAction(run, { ...quiet, requests: [{ kind: 'light', sourcePointerId: 1, order: 1 }] }, []);
    expect(player.action.kind).toBe('windup');
    expect(player.specialMeter).toBe(90);
  });

  it('stuns normals at release and batches boss-only damage without interrupting its action', () => {
    const run = createRun(711, { fighterId: 'lion', partnerId: 'crow' });
    const player = getPlayer(run); player.specialMeter = 100;
    const normal = fixtureEnemy(3, 'grunt', 2.5);
    const boss = fixtureEnemy(4, 'liam', 2);
    boss.action = { kind: 'windup', moveId: 'rope', startedTick: 0, endTick: 50 };
    run.actors.push(normal, boss);
    const events: { type: string; tick: number; actorId?: number; targetId?: number }[] = [];
    updatePlayerAction(run, { ...quiet, requests: [{ kind: 'special', sourcePointerId: 2, order: 1 }] }, events);
    expect(player.specialMeter).toBe(0);
    for (let tick = 1; tick <= 18; tick++) { run.tick = tick; updatePlayerAction(run, quiet, events); }
    expect(normal.hp).toBe(120);
    expect(normal.stunnedUntilTick).toBe(138);
    expect(boss.hp).toBe(1600);
    expect(boss.action).toEqual({ kind: 'windup', moveId: 'rope', startedTick: 0, endTick: 50 });
    applyAttacksBatch(run, [], events);
    expect(boss.hp).toBe(1540);
    expect(player.specialMeter).toBe(0);
    expect(run.pendingSpecialDamage).toEqual([]);
  });

  it('allows a no-target ROAR to spend full meter once', () => {
    const run = createRun(712, { fighterId: 'lion', partnerId: 'crow' });
    const player = getPlayer(run); player.specialMeter = 100;
    const events: { type: string; tick: number; actorId?: number }[] = [];
    updatePlayerAction(run, { ...quiet, requests: [{ kind: 'special', sourcePointerId: 2, order: 1 }] }, events);
    expect(player.specialMeter).toBe(0);
    for (let tick = 1; tick <= 18; tick++) { run.tick = tick; updatePlayerAction(run, quiet, events); }
    expect(events.filter(event => event.type === 'special-release')).toHaveLength(1);
    for (let tick = 19; tick <= 24; tick++) { run.tick = tick; updatePlayerAction(run, quiet, events); }
    expect(events.filter(event => event.type === 'special-release')).toHaveLength(1);
  });
});
