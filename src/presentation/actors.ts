import * as THREE from 'three';
import type { GameActor } from '../game/types';

export function actorPose(action: GameActor['action']['kind']): { lean: number; heightScale: number } {
  switch (action) {
    case 'windup': return { lean: -.17, heightScale: 1.08 };
    case 'active': return { lean: .32, heightScale: .95 };
    case 'recovery': return { lean: .1, heightScale: .98 };
    case 'hurt': return { lean: -.4, heightScale: .88 };
    case 'dodge': return { lean: .5, heightScale: .68 };
    case 'knockedOut': return { lean: 1.2, heightScale: .35 };
    default: return { lean: 0, heightScale: 1 };
  }
}

function material(color: number) { return new THREE.MeshLambertMaterial({ color }); }
function box(parent: THREE.Group, width: number, height: number, depth: number, color: number, x: number, y: number, z: number) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

export function actorModel(actor: GameActor): THREE.Group {
  const group = new THREE.Group();
  const cow = actor.role === 'cow';
  const crow = actor.role === 'crow';
  const bodyColor = cow ? 0xeee5cc : crow ? 0x222238 : actor.role === 'grunt' ? 0xbd325e : 0x514470;
  const jacketColor = cow ? 0x292126 : crow ? 0x9d6943 : 0x282532;
  box(group, .52, .78, .35, jacketColor, 0, .95, 0);
  box(group, .41, .37, .37, bodyColor, 0, 1.52, 0);
  box(group, .18, .55, .2, jacketColor, -.38, .92, 0);
  box(group, .18, .55, .2, jacketColor, .38, .92, 0);
  box(group, .2, .56, .2, 0x24202b, -.17, .3, 0);
  box(group, .2, .56, .2, 0x24202b, .17, .3, 0);
  if (cow) {
    box(group, .13, .3, .13, 0xe8d9b7, -.23, 1.88, 0);
    box(group, .13, .3, .13, 0xe8d9b7, .23, 1.88, 0);
    box(group, .24, .15, .27, 0xeda7ac, 0, 1.48, .21);
  } else if (crow) {
    box(group, .31, .1, .2, 0xe5aa36, 0, 1.45, .27);
    box(group, .55, .15, .28, 0x2c293c, -.55, 1.04, 0);
    box(group, .55, .15, .28, 0x2c293c, .55, 1.04, 0);
  }
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(.48, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .28, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = .012;
  group.add(shadow);
  return group;
}
