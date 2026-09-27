import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate

class EditabilityTests(unittest.TestCase):
    def test_material_and_mesh_changes_survive_save_reopen(self):
        with TemporaryDirectory() as temp:
            out=Path(temp)
            generate.main(['--output-dir',str(out)])
            scene=out/'cow.blend'
            bpy.ops.wm.open_mainfile(filepath=str(scene))
            obj=bpy.data.objects['Cow.Muzzle']
            obj.data.vertices[0].co.x+=.1
            expected_x=float(obj.data.vertices[0].co.x)
            mat=bpy.data.materials['Cow.Material.Muzzle']
            self.assertIn('Principled BSDF',mat.node_tree.nodes)
            mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.3,.4,.5,1)
            changed=out/'edited.blend'
            bpy.ops.wm.save_as_mainfile(filepath=str(changed))
            bpy.ops.wm.open_mainfile(filepath=str(changed))
            self.assertAlmostEqual(bpy.data.objects['Cow.Muzzle'].data.vertices[0].co.x,expected_x)
            self.assertAlmostEqual(bpy.data.materials['Cow.Material.Muzzle'].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value[0],.3)
