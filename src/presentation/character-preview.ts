import * as THREE from 'three';
import type { CharacterDefinition, CharacterId } from '../content/characters';
import type { CharacterAssetStore } from './character-assets';

interface RendererLike {
  readonly domElement: HTMLCanvasElement;
  setPixelRatio(value: number): void;
  setSize(width: number, height: number, updateStyle?: boolean): void;
  render(scene: THREE.Scene, camera: THREE.Camera): void;
  dispose(): void;
}

export class CharacterPreview {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-2, 2, 3, -1, .1, 50);
  private renderer: RendererLike | null = null;
  private root: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private generation = 0;
  private lastFrameMs: number | null = null;
  private disposed = false;
  currentId: CharacterId | null = null;

  constructor(
    private readonly host: HTMLElement,
    private readonly assets: Pick<CharacterAssetStore, 'loadCharacter' | 'createCharacter'>,
    private readonly createRenderer: () => RendererLike = () => new THREE.WebGLRenderer({ antialias: true, alpha: true }),
  ) {
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.2));
    const light = new THREE.DirectionalLight(0xffd3fa, 3);
    light.position.set(-3, 8, 5);
    this.scene.add(light);
    this.camera.position.set(0, 2.8, 7);
    this.camera.lookAt(0, 1.4, 0);
  }

  async show(character: CharacterDefinition): Promise<boolean> {
    if (this.disposed) return false;
    const generation = ++this.generation;
    try {
      await this.assets.loadCharacter(character);
    } catch (error) {
      if (generation !== this.generation || this.disposed) return false;
      this.currentId = null;
      throw error;
    }
    if (generation !== this.generation || this.disposed) return false;
    this.mixer?.stopAllAction();
    if (this.root) this.scene.remove(this.root);
    const instance = this.assets.createCharacter(character);
    this.root = instance.root;
    this.scene.add(this.root);
    this.mixer = new THREE.AnimationMixer(this.root);
    const idle = instance.animations.find(clip => clip.name === 'Idle');
    if (!idle) throw new Error(`${character.id} model lacks Idle animation`);
    this.mixer.clipAction(idle).play();
    this.currentId = character.id;
    if (!this.renderer) {
      this.renderer = this.createRenderer();
      this.host.append(this.renderer.domElement);
      this.resize();
    }
    this.lastFrameMs = null;
    return true;
  }

  resize(): void {
    if (!this.renderer) return;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    const aspect = width / height;
    this.camera.left = -2.8 * aspect;
    this.camera.right = 2.8 * aspect;
    this.camera.top = 2.8;
    this.camera.bottom = -2.8;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1, 1.5));
    this.renderer.setSize(width, height, false);
  }

  render(nowMs: number, reducedMotion = false): void {
    if (!this.renderer || !this.root || !this.mixer || this.disposed) return;
    if (reducedMotion) this.mixer.setTime(0);
    else if (this.lastFrameMs !== null) this.mixer.update(Math.max(0, Math.min(50, nowMs - this.lastFrameMs)) / 1000);
    this.lastFrameMs = nowMs;
    this.renderer.render(this.scene, this.camera);
  }

  drawStats(): { draws: number; triangles: number } {
    const renderer = this.renderer as (RendererLike & { info?: { render: { calls: number; triangles: number } } }) | null;
    return { draws: renderer?.info?.render.calls ?? 0, triangles: renderer?.info?.render.triangles ?? 0 };
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    this.mixer?.stopAllAction();
    if (this.root) this.scene.remove(this.root);
    this.root = null;
    this.mixer = null;
    this.currentId = null;
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = null;
  }
}
