import type { GameActor } from '../game/types';

export interface AnimationSample { clip: string; progress: number }

function allyClip(actor: GameActor, moveId: NonNullable<GameActor['action']['moveId']>): string {
  if (actor.role !== 'player' && actor.role !== 'partner') return moveId;
  if (moveId === 'support') return ({ cow: 'cow1', crow: 'crow', lion: 'lionSupport', plates: 'platesSupport' } as const)[actor.characterId as 'cow' | 'crow' | 'lion' | 'plates'];
  if (moveId === 'heavy') return ({ cow: 'cowHeavy', crow: 'crowHeavy', lion: 'lionHeavy', plates: 'platesHeavy' } as const)[actor.characterId as 'cow' | 'crow' | 'lion' | 'plates'];
  if (moveId === 'special') return ({ cow: 'spin', crow: 'wingSpin', lion: 'roar', plates: 'headrest' } as const)[actor.characterId as 'cow' | 'crow' | 'lion' | 'plates'];
  if (/^light[123]$/.test(moveId)) return `${actor.characterId}${moveId.at(-1)}`;
  return moveId;
}

export function animationSample(actor: GameActor, tick: number, moving: boolean): AnimationSample {
  if (actor.hp <= 0 || actor.action.kind === 'knockedOut') return { clip: 'KnockedOut', progress: 1 };
  const action = actor.action;
  const progress = Math.max(0, Math.min(1, (tick - action.startedTick) / Math.max(1, action.endTick - action.startedTick)));
  if ((action.kind === 'windup' || action.kind === 'active' || action.kind === 'recovery') && action.moveId) {
    return { clip: `${allyClip(actor, action.moveId)}.${action.kind}`, progress };
  }
  if (action.kind === 'dodge') return { clip: 'Dodge', progress };
  if (action.kind === 'hurt') return { clip: 'Hurt', progress };
  return { clip: moving ? 'Move' : 'Idle', progress: (tick % 28) / 28 };
}
