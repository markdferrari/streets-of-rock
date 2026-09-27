import type { CowState, CrowState, RunState } from '../game/types';
export function combatHudMarkup(run: RunState): string {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState;
  const crow = run.actors.find(actor => actor.role === 'crow') as CrowState;
  const liam = run.actors.find(actor => actor.role === 'liam');
  return `<div class="hud"><span>Cow ${cow.hp} / ${cow.maxHp}</span><span>${crow.active ? `Crow ${crow.hp} / ${crow.maxHp}` : 'Crow knocked out'}</span><span>${cow.specialMeter === 100 ? 'Special ready' : `Special ${cow.specialMeter}%`}</span>${liam ? `<span>Liam ${liam.hp} / ${liam.maxHp}</span>` : ''}<button data-action="pause" aria-label="Pause">Pause</button></div>`;
}
