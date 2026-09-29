import type { EnemyState, GameEvent, RunState } from '../types';
import { neonVelvet } from '../../content/neon-velvet';
import { characters } from '../../content/characters';
import { getPartner, getPlayer } from '../selectors';

export function choosePartnerTarget(run: RunState): number | null {
  const partner = getPartner(run);
  const player = getPlayer(run);
  if (!partner.active || partner.hp <= 0) return null;
  const enemies = run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.hp > 0);
  enemies.sort((a, b) => {
    const rank = (enemy: EnemyState) => enemy.targetId === player.id && enemy.action.kind !== 'idle' ? 0 : enemy.role === 'zoner' ? 1 : 2;
    const priority = rank(a) - rank(b);
    if (priority !== 0) return priority;
    const distanceA = Math.hypot(a.position.x - partner.position.x, a.position.depth - partner.position.depth);
    const distanceB = Math.hypot(b.position.x - partner.position.x, b.position.depth - partner.position.depth);
    return distanceA - distanceB || a.id - b.id;
  });
  return enemies[0]?.id ?? null;
}

export function updatePartner(run: RunState, events: GameEvent[]): void {
  const partner = getPartner(run);
  const player = getPlayer(run);
  if (player.hp <= 0 || partner.hp <= 0 || !partner.active) return;
  const profile = characters.find(character => character.id === partner.characterId)!.partnerProfile;
  const area = neonVelvet.areas[run.areaIndex];
  const minX = area?.minX ?? 0;
  const maxX = area?.maxX ?? 16;
  const separation = Math.hypot(partner.position.x - player.position.x, partner.position.depth - player.position.depth);
  if (separation > 6 || (separation > 1.5 && run.tick - partner.lastProgressTick > 120)) {
    partner.position.x = Math.max(minX, Math.min(maxX, player.position.x - .8));
    partner.position.depth = player.position.depth;
    partner.lastProgressTick = run.tick;
    events.push({ type: 'partner-recovered', tick: run.tick, actorId: partner.id });
    return;
  }
  if (separation > 4) {
    const dx = player.position.x - partner.position.x;
    const dd = player.position.depth - partner.position.depth;
    const distance = Math.hypot(dx, dd);
    partner.position.x = Math.max(minX, Math.min(maxX, partner.position.x + dx / distance * profile.catchUpSpeed / 60));
    partner.position.depth = Math.max(-3, Math.min(3, partner.position.depth + dd / distance * profile.catchUpSpeed / 60));
    partner.lastProgressTick = run.tick;
    return;
  }
  const targetId = choosePartnerTarget(run);
  partner.targetId = targetId ?? undefined;
  const target = run.actors.find(actor => actor.id === targetId);
  if (!target) {
    if (separation > 1) {
      partner.position.x += Math.sign(player.position.x - partner.position.x) * profile.moveSpeed / 60;
      partner.position.depth += Math.sign(player.position.depth - partner.position.depth) * profile.moveSpeed / 60;
      partner.lastProgressTick = run.tick;
    }
    return;
  }
  const dx = target.position.x - partner.position.x;
  const dd = target.position.depth - partner.position.depth;
  const distance = Math.hypot(dx, dd);
  if (distance > 1.1 || Math.abs(dd) > .45) {
    if (distance > 0) {
      partner.position.x = Math.max(minX, Math.min(maxX, partner.position.x + dx / distance * profile.moveSpeed / 60));
      partner.position.depth = Math.max(-3, Math.min(3, partner.position.depth + dd / distance * profile.moveSpeed / 60));
      partner.lastProgressTick = run.tick;
    }
    return;
  }
  partner.facing = dx >= 0 ? 1 : -1;
  if (run.tick >= partner.decisionReadyTick) {
    target.hp = Math.max(0, target.hp - profile.supportDamage);
    partner.decisionReadyTick = run.tick + profile.supportCooldownTicks;
    partner.action = { kind: 'active', moveId: 'support',
      startedTick: run.tick, endTick: run.tick + 6 };
    events.push({ type: 'partner-hit', tick: run.tick, actorId: partner.id, targetId: target.id });
  } else if (partner.action.kind === 'active' && run.tick >= partner.action.endTick) {
    partner.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
}
