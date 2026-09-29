import type { CharacterDefinition, CharacterId } from '../content/characters';
import { validateRoster } from '../content/characters';

export interface DuoAssignment {
  readonly fighterId: CharacterId;
  readonly partnerId: CharacterId;
}

export function validateDuo(assignment: DuoAssignment, roster: readonly CharacterDefinition[]): Readonly<DuoAssignment> {
  validateRoster(roster);
  const ids = new Set(roster.map(character => character.id));
  if (!ids.has(assignment.fighterId) || !ids.has(assignment.partnerId) || assignment.fighterId === assignment.partnerId) {
    throw new Error('A fighter and a different registered partner are required');
  }
  return Object.freeze({ fighterId: assignment.fighterId, partnerId: assignment.partnerId });
}
