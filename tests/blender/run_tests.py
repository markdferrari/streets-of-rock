"""Run the native Blender asset tests with Blender's bundled unittest."""
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))
if '--self-test-failure' in sys.argv:
    class IntentionalFailure(unittest.TestCase):
        def runTest(self):
            self.assertTrue(False, 'runner must propagate this failure')
    result = unittest.TextTestRunner(verbosity=2).run(unittest.TestSuite([IntentionalFailure()]))
    raise SystemExit(0 if result.wasSuccessful() else 1)
suite = unittest.defaultTestLoader.discover(str(Path(__file__).parent), pattern='test_*.py')
result = unittest.TextTestRunner(verbosity=2).run(suite)
raise SystemExit(0 if result.wasSuccessful() else 1)
