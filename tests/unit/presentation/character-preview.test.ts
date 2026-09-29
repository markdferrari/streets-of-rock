import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import { characters } from '../../../src/content/characters';
import { CharacterPreview } from '../../../src/presentation/character-preview';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

describe('character preview', () => {
  it('ignores stale load completion and keeps one canvas with independent Idle clones', async () => {
    const pending = [deferred<void>(), deferred<void>()];
    const resource = new THREE.BoxGeometry();
    const template = new THREE.Group(); template.add(new THREE.Mesh(resource));
    const idle = new THREE.AnimationClip('Idle', 1, []);
    const store = {
      loadCharacter: vi.fn().mockImplementationOnce(() => pending[0]!.promise).mockImplementationOnce(() => pending[1]!.promise),
      createCharacter: vi.fn(() => ({ root: template.clone(), animations: [idle] })),
    };
    const canvas = { remove: vi.fn() };
    const host = { append: vi.fn(), clientWidth: 300, clientHeight: 400 };
    const renderer = { domElement: canvas, setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() };
    const preview = new CharacterPreview(host as unknown as HTMLElement, store as never, () => renderer as never);
    const first = preview.show(characters[0]!);
    const second = preview.show(characters[1]!);
    pending[1]!.resolve();
    expect(await second).toBe(true);
    pending[0]!.resolve();
    expect(await first).toBe(false);
    expect(preview.currentId).toBe('crow');
    expect(host.append).toHaveBeenCalledTimes(1);
    expect(store.createCharacter).toHaveBeenCalledTimes(1);
    const disposeGeometry = vi.spyOn(resource, 'dispose');
    preview.dispose();
    expect(renderer.dispose).toHaveBeenCalledTimes(1);
    expect(canvas.remove).toHaveBeenCalledTimes(1);
    expect(disposeGeometry).not.toHaveBeenCalled();
  });

  it('keeps failure retryable and freezes Idle at time zero under reduced motion', async () => {
    const template = new THREE.Group();
    const idle = new THREE.AnimationClip('Idle', 1, []);
    const store = {
      loadCharacter: vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined),
      createCharacter: vi.fn(() => ({ root: template.clone(), animations: [idle] })),
    };
    const renderer = { domElement: { remove: vi.fn() }, setPixelRatio: vi.fn(), setSize: vi.fn(), render: vi.fn(), dispose: vi.fn() };
    const preview = new CharacterPreview({ append: vi.fn(), clientWidth: 300, clientHeight: 400 } as unknown as HTMLElement,
      store as never, () => renderer as never);
    await expect(preview.show(characters[0]!)).rejects.toThrow('offline');
    expect(preview.currentId).toBeNull();
    expect(await preview.show(characters[0]!)).toBe(true);
    preview.render(100, true);
    preview.render(200, true);
    expect(renderer.render).toHaveBeenCalledTimes(2);
    expect(preview.currentId).toBe('cow');
  });
});
