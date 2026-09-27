import { describe, expect, it } from 'vitest';
import { animationSample } from '../../../src/presentation/character-animation';
import type { GameActor } from '../../../src/game/types';

function actor(role: 'cow' | 'crow', kind: GameActor['action']['kind'], moveId?: GameActor['action']['moveId']): GameActor {
  return { id: 1, role, team: 'ally', position: { x: 0, depth: 0 }, facing: 1,
    hp: 10, maxHp: 10, action: { kind, moveId, startedTick: 20, endTick: 30 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1,
    ...(role === 'cow' ? { comboStep: 0, comboDeadlineTick: 0, dodgeReadyTick: 0, specialMeter: 0 }
      : { active: true, lastProgressTick: 0 }) } as GameActor;
}

describe('character animation selection', () => {
  it('maps authoritative action phases and moves to distinct clips', () => {
    expect(animationSample(actor('cow', 'windup', 'cow1'), 25, false)).toEqual({ clip: 'cow1.windup', progress: .5 });
    expect(animationSample(actor('cow', 'active', 'cowHeavy'), 30, false)).toEqual({ clip: 'cowHeavy.active', progress: 1 });
    expect(animationSample(actor('cow', 'active', 'spin'), 19, false)).toEqual({ clip: 'spin.active', progress: 0 });
    expect(animationSample(actor('crow', 'active', 'crow'), 25, false).clip).toBe('crow.active');
  });
  it('selects idle, movement, reactions, and holds knockout', () => {
    expect(animationSample(actor('cow', 'idle'), 25, false).clip).toBe('Idle');
    expect(animationSample(actor('cow', 'idle'), 25, true).clip).toBe('Move');
    expect(animationSample(actor('cow', 'dodge'), 25, false).clip).toBe('Dodge');
    expect(animationSample(actor('cow', 'hurt'), 25, false).clip).toBe('Hurt');
    const crow = actor('crow', 'idle'); crow.hp = 0;
    expect(animationSample(crow, 25, false)).toEqual({ clip: 'KnockedOut', progress: 1 });
  });
});
