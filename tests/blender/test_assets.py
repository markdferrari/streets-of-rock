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
                self.assertTrue(any(m.name.startswith(f'{prefix}.Material.') for m in bpy.data.materials))
                self.assertTrue(all(m.vertices and all(all(abs(v)<1000 for v in vertex.co) for vertex in m.vertices) for m in bpy.data.meshes if m.users))
                self.assertTrue(all(o.data.materials for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(prefix+'.')))
