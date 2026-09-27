import type { InputFrame, RunState } from './types';
import { tuning } from '../content/tuning';

export function moveCow(run: RunState, input: InputFrame): void {
  const cow = run.actors.find(actor => actor.role === 'cow');
  if (!cow || cow.hp <= 0 || cow.action.kind !== 'idle') return;
  let { x, depth } = input.move;
  if (!Number.isFinite(x) || !Number.isFinite(depth)) return;
  const magnitude = Math.hypot(x, depth);
  if (magnitude > 1) { x /= magnitude; depth /= magnitude; }
  if (x !== 0) cow.facing = x > 0 ? 1 : -1;
  cow.position.x = Math.max(0, Math.min(16, cow.position.x + x * tuning.cowSpeed / tuning.ticksPerSecond));
  cow.position.depth = Math.max(-3, Math.min(3, cow.position.depth + depth * tuning.cowSpeed / tuning.ticksPerSecond));
}
