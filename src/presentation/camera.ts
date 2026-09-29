import type { RunState } from '../game/types';
import { neonVelvet } from '../content/neon-velvet';
import { getPlayer } from '../game/selectors';
import { getPartner } from '../game/selectors';
import { BODY_MARGIN, CAMERA_UP_DEPTH, CAMERA_UP_Y, VIEW_PADDING, type BodyEnvelope, type CameraFrame } from '../game/arena';

export interface CameraViewport { width: number; height: number }
export interface AllyEnvelopes { player: BodyEnvelope; partner: BodyEnvelope }

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

interface ProjectedPoint { x: number; up: number }

function bodyPoints(x: number, depth: number, body: BodyEnvelope): ProjectedPoint[] {
  const points: ProjectedPoint[] = [];
  for (const offsetX of [body.minX - BODY_MARGIN, body.maxX + BODY_MARGIN]) {
    for (const offsetDepth of [body.minDepth - BODY_MARGIN, body.maxDepth + BODY_MARGIN]) {
      for (const y of [body.minY - BODY_MARGIN, body.maxY + BODY_MARGIN]) {
        points.push({ x: x + offsetX, up: y * CAMERA_UP_Y - (depth + offsetDepth) * CAMERA_UP_DEPTH });
      }
    }
  }
  return points;
}

export function computeArenaFrame(run: RunState, viewport: CameraViewport, envelopes: AllyEnvelopes,
  previous: CameraFrame | null = null, activeDelta = 0): CameraFrame {
  if (![viewport.width, viewport.height, activeDelta].every(Number.isFinite) || viewport.width <= 0 || viewport.height <= 0 || activeDelta < 0) {
    throw new Error('Invalid camera viewport or delta');
  }
  const aspect = viewport.width / viewport.height;
  const area = neonVelvet.areas[run.areaIndex];
  if (!area) throw new Error('Unknown room');
  const points: ProjectedPoint[] = [];
  const heroHeight = Math.max(envelopes.player.maxY, envelopes.partner.maxY);
  const roomBody: BodyEnvelope = { minX: -.1, maxX: .1, minY: 0, maxY: heroHeight,
    minDepth: -.1, maxDepth: .1 };
  for (const x of [area.minX, area.maxX]) for (const depth of [area.minDepth, area.maxDepth]) {
    points.push(...bodyPoints(x, depth, roomBody));
  }
  const player = getPlayer(run);
  const partner = getPartner(run);
  points.push(...bodyPoints(player.position.x, player.position.depth, envelopes.player));
  if (partner.active && partner.hp > 0) points.push(...bodyPoints(partner.position.x, partner.position.depth, envelopes.partner));
  const next = neonVelvet.areas[run.areaIndex + 1];
  if (next && run.encounter.status === 'cleared') {
    points.push(...bodyPoints(next.minX, Math.max(next.minDepth, Math.min(next.maxDepth, player.position.depth)), roomBody));
  }
  const minX = Math.min(...points.map(point => point.x));
  const maxX = Math.max(...points.map(point => point.x));
  const minUp = Math.min(...points.map(point => point.up));
  const maxUp = Math.max(...points.map(point => point.up));
  const desiredX = run.encounter.status === 'cleared' ? cameraCenterX(run) : (area.minX + area.maxX) / 2;
  const desiredHeight = (minUp + maxUp) / (2 * CAMERA_UP_Y);
  const blend = previous ? 1 - Math.pow(.5, activeDelta / .15) : 1;
  const anchorX = previous ? previous.anchorX + (desiredX - previous.anchorX) * blend : desiredX;
  const anchorHeight = previous ? previous.anchorHeight + (desiredHeight - previous.anchorHeight) * blend : desiredHeight;
  const anchorDepth = 0;
  const horizontal = Math.max(Math.abs(minX - anchorX), Math.abs(maxX - anchorX));
  const vertical = Math.max(Math.abs(minUp - anchorHeight * CAMERA_UP_Y), Math.abs(maxUp - anchorHeight * CAMERA_UP_Y));
  const requiredHalfHeight = Math.max(horizontal / (aspect * (1 - VIEW_PADDING * 2)), vertical / (1 - VIEW_PADDING * 2));
  const halfHeight = previous && previous.halfHeight > requiredHalfHeight
    ? Math.max(requiredHalfHeight, previous.halfHeight + (requiredHalfHeight - previous.halfHeight) * blend)
    : requiredHalfHeight;
  return { anchorX, anchorDepth, anchorHeight, halfHeight, aspect };
}
