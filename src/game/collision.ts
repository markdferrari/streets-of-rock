import type { AttackInstance, GameActor, Position, RunState } from './types';
import { neonVelvet } from '../content/neon-velvet';
export function resolveActorOverlaps(run: RunState): void {
  const area = neonVelvet.areas[run.areaIndex];
  const allies = run.actors.filter(actor => actor.team === 'ally' && actor.hp > 0);
  for (const enemy of run.actors.filter(actor => actor.team === 'enemy' && actor.hp > 0).sort((a, b) => a.id - b.id)) {
    for (const ally of allies) {
      const dx = enemy.position.x - ally.position.x;
      const dd = enemy.position.depth - ally.position.depth;
      const distance = Math.hypot(dx, dd);
      if (distance >= .6) continue;
      const directionX = distance > 0 ? dx / distance : 1;
      const directionDepth = distance > 0 ? dd / distance : 0;
      enemy.position.x = Math.max(area?.minX ?? 0, Math.min(area?.maxX ?? 16, enemy.position.x + directionX * (.6 - distance)));
      enemy.position.depth = Math.max(area?.minDepth ?? -3, Math.min(area?.maxDepth ?? 3, enemy.position.depth + directionDepth * (.6 - distance)));
    }
  }
}
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
  if (attack.moveId === 'special' || attack.moveId === 'shockwave') return Math.hypot(dx, dd) <= attack.range;
  return dx * attack.facing >= 0 && dx * attack.facing <= attack.range && Math.abs(dd) <= attack.depthTolerance;
}
