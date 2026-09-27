import * as THREE from 'three';
import type { GameEvent, RunState } from '../game/types';
import { actorModel, actorPose } from './actors';
import { EffectLayer } from './effects';
import { addVenueScenery } from './environments';
import { cameraCenterX } from './camera';

export class GameScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-8, 8, 4, -4, .1, 100);
  private models = new Map<number, THREE.Group>();
  private objectModels = new Map<number, THREE.Mesh>();
  private projectileModels = new Map<number, THREE.Mesh>();
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
    addVenueScenery(this.scene);
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
    const center = cameraCenterX(run);
    this.camera.position.set(center, 8, 12);
    this.camera.lookAt(center, 0, 0);
    const positions = new Map<number, THREE.Vector3>();
    for (const actor of run.actors) {
      let model = this.models.get(actor.id);
      if (!model) { model = actorModel(actor); this.models.set(actor.id, model); this.scene.add(model); }
      model.position.set(actor.position.x, 0, actor.position.depth);
      model.rotation.y = actor.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      model.visible = actor.hp > 0 || actor.role === 'crow';
      const pose = actorPose(actor.hp <= 0 ? 'knockedOut' : actor.action.kind, actor.action.moveId);
      model.rotation.z = pose.lean;
      const size = actor.role === 'liam' ? 1.6 : actor.role === 'enforcer' ? 1.2 : actor.role === 'crow' ? .8 : 1;
      model.scale.set(size, size * pose.heightScale, size);
      positions.set(actor.id, model.position.clone());
    }
    for (const table of run.tables) {
      let model = this.objectModels.get(table.id);
      if (!model) {
        model = new THREE.Mesh(new THREE.CylinderGeometry(.7, .55, .55, 8), new THREE.MeshLambertMaterial({ color: 0x7b344e }));
        this.objectModels.set(table.id, model);
        this.scene.add(model);
      }
      model.position.set(table.position.x, .35, table.position.depth);
      model.visible = !table.broken;
    }
    for (const pickup of run.pickups) {
      let model = this.objectModels.get(pickup.id);
      if (!model) {
        model = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .45, 8), new THREE.MeshBasicMaterial({ color: 0xffc347 }));
        this.objectModels.set(pickup.id, model);
        this.scene.add(model);
      }
      model.position.set(pickup.position.x, .35, pickup.position.depth);
      model.visible = pickup.available;
    }
    for (const projectile of run.projectiles) {
      let model = this.projectileModels.get(projectile.id);
      if (!model) {
        model = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff8c43 }));
        this.projectileModels.set(projectile.id, model);
        this.scene.add(model);
      }
      model.position.set(projectile.position.x, .7, projectile.position.depth);
    }
    for (const [id, model] of this.projectileModels) {
      if (run.projectiles.some(projectile => projectile.id === id)) continue;
      this.scene.remove(model); model.geometry.dispose(); (model.material as THREE.Material).dispose(); this.projectileModels.delete(id);
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
