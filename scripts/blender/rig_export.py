"""Rig approved character parts and export editable scenes plus animated GLBs.

Run with Blender 5.2: blender -noaudio --background --factory-startup --python-exit-code 1 \
  --python scripts/blender/rig_export.py -- --output-dir assets/characters/cow-crow/runtime
"""
import argparse
import math
import sys
from pathlib import Path

import bpy

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/characters/cow-crow'


def bone_for(role, name):
    part = name.split('.', 1)[1]
    if part.startswith(('Arm.', 'Fist.')): return 'Arm.' + part.rsplit('.', 1)[-1]
    if part.startswith(('Wing.', 'Jacket.Shoulder.')):
        return 'Wing.' + ('L' if '.L' in part else 'R')
    if part.startswith(('Leg.', 'Boot.', 'Foot.', 'Toe.')):
        return 'Leg.' + ('L' if '.L' in part else 'R')
    if part.startswith(('Head', 'Muzzle', 'Horn.', 'Eye.', 'Iris.', 'Brow.', 'Crest.', 'Ear.', 'Nostril.', 'Beak', 'Marking.L')):
        return 'Head'
    return 'Torso'


def make_rig(role):
    title = role.title()
    collection = bpy.data.collections[f'Character.{title}']
    arm_data = bpy.data.armatures.new(f'{title}.Skeleton')
    arm = bpy.data.objects.new(f'{title}.Rig', arm_data)
    collection.objects.link(arm)
    bpy.context.view_layer.objects.active = arm
    arm.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    layout = {
        'Root': ((0, 0, .04), (0, 0, .28), None),
        'Torso': ((0, 0, .75 if role == 'cow' else .62), (0, 0, 1.42 if role == 'cow' else 1.16), 'Root'),
        'Head': ((0, 0, 1.54 if role == 'cow' else 1.18), (0, 0, 1.86 if role == 'cow' else 1.50), 'Torso'),
    }
    if role == 'cow':
        for side, sign in (('L', -1), ('R', 1)):
            layout[f'Arm.{side}'] = ((sign*.39, 0, 1.40), (sign*.67, 0, .98), 'Torso')
            layout[f'Leg.{side}'] = ((sign*.18, 0, .74), (sign*.19, 0, .20), 'Root')
    else:
        for side, sign in (('L', -1), ('R', 1)):
            layout[f'Wing.{side}'] = ((sign*.29, 0, 1.07), (sign*.90, 0, 1.25), 'Torso')
            layout[f'Leg.{side}'] = ((sign*.14, 0, .58), (sign*.15, -.15, .08), 'Root')
    for name, (head, tail, _) in layout.items():
        bone = arm_data.edit_bones.new(name)
        bone.head, bone.tail = head, tail
    for name, (_, _, parent) in layout.items():
        if parent: arm_data.edit_bones[name].parent = arm_data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    arm.select_set(False)
    for obj in collection.objects:
        if obj.type != 'MESH': continue
        group = obj.vertex_groups.new(name=bone_for(role, obj.name))
        group.add(list(range(len(obj.data.vertices))), 1.0, 'REPLACE')
        modifier = obj.modifiers.new('Rigid articulated rig', 'ARMATURE')
        modifier.object = arm
        obj.parent = arm
        obj.matrix_parent_inverse = arm.matrix_world.inverted()
    return arm


def pose_values(role, clip, frame):
    """Return sparse rotations (radians) around each bone's local axes."""
    if clip == 'KnockedOut':
        t = {1: 0.0, 6: 1.0, 12: 1.0}[frame]
    elif clip.endswith('.windup'):
        t = {1: 0.0, 6: .6, 12: 1.0}[frame]
    elif clip.endswith('.active'):
        t = {1: .2, 6: 1.0, 12: .2}[frame]
    elif clip.endswith('.recovery'):
        t = {1: 1.0, 6: .45, 12: 0.0}[frame]
    else:
        t = {1: 0.0, 6: 1.0, 12: 0.0}[frame]
    if clip == 'Idle':
        return {'Torso': (.025*t, 0, 0), 'Head': (-.04*t, 0, 0)}
    if clip == 'Move':
        return {'Leg.L': (.42*t, 0, 0), 'Leg.R': (-.42*t, 0, 0),
                ('Arm.L' if role == 'cow' else 'Wing.L'): (-.16*t, 0, 0),
                ('Arm.R' if role == 'cow' else 'Wing.R'): (.16*t, 0, 0)}
    if clip == 'Hurt': return {'Torso': (-.28*t, 0, 0), 'Head': (.22*t, 0, 0)}
    if clip == 'KnockedOut': return {'Torso': (0, 0, 1.15*t), 'Head': (0, 0, .25*t)}
    if clip == 'Dodge': return {'Torso': (.4*t, 0, 0), 'Leg.L': (-.4*t, 0, 0), 'Leg.R': (.4*t, 0, 0)}
    move, phase = clip.split('.')
    side = 'Arm.R' if role == 'cow' else 'Wing.R'
    other = 'Arm.L' if role == 'cow' else 'Wing.L'
    strength = 1.0 if phase == 'active' else (-.55 if phase == 'windup' else .25)
    if move == 'spin':
        return {'Torso': (0, 0, (math.pi*.8 if phase == 'active' else -.22)*t),
                side: (-.45*t, 0, 0), other: (-.45*t, 0, 0)}
    if move == 'wingSpin':
        return {'Torso': (0, 0, (math.pi*.7 if phase == 'active' else -.18)*t),
                'Wing.L': (-.8*t, -.35*t, -.3*t), 'Wing.R': (-.8*t, .35*t, .3*t),
                'Head': (.1*t, 0, 0)}
    if move in ('cowHeavy', 'crowHeavy'): strength *= 1.45
    if move in ('cow2', 'crow2'): side, other = other, side
    return {side: (strength*.95*t, 0, strength*.25*t),
            other: (-strength*.22*t, 0, 0), 'Torso': (strength*.16*t, 0, 0),
            'Head': (-strength*.08*t, 0, 0)}


def clip_names(role):
    names = ['Idle', 'Move', 'Hurt', 'KnockedOut']
    names.append('Dodge')
    moves = ('cow1', 'cow2', 'cow3', 'cowHeavy', 'spin') if role == 'cow' else ('crow', 'crow1', 'crow2', 'crow3', 'crowHeavy', 'wingSpin')
    names += [f'{move}.{phase}' for move in moves for phase in ('windup', 'active', 'recovery')]
    return names


def make_animations(role, arm):
    arm.animation_data_create()
    for name in clip_names(role):
        action = bpy.data.actions.new(name)
        arm.animation_data.action = action
        for frame in (1, 6, 12):
            values = pose_values(role, name, frame)
            for bone in arm.pose.bones:
                bone.rotation_mode = 'XYZ'
                bone.rotation_euler = values.get(bone.name, (0, 0, 0))
                bone.keyframe_insert(data_path='rotation_euler', frame=frame, group=bone.name)
        arm.animation_data.action = None
        track = arm.animation_data.nla_tracks.new()
        track.name = name
        track.strips.new(name, 1, action)
        track.mute = True
    for bone in arm.pose.bones: bone.rotation_euler = (0, 0, 0)
    bpy.context.scene.frame_set(1)


def export(role, output):
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE/f'{role}.blend'))
    arm = make_rig(role)
    make_animations(role, arm)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(output/f'{role}-rigged.blend'), check_existing=False)
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    for obj in bpy.data.collections[f'Character.{role.title()}'].objects:
        if obj.type == 'MESH': obj.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(filepath=str(output/f'{role}.glb'), export_format='GLB',
        use_selection=True, export_animations=True, export_animation_mode='ACTIONS',
        export_merge_animation='ACTION', export_skins=True, export_cameras=False,
        export_lights=False, export_yup=True)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, required=True)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args(argv)
    if tuple(bpy.app.version[:2]) != (5, 2): raise RuntimeError('Blender 5.2.x required')
    out = args.output_dir.resolve()
    out.mkdir(parents=True, exist_ok=True)
    targets = [out/f'{role}{suffix}' for role in ('cow', 'crow') for suffix in ('-rigged.blend', '.glb')]
    if not args.overwrite and any(path.exists() for path in targets):
        raise FileExistsError('Rigged assets exist; use --overwrite')
    for role in ('cow', 'crow'): export(role, out)
    return 0


if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
