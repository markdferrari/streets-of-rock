import type { RunState } from '../game/types';
import { getPartner, getPlayer } from '../game/selectors';
export function combatHudMarkup(run: RunState, feedback = ''): string {
  const cow = getPlayer(run);
  const crow = getPartner(run);
  const playerName = cow.characterId === 'cow' ? 'Cow' : 'Crow';
  const partnerName = crow.characterId === 'cow' ? 'Cow' : 'Crow';
  const liam = run.actors.find(actor => actor.role === 'liam');
  const dodge = cow.dodgeReadyTick > run.tick ? `Dodge ${((cow.dodgeReadyTick - run.tick) / 60).toFixed(1)}s` : 'Dodge ready';
  const go = run.encounter.status === 'cleared' && run.areaIndex < 3 ? '<span class="go">GO →</span>' : '';
  return `<div class="hud"><span>${playerName} ${cow.hp} / ${cow.maxHp}</span><span>${crow.active ? `${partnerName} ${crow.hp} / ${crow.maxHp}` : `${partnerName} knocked out`}</span><span>${cow.specialMeter === 100 ? 'Special ready' : `Special ${cow.specialMeter}%`}</span><span>${dodge}</span>${liam ? `<span>Liam ${liam.hp} / ${liam.maxHp}</span>` : ''}${go}${feedback ? `<span role="status">${feedback}</span>` : ''}<button data-action="pause" aria-label="Pause">Pause</button></div>`;
}
