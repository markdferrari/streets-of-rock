import { createRun } from '../../src/game/run';
import type { EnemyState } from '../../src/game/types';

export function fixtureRun() { return createRun(7, { fighterId: 'cow', partnerId: 'crow' }); }
export function fixtureEnemy(id: number, role: EnemyState['role'] = 'grunt', x = 1, depth = 0): EnemyState {
  const hp = { grunt: 120, zoner: 180, enforcer: 340, liam: 1600 }[role];
  return { id, role, team: 'enemy', position: { x, depth }, facing: -1, hp, maxHp: hp,
    action: { kind: 'idle', startedTick: 0, endTick: 0 }, protectionUntilTick: 0,
    decisionReadyTick: 0, attackSlot: false, phase: 1 };
}
