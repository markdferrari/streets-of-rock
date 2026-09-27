import type { ActionRequest, CowState, GameEvent, InputFrame, PendingAction, PlayerAction, RunState } from './types';
import { allocateAttackId } from './run';
import { cowMoveTuning } from '../content/tuning';

function eligible(run: RunState, cow: CowState, kind: PlayerAction): boolean {
  if (cow.hp <= 0) return false;
  if (kind === 'dodge') return run.tick >= cow.dodgeReadyTick;
  if (kind === 'special') return cow.specialMeter >= 100;
  return true;
}

function start(run: RunState, cow: CowState, kind: PlayerAction, input: InputFrame, events: GameEvent[]): boolean {
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
    cow.specialMeter = 0;
    cow.action = { kind: 'windup', moveId: 'spin', startedTick: run.tick, endTick: run.tick + cowMoveTuning.spin.windup };
    events.push({ type: 'special', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (kind === 'heavy') {
    cow.comboStep = 0;
    cow.comboDeadlineTick = 0;
    cow.action = { kind: 'windup', moveId: 'cowHeavy', startedTick: run.tick, endTick: run.tick + cowMoveTuning.cowHeavy.windup };
    events.push({ type: 'heavy', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (run.tick > cow.comboDeadlineTick) cow.comboStep = 0;
  const moveId = `cow${cow.comboStep + 1}` as 'cow1' | 'cow2' | 'cow3';
  cow.comboStep = ((cow.comboStep + 1) % 3) as CowState['comboStep'];
  cow.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + cowMoveTuning[moveId].windup };
  events.push({ type: 'attack', tick: run.tick, actorId: cow.id });
  return true;
}

function advance(run: RunState, cow: CowState, events: GameEvent[]): void {
  const action = cow.action;
  if (run.tick < action.endTick || action.kind === 'idle') return;
  const move = action.moveId;
  if (action.kind === 'windup' && move && move in cowMoveTuning) {
    const data = cowMoveTuning[move as keyof typeof cowMoveTuning];
    cow.action = { kind: 'active', moveId: move, startedTick: run.tick, endTick: run.tick + data.active };
    run.attacks.push({
      id: allocateAttackId(run), ownerId: cow.id, moveId: move, origin: { ...cow.position }, facing: cow.facing,
      activeUntilTick: cow.action.endTick, range: data.range, depthTolerance: data.depthTolerance,
      damage: data.damage, hitTargetIds: [],
    });
    events.push({ type: 'attack-active', tick: run.tick, actorId: cow.id });
  } else if (action.kind === 'active' && move && move in cowMoveTuning) {
    const data = cowMoveTuning[move as keyof typeof cowMoveTuning];
    cow.action = { kind: 'recovery', moveId: move, startedTick: run.tick, endTick: run.tick + data.recovery };
  } else {
    if (action.kind === 'recovery' && (move === 'cow1' || move === 'cow2' || move === 'cow3')) cow.comboDeadlineTick = run.tick + 18;
    cow.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
}

const priority: Record<PlayerAction, number> = { light: 0, heavy: 1, dodge: 2, special: 3 };
export function updateCowAction(run: RunState, input: InputFrame, events: GameEvent[]): void {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState | undefined;
  if (!cow || cow.hp <= 0) return;
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
    if (!start(run, cow, pending.kind, input, events)) events.push({ type: 'unavailable', tick: run.tick, actorId: cow.id });
  }
}

export function clearCowPendingAction(run: RunState): void {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState | undefined;
  if (cow) cow.pendingAction = undefined;
}
