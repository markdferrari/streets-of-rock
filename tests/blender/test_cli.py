import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from scripts.blender import generate, render, rig_export, validate

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

    def test_duo_only_preflight_ignores_existing_individual_preview(self):
        with TemporaryDirectory() as temp:
            out=Path(temp)
            (out/'previews').mkdir()
            (out/'previews/cow-front.png').write_bytes(b'keep')
            render.preflight(out, smoke=False, overwrite=False, only='duo')

    def test_character_scoped_preflight_never_claims_other_character_outputs(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            (out/'plates.blend').write_bytes(b'approved')
            generate.preflight(out, overwrite=False, character='lion')
            (out/'source.blend').write_bytes(b'manual')
            with self.assertRaises(FileExistsError):
                generate.preflight(out, overwrite=False, character='lion')
            self.assertEqual((out/'plates.blend').read_bytes(), b'approved')
            rig_export.preflight(out/'runtime', overwrite=False, character='lion')

    def test_invalid_character_ids_fail_before_output(self):
        with TemporaryDirectory() as temp:
            with self.assertRaises(ValueError):
                generate.preflight(Path(temp), character='../crow')

    def test_character_portrait_preflight_is_scoped_to_requested_identity(self):
        with TemporaryDirectory() as temp:
            out = Path(temp)
            (out/'crow.png').write_bytes(b'keep')
            render.preflight(out, portraits=True, character='lion')
            (out/'portrait.png').write_bytes(b'manual')
            with self.assertRaises(FileExistsError):
                render.preflight(out, portraits=True, character='lion')
            self.assertEqual((out/'crow.png').read_bytes(), b'keep')
