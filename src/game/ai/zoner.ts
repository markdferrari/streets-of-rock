import type { EnemyState, GameEvent, RunState } from '../types';
import { allocateAttackId, allocateEntityId } from '../run';
import { assignAttackSlots } from './attack-slots';
import { getPlayer } from '../selectors';
import { enemyIsStunned } from '../status-effects';

export function updateZoners(run: RunState, events: GameEvent[]): void {
  assignAttackSlots(run);
  const cow = getPlayer(run);
  if (cow.hp <= 0) return;
  for (const zoner of run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.role === 'zoner').sort((a, b) => a.id - b.id)) {
    if (zoner.hp <= 0 || enemyIsStunned(zoner, run.tick)) { zoner.attackSlot = false; continue; }
    const dx = cow.position.x - zoner.position.x;
    const dd = cow.position.depth - zoner.position.depth;
    if (zoner.action.kind === 'idle') {
      if (Math.abs(dx) < 3 && zoner.position.x < 16) zoner.position.x += Math.sign(-dx || 1) * 2 / 60;
      if (!zoner.attackSlot || run.tick < zoner.decisionReadyTick) continue;
      zoner.facing = dx >= 0 ? 1 : -1;
      zoner.action = { kind: 'windup', moveId: 'throw', startedTick: run.tick, endTick: run.tick + 39 };
      events.push({ type: 'enemy-warning', tick: run.tick, actorId: zoner.id });
    } else if (zoner.action.kind === 'windup' && run.tick >= zoner.action.endTick) {
      zoner.action = { kind: 'active', moveId: 'throw', startedTick: run.tick, endTick: run.tick + 6 };
      const distance = Math.hypot(dx, dd) || 1;
      run.projectiles.push({ id: allocateEntityId(run), ownerId: zoner.id, attackId: allocateAttackId(run),
        position: { ...zoner.position }, previousPosition: { ...zoner.position },
        velocity: { x: dx / distance * 5 / 60, depth: dd / distance * 5 / 60 }, remainingTicks: 180 });
      events.push({ type: 'projectile', tick: run.tick, actorId: zoner.id });
    } else if (zoner.action.kind === 'active' && run.tick >= zoner.action.endTick) {
      zoner.action = { kind: 'recovery', moveId: 'throw', startedTick: run.tick, endTick: run.tick + 66 };
    } else if (zoner.action.kind === 'recovery' && run.tick >= zoner.action.endTick) {
      zoner.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
      zoner.attackSlot = false;
      zoner.decisionReadyTick = run.tick + 6;
    }
  }
}
