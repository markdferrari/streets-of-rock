import { characters, type CharacterDefinition } from '../../src/content/characters';

// The extra identities exercise navigation only. They are never included in a production build.
export const twelveCharacterRoster: readonly CharacterDefinition[] = Array.from({ length: 12 }, (_, index) => ({
  ...characters[index % characters.length]!,
  id: `fixture-${index + 1}`,
  displayName: `Fixture ${index + 1}`,
}));
