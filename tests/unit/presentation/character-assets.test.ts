import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CharacterAssetStore, characterBodyEnvelope, requiredCharacterClips, validateCharacterResources, characterResourcePaths } from '../../../src/presentation/character-assets';
import { characters } from '../../../src/content/characters';

const clip = (name: string) => new THREE.AnimationClip(name, 1, []);

describe('character asset ownership and loading', () => {
  it('reports missing model, portrait, sound, and semantic animation resources by character and field', () => {
    expect(() => validateCharacterResources(undefined, { models: ['cow', 'crow', 'plates'], portraits: ['cow', 'crow', 'plates'], sounds: ['cow', 'crow', 'lion', 'plates'], animationSets: ['cow', 'crow', 'lion', 'plates'] })).toThrow(/lion.*modelKey/i);
    expect(() => validateCharacterResources(undefined, { models: ['cow', 'crow', 'lion', 'plates'], portraits: ['cow', 'crow', 'plates'], sounds: ['cow', 'crow', 'lion', 'plates'], animationSets: ['cow', 'crow', 'lion', 'plates'] })).toThrow(/lion.*portraitKey/i);
    expect(() => validateCharacterResources(undefined, { models: ['cow', 'crow', 'lion', 'plates'], portraits: ['cow', 'crow', 'lion', 'plates'], sounds: ['cow', 'crow', 'plates'], animationSets: ['cow', 'crow', 'lion', 'plates'] })).toThrow(/lion.*soundSetKey/i);
    expect(() => validateCharacterResources(undefined, { models: ['cow', 'crow', 'lion', 'plates'], portraits: ['cow', 'crow', 'lion', 'plates'], sounds: ['cow', 'crow', 'lion', 'plates'], animationSets: ['cow', 'crow', 'plates'] })).toThrow(/lion.*animationSetKey/i);
    expect(() => validateCharacterResources(undefined, { models: ['cow', 'crow', 'lion', 'plates'], portraits: ['cow', 'crow', 'lion', 'plates'], sounds: ['cow', 'crow', 'lion', 'plates'], animationSets: ['cow', 'crow', 'lion', 'plates'], props: [] })).toThrow(/plates.*projectileKey/i);
    expect(characterResourcePaths.cow).toEqual({ model: 'assets/characters/cow-crow/runtime/cow.glb', portrait: 'assets/characters/cow-crow/portraits/cow.png' });
    expect(characterResourcePaths.crow).toEqual({ model: 'assets/characters/cow-crow/runtime/crow.glb', portrait: 'assets/characters/cow-crow/portraits/crow.png' });
  });
  it('exposes conservative world-space bounds for the rotated and scaled Cow/Crow clips', () => {
    for (const role of ['cow', 'crow'] as const) {
      const bounds = characterBodyEnvelope(role);
      expect(bounds.minX).toBeLessThanOrEqual(-1.7);
      expect(bounds.maxX).toBeGreaterThanOrEqual(1.7);
      expect(bounds.minDepth).toBeLessThanOrEqual(-1.7);
      expect(bounds.maxDepth).toBeGreaterThanOrEqual(1.7);
      expect(bounds.minY).toBeLessThanOrEqual(0);
      expect(bounds.maxY).toBeGreaterThanOrEqual(role === 'cow' ? 2.7 : 2.2);
    }
  });
  it('requires every Crow player phase plus Dodge before readiness', () => {
    const clips = requiredCharacterClips('crow');
    expect(clips).toContain('Dodge');
    for (const move of ['crow1', 'crow2', 'crow3', 'crowHeavy', 'wingSpin']) {
      for (const phase of ['windup', 'active', 'recovery']) expect(clips).toContain(`${move}.${phase}`);
    }
    expect(requiredCharacterClips('cow')).toContain('cow1.active');
  });
  it('blocks an incomplete load, retries failure, then reuses successful templates', async () => {
    let loads = 0;
    const store = new CharacterAssetStore(async role => {
      loads++;
      if (loads === 1) throw new Error('offline');
      const group = new THREE.Group(); group.name = role;
      return { scene: group, animations: [clip('Idle'), clip('Move'), clip('KnockedOut')] };
    }, ['Idle', 'Move', 'KnockedOut']);
    await expect(store.load()).rejects.toThrow('offline');
    await store.load();
    expect(loads).toBe(5);
    await store.load();
    expect(loads).toBe(5);
    const first = store.create('cow');
    const second = store.create('cow');
    expect(first.root).not.toBe(second.root);
    expect(first.root.name).toBe('cow');
  });
  it('rejects a model missing a required action', async () => {
    const store = new CharacterAssetStore(async () => ({ scene: new THREE.Group(), animations: [clip('Idle')] }), ['Idle', 'KnockedOut']);
    await expect(store.load()).rejects.toThrow('KnockedOut');
  });
  it('requires Lion roar and Plates headrest/support semantic clips', async () => {
    const required = requiredCharacterClips('lion');
    const scene = () => { const group = new THREE.Group(); group.add(new THREE.Object3D()); return group; };
    const lionStore = new CharacterAssetStore(async () => ({ scene: scene(), animations: required.slice(0, -1).map(clip) }));
    await expect(lionStore.loadCharacter(characters.find(character => character.id === 'lion')!)).rejects.toThrow(/lion model lacks lionSupport.recovery/);
    const plateRequired = requiredCharacterClips('plates');
    const platesStore = new CharacterAssetStore(async () => ({ scene: scene(), animations: plateRequired.filter(name => name !== 'headrest.active').map(clip) }));
    await expect(platesStore.loadCharacter(characters.find(character => character.id === 'plates')!)).rejects.toThrow(/plates model lacks headrest.active/);
  });
  it('resolves registry asset keys and retries an individual failed preview load', async () => {
    let attempts = 0;
    const store = new CharacterAssetStore(async role => {
      attempts++;
      if (attempts === 1) throw new Error('offline');
      const scene = new THREE.Group(); scene.name = role;
      return { scene, animations: [clip('Idle')] };
    }, ['Idle']);
    await expect(store.loadCharacter(characters[0]!)).rejects.toThrow('offline');
    await store.loadCharacter(characters[0]!);
    expect(store.createCharacter(characters[0]!).root.name).toBe('cow');
    expect(attempts).toBe(2);
  });
  it('keeps an already loaded preview when the other model fails during preparation', async () => {
    const loaded: string[] = [];
    let crowAttempts = 0;
    const store = new CharacterAssetStore(async role => {
      loaded.push(role);
      if (role === 'crow' && ++crowAttempts === 1) throw new Error('crow unavailable');
      const scene = new THREE.Group(); scene.name = role;
      return { scene, animations: [clip('Idle')] };
    }, ['Idle']);
    await store.loadCharacter(characters[0]!);
    await expect(store.load()).rejects.toThrow('crow unavailable');
    expect(store.create('cow').root.name).toBe('cow');
    await store.load();
    expect(loaded).toEqual(['cow', 'crow', 'lion', 'plates', 'crow']);
  });
});
