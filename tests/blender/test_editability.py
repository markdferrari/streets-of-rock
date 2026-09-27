import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate

class EditabilityTests(unittest.TestCase):
    def test_material_and_mesh_changes_survive_save_reopen_for_each_character(self):
        with TemporaryDirectory() as temp:
            out=Path(temp)
            generate.main(['--output-dir',str(out)])
            for role, part, material in (
                ('cow','Muzzle','Muzzle'),
                ('crow','Beak','Beak'),
            ):
                prefix=role.title()
                bpy.ops.wm.open_mainfile(filepath=str(out/f'{role}.blend'))
                obj=bpy.data.objects[f'{prefix}.{part}']
                obj.data.vertices[0].co.x+=.1
                expected_x=float(obj.data.vertices[0].co.x)
                mat=bpy.data.materials[f'{prefix}.Material.{material}']
                self.assertIn('Principled BSDF',mat.node_tree.nodes)
                mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.3,.4,.5,1)
                changed=out/f'edited-{role}.blend'
                bpy.ops.wm.save_as_mainfile(filepath=str(changed))
                bpy.ops.wm.open_mainfile(filepath=str(changed))
                self.assertAlmostEqual(bpy.data.objects[f'{prefix}.{part}'].data.vertices[0].co.x,expected_x)
                self.assertAlmostEqual(bpy.data.materials[f'{prefix}.Material.{material}'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[0],.3)
