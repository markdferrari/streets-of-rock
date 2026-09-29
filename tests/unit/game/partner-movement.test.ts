import { describe, expect, it } from 'vitest';
import { fixtureEnemy, fixtureRun } from '../../fixtures/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { buildArenaContext, type BodyEnvelope, type CameraFrame } from '../../../src/game/arena';
import { updatePartner } from '../../../src/game/ai/partner';

const body: BodyEnvelope = { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.5, maxDepth: .5 };
const frame: CameraFrame = { anchorX: 8, anchorDepth: 0, anchorHeight: 1.2, halfHeight: 8, aspect: 2 };

describe('partner movement and facing', () => {
  it('faces resolved left and right pursuit, preserving facing on depth-only movement', () => {
    const run = fixtureRun();
    const partner = getPartner(run);
    partner.position.x = 6; partner.facing = 1;
    const enemy = fixtureEnemy(3, 'grunt', 3);
    run.actors.push(enemy);
    updatePartner(run, [], buildArenaContext(run, frame, body, 'partner'));
    expect(partner.position.x).toBeLessThan(6);
    expect(partner.facing).toBe(-1);
    enemy.position.x = 9;
    run.tick++;
    updatePartner(run, [], buildArenaContext(run, frame, body, 'partner'));
    expect(partner.facing).toBe(1);
    enemy.position.x = partner.position.x;
    enemy.position.depth = 2;
    run.tick++;
    updatePartner(run, [], buildArenaContext(run, frame, body, 'partner'));
    expect(partner.facing).toBe(1);
  });

  it('regroups at profile speed with 2/1-unit hysteresis instead of jumping across the room', () => {
    const run = fixtureRun();
    const partner = getPartner(run); const player = getPlayer(run);
    partner.position.x = 1; player.position.x = 8;
    updatePartner(run, [], buildArenaContext(run, frame, body, 'partner'));
    expect(partner.position.x - 1).toBeGreaterThan(0);
    expect(partner.position.x - 1).toBeLessThan(.1);
    expect(partner.facing).toBe(1);
    partner.position.x = 7.1;
    run.tick++;
    updatePartner(run, [], buildArenaContext(run, frame, body, 'partner'));
    expect(partner.position.x).toBe(7.1);
  });

  it('travels through an unlocked doorway at catch-up speed without a snap', () => {
    const run = fixtureRun();
    run.areaIndex = 1; run.encounter.areaId = 'vip-lounge';
    const partner = getPartner(run); const player = getPlayer(run);
    partner.position.x = 15; player.position.x = 19;
    const context = buildArenaContext(run, { ...frame, anchorX: 18 }, body, 'partner');
    updatePartner(run, [], context);
    expect(partner.position.x).toBeGreaterThan(15);
    expect(partner.position.x).toBeLessThan(15.1);
    expect(partner.facing).toBe(1);
  });
});
