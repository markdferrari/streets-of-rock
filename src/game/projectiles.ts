import type { GameEvent, RunState } from './types';
import { sweptCircleContact } from './collision';

export function updateProjectiles(run: RunState, events: GameEvent[]): void {
  const remaining = [];
  for (const projectile of run.projectiles) {
    const owner = run.actors.find(actor => actor.id === projectile.ownerId);
    if (!owner || owner.hp <= 0) continue;
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
