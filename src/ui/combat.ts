import type { RunState } from '../game/types';
import { getPartner, getPlayer } from '../game/selectors';
import { characters } from '../content/characters';

function displayName(id: string): string {
  const character = characters.find(entry => entry.id === id);
  if (!character) throw new Error(`Unknown character in combat HUD: ${id}`);
  return character.displayName;
}

export function combatHudMarkup(run: RunState, feedback = ''): string {
  const cow = getPlayer(run);
  const crow = getPartner(run);
  const playerName = displayName(cow.characterId);
  const partnerName = displayName(crow.characterId);
  const liam = run.actors.find(actor => actor.role === 'liam');
  const dodge = cow.dodgeReadyTick > run.tick ? `Dodge ${((cow.dodgeReadyTick - run.tick) / 60).toFixed(1)}s` : 'Dodge ready';
  return `<div class="hud"><span>${playerName} ${cow.hp} / ${cow.maxHp}</span><span>${crow.active ? `${partnerName} ${crow.hp} / ${crow.maxHp}` : `${partnerName} knocked out`}</span><span>${cow.specialMeter === 100 ? 'Special ready' : `Special ${cow.specialMeter}%`}</span><span>${dodge}</span>${liam ? `<span>Liam ${liam.hp} / ${liam.maxHp}</span>` : ''}${feedback ? `<span role="status">${feedback}</span>` : ''}<button data-action="pause" aria-label="Pause">Pause</button></div>`;
}
