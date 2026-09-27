import type { AttackInstance, CowState, GameActor, GameEvent, RunState } from './types';
import { attackHits } from './collision';

interface HitIntent { attack: AttackInstance; owner: GameActor; target: GameActor }

export function applyAttacksBatch(run: RunState, attacks: readonly AttackInstance[], events: GameEvent[]): void {
  const intents: HitIntent[] = [];
  const protectedCow = new Set<number>();
  for (const attack of [...attacks].sort((a, b) => a.id - b.id)) {
    const owner = run.actors.find(actor => actor.id === attack.ownerId);
    if (!owner || owner.hp <= 0) continue;
    for (const target of [...run.actors].sort((a, b) => a.id - b.id)) {
      if (target.team === owner.team || run.tick < target.protectionUntilTick || (target.role === 'cow' && protectedCow.has(target.id)) || !attackHits(attack, target)) continue;
      intents.push({ attack, owner, target });
      attack.hitTargetIds.push(target.id);
      if (target.role === 'cow') protectedCow.add(target.id);
    }
  }
  for (const { attack, owner, target } of intents) {
    target.hp = Math.max(0, target.hp - attack.damage);
    if (attack.moveId === 'cow3' || attack.moveId === 'spin') {
      const dx = target.position.x - attack.origin.x;
      const dd = target.position.depth - attack.origin.depth;
      const distance = Math.hypot(dx, dd);
      const push = attack.moveId === 'spin' ? 1.5 : 1.2;
      target.position.x += (distance > 0 ? dx / distance : attack.facing) * push;
      target.position.depth += (distance > 0 ? dd / distance : 0) * push;
    }
    if (owner.role === 'cow' && attack.moveId.startsWith('cow') && target.team === 'enemy') {
      const cow = owner as CowState;
      cow.specialMeter = Math.min(100, cow.specialMeter + 10);
    }
    if (target.role === 'cow') target.protectionUntilTick = run.tick + 36;
    if (target.role === 'crow' && target.hp === 0) target.active = false;
    events.push({ type: 'hit', tick: run.tick, actorId: owner.id, targetId: target.id });
  }
}

export function applyAttack(run: RunState, attack: AttackInstance, events: GameEvent[]): void {
  applyAttacksBatch(run, [attack], events);
}
