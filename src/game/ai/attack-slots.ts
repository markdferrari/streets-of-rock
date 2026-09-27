import type { EnemyState, RunState } from '../types';
export function assignAttackSlots(run: RunState): EnemyState[] {
  const enemies = run.actors.filter((actor): actor is EnemyState => actor.team === 'enemy').sort((a, b) => a.id - b.id);
  for (const enemy of enemies) if (enemy.hp <= 0) enemy.attackSlot = false;
  let occupied = enemies.filter(enemy => enemy.hp > 0 && enemy.attackSlot).length;
  for (const enemy of enemies) {
    if (enemy.hp > 0 && !enemy.attackSlot && occupied < 2) {
      enemy.attackSlot = true;
      occupied++;
    }
  }
  return enemies.filter(enemy => enemy.hp > 0 && enemy.attackSlot);
}
