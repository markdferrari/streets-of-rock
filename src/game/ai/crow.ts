import type { CrowState, EnemyState, GameEvent, RunState } from '../types';
import { neonVelvet } from '../../content/neon-velvet';

export function chooseCrowTarget(run: RunState): number | null {
  const crow = run.actors.find(actor => actor.role === 'crow') as CrowState | undefined;
  if (!crow || !crow.active || crow.hp <= 0) return null;
  const enemies = run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy' && actor.hp > 0);
  enemies.sort((a, b) => {
    const rank = (enemy: EnemyState) => enemy.targetId === 1 && enemy.action.kind !== 'idle' ? 0 : enemy.role === 'zoner' ? 1 : 2;
    const priority = rank(a) - rank(b);
    if (priority !== 0) return priority;
    const distanceA = Math.hypot(a.position.x - crow.position.x, a.position.depth - crow.position.depth);
    const distanceB = Math.hypot(b.position.x - crow.position.x, b.position.depth - crow.position.depth);
    return distanceA - distanceB || a.id - b.id;
  });
  return enemies[0]?.id ?? null;
}

export function updateCrow(run: RunState, events: GameEvent[]): void {
  const crow = run.actors.find(actor => actor.role === 'crow') as CrowState | undefined;
  const cow = run.actors.find(actor => actor.role === 'cow');
  if (!crow || !cow || cow.hp <= 0 || crow.hp <= 0 || !crow.active) return;
  const area = neonVelvet.areas[run.areaIndex];
  const minX = area?.minX ?? 0;
  const maxX = area?.maxX ?? 16;
  const separation = Math.hypot(crow.position.x - cow.position.x, crow.position.depth - cow.position.depth);
  if (separation > 6 || (separation > 1.5 && run.tick - crow.lastProgressTick > 120)) {
    crow.position.x = Math.max(minX, Math.min(maxX, cow.position.x - .8));
    crow.position.depth = cow.position.depth;
    crow.lastProgressTick = run.tick;
    events.push({ type: 'crow-recovered', tick: run.tick, actorId: crow.id });
    return;
  }
  if (separation > 4) {
    const dx = cow.position.x - crow.position.x;
    const dd = cow.position.depth - crow.position.depth;
    const distance = Math.hypot(dx, dd);
    crow.position.x = Math.max(minX, Math.min(maxX, crow.position.x + dx / distance * 4.5 / 60));
    crow.position.depth = Math.max(-3, Math.min(3, crow.position.depth + dd / distance * 4.5 / 60));
    crow.lastProgressTick = run.tick;
    return;
  }
  const targetId = chooseCrowTarget(run);
  crow.targetId = targetId ?? undefined;
  const target = run.actors.find(actor => actor.id === targetId);
  if (!target) {
    if (separation > 1) {
      crow.position.x += Math.sign(cow.position.x - crow.position.x) * 3.4 / 60;
      crow.position.depth += Math.sign(cow.position.depth - crow.position.depth) * 3.4 / 60;
      crow.lastProgressTick = run.tick;
    }
    return;
  }
  const dx = target.position.x - crow.position.x;
  const dd = target.position.depth - crow.position.depth;
  const distance = Math.hypot(dx, dd);
  if (distance > 1.1 || Math.abs(dd) > .45) {
    if (distance > 0) {
      crow.position.x = Math.max(minX, Math.min(maxX, crow.position.x + dx / distance * 3.4 / 60));
      crow.position.depth = Math.max(-3, Math.min(3, crow.position.depth + dd / distance * 3.4 / 60));
      crow.lastProgressTick = run.tick;
    }
    return;
  }
  crow.facing = dx >= 0 ? 1 : -1;
  if (run.tick >= crow.decisionReadyTick) {
    target.hp = Math.max(0, target.hp - 8);
    crow.decisionReadyTick = run.tick + 54;
    crow.action = { kind: 'active', moveId: 'crow', startedTick: run.tick, endTick: run.tick + 6 };
    events.push({ type: 'crow-hit', tick: run.tick, actorId: crow.id, targetId: target.id });
  } else if (crow.action.kind === 'active' && run.tick >= crow.action.endTick) {
    crow.action = { kind: 'idle', startedTick: run.tick, endTick: run.tick };
  }
}
