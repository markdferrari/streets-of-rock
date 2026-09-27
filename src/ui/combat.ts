import type { CowState, CrowState, RunState } from '../game/types';
export function combatHudMarkup(run: RunState, feedback = ''): string {
  const cow = run.actors.find(actor => actor.role === 'cow') as CowState;
  const crow = run.actors.find(actor => actor.role === 'crow') as CrowState;
  const liam = run.actors.find(actor => actor.role === 'liam');
  const dodge = cow.dodgeReadyTick > run.tick ? `Dodge ${((cow.dodgeReadyTick - run.tick) / 60).toFixed(1)}s` : 'Dodge ready';
  const go = run.encounter.status === 'cleared' && run.areaIndex < 3 ? '<span class="go">GO →</span>' : '';
  return `<div class="hud"><span>Cow ${cow.hp} / ${cow.maxHp}</span><span>${crow.active ? `Crow ${crow.hp} / ${crow.maxHp}` : 'Crow knocked out'}</span><span>${cow.specialMeter === 100 ? 'Special ready' : `Special ${cow.specialMeter}%`}</span><span>${dodge}</span>${liam ? `<span>Liam ${liam.hp} / ${liam.maxHp}</span>` : ''}${go}${feedback ? `<span role="status">${feedback}</span>` : ''}<button data-action="pause" aria-label="Pause">Pause</button></div>`;
}
