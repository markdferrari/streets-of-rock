"""Contract checks for game-ready characters, before implementing the exporter."""
import json
import struct
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from scripts.blender import rig_export


def glb_json(path):
    data = path.read_bytes()
    assert data[:4] == b'glTF' and struct.unpack_from('<I', data, 4)[0] == 2
    length, kind = struct.unpack_from('<II', data, 12)
    assert kind == 0x4E4F534A
    return json.loads(data[20:20+length])


class RigExportTests(unittest.TestCase):
    def test_both_reopen_with_rigid_bones_and_self_contained_animated_glbs(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            rig_export.main(['--output-dir', str(out)])
            for role, clips in {
                'cow': ('Idle','Move','cow1.windup','cow1.active','cowHeavy.active','spin.active','Dodge','Hurt','KnockedOut'),
                'crow': ('Idle','Move','crow.windup','crow.active','Hurt','KnockedOut'),
            }.items():
                blend, glb = out/f'{role}-rigged.blend', out/f'{role}.glb'
                self.assertTrue(blend.is_file())
                self.assertTrue(glb.is_file())
                bpy.ops.wm.open_mainfile(filepath=str(blend))
                arm = bpy.data.objects[f'{role.title()}.Rig']
                self.assertEqual(arm.type, 'ARMATURE')
                for part in ('Torso','Head','Arm.L' if role=='cow' else 'Wing.L'):
                    self.assertIn(part, arm.data.bones)
                for obj in bpy.data.collections[f'Character.{role.title()}'].objects:
                    if obj.type != 'MESH': continue
                    self.assertTrue(any(m.type == 'ARMATURE' and m.object == arm for m in obj.modifiers), obj.name)
                    self.assertEqual(len(obj.vertex_groups), 1, obj.name)
                    self.assertTrue(all(v.groups and v.groups[0].weight == 1.0 for v in obj.data.vertices), obj.name)
                gltf = glb_json(glb)
                self.assertTrue(gltf.get('meshes'))
                self.assertTrue(gltf.get('materials'))
                self.assertTrue(gltf.get('skins'))
                self.assertFalse(gltf.get('cameras'))
                self.assertFalse(gltf.get('extensionsRequired'))
                self.assertFalse(any('uri' in item for item in gltf.get('buffers', [])))
                self.assertTrue(set(clips) <= {a['name'] for a in gltf.get('animations',[])})
