import { describe, expect, it } from 'vitest';
import { fixtureEnemy, fixtureRun } from '../../fixtures/run';
import { choosePartnerTarget, updatePartner } from '../../../src/game/ai/partner';
import type { PlayerState, PartnerState } from '../../../src/game/types';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';

describe('Crow AI', () => {
  it('prefers a threat attacking Cow, then a reachable zoner, then nearest IDs', () => {
    const run = fixtureRun();
    const grunt = fixtureEnemy(3, 'grunt', 1);
    const zoner = fixtureEnemy(4, 'zoner', 2);
    const threat = fixtureEnemy(5, 'grunt', 2.5);
    threat.targetId = 1;
    threat.action.kind = 'windup';
    run.actors.push(grunt, zoner, threat);
    expect(choosePartnerTarget(run)).toBe(5);
    threat.hp = 0;
    expect(choosePartnerTarget(run)).toBe(4);
    zoner.hp = 0;
    expect(choosePartnerTarget(run)).toBe(3);
  });
  it('recovers alive Crow from excessive separation without health or damage changes', () => {
    const run = fixtureRun();
    const crow = run.actors[1] as PartnerState;
    crow.position.x = -10;
    crow.hp = 90;
    run.actors.push(fixtureEnemy(3, 'grunt', 1));
    updatePartner(run, []);
    expect(Math.abs(crow.position.x - run.actors[0]!.position.x)).toBeLessThan(2);
    expect(crow.hp).toBe(90);
    expect(run.actors[2]!.hp).toBe(120);
  });
  it('becomes permanently inactive after knockout without controlling Cow special', () => {
    const run = fixtureRun();
    const crow = run.actors[1] as PartnerState;
    crow.hp = 0;
    crow.active = false;
    crow.position.x = -10;
    (run.actors[0] as PlayerState).specialMeter = 100;
    updatePartner(run, []);
    expect(crow.position.x).toBe(-10);
    expect(crow.active).toBe(false);
    expect((run.actors[0] as PlayerState).specialMeter).toBe(100);
  });
  it('damages a nearby enemy modestly without damaging tables or adding Cow meter', () => {
    const run = fixtureRun();
    (run.actors[1] as PartnerState).position.x = 0;
    run.actors.push(fixtureEnemy(3, 'grunt', .8));
    run.tables.push({ id: 4, areaId: 'vip', position: { x: .8, depth: 0 }, hp: 24, broken: false });
    for (let tick = 0; tick < 55; tick++) { run.tick = tick; updatePartner(run, []); }
    expect(run.actors[2]!.hp).toBeLessThan(120);
    expect(run.actors[2]!.hp).toBeGreaterThanOrEqual(104);
    expect(run.tables[0]!.hp).toBe(24);
    expect((run.actors[0] as PlayerState).specialMeter).toBe(0);
  });
});

describe('selected AI partner', () => {
  it('lets Cow support Crow without consuming player meter or healing', () => {
    const run = createRun(15, { fighterId: 'crow', partnerId: 'cow' });
    const partner = getPartner(run);
    partner.position.x = 0;
    partner.hp = 200;
    const enemy = fixtureEnemy(3, 'grunt', .8);
    enemy.targetId = getPlayer(run).id;
    enemy.action.kind = 'windup';
    run.actors.push(enemy);
    for (let tick = 0; tick < 55; tick++) { run.tick = tick; updatePartner(run, []); }
    expect(enemy.hp).toBeLessThan(120);
    expect(getPlayer(run).specialMeter).toBe(0);
    expect(partner.hp).toBe(200);
  });
});
