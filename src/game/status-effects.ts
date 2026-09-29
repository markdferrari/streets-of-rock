import type { EnemyState, GameEvent, RunState } from './types';

export function enemyIsStunned(enemy: EnemyState, tick: number): boolean {
  return enemy.hp > 0 && enemy.combatClass === 'normal' && enemy.stunnedUntilTick !== undefined && tick < enemy.stunnedUntilTick;
}

export function applyStun(run: RunState, enemyId: number, durationTicks: number): boolean {
  const enemy = run.actors.find((actor): actor is EnemyState => actor.team === 'enemy' && actor.id === enemyId);
  if (!enemy || enemy.hp <= 0 || enemy.combatClass !== 'normal' || !Number.isInteger(durationTicks) || durationTicks <= 0) return false;
  const until = run.tick + durationTicks;
  enemy.stunnedUntilTick = until;
  enemy.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  enemy.attackSlot = false;
  enemy.decisionReadyTick = until;
  run.attacks = run.attacks.filter(attack => attack.ownerId !== enemy.id);
  return true;
}

export function updateEnemyStatuses(run: RunState): { stunnedIds: number[]; expiredIds: number[] } {
  const stunnedIds: number[] = [];
  const expiredIds: number[] = [];
  for (const actor of run.actors) {
    if (actor.team !== 'enemy') continue;
    const enemy = actor as EnemyState;
    if (enemy.hp <= 0) {
      if (enemy.stunnedUntilTick !== undefined) delete enemy.stunnedUntilTick;
      enemy.attackSlot = false;
      continue;
    }
    if (enemy.combatClass !== 'normal' || enemy.stunnedUntilTick === undefined) continue;
    if (run.tick < enemy.stunnedUntilTick) {
      enemy.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
      enemy.attackSlot = false;
      stunnedIds.push(enemy.id);
      continue;
    }
    delete enemy.stunnedUntilTick;
    enemy.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
    enemy.attackSlot = false;
    enemy.decisionReadyTick = run.tick;
    expiredIds.push(enemy.id);
  }
  return { stunnedIds, expiredIds };
}

export function emitStatusEvents(run: RunState, events: GameEvent[], updated = updateEnemyStatuses(run)): void {
  for (const id of updated.stunnedIds) events.push({ type: 'stunned', tick: run.tick, actorId: id });
  for (const id of updated.expiredIds) events.push({ type: 'stun-ended', tick: run.tick, actorId: id });
}
