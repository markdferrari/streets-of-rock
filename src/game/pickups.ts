import type { GameEvent, RunState } from './types';
import { allocateEntityId } from './run';

export function updatePickups(run: RunState, events: GameEvent[]): void {
  const cow = run.actors.find(actor => actor.role === 'cow');
  if (!cow || cow.hp <= 0) return;
  for (const table of run.tables) {
    if (table.broken) continue;
    for (const attack of run.attacks) {
      if (attack.ownerId !== cow.id || run.tick >= attack.activeUntilTick || attack.hitTargetIds.includes(table.id)) continue;
      const dx = table.position.x - attack.origin.x;
      const dd = table.position.depth - attack.origin.depth;
      const hit = attack.moveId === 'spin' ? Math.hypot(dx, dd) <= attack.range : dx * attack.facing >= 0 && dx * attack.facing <= attack.range && Math.abs(dd) <= attack.depthTolerance;
      if (!hit) continue;
      attack.hitTargetIds.push(table.id);
      table.hp = Math.max(0, table.hp - attack.damage);
      if (table.hp === 0) {
        table.broken = true;
        table.pickupId = allocateEntityId(run);
        run.pickups.push({ id: table.pickupId, sourceTableId: table.id, position: { ...table.position }, available: true });
        events.push({ type: 'table-broken', tick: run.tick, actorId: cow.id, targetId: table.id });
      }
    }
  }
  for (const pickup of run.pickups) {
    if (!pickup.available || Math.hypot(cow.position.x - pickup.position.x, cow.position.depth - pickup.position.depth) > .5) continue;
    pickup.available = false;
    cow.hp = Math.min(cow.maxHp, cow.hp + cow.maxHp * .25);
    events.push({ type: 'pickup', tick: run.tick, actorId: cow.id, targetId: pickup.id });
  }
}
