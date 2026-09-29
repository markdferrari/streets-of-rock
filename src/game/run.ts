import type { Actor, RunState } from './types';
import { characters } from '../content/characters';
import type { DuoAssignment } from './duo';
import { validateDuo } from './duo';

function baseActor(id: number, role: 'player' | 'partner', hp: number): Actor {
  return {
    id, role, team: 'ally', position: { x: role === 'player' ? 0 : -0.8, depth: 0 },
    facing: 1, hp, maxHp: hp, action: { kind: 'idle', startedTick: 0, endTick: 0 },
    protectionUntilTick: 0, decisionReadyTick: 0, attackSlot: false, phase: 1,
  };
}

export function createRun(runId: number, assignment: DuoAssignment): RunState {
  const duo = validateDuo(assignment, characters);
  const fighter = characters.find(character => character.id === duo.fighterId)!;
  const partner = characters.find(character => character.id === duo.partnerId)!;
  return {
    runId, duo, tick: 0, nextEntityId: 3, nextAttackId: 1, areaIndex: 0, waveIndex: 0,
    actors: [
      { ...baseActor(1, 'player', fighter.playerProfile.maxHp), role: 'player', characterId: fighter.id,
        comboStep: 0, comboDeadlineTick: 0, dodgeReadyTick: 0, specialMeter: 0 },
      { ...baseActor(2, 'partner', partner.partnerProfile.maxHp), role: 'partner', characterId: partner.id,
        active: true, lastProgressTick: 0,
        intentState: { intent: 'idle', targetId: null, destination: null, lastHorizontalFacing: 1,
          blockedTicks: 0, blockedDestination: null, lastResolvedPosition: { x: -0.8, depth: 0 }, lastRecoveryTick: -120 } },
    ],
    attacks: [], projectiles: [], tables: [], pickups: [],
    encounter: { areaId: 'dance-floor', waveIndex: 0, status: 'awaitingEntry', aliveEnemyIds: [], cameraCenter: 0 },
    result: null,
  };
}
export function allocateEntityId(run: RunState): number { return run.nextEntityId++; }
export function allocateAttackId(run: RunState): number { return run.nextAttackId++; }
