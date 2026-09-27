import type { CowState, GameEvent, InputFrame, MoveId, PendingAction, RunState } from './types';
import { allocateAttackId } from './run';

const timings: Record<'cow1' | 'cow2' | 'cow3' | 'spin', readonly [number, number, number]> = {
  cow1: [8, 6, 14], cow2: [8, 6, 14], cow3: [11, 6, 20], spin: [6, 6, 21],
};

function start(run: RunState, cow: CowState, kind: PendingAction['kind'], events: GameEvent[]): boolean {
  if (cow.hp <= 0 || cow.action.kind !== 'idle') return false;
  if (kind === 'dodge') {
    if (run.tick < cow.dodgeReadyTick) return false;
    cow.action = { kind: 'dodge', startedTick: run.tick, endTick: run.tick + 18 };
    cow.dodgeReadyTick = run.tick + 54;
    cow.dodgeDirection = { x: cow.facing, depth: 0 };
    cow.protectionUntilTick = Math.max(cow.protectionUntilTick, run.tick + 12);
    events.push({ type: 'dodge', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (kind === 'special') {
    if (cow.specialMeter < 100) return false;
    cow.specialMeter = 0;
    cow.action = { kind: 'windup', moveId: 'spin', startedTick: run.tick, endTick: run.tick + timings.spin[0] };
    events.push({ type: 'special', tick: run.tick, actorId: cow.id });
    return true;
  }
  if (run.tick > cow.comboDeadlineTick) cow.comboStep = 0;
  const moveId = `cow${cow.comboStep + 1}` as 'cow1' | 'cow2' | 'cow3';
  cow.comboStep = ((cow.comboStep + 1) % 3) as CowState['comboStep'];
  cow.action = { kind: 'windup', moveId, startedTick: run.tick, endTick: run.tick + timings[moveId][0] };
  events.push({ type: 'attack', tick: run.tick, actorId: cow.id });
  return true;
}

function advance(run: RunState, cow: CowState, events: GameEvent[]): void {
  const action = cow.action;
  if (run.tick < action.endTick || action.kind === 'idle') return;
  if (action.kind === 'windup' && action.moveId && action.moveId in timings) {
    const move = action.moveId as keyof typeof timings;
    cow.action = { kind: 'active', moveId: move, startedTick: run.tick, endTick: run.tick + timings[move][1] };
    run.attacks.push({
      id: allocateAttackId(run), ownerId: cow.id, moveId: move, origin: { ...cow.position }, facing: cow.facing,
      activeUntilTick: cow.action.endTick, range: move === 'spin' ? 2 : 1.3,
      depthTolerance: move === 'spin' ? 2 : .45, damage: move === 'cow1' ? 12 : move === 'cow2' ? 14 : move === 'cow3' ? 22 : 60,
      hitTargetIds: [],
    });
    events.push({ type: 'attack-active', tick: run.tick, actorId: cow.id });
  } else if (action.kind === 'active' && action.moveId && action.moveId in timings) {
    const move = action.moveId as keyof typeof timings;
    cow.action = { kind: 'recovery', moveId: move, startedTick: run.tick, endTick: run.tick + timings[move][2] };
  } else {
    if (action.kind === 'recovery' && action.moveId?.startsWith('cow')) cow.comboDeadlineTick = run.tick + 18;
    cow.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
}

export function updateCowAction(run: RunState, input: InputFrame, events: GameEvent[]): void {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState | undefined;
  if (!cow || cow.hp <= 0) return;
  advance(run, cow, events);
  const pressed = input.special ? 'special' : input.dodge ? 'dodge' : input.attack ? 'attack' : undefined;
  if (pressed) cow.pendingAction = { kind: pressed, expiresTick: run.tick + 9, sequence: run.tick };
  if (cow.pendingAction && cow.pendingAction.expiresTick < run.tick) cow.pendingAction = undefined;
  if (cow.action.kind === 'idle' && cow.pendingAction) {
    const pending = cow.pendingAction;
    cow.pendingAction = undefined;
    if (!start(run, cow, pending.kind, events)) events.push({ type: 'unavailable', tick: run.tick, actorId: cow.id });
    else if (pending.kind === 'dodge') {
      const magnitude = Math.hypot(input.move.x, input.move.depth);
      if (Number.isFinite(magnitude) && magnitude > 0) cow.dodgeDirection = { x: input.move.x / magnitude, depth: input.move.depth / magnitude };
    }
  }
}
