import { describe, expect, it } from 'vitest';
import { RunSession } from '../../../src/app/session';
import { createRun } from '../../../src/game/run';

function choose(session: RunSession, fighterId: 'cow' | 'crow', partnerId: 'cow' | 'crow') {
  session.select({ type: 'activate', id: fighterId, ready: false });
  session.select({ type: 'activate', id: fighterId, ready: true });
  session.select({ type: 'activate', id: partnerId, ready: false });
  return session.select({ type: 'activate', id: partnerId, ready: true });
}

describe('run session ownership', () => {
  it('selects a locked duo and requests preparation without starting a run', () => {
    const session = new RunSession(() => 0);
    expect(session.snapshot()).toMatchObject({ phase: 'selecting', duo: null, run: null });
    const effects = choose(session, 'crow', 'cow');
    expect(session.snapshot()).toMatchObject({ phase: 'preparing', duo: { fighterId: 'crow', partnerId: 'cow' }, run: null });
    expect(effects).toContainEqual({ type: 'prepare', duo: { fighterId: 'crow', partnerId: 'cow' }, generation: 1 });
    expect(session.snapshot().generation).toBe(1);
  });

  it('ignores stale readiness/failure and keeps zero ticks until countdown completion', () => {
    let now = 0;
    const session = new RunSession(() => now);
    choose(session, 'cow', 'crow');
    const run = createRun(1, { fighterId: 'cow', partnerId: 'crow' });
    session.prepared(0, run);
    session.preparationFailed(0, 'old failure');
    expect(session.snapshot().phase).toBe('preparing');
    session.prepared(1, run);
    expect(session.snapshot()).toMatchObject({ phase: 'countdown', run });
    now = 1000; session.frame(); expect(session.snapshot().countdown?.number).toBe(2);
    now = 2000; session.frame(); expect(session.snapshot().countdown?.number).toBe(1);
    expect(run.tick).toBe(0);
    now = 3000;
    expect(session.frame()).toContainEqual({ type: 'launch', run });
    expect(session.frame()).toEqual([]);
    expect(session.snapshot().phase).toBe('running');
    expect(run.tick).toBe(0);
  });

  it('latches preparation/countdown interruption until explicit safe Resume', () => {
    let now = 0;
    const session = new RunSession(() => now);
    choose(session, 'cow', 'crow');
    session.interrupt();
    expect(session.snapshot()).toMatchObject({ phase: 'paused', resumeTarget: 'preparing' });
    session.prepared(1, createRun(2, { fighterId: 'cow', partnerId: 'crow' }));
    expect(session.snapshot()).toMatchObject({ phase: 'paused', resumeTarget: 'countdown' });
    now = 30000; expect(session.frame()).toEqual([]);
    expect(session.resume(false)).toEqual([]);
    expect(session.snapshot().phase).toBe('paused');
    session.resume(true);
    expect(session.snapshot().phase).toBe('countdown');
    now += 400; session.frame();
    session.interrupt();
    expect(session.snapshot().countdown?.numberElapsedMs).toBe(400);
    now += 30000; session.resume(true);
    now += 600; session.frame();
    expect(session.snapshot().countdown?.number).toBe(2);
  });

  it('retries errors/results with the same duo and resets on homepage', () => {
    let now = 0;
    const session = new RunSession(() => now);
    choose(session, 'crow', 'cow');
    session.preparationFailed(1, 'offline');
    expect(session.snapshot()).toMatchObject({ phase: 'error', duo: { fighterId: 'crow', partnerId: 'cow' }, error: 'offline' });
    expect(session.retry()).toContainEqual({ type: 'prepare', duo: { fighterId: 'crow', partnerId: 'cow' }, generation: 2 });
    const run = createRun(3, { fighterId: 'crow', partnerId: 'cow' });
    session.prepared(2, run);
    session.interrupt();
    session.resume(true);
    for (let second = 1; second <= 3; second++) { now = second * 1000; session.frame(); }
    expect(session.snapshot().phase).toBe('running');
    run.actors[0]!.hp = 0;
    session.finish();
    expect(session.snapshot().phase).toBe('defeat');
    expect(session.retry()).toContainEqual({ type: 'prepare', duo: { fighterId: 'crow', partnerId: 'cow' }, generation: 3 });
    expect(session.snapshot().run).toBeNull();
    session.home();
    expect(session.snapshot()).toMatchObject({ phase: 'selecting', duo: null, run: null });
  });
});
