import type { Actor, CowState, CrowState, RunState } from './types';

function baseActor(id: number, role: 'cow' | 'crow', hp: number): Actor {
  return {
    id, role, team: 'ally', position: { x: role === 'cow' ? 0 : -0.8, depth: 0 },
    facing: 1, hp, maxHp: hp, action: { kind: 'idle', startedTick: 0, endTick: 0 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1,
  };
}

export function createRun(runId: number): RunState {
  const cow: CowState = { ...baseActor(1, 'cow', 500), role: 'cow', comboStep: 0, comboDeadlineTick: 0, dodgeReadyTick: 0, specialMeter: 0 };
  const crow: CrowState = { ...baseActor(2, 'crow', 240), role: 'crow', active: true, lastProgressTick: 0 };
  return {
    runId, tick: 0, nextEntityId: 3, nextAttackId: 1, areaIndex: 0, waveIndex: 0,
    actors: [cow, crow], attacks: [], projectiles: [], tables: [], pickups: [],
    encounter: { areaId: 'dance-floor', waveIndex: 0, status: 'awaitingEntry', aliveEnemyIds: [], cameraCenter: 0 },
    result: null,
  };
}
export function allocateEntityId(run: RunState): number { return run.nextEntityId++; }
export function allocateAttackId(run: RunState): number { return run.nextAttackId++; }
