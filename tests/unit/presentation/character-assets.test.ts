import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { CharacterAssetStore } from '../../../src/presentation/character-assets';

const clip = (name: string) => new THREE.AnimationClip(name, 1, []);

describe('character asset ownership and loading', () => {
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
    expect(loads).toBe(4);
    await store.load();
    expect(loads).toBe(4);
    const first = store.create('cow');
    const second = store.create('cow');
    expect(first.root).not.toBe(second.root);
    expect(first.root.name).toBe('cow');
  });
  it('rejects a model missing a required action', async () => {
    const store = new CharacterAssetStore(async () => ({ scene: new THREE.Group(), animations: [clip('Idle')] }), ['Idle', 'KnockedOut']);
    await expect(store.load()).rejects.toThrow('KnockedOut');
  });
});
