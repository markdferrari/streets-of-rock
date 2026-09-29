import { describe, expect, it } from 'vitest';
import { animationSample } from '../../../src/presentation/character-animation';
import type { GameActor } from '../../../src/game/types';

function actor(identity: 'cow' | 'crow', kind: GameActor['action']['kind'], moveId?: GameActor['action']['moveId'],
  role: 'player' | 'partner' = identity === 'cow' ? 'player' : 'partner'): GameActor {
  const base = { id: 1, characterId: identity, team: 'ally' as const, position: { x: 0, depth: 0 }, facing: 1 as const,
    hp: 10, maxHp: 10, action: { kind, moveId, startedTick: 20, endTick: 30 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1 as const };
  return role === 'player'
    ? { ...base, role, comboStep: 0, comboDeadlineTick: 0, dodgeReadyTick: 0, specialMeter: 0 }
    : { ...base, role, active: true, lastProgressTick: 0 };
}

describe('character animation selection', () => {
  it('maps authoritative action phases and moves to distinct clips', () => {
    expect(animationSample(actor('cow', 'windup', 'light1'), 25, false)).toEqual({ clip: 'cow1.windup', progress: .5 });
    expect(animationSample(actor('cow', 'active', 'heavy'), 30, false)).toEqual({ clip: 'cowHeavy.active', progress: 1 });
    expect(animationSample(actor('cow', 'active', 'special'), 19, false)).toEqual({ clip: 'spin.active', progress: 0 });
    expect(animationSample(actor('crow', 'active', 'support'), 25, false).clip).toBe('crow.active');
    expect(animationSample(actor('crow', 'active', 'special', 'player'), 25, false).clip).toBe('wingSpin.active');
    expect(animationSample(actor('cow', 'active', 'support', 'partner'), 25, false).clip).toBe('cow1.active');
    expect(animationSample(actor('crow', 'active', 'light1', 'player'), 25, false).clip).toBe('crow1.active');
    expect(animationSample(actor('cow', 'active', 'special', 'player'), 25, false).clip).toBe('spin.active');
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
