import * as THREE from 'three';
import type { GameEvent, RunState } from '../game/types';
import { actorModel, actorPose } from './actors';
import { EffectLayer } from './effects';
import { addVenueScenery } from './environments';
import { computeArenaFrame } from './camera';
import { CharacterAssetStore, characterBodyEnvelope, type CharacterRole } from './character-assets';
import { animationSample } from './character-animation';
import { cameraShakeOffset } from './shake';
import { buildArenaContext, type ArenaContext, type CameraFrame } from '../game/arena';
import { getPartner, getPlayer } from '../game/selectors';

export class GameScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-8, 8, 4, -4, .1, 100);
  private models = new Map<number, THREE.Group>();
  private animated = new Map<number, { root: THREE.Group; mixer: THREE.AnimationMixer; clips: Map<string, THREE.AnimationClip>; current: string | null }>();
  private previousPositions = new Map<number, THREE.Vector2>();
  private objectModels = new Map<number, THREE.Mesh>();
  private projectileModels = new Map<number, THREE.Object3D>();
  private effects = new EffectLayer(this.scene);
  private lastImpactMs: number | null = null;
  private currentFrame: CameraFrame | null = null;
  private lastFrameTime: number | null = null;
  constructor(private readonly host: HTMLElement, private readonly characterAssets: CharacterAssetStore) {
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
    this.currentFrame = null;
    this.renderer.setSize(width, height, false);
  }
  drawStats(): { draws: number; triangles: number } {
    return { draws: this.renderer.info.render.calls, triangles: this.renderer.info.render.triangles };
  }
  frameSnapshot(): CameraFrame | null { return this.currentFrame ? { ...this.currentFrame } : null; }
  arenaContext(run: RunState): ArenaContext {
    const player = getPlayer(run); const partner = getPartner(run);
    const viewport = { width: Math.max(1, this.host.clientWidth), height: Math.max(1, this.host.clientHeight) };
    const frame = this.currentFrame ?? computeArenaFrame(run, viewport, {
      player: characterBodyEnvelope(player.characterId as CharacterRole), partner: characterBodyEnvelope(partner.characterId as CharacterRole),
    });
    const partnerContext = buildArenaContext(run, frame, characterBodyEnvelope(partner.characterId as CharacterRole), 'partner');
    const playerContext = buildArenaContext(run, frame, characterBodyEnvelope(player.characterId as CharacterRole), 'player');
    return { ...partnerContext, playerVisibleRegions: playerContext.visibleRegions };
  }
  render(run: RunState, events: GameEvent[], now: number, shakeEnabled = true, active = true): void {
    if (events.some(event => event.type === 'hit' || event.type === 'partner-hit')) this.lastImpactMs = now;
    const player = getPlayer(run); const partner = getPartner(run);
    const viewport = { width: Math.max(1, this.host.clientWidth), height: Math.max(1, this.host.clientHeight) };
    const delta = active && this.lastFrameTime !== null ? Math.min(.1, Math.max(0, (now - this.lastFrameTime) / 1000)) : 0;
    const frame = computeArenaFrame(run, viewport, {
      player: characterBodyEnvelope(player.characterId as CharacterRole), partner: characterBodyEnvelope(partner.characterId as CharacterRole),
    }, this.currentFrame, delta);
    this.currentFrame = frame;
    this.lastFrameTime = now;
    this.camera.left = -frame.halfHeight * frame.aspect;
    this.camera.right = frame.halfHeight * frame.aspect;
    this.camera.top = frame.halfHeight;
    this.camera.bottom = -frame.halfHeight;
    this.camera.updateProjectionMatrix();
    const offset = this.lastImpactMs === null ? 0 : cameraShakeOffset(now - this.lastImpactMs, shakeEnabled);
    this.camera.position.set(frame.anchorX + offset, frame.anchorHeight + 8, frame.anchorDepth + 12);
    this.camera.lookAt(frame.anchorX + offset, frame.anchorHeight, frame.anchorDepth);
    const positions = new Map<number, THREE.Vector3>();
    for (const actor of run.actors) {
      let model = this.models.get(actor.id);
      if (!model) {
        if (actor.role === 'player' || actor.role === 'partner') {
          const identity = actor.characterId as CharacterRole;
          const instance = this.characterAssets.create(identity);
          model = instance.root;
          const mixer = new THREE.AnimationMixer(model);
          this.animated.set(actor.id, { root: model, mixer, clips: new Map(instance.animations.map(clip => [clip.name, clip])), current: null });
          const shadow = new THREE.Mesh(new THREE.CircleGeometry(.48, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .28, depthWrite: false }));
          shadow.name = 'Local.GroundShadow';
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = .012;
          model.add(shadow);
        } else model = actorModel(actor);
        this.models.set(actor.id, model);
        this.scene.add(model);
      }
      const previous = this.previousPositions.get(actor.id);
      const moving = !!previous && Math.hypot(actor.position.x - previous.x, actor.position.depth - previous.y) > .001;
      this.previousPositions.set(actor.id, new THREE.Vector2(actor.position.x, actor.position.depth));
      model.position.set(actor.position.x, 0, actor.position.depth);
      model.rotation.y = actor.facing === 1 ? Math.PI / 2 : -Math.PI / 2;
      model.visible = actor.hp > 0 || actor.team === 'ally';
      const pose = actorPose(actor.hp <= 0 ? 'knockedOut' : actor.action.kind, actor.action.moveId);
      const animation = this.animated.get(actor.id);
      if (animation) {
        model.rotation.z = pose.lean;
        model.scale.set(1.25, 1.25 * pose.heightScale, 1.25);
        const sample = animationSample(actor, run.tick, moving);
        const clip = animation.clips.get(sample.clip);
        if (clip) {
          if (animation.current !== sample.clip) {
            animation.mixer.stopAllAction();
            animation.mixer.setTime(0);
            const action = animation.mixer.clipAction(clip);
            action.reset().play();
            action.setLoop(sample.clip === 'Idle' || sample.clip === 'Move' ? THREE.LoopRepeat : THREE.LoopOnce, 1);
            action.clampWhenFinished = true;
            animation.current = sample.clip;
          }
          animation.mixer.setTime(Math.min(clip.duration, clip.duration * sample.progress));
        }
        if (sample.clip === 'spin.active' || sample.clip === 'wingSpin.active') model.rotation.y += sample.progress * Math.PI * 2;
      } else {
        model.rotation.z = pose.lean;
        const size = actor.role === 'liam' ? 1.6 : actor.role === 'enforcer' ? 1.2 : 1;
        model.scale.set(size, size * pose.heightScale, size);
      }
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
        if (projectile.kind === 'headrest') {
          model = this.characterAssets.createHeadrest();
          model.scale.setScalar(.55);
          model.rotation.y = Math.atan2(projectile.direction.x, projectile.direction.depth);
        } else model = new THREE.Mesh(new THREE.SphereGeometry(.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff8c43 }));
        this.projectileModels.set(projectile.id, model);
        this.scene.add(model);
      }
      model.position.set(projectile.position.x, .7, projectile.position.depth);
    }
    for (const [id, model] of this.projectileModels) {
      if (run.projectiles.some(projectile => projectile.id === id)) continue;
      this.scene.remove(model);
      if (model instanceof THREE.Mesh) { model.geometry.dispose(); (model.material as THREE.Material).dispose(); }
      this.projectileModels.delete(id);
    }
    this.effects.add(events, positions, now);
    this.effects.update(now);
    this.renderer.render(this.scene, this.camera);
  }
  dispose(): void {
    this.effects.dispose();
    for (const actor of this.animated.values()) {
      actor.mixer.stopAllAction();
      actor.mixer.uncacheRoot(actor.root);
      const shadow = actor.root.getObjectByName('Local.GroundShadow');
      if (shadow instanceof THREE.Mesh) {
        shadow.geometry.dispose();
        (shadow.material as THREE.Material).dispose();
      }
      this.scene.remove(actor.root);
    }
    this.animated.clear();
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
