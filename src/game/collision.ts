import type { AttackInstance, GameActor } from './types';
export function attackHits(attack: AttackInstance, target: GameActor): boolean {
  if (target.hp <= 0 || attack.hitTargetIds.includes(target.id)) return false;
  const dx = target.position.x - attack.origin.x;
  const dd = target.position.depth - attack.origin.depth;
  if (attack.moveId === 'spin' || attack.moveId === 'shockwave') return Math.hypot(dx, dd) <= attack.range;
  return dx * attack.facing >= 0 && dx * attack.facing <= attack.range && Math.abs(dd) <= attack.depthTolerance;
}
