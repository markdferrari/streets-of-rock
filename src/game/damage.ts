import type { AttackInstance, CowState, GameEvent, RunState } from './types';
import { attackHits } from './collision';

export function applyAttack(run: RunState, attack: AttackInstance, events: GameEvent[]): void {
  const owner = run.actors.find(actor => actor.id === attack.ownerId);
  if (!owner || owner.hp <= 0) return;
  for (const target of [...run.actors].sort((a, b) => a.id - b.id)) {
    if (target.team === owner.team || run.tick < target.protectionUntilTick || !attackHits(attack, target)) continue;
    target.hp = Math.max(0, target.hp - attack.damage);
    attack.hitTargetIds.push(target.id);
    if (owner.role === 'cow' && attack.moveId.startsWith('cow') && target.team === 'enemy') {
      const cow = owner as CowState;
      cow.specialMeter = Math.min(100, cow.specialMeter + 10);
    }
    if (target.role === 'cow') target.protectionUntilTick = run.tick + 36;
    if (target.role === 'crow' && target.hp === 0) target.active = false;
    events.push({ type: 'hit', tick: run.tick, actorId: owner.id, targetId: target.id });
  }
}
