import type { EnemyState, RunState } from '../game/types';
import { allocateEntityId } from '../game/run';

export function addTrainingGrunt(run: RunState): void {
  const grunt: EnemyState = {
    id: allocateEntityId(run), role: 'grunt', team: 'enemy', position: { x: 2.5, depth: 0 }, facing: -1,
    hp: 120, maxHp: 120, action: { kind: 'idle', startedTick: 0, endTick: 0 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1,
  };
  run.actors.push(grunt);
  run.encounter.status = 'active';
  run.encounter.aliveEnemyIds = [grunt.id];
}
