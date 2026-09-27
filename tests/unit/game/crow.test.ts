import { describe, expect, it } from 'vitest';
import { fixtureEnemy, fixtureRun } from '../../fixtures/run';
import { chooseCrowTarget, updateCrow } from '../../../src/game/ai/crow';
import type { CowState, CrowState } from '../../../src/game/types';

describe('Crow AI', () => {
  it('prefers a threat attacking Cow, then a reachable zoner, then nearest IDs', () => {
    const run = fixtureRun();
    const grunt = fixtureEnemy(3, 'grunt', 1);
    const zoner = fixtureEnemy(4, 'zoner', 2);
    const threat = fixtureEnemy(5, 'grunt', 2.5);
    threat.targetId = 1;
    threat.action.kind = 'windup';
    run.actors.push(grunt, zoner, threat);
    expect(chooseCrowTarget(run)).toBe(5);
    threat.hp = 0;
    expect(chooseCrowTarget(run)).toBe(4);
    zoner.hp = 0;
    expect(chooseCrowTarget(run)).toBe(3);
  });
  it('recovers alive Crow from excessive separation without health or damage changes', () => {
    const run = fixtureRun();
    const crow = run.actors[1] as CrowState;
    crow.position.x = -10;
    crow.hp = 90;
    run.actors.push(fixtureEnemy(3, 'grunt', 1));
    updateCrow(run, []);
    expect(Math.abs(crow.position.x - run.actors[0]!.position.x)).toBeLessThan(2);
    expect(crow.hp).toBe(90);
    expect(run.actors[2]!.hp).toBe(120);
  });
  it('becomes permanently inactive after knockout without controlling Cow special', () => {
    const run = fixtureRun();
    const crow = run.actors[1] as CrowState;
    crow.hp = 0;
    crow.active = false;
    crow.position.x = -10;
    (run.actors[0] as CowState).specialMeter = 100;
    updateCrow(run, []);
    expect(crow.position.x).toBe(-10);
    expect(crow.active).toBe(false);
    expect((run.actors[0] as CowState).specialMeter).toBe(100);
  });
  it('damages a nearby enemy modestly without damaging tables or adding Cow meter', () => {
    const run = fixtureRun();
    (run.actors[1] as CrowState).position.x = 0;
    run.actors.push(fixtureEnemy(3, 'grunt', .8));
    run.tables.push({ id: 4, areaId: 'vip', position: { x: .8, depth: 0 }, hp: 24, broken: false });
    for (let tick = 0; tick < 55; tick++) { run.tick = tick; updateCrow(run, []); }
    expect(run.actors[2]!.hp).toBeLessThan(120);
    expect(run.actors[2]!.hp).toBeGreaterThanOrEqual(104);
    expect(run.tables[0]!.hp).toBe(24);
    expect((run.actors[0] as CowState).specialMeter).toBe(0);
  });
});
