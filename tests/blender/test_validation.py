import json
import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate,validate

class ValidationTests(unittest.TestCase):
    def test_report_accepts_complete_scenes_and_rejects_damaged_scene(self):
        with TemporaryDirectory() as temp:
            out=Path(temp)
            generate.main(['--output-dir',temp])
            report=out/'report.json'
            self.assertEqual(validate.main(['--output-dir',temp,'--report',str(report)]),0)
            self.assertTrue(json.loads(report.read_text())['passed'])
            bpy.ops.wm.open_mainfile(filepath=str(out/'cow.blend'))
            bpy.data.objects.remove(bpy.data.objects['Cow.Muzzle'],do_unlink=True)
            bpy.ops.wm.save_as_mainfile(filepath=str(out/'cow.blend'))
            self.assertNotEqual(validate.main(['--output-dir',temp,'--report',str(report)]),0)
            data=json.loads(report.read_text())
            self.assertFalse(data['passed'])
            self.assertTrue(any(not check['passed'] for check in data['checks']))

    def test_invalid_geometry_and_missing_presentation_rejected(self):
        with TemporaryDirectory() as temp:
            out=Path(temp);report=out/'report.json'
            generate.main(['--output-dir',temp])
            bpy.ops.wm.open_mainfile(filepath=str(out/'crow.blend'))
            bpy.data.objects['Crow.Beak'].data.vertices[0].co.x=float('nan')
            bpy.ops.wm.save_as_mainfile(filepath=str(out/'crow.blend'))
            self.assertNotEqual(validate.main(['--output-dir',temp,'--report',str(report)]),0)
            self.assertIn('invalid coordinate',report.read_text())
            generate.main(['--output-dir',temp,'--overwrite'])
            bpy.ops.wm.open_mainfile(filepath=str(out/'comparison.blend'))
            bpy.data.objects.remove(bpy.data.objects['Camera.Duo'],do_unlink=True)
            bpy.ops.wm.save_as_mainfile(filepath=str(out/'comparison.blend'))
            self.assertNotEqual(validate.main(['--output-dir',temp,'--report',str(report)]),0)
            self.assertIn('missing duo camera',report.read_text())

    def test_timeout_is_failure_even_if_probes_would_print_success(self):
        from unittest.mock import patch
        import subprocess
        with TemporaryDirectory() as temp:
            out=Path(temp);report=out/'report.json'
            generate.main(['--output-dir',temp])
            with patch.object(validate.subprocess,'run',side_effect=subprocess.TimeoutExpired(['blender'],120,output='ASSET_CHECK={"passed":true}')):
                self.assertNotEqual(validate.main(['--output-dir',temp,'--report',str(report)]),0)
            data=json.loads(report.read_text())
            self.assertFalse(data['passed'])
            self.assertTrue(all('timed out' in check['diagnostic'] for check in data['checks']))
