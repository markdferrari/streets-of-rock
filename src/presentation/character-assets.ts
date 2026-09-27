import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import cowUrl from '../../assets/characters/cow-crow/runtime/cow.glb?url';
import crowUrl from '../../assets/characters/cow-crow/runtime/crow.glb?url';

export type CharacterRole = 'cow' | 'crow';
type Asset = { scene: THREE.Group; animations: THREE.AnimationClip[] };

const requiredClips: Record<CharacterRole, string[]> = {
  cow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge',
    ...(['cow1', 'cow2', 'cow3', 'cowHeavy', 'spin'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
  crow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'crow.windup', 'crow.active', 'crow.recovery'],
};

const urls: Record<CharacterRole, string> = { cow: cowUrl, crow: crowUrl };
const gltfLoader = new GLTFLoader();

export class CharacterAssetStore {
  private pending: Promise<void> | null = null;
  private templates: Partial<Record<CharacterRole, Asset>> = {};

  constructor(
    private readonly fetchAsset: (role: CharacterRole) => Promise<Asset> = role => gltfLoader.loadAsync(urls[role]),
    private readonly required: string[] | null = null,
  ) {}

  load(): Promise<void> {
    if (this.templates.cow && this.templates.crow) return Promise.resolve();
    if (this.pending) return this.pending;
    this.pending = Promise.all((['cow', 'crow'] as const).map(async role => {
      const asset = await this.fetchAsset(role);
      if (!asset.scene || !asset.scene.children.length && this.required === null) throw new Error(`${role} model is empty`);
      const names = new Set(asset.animations.map(clip => clip.name));
      for (const clip of this.required ?? requiredClips[role]) {
        if (!names.has(clip)) throw new Error(`${role} model lacks ${clip} animation`);
      }
      return [role, asset] as const;
    })).then(entries => { this.templates = Object.fromEntries(entries); })
      .catch(error => { this.templates = {}; throw error; })
      .finally(() => { this.pending = null; });
    return this.pending;
  }

  create(role: CharacterRole): { root: THREE.Group; animations: THREE.AnimationClip[] } {
    const template = this.templates[role];
    if (!template) throw new Error(`${role} model has not loaded`);
    return { root: cloneSkinned(template.scene) as THREE.Group, animations: template.animations };
  }
}
