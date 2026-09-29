import { expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { buildArenaContext, type BodyEnvelope, type CameraFrame } from '../../../src/game/arena';
import { updatePartner } from '../../../src/game/ai/partner';

const body: BodyEnvelope = { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.5, maxDepth: .5 };
const frame: CameraFrame = { anchorX: 8, anchorDepth: 0, anchorHeight: 1.2, halfHeight: 8, aspect: 2 };

it('never recovers merely from distance, cooldown waiting, knockout or an ordinary pause', () => {
  const run = fixtureRun();
  const partner = getPartner(run);
  partner.position.x = 1;
  getPlayer(run).position.x = 9;
  const events: { type: string; tick: number }[] = [];
  for (let tick = 0; tick < 130; tick++) {
    run.tick = tick;
    updatePartner(run, events, buildArenaContext(run, frame, body, 'partner'));
  }
  expect(events.some(event => event.type === 'partner-recovered')).toBe(false);
  expect(partner.position.x).toBeLessThan(9);
  partner.hp = 0; partner.active = false;
  const before = { ...partner.position };
  updatePartner(run, events, buildArenaContext(run, frame, body, 'partner'));
  expect(partner.position).toEqual(before);
});

it('recovers only after 120 genuinely blocked ticks to a safe point without changing combat state', () => {
  const run = fixtureRun();
  const partner = getPartner(run);
  partner.position = { x: 1, depth: 0 };
  getPlayer(run).position = { x: 6, depth: 0 };
  partner.hp = 90;
  partner.decisionReadyTick = 200;
  const context = { ...buildArenaContext(run, frame, body, 'partner'),
    obstructions: [{ minX: 1, maxX: 1.5, minDepth: -.5, maxDepth: .5 }] };
  const events: { type: string; tick: number }[] = [];
  for (let tick = 0; tick < 119; tick++) {
    run.tick = tick;
    updatePartner(run, events, context);
  }
  expect(events.some(event => event.type === 'partner-recovered')).toBe(false);
  const stalled = { ...partner.position };
  run.tick = 119;
  updatePartner(run, events, context);
  expect(events.filter(event => event.type === 'partner-recovered')).toHaveLength(1);
  expect(partner.position).not.toEqual(stalled);
  expect(partner.hp).toBe(90);
  expect(partner.decisionReadyTick).toBe(200);
  expect(run.areaIndex).toBe(0);
  expect(run.tick).toBe(119);
});
