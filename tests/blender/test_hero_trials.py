"""Source identities, anatomical mappings and isolated reproducible trial exports."""
import hashlib
import json
import tempfile
import unittest
from pathlib import Path
import bpy
from scripts.blender import hero_motion as motion
from tests.blender.test_enemy_exports import read_glb

ROOT = Path(__file__).resolve().parents[2]


class HeroTrialTests(unittest.TestCase):
    def test_exact_source_file_and_clip_selection_respects_rig_size(self):
        medium = motion.trial_plan('cow', 'kaykit')
        large = motion.trial_plan('lion', 'kaykit')
        universal = motion.trial_plan('plates', 'universal')
        self.assertEqual(medium['Attack']['clipName'], 'Melee_Unarmed_Attack_Punch_A')
        self.assertEqual(large['Attack']['clipName'], 'Melee_Unarmed_Punch')
        self.assertEqual(large['Idle']['path'].name, 'Rig_Large_General.glb')
        self.assertEqual(universal['Move']['clipName'], 'Walk_Loop')
        self.assertEqual(universal['Attack']['clipName'], 'Punch_Jab')
        for args in [('unknown', 'kaykit'), ('cow', 'missing')]:
            with self.assertRaises(ValueError): motion.trial_plan(*args)

    def test_explicit_anatomical_mapping_and_rigid_groups_for_every_character(self):
        for role in ['cow', 'crow', 'lion', 'plates']:
            for library in ['kaykit', 'universal']:
                target, meshes, rigid, wings = motion.make_target(role)
                mapping = motion.bone_mapping(role, library)
                self.assertTrue(set(mapping) <= set(target.data.bones.keys()))
                self.assertTrue(any('LowerLeg' in name for name in mapping))
                self.assertTrue(any('WingTip' in name for name in mapping) if role == 'crow' else any('LowerArm' in name for name in mapping))
                self.assertFalse(any('finger' in name.lower() or name == 'Root' for name in mapping))
                self.assertEqual(motion.validate_rig(target, meshes, rigid, wings), [])
                if role == 'plates':
                    group = set(rigid['plate-face'])
                    for obj in meshes:
                        if any(part in obj.name for part in ['Plate.', 'Eye.', 'Iris.', 'Smile.', 'Cheek.']): self.assertIn(obj.name, group)
                if role == 'crow': self.assertEqual(set(wings), {'left', 'right'})
                # Actual limb meshes have weights on both segments, not renamed rigid limbs.
                limbs = [o for o in meshes if '.Leg.' in o.name or '.Arm.' in o.name or (role == 'crow' and o.name in ['Crow.Wing.L', 'Crow.Wing.R'])]
                for obj in limbs:
                    used = {obj.vertex_groups[g.group].name for v in obj.data.vertices for g in v.groups if g.weight > .001}
                    self.assertGreater(len(used), 1, obj.name)

    def test_isolated_export_is_reproducible_and_donor_bytes_are_preserved(self):
        sources = motion.trial_plan('plates', 'kaykit')
        before = {str(item['path']): hashlib.sha256(item['path'].read_bytes()).hexdigest() for item in sources.values()}
        with tempfile.TemporaryDirectory() as directory:
            outputs = []
            for name in ['first', 'second']:
                out = Path(directory) / name
                report = motion.build_trial('plates', 'kaykit', out)
                self.assertEqual(report['status'], 'trialled')
                self.assertEqual(set(report['clips']), {'Idle', 'Move', 'Attack'})
                g, read = read_glb(out / 'character.glb')
                self.assertEqual({a['name'] for a in g['animations']}, {'Idle', 'Move', 'Attack'})
                self.assertTrue(all(n.get('name', '').startswith('Plates.') for n in g['nodes'] if 'mesh' in n), 'only original target meshes ship')
                self.assertLessEqual(max(len(s['joints']) for s in g['skins']), 17)
                self.assertFalse(g.get('cameras'))
                self.assertFalse(any('uri' in b for b in g['buffers']))
                self.assertTrue(g['skins'])
                self.assertEqual(len([o for o in bpy.data.objects if o.type == 'ARMATURE']), 1)
                self.assertTrue((out / 'rigged.blend').is_file())
                self.assertTrue((out / 'mapping.json').is_file())
                # Compare sampled animation accessors and mesh data, not exporter timestamps.
                outputs.append(json.dumps(g, sort_keys=True))
            self.assertEqual(outputs[0], outputs[1])
            with self.assertRaises(FileExistsError): motion.build_trial('plates', 'kaykit', Path(directory) / 'first')
        self.assertEqual(before, {p: hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in before})

    def test_trial_output_cannot_overwrite_production_or_acquired_sources(self):
        for path in [ROOT/'assets/characters/plates/runtime', ROOT/'assets/art-sources/kaykit-character-animations-1.1']:
            with self.assertRaises(ValueError): motion.preflight_trial(path)
