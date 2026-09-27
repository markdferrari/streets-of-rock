import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate, render

class RenderTests(unittest.TestCase):
    def test_smoke_image_from_saved_scene(self):
        with TemporaryDirectory() as temp:
            generate.main(['--output-dir',temp])
            render.main(['--output-dir',temp,'--smoke'])
            image=Path(temp)/'smoke/duo-neutral.png'
            self.assertTrue(image.is_file())
            loaded=bpy.data.images.load(str(image),check_existing=False)
            self.assertEqual(tuple(loaded.size),(128,128))
