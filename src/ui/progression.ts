import { neonVelvet } from '../content/neon-velvet';
import type { LevelDefinition } from '../content/types';
import type { RunState } from '../game/types';

export interface ProgressionCue {
  visible: boolean;
  areaId: string | null;
  nextAreaId: string | null;
  direction: 'left' | 'right' | null;
  label: 'GO';
  accessibleLabel: string;
}
export interface UiRect { x: number; y: number; width: number; height: number }
export interface SafeViewport { width: number; height: number; safe: { top: number; right: number; bottom: number; left: number } }
export interface CuePosition { x: number; y: number }

export function deriveProgressionCue(run: RunState, phase: string,
  areas: readonly LevelDefinition['areas'][number][] = neonVelvet.areas): ProgressionCue {
  const current = areas[run.areaIndex];
  const next = areas[run.areaIndex + 1];
  if (!current || !next || run.encounter.status !== 'cleared' || run.result !== null ||
    (phase !== 'running' && phase !== 'paused')) {
    return { visible: false, areaId: null, nextAreaId: null, direction: null, label: 'GO', accessibleLabel: '' };
  }
  const direction = next.minX >= current.maxX ? 'right' : 'left';
  return { visible: true, areaId: current.id, nextAreaId: next.id, direction,
    label: 'GO', accessibleLabel: `Go ${direction} to the next room` };
}

function separated(cue: UiRect, obstacle: UiRect, gap: number): boolean {
  return cue.x + cue.width + gap <= obstacle.x || cue.x >= obstacle.x + obstacle.width + gap ||
    cue.y + cue.height + gap <= obstacle.y || cue.y >= obstacle.y + obstacle.height + gap;
}

export function placeProgressionCue(cue: ProgressionCue, viewport: SafeViewport,
  obstacles: readonly UiRect[]): CuePosition | null {
  if (!cue.visible || !Number.isFinite(viewport.width) || !Number.isFinite(viewport.height) ||
    viewport.width <= 0 || viewport.height <= 0) return null;
  const width = 96; const height = 48; const gap = 8;
  const left = viewport.safe.left + gap;
  const right = viewport.width - viewport.safe.right - gap - width;
  const top = viewport.safe.top + gap;
  const bottom = viewport.height - viewport.safe.bottom - gap - height;
  if (left > right || top > bottom) return null;
  const preferredX = cue.direction === 'left' ? left + 16 : right - 16;
  const preferredY = Math.max(top, Math.min(bottom, viewport.height * .4 - height / 2));
  const candidates: CuePosition[] = [{ x: preferredX, y: preferredY }];
  const edgeX = cue.direction === 'left' ? left : right;
  for (let y = top; y <= bottom; y += 8) candidates.push({ x: edgeX, y });
  const centerX = Math.max(left, Math.min(right, (viewport.width - width) / 2));
  for (let y = top; y <= bottom; y += 8) candidates.push({ x: centerX, y });
  return candidates.find(position => position.x >= left && position.x <= right && position.y >= top && position.y <= bottom &&
    obstacles.every(obstacle => separated({ ...position, width, height }, obstacle, gap))) ?? null;
}

export function progressionMarkup(cue: ProgressionCue, position?: CuePosition): string {
  if (!cue.visible) return '';
  const arrow = cue.direction === 'left' ? 'M84 24H16m0 0 24-20M16 24l24 20' : 'M12 24h68m0 0L56 4m24 20L56 44';
  const style = position ? ` style="left:${position.x}px;top:${position.y}px"` : '';
  return `<div class="progression-cue" role="status" aria-label="${cue.accessibleLabel}"${style}>` +
    `<svg aria-hidden="true" viewBox="0 0 96 48" width="48" height="24"><path d="${arrow}"/></svg>` +
    `<span>GO</span></div>`;
}
