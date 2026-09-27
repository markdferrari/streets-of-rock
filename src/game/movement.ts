import type { CowState, InputFrame, RunState } from './types';
import { tuning } from '../content/tuning';

export function moveCow(run: RunState, input: InputFrame): void {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState | undefined;
  if (!cow || cow.hp <= 0 || (cow.action.kind !== 'idle' && cow.action.kind !== 'dodge')) return;
  let { x, depth } = cow.action.kind === 'dodge' ? (cow.dodgeDirection ?? { x: cow.facing, depth: 0 }) : input.move;
  if (!Number.isFinite(x) || !Number.isFinite(depth)) return;
  const magnitude = Math.hypot(x, depth);
  if (magnitude > 1) { x /= magnitude; depth /= magnitude; }
  if (x !== 0 && cow.action.kind === 'idle') cow.facing = x > 0 ? 1 : -1;
  const speed = cow.action.kind === 'dodge' ? 6 : tuning.cowSpeed;
  cow.position.x = Math.max(0, Math.min(16, cow.position.x + x * speed / tuning.ticksPerSecond));
  cow.position.depth = Math.max(-3, Math.min(3, cow.position.depth + depth * speed / tuning.ticksPerSecond));
}
