import type { GameEvent, RunState } from './types';
import { segmentCircleEntryFraction, sweptCircleContact } from './collision';

export function updateProjectiles(run: RunState, events: GameEvent[]): void {
  const remaining = [];
  for (const projectile of run.projectiles) {
    const owner = run.actors.find(actor => actor.id === projectile.ownerId);
    if (!owner || owner.hp <= 0) continue;
    if (projectile.kind === 'headrest') {
      const distance = Math.min(projectile.speedPerSecond / 60, projectile.remainingDistance);
      const start = { ...projectile.position };
      const end = { x: start.x + projectile.direction.x * distance, depth: start.depth + projectile.direction.depth * distance };
      const contacts = run.actors.filter(actor => actor.team !== owner.team && actor.hp > 0).map(target => ({
        target,
        fraction: segmentCircleEntryFraction(start, end, target.position, projectile.radius + .45),
      })).filter((hit): hit is { target: typeof run.actors[number]; fraction: number } => hit.fraction !== null)
        .sort((a, b) => a.fraction - b.fraction || a.target.id - b.target.id);
      const impact = contacts[0];
      if (impact) {
        projectile.position = { x: start.x + (end.x - start.x) * impact.fraction,
          depth: start.depth + (end.depth - start.depth) * impact.fraction };
        const target = impact.target;
        if (run.tick >= target.protectionUntilTick) {
          target.hp = Math.max(0, target.hp - projectile.damage);
          if (target.role === 'partner' && target.hp === 0) target.active = false;
          events.push({ type: 'headrest-hit', tick: run.tick, actorId: owner.id, targetId: target.id });
        } else events.push({ type: 'headrest-blocked', tick: run.tick, actorId: owner.id, targetId: target.id });
        continue;
      }
      projectile.position = end;
      projectile.remainingDistance = Math.max(0, projectile.remainingDistance - distance);
      if (projectile.remainingDistance > 1e-9) remaining.push(projectile);
      else events.push({ type: 'headrest-miss', tick: run.tick, actorId: owner.id });
      continue;
    }
    projectile.previousPosition = { ...projectile.position };
    projectile.position.x += projectile.velocity.x;
    projectile.position.depth += projectile.velocity.depth;
    projectile.remainingTicks--;
    let consumed = false;
    for (const target of run.actors.filter(actor => actor.team !== owner.team && actor.hp > 0).sort((a, b) => a.id - b.id)) {
      if (!sweptCircleContact(projectile.previousPosition, projectile.position, target.position, .45)) continue;
      consumed = true;
      if (run.tick >= target.protectionUntilTick) {
        target.hp = Math.max(0, target.hp - 24);
        if (target.role === 'player') target.protectionUntilTick = run.tick + 36;
        if (target.role === 'partner' && target.hp === 0) target.active = false;
        events.push({ type: 'hit', tick: run.tick, actorId: owner.id, targetId: target.id });
      }
      break;
    }
    if (!consumed && projectile.remainingTicks > 0 && projectile.position.x >= -2 && projectile.position.x <= 72 && Math.abs(projectile.position.depth) <= 4) remaining.push(projectile);
  }
  run.projectiles = remaining;
}
