import { cowMoveTuning, tuning } from './tuning';
import cowDefinition from './characters/cow.json';
import crowDefinition from './characters/crow.json';
import lionDefinition from './characters/lion.json';
import platesDefinition from './characters/plates.json';

export type CharacterId = string;
export type CharacterAssetKey = 'cow' | 'crow' | 'lion' | 'plates';
export type SpecialDefinition =
  | { readonly kind: 'areaStrike'; readonly windupTicks: number; readonly activeTicks: number; readonly recoveryTicks: number; readonly damage: number; readonly range: number; readonly depthTolerance: number; readonly knockback: number }
  | { readonly kind: 'roar'; readonly windupTicks: number; readonly activeTicks: number; readonly recoveryTicks: number; readonly radius: number; readonly stunTicks: number; readonly bossDamage: number }
  | { readonly kind: 'straightProjectile'; readonly windupTicks: number; readonly activeTicks: number; readonly recoveryTicks: number; readonly projectileKey: string; readonly speed: number; readonly maxDistance: number; readonly damage: number; readonly collisionRadius: number };

export interface TimedMoveDefinition {
  readonly windupTicks: number; readonly activeTicks: number; readonly recoveryTicks: number;
  readonly damage: number; readonly range: number; readonly depthTolerance: number; readonly knockback: number;
}
export interface DodgeDefinition {
  readonly durationTicks: number; readonly speed: number; readonly invulnerabilityTicks: number; readonly cooldownTicks: number;
}
export interface CharacterDefinitionV1 {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly displayName: string;
  readonly description: string;
  readonly fightingStyle: string;
  readonly player: {
    readonly maxHp: number; readonly moveSpeed: number; readonly light: readonly [TimedMoveDefinition, TimedMoveDefinition, TimedMoveDefinition];
    readonly heavy: TimedMoveDefinition; readonly dodge: DodgeDefinition; readonly special: SpecialDefinition;
  };
  readonly partner: { readonly maxHp: number; readonly moveSpeed: number; readonly catchUpSpeed: number;
    readonly supportDamage: number; readonly supportCooldownTicks: number; readonly animationKey: string };
  readonly presentation: { readonly modelKey: string; readonly portraitKey: string; readonly animationSetKey: string;
    readonly soundSetKey: string; readonly specialLabel: string };
}
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
  readonly animationKey: string;
}
export interface CharacterDefinition {
  readonly id: CharacterId;
  readonly displayName: string;
  readonly assetKey: CharacterAssetKey;
  readonly portraitKey: CharacterAssetKey;
  readonly playerProfile: PlayerProfile;
  readonly partnerProfile: PartnerProfile;
  readonly specialLabel: string;
  readonly definition: CharacterDefinitionV1;
}

export const STAT_SCALE = Object.freeze({ health: 500, power: 20, speed: 5 });

const fields: Record<string, readonly string[]> = {
  root: ['schemaVersion', 'id', 'displayName', 'description', 'fightingStyle', 'player', 'partner', 'presentation'],
  player: ['maxHp', 'moveSpeed', 'light', 'heavy', 'dodge', 'special'],
  move: ['windupTicks', 'activeTicks', 'recoveryTicks', 'damage', 'range', 'depthTolerance', 'knockback'],
  dodge: ['durationTicks', 'speed', 'invulnerabilityTicks', 'cooldownTicks'],
  partner: ['maxHp', 'moveSpeed', 'catchUpSpeed', 'supportDamage', 'supportCooldownTicks', 'animationKey'],
  presentation: ['modelKey', 'portraitKey', 'animationSetKey', 'soundSetKey', 'specialLabel'],
  areaStrike: ['kind', 'windupTicks', 'activeTicks', 'recoveryTicks', 'damage', 'range', 'depthTolerance', 'knockback'],
  roar: ['kind', 'windupTicks', 'activeTicks', 'recoveryTicks', 'radius', 'stunTicks', 'bossDamage'],
  straightProjectile: ['kind', 'windupTicks', 'activeTicks', 'recoveryTicks', 'projectileKey', 'speed', 'maxDistance', 'damage', 'collisionRadius'],
};

const bundledDefinitions = [cowDefinition, crowDefinition, lionDefinition, platesDefinition] as unknown;
validateCharacterDefinitions(bundledDefinitions);
const definitionData = bundledDefinitions as readonly CharacterDefinitionV1[];
function specialDamage(definition: CharacterDefinitionV1): number {
  const special = definition.player.special;
  return special.kind === 'roar' ? special.bossDamage : special.damage;
}
export const characters: readonly CharacterDefinition[] = Object.freeze(definitionData.map(definition => ({
  id: definition.id,
  displayName: definition.displayName,
  assetKey: definition.presentation.modelKey as CharacterAssetKey,
  portraitKey: definition.presentation.portraitKey as CharacterAssetKey,
  specialLabel: definition.presentation.specialLabel,
  definition,
  playerProfile: {
    maxHp: definition.player.maxHp,
    moveSpeed: definition.player.moveSpeed,
    damage: {
      light1: definition.player.light[0].damage, light2: definition.player.light[1].damage,
      light3: definition.player.light[2].damage, heavy: definition.player.heavy.damage,
      special: specialDamage(definition),
    },
  },
  partnerProfile: { ...definition.partner },
})));

export function playableStats(character: CharacterDefinition): { health: number; power: number; speed: number } {
  return { health: character.playerProfile.maxHp, power: character.playerProfile.damage.light1,
    speed: character.playerProfile.moveSpeed };
}

const assetKeys = new Set<CharacterAssetKey>(['cow', 'crow', 'lion', 'plates']);
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

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function exact(value: Record<string, unknown>, allowed: readonly string[], path: string): void {
  const unknown = Object.keys(value).find(key => !allowed.includes(key));
  if (unknown) throw new Error(`${path}.${unknown}: unknown field`);
  for (const key of allowed) if (!(key in value)) throw new Error(`${path}.${key}: required field is missing`);
}
function numberFields(value: Record<string, unknown>, path: string): void {
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== 'number') continue;
    if (!Number.isFinite(item) || item < 0) throw new Error(`${path}.${key}: expected a finite non-negative number`);
  }
}
function positiveFields(value: Record<string, unknown>, keys: readonly string[], path: string): void {
  for (const key of keys) {
    const item = value[key];
    if (typeof item !== 'number' || !Number.isFinite(item) || item <= 0) {
      throw new Error(`${path}.${key}: expected a finite number greater than zero`);
    }
  }
}
function timingFields(value: Record<string, unknown>, path: string): void {
  for (const key of ['windupTicks', 'activeTicks', 'recoveryTicks']) {
    const item = value[key];
    if (typeof item !== 'number' || !Number.isInteger(item) || item <= 0) {
      throw new Error(`${path}.${key}: expected a positive whole number of ticks`);
    }
  }
}

/** Validate untrusted bundled JSON before it enters the runtime registry. */
export function validateCharacterDefinitions(input: unknown): asserts input is readonly CharacterDefinitionV1[] {
  if (!Array.isArray(input)) throw new Error('Character definitions must be an array');
  const ids = new Set<string>();
  for (const [index, item] of input.entries()) {
    const path = `characters[${index}]`;
    if (!record(item)) throw new Error(`${path}: expected an object`);
    exact(item, fields.root!, path);
    if (item.schemaVersion !== 1) throw new Error(`${path}.schemaVersion: unsupported schema version`);
    if (typeof item.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id)) throw new Error(`${path}.id: expected lowercase kebab-case ID`);
    if (ids.has(item.id)) throw new Error(`${path}.id: duplicate character ID '${item.id}'`);
    ids.add(item.id);
    for (const key of ['displayName', 'description', 'fightingStyle']) {
      if (typeof item[key] !== 'string' || !item[key].trim()) throw new Error(`${path}.${key}: expected non-empty text`);
    }
    for (const section of ['player', 'partner', 'presentation'] as const) {
      if (!record(item[section])) throw new Error(`${path}.${section}: expected an object`);
      exact(item[section], fields[section]!, `${path}.${section}`);
      numberFields(item[section], `${path}.${section}`);
    }
    const player = item.player as Record<string, unknown>;
    if (!Array.isArray(player.light) || player.light.length !== 3) throw new Error(`${path}.player.light: exactly three Light stages are required`);
    player.light.forEach((move, moveIndex) => {
      if (!record(move)) throw new Error(`${path}.player.light[${moveIndex}]: expected a move object`);
      exact(move, fields.move!, `${path}.player.light[${moveIndex}]`);
      numberFields(move, `${path}.player.light[${moveIndex}]`);
      positiveFields(move, ['damage', 'range', 'depthTolerance'], `${path}.player.light[${moveIndex}]`);
      timingFields(move, `${path}.player.light[${moveIndex}]`);
    });
    for (const key of ['heavy']) {
      const move = player[key];
      if (!record(move)) throw new Error(`${path}.player.${key}: expected a move object`);
      exact(move, fields.move!, `${path}.player.${key}`);
      numberFields(move, `${path}.player.${key}`);
      positiveFields(move, ['damage', 'range', 'depthTolerance'], `${path}.player.${key}`);
      timingFields(move, `${path}.player.${key}`);
    }
    if (!record(player.dodge)) throw new Error(`${path}.player.dodge: expected an object`);
    exact(player.dodge, fields.dodge!, `${path}.player.dodge`);
    numberFields(player.dodge, `${path}.player.dodge`);
    positiveFields(player.dodge, ['durationTicks', 'speed', 'invulnerabilityTicks', 'cooldownTicks'], `${path}.player.dodge`);
    for (const [key, value] of Object.entries(player.dodge)) if (key.endsWith('Ticks') && !Number.isInteger(value)) throw new Error(`${path}.player.dodge.${key}: expected whole ticks`);
    if (!record(player.special) || typeof player.special.kind !== 'string' || !['areaStrike', 'roar', 'straightProjectile'].includes(player.special.kind)) {
      throw new Error(`${path}.player.special.kind: unsupported Special kind`);
    }
    const special = player.special;
    const specialKind = special.kind as string;
    exact(special, fields[specialKind]!, `${path}.player.special`);
    numberFields(special, `${path}.player.special`);
    timingFields(special, `${path}.player.special`);
    const params = specialKind === 'areaStrike'
      ? ['damage', 'range', 'depthTolerance'] : specialKind === 'roar'
        ? ['radius', 'stunTicks', 'bossDamage'] : ['speed', 'maxDistance', 'damage', 'collisionRadius'];
    positiveFields(special, params, `${path}.player.special`);
    if (specialKind === 'straightProjectile' && (typeof special.projectileKey !== 'string' || !special.projectileKey.trim())) {
      throw new Error(`${path}.player.special.projectileKey: expected a resource key`);
    }
    if (specialKind === 'roar' && !Number.isInteger(special.stunTicks)) throw new Error(`${path}.player.special.stunTicks: expected whole ticks`);
    if (specialKind === 'areaStrike' && (typeof special.knockback !== 'number' || special.knockback < 0)) throw new Error(`${path}.player.special.knockback: expected a non-negative number`);
    const partner = item.partner as Record<string, unknown>;
    if (typeof partner.special !== 'undefined') throw new Error(`${path}.partner.special: partner Specials are not supported`);
    positiveFields(partner, ['maxHp', 'moveSpeed', 'catchUpSpeed', 'supportDamage', 'supportCooldownTicks'], `${path}.partner`);
    if (!Number.isInteger(partner.supportCooldownTicks) || typeof partner.animationKey !== 'string' || !partner.animationKey.trim()) throw new Error(`${path}.partner: invalid cooldown or animation key`);
    const presentation = item.presentation as Record<string, unknown>;
    for (const [key, value] of Object.entries(presentation)) if (typeof value !== 'string' || !value.trim()) throw new Error(`${path}.presentation.${key}: expected non-empty resource key`);
  }
}
