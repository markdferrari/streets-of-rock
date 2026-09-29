import { describe, expect, it } from 'vitest';
import { characters, playableStats, STAT_SCALE, validateRoster, type CharacterAssetKey, type PlayerProfile } from '../../../src/content/characters';
import { twelveCharacterRoster } from '../../fixtures/roster';

describe('character registry', () => {
  it('preserves the integrated Cow and Crow player and partner profiles exactly', () => {
    expect(characters.slice(0, 2).map(({ id, playerProfile, partnerProfile }) => ({ id, playerProfile, partnerProfile }))).toEqual([
      { id: 'cow', playerProfile: { maxHp: 500, moveSpeed: 3.2,
        damage: { light1: 12, light2: 14, light3: 22, heavy: 30, special: 60 } },
        partnerProfile: { maxHp: 500, moveSpeed: 3.2, catchUpSpeed: 4.5, supportDamage: 8, supportCooldownTicks: 54, animationKey: 'cow-support' } },
      { id: 'crow', playerProfile: { maxHp: 240, moveSpeed: 3.4,
        damage: { light1: 10, light2: 12, light3: 18, heavy: 26, special: 50 } },
        partnerProfile: { maxHp: 240, moveSpeed: 3.4, catchUpSpeed: 4.5, supportDamage: 8, supportCooldownTicks: 54, animationKey: 'crow-support' } },
    ]);
  });

  it('validates versioned data definitions strictly and reports field paths', async () => {
    const { validateCharacterDefinitions } = await import('../../../src/content/characters');
    const valid = {
      schemaVersion: 1, id: 'test-fighter', displayName: 'Test', description: 'Test fighter', fightingStyle: 'Test',
      player: { maxHp: 300, moveSpeed: 3, light: [
        { windupTicks: 1, activeTicks: 1, recoveryTicks: 1, damage: 1, range: 1, depthTolerance: 0.4, knockback: 0 },
        { windupTicks: 1, activeTicks: 1, recoveryTicks: 1, damage: 1, range: 1, depthTolerance: 0.4, knockback: 0 },
        { windupTicks: 1, activeTicks: 1, recoveryTicks: 1, damage: 1, range: 1, depthTolerance: 0.4, knockback: 0 },
      ], heavy: { windupTicks: 1, activeTicks: 1, recoveryTicks: 1, damage: 1, range: 1, depthTolerance: 0.4, knockback: 0 },
        dodge: { durationTicks: 1, speed: 1, invulnerabilityTicks: 1, cooldownTicks: 1 },
        special: { kind: 'roar', windupTicks: 1, activeTicks: 1, recoveryTicks: 1, radius: 3, stunTicks: 120, bossDamage: 60 } },
      partner: { maxHp: 300, moveSpeed: 3, catchUpSpeed: 4, supportDamage: 8, supportCooldownTicks: 54, animationKey: 'test-support' },
      presentation: { modelKey: 'test', portraitKey: 'test', animationSetKey: 'test', soundSetKey: 'test', specialLabel: 'Test' },
    };
    expect(() => validateCharacterDefinitions([valid])).not.toThrow();
    for (const invalid of [
      { ...valid, schemaVersion: 2 }, { ...valid, surprise: true }, { ...valid, id: 'Bad ID' },
      { ...valid, player: { ...valid.player, light: valid.player.light.slice(0, 2) } },
      { ...valid, player: { ...valid.player, unexpected: true } },
      { ...valid, player: { ...valid.player, special: { ...valid.player.special, kind: 'teleport' } } },
      { ...valid, player: { ...valid.player, special: { ...valid.player.special, radius: -1 } } },
      { ...valid, player: { ...valid.player, light: [{ ...valid.player.light[0], windupTicks: 0 }, ...valid.player.light.slice(1)] } },
      { ...valid, player: { ...valid.player, heavy: { ...valid.player.heavy, damage: Number.POSITIVE_INFINITY } } },
      { ...valid, partner: { ...valid.partner, special: valid.player.special } },
    ]) {
      expect(() => validateCharacterDefinitions([invalid])).toThrow();
    }
    expect(() => validateCharacterDefinitions([valid, { ...valid, id: 'test-fighter' }])).toThrow(/duplicate/i);
  });

  it('contains two complete playable profiles with values tied to current Cow tuning', () => {
    expect(() => validateRoster(characters)).not.toThrow();
    expect(characters.slice(0, 2).map(character => character.id)).toEqual(['cow', 'crow']);
    expect(characters.slice(0, 2).map(character => character.specialLabel)).toEqual(['Bovine Spin', 'Wing Spin']);
    expect(playableStats(characters[0]!)).toEqual({ health: 500, power: 12, speed: 3.2 });
    expect(playableStats(characters[1]!)).toEqual({ health: 240, power: 10, speed: 3.4 });
    expect(STAT_SCALE).toEqual({ health: 500, power: 20, speed: 5 });
    expect(characters[0]!.partnerProfile.supportDamage).toBe(8);
    expect(characters[1]!.partnerProfile.supportCooldownTicks).toBe(54);
  });

  it('loads the four versioned roster entries and keeps the provisional style ordering', () => {
    expect(characters.map(character => character.id)).toEqual(['cow', 'crow', 'lion', 'plates']);
    const lion = characters.find(character => character.id === 'lion')!;
    const plates = characters.find(character => character.id === 'plates')!;
    expect(playableStats(lion)).toMatchObject({ health: 500, power: 18, speed: 2.6 });
    expect(playableStats(plates)).toMatchObject({ health: 300, power: 10, speed: 4.2 });
    expect(() => validateRoster(characters)).not.toThrow();
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
