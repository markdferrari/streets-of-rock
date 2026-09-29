import { cowMoveTuning, tuning } from './tuning';

export type CharacterId = string;
export type CharacterAssetKey = 'cow' | 'crow';
export interface PlayerProfile {
  readonly maxHp: number;
  readonly moveSpeed: number;
  readonly damage: Readonly<{ light1: number; light2: number; light3: number; heavy: number; special: number }>;
}
export interface PartnerProfile {
  readonly maxHp: number;
  readonly moveSpeed: number;
  readonly catchUpSpeed: number;
  readonly supportDamage: number;
  readonly supportCooldownTicks: number;
}
export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly displayName: string;
  readonly assetKey: CharacterAssetKey;
  readonly portraitKey: CharacterAssetKey;
  readonly playerProfile: PlayerProfile;
  readonly partnerProfile: PartnerProfile;
  readonly specialLabel: string;
}

export const STAT_SCALE = Object.freeze({ health: 500, power: 20, speed: 5 });

export const characters: readonly CharacterDefinition[] = Object.freeze([
  {
    id: 'cow', displayName: 'Cow', assetKey: 'cow', portraitKey: 'cow', specialLabel: 'Bovine Spin',
    playerProfile: {
      maxHp: tuning.cowHp, moveSpeed: tuning.cowSpeed,
      damage: { light1: cowMoveTuning.cow1.damage, light2: cowMoveTuning.cow2.damage,
        light3: cowMoveTuning.cow3.damage, heavy: cowMoveTuning.cowHeavy.damage, special: cowMoveTuning.spin.damage },
    },
    partnerProfile: { maxHp: tuning.cowHp, moveSpeed: tuning.cowSpeed, catchUpSpeed: 4.5,
      supportDamage: 8, supportCooldownTicks: 54 },
  },
  {
    id: 'crow', displayName: 'Crow', assetKey: 'crow', portraitKey: 'crow', specialLabel: 'Wing Spin',
    playerProfile: {
      maxHp: tuning.crowHp, moveSpeed: 3.4,
      damage: { light1: 10, light2: 12, light3: 18, heavy: 26, special: 50 },
    },
    partnerProfile: { maxHp: tuning.crowHp, moveSpeed: 3.4, catchUpSpeed: 4.5,
      supportDamage: 8, supportCooldownTicks: 54 },
  },
]);

export function playableStats(character: CharacterDefinition): { health: number; power: number; speed: number } {
  return { health: character.playerProfile.maxHp, power: character.playerProfile.damage.light1,
    speed: character.playerProfile.moveSpeed };
}

const assetKeys = new Set<CharacterAssetKey>(['cow', 'crow']);
function positive(value: unknown): boolean { return typeof value === 'number' && Number.isFinite(value) && value > 0; }
export function validateRoster(roster: readonly CharacterDefinition[]): void {
  if (roster.length < 2) throw new Error('Two characters are needed to form a team');
  const ids = new Set<string>();
  for (const character of roster) {
    if (!character || typeof character.id !== 'string' || !character.id.trim() || ids.has(character.id)) throw new Error('Invalid or duplicate character ID');
    ids.add(character.id);
    if (!character.displayName?.trim() || !character.specialLabel?.trim()) throw new Error(`Incomplete character ${character.id}`);
    if (!assetKeys.has(character.assetKey) || !assetKeys.has(character.portraitKey)) throw new Error(`Unknown assets for ${character.id}`);
    const player = character.playerProfile;
    const partner = character.partnerProfile;
    if (!player || !partner || !positive(player.maxHp) || !positive(player.moveSpeed) ||
      !player.damage || !(['light1', 'light2', 'light3', 'heavy', 'special'] as const).every(move => positive(player.damage[move])) ||
      !positive(partner.maxHp) || !positive(partner.moveSpeed) || !positive(partner.catchUpSpeed) ||
      !positive(partner.supportDamage) || !positive(partner.supportCooldownTicks)) {
      throw new Error(`Invalid profile for ${character.id}`);
    }
  }
}
