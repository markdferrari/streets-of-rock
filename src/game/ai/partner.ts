import type { EnemyState, GameEvent, PartnerState, Position, RunState } from '../types';
import { neonVelvet } from '../../content/neon-velvet';
import { characters } from '../../content/characters';
import { partnerBehavior, tuning } from '../../content/tuning';
import { getPartner, getPlayer } from '../selectors';
import { buildArenaContext, containsPosition, moveWithinArena, pathWithinArena, type ArenaContext, type BodyEnvelope } from '../arena';

const fallbackBody: BodyEnvelope = { minX: -.5, maxX: .5, minY: 0, maxY: 2.5, minDepth: -.5, maxDepth: .5 };

function fallbackContext(run: RunState): ArenaContext {
  const area = neonVelvet.areas[run.areaIndex]!;
  return buildArenaContext(run, { anchorX: (area.minX + area.maxX) / 2, anchorDepth: 0,
    anchorHeight: 1.25, halfHeight: 8, aspect: 2 }, fallbackBody, 'partner');
}

function distance(a: Position, b: Position): number { return Math.hypot(a.x - b.x, a.depth - b.depth); }

function rank(enemy: EnemyState, playerId: number): number {
  return enemy.targetId === playerId && enemy.action.kind !== 'idle' ? 0 : enemy.role === 'zoner' ? 1 : 2;
}

function eligible(run: RunState, context?: ArenaContext): EnemyState[] {
  const partner = getPartner(run);
  return run.actors.filter((actor): actor is EnemyState => {
    if (actor.team !== 'enemy' || actor.hp <= 0) return false;
    if (!context) return true;
    return pathWithinArena(partner.position, actor.position, context);
  });
}

export function choosePartnerTarget(run: RunState, context?: ArenaContext): number | null {
  const partner = getPartner(run);
  if (!partner.active || partner.hp <= 0) return null;
  const player = getPlayer(run);
  const candidates = eligible(run, context);
  candidates.sort((a, b) => rank(a, player.id) - rank(b, player.id) ||
    distance(a.position, partner.position) - distance(b.position, partner.position) || a.id - b.id);
  return candidates[0]?.id ?? null;
}

function resetBlock(partner: PartnerState): void {
  partner.intentState.blockedTicks = 0;
  partner.intentState.blockedDestination = null;
}

function targetFacing(partner: PartnerState, target: Position): void {
  const dx = target.x - partner.position.x;
  if (Math.abs(dx) > partnerBehavior.facingDeadzone) partner.facing = dx > 0 ? 1 : -1;
  partner.intentState.lastHorizontalFacing = partner.facing;
}

function move(partner: PartnerState, destination: Position, speed: number, context: ArenaContext): boolean {
  const before = { ...partner.position };
  const remaining = distance(before, destination);
  if (remaining < 1e-9) { resetBlock(partner); return false; }
  const step = Math.min(remaining, speed / tuning.ticksPerSecond);
  const proposal = { x: before.x + (destination.x - before.x) / remaining * step,
    depth: before.depth + (destination.depth - before.depth) / remaining * step };
  let resolved = moveWithinArena(before, proposal, context);
  if (distance(resolved, before) < 1e-6) {
    const alternatives = [
      moveWithinArena(before, { x: proposal.x, depth: before.depth }, context),
      moveWithinArena(before, { x: before.x, depth: proposal.depth }, context),
    ];
    resolved = alternatives.sort((a, b) => distance(a, destination) - distance(b, destination))[0]!;
  }
  const progress = remaining - distance(resolved, destination);
  partner.position = resolved;
  partner.intentState.lastResolvedPosition = { ...resolved };
  if (Math.abs(resolved.x - before.x) > partnerBehavior.facingDeadzone) {
    partner.facing = resolved.x > before.x ? 1 : -1;
    partner.intentState.lastHorizontalFacing = partner.facing;
  }
  if (progress >= partnerBehavior.blockedProgress || distance(resolved, before) > 1e-5) {
    partner.lastProgressTick++;
    resetBlock(partner);
  } else {
    const blockedDestination = partner.intentState.blockedDestination;
    if (!blockedDestination || distance(blockedDestination, destination) > .05) resetBlock(partner);
    partner.intentState.blockedDestination = { ...destination };
    partner.intentState.blockedTicks++;
  }
  return progress > 1e-6;
}

function edgeCandidates(context: ArenaContext): Position[] {
  const candidates: Position[] = [];
  for (const region of context.visibleRegions) {
    for (let depth = region.minDepth; depth <= region.maxDepth + 1e-9; depth += partnerBehavior.recoverySpacing) {
      candidates.push({ x: region.minX, depth: Math.min(depth, region.maxDepth) },
        { x: region.maxX, depth: Math.min(depth, region.maxDepth) });
    }
    for (let x = region.minX; x <= region.maxX + 1e-9; x += partnerBehavior.recoverySpacing) {
      candidates.push({ x: Math.min(x, region.maxX), depth: region.minDepth },
        { x: Math.min(x, region.maxX), depth: region.maxDepth });
    }
  }
  return candidates;
}

function recoverIfBlocked(run: RunState, partner: PartnerState, destination: Position, context: ArenaContext, events: GameEvent[]): void {
  if (!context.obstructions?.length || partner.intentState.blockedTicks < partnerBehavior.blockedTicks ||
    run.tick - partner.intentState.lastRecoveryTick < partnerBehavior.blockedTicks) return;
  const candidates = [destination, ...edgeCandidates(context).sort((a, b) =>
    distance(a, partner.position) - distance(b, partner.position) || a.x - b.x || a.depth - b.depth)];
  const safe = candidates.find(candidate => distance(candidate, partner.position) > 1e-5 &&
    pathWithinArena(partner.position, candidate, context) && pathWithinArena(candidate, destination, context));
  resetBlock(partner);
  if (!safe) return;
  partner.position = { ...safe };
  partner.intentState.lastResolvedPosition = { ...safe };
  partner.intentState.lastRecoveryTick = run.tick;
  partner.intentState.intent = 'recover';
  events.push({ type: 'partner-recovered', tick: run.tick, actorId: partner.id });
}

export function updatePartner(run: RunState, events: GameEvent[], providedContext?: ArenaContext): void {
  const partner = getPartner(run);
  const player = getPlayer(run);
  if (run.result || player.hp <= 0 || partner.hp <= 0 || !partner.active) { resetBlock(partner); return; }
  const context = providedContext ?? fallbackContext(run);
  const profile = characters.find(character => character.id === partner.characterId)!.partnerProfile;
  if (partner.action.kind === 'active' && run.tick >= partner.action.endTick) {
    partner.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
  const candidates = eligible(run, context);
  const bestId = choosePartnerTarget(run, context);
  const current = candidates.find(enemy => enemy.id === partner.intentState.targetId);
  const best = candidates.find(enemy => enemy.id === bestId);
  const target = current && best && rank(current, player.id) <= rank(best, player.id) ? current : best;
  if (partner.action.kind === 'active' && target && partner.action.moveId === 'support') {
    partner.intentState.intent = 'engage';
    partner.intentState.targetId = target.id;
    targetFacing(partner, target.position);
    resetBlock(partner);
    return;
  }
  if (target) {
    partner.targetId = target.id;
    partner.intentState.intent = 'engage';
    partner.intentState.targetId = target.id;
    partner.intentState.destination = { ...target.position };
    const separation = distance(partner.position, target.position);
    const depth = Math.abs(partner.position.depth - target.position.depth);
    if (separation > 1.1 || depth > .45) {
      move(partner, target.position, profile.moveSpeed, context);
      recoverIfBlocked(run, partner, target.position, context, events);
      return;
    }
    resetBlock(partner);
    targetFacing(partner, target.position);
    if (run.tick >= partner.decisionReadyTick) {
      target.hp = Math.max(0, target.hp - profile.supportDamage);
      partner.decisionReadyTick = run.tick + profile.supportCooldownTicks;
      partner.action = { kind: 'active', moveId: 'support', startedTick: run.tick, endTick: run.tick + 6 };
      events.push({ type: 'partner-hit', tick: run.tick, actorId: partner.id, targetId: target.id });
    }
    return;
  }
  partner.targetId = undefined;
  partner.intentState.targetId = null;
  const separation = distance(partner.position, player.position);
  const following = partner.intentState.intent === 'regroup'
    ? separation > partnerBehavior.followStop : separation > partnerBehavior.followStart;
  if (!following) {
    partner.intentState.intent = 'idle'; partner.intentState.destination = null; resetBlock(partner);
    return;
  }
  const behind = { x: player.position.x - player.facing * partnerBehavior.behindPlayer, depth: player.position.depth };
  const destination = containsPosition(context.visibleRegions, behind) ? behind :
    context.visibleRegions.map(region => ({ x: Math.max(region.minX, Math.min(region.maxX, behind.x)),
      depth: Math.max(region.minDepth, Math.min(region.maxDepth, behind.depth)) }))
      .sort((a, b) => distance(a, behind) - distance(b, behind))[0];
  if (!destination) { partner.intentState.intent = 'idle'; resetBlock(partner); return; }
  partner.intentState.intent = 'regroup';
  partner.intentState.destination = destination;
  const travelling = run.encounter.status === 'cleared' || partner.position.x < neonVelvet.areas[run.areaIndex]!.minX;
  move(partner, destination, travelling ? profile.catchUpSpeed : profile.moveSpeed, context);
  recoverIfBlocked(run, partner, destination, context, events);
}
