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
