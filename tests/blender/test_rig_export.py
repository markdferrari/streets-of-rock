"""Contract checks for game-ready characters, before implementing the exporter."""
import json
import struct
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
import bpy
from scripts.blender import rig_export


def glb_json(path):
    data = path.read_bytes()
    assert data[:4] == b'glTF' and struct.unpack_from('<I', data, 4)[0] == 2
    length, kind = struct.unpack_from('<II', data, 12)
    assert kind == 0x4E4F534A
    return json.loads(data[20:20+length])


class RigExportTests(unittest.TestCase):
    def test_production_exports_have_articulated_skin_and_complete_semantic_bindings(self):
        from scripts.blender import hero_motion
        root=Path.cwd()
        semantics=json.loads((root/'content/animation-clips.json').read_text())
        for role in ('cow','crow','lion','plates'):
            report=json.loads((root/f'specs/011-improve-character-animations/reviews/{role}-bindings.json').read_text())
            profile=report['profile']
            self.assertEqual(set(profile['bindings']),set(semantics[role]))
            self.assertEqual(set(profile['locomotion']),{'forward','backward','left','right'})
            bpy.ops.wm.open_mainfile(filepath=str(root/report['editablePath']))
            arms=[o for o in bpy.data.objects if o.type=='ARMATURE']
            self.assertEqual(len(arms),1)
            arm=arms[0]
            for name in ['UpperLeg.L','LowerLeg.L','Foot.L', 'WingTip.L' if role=='crow' else 'LowerArm.L']:
                self.assertIn(name,arm.data.bones)
            meshes=[o for o in bpy.data.objects if o.type=='MESH']
            self.assertEqual(hero_motion.validate_rig(arm,meshes,report['rigidGroups'],report['wingGroups']),[])
            for action in bpy.data.actions:
                if action.name in report['physicalClips']:
                    self.assertEqual(hero_motion.validate_action(arm,action,action.name in report['loopClips']),[])
            gltf=glb_json(root/report['runtimePath'])
            names={a['name'] for a in gltf['animations']}
            self.assertEqual(names,set(report['physicalClips']))
            self.assertFalse(gltf.get('cameras'))
            self.assertFalse(any('uri' in b for b in gltf['buffers']))
            self.assertEqual(len(meshes),len(gltf['meshes']))
            for binding in [*profile['bindings'].values(),*profile['locomotion'].values()]:
                self.assertIn(binding['clipName'],names)
                self.assertGreater(binding['endSeconds'],binding['startSeconds'])
                self.assertLessEqual(binding['endSeconds'],report['physicalClips'][binding['clipName']]+1e-4)
            for group in {b.get('actionGroup') for b in profile['bindings'].values()}-{None}:
                segments=[profile['bindings'][group+'.'+phase] for phase in ['windup','active','recovery']]
                self.assertEqual(hero_motion.validate_segments(segments,report['physicalClips'][segments[0]['clipName']]),[])

    def test_crow_special_pose_is_distinct_from_basic_attack(self):
        self.assertNotEqual(rig_export.pose_values('crow', 'wingSpin.active', 6),
                            rig_export.pose_values('crow', 'crow1.active', 6))
