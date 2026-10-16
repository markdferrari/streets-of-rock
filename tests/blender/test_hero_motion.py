"""Synthetic rig/export contracts; no production asset is written."""
import math
import unittest
import bpy
from mathutils import Matrix
from scripts.blender import hero_motion as motion


def rig():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    data = bpy.data.armatures.new('Fixture')
    arm = bpy.data.objects.new('Target', data)
    bpy.context.scene.collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for index, name in enumerate(['Root', 'Torso', 'UpperArm.L', 'LowerArm.L', 'Wing.L']):
        bone = data.edit_bones.new(name)
        bone.head = (index * .2, 0, .5)
        bone.tail = (index * .2, 0, 1)
        if name != 'Root': bone.parent = data.edit_bones['Root']
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.mesh.primitive_cube_add(size=.2)
    obj = bpy.context.object
    obj.name = 'PlateAndFace'
    group = obj.vertex_groups.new(name='Torso')
    group.add(list(range(len(obj.data.vertices))), 1, 'REPLACE')
    modifier = obj.modifiers.new('Deform', 'ARMATURE')
    modifier.object = arm
    obj.parent = arm
    return arm, obj


def action(arm, name='Trial', bone='UpperArm.L', end=0.0):
    arm.animation_data_create()
    arm.animation_data.action = bpy.data.actions.new(name)
    result = arm.animation_data.action
    for frame, angle in [(1, 0), (4, .4), (7, end)]:
        b = arm.pose.bones[bone]
        b.rotation_mode = 'XYZ'
        b.rotation_euler.x = angle
        b.keyframe_insert('rotation_euler', frame=frame)
    return result


class HeroMotionTests(unittest.TestCase):
    def test_weights_and_rigid_plate_face_attachment(self):
        arm, obj = rig()
        self.assertEqual(motion.validate_rig(arm, [obj], {'body': [obj.name]}, {}), [])
        obj.vertex_groups['Torso'].remove([0])
        self.assertTrue(any('weight' in e for e in motion.validate_rig(arm, [obj], {}, {})))
        group = obj.vertex_groups.new(name='LowerArm.L')
        group.add([0], 1, 'REPLACE')
        self.assertTrue(any('rigid' in e for e in motion.validate_rig(arm, [obj], {'body': [obj.name]}, {})))

    def test_invalid_weights_and_missing_wing_groups(self):
        arm, obj = rig()
        obj.vertex_groups['Torso'].add([0], .2, 'REPLACE')
        self.assertTrue(motion.validate_rig(arm, [obj], {}, {}))
        self.assertTrue(motion.validate_rig(arm, [obj], {}, {'left': ['MissingFeather']}))
        obj.vertex_groups.new(name='Unknown').add([0], .8, 'REPLACE')
        self.assertTrue(any('bone' in e for e in motion.validate_rig(arm, [obj], {}, {})))

    def test_loop_seams_phase_intervals_and_root_travel(self):
        arm, _ = rig()
        clip = action(arm)
        self.assertEqual(motion.validate_action(arm, clip, loop=True), [])
        bad = action(arm, 'BadLoop', end=.2)
        self.assertTrue(any('loop' in e for e in motion.validate_action(arm, bad, loop=True)))
        root = arm.pose.bones['Root']
        for frame, x in [(1, 0), (7, .4)]:
            root.location.x = x
            root.keyframe_insert('location', frame=frame)
        self.assertTrue(any('root' in e for e in motion.validate_action(arm, bad)))
        self.assertEqual(motion.validate_segments([{'startSeconds': 0, 'endSeconds': .2}, {'startSeconds': .2, 'endSeconds': .4, 'contactSeconds': .2}], .4), [])
        for segments in [[{'startSeconds': 0, 'endSeconds': math.inf}], [{'startSeconds': .2, 'endSeconds': .1}], [{'startSeconds': 0, 'endSeconds': .5}], [{'startSeconds': 0, 'endSeconds': .2}, {'startSeconds': .3, 'endSeconds': .4}], [{'startSeconds': 0, 'endSeconds': .2, 'contactSeconds': .3}]]:
            self.assertTrue(motion.validate_segments(segments, .4))

    def test_rejects_nonvisual_nonfinite_and_missing_bone_tracks(self):
        arm, _ = rig()
        clip = action(arm)
        arm.location.x = 2
        arm.keyframe_insert('location', frame=1)
        self.assertTrue(any('track' in e for e in motion.validate_action(arm, clip)))
        arm, _ = rig()
        clip = action(arm)
        clip.layers[0].strips[0].channelbags[0].fcurves[0].keyframe_points[0].co.y = math.nan
        self.assertTrue(any('finite' in e for e in motion.validate_action(arm, clip)))
        arm, _ = rig()
        clip = action(arm)
        curve = clip.layers[0].strips[0].channelbags[0].fcurves[0]
        curve.data_path = 'pose.bones["Missing"].rotation_euler'
        self.assertTrue(any('bone' in e for e in motion.validate_action(arm, clip)))

    def test_mapped_bake_is_articulated_excludes_root_travel_and_removes_donor(self):
        target, obj = rig()
        donor = target.copy()
        donor.data = target.data.copy()
        donor.animation_data_clear()
        donor.name = 'Donor'
        bpy.context.scene.collection.objects.link(donor)
        clip = action(donor, 'Source')
        root = donor.pose.bones['Root']
        for frame, x in [(1, 0), (7, 2)]:
            root.location.x = x
            root.keyframe_insert('location', frame=frame)
        bpy.ops.mesh.primitive_cube_add()
        donor_mesh = bpy.context.object
        donor_mesh.parent = donor
        result = motion.bake_mapped_action(target, donor, clip, {'Torso': 'Torso', 'UpperArm.L': 'UpperArm.L', 'LowerArm.L': 'LowerArm.L'}, 'Baked', loop=True)
        self.assertEqual(motion.validate_action(target, result, loop=True), [])
        self.assertFalse(any('Root' in curve.data_path for curve in motion.curves(result)))
        target.animation_data.action = result
        bpy.context.scene.frame_set(4)
        self.assertGreater(abs(target.pose.bones['UpperArm.L'].rotation_quaternion.angle), .1)
        before = set(o.name for o in bpy.data.objects)
        motion.remove_donor([donor, donor_mesh], target, [obj])
        self.assertEqual(set(o.name for o in bpy.data.objects), before - {'Donor', donor_mesh.name} if bpy.data.objects.get('Donor') else {target.name, obj.name})
        self.assertTrue(motion.validate_rig(target, [obj], {}, {}) == [])

    def test_source_neutral_rest_correction_preserves_target_guard(self):
        target, _ = rig()
        donor = target.copy()
        donor.data = target.data.copy()
        donor.animation_data_clear()
        bpy.context.scene.collection.objects.link(donor)
        clip = action(donor, 'BentSource')
        # Donor's authored guard is rotated 0.3 radians relative to its bind pose.
        for curve in motion.curves(clip):
            if curve.array_index == 0:
                for key in curve.keyframe_points: key.co.y += .3
        motion.bind_action(donor, clip)
        bpy.context.scene.frame_set(1)
        reference = {b.name: b.matrix.to_quaternion().copy() for b in donor.pose.bones}
        result = motion.bake_mapped_action(target, donor, clip, {'Torso':'Torso','UpperArm.L':'UpperArm.L'}, 'Corrected', reference_pose=reference)
        motion.bind_action(target, result)
        bpy.context.scene.frame_set(1)
        self.assertLess(target.pose.bones['UpperArm.L'].rotation_quaternion.angle, .001)
        bpy.context.scene.frame_set(4)
        self.assertAlmostEqual(target.pose.bones['UpperArm.L'].rotation_quaternion.angle, .4, delta=.001)
