import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { cameraCenterX } from '../../../src/presentation/camera';
import { computeArenaFrame } from '../../../src/presentation/camera';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { bodyFitsFrame, type BodyEnvelope } from '../../../src/game/arena';

const body: BodyEnvelope = { minX: -.6, maxX: .6, minY: 0, maxY: 2.8, minDepth: -.5, maxDepth: .5 };

describe('level camera', () => {
  it('holds an active arena and follows a cleared transition', () => {
    const run = fixtureRun();
    run.encounter.status = 'active';
    expect(cameraCenterX(run)).toBe(8);
    run.encounter.status = 'cleared';
    run.actors[0]!.position.x = 17;
    expect(cameraCenterX(run)).toBeGreaterThan(8);
    run.areaIndex = 1;
    run.encounter.status = 'active';
    expect(cameraCenterX(run)).toBe(26);
  });
});

describe('room-fit camera', () => {
  it('keeps the existing fixed angle, fits the room with five-percent padding and enlarges stable floor coverage', () => {
    const run = fixtureRun();
    for (const viewport of [{ width: 844, height: 390 }, { width: 915, height: 412 }]) {
      const frame = computeArenaFrame(run, viewport, { player: body, partner: body }, null, 0);
      expect(frame.aspect).toBeCloseTo(viewport.width / viewport.height);
      expect(frame.anchorX).toBeCloseTo(8);
      expect(frame.halfHeight).toBeLessThan(6);
      expect(bodyFitsFrame(getPlayer(run).position, body, frame)).toBe(true);
      expect(bodyFitsFrame(getPartner(run).position, body, frame)).toBe(true);
    }
  });

  it('contains both living allies through each doorway and expands immediately before smoothing in', () => {
    const run = fixtureRun();
    const viewport = { width: 844, height: 390 };
    for (let index = 0; index < 3; index++) {
      run.areaIndex = index + 1;
      run.encounter.areaId = ['vip-lounge', 'backstage-corridor', 'alley-exit'][index]!;
      getPlayer(run).position.x = [18, 36, 54][index]!;
      getPartner(run).position.x = [14, 32, 50][index]!;
      const prior = computeArenaFrame(run, viewport, { player: body, partner: body }, null, 0);
      const frame = computeArenaFrame(run, viewport, { player: body, partner: body }, { ...prior, halfHeight: 2 }, 1 / 60);
      expect(bodyFitsFrame(getPlayer(run).position, body, frame)).toBe(true);
      expect(bodyFitsFrame(getPartner(run).position, body, frame)).toBe(true);
      expect(frame.halfHeight).toBeGreaterThan(2);
    }
  });

  it('excludes a knocked-out partner and refits narrower viewports without moving actors', () => {
    const run = fixtureRun();
    getPartner(run).hp = 0;
    getPartner(run).position.x = -100;
    const before = structuredClone(run.actors.map(actor => actor.position));
    const frame = computeArenaFrame(run, { width: 667, height: 375 }, { player: body, partner: body }, null, 0);
    expect(frame.halfHeight).toBeLessThan(10);
    expect(bodyFitsFrame(getPlayer(run).position, body, frame)).toBe(true);
    expect(run.actors.map(actor => actor.position)).toEqual(before);
  });
});
