"""Bounded hero motion validation and explicit donor-to-target baking (Blender 5.2).

Explicit trial CLI writes isolated candidates only. No production export is implicit.
"""
import math
import re
import bpy
from mathutils import Matrix, Quaternion

WEIGHT_EPSILON = 1e-4
POSITION_EPSILON = 1e-4
ANGLE_EPSILON = 1e-3
TRACK = re.compile(r'^pose\.bones\["([^"\n]+)"\]\.(rotation_quaternion|rotation_euler|location|scale)$')
ROOT_NAMES = {'root'}


def curves(action):
    return [curve for layer in action.layers for strip in layer.strips
            for bag in strip.channelbags for curve in bag.fcurves]


def bind_action(arm, action):
    arm.animation_data_create()
    arm.animation_data.action = action
    if action.slots:
        arm.animation_data.action_slot = action.slots[0]
    for track in arm.animation_data.nla_tracks:
        track.mute = True
    for bone in arm.pose.bones:
        bone.matrix_basis = Matrix.Identity(4)


def validate_rig(arm, meshes, rigid_groups, wing_groups):
    errors = []
    names = {obj.name: obj for obj in meshes}
    if arm.type != 'ARMATURE' or not meshes:
        return ['rig: armature and target meshes required']
    for obj in meshes:
        modifiers = [m for m in obj.modifiers if m.type == 'ARMATURE']
        if obj.parent != arm or len(modifiers) != 1 or modifiers[0].object != arm:
            errors.append(f'{obj.name}: expected one owned skin/armature')
        for vertex in obj.data.vertices:
            weights = [(obj.vertex_groups[g.group].name, g.weight) for g in vertex.groups if g.weight > 0]
            if not weights or len(weights) > 4 or any(not math.isfinite(w) or w <= 0 for _, w in weights) or abs(sum(w for _, w in weights) - 1) > WEIGHT_EPSILON:
                errors.append(f'{obj.name}: invalid weights at vertex {vertex.index}')
                break
            if any(name not in arm.data.bones for name, _ in weights):
                errors.append(f'{obj.name}: weight references missing bone')
                break
            if not all(math.isfinite(c) for c in vertex.co):
                errors.append(f'{obj.name}: nonfinite vertex')
                break
    for kind, groups in [('rigid', rigid_groups), ('wing', wing_groups)]:
        for group, object_names in groups.items():
            if not object_names:
                errors.append(f'{kind}.{group}: empty attachment group')
                continue
            bindings = set()
            for name in object_names:
                if name not in names:
                    errors.append(f'{kind}.{group}: missing attachment {name}')
                    continue
                obj = names[name]
                for vertex in obj.data.vertices:
                    weights = [(obj.vertex_groups[g.group].name, g.weight) for g in vertex.groups if g.weight > WEIGHT_EPSILON]
                    if len(weights) != 1 or abs(weights[0][1] - 1) > WEIGHT_EPSILON:
                        errors.append(f'{kind}.{group}: attachment must be rigidly weighted')
                        break
                    bindings.add(weights[0][0])
            if len(bindings) != 1:
                errors.append(f'{kind}.{group}: relative transforms require one rigid attachment bone')
    return errors


def validate_segments(segments, duration):
    errors = []
    if not isinstance(duration, (int, float)) or not math.isfinite(duration) or duration <= 0:
        return ['segments: positive finite clip duration required']
    previous = None
    for segment in segments:
        start, end = segment.get('startSeconds'), segment.get('endSeconds')
        if any(not isinstance(v, (int, float)) or not math.isfinite(v) for v in [start, end]) or not 0 <= start < end <= duration + POSITION_EPSILON:
            errors.append('segment: ordered finite bounds within clip required')
            continue
        if previous is not None and abs(previous - start) > POSITION_EPSILON:
            errors.append('segment: phases must share adjacent boundary')
        marker = segment.get('contactSeconds', start)
        if not isinstance(marker, (int, float)) or not math.isfinite(marker) or abs(marker - start) > POSITION_EPSILON:
            errors.append('segment: contact/release must equal active start')
        previous = end
    return errors


def validate_action(arm, action, loop=False):
    errors = []
    channels = curves(action)
    if not channels:
        return ['clip: missing animation tracks']
    for curve in channels:
        match = TRACK.fullmatch(curve.data_path)
        if not match:
            errors.append(f'{action.name}: invalid nonvisual track {curve.data_path}')
            continue
        bone, prop = match.groups()
        if bone not in arm.data.bones:
            errors.append(f'{action.name}: missing bone target {bone}')
        for key in curve.keyframe_points:
            if not all(math.isfinite(v) for v in (*key.co, *key.handle_left, *key.handle_right)):
                errors.append(f'{action.name}: nonfinite keyframe')
        if bone.lower() in ROOT_NAMES:
            # Root motion is excluded rather than interpreted as gameplay travel.
            values = [float(k.co.y) for k in curve.keyframe_points]
            expected = 1.0 if prop == 'scale' or (prop == 'rotation_quaternion' and curve.array_index == 0) else 0.0
            if any(abs(v - expected) > POSITION_EPSILON for v in values):
                errors.append(f'{action.name}: root transform/travel forbidden')
    if errors:
        return errors
    start, end = map(float, action.frame_range)
    if end <= start:
        return ['clip: positive duration required']
    if loop:
        # Compare evaluated transforms so quaternion signs and interpolation are handled.
        previous = arm.animation_data.action if arm.animation_data else None
        frame = bpy.context.scene.frame_current
        bind_action(arm, action)
        samples = []
        for sample in [start, end]:
            bpy.context.scene.frame_set(int(sample), subframe=sample % 1)
            bpy.context.view_layer.update()
            samples.append({b.name: b.matrix_basis.copy() for b in arm.pose.bones})
        for name, first in samples[0].items():
            last = samples[1][name]
            if (first.translation - last.translation).length > POSITION_EPSILON or first.to_quaternion().rotation_difference(last.to_quaternion()).angle > ANGLE_EPSILON or (first.to_scale() - last.to_scale()).length > POSITION_EPSILON:
                errors.append(f'{action.name}: loop seam at {name}')
        arm.animation_data.action = previous
        bpy.context.scene.frame_set(frame)
    return errors


def bake_mapped_action(target, donor, action, mapping, clip_name, loop=False, reference_pose=None):
    """Bake neutral-relative rotations with rest/parent correction; omit root travel.

    mapping maps target bone names to donor names. Unmapped targets stay at rest.
    No donor scaling, displacement, callbacks or hidden generated action is copied.
    """
    if not mapping or any(t not in target.data.bones or s not in donor.data.bones for t, s in mapping.items()):
        raise ValueError('mapping: explicit existing target/source bones required')
    if any(t.lower() in ROOT_NAMES or s.lower() in ROOT_NAMES for t, s in mapping.items()):
        raise ValueError('mapping: donor root cannot drive the target')
    bind_action(donor, action)
    baked = bpy.data.actions.new(clip_name)
    bind_action(target, baked)
    start, end = map(float, action.frame_range)
    if end <= start:
        raise ValueError('source clip has no positive sampling span')
    # Source imports already express key times at this scene's FPS.
    count = max(2, int(math.ceil(end - start)) + 1)
    if reference_pose is None:
        bpy.context.scene.frame_set(int(start), subframe=start % 1)
        bpy.context.view_layer.update()
        reference_pose = {b.name: b.matrix.to_quaternion().copy() for b in donor.pose.bones}
    if any(name not in reference_pose for name in mapping.values()):
        raise ValueError('mapping: missing donor neutral reference bone')
    rest = {b.name: b.matrix_local.to_quaternion() for b in target.data.bones}
    first = {}
    previous = {}
    for index in range(count):
        source_frame = start + (end - start) * index / (count - 1)
        bpy.context.scene.frame_set(int(source_frame), subframe=source_frame % 1)
        bpy.context.view_layer.update()
        desired = {t: donor.pose.bones[src].matrix.to_quaternion() @ reference_pose[src].inverted() @ rest[t] for t, src in mapping.items()}
        for target_name, source_name in mapping.items():
            bone = target.pose.bones[target_name]
            parent = target.data.bones[target_name].parent
            parent_rest = rest[parent.name] if parent else Quaternion()
            parent_pose = desired.get(parent.name, parent_rest) if parent else Quaternion()
            rest_relative = parent_rest.inverted() @ rest[target_name]
            q = rest_relative.inverted() @ parent_pose.inverted() @ desired[target_name]
            q.normalize()
            if index == 0: first[target_name] = q.copy()
            if loop and index == count - 1: q = first[target_name].copy()
            if target_name in previous and q.dot(previous[target_name]) < 0: q.negate()
            previous[target_name] = q.copy()
            bone.rotation_mode = 'QUATERNION'
            bone.rotation_quaternion = q
            bone.keyframe_insert('rotation_quaternion', frame=index + 1, group=target_name)
    for curve in curves(baked):
        for key in curve.keyframe_points: key.interpolation = 'LINEAR'
    errors = validate_action(target, baked, loop)
    if errors: raise ValueError('; '.join(errors))
    return baked


def remove_donor(objects, target, meshes):
    keep = {target, *meshes}
    if any(obj in keep for obj in objects):
        raise ValueError('donor removal would delete a target object')
    for obj in objects:
        if obj.name in bpy.data.objects: bpy.data.objects.remove(obj, do_unlink=True)

# Explicit, bounded trial setup. Source clip names differ between Medium and Large.
import argparse
import hashlib
import json
import sys
import tempfile
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
CHARACTERS = ('cow', 'crow', 'lion', 'plates')
LIBRARIES = ('kaykit', 'universal')


def trial_plan(character, library):
    if character not in CHARACTERS or library not in LIBRARIES:
        raise ValueError('known character and library required')
    if library == 'universal':
        path = ROOT / 'assets/art-sources/quaternius-universal-animation-library-standard/UAL1_Standard.glb'
        return {key: {'path': path, 'clipName': clip, 'loop': key != 'Attack'} for key, clip in [('Idle', 'Idle_Loop'), ('Move', 'Walk_Loop'), ('Attack', 'Punch_Jab')]}
    size = 'Large' if character == 'lion' else 'Medium'
    folder = ROOT / 'assets/art-sources/kaykit-character-animations-1.1'
    return {key: {'path': folder/f'Rig_{size}_{category}.glb', 'clipName': clip, 'loop': key != 'Attack'} for key, category, clip in [
        ('Idle', 'General', 'Idle_A'), ('Move', 'MovementBasic', 'Walking_A'),
        ('Attack', 'CombatMelee', 'Melee_Unarmed_Punch' if size == 'Large' else 'Melee_Unarmed_Attack_Punch_A')]}


def bone_mapping(character, library):
    if character not in CHARACTERS or library not in LIBRARIES:
        raise ValueError('known character and library required')
    result = {'Torso': 'chest' if library == 'kaykit' else 'spine_03'}
    if character != 'plates': result['Head'] = 'head' if library == 'kaykit' else 'Head'
    for side, donor_side in [('L', 'r'), ('R', 'l')]:
        arm = [('Wing', 'upperarm'), ('WingTip', 'lowerarm')] if character == 'crow' else [('UpperArm', 'upperarm'), ('LowerArm', 'lowerarm'), ('Hand', 'hand')]
        for target, source in arm + [('UpperLeg', 'upperleg' if library == 'kaykit' else 'thigh'), ('LowerLeg', 'lowerleg' if library == 'kaykit' else 'calf'), ('Foot', 'foot')]:
            result[f'{target}.{side}'] = f'{source}.{donor_side}' if library == 'kaykit' else f'{source}_{donor_side}'
    return result


def make_target(character):
    if character not in CHARACTERS: raise ValueError('unknown character')
    source = ROOT / ('assets/characters/cow-crow/'+character+'.blend' if character in ('cow','crow') else f'assets/characters/{character}/source.blend')
    bpy.ops.wm.open_mainfile(filepath=str(source))
    collection = bpy.data.collections[f'Character.{character.title()}']
    meshes = [obj for obj in collection.objects if obj.type == 'MESH']
    for obj in list(bpy.data.objects):
        if obj not in meshes: bpy.data.objects.remove(obj, do_unlink=True)
    data = bpy.data.armatures.new(character.title()+'.TrialSkeleton')
    arm = bpy.data.objects.new(character.title()+'.TrialRig', data)
    collection.objects.link(arm)
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='EDIT')
    config = {
        'cow': (.74, 1.37, .4485, .644, .93, .1725, .31, 1.55, 1.90),
        'crow': (.59, 1.08, .31, .95, 1.28, .133, .08, 1.22, 1.58),
        'lion': (.65, 1.30, .399, .4845, .88, .1368, .28, 1.43, 2.05),
        'plates': (.52, 1.04, .5415, .6365, .68, .1615, .20, 1.08, 1.70),
    }[character]
    hip, shoulder_z, shoulder_x, wrist_x, wrist_z, hip_x, ankle_z, neck, head_top = config
    layout = {'Root': ((0,0,0), (0,0,.2), None), 'Torso': ((0,0,hip), (0,0,shoulder_z), 'Root')}
    if character != 'plates': layout['Head'] = ((0,0,neck), (0,0,head_top), 'Torso')
    for side, sign in [('L', -1), ('R', 1)]:
        shoulder = Vector((sign*shoulder_x,0,shoulder_z))
        wrist = Vector((sign*wrist_x, .015 if character == 'crow' else -.03, wrist_z))
        elbow = shoulder.lerp(wrist,.5)
        upper, lower = ('Wing','WingTip') if character == 'crow' else ('UpperArm','LowerArm')
        layout[f'{upper}.{side}'] = (shoulder, elbow, 'Torso')
        layout[f'{lower}.{side}'] = (elbow, wrist, f'{upper}.{side}')
        if character != 'crow': layout[f'Hand.{side}'] = (wrist, wrist+Vector((0,-.03,-.12)), f'{lower}.{side}')
        a = Vector((sign*hip_x,0,hip)); z = Vector((sign*hip_x,-.14 if character=='crow' else 0,ankle_z))
        knee = a.lerp(z,.5)
        layout[f'UpperLeg.{side}'] = (a,knee,'Root')
        layout[f'LowerLeg.{side}'] = (knee,z,f'UpperLeg.{side}')
        layout[f'Foot.{side}'] = (z,z+Vector((0,-.22,0)),f'LowerLeg.{side}')
    for name, (head, tail, _) in layout.items():
        bone=data.edit_bones.new(name);bone.head=head;bone.tail=tail
    for name, (_, _, parent) in layout.items():
        if parent: data.edit_bones[name].parent=data.edit_bones[parent]
    bpy.ops.object.mode_set(mode='OBJECT')
    rigid, wings = {}, {}
    for obj in meshes:
        part = obj.name.split('.',1)[1]
        side = 'L' if '.L' in part else 'R'
        groups = None
        if part.startswith('Arm.') or (character == 'crow' and part in ['Wing.L','Wing.R']):
            upper, lower = ('Wing','WingTip') if character == 'crow' else ('UpperArm','LowerArm')
            groups = (f'{upper}.{side}',f'{lower}.{side}')
        elif part.startswith('Leg.'):
            groups=(f'UpperLeg.{side}',f'LowerLeg.{side}')
        if groups:
            first, second=(obj.vertex_groups.new(name=name) for name in groups)
            start=Vector(layout[groups[0]][0]);end=Vector(layout[groups[1]][1]);axis=end-start
            for vertex in obj.data.vertices:
                t=((obj.matrix_world@vertex.co)-start).dot(axis)/axis.length_squared
                blend=max(0.0,min(1.0,(t-.3)/.4))
                if blend<1: first.add([vertex.index],1-blend,'REPLACE')
                if blend>0: second.add([vertex.index],blend,'REPLACE')
        else:
            bone='Torso'
            if character == 'crow' and part.startswith('Wing.Feather.'):
                bone=f'WingTip.{side}'
                wings.setdefault('left' if side=='L' else 'right',[]).append(obj.name)
            elif part.startswith('Jacket.Shoulder.'):
                bone=f'Wing.{side}'
            elif part.startswith('Fist.'):
                bone=f'Hand.{side}'
            elif part.startswith(('Boot.','Foot.','Toe.')):
                bone=f'Foot.{side}'
            elif character != 'plates' and part.startswith(('Head','Muzzle','Horn.','Eye.','Iris.','Brow.','Crest.','Ear.','Nostril.','Beak','Marking.L','Face','Nose','Mane','Mouth.')):
                bone='Head'
            group=obj.vertex_groups.new(name=bone)
            group.add(list(range(len(obj.data.vertices))),1,'REPLACE')
            if character=='plates' and part.startswith(('Plate.','Eye.','Iris.','Smile.','Cheek.')):
                rigid.setdefault('plate-face',[]).append(obj.name)
        obj.parent=arm
        obj.matrix_parent_inverse=arm.matrix_world.inverted()
        modifier=obj.modifiers.new('Articulated trial skin','ARMATURE');modifier.object=arm
    errors=validate_rig(arm,meshes,rigid,wings)
    if errors: raise ValueError('; '.join(errors))
    return arm,meshes,rigid,wings


def preflight_trial(output):
    output=Path(output).resolve()
    allowed=[ROOT/'tests/godot/fixtures/hero-animation/candidates',ROOT/'.tmp',Path(tempfile.gettempdir()).resolve()]
    if not any(output.is_relative_to(parent) and output!=parent for parent in allowed):
        raise ValueError('trial output must be isolated under hero candidates, .tmp or system temporary storage')
    if output.exists(): raise FileExistsError(f'{output}: trial output exists; choose a new isolated directory')
    return output


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def build_trial(character,library,output):
    output=preflight_trial(output)
    plan=trial_plan(character,library)
    for item in plan.values():
        if not item['path'].is_file(): raise FileNotFoundError(f"retain source first: {item['path']}")
    arm,meshes,rigid,wings=make_target(character)
    bpy.context.scene.render.fps=60
    mapping=bone_mapping(character,library)
    baked=[];clips={};source_clips={};reference_pose=None
    for semantic,item in plan.items():
        before=set(bpy.data.objects);before_actions=set(bpy.data.actions)
        bpy.ops.import_scene.gltf(filepath=str(item['path']))
        imported=set(bpy.data.objects)-before
        donor=next(o for o in imported if o.type=='ARMATURE')
        actions=set(bpy.data.actions)-before_actions
        # Each category import is isolated and removed before the next; never guess a clip alias.
        selected=[a for a in actions if a.name==item['clipName']]
        if len(selected)!=1: raise ValueError(f"{item['path']}: exact clip {item['clipName']} missing/ambiguous")
        clip=selected[0]
        if reference_pose is None:
            bind_action(donor,clip)
            bpy.context.scene.frame_set(int(clip.frame_range[0]))
            bpy.context.view_layer.update()
            reference_pose={b.name:b.matrix.to_quaternion().copy() for b in donor.pose.bones}
        result=bake_mapped_action(arm,donor,clip,mapping,semantic,item['loop'],reference_pose)
        baked.append(result)
        clips[semantic]={'clipName':semantic,'startSeconds':0.0,'endSeconds':(result.frame_range[1]-result.frame_range[0])/60,'mode':'loop' if item['loop'] else 'phase'}
        source_clips[semantic]={'path':str(item['path'].relative_to(ROOT)),'sha256':digest(item['path']),'clipName':item['clipName'],'sourceFrames':list(clip.frame_range),'sourceFps':60,'loopEndpointMatched':item['loop']}
        remove_donor(imported,arm,meshes)
        for a in actions:
            if a.name in bpy.data.actions: bpy.data.actions.remove(a)
    arm.animation_data.action=None
    for track in list(arm.animation_data.nla_tracks): arm.animation_data.nla_tracks.remove(track)
    for action in baked:
        action.use_fake_user=True
        track=arm.animation_data.nla_tracks.new();track.name=action.name
        track.strips.new(action.name,1,action);track.mute=True
    for bone in arm.pose.bones: bone.matrix_basis=Matrix.Identity(4)
    bpy.context.scene.frame_set(1)
    output.mkdir(parents=True)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(output/'rigged.blend'),check_existing=False)
    bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
    for obj in meshes: obj.select_set(True)
    bpy.context.view_layer.objects.active=arm
    bpy.ops.export_scene.gltf(filepath=str(output/'character.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_merge_animation='ACTION',export_skins=True,export_cameras=False,export_lights=False,export_yup=True)
    report={'schemaVersion':1,'characterId':character,'library':library,'status':'trialled','ownerReview':'pending','productionSelection':'pending','rigRevision':'hero-trial-2-neutral-corrected','mapping':mapping,'neutralReference':{name:list(q) for name,q in reference_pose.items() if name in mapping.values()},'clips':clips,'sources':source_clips,'rigidGroups':rigid,'wingGroups':wings,'runtimeSha256':digest(output/'character.glb'),'runtimeBytes':(output/'character.glb').stat().st_size,'editableSha256':digest(output/'rigged.blend'),'tolerances':{'weight':WEIGHT_EPSILON,'position':POSITION_EPSILON,'loopAngleRadians':ANGLE_EPSILON},'limitations':['Three trial clips only; not a production profile.','Rotations rest-corrected and baked; no donor root/pelvis translation or scale.','Loop endpoint matched; visual seam, contact, feet and clipping require review.','Bespoke Specials, directional gaits, reactions, full combo and support timing not produced.']}
    (output/'mapping.json').write_text(json.dumps(report,indent=2)+'\n')
    return report


def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--character',choices=CHARACTERS,required=True)
    parser.add_argument('--library',choices=LIBRARIES,required=True)
    parser.add_argument('--output-dir',type=Path,required=True)
    args=parser.parse_args(argv)
    if bpy.app.version[:3]!=(5,2,2): raise RuntimeError('pinned Blender 5.2.2 required')
    report=build_trial(args.character,args.library,args.output_dir)
    print(json.dumps({'character':args.character,'library':args.library,'bytes':report['runtimeBytes'],'status':report['status']}))
    return 0


if __name__=='__main__':
    sys.exit(main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []))
