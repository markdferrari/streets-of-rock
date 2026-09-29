import type { EnemyState, GameEvent, RunState } from './types';
import { neonVelvet, vipTables } from '../content/neon-velvet';
import { allocateEntityId } from './run';
import { getPlayer } from './selectors';

function spawnWave(run: RunState, events: GameEvent[]): void {
  const area = neonVelvet.areas[run.areaIndex];
  const wave = area?.waves[run.encounter.waveIndex];
  if (!area || !wave) return;
  run.encounter.areaId = area.id;
  run.encounter.status = 'active';
  run.encounter.cameraCenter = (area.minX + area.maxX) / 2;
  run.encounter.aliveEnemyIds = [];
  for (const spawn of wave) {
    const hp = { grunt: 120, zoner: 180, enforcer: 340, liam: 1600 }[spawn.role];
    const enemy: EnemyState = { id: allocateEntityId(run), role: spawn.role, team: 'enemy', position: { x: spawn.x, depth: spawn.depth },
      facing: -1, hp, maxHp: hp, action: { kind: 'idle', startedTick: run.tick, endTick: run.tick },
      protectionUntilTick: 0, decisionReadyTick: run.tick, attackSlot: false, phase: 1 };
    run.actors.push(enemy);
    run.encounter.aliveEnemyIds.push(enemy.id);
  }
  if (area.id === 'vip-lounge' && run.tables.length === 0) {
    for (const position of vipTables) run.tables.push({ id: allocateEntityId(run), areaId: area.id, position: { ...position }, hp: 24, broken: false });
  }
  events.push({ type: 'wave', tick: run.tick });
}

export function updateEncounters(run: RunState, events: GameEvent[]): void {
  if (run.result) return;
  const area = neonVelvet.areas[run.areaIndex];
  const cow = getPlayer(run);
  if (!area || cow.hp <= 0) return;
  if (run.encounter.status === 'awaitingEntry') {
    if (cow.position.x >= area.minX) spawnWave(run, events);
    return;
  }
  if (run.encounter.status === 'active') {
    run.encounter.aliveEnemyIds = run.encounter.aliveEnemyIds.filter(id => (run.actors.find(actor => actor.id === id)?.hp ?? 0) > 0);
    if (run.encounter.aliveEnemyIds.length > 0) return;
    if (run.encounter.waveIndex + 1 < area.waves.length) {
      run.encounter.waveIndex++;
      run.waveIndex = run.encounter.waveIndex;
      spawnWave(run, events);
    } else {
      run.encounter.status = 'cleared';
      events.push({ type: 'go', tick: run.tick });
    }
    return;
  }
  const next = neonVelvet.areas[run.areaIndex + 1];
  if (next && cow.position.x >= next.minX) {
    run.areaIndex++;
    run.waveIndex = 0;
    run.encounter = { areaId: next.id, waveIndex: 0, status: 'awaitingEntry', aliveEnemyIds: [], cameraCenter: (next.minX + next.maxX) / 2 };
    spawnWave(run, events);
  }
}
