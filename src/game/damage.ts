import type { AttackInstance, GameActor, GameEvent, RunState } from './types';
import { attackHits } from './collision';
import { tuning } from '../content/tuning';
import { neonVelvet } from '../content/neon-velvet';
import { playerMoveTuning } from './moves';

interface HitIntent { attack: AttackInstance; owner: GameActor; target: GameActor }

export function applyAttacksBatch(run: RunState, attacks: readonly AttackInstance[], events: GameEvent[]): void {
  const intents: HitIntent[] = [];
  const protectedCow = new Set<number>();
  for (const attack of [...attacks].sort((a, b) => a.id - b.id)) {
    const owner = run.actors.find(actor => actor.id === attack.ownerId);
    if (!owner || owner.hp <= 0) continue;
    for (const target of [...run.actors].sort((a, b) => a.id - b.id)) {
      if (target.team === owner.team || run.tick < target.protectionUntilTick || (target.role === 'player' && protectedCow.has(target.id)) || !attackHits(attack, target)) continue;
      intents.push({ attack, owner, target });
      attack.hitTargetIds.push(target.id);
      if (target.role === 'player') protectedCow.add(target.id);
    }
  }
  for (const { attack, owner, target } of intents) {
    target.hp = Math.max(0, target.hp - attack.damage);
    const move = playerMoveTuning(run, attack.moveId);
    if (move && move.knockback > 0) {
      const dx = target.position.x - attack.origin.x;
      const dd = target.position.depth - attack.origin.depth;
      const distance = Math.hypot(dx, dd);
      const push = move.knockback;
      target.position.x += (distance > 0 ? dx / distance : attack.facing) * push;
      target.position.depth += (distance > 0 ? dd / distance : 0) * push;
      const area = neonVelvet.areas[run.areaIndex];
      if (area) {
        target.position.x = Math.max(area.minX, Math.min(area.maxX, target.position.x));
        target.position.depth = Math.max(area.minDepth, Math.min(area.maxDepth, target.position.depth));
      }
    }
    if (owner.role === 'player' && (attack.moveId === 'heavy' || /^light[123]$/.test(attack.moveId)) && target.team === 'enemy') {
      const cow = owner;
      cow.specialMeter = Math.min(100, cow.specialMeter + tuning.meterPerHit);
    }
    if (target.role === 'player') target.protectionUntilTick = run.tick + 36;
    if (target.role === 'partner' && target.hp === 0) target.active = false;
    events.push({ type: 'hit', tick: run.tick, actorId: owner.id, targetId: target.id });
  }
}

export function applyAttack(run: RunState, attack: AttackInstance, events: GameEvent[]): void {
  applyAttacksBatch(run, [attack], events);
}
