import { containsPosition, type ArenaContext } from './arena';
import { characters } from '../content/characters';
import type { EnemyState, GameEvent, PlayerState, RunState } from './types';
import { allocateEntityId } from './run';
import { applyStun } from './status-effects';

export function prepareSpecial(run: RunState, player: PlayerState, arena: ArenaContext | undefined, events: GameEvent[]): boolean {
  const definition = characters.find(character => character.id === player.characterId)?.definition;
  if (!definition) return false;
  const special = definition.player.special;
  if (special.kind === 'areaStrike') return true;
  let aimPosition;
  let targetIdForDiagnostics: number | undefined;
  if (special.kind === 'straightProjectile') {
    const targetRegions = arena?.playerVisibleRegions ?? arena?.visibleRegions;
    const targets = targetRegions ? run.actors.filter(actor => actor.team === 'enemy' && actor.hp > 0 && containsPosition(targetRegions, actor.position)) : [];
    const target = targets.sort((a, b) => {
      const da = (a.position.x - player.position.x) ** 2 + (a.position.depth - player.position.depth) ** 2;
      const db = (b.position.x - player.position.x) ** 2 + (b.position.depth - player.position.depth) ** 2;
      return da - db || a.id - b.id;
    })[0];
    if (!target) return false;
    aimPosition = { ...target.position };
    targetIdForDiagnostics = target.id;
  }
  const activationId = run.nextSpecialActivationId++;
  player.preparedSpecial = { activationId, kind: special.kind === 'roar' ? 'roar' : 'headrest',
    aimPosition, targetIdForDiagnostics, released: false };
  events.push({ type: 'special-prepared', tick: run.tick, actorId: player.id });
  return true;
}

export function releaseSpecial(run: RunState, player: PlayerState, events: GameEvent[]): void {
  const prepared = player.preparedSpecial;
  if (!prepared || prepared.released) return;
  prepared.released = true;
  const definition = characters.find(character => character.id === player.characterId)!.definition;
  const special = definition.player.special;
  if (prepared.kind === 'roar' && special.kind === 'roar') {
    events.push({ type: 'roar-wave', tick: run.tick, actorId: player.id });
    for (const target of run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.hp > 0)) {
      const distance = Math.hypot(target.position.x - player.position.x, target.position.depth - player.position.depth);
      if (distance > special.radius) continue;
      if (target.combatClass === 'normal') {
        if (applyStun(run, target.id, special.stunTicks)) events.push({ type: 'roar-stun', tick: run.tick, actorId: player.id, targetId: target.id });
      } else {
        run.pendingSpecialDamage.push({ activationId: prepared.activationId, ownerId: player.id, targetId: target.id, damage: special.bossDamage });
        events.push({ type: 'roar-boss-impact', tick: run.tick, actorId: player.id, targetId: target.id });
      }
    }
  } else if (prepared.kind === 'headrest' && special.kind === 'straightProjectile' && prepared.aimPosition) {
    const dx = prepared.aimPosition.x - player.position.x;
    const dd = prepared.aimPosition.depth - player.position.depth;
    const magnitude = Math.hypot(dx, dd);
    const direction = magnitude > 1e-9 ? { x: dx / magnitude, depth: dd / magnitude } : { x: player.facing, depth: 0 };
    run.projectiles.push({ kind: 'headrest', id: allocateEntityId(run), ownerId: player.id,
      activationId: prepared.activationId, position: { ...player.position }, previousPosition: { ...player.position },
      direction, speedPerSecond: special.speed, remainingDistance: special.maxDistance,
      damage: special.damage, radius: special.collisionRadius });
    events.push({ type: 'headrest-release', tick: run.tick, actorId: player.id, targetId: prepared.targetIdForDiagnostics });
  }
  events.push({ type: 'special-release', tick: run.tick, actorId: player.id });
}
