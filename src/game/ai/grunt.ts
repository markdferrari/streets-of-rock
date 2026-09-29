import type { EnemyState, GameEvent, RunState } from '../types';
import { allocateAttackId } from '../run';
import { assignAttackSlots } from './attack-slots';
import { getPlayer } from '../selectors';
import { enemyIsStunned } from '../status-effects';

export function updateGrunts(run: RunState, events: GameEvent[]): void {
  assignAttackSlots(run);
  const cow = getPlayer(run);
  if (cow.hp <= 0) return;
  for (const grunt of run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.role === 'grunt').sort((a, b) => a.id - b.id)) {
    if (grunt.hp <= 0 || enemyIsStunned(grunt, run.tick)) continue;
    if (!grunt.attackSlot) {
      grunt.position.depth = Math.max(-3, Math.min(3, grunt.position.depth + (grunt.id % 2 ? .02 : -.02)));
      continue;
    }
    if (grunt.action.kind === 'idle' && run.tick >= grunt.decisionReadyTick) {
      const dx = cow.position.x - grunt.position.x;
      if (Math.abs(dx) > 1.5 || Math.abs(cow.position.depth - grunt.position.depth) > .45) {
        grunt.position.x += Math.sign(dx) * .04;
        continue;
      }
      grunt.facing = dx >= 0 ? 1 : -1;
      grunt.action = { kind: 'windup', moveId: 'grunt', startedTick: run.tick, endTick: run.tick + 27 };
      events.push({ type: 'enemy-warning', tick: run.tick, actorId: grunt.id });
    } else if (grunt.action.kind === 'windup' && run.tick >= grunt.action.endTick) {
      grunt.action = { kind: 'active', moveId: 'grunt', startedTick: run.tick, endTick: run.tick + 6 };
      run.attacks.push({ id: allocateAttackId(run), ownerId: grunt.id, moveId: 'grunt', origin: { ...grunt.position }, facing: grunt.facing,
        activeUntilTick: grunt.action.endTick, range: 1.5, depthTolerance: .45, damage: 18, hitTargetIds: [] });
    } else if (grunt.action.kind === 'active' && run.tick >= grunt.action.endTick) {
      grunt.action = { kind: 'recovery', moveId: 'grunt', startedTick: run.tick, endTick: run.tick + 45 };
    } else if (grunt.action.kind === 'recovery' && run.tick >= grunt.action.endTick) {
      grunt.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
      grunt.decisionReadyTick = run.tick + 6;
      grunt.attackSlot = false;
    }
  }
}
