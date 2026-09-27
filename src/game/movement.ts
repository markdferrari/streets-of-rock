import type { CowState, InputFrame, RunState } from './types';
import { tuning } from '../content/tuning';
import { neonVelvet } from '../content/neon-velvet';

export function moveCow(run: RunState, input: InputFrame): void {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState | undefined;
  if (!cow || cow.hp <= 0 || (cow.action.kind !== 'idle' && cow.action.kind !== 'dodge')) return;
  let { x, depth } = cow.action.kind === 'dodge' ? (cow.dodgeDirection ?? { x: cow.facing, depth: 0 }) : input.move;
  if (!Number.isFinite(x) || !Number.isFinite(depth)) return;
  const magnitude = Math.hypot(x, depth);
  if (magnitude > 1) { x /= magnitude; depth /= magnitude; }
  if (x !== 0 && cow.action.kind === 'idle') cow.facing = x > 0 ? 1 : -1;
  const speed = cow.action.kind === 'dodge' ? 6 : tuning.cowSpeed;
  const area = neonVelvet.areas[run.areaIndex];
  const minimumX = area?.minX ?? 0;
  const maximumX = run.encounter.status === 'cleared' ? (neonVelvet.areas[run.areaIndex + 1]?.minX ?? area?.maxX ?? 16) : (area?.maxX ?? 16);
  cow.position.x = Math.max(minimumX, Math.min(maximumX, cow.position.x + x * speed / tuning.ticksPerSecond));
  cow.position.depth = Math.max(area?.minDepth ?? -3, Math.min(area?.maxDepth ?? 3, cow.position.depth + depth * speed / tuning.ticksPerSecond));
}
