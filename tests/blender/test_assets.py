import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate

class CharacterAssetTests(unittest.TestCase):
    def test_two_saved_editable_characters(self):
        with TemporaryDirectory() as temp:
            out=Path(temp)
            generate.main(['--output-dir',str(out)])
            for role, required in {
                'cow': ('Torso','Head','Muzzle','Horn.L','Horn.R','Jacket','Boot.L','Boot.R','Eye.L','Eye.R'),
                'crow': ('Torso','Head','Beak','Jacket','Collar','Wing.L','Wing.R','Foot.L','Foot.R','Eye.L','Eye.R'),
            }.items():
                scene=out/f'{role}.blend'
                self.assertTrue(scene.is_file())
                bpy.ops.wm.open_mainfile(filepath=str(scene))
                prefix=role.title()
                names={o.name for o in bpy.data.objects}
                for part in required:
                    self.assertIn(f'{prefix}.{part}',names)
                self.assertIn(f'Character.{prefix}',bpy.data.collections)
                root=bpy.data.objects[f'{prefix}.Root']
                self.assertEqual(tuple(round(float(v),5) for v in root.location),(0.0,0.0,0.0))
                self.assertEqual(bpy.context.scene.unit_settings.system,'METRIC')
                height=max((obj.matrix_world @ __import__('mathutils').Vector(corner)).z for obj in bpy.data.collections[f'Character.{prefix}'].objects if obj.type=='MESH' for corner in obj.bound_box)
                self.assertAlmostEqual(height,2.0 if role=='cow' else 1.6,delta=.30)
                self.assertTrue(any(m.name.startswith(f'{prefix}.Material.') for m in bpy.data.materials))
                self.assertTrue(all(m.vertices and all(all(abs(v)<1000 for v in vertex.co) for vertex in m.vertices) for m in bpy.data.meshes if m.users))
                self.assertTrue(all(o.data.materials for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(prefix+'.')))
