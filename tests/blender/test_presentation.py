import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from scripts.blender import generate

class PresentationTests(unittest.TestCase):
    def test_comparison_scene_has_both_characters_cameras_and_lights(self):
        with TemporaryDirectory() as temp:
            generate.main(['--output-dir',temp])
            bpy.ops.wm.open_mainfile(filepath=str(Path(temp)/'comparison.blend'))
            for name in ('Character.Cow','Character.Crow','Presentation.Cameras','Presentation.Lights.Neutral','Presentation.Lights.Neon'):
                self.assertIn(name,bpy.data.collections)
            self.assertIn('Presentation.Ground',bpy.data.objects)
            self.assertIn('Camera.Duo',bpy.data.objects)
