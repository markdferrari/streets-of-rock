import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CharacterAssetStore, requiredCharacterClips } from '../../../src/presentation/character-assets';
import { characters } from '../../../src/content/characters';

const clip = (name: string) => new THREE.AnimationClip(name, 1, []);

describe('character asset ownership and loading', () => {
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
    expect(loads).toBe(3);
    await store.load();
    expect(loads).toBe(3);
    const first = store.create('cow');
    const second = store.create('cow');
    expect(first.root).not.toBe(second.root);
    expect(first.root.name).toBe('cow');
  });
  it('rejects a model missing a required action', async () => {
    const store = new CharacterAssetStore(async () => ({ scene: new THREE.Group(), animations: [clip('Idle')] }), ['Idle', 'KnockedOut']);
    await expect(store.load()).rejects.toThrow('KnockedOut');
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
    expect(loaded).toEqual(['cow', 'crow', 'crow']);
  });
});
