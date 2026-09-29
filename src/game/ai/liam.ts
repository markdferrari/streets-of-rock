import type { EnemyState, GameEvent, RunState } from '../types';
import { allocateAttackId } from '../run';
import { assignAttackSlots } from './attack-slots';
import { getPlayer } from '../selectors';

export function updateLiam(run: RunState, events: GameEvent[]): void {
  assignAttackSlots(run);
  const liam = run.actors.find(actor => actor.role === 'liam') as EnemyState | undefined;
  const cow = getPlayer(run);
  if (!liam || liam.hp <= 0 || cow.hp <= 0) return;
  if (liam.phase === 1 && liam.hp < liam.maxHp / 2) {
    liam.phase = 2;
    liam.shockwaveReadyTick = run.tick;
    events.push({ type: 'boss-phase', tick: run.tick, actorId: liam.id });
  }
  const dx = cow.position.x - liam.position.x;
  if (liam.action.kind === 'idle') {
    if (!liam.attackSlot) return;
    const shockwaveDue = liam.phase === 2 && run.tick >= (liam.shockwaveReadyTick ?? 0);
    if (!shockwaveDue && Math.abs(dx) > 3) {
      liam.position.x += Math.sign(dx) * 1.8 / 60;
      return;
    }
    const moveId = shockwaveDue ? 'shockwave' : Math.abs(dx) <= 1.1 ? 'close' : 'rope';
    const windup = moveId === 'shockwave' ? 60 : moveId === 'rope' ? 42 : 27;
    liam.facing = dx >= 0 ? 1 : -1;
    liam.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + windup };
    events.push({ type: 'enemy-warning', tick: run.tick, actorId: liam.id });
  } else if (liam.action.kind === 'windup' && run.tick >= liam.action.endTick) {
    const moveId = liam.action.moveId!;
    liam.action = { kind: 'active', moveId, startedTick: run.tick, endTick: run.tick + (moveId === 'rope' ? 9 : 6) };
    run.attacks.push({ id: allocateAttackId(run), ownerId: liam.id, moveId,
      origin: { ...liam.position }, facing: liam.facing, activeUntilTick: liam.action.endTick,
      range: moveId === 'shockwave' ? 20 : moveId === 'rope' ? 3 : 1.1,
      depthTolerance: moveId === 'shockwave' ? 6 : .45,
      damage: moveId === 'shockwave' ? 45 : moveId === 'rope' ? 30 : 24, hitTargetIds: [] });
    if (moveId === 'shockwave') liam.shockwaveReadyTick = run.tick + 360;
  } else if (liam.action.kind === 'active' && run.tick >= liam.action.endTick) {
    const moveId = liam.action.moveId!;
    liam.action = { kind: 'recovery', moveId, startedTick: run.tick, endTick: run.tick + (moveId === 'shockwave' ? 72 : moveId === 'rope' ? 54 : 45) };
  } else if (liam.action.kind === 'recovery' && run.tick >= liam.action.endTick) {
    liam.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
    liam.attackSlot = false;
  }
}
