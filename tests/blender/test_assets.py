import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate
from scripts.blender import validate

class CharacterAssetTests(unittest.TestCase):
    def test_new_character_sources_are_editable_and_inside_expected_envelopes(self):
        for role, parts in {
            'lion': ('Mane', 'Face', 'Jacket', 'Tail.Tuft'),
            'plates': ('Plate.Rim', 'Plate.Face', 'Eye.L', 'Arm.L', 'Boot.L'),
        }.items():
            source=Path('assets/characters')/role/'source.blend'
            self.assertTrue(source.is_file())
            bpy.ops.wm.open_mainfile(filepath=str(source.resolve()))
            prefix=role.title()
            names={obj.name for obj in bpy.data.objects}
            for part in parts: self.assertIn(f'{prefix}.{part}',names)
            if role == 'lion': self.assertTrue({'Lion.Muzzle.L','Lion.Muzzle.R'} <= names)
            self.assertIn(f'Character.{prefix}',bpy.data.collections)
            meshes=[obj for obj in bpy.data.collections[f'Character.{prefix}'].objects if obj.type=='MESH']
            height=max((obj.matrix_world @ __import__('mathutils').Vector(corner)).z for obj in meshes for corner in obj.bound_box)
            width=max(obj.dimensions.x for obj in meshes)
            self.assertLess(height,2.8)
            self.assertLess(width,1.5)
            self.assertIn('required parts', validate.inspect(source, role))

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
