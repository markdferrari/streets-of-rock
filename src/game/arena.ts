import { neonVelvet } from '../content/neon-velvet';
import { getPartner } from './selectors';
import type { Position, RunState } from './types';

export interface Rect { minX: number; maxX: number; minDepth: number; maxDepth: number }
export interface BodyEnvelope { minX: number; maxX: number; minY: number; maxY: number; minDepth: number; maxDepth: number }
export interface CameraFrame { anchorX: number; anchorDepth: number; anchorHeight: number; halfHeight: number; aspect: number }
export interface ArenaContext { legalRegions: readonly Rect[]; visibleRegions: readonly Rect[]; frame: CameraFrame; body: BodyEnvelope; obstructions?: readonly Rect[] }

export const VIEW_PADDING = .05;
export const BODY_MARGIN = .1;
export const CAMERA_UP_Y = 12 / Math.sqrt(208);
export const CAMERA_UP_DEPTH = 8 / Math.sqrt(208);

function finite(...values: number[]): boolean { return values.every(Number.isFinite); }

function validateFrame(frame: CameraFrame, body: BodyEnvelope): void {
  if (!finite(frame.anchorX, frame.anchorDepth, frame.anchorHeight, frame.halfHeight, frame.aspect,
    body.minX, body.maxX, body.minY, body.maxY, body.minDepth, body.maxDepth) ||
    frame.halfHeight <= 0 || frame.aspect <= 0 || body.maxX <= body.minX || body.maxY <= body.minY || body.maxDepth <= body.minDepth) {
    throw new Error('Invalid camera frame or body envelope');
  }
}

export function roomRect(index: number): Rect {
  const area = neonVelvet.areas[index];
  if (!area) throw new Error('Unknown room');
  return { minX: area.minX, maxX: area.maxX, minDepth: area.minDepth, maxDepth: area.maxDepth };
}

function corridor(from: number, to: number): Rect {
  const left = roomRect(from); const right = roomRect(to);
  return { minX: left.maxX, maxX: right.minX,
    minDepth: Math.max(left.minDepth, right.minDepth), maxDepth: Math.min(left.maxDepth, right.maxDepth) };
}

export function legalRegions(run: RunState, role: 'player' | 'partner'): Rect[] {
  const regions = [roomRect(run.areaIndex)];
  if (role === 'partner' && run.areaIndex === 0 && getPartner(run).position.x < regions[0]!.minX) {
    regions.unshift({ minX: -.8, maxX: 0, minDepth: -3, maxDepth: 3 });
  }
  if (role === 'partner' && run.areaIndex > 0 && getPartner(run).hp > 0 && getPartner(run).position.x < regions[0]!.minX) {
    regions.unshift(roomRect(run.areaIndex - 1), corridor(run.areaIndex - 1, run.areaIndex));
  }
  if (run.encounter.status === 'cleared' && neonVelvet.areas[run.areaIndex + 1]) regions.push(corridor(run.areaIndex, run.areaIndex + 1));
  return regions;
}

export function visibleRegions(regions: readonly Rect[], frame: CameraFrame, body: BodyEnvelope): Rect[] {
  validateFrame(frame, body);
  const halfWidth = frame.halfHeight * frame.aspect * (1 - VIEW_PADDING * 2);
  const halfHeight = frame.halfHeight * (1 - VIEW_PADDING * 2);
  const minX = frame.anchorX - halfWidth - body.minX + BODY_MARGIN;
  const maxX = frame.anchorX + halfWidth - body.maxX - BODY_MARGIN;
  const minDepth = frame.anchorDepth + (body.maxY - frame.anchorHeight) * CAMERA_UP_Y / CAMERA_UP_DEPTH - halfHeight / CAMERA_UP_DEPTH - body.minDepth + BODY_MARGIN / CAMERA_UP_DEPTH;
  const maxDepth = frame.anchorDepth + (body.minY - frame.anchorHeight) * CAMERA_UP_Y / CAMERA_UP_DEPTH + halfHeight / CAMERA_UP_DEPTH - body.maxDepth - BODY_MARGIN / CAMERA_UP_DEPTH;
  return regions.map(region => {
    if (!finite(region.minX, region.maxX, region.minDepth, region.maxDepth) || region.maxX < region.minX || region.maxDepth < region.minDepth) throw new Error('Invalid legal region');
    return { minX: Math.max(region.minX, minX), maxX: Math.min(region.maxX, maxX),
      minDepth: Math.max(region.minDepth, minDepth), maxDepth: Math.min(region.maxDepth, maxDepth) };
  }).filter(region => region.minX <= region.maxX && region.minDepth <= region.maxDepth);
}

export function buildArenaContext(run: RunState, frame: CameraFrame, body: BodyEnvelope, role: 'player' | 'partner'): ArenaContext {
  const legal = legalRegions(run, role);
  return { legalRegions: legal, visibleRegions: visibleRegions(legal, frame, body), frame, body };
}

export function containsPosition(regions: readonly Rect[], position: Position): boolean {
  return finite(position.x, position.depth) && regions.some(region => position.x >= region.minX - 1e-9 && position.x <= region.maxX + 1e-9 &&
    position.depth >= region.minDepth - 1e-9 && position.depth <= region.maxDepth + 1e-9);
}

export function safePosition(context: ArenaContext, position: Position): boolean {
  return containsPosition(context.visibleRegions, position) && !(context.obstructions ?? []).some(obstacle =>
    position.x > obstacle.minX && position.x < obstacle.maxX && position.depth > obstacle.minDepth && position.depth < obstacle.maxDepth);
}

export function bodyFitsFrame(position: Position, body: BodyEnvelope, frame: CameraFrame): boolean {
  if (!finite(position.x, position.depth)) return false;
  validateFrame(frame, body);
  const width = frame.halfHeight * frame.aspect * (1 - VIEW_PADDING * 2);
  const height = frame.halfHeight * (1 - VIEW_PADDING * 2);
  const left = position.x + body.minX - frame.anchorX - BODY_MARGIN;
  const right = position.x + body.maxX - frame.anchorX + BODY_MARGIN;
  const bottom = (body.minY - frame.anchorHeight) * CAMERA_UP_Y - (position.depth + body.maxDepth - frame.anchorDepth) * CAMERA_UP_DEPTH - BODY_MARGIN;
  const top = (body.maxY - frame.anchorHeight) * CAMERA_UP_Y - (position.depth + body.minDepth - frame.anchorDepth) * CAMERA_UP_DEPTH + BODY_MARGIN;
  return left >= -width - 1e-9 && right <= width + 1e-9 && bottom >= -height - 1e-9 && top <= height + 1e-9;
}

function segmentInterval(from: Position, to: Position, region: Rect): [number, number] | null {
  let start = 0; let end = 1;
  for (const [origin, delta, lower, upper] of [
    [from.x, to.x - from.x, region.minX, region.maxX],
    [from.depth, to.depth - from.depth, region.minDepth, region.maxDepth],
  ]) {
    if (Math.abs(delta) < 1e-12) { if (origin < lower || origin > upper) return null; continue; }
    const a = (lower - origin) / delta; const b = (upper - origin) / delta;
    start = Math.max(start, Math.min(a, b)); end = Math.min(end, Math.max(a, b));
    if (start > end) return null;
  }
  return [start, end];
}

export function moveWithinArena(from: Position, proposed: Position, context: ArenaContext): Position {
  if (!finite(from.x, from.depth, proposed.x, proposed.depth) || !containsPosition(context.visibleRegions, from)) return { ...from };
  const intervals = context.visibleRegions.map(region => segmentInterval(from, proposed, region))
    .filter((interval): interval is [number, number] => interval !== null).sort((a, b) => a[0] - b[0]);
  let reached = 0;
  for (const [start, end] of intervals) {
    if (start > reached + 1e-9) break;
    reached = Math.max(reached, end);
  }
  for (const obstacle of context.obstructions ?? []) {
    const blocked = segmentInterval(from, proposed, obstacle);
    if (blocked && blocked[1] > 1e-9 && blocked[0] <= reached) reached = Math.min(reached, Math.max(0, blocked[0] - 1e-6));
  }
  return { x: from.x + (proposed.x - from.x) * reached,
    depth: from.depth + (proposed.depth - from.depth) * reached };
}

export function pathWithinArena(from: Position, to: Position, context: ArenaContext): boolean {
  if (!safePosition(context, from) || !safePosition(context, to)) return false;
  const reached = moveWithinArena(from, to, context);
  return Math.hypot(reached.x - to.x, reached.depth - to.depth) < 1e-5;
}
