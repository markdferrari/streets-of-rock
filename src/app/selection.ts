import type { CharacterDefinition, CharacterId } from '../content/characters';
import { validateRoster } from '../content/characters';
import type { DuoAssignment } from '../game/duo';
import { validateDuo } from '../game/duo';

export interface SelectionState {
  readonly step: 'fighter' | 'partner';
  readonly focusedId: CharacterId | null;
  readonly previewedId: CharacterId | null;
  readonly fighterId: CharacterId | null;
  readonly locked: boolean;
}
export type SelectionEvent =
  | { readonly type: 'focus'; readonly id: CharacterId }
  | { readonly type: 'activate'; readonly id: CharacterId; readonly ready: boolean }
  | { readonly type: 'back' }
  | { readonly type: 'reset' };
export interface SelectionUpdate {
  readonly state: SelectionState;
  readonly transition?: 'partner';
  readonly duo?: Readonly<DuoAssignment>;
}

export function initialSelection(roster: readonly CharacterDefinition[]): SelectionState {
  validateRoster(roster);
  return { step: 'fighter', focusedId: roster[0]!.id, previewedId: null, fighterId: null, locked: false };
}

export function reduceSelection(state: SelectionState, event: SelectionEvent, roster: readonly CharacterDefinition[]): SelectionUpdate {
  validateRoster(roster);
  if (event.type === 'reset') return { state: initialSelection(roster) };
  if (state.locked) return { state };
  if (event.type === 'back') {
    if (state.step !== 'partner') return { state };
    return { state: { step: 'fighter', focusedId: state.fighterId, previewedId: state.fighterId, fighterId: null, locked: false } };
  }
  if (!roster.some(character => character.id === event.id) || (state.step === 'partner' && event.id === state.fighterId)) {
    return { state };
  }
  if (event.type === 'focus') return { state: { ...state, focusedId: event.id } };
  if (state.previewedId !== event.id) return { state: { ...state, focusedId: event.id, previewedId: event.id } };
  if (!event.ready) return { state };
  if (state.step === 'fighter') {
    const nextPartner = roster.find(character => character.id !== event.id)?.id ?? null;
    return { state: { step: 'partner', fighterId: event.id, focusedId: nextPartner, previewedId: null, locked: false }, transition: 'partner' };
  }
  const duo = validateDuo({ fighterId: state.fighterId!, partnerId: event.id }, roster);
  return { state: { ...state, locked: true }, duo };
}
