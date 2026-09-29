import type { ActionRequest, GameEvent, InputFrame, PendingAction, PlayerAction, PlayerState, RunState } from './types';
import { allocateAttackId } from './run';
import { getPlayer } from './selectors';
import { playerMoveId, playerMoveTuning } from './moves';
import type { ArenaContext } from './arena';
import { prepareSpecial, releaseSpecial } from './specials';

type Controlled = PlayerState;
function eligible(run: RunState, cow: Controlled, kind: PlayerAction): boolean {
  if (cow.hp <= 0) return false;
  if (kind === 'dodge') return run.tick >= cow.dodgeReadyTick;
  if (kind === 'special') return cow.specialMeter >= 100;
  return true;
}

function start(run: RunState, cow: Controlled, kind: PlayerAction, input: InputFrame, events: GameEvent[], arena?: ArenaContext): boolean {
  if (cow.hp <= 0 || cow.action.kind !== 'idle' || !eligible(run, cow, kind)) return false;
  if (kind === 'dodge') {
    cow.action = { kind: 'dodge', startedTick: run.tick, endTick: run.tick + 18 };
    cow.dodgeReadyTick = run.tick + 54;
    const magnitude = Math.hypot(input.move.x, input.move.depth);
    cow.dodgeDirection = magnitude > 0 && Number.isFinite(magnitude)
      ? { x: input.move.x / magnitude, depth: input.move.depth / magnitude }
      : { x: cow.facing, depth: 0 };
    cow.protectionUntilTick = Math.max(cow.protectionUntilTick, run.tick + 12);
    events.push({ type: 'dodge', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (kind === 'special') {
    if (!prepareSpecial(run, cow, arena, events)) return false;
    cow.specialMeter = 0;
    const moveId = playerMoveId('special');
    cow.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + playerMoveTuning(run, moveId)!.windup };
    events.push({ type: 'special', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (kind === 'heavy') {
    cow.comboStep = 0;
    cow.comboDeadlineTick = 0;
    const moveId = playerMoveId('heavy');
    cow.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + playerMoveTuning(run, moveId)!.windup };
    events.push({ type: 'heavy', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (run.tick > cow.comboDeadlineTick) cow.comboStep = 0;
  const moveId = playerMoveId('light', cow.comboStep);
  cow.comboStep = ((cow.comboStep + 1) % 3) as PlayerState['comboStep'];
  cow.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + playerMoveTuning(run, moveId)!.windup };
  events.push({ type: 'attack', tick: run.tick, actorId: cow.id });
  return true;
}

function advance(run: RunState, cow: Controlled, events: GameEvent[]): void {
  const action = cow.action;
  if (run.tick < action.endTick || action.kind === 'idle') return;
  const move = action.moveId;
  if (action.kind === 'windup' && move && playerMoveTuning(run, move)) {
    const data = playerMoveTuning(run, move)!;
    cow.action = { kind: 'active', moveId: move, startedTick: run.tick, endTick: run.tick + data.active };
    if (move === 'special' && cow.preparedSpecial) releaseSpecial(run, cow, events);
    else run.attacks.push({
      id: allocateAttackId(run), ownerId: cow.id, moveId: move, origin: { ...cow.position }, facing: cow.facing,
      activeUntilTick: cow.action.endTick, range: data.range, depthTolerance: data.depthTolerance,
      damage: data.damage, hitTargetIds: [],
    });
    events.push({ type: 'attack-active', tick: run.tick, actorId: cow.id });
  } else if (action.kind === 'active' && move && playerMoveTuning(run, move)) {
    const data = playerMoveTuning(run, move)!;
    cow.action = { kind: 'recovery', moveId: move, startedTick: run.tick, endTick: run.tick + data.recovery };
  } else {
    if (action.kind === 'recovery' && move && /^light[123]$/.test(move)) cow.comboDeadlineTick = run.tick + 18;
    cow.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
}

const priority: Record<PlayerAction, number> = { light: 0, heavy: 1, dodge: 2, special: 3 };
export function updatePlayerAction(run: RunState, input: InputFrame, events: GameEvent[], arena?: ArenaContext): void {
  const cow = getPlayer(run);
  if (cow.hp <= 0) return;
  if (cow.pendingAction && input.canceledPointerIds?.includes(cow.pendingAction.sourcePointerId)) cow.pendingAction = undefined;
  if (cow.pendingAction && run.tick >= cow.pendingAction.expiresTick) cow.pendingAction = undefined;
  advance(run, cow, events);
  const candidates = (input.requests ?? []).filter(request => !input.canceledPointerIds?.includes(request.sourcePointerId));
  let winner: ActionRequest | undefined;
  for (const request of candidates) {
    if (!eligible(run, cow, request.kind)) { events.push({ type: 'unavailable', tick: run.tick, actorId: cow.id }); continue; }
    if (!winner || priority[request.kind] > priority[winner.kind] || (priority[request.kind] === priority[winner.kind] && request.order > winner.order)) winner = request;
  }
  if (winner) cow.pendingAction = { ...winner, expiresTick: run.tick + 9 } satisfies PendingAction;
  if (cow.action.kind === 'idle' && cow.pendingAction) {
    const pending = cow.pendingAction;
    cow.pendingAction = undefined;
    if (!start(run, cow, pending.kind, input, events, arena)) events.push({ type: 'unavailable', tick: run.tick, actorId: cow.id });
  }
}

export function clearPlayerPendingAction(run: RunState): void {
  getPlayer(run).pendingAction = undefined;
}
