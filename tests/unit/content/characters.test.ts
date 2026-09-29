import { describe, expect, it } from 'vitest';
import { characters, playableStats, STAT_SCALE, validateRoster, type CharacterAssetKey, type PlayerProfile } from '../../../src/content/characters';
import { twelveCharacterRoster } from '../../fixtures/roster';

describe('character registry', () => {
  it('contains two complete playable profiles with values tied to current Cow tuning', () => {
    expect(() => validateRoster(characters)).not.toThrow();
    expect(characters.map(character => character.id)).toEqual(['cow', 'crow']);
    expect(characters.map(character => character.specialLabel)).toEqual(['Bovine Spin', 'Wing Spin']);
    expect(playableStats(characters[0]!)).toEqual({ health: 500, power: 12, speed: 3.2 });
    expect(playableStats(characters[1]!)).toEqual({ health: 240, power: 10, speed: 3.4 });
    expect(STAT_SCALE).toEqual({ health: 500, power: 20, speed: 5 });
    expect(characters[0]!.partnerProfile.supportDamage).toBe(8);
    expect(characters[1]!.partnerProfile.supportCooldownTicks).toBe(54);
  });

  it('rejects incomplete, duplicate, unknown-asset and invalid numeric entries', () => {
    const first = characters[0]!;
    expect(() => validateRoster([first])).toThrow();
    expect(() => validateRoster([first, first])).toThrow();
    expect(() => validateRoster([{ ...first, assetKey: 'missing' as CharacterAssetKey }, characters[1]!])).toThrow();
    expect(() => validateRoster([{ ...first, portraitKey: 'missing' as CharacterAssetKey }, characters[1]!])).toThrow();
    expect(() => validateRoster([{ ...first, playerProfile: { ...first.playerProfile, moveSpeed: Infinity } }, characters[1]!])).toThrow();
    expect(() => validateRoster([{ ...first, playerProfile: { ...first.playerProfile,
      damage: { light1: 12 } as PlayerProfile['damage'] } }, characters[1]!])).toThrow();
    expect(() => validateRoster([{ ...first, partnerProfile: { ...first.partnerProfile, maxHp: 0 } }, characters[1]!])).toThrow();
  });

  it('accepts an injected twelve-entry navigation fixture without changing scales', () => {
    expect(() => validateRoster(twelveCharacterRoster)).not.toThrow();
    expect(twelveCharacterRoster).toHaveLength(12);
    expect(STAT_SCALE.health).toBe(500);
  });
});
