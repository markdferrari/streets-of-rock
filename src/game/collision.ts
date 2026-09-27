import type { AttackInstance, GameActor, Position } from './types';
export function sweptCircleContact(start: Position, end: Position, target: Position, radius: number): boolean {
  if (![start.x, start.depth, end.x, end.depth, target.x, target.depth, radius].every(Number.isFinite) || radius < 0) return false;
  const dx = end.x - start.x;
  const dd = end.depth - start.depth;
  const lengthSquared = dx * dx + dd * dd;
  const fraction = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((target.x - start.x) * dx + (target.depth - start.depth) * dd) / lengthSquared));
  return Math.hypot(target.x - (start.x + dx * fraction), target.depth - (start.depth + dd * fraction)) <= radius;
}
export function attackHits(attack: AttackInstance, target: GameActor): boolean {
  if (target.hp <= 0 || attack.hitTargetIds.includes(target.id)) return false;
  const dx = target.position.x - attack.origin.x;
  const dd = target.position.depth - attack.origin.depth;
  if (attack.moveId === 'spin' || attack.moveId === 'shockwave') return Math.hypot(dx, dd) <= attack.range;
  return dx * attack.facing >= 0 && dx * attack.facing <= attack.range && Math.abs(dd) <= attack.depthTolerance;
}
