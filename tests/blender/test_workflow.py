import hashlib
import unittest
from tempfile import TemporaryDirectory
from pathlib import Path
import bpy
from scripts.blender import generate,render

class WorkflowTests(unittest.TestCase):
    def test_repeatability_and_full_set_preflight(self):
        with TemporaryDirectory() as left, TemporaryDirectory() as right:
            a,b=Path(left),Path(right)
            generate.main(['--output-dir',str(a)])
            generate.main(['--output-dir',str(b)])
            for name in generate.TARGETS:
                bpy.ops.wm.open_mainfile(filepath=str(a/name))
                one=sorted((o.name,tuple(round(float(v),5) for v in o.dimensions)) for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(('Cow.','Crow.')))
                bpy.ops.wm.open_mainfile(filepath=str(b/name))
                two=sorted((o.name,tuple(round(float(v),5) for v in o.dimensions)) for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(('Cow.','Crow.')))
                self.assertEqual(one,two)
            marker=a/'notes.txt';marker.write_text('keep')
            old=(a/'cow.blend').read_bytes()
            with self.assertRaises(FileExistsError): generate.main(['--output-dir',str(a)])
            self.assertEqual((a/'cow.blend').read_bytes(),old)
            generate.main(['--output-dir',str(a),'--overwrite'])
            self.assertEqual(marker.read_text(),'keep')

    def test_smoke_render_does_not_change_saved_source(self):
        with TemporaryDirectory() as temp:
            out=Path(temp);generate.main(['--output-dir',temp])
            before=hashlib.sha256((out/'comparison.blend').read_bytes()).digest()
            render.main(['--output-dir',temp,'--smoke'])
            self.assertEqual(before,hashlib.sha256((out/'comparison.blend').read_bytes()).digest())
