import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { stepRun, type TickStage } from '../../../src/game/step';

describe('tick pipeline', () => {
  it('executes deterministic stages and gives each tick a fresh event list', () => {
    const run = fixtureRun();
    const called: string[] = [];
    const stages: TickStage[] = ['input', 'ai', 'movement', 'contacts', 'damage', 'terminal', 'progression'].map(name => ({
      name,
      apply: (_state, _input, events) => { called.push(name); events.push({ type: name, tick: run.tick }); },
    }));
    const first = stepRun(run, { move: { x: 0, depth: 0 } }, stages);
    expect(called).toEqual(['input', 'ai', 'movement', 'contacts', 'damage', 'terminal', 'progression']);
    expect(first.map(event => event.tick)).toEqual(Array(7).fill(0));
    expect(run.tick).toBe(1);
    const second = stepRun(run, { move: { x: 0, depth: 0 } }, stages);
    expect(second).not.toBe(first);
    expect(first.length).toBe(7);
    expect(second[0]?.tick).toBe(1);
  });

  it('does not advance a terminal run', () => {
    const run = fixtureRun();
    run.result = 'defeat';
    expect(stepRun(run, { move: { x: 1, depth: 0 } })).toEqual([]);
    expect(run.tick).toBe(0);
  });

  it('resolves a lethal tie as defeat before progression', () => {
    const run = fixtureRun();
    run.actors.push({ ...run.actors[1]!, id: 3, role: 'liam', team: 'enemy', hp: 0, maxHp: 1600 });
    run.actors[0]!.hp = 0;
    stepRun(run, { move: { x: 0, depth: 0 } });
    expect(run.result).toBe('defeat');
  });
});
