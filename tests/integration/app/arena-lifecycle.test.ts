import { describe, expect, it } from 'vitest';
import { RunSession } from '../../../src/app/session';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';
import { computeArenaFrame } from '../../../src/presentation/camera';
import { characterBodyEnvelope } from '../../../src/presentation/character-assets';
import { bodyFitsFrame } from '../../../src/game/arena';
import { stepRun } from '../../../src/game/step';

function choose(session: RunSession) {
  session.select({ type: 'activate', id: 'cow', ready: false });
  session.select({ type: 'activate', id: 'cow', ready: true });
  session.select({ type: 'activate', id: 'crow', ready: false });
  session.select({ type: 'activate', id: 'crow', ready: true });
}

describe('arena lifecycle', () => {
  it('freezes run intent during interruption and refits a resized viewport without moving allies', () => {
    let now = 0;
    const session = new RunSession(() => now);
    choose(session);
    const run = createRun(17, { fighterId: 'cow', partnerId: 'crow' });
    session.prepared(1, run);
    now = 1000; session.frame();
    now = 2000; session.frame();
    now = 3000;
    expect(session.frame()).toContainEqual({ type: 'launch', run });

    stepRun(run, { move: { x: 0, depth: 0 } });
    const beforePause = structuredClone(run);
    session.interrupt();
    now += 30_000;
    expect(session.frame()).toEqual([]);
    expect(run).toEqual(beforePause);

    const positions = [getPlayer(run).position, getPartner(run).position].map(position => ({ ...position }));
    const playerBody = characterBodyEnvelope('cow');
    const partnerBody = characterBodyEnvelope('crow');
    const frame = computeArenaFrame(run, { width: 667, height: 375 }, {
      player: playerBody,
      partner: partnerBody,
    });
    expect(bodyFitsFrame(getPlayer(run).position, playerBody, frame)).toBe(true);
    expect(bodyFitsFrame(getPartner(run).position, partnerBody, frame)).toBe(true);
    expect([getPlayer(run).position, getPartner(run).position]).toEqual(positions);
    expect(run.tick).toBe(beforePause.tick);

    expect(session.resume(true)).toHaveLength(1);
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.tick).toBe(beforePause.tick + 1);
  });
});
