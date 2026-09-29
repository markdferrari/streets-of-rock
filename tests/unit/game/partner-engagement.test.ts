import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { buildArenaContext, type BodyEnvelope, type CameraFrame } from '../../../src/game/arena';
import { choosePartnerTarget, updatePartner } from '../../../src/game/ai/partner';
import { fixtureEnemy } from '../../fixtures/run';

const body: BodyEnvelope = { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.5, maxDepth: .5 };
const wide: CameraFrame = { anchorX: 8, anchorDepth: 0, anchorHeight: 1.2, halfHeight: 6, aspect: 844 / 390 };

describe.each([['cow', 'crow'], ['crow', 'cow']] as const)('%s fighter, %s partner engagement', (fighterId, partnerId) => {
  it('continues visible enemy pursuit during player separation without recovery or stronger damage', () => {
    const run = createRun(1, { fighterId, partnerId });
    getPlayer(run).position.x = 9;
    getPartner(run).position.x = 1;
    const enemy = fixtureEnemy(3, 'grunt', 4);
    run.actors.push(enemy);
    const events: { type: string; tick: number }[] = [];
    updatePartner(run, events, buildArenaContext(run, wide, body, 'partner'));
    expect(getPartner(run).position.x).toBeGreaterThan(1);
    expect(getPartner(run).position.x).toBeLessThan(1.1);
    expect(getPartner(run).targetId).toBe(enemy.id);
    expect(events.some(event => event.type === 'partner-recovered')).toBe(false);
    expect(enemy.hp).toBe(enemy.maxHp);
  });

  it('finishes a valid support pose even after the player moves away, then expires it', () => {
    const run = createRun(2, { fighterId, partnerId });
    const partner = getPartner(run);
    partner.position.x = 2;
    getPlayer(run).position.x = 9;
    const enemy = fixtureEnemy(3, 'grunt', 2.7);
    run.actors.push(enemy);
    partner.action = { kind: 'active', moveId: 'support', startedTick: 0, endTick: 6 };
    partner.decisionReadyTick = 54;
    for (let tick = 1; tick < 6; tick++) {
      run.tick = tick;
      updatePartner(run, [], buildArenaContext(run, wide, body, 'partner'));
      expect(partner.action.kind).toBe('active');
    }
    run.tick = 6;
    updatePartner(run, [], buildArenaContext(run, wide, body, 'partner'));
    expect(partner.action.kind).toBe('idle');
    expect(partner.decisionReadyTick).toBe(54);
    expect(enemy.hp).toBe(enemy.maxHp);
  });
});

it('filters unreachable and off-screen targets before ranking, retaining an eligible current target', () => {
  const run = createRun(3, { fighterId: 'cow', partnerId: 'crow' });
  const partner = getPartner(run);
  partner.position.x = 2;
  const visible = fixtureEnemy(3, 'grunt', 4);
  const offscreen = fixtureEnemy(4, 'zoner', 15);
  run.actors.push(visible, offscreen);
  const frame = { ...wide, anchorX: 3, halfHeight: 2 };
  const context = buildArenaContext(run, frame, body, 'partner');
  expect(choosePartnerTarget(run, context)).toBe(visible.id);
  partner.targetId = visible.id;
  updatePartner(run, [], context);
  expect(partner.targetId).toBe(visible.id);
});
