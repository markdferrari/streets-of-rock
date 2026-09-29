import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import cowUrl from '../../assets/characters/cow-crow/runtime/cow.glb?url';
import crowUrl from '../../assets/characters/cow-crow/runtime/crow.glb?url';
import type { CharacterDefinition } from '../content/characters';
import { requiredCharacterClips, type CharacterAssetKey } from '../content/animation-clips';

export type CharacterRole = CharacterAssetKey;
type Asset = { scene: THREE.Group; animations: THREE.AnimationClip[] };
export { requiredCharacterClips } from '../content/animation-clips';

const urls: Record<CharacterRole, string> = { cow: cowUrl, crow: crowUrl };
const gltfLoader = new GLTFLoader();

export class CharacterAssetStore {
  private pending: Promise<void> | null = null;
  private pendingRoles: Partial<Record<CharacterRole, Promise<void>>> = {};
  private templates: Partial<Record<CharacterRole, Asset>> = {};

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

  loadCharacter(character: CharacterDefinition): Promise<void> { return this.loadRole(character.assetKey); }

  load(): Promise<void> {
    if (this.templates.cow && this.templates.crow) return Promise.resolve();
    if (this.pending) return this.pending;
    this.pending = Promise.all((['cow', 'crow'] as const).map(role => this.loadRole(role)))
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
