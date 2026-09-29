import type { CharacterDefinition } from '../content/characters';
import { playableStats, STAT_SCALE } from '../content/characters';
import type { SelectionState } from '../app/selection';
import cowPortrait from '../../assets/characters/cow-crow/portraits/cow.png?url';
import crowPortrait from '../../assets/characters/cow-crow/portraits/crow.png?url';

export type PreviewStatus = 'empty' | 'loading' | 'ready' | 'error';
export type ActivationModality = 'pointer' | 'keyboard';
export const portraits = { cow: cowPortrait, crow: crowPortrait };
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
}
function meter(label: string, value: number, max: number): string {
  const fill = Math.max(0, Math.min(100, value / max * 100));
  return `<div class="stat"><span>${label} <strong>${value}</strong></span><div role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="${Math.max(max, value)}" aria-valuenow="${value}" class="stat-track"><span style="width:${fill}%"></span></div></div>`;
}

export function selectionMarkup(state: SelectionState, roster: readonly CharacterDefinition[], status: PreviewStatus, modality: ActivationModality): string {
  const selected = roster.find(character => character.id === state.previewedId);
  const fighter = roster.find(character => character.id === state.fighterId);
  const eligible = roster.filter(character => state.step === 'fighter' || character.id !== state.fighterId);
  const focusId = eligible.some(character => character.id === state.focusedId) ? state.focusedId : eligible[0]?.id;
  const tiles = roster.map(character => {
    const unavailable = state.step === 'partner' && character.id === state.fighterId;
    const portrait = portraits[character.portraitKey];
    return `<button type="button" class="fighter-tile${state.previewedId === character.id ? ' previewed' : ''}" data-character="${escapeHtml(character.id)}" aria-label="${escapeHtml(character.displayName)}" aria-pressed="${state.previewedId === character.id}" tabindex="${focusId === character.id ? '0' : '-1'}" ${unavailable ? 'disabled' : ''}>
      <img src="${portrait}" alt=""><span class="tile-name">${escapeHtml(character.displayName)}</span>${unavailable ? '<span class="unavailable">Your Fighter</span>' : ''}
    </button>`;
  }).join('');
  const stats = selected ? playableStats(selected) : null;
  const instruction = status === 'ready' && selected ? (modality === 'keyboard' ? 'Press Enter again to choose' : 'Tap again to choose') : '';
  return `<main class="selection-screen">
    <header class="selection-header"><span class="brand">Streets of Rock</span><h1>${state.step === 'fighter' ? 'Choose Your Fighter' : 'Choose Your Partner'}</h1></header>
    ${state.step === 'partner' ? `<p class="partner-role">Your partner is AI controlled. Your Fighter: <strong>${escapeHtml(fighter?.displayName ?? '')}</strong></p>` : ''}
    <div class="selection-layout"><div class="roster" role="group" aria-label="${state.step === 'fighter' ? 'Fighters' : 'Partners'}">${tiles}</div>
    <section class="fighter-preview" aria-label="Character preview"><div class="preview-canvas-host"></div>
      ${selected ? `<div class="preview-details"><h2>${escapeHtml(selected.displayName)}</h2>
      ${stats ? meter('Health', stats.health, STAT_SCALE.health) + meter('Power', stats.power, STAT_SCALE.power) + meter('Speed', stats.speed, STAT_SCALE.speed) : ''}
      ${state.step === 'partner' ? '<p>Stats describe this character as a fighter; your partner attacks automatically.</p>' : ''}
      <p class="selection-instruction" aria-live="polite">${status === 'error' ? 'Unable to load character' : status === 'loading' ? 'Loading character…' : instruction}</p>
      ${status === 'error' ? '<button type="button" data-command="preview-retry">Retry</button>' : ''}</div>` : '<p class="preview-placeholder">Select a portrait to preview a fighter</p>'}
    </section></div>
    <footer class="selection-footer">${state.step === 'partner' ? '<button type="button" data-command="selection-back">Back</button>' : ''}<span class="pwa-status" aria-live="polite"></span><button type="button" data-command="settings">Settings</button></footer>
  </main>`;
}
