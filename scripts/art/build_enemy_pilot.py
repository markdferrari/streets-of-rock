"""Build review-only Grunt/Zoner skins on retained KayKit Medium animations.

Explicit GLB exports and editable Blender files; never writes hero/source-pack files.
Manual visual procedures: specs/010-upgrade-game-artwork/validation/procedures.md.
"""
import argparse
import json
import math
import hashlib
from pathlib import Path
import bpy
from mathutils import Vector, Matrix

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/art-sources/kaykit-character-animations-1.1'
DEFAULT_OUTPUT = ROOT / 'tests/godot/fixtures/art/enemy-pilot'
COLORS = {'skin': '#c88666', 'dark': '#22212e', 'pants': '#292632', 'pink': '#ef4c91', 'white': '#ede7dc', 'red': '#a73355', 'gold': '#eac169'}
MATERIALS = {}

def material(key):
    if key in MATERIALS:
        return MATERIALS[key]
    m = bpy.data.materials.new('Pilot.' + key)
    c = COLORS.get(key, key).lstrip('#')
    rgb = tuple((int(c[i:i+2],16)/255) ** 2.2 for i in (0,2,4))
    m.diffuse_color = (*rgb,1)
    m.use_nodes = True
    shader = m.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value = (*rgb,1)
    shader.inputs['Roughness'].default_value = .8
    MATERIALS[key] = m
    return m

def attach(obj, arm, bone, name, color):
    obj.name = name
    obj.data.materials.clear()
    obj.data.materials.append(material(color))
    # Bake geometry transforms before attaching, preserving the supplier bind pose.
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.parent = arm
    group = obj.vertex_groups.new(name=bone)
    group.add(list(range(len(obj.data.vertices))),1.0,'REPLACE')
    modifier = obj.modifiers.new('KayKit skin', 'ARMATURE')
    modifier.object = arm
    return obj

def box(arm, bone, name, center, size, color):
    bpy.ops.mesh.primitive_cube_add(size=1,location=center)
    obj=bpy.context.object
    obj.scale=size
    bevel=obj.modifiers.new('Rounded silhouette','BEVEL')
    bevel.width=.035
    bevel.segments=2
    bpy.ops.object.modifier_apply(modifier=bevel.name)
    return attach(obj,arm,bone,name,color)

def oval(arm,bone,name,center,scale,color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=center)
    obj=bpy.context.object
    obj.scale=scale
    for polygon in obj.data.polygons:polygon.use_smooth=True
    return attach(obj,arm,bone,name,color)

def limb(arm,bone,name,radius,color):
    b=arm.data.bones[bone]
    a=b.head_local;z=b.tail_local
    center=(a+z)/2
    length=(z-a).length
    bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=8,location=center)
    obj=bpy.context.object
    obj.scale=(radius,radius,length*.6)
    obj.rotation_euler=(z-a).to_track_quat('Z','Y').to_euler()
    for polygon in obj.data.polygons:polygon.use_smooth=True
    return attach(obj,arm,bone,name,color)

def load_motion(arm, filename, names):
    previous=set(bpy.data.objects)
    before=set(bpy.data.actions)
    bpy.ops.import_scene.gltf(filepath=str(SOURCE/filename))
    imported=set(bpy.data.objects)-previous
    actions={a.name:a for a in set(bpy.data.actions)-before}
    result=[]
    for name in names:
        # The per-category imports only share unused T-Pose; selected names are unique.
        action=actions[name]
        action.use_fake_user=True
        result.append(action)
    for obj in list(imported):bpy.data.objects.remove(obj,do_unlink=True)
    return result

def build(role,out):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MATERIALS.clear()
    bpy.context.scene.render.fps=60
    bpy.ops.import_scene.gltf(filepath=str(SOURCE/'Rig_Medium_General.glb'))
    arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    arm.name='Rig_Medium'
    general={name:bpy.data.actions[name] for name in ['Idle_A','Hit_A','Death_A','Throw']}
    arm.animation_data.action=None
    for bone in arm.pose.bones:bone.matrix_basis=Matrix.Identity(4)
    for obj in list(bpy.data.objects):
        if obj!=arm:bpy.data.objects.remove(obj,do_unlink=True)
    # Kept action data originates from the supplier; unused categories never export.
    actions=[general[name] for name in ['Idle_A','Hit_A','Death_A']]
    actions+=load_motion(arm,'Rig_Medium_MovementBasic.glb',['Running_A'])
    if role=='grunt':
        actions+=load_motion(arm,'Rig_Medium_CombatMelee.glb',['Melee_Unarmed_Attack_Punch_A'])
    else:actions.append(general['Throw'])
    bpy.context.view_layer.objects.active=arm
    for bone in arm.pose.bones:bone.matrix_basis=Matrix.Identity(4)
    bpy.context.view_layer.update()
    for side in ['l','r']:
        for name,radius,col in [('upperleg',.095,'pants'),('lowerleg',.085,'pants')]:
            limb(arm,name+'.'+side,'Trouser.'+name+'.'+side,radius,col)
        x=arm.data.bones['foot.'+side].head_local.x
        box(arm,'foot.'+side,'Boot.'+side,(x,-.065,.09),(.21,.33,.18),'dark')
        sleeve='red' if role=='grunt' else 'white'
        limb(arm,'upperarm.'+side,'Sleeve.Upper.'+side,.095,sleeve)
        limb(arm,'lowerarm.'+side,'Forearm.'+side,.08,'skin' if role=='grunt' else 'white')
        hand=arm.data.bones['hand.'+side].head_local
        oval(arm,'hand.'+side,'Hand.'+side,hand,(.105,.09,.095),'skin')
    oval(arm,'spine','Torso',(0,0,.79),(.25,.17,.32),'red' if role=='grunt' else 'white')
    oval(arm,'chest','Shoulders',(0,0,1.035),(.27,.16,.16),'red' if role=='grunt' else 'white')
    oval(arm,'head','Head',(0,-.01,1.36),(.23,.20,.265),'skin')
    oval(arm,'head','Nose',(0,-.213,1.35),(.065,.065,.06),'skin')
    for x in [-.085,.085]:
        oval(arm,'head','Eye.'+str(x),(x,-.199,1.43),(.03,.02,.035),'dark')
        box(arm,'head','Brow.'+str(x),(x,-.193,1.49),(.09,.03,.025),'dark')
    if role=='grunt':
        box(arm,'spine','DarkVest',(0,-.15,.85),(.33,.06,.50),'dark')
        for y,z in [(-.12,1.62),(-.02,1.67),(.08,1.64)]:
            box(arm,'head','Mohawk',(0,y,z),(.09,.13,.18),'pink')
        for x in [-.2,.2]:
            box(arm,'chest','VestLapels',(x,-.157,1.02),(.07,.06,.20),'dark')
    else:
        box(arm,'spine','Apron.Front',(0,-.176,.70),(.39,.045,.57),'dark')
        box(arm,'chest','Apron.Bib',(0,-.171,1.00),(.30,.045,.32),'dark')
        for x in [-.07,.07]:
            oval(arm,'chest','BowTie',(x,-.20,1.12),(.08,.04,.05),'red')
        box(arm,'spine','Apron.Pocket',(0,-.205,.72),(.19,.025,.12),'white')
    # Store all retained animations in NLA tracks on one rig, without mannequin geometry.
    arm.animation_data.action=None
    for track in list(arm.animation_data.nla_tracks):arm.animation_data.nla_tracks.remove(track)
    for action in actions:
        # Source hip translations are useful pose motion but excessive horizontal
        # lunge would suggest false attack reach. Preserve bob; anchor forward hips.
        for layer in action.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for curve in bag.fcurves:
                        if curve.data_path=='pose.bones["hips"].location' and curve.array_index in [0,2]:
                            value=curve.keyframe_points[0].co.y if curve.keyframe_points else 0
                            for point in curve.keyframe_points:
                                point.co.y=value
                                point.handle_left.y=value
                                point.handle_right.y=value
        track=arm.animation_data.nla_tracks.new()
        track.name=action.name
        strip=track.strips.new(action.name,0,action)
        strip.action_frame_start=action.frame_range[0]
        strip.action_frame_end=max(action.frame_range[1],1)
    arm.scale=(1.3,)*3
    bpy.context.scene.frame_set(0)
    bpy.context.view_layer.update()
    role_dir=out/role
    (role_dir/'source').mkdir(parents=True,exist_ok=True)
    (role_dir/'runtime').mkdir(exist_ok=True)
    source_path=role_dir/'source/character.blend'
    bpy.ops.wm.save_as_mainfile(filepath=str(source_path))
    # Join only the runtime skin. The saved editable source retains named parts.
    bpy.ops.object.select_all(action='DESELECT')
    meshes=[obj for obj in bpy.data.objects if obj.type=='MESH']
    for obj in meshes:obj.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0]
    bpy.ops.object.join()
    skin=bpy.context.object
    skin.name=role.title()+'Skin'
    # Bake the small outfit palette into vertex colours: one surface/material,
    # preserving the concept colours while reducing mixed-wave draw calls.
    colors=skin.data.color_attributes.new(name='OutfitColor',type='FLOAT_COLOR',domain='CORNER')
    for polygon in skin.data.polygons:
        original=skin.data.materials[polygon.material_index]
        color=original.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
        for loop in polygon.loop_indices:colors.data[loop].color=color
    shared=bpy.data.materials.new('Pilot.SharedOutfit')
    shared.use_nodes=True
    shader=shared.node_tree.nodes['Principled BSDF']
    shader.inputs['Roughness'].default_value=.8
    vertex=shared.node_tree.nodes.new('ShaderNodeVertexColor')
    vertex.layer_name='OutfitColor'
    shared.node_tree.links.new(vertex.outputs['Color'],shader.inputs['Base Color'])
    skin.data.materials.clear()
    skin.data.materials.append(shared)
    for polygon in skin.data.polygons:polygon.material_index=0
    bpy.ops.object.select_all(action='SELECT')
    glb=role_dir/'runtime/character.glb'
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_frame_range=False,export_force_sampling=True,export_cameras=False,export_lights=False,export_extras=False,export_yup=True)
    attack='Melee_Unarmed_Attack_Punch_A' if role=='grunt' else 'Throw'
    move='grunt' if role=='grunt' else 'throw'
    durations={a.name:float(a.frame_range[1]-a.frame_range[0])/60 for a in actions}
    # Active starts on the forward contact/release pose, verified on imported
    # skeletons in both facings; final spatial contact/feet review remains open.
    cuts=(.0,.47,.66,durations[attack]) if role=='grunt' else (.0,.70,.84,durations[attack])
    bindings={
        'Idle':{'clipName':'Idle_A','startSeconds':0.0,'endSeconds':durations['Idle_A'],'loop':True},
        'Move':{'clipName':'Running_A','startSeconds':0.0,'endSeconds':durations['Running_A'],'loop':True},
        'Hurt':{'clipName':'Hit_A','startSeconds':0.0,'endSeconds':durations['Hit_A'],'loop':False},
        'Stunned':{'clipName':'Hit_A','startSeconds':0.0,'endSeconds':durations['Hit_A'],'loop':True,'fixedSampleSeconds':.30},
        'Defeated':{'clipName':'Death_A','startSeconds':0.0,'endSeconds':durations['Death_A'],'loop':False,'fixedSampleSeconds':durations['Death_A']},
    }
    for i,phase in enumerate(['windup','active','recovery']):bindings[move+'.'+phase]={'clipName':attack,'startSeconds':cuts[i],'endSeconds':cuts[i+1],'loop':False}
    record={'role':role,'sceneResourceId':'pilot.'+role,'sourceRecordIds':['kaykit-character-animations-1.1','enemy-pilot-original'],'transform':{'scale':1.0,'footOffset':0.0,'facingCorrection':0.0},'visualEnvelope':{'width':2.5,'height':2.5,'depth':2.5},'allowedMoveIds':[move],'clipBindings':bindings,'defeatHoldTicks':21,'reviewSubjectId':role,'status':'prototype','sourcePath':str(source_path.relative_to(ROOT)),'runtimePath':str(glb.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source_path.read_bytes()).hexdigest(),'runtimeSha256':hashlib.sha256(glb.read_bytes()).hexdigest(),'exporter':bpy.app.version_string,'adaptations':['Original club outfit/mesh on KayKit Medium skeleton','Retain only five selected animation clips','Anchor horizontal hips lunge; preserve local limb/vertical motion','Initial authored phase segments pending matched visual review']}
    (role_dir/'definition.json').write_text(json.dumps(record,indent=2)+'\n')
    return record

def export_bottle(out):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/art-sources/kaykit-dungeon-1.1/bottle_A_green.gltf'))
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=str(out/'bottle.glb'),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False)

def main():
    import sys
    args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output',type=Path,default=DEFAULT_OUTPUT)
    parser.add_argument('--role',choices=['grunt','zoner'])
    options=parser.parse_args(args)
    options.output=options.output.resolve()
    if not options.output.is_relative_to(ROOT):parser.error('--output must be inside this repository')
    records=[build(role,options.output) for role in ([options.role] if options.role else ['grunt','zoner'])]
    records=[json.loads((options.output/role/'definition.json').read_text()) for role in ['grunt','zoner'] if (options.output/role/'definition.json').exists()]
    (options.output/'definitions.json').write_text(json.dumps({'schemaVersion':1,'enemies':records},indent=2)+'\n')
    if not options.role or not (options.output/'bottle.glb').exists():export_bottle(options.output)
if __name__=='__main__':main()
