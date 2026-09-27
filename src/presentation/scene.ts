import * as THREE from 'three';
import type { GameEvent, RunState } from '../game/types';
import { actorModel } from './actors';
import { EffectLayer } from './effects';

export class GameScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-8, 8, 4, -4, .1, 100);
  private models = new Map<number, THREE.Group>();
  private effects = new EffectLayer(this.scene);
  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    this.host.append(this.renderer.domElement);
    this.scene.background = new THREE.Color(0x171024);
    this.scene.add(new THREE.AmbientLight(0xffffff, 2.2));
    const light = new THREE.DirectionalLight(0xffd3fa, 3);
    light.position.set(-3, 8, 5);
    this.scene.add(light);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), new THREE.MeshLambertMaterial({ color: 0x34243d }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(7, 0, 0);
    this.scene.add(floor);
    for (const [x, color] of [[-1, 0xea3eae], [4, 0x3ae4e6], [9, 0xea3eae], [14, 0x3ae4e6]] as const) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.5, .12), new THREE.MeshBasicMaterial({ color }));
      strip.position.set(x, .9, -3.6);
      this.scene.add(strip);
    }
    this.camera.position.set(7, 8, 12);
    this.camera.lookAt(7, 0, 0);
    this.resize();
  }
  resize(): void {
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    const aspect = width / height;
    this.camera.left = -6 * aspect;
    this.camera.right = 6 * aspect;
    this.camera.top = 6;
    this.camera.bottom = -6;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }
  render(run: RunState, events: GameEvent[], now: number): void {
    const positions = new Map<number, THREE.Vector3>();
    for (const actor of run.actors) {
      let model = this.models.get(actor.id);
      if (!model) { model = actorModel(actor); this.models.set(actor.id, model); this.scene.add(model); }
      model.position.set(actor.position.x, 0, actor.position.depth);
      model.rotation.y = actor.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      model.visible = actor.hp > 0 || actor.role === 'crow';
      if (actor.role === 'crow' && actor.hp === 0) model.rotation.z = Math.PI / 2;
      positions.set(actor.id, model.position.clone());
    }
    this.effects.add(events, positions, now);
    this.effects.update(now);
    this.renderer.render(this.scene, this.camera);
  }
  dispose(): void {
    this.effects.dispose();
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      }
    });
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
