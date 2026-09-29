import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import cowUrl from '../../assets/characters/cow-crow/runtime/cow.glb?url';
import crowUrl from '../../assets/characters/cow-crow/runtime/crow.glb?url';
import lionUrl from '../../assets/characters/lion/runtime/character.glb?url';
import platesUrl from '../../assets/characters/plates/runtime/character.glb?url';
import headrestUrl from '../../assets/props/headrest/headrest.glb?url';
import type { CharacterDefinition } from '../content/characters';
import { requiredCharacterClips, type CharacterAssetKey } from '../content/animation-clips';
import type { BodyEnvelope } from '../game/arena';
import { characters, type CharacterDefinitionV1 } from '../content/characters';

export type CharacterRole = CharacterAssetKey;
type Asset = { scene: THREE.Group; animations: THREE.AnimationClip[] };
export { requiredCharacterClips } from '../content/animation-clips';

export const characterResourcePaths = Object.freeze({
  cow: { model: 'assets/characters/cow-crow/runtime/cow.glb', portrait: 'assets/characters/cow-crow/portraits/cow.png' },
  crow: { model: 'assets/characters/cow-crow/runtime/crow.glb', portrait: 'assets/characters/cow-crow/portraits/crow.png' },
  lion: { model: 'assets/characters/lion/runtime/character.glb', portrait: 'assets/characters/lion/portrait.png' },
  plates: { model: 'assets/characters/plates/runtime/character.glb', portrait: 'assets/characters/plates/portrait.png' },
});
export interface ResourceKeys { models: readonly string[]; portraits: readonly string[]; sounds: readonly string[]; animationSets: readonly string[]; props?: readonly string[] }
const bundledResourceKeys: ResourceKeys = {
  models: Object.keys(characterResourcePaths), portraits: Object.keys(characterResourcePaths),
  sounds: ['cow', 'crow', 'lion', 'plates'], animationSets: ['cow', 'crow', 'lion', 'plates'],
  props: ['headrest'],
};
export function validateCharacterResources(definitions: readonly CharacterDefinitionV1[] = characters.map(character => character.definition), available: ResourceKeys = bundledResourceKeys): void {
  for (const character of definitions) {
    const checks: [string, string, readonly string[]][] = [
      ['modelKey', character.presentation.modelKey, available.models],
      ['portraitKey', character.presentation.portraitKey, available.portraits],
      ['soundSetKey', character.presentation.soundSetKey, available.sounds],
      ['animationSetKey', character.presentation.animationSetKey, available.animationSets],
    ];
    for (const [field, key, keys] of checks) if (!keys.includes(key)) throw new Error(`${character.id}.${field}: missing bundled resource '${key}'`);
    const clips = requiredCharacterClips(character.presentation.animationSetKey as CharacterAssetKey);
    if (new Set(clips).size !== clips.length) throw new Error(`${character.id}.animationSetKey: duplicate semantic animation key`);
    if (character.player.special.kind === 'straightProjectile' && !available.props?.includes(character.player.special.projectileKey)) {
      throw new Error(`${character.id}.special.projectileKey: missing bundled prop '${character.player.special.projectileKey}'`);
    }
  }
}

// Exported geometry reaches 1.26 local units on Crow's wing and 2.09 units in
// Cow's height. Gameplay scales both by 1.25 and rotates them around Y; the
// margins also cover the authored action poses and the presentation lean.
const bodyEnvelopes: Record<CharacterRole, BodyEnvelope> = {
  cow: { minX: -1.7, maxX: 1.7, minY: 0, maxY: 3.1, minDepth: -1.7, maxDepth: 1.7 },
  crow: { minX: -1.7, maxX: 1.7, minY: 0, maxY: 2.6, minDepth: -1.7, maxDepth: 1.7 },
  lion: { minX: -1.9, maxX: 1.9, minY: 0, maxY: 2.5, minDepth: -1.6, maxDepth: 1.6 },
  plates: { minX: -1.7, maxX: 1.7, minY: 0, maxY: 2.0, minDepth: -1.4, maxDepth: 1.4 },
};

export function characterBodyEnvelope(role: CharacterRole): BodyEnvelope { return bodyEnvelopes[role]; }

const urls: Record<CharacterRole, string> = { cow: cowUrl, crow: crowUrl, lion: lionUrl, plates: platesUrl };
const gltfLoader = new GLTFLoader();

export class CharacterAssetStore {
  private pending: Promise<void> | null = null;
  private pendingRoles: Partial<Record<CharacterRole, Promise<void>>> = {};
  private templates: Partial<Record<CharacterRole, Asset>> = {};
  private headrestTemplate: THREE.Group | null = null;
  private pendingHeadrest: Promise<void> | null = null;

  constructor(
    private readonly fetchAsset: (role: CharacterRole) => Promise<Asset> = role => gltfLoader.loadAsync(urls[role]),
    private readonly required: string[] | null = null,
  ) {}

  private validate(role: CharacterRole, asset: Asset): void {
    if (!asset.scene || !asset.scene.children.length && this.required === null) throw new Error(`${role} model is empty`);
    const names = new Set(asset.animations.map(clip => clip.name));
    for (const clip of this.required ?? requiredCharacterClips(role)) {
      if (!names.has(clip)) throw new Error(`${role} model lacks ${clip} animation`);
    }
  }

  private loadRole(role: CharacterRole): Promise<void> {
    if (this.templates[role]) return Promise.resolve();
    if (this.pendingRoles[role]) return this.pendingRoles[role];
    const promise = this.fetchAsset(role).then(asset => {
      this.validate(role, asset);
      this.templates[role] = asset;
    }).finally(() => { delete this.pendingRoles[role]; });
    this.pendingRoles[role] = promise;
    return promise;
  }

  loadCharacter(character: CharacterDefinition): Promise<void> {
    return this.loadRole(character.assetKey).then(() => character.id === 'plates' ? this.loadHeadrest() : undefined);
  }

  private loadHeadrest(): Promise<void> {
    if (this.headrestTemplate) return Promise.resolve();
    if (this.pendingHeadrest) return this.pendingHeadrest;
    this.pendingHeadrest = gltfLoader.loadAsync(headrestUrl).then(gltf => {
      if (!gltf.scene || !gltf.scene.children.length) throw new Error('headrest prop is empty');
      this.headrestTemplate = gltf.scene;
    }).finally(() => { this.pendingHeadrest = null; });
    return this.pendingHeadrest;
  }

  createHeadrest(): THREE.Group {
    if (!this.headrestTemplate) throw new Error('headrest prop has not loaded');
    return cloneSkinned(this.headrestTemplate) as THREE.Group;
  }

  load(): Promise<void> {
    if (Object.keys(urls).every(role => this.templates[role as CharacterRole])) return Promise.resolve();
    if (this.pending) return this.pending;
    this.pending = Promise.all((Object.keys(urls) as CharacterRole[]).map(role => this.loadRole(role)))
      .then(() => {})
      .finally(() => { this.pending = null; });
    return this.pending;
  }

  create(role: CharacterRole): { root: THREE.Group; animations: THREE.AnimationClip[] } {
    const template = this.templates[role];
    if (!template) throw new Error(`${role} model has not loaded`);
    return { root: cloneSkinned(template.scene) as THREE.Group, animations: template.animations };
  }

  createCharacter(character: CharacterDefinition): { root: THREE.Group; animations: THREE.AnimationClip[] } {
    return this.create(character.assetKey);
  }
}
