"""Complete, scoped hero production on the owner-selected Universal source.

No donor geometry or root travel is retained. Review bindings record every adaptation;
contact is the maximum forward hand/wing extension for donor strikes. Specials and
Hurt deltas are original, because donor coverage does not express these abilities.
"""
import json
import math
from pathlib import Path
import bpy
from mathutils import Matrix, Quaternion, Vector
from scripts.blender import hero_motion as hm

SOURCE_ID = 'quaternius-universal-animation-library-standard'


def binding(name, duration, mode='phase', start=0):
    return dict(clipName=name,startSeconds=start,endSeconds=duration,mode=mode)


def custom_action(arm, character, name):
    action=bpy.data.actions.new(name)
    hm.bind_action(arm,action)
    for frame in range(61):
        t=frame/60
        swell=math.sin(math.pi*t) if name=='Hurt' else (math.sin(math.pi*.5*t/.3) if t<=.3 else math.cos(math.pi*.5*(t-.3)/.7))
        if name in ('spin','wingSpin') and .3<=t<=.7:swell=1.0
        for bone in arm.pose.bones: bone.matrix_basis=Matrix.Identity(4)
        torso=arm.pose.bones['Torso']
        if name=='Hurt':
            torso.rotation_mode='QUATERNION'
            torso.rotation_quaternion=Quaternion((1,0,0),-.14*swell)
        elif name in ('spin','wingSpin'):
            # Four intermediate quadrants preserve a full turn across quaternion wrap.
            turn=0 if t<=.3 else min(1,(t-.3)/.4)
            torso.rotation_mode='QUATERNION'
            torso.rotation_quaternion=Quaternion((0,1,0),2*math.pi*turn)
            for side,sign in [('L',1),('R',-1)]:
                b=arm.pose.bones[('Wing.' if character=='crow' else 'UpperArm.')+side]
                b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion((0,0,1),sign*.65*swell)
        elif name=='roar':
            torso.rotation_mode='QUATERNION';torso.rotation_quaternion=Quaternion((1,0,0),-.25*swell)
            head=arm.pose.bones['Head'];head.rotation_mode='QUATERNION';head.rotation_quaternion=Quaternion((1,0,0),-.3*swell)
            for side,sign in [('L',1),('R',-1)]:
                b=arm.pose.bones['UpperArm.'+side];b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion((0,0,1),sign*.45*swell)
        elif name=='headrest':
            for side in ['L','R']:
                b=arm.pose.bones['UpperArm.'+side];b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion((1,0,0),-1.2*swell)
                b=arm.pose.bones['LowerArm.'+side];b.rotation_mode='QUATERNION';b.rotation_quaternion=Quaternion((1,0,0),-.45*swell)
        for bone in arm.pose.bones:
            bone.rotation_mode='QUATERNION'
            bone.keyframe_insert('rotation_quaternion',frame=frame+1,group=bone.name)
    for curve in hm.curves(action):
        for key in curve.keyframe_points:key.interpolation='LINEAR'
    return action


def directional_copy(arm, source, direction):
    action=bpy.data.actions.new('Move_'+direction)
    hm.bind_action(arm,action)
    start,end=map(float,source.frame_range)
    count=round(end-start)+1
    for i in range(count):
        hm.bind_action(arm,source)
        frame=end-i if direction=='backward' else start+i
        bpy.context.scene.frame_set(int(frame));bpy.context.view_layer.update()
        poses={b.name:b.rotation_quaternion.copy() for b in arm.pose.bones}
        hm.bind_action(arm,action)
        for name,q in poses.items():
            if direction in ('left','right') and any(x in name for x in ['Leg.','Foot.']):
                # Rotate the local sagittal gait plane into the lateral plane.
                axis=Quaternion((0,1,0),math.pi/2 if direction=='right' else -math.pi/2)
                q=axis@q@axis.inverted()
            b=arm.pose.bones[name];b.rotation_mode='QUATERNION';b.rotation_quaternion=q
            b.keyframe_insert('rotation_quaternion',frame=i+1,group=name)
    for curve in hm.curves(action):
        for key in curve.keyframe_points:key.interpolation='LINEAR'
    return action


def build(character):
    arm,meshes,rigid,wings=hm.make_target(character)
    arm.name=character.title()+'.Rig'
    arm.data.name=character.title()+'.Skeleton'
    bpy.context.scene.render.fps=60
    source=hm.trial_plan(character,'universal')['Idle']['path']
    before=set(bpy.data.objects);before_actions=set(bpy.data.actions)
    bpy.ops.import_scene.gltf(filepath=str(source))
    imported=set(bpy.data.objects)-before
    donor=next(o for o in imported if o.type=='ARMATURE')
    actions={a.name:a for a in set(bpy.data.actions)-before_actions}
    idle=actions['Idle_Loop'];hm.bind_action(donor,idle)
    bpy.context.scene.frame_set(int(idle.frame_range[0]));bpy.context.view_layer.update()
    neutral={b.name:b.matrix.to_quaternion().copy() for b in donor.pose.bones}
    mapping=hm.bone_mapping(character,'universal')
    specs={'Idle':'Idle_Loop','Move':'Walk_Loop','Dodge':'Roll','KnockedOut':'Death01',character+'1':'Punch_Jab',character+'2':'Punch_Cross',character+'3':'Punch_Cross',character+'Heavy':'Punch_Cross'}
    support={'cow':'cow1','crow':'crow','lion':'lionSupport','plates':'platesSupport'}[character]
    if support not in specs:specs[support]='Punch_Jab'
    baked={};origins={};contacts={}
    for name,src in specs.items():
        a=hm.bake_mapped_action(arm,donor,actions[src],mapping,name,name in ('Idle','Move'),neutral)
        # Distinguish the finisher/heavy through a larger local torso/arm arc.
        if name in (character+'3',character+'Heavy'):
            strength=1.12 if name.endswith('3') else 1.25
            for curve in hm.curves(a):
                if 'Torso' in curve.data_path or 'UpperArm' in curve.data_path or 'Wing' in curve.data_path:
                    if curve.array_index>0:
                        for key in curve.keyframe_points:key.co.y*=strength
            # Quaternion channels normalize on evaluation/export.
        baked[name]=a;origins[name]={'sourceRecordId':SOURCE_ID,'path':str(source.relative_to(hm.ROOT)),'sha256':hm.digest(source),'clipName':src}
        if name not in ('Idle','Move','Dodge','KnockedOut'):
            hm.bind_action(arm,a)
            hand=arm.pose.bones['WingTip.L' if character=='crow' else 'Hand.L']
            # Target front is -Y in Blender. Use the farthest hand of either side.
            best=(0,0)
            for f in range(3,round(a.frame_range[1])-2):
                bpy.context.scene.frame_set(f);bpy.context.view_layer.update()
                extension=max(-arm.pose.bones[n].tail.y for n in [('WingTip.L' if character=='crow' else 'Hand.L'),('WingTip.R' if character=='crow' else 'Hand.R')])
                if extension>best[0]:best=(extension,f)
            contacts[name]=max(.05,min((a.frame_range[1]-1)/60-.05,(best[1]-1)/60))
    for direction in ('backward','left','right'):
        baked['Move_'+direction]=directional_copy(arm,baked['Move'],direction)
        origins['Move_'+direction]={**origins['Move'],'adaptation':'time reversal' if direction=='backward' else 'local leg gait plane rotated laterally'}
    special={'cow':'spin','crow':'wingSpin','lion':'roar','plates':'headrest'}[character]
    for name in ('Hurt',special):
        baked[name]=custom_action(arm,character,name)
        origins[name]={'sourceRecordId':'hero-motion-original','adaptation':'original local rest-relative reaction' if name=='Hurt' else 'original existing Special gesture; no gameplay/root motion'}
    contacts[special]=.3
    hm.remove_donor(imported,arm,meshes)
    for a in actions.values():
        if a.name in bpy.data.actions:bpy.data.actions.remove(a)
    # Discard orphan source actions; export only this explicit production inventory.
    for a in list(bpy.data.actions):
        if a not in baked.values():bpy.data.actions.remove(a)
    duration={n:(a.frame_range[1]-a.frame_range[0])/60 for n,a in baked.items()}
    loops=['Idle','Move','Move_backward','Move_left','Move_right']
    for name,a in baked.items():
        errors=hm.validate_action(arm,a,name in loops)
        if errors:raise ValueError('; '.join(errors))
    semantics=json.loads((hm.ROOT/'content/animation-clips.json').read_text())[character]
    bindings={}
    for key in semantics:
        if '.' not in key:
            bindings[key]=binding(key,duration[key],'loop' if key in loops else 'reaction' if key=='Hurt' else 'phase')
        else:
            group,phase=key.split('.')
            impact=contacts[group];end=duration[group]
            active_end=.7 if group in ("spin","wingSpin") else min(end-.025,impact+min(.16,(end-impact)/2))
            ranges={'windup':(0,impact),'active':(impact,active_end),'recovery':(active_end,end)}
            start,stop=ranges[phase]
            bindings[key]={**binding(group,stop,start=start),'actionGroup':group}
            if phase=='active':bindings[key]['contactSeconds']=start
    stride={'cow':1.25,'crow':1.0,'lion':1.1,'plates':1.0}[character]
    locomotion={direction:{**binding('Move' if direction=='forward' else 'Move_'+direction,duration['Move'],'loop'),'strideDistance':stride} for direction in ['forward','backward','left','right']}
    profile=dict(characterId=character,modelKey=character,sourceRecordIds=[SOURCE_ID,'hero-motion-original'],bindings=bindings,locomotion=locomotion,idleCycleSeconds=duration['Idle'],hurtSeconds=.15,knockoutSeconds=.6,transitionSeconds={'action':.05},reactionBoneNames=['Torso'],secondaryMotionBoneNames=[],rigidGroups=rigid if character=='plates' else wings if character=='crow' else {})
    folder=hm.ROOT/('assets/characters/cow-crow/runtime' if character in ['cow','crow'] else f'assets/characters/{character}/runtime')
    blend=folder/(character+'-rigged.blend' if character in ['cow','crow'] else 'rigged.blend')
    glb=folder/(character+'.glb' if character in ['cow','crow'] else 'character.glb')
    arm.animation_data.action=None
    for track in list(arm.animation_data.nla_tracks):arm.animation_data.nla_tracks.remove(track)
    for name,a in baked.items():
        a.use_fake_user=True
        track=arm.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,a);track.mute=True
    for b in arm.pose.bones:b.matrix_basis=Matrix.Identity(4)
    bpy.context.scene.frame_set(1)
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str(blend),check_existing=False)
    bpy.ops.object.select_all(action='DESELECT');arm.select_set(True)
    for obj in meshes:obj.select_set(True)
    bpy.context.view_layer.objects.active=arm
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='ACTIONS',export_merge_animation='ACTION',export_skins=True,export_cameras=False,export_lights=False,export_yup=True)
    report=dict(schemaVersion=1,characterId=character,profile=profile,physicalClips=duration,loopClips=loops,origins=origins,rigidGroups=rigid,wingGroups=wings,runtimePath=str(glb.relative_to(hm.ROOT)),editablePath=str(blend.relative_to(hm.ROOT)),runtimeSha256=hm.digest(glb),editableSha256=hm.digest(blend),runtimeBytes=glb.stat().st_size,visualReview='pending',tolerances={'weight':hm.WEIGHT_EPSILON,'position':hm.POSITION_EPSILON,'loopAngleRadians':hm.ANGLE_EPSILON})
    (hm.ROOT/f'specs/011-improve-character-animations/reviews/{character}-bindings.json').write_text(json.dumps(report,indent=2)+'\n')
    return report
