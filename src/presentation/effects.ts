import * as THREE from 'three';
import type { GameEvent } from '../game/types';

export class EffectLayer {
  private flashes: { mesh: THREE.Mesh; expiresAt: number }[] = [];
  constructor(private readonly scene: THREE.Scene) {}
  add(events: GameEvent[], positions: Map<number, THREE.Vector3>, now: number): void {
    for (const event of events) {
      const combat = event.type === 'hit' || event.type === 'partner-hit' || event.type === 'crow-hit' || event.type === 'enemy-warning';
      const special = event.type === 'roar-wave' || event.type === 'roar-stun' || event.type === 'roar-boss-impact' || event.type === 'headrest-release' || event.type === 'headrest-hit' || event.type === 'headrest-blocked' || event.type === 'headrest-miss';
      if (!combat && !special) continue;
      const targetId = event.type === 'enemy-warning' || event.type === 'roar-wave' || event.type === 'headrest-release' || event.type === 'headrest-miss' ? event.actorId! : event.targetId!;
      const pos = positions.get(targetId);
      if (!pos) continue;
      const roar = event.type === 'roar-stun';
      const roarWave = event.type === 'roar-wave';
      const bossImpact = event.type === 'roar-boss-impact';
      const headrestEvent = event.type.startsWith('headrest-');
      const mesh = new THREE.Mesh(new THREE.RingGeometry(.25, roarWave ? 3 : roar ? 1.05 : bossImpact ? .85 : headrestEvent ? .65 : event.type === 'hit' ? .55 : .7, 24),
        new THREE.MeshBasicMaterial({ color: roarWave || roar ? 0x7ee7ff : bossImpact ? 0xff9c55 : headrestEvent ? 0xf4d5a1 : event.type === 'hit' ? 0xffeb8a : 0xff4444, transparent: true, opacity: .85, side: THREE.DoubleSide }));
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(pos.x, .04, pos.z);
      this.scene.add(mesh);
      this.flashes.push({ mesh, expiresAt: now + (roarWave || roar ? 1000 : event.type === 'hit' ? 180 : 450) });
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
