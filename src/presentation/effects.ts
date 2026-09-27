import * as THREE from 'three';
import type { GameEvent } from '../game/types';

export class EffectLayer {
  private flashes: { mesh: THREE.Mesh; expiresAt: number }[] = [];
  constructor(private readonly scene: THREE.Scene) {}
  add(events: GameEvent[], positions: Map<number, THREE.Vector3>, now: number): void {
    for (const event of events) {
      if (event.type !== 'hit' && event.type !== 'crow-hit' && event.type !== 'enemy-warning') continue;
      const pos = positions.get(event.type === 'enemy-warning' ? event.actorId! : event.targetId!);
      if (!pos) continue;
      const mesh = new THREE.Mesh(new THREE.RingGeometry(.25, event.type === 'hit' ? .55 : .7, 24),
        new THREE.MeshBasicMaterial({ color: event.type === 'hit' ? 0xffeb8a : 0xff4444, transparent: true, opacity: .85, side: THREE.DoubleSide }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(pos.x, .04, pos.z);
      this.scene.add(mesh);
      this.flashes.push({ mesh, expiresAt: now + (event.type === 'hit' ? 180 : 450) });
    }
  }
  update(now: number): void {
    this.flashes = this.flashes.filter(flash => {
      if (now < flash.expiresAt) return true;
      this.scene.remove(flash.mesh);
      flash.mesh.geometry.dispose();
      (flash.mesh.material as THREE.Material).dispose();
      return false;
    });
  }
  dispose(): void { for (const flash of this.flashes) { this.scene.remove(flash.mesh); flash.mesh.geometry.dispose(); (flash.mesh.material as THREE.Material).dispose(); } this.flashes = []; }
}
