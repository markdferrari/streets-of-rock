import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { combatHudMarkup } from '../../../src/ui/combat';
import { TutorialProgress } from '../../../src/ui/tutorial';
import type { CowState, CrowState } from '../../../src/game/types';

describe('combat feedback', () => {
  it('labels health, meter, availability and companion status without relying on color', () => {
    const run = fixtureRun();
    (run.actors[0] as CowState).specialMeter = 100;
    (run.actors[1] as CrowState).active = false;
    run.actors[1]!.hp = 0;
    const html = combatHudMarkup(run);
    expect(html).toContain('Cow 500 / 500');
    expect(html).toContain('Crow knocked out');
    expect(html).toContain('Special ready');
    expect(html).toContain('Pause');
  });
  it('describes cooldown and an unavailable action in text', () => {
    const run = fixtureRun();
    (run.actors[0] as CowState).dodgeReadyTick = 54;
    const html = combatHudMarkup(run, 'Special not ready');
    expect(html).toContain('Dodge 0.9s');
    expect(html).toContain('Special not ready');
  });
  it('completes prompts only after valid actions and remembers supplied completion', () => {
    const tutorial = new TutorialProgress(['movement']);
    expect(tutorial.nextPrompt()).toBe('attack');
    expect(tutorial.accept([{ type: 'unavailable', tick: 0 }], false)).toEqual([]);
    expect(tutorial.nextPrompt()).toBe('attack');
    expect(tutorial.accept([{ type: 'attack', tick: 1 }], false)).toEqual(['attack']);
    expect(tutorial.nextPrompt()).toBe('dodge');
    expect(tutorial.completed()).toEqual(['movement', 'attack']);
  });
  it('waits for a warning before dodge and a ready meter before special', () => {
    const run = fixtureRun();
    const tutorial = new TutorialProgress(['movement', 'attack']);
    expect(tutorial.suggest(run)).toBeNull();
    tutorial.accept([{ type: 'enemy-warning', tick: 0 }], false);
    expect(tutorial.suggest(run)).toBe('dodge');
    tutorial.accept([{ type: 'dodge', tick: 1 }], false);
    expect(tutorial.suggest(run)).toBeNull();
    (run.actors[0] as CowState).specialMeter = 100;
    expect(tutorial.suggest(run)).toBe('special');
  });
});
