import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { buildArenaContext, containsPosition, moveWithinArena, visibleRegions, type BodyEnvelope, type CameraFrame } from '../../../src/game/arena';

const body: BodyEnvelope = { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.4, maxDepth: .4 };
const frame: CameraFrame = { anchorX: 8, anchorDepth: 0, anchorHeight: 1.2, halfHeight: 4.5, aspect: 844 / 390 };

describe('visible legal arena', () => {
  it('keeps the current room locked until clearance and includes only unlocked travel', () => {
    const run = fixtureRun();
    expect(buildArenaContext(run, frame, body, 'partner').legalRegions).toContainEqual({ minX: 0, maxX: 16, minDepth: -3, maxDepth: 3 });
    expect(buildArenaContext(run, frame, body, 'partner').legalRegions).toContainEqual({ minX: -.8, maxX: 0, minDepth: -3, maxDepth: 3 });
    run.encounter.status = 'cleared';
    expect(buildArenaContext(run, frame, body, 'partner').legalRegions).toContainEqual({ minX: 16, maxX: 18, minDepth: -3, maxDepth: 3 });
    expect(buildArenaContext(run, frame, body, 'partner').legalRegions).not.toContainEqual({ minX: 18, maxX: 34, minDepth: -3, maxDepth: 3 });
  });

  it('retains the outgoing room and corridor for a trailing partner after player entry', () => {
    const run = fixtureRun();
    run.areaIndex = 1;
    run.encounter.areaId = 'vip-lounge';
    getPlayer(run).position.x = 19;
    getPartner(run).position.x = 14;
    const regions = buildArenaContext(run, { ...frame, anchorX: 20, halfHeight: 8 }, body, 'partner').legalRegions;
    expect(regions).toContainEqual({ minX: 0, maxX: 16, minDepth: -3, maxDepth: 3 });
    expect(regions).toContainEqual({ minX: 16, maxX: 18, minDepth: -3, maxDepth: 3 });
    expect(regions).toContainEqual({ minX: 18, maxX: 34, minDepth: -3, maxDepth: 3 });
    getPartner(run).position.x = 19;
    expect(buildArenaContext(run, frame, body, 'partner').legalRegions).toHaveLength(1);
  });

  it('uses full body bounds, rejects invalid numbers and clips only this tick displacement', () => {
    const run = fixtureRun();
    const context = buildArenaContext(run, frame, body, 'partner');
    expect(containsPosition(context.visibleRegions, { x: 8, depth: 0 })).toBe(true);
    expect(containsPosition(context.visibleRegions, { x: Number.NaN, depth: 0 })).toBe(false);
    expect(() => visibleRegions(context.legalRegions, { ...frame, halfHeight: 0 }, body)).toThrow();
    expect(() => visibleRegions(context.legalRegions, frame, { ...body, maxY: Number.POSITIVE_INFINITY })).toThrow();
    const edge = moveWithinArena({ x: 15.9, depth: 0 }, { x: 16.9, depth: 0 }, context);
    expect(edge.x).toBeCloseTo(16, 5);
    expect(edge.depth).toBe(0);
    expect(moveWithinArena({ x: 15.9, depth: 0 }, { x: 50, depth: 0 }, context).x).toBeCloseTo(16, 5);
  });
});
