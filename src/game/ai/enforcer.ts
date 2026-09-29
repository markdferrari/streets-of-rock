import type { EnemyState, GameEvent, RunState } from '../types';
import { allocateAttackId } from '../run';
import { assignAttackSlots } from './attack-slots';
import { getPlayer } from '../selectors';
import { enemyIsStunned } from '../status-effects';

export function updateEnforcers(run: RunState, events: GameEvent[]): void {
  assignAttackSlots(run);
  const cow = getPlayer(run);
  if (cow.hp <= 0) return;
  for (const enemy of run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.role === 'enforcer').sort((a, b) => a.id - b.id)) {
    if (enemy.hp <= 0 || enemyIsStunned(enemy, run.tick)) { enemy.attackSlot = false; continue; }
    if (enemy.action.kind === 'idle') {
      const dx = cow.position.x - enemy.position.x;
      if (Math.abs(dx) > 4) { enemy.position.x += Math.sign(dx) * 1.5 / 60; continue; }
      if (!enemy.attackSlot || run.tick < enemy.decisionReadyTick) continue;
      enemy.facing = dx >= 0 ? 1 : -1;
      enemy.action = { kind: 'windup', moveId: 'charge', startedTick: run.tick, endTick: run.tick + 51 };
      events.push({ type: 'enemy-warning', tick: run.tick, actorId: enemy.id });
    } else if (enemy.action.kind === 'windup' && run.tick >= enemy.action.endTick) {
      enemy.action = { kind: 'active', moveId: 'charge', startedTick: run.tick, endTick: run.tick + 30 };
      run.attacks.push({ id: allocateAttackId(run), ownerId: enemy.id, moveId: 'charge', origin: { ...enemy.position }, facing: enemy.facing,
        activeUntilTick: enemy.action.endTick, range: 1, depthTolerance: .6, damage: 40, hitTargetIds: [] });
    } else if (enemy.action.kind === 'active' && run.tick >= enemy.action.endTick) {
      enemy.action = { kind: 'recovery', moveId: 'charge', startedTick: run.tick, endTick: run.tick + 60 };
    } else if (enemy.action.kind === 'active') {
      enemy.position.x = Math.max(0, Math.min(70, enemy.position.x + enemy.facing * 7 / 60));
      const attack = run.attacks.find(item => item.ownerId === enemy.id && item.moveId === 'charge');
      if (attack) attack.origin = { ...enemy.position };
    } else if (enemy.action.kind === 'recovery' && run.tick >= enemy.action.endTick) {
      enemy.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
      enemy.decisionReadyTick = run.tick + 6;
      enemy.attackSlot = false;
    }
  }
}
