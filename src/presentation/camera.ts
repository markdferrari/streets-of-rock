import type { RunState } from '../game/types';
import { neonVelvet } from '../content/neon-velvet';
import { getPlayer } from '../game/selectors';

export function cameraCenterX(run: RunState): number {
  const area = neonVelvet.areas[run.areaIndex];
  if (!area) return 8;
  const center = (area.minX + area.maxX) / 2;
  const next = neonVelvet.areas[run.areaIndex + 1];
  if (run.encounter.status !== 'cleared' || !next) return center;
  const cow = getPlayer(run);
  const progress = Math.max(0, Math.min(1, (cow.position.x - area.maxX) / (next.minX - area.maxX)));
  return center + ((next.minX + next.maxX) / 2 - center) * progress;
}
