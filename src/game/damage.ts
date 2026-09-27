import type { AttackInstance, CowState, GameEvent, RunState } from './types';
import { attackHits } from './collision';

export function applyAttack(run: RunState, attack: AttackInstance, events: GameEvent[]): void {
  const owner = run.actors.find(actor => actor.id === attack.ownerId);
  if (!owner || owner.hp <= 0) return;
  for (const target of [...run.actors].sort((a, b) => a.id - b.id)) {
    if (target.team === owner.team || run.tick < target.protectionUntilTick || !attackHits(attack, target)) continue;
    target.hp = Math.max(0, target.hp - attack.damage);
    attack.hitTargetIds.push(target.id);
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
