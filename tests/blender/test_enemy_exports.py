"""Scoped checks for the two KayKit pilot exports, not final art acceptance."""
import hashlib
import json
import math
import struct
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
PILOT=ROOT/'tests/godot/fixtures/art/enemy-pilot'

def read_glb(path):
    data=path.read_bytes()
    assert data[:4]==b'glTF'
    length,kind=struct.unpack_from('<II',data,12)
    assert kind==0x4e4f534a
    gltf=json.loads(data[20:20+length])
    offset=20+length
    n=struct.unpack_from('<I',data,offset)[0]
    binary=data[offset+8:offset+8+n]
    def accessor(index):
        a=gltf['accessors'][index];v=gltf['bufferViews'][a['bufferView']]
        size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        code={5126:'f',5125:'I',5123:'H',5121:'B'}[a['componentType']]
        stride=v.get('byteStride',struct.calcsize(code)*size)
        start=v.get('byteOffset',0)+a.get('byteOffset',0)
        return [struct.unpack_from('<'+code*size,binary,start+i*stride) for i in range(a['count'])]
    return gltf,accessor

class EnemyExportTests(unittest.TestCase):
    def test_clips_skin_materials_bindings_and_self_contained_exports(self):
        for role,attack in [('grunt','Melee_Unarmed_Attack_Punch_A'),('zoner','Throw')]:
            folder=PILOT/role
            record=json.loads((folder/'definition.json').read_text())
            g,accessor=read_glb(folder/'runtime/character.glb')
            clips={a['name']:a for a in g['animations']}
            self.assertEqual(set(clips),{'Idle_A','Running_A','Hit_A','Death_A',attack})
            self.assertEqual(len(g['meshes']),1,'one skinned mesh; batch body parts by shared material to retain draw-call headroom')
            self.assertEqual(len(g['materials']),1,'shared vertex-colour palette preserves draw-call headroom')
            self.assertTrue(g['skins'])
            self.assertEqual(len(g['skins'][0]['joints']),23)
            self.assertFalse(g.get('cameras'))
            self.assertFalse(g.get('extensionsRequired'))
            self.assertFalse(any('uri' in b for b in g['buffers']))
            for binding in record['clipBindings'].values():
                self.assertIn(binding['clipName'],clips)
                clip=clips[binding['clipName']]
                end=max(g['accessors'][s['input']]['max'][0] for s in clip['samplers'])
                self.assertLessEqual(binding['endSeconds'],end+1e-5)
            for mesh in g['meshes']:
                for primitive in mesh['primitives']:
                    self.assertIn('COLOR_0',primitive['attributes'])
                    self.assertIn('JOINTS_0',primitive['attributes'])
                    self.assertIn('WEIGHTS_0',primitive['attributes'])
                    positions=accessor(primitive['attributes']['POSITION'])
                    self.assertTrue(all(math.isfinite(x) for pos in positions for x in pos))
            self.assertEqual(hashlib.sha256((folder/'runtime/character.glb').read_bytes()).hexdigest(),record['runtimeSha256'])
    def test_attack_hips_cannot_lunge_beyond_simulation_owned_position(self):
        for role in ['grunt','zoner']:
            g,accessor=read_glb(PILOT/role/'runtime/character.glb')
            for animation in g['animations']:
                for channel in animation['channels']:
                    name=g['nodes'][channel['target']['node']].get('name')
                    if channel['target']['path']!='translation' or name not in ['root','hips']:continue
                    values=accessor(animation['samplers'][channel['sampler']]['output'])
                    for component in [0,2]:
                        span=max(v[component] for v in values)-min(v[component] for v in values)
                        self.assertLess(span,0.001,(role,animation['name'],name,component,span))
    def test_heroes_and_acquired_animation_sources_remain_unchanged(self):
        register=json.loads((ROOT/'specs/010-upgrade-game-artwork/validation/evidence/hero-fingerprints.json').read_text())
        for relative,digest in register['files'].items():
            self.assertEqual(hashlib.sha256((ROOT/relative).read_bytes()).hexdigest(),digest,relative)
        source=ROOT/'assets/art-sources/kaykit-character-animations-1.1'
        for filename in ['Rig_Medium_General.glb','Rig_Medium_CombatMelee.glb','Rig_Medium_MovementBasic.glb']:
            original=ROOT.parent/'KayKit_Character_Animations_1.1/Animations/gltf/Rig_Medium'/filename
            # Only compare supplier folders where present; retained acquisition hashes
            # are authoritative when the project moves to another workstation.
            if original.exists():self.assertEqual((source/filename).read_bytes(),original.read_bytes())

class ProductionEnemyExportTests(unittest.TestCase):
    def test_registered_exports_preserve_editable_source_and_exact_runtime_bindings(self):
        import bpy
        catalog=json.loads((ROOT/'content/enemy-presentations.json').read_text())
        for record in catalog['enemies']:
            source=ROOT/record['sourcePath']
            self.assertEqual(hashlib.sha256(source.read_bytes()).hexdigest(),record['sourceSha256'])
            bpy.ops.wm.open_mainfile(filepath=str(source))
            rigs=[o for o in bpy.data.objects if o.type=='ARMATURE']
            self.assertEqual(len(rigs),1)
            self.assertGreater(len([o for o in bpy.data.objects if o.type=='MESH']),10,'editable named outfit parts remain in source')
            self.assertTrue(all(abs(s-rigs[0].scale.x)<1e-5 for s in rigs[0].scale),'uniform source transform')
            self.assertEqual(len(rigs[0].data.bones),23)
            # Blender uses +z up and -y forward; explicit Y-up GLB maps to +z forward.
            nose=next(o for o in bpy.data.objects if o.name=='Nose')
            center=sum((v.co for v in nose.data.vertices),__import__('mathutils').Vector())/len(nose.data.vertices)
            self.assertLess(center.y,-.15,'nose establishes canonical forward')
            boots=[o for o in bpy.data.objects if o.name.startswith('Boot.')]
            floor=min((o.matrix_world@v.co).z for o in boots for v in o.data.vertices)
            self.assertAlmostEqual(floor,0.0,delta=.015,msg='source feet anchor at ground')
            runtime=ROOT/record['runtimePath']
            self.assertEqual(hashlib.sha256(runtime.read_bytes()).hexdigest(),record['runtimeSha256'])
            gltf,accessor=read_glb(runtime)
            self.assertFalse(any('uri' in item for item in gltf.get('buffers',[])+gltf.get('images',[])),'runtime is self-contained')
            clips={clip['name']:clip for clip in gltf['animations']}
            for binding in record['clipBindings'].values():
                self.assertIn(binding['clipName'],clips)
                length=max(gltf['accessors'][sampler['input']]['max'][0] for sampler in clips[binding['clipName']]['samplers'])
                self.assertLessEqual(binding['endSeconds'],length+1e-5)
