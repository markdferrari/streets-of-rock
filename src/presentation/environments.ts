import * as THREE from 'three';
import { neonVelvet, vipTables } from '../content/neon-velvet';

export function addVenueScenery(scene: THREE.Scene): void {
  const palettes = [0x34243d, 0x4a2c44, 0x302c46, 0x253346];
  for (const [index, area] of neonVelvet.areas.entries()) {
    const center = (area.minX + area.maxX) / 2;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshLambertMaterial({ color: palettes[index] }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(center, 0, 0);
    scene.add(floor);
    const back = new THREE.Mesh(new THREE.BoxGeometry(16, 2.3, .2), new THREE.MeshLambertMaterial({ color: 0x1e1b2d }));
    back.position.set(center, 1.1, -3.9);
    scene.add(back);
    for (let i = 0; i < 4; i++) {
      const color = i % 2 ? 0x31d9e8 : 0xf54ea4;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.5, .13), new THREE.MeshBasicMaterial({ color }));
      strip.position.set(area.minX + 2 + i * 4, 1, -3.74);
      scene.add(strip);
    }
    const sign = new THREE.Mesh(new THREE.BoxGeometry(2.5, .35, .15), new THREE.MeshBasicMaterial({ color: index % 2 ? 0xffaa55 : 0xb95dff }));
    sign.position.set(center, 2.05, -3.69);
    scene.add(sign);
  }
  for (const position of vipTables) {
    const glow = new THREE.Mesh(new THREE.CircleGeometry(.65, 20), new THREE.MeshBasicMaterial({ color: 0xff8dbe, transparent: true, opacity: .2, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(position.x, .02, position.depth);
    scene.add(glow);
  }
}
