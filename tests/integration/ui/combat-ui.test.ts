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
  it('completes prompts only after valid actions and remembers supplied completion', () => {
    const tutorial = new TutorialProgress(['movement']);
    expect(tutorial.nextPrompt()).toBe('attack');
    expect(tutorial.accept([{ type: 'unavailable', tick: 0 }], false)).toEqual([]);
    expect(tutorial.nextPrompt()).toBe('attack');
    expect(tutorial.accept([{ type: 'attack', tick: 1 }], false)).toEqual(['attack']);
    expect(tutorial.nextPrompt()).toBe('dodge');
    expect(tutorial.completed()).toEqual(['movement', 'attack']);
  });
});
