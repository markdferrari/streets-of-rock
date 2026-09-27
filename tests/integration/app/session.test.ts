import { describe, expect, it } from 'vitest';
import { RunSession } from '../../../src/app/session';

describe('run session', () => {
  it('loads, starts, stops on Cow defeat, and retries with fresh state', () => {
    const session = new RunSession();
    expect(session.phase).toBe('loading');
    session.loaded();
    expect(session.phase).toBe('title');
    session.start();
    expect(session.phase).toBe('running');
    const first = session.run!;
    first.actors[0]!.hp = 0;
    session.finish();
    expect(session.phase).toBe('defeat');
    session.retry();
    expect(session.phase).toBe('running');
    expect(session.run).not.toBe(first);
    expect(session.run!.actors[0]!.hp).toBe(500);
    expect(session.run!.tick).toBe(0);
  });
  it('requires explicit resume and gives defeat precedence on a lethal tie', () => {
    const session = new RunSession();
    session.loaded(); session.start(); session.pause();
    expect(session.phase).toBe('paused');
    session.resume();
    expect(session.phase).toBe('running');
    session.run!.actors[0]!.hp = 0;
    session.run!.result = 'victory';
    session.finish();
    expect(session.phase).toBe('defeat');
  });
});
