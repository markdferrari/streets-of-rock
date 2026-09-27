import type { GameActor } from '../game/types';

export interface AnimationSample { clip: string; progress: number }

export function animationSample(actor: GameActor, tick: number, moving: boolean): AnimationSample {
  if (actor.hp <= 0 || actor.action.kind === 'knockedOut') return { clip: 'KnockedOut', progress: 1 };
  const action = actor.action;
  const progress = Math.max(0, Math.min(1, (tick - action.startedTick) / Math.max(1, action.endTick - action.startedTick)));
  if ((action.kind === 'windup' || action.kind === 'active' || action.kind === 'recovery') && action.moveId) {
    return { clip: `${action.moveId}.${action.kind}`, progress };
  }
  if (action.kind === 'dodge') return { clip: 'Dodge', progress };
  if (action.kind === 'hurt') return { clip: 'Hurt', progress };
  return { clip: moving ? 'Move' : 'Idle', progress: (tick % 28) / 28 };
}
