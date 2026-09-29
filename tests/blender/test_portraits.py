import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import bpy
from scripts.blender import generate, render


class PortraitTests(unittest.TestCase):
    def test_fixed_portrait_jobs_use_approved_sources_and_protect_outputs(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            jobs = render.portrait_jobs()
            self.assertEqual([(job[0], job[1]) for job in jobs],
                             [('cow.blend', 'cow.png'), ('crow.blend', 'crow.png')])
            self.assertEqual(render.PORTRAIT_SIZE, 512)
            (out / 'portraits').mkdir()
            (out / 'portraits/cow.png').write_bytes(b'manual')
            with self.assertRaises(FileExistsError):
                render.preflight(out, portraits=True)
            self.assertEqual((out / 'portraits/cow.png').read_bytes(), b'manual')

    def test_portraits_render_as_square_images_from_saved_characters(self):
        with TemporaryDirectory() as temp:
            generate.main(['--output-dir', temp])
            render.main(['--output-dir', temp, '--portraits'])
            for name in ('cow', 'crow'):
                path = Path(temp) / 'portraits' / f'{name}.png'
                self.assertTrue(path.is_file())
                image = bpy.data.images.load(str(path), check_existing=False)
                self.assertEqual(tuple(image.size), (512, 512))
            before = {name: tuple(bpy.data.images.load(str(Path(temp) / 'portraits' / f'{name}.png'), check_existing=False).pixels[:][::32])
                      for name in ('cow', 'crow')}
            render.main(['--output-dir', temp, '--portraits', '--overwrite'])
            after = {name: tuple(bpy.data.images.load(str(Path(temp) / 'portraits' / f'{name}.png'), check_existing=False).pixels[:][::32])
                     for name in ('cow', 'crow')}
            for name in before:
                difference = sum(abs(a - b) for a, b in zip(before[name], after[name])) / len(before[name])
                self.assertLess(difference, 0.02, f'{name} portrait should reproduce the same framing and appearance')
