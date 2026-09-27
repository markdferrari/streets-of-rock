import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from scripts.blender import generate, render

class CommandBoundaryTests(unittest.TestCase):
    def test_blender_version_requirement(self):
        with self.assertRaises(RuntimeError):
            generate.require_supported((4,5,0))
        generate.require_supported((5,2,2))

    def test_generation_protects_existing_targets_and_unrelated_files(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            (out/'cow.blend').write_bytes(b'manual')
            (out/'notes.txt').write_text('keep')
            with self.assertRaises(FileExistsError):
                generate.preflight(out, overwrite=False)
            self.assertEqual((out/'cow.blend').read_bytes(), b'manual')
            generate.preflight(out, overwrite=True)
            self.assertEqual((out/'notes.txt').read_text(), 'keep')

    def test_render_protects_existing_preview(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            (out/'previews').mkdir()
            (out/'previews/duo-neutral.png').write_bytes(b'manual')
            with self.assertRaises(FileExistsError):
                render.preflight(out, smoke=False, overwrite=False)

    def test_missing_output_argument_fails(self):
        with self.assertRaises(SystemExit) as error:
            generate.main([])
        self.assertNotEqual(error.exception.code,0)
        with self.assertRaises(SystemExit) as error:
            render.main([])
        self.assertNotEqual(error.exception.code,0)
