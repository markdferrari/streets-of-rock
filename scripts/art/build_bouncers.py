"""Original security/head-bouncer skins using retained CC0 KayKit Medium motion.

Explicit GLB/source exports. Never modifies heroes, acquired files or existing skins.
Final contact/readability review remains separate from source/import correctness.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Matrix,Vector
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT))
from scripts.art import build_enemy_pilot as art
SOURCE=ROOT/'assets/art-sources/kaykit-character-animations-1.1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()

def extrema(arm,action,kind):
 arm.animation_data.action=action
 if action.slots:arm.animation_data.action_slot=action.slots[0]
 start,end=action.frame_range;best=None
 for i in range(20,81):
  frame=start+(end-start)*i/100;bpy.context.scene.frame_set(int(frame),subframe=frame%1);bpy.context.view_layer.update()
  p=arm.matrix_world@arm.pose.bones['handslot.r'].matrix.translation
  score=-p.y if kind=='forward' else -p.z
  if best is None or score>best[0]:best=(score,(frame-start)/60)
 arm.animation_data.action=None
 return best[1]

def build(role):
 bpy.ops.wm.read_factory_settings(use_empty=True);art.MATERIALS.clear();bpy.context.scene.render.fps=60
 bpy.ops.import_scene.gltf(filepath=str(SOURCE/'Rig_Medium_General.glb'))
 arm=next(o for o in bpy.data.objects if o.type=='ARMATURE');arm.name='Rig_Medium'
 general={n:bpy.data.actions[n] for n in ['Idle_A','Hit_A','Death_A','Throw']}
 arm.animation_data.action=None
 for track in list(arm.animation_data.nla_tracks):arm.animation_data.nla_tracks.remove(track)
 for bone in arm.pose.bones:bone.matrix_basis=Matrix.Identity(4)
 for o in list(bpy.data.objects):
  if o!=arm:bpy.data.objects.remove(o,do_unlink=True)
 actions=[general[n] for n in ['Idle_A','Hit_A','Death_A']]
 actions+=art.load_motion(arm,'Rig_Medium_MovementBasic.glb',['Running_A'])
 names=['Melee_Block'] if role=='enforcer' else ['Melee_Unarmed_Attack_Punch_A','Melee_2H_Attack_Chop']
 actions+=art.load_motion(arm,'Rig_Medium_CombatMelee.glb',names)
 if role=='liam':actions.append(general['Throw'])
 for bone in arm.pose.bones:bone.matrix_basis=Matrix.Identity(4)
 bpy.context.view_layer.objects.active=arm;bpy.context.view_layer.update()
 skin='#c88666';navy='#29384f';dark='#20202c';cream='#e9cf9b';hair='#d9d3c6'
 for side in ['l','r']:
  for name,radius in [('upperleg',.12),('lowerleg',.105)]:art.limb(arm,name+'.'+side,'Trouser.'+name+'.'+side,radius,'pants')
  x=arm.data.bones['foot.'+side].head_local.x
  art.box(arm,'foot.'+side,'Boot.'+side,(x,-.065,.09),(.24,.36,.18),dark)
  art.limb(arm,'upperarm.'+side,'Sleeve.Upper.'+side,.14,navy if role=='enforcer' else dark)
  art.limb(arm,'lowerarm.'+side,'Sleeve.Lower.'+side,.115,navy if role=='enforcer' else dark)
  hand=arm.data.bones['hand.'+side].head_local
  art.oval(arm,'hand.'+side,'Hand.'+side,hand,(.13,.11,.115),skin)
 art.oval(arm,'spine','Torso',(0,0,.81),(.34,.23,.37),navy if role=='enforcer' else dark)
 art.oval(arm,'chest','Shoulders',(0,0,1.035),(.42,.23,.21),navy if role=='enforcer' else dark)
 art.oval(arm,'head','Head',(0,-.01,1.39),(.25,.22,.27),skin)
 art.oval(arm,'head','Nose',(0,-.235,1.38),(.07,.065,.06),skin)
 for x in [-.09,.09]:
  art.oval(arm,'head','Eye.'+str(x),(x,-.219,1.46),(.033,.023,.034),dark)
  art.box(arm,'head','Brow.'+str(x),(x,-.212,1.52),(.11,.03,.03),dark)
 if role=='enforcer':
  art.box(arm,'spine','SecurityVest',(0,-.217,.86),(.62,.10,.58),dark)
  for x in [-.21,.21]:art.box(arm,'chest','VestStrap.'+str(x),(x,-.204,1.08),(.1,.09,.28),dark)
  art.box(arm,'chest','SecurityBadge',(.18,-.277,1.035),(.13,.035,.13),'white')
  art.box(arm,'head','CrewCut',(0,.01,1.63),(.49,.39,.10),dark)
 else:
  for x in [-.38,.38]:art.oval(arm,'chest','CoatShoulder.'+str(x),(x,0,1.065),(.22,.26,.24),dark)
  for x in [-.24,.24]:art.box(arm,'hips','CoatTail.'+str(x),(x,.04,.48),(.24,.43,.52),dark)
  for x in [-.18,.18]:
   o=art.box(arm,'spine','CreamLapel.'+str(x),(x,-.255,.94),(.13,.07,.49),cream)
   center=Vector((x,-.255,.94));rotation=Matrix.Rotation(.22 if x>0 else -.22,3,'Y')
   for v in o.data.vertices:v.co=center+rotation@(v.co-center)
  for z in [.72,.85,.98]:art.oval(arm,'spine','CoatButton.'+str(z),(0,-.273,z),(.035,.025,.035),'gold')
  art.box(arm,'hips','BeltBuckle',(0,-.27,.61),(.24,.07,.10),'gold')
  art.oval(arm,'head','SweptHair',(0,.01,1.64),(.265,.23,.105),hair)
  for x in [-.16,-.04,.08]:art.box(arm,'head','HairStrand.'+str(x),(x,-.015,1.7),(.07,.32,.035),'white')
  for z in [.48,.55,.62]:
   bpy.ops.mesh.primitive_torus_add(major_segments=16,minor_segments=6,major_radius=.14,minor_radius=.025,location=(.48,-.12,z),rotation=(math.pi/2,0,0))
   art.attach(bpy.context.object,arm,'hips','CoiledRope.'+str(z),'gold')
 # Remove horizontal hip lunge; visual limbs/vertical articulation remain local.
 for action in actions:
  for layer in action.layers:
   for strip in layer.strips:
    for bag in strip.channelbags:
     for curve in bag.fcurves:
      if curve.data_path=='pose.bones["hips"].location' and curve.array_index in [0,2]:
       value=curve.keyframe_points[0].co.y if curve.keyframe_points else 0
       for point in curve.keyframe_points:point.co.y=value;point.handle_left.y=value;point.handle_right.y=value
 arm.scale=(1.45 if role=='enforcer' else 1.65,)*3
 durations={a.name:float(a.frame_range[1]-a.frame_range[0])/60 for a in actions};by_name={a.name:a for a in actions}
 contact={}
 if role=='liam':
  contact['close']=extrema(arm,by_name['Melee_Unarmed_Attack_Punch_A'],'forward')
  contact['shockwave']=extrema(arm,by_name['Melee_2H_Attack_Chop'],'low')
 arm.animation_data.action=None
 for bone in arm.pose.bones:bone.matrix_basis=Matrix.Identity(4)
 for action in actions:
  action.use_fake_user=True;track=arm.animation_data.nla_tracks.new();track.name=action.name
  strip=track.strips.new(action.name,0,action);strip.action_frame_start=action.frame_range[0];strip.action_frame_end=max(action.frame_range[1],1)
 bpy.context.scene.frame_set(0);bpy.context.view_layer.update()
 folder=ROOT/'assets/enemies'/role;(folder/'source').mkdir(parents=True,exist_ok=True);(folder/'source/.gdignore').touch();(folder/'runtime').mkdir(exist_ok=True)
 source=folder/'source/character.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source))
 bpy.ops.object.select_all(action='DESELECT');meshes=[o for o in bpy.data.objects if o.type=='MESH']
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();mesh=bpy.context.object;mesh.name=role.title()+'Skin'
 colors=mesh.data.color_attributes.new(name='OutfitColor',type='FLOAT_COLOR',domain='CORNER')
 for face in mesh.data.polygons:
  color=mesh.data.materials[face.material_index].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
  for loop in face.loop_indices:colors.data[loop].color=color
 palette=bpy.data.materials.new('Bouncer.SharedOutfit');palette.use_nodes=True
 shader=palette.node_tree.nodes['Principled BSDF'];shader.inputs['Roughness'].default_value=.8
 vertex=palette.node_tree.nodes.new('ShaderNodeVertexColor');vertex.layer_name='OutfitColor';palette.node_tree.links.new(vertex.outputs['Color'],shader.inputs['Base Color'])
 mesh.data.materials.clear();mesh.data.materials.append(palette)
 for face in mesh.data.polygons:face.material_index=0
 bpy.ops.object.select_all(action='SELECT');runtime=folder/'runtime/character.glb'
 bpy.ops.export_scene.gltf(filepath=str(runtime),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_frame_range=False,export_force_sampling=True,export_cameras=False,export_lights=False,export_extras=False,export_yup=True)
 def binding(clip,start=0,end=None,fixed=None):
  d={'clipName':clip,'startSeconds':start,'endSeconds':durations[clip] if end is None else end,'loop':False}
  if fixed is not None:d['fixedSampleSeconds']=fixed
  return d
 bindings={'Idle':binding('Idle_A'),'Move':binding('Running_A'),'Hurt':binding('Hit_A'),'Defeated':binding('Death_A',fixed=durations['Death_A'])}
 for key in ['Idle','Move']:bindings[key]['loop']=True
 moves=['charge'] if role=='enforcer' else ['close','rope','shockwave']
 if role=='enforcer':
  bindings['Stunned']=binding('Hit_A',fixed=.3);bindings['Stunned']['loop']=True
  bindings['charge.windup']=binding('Melee_Block',fixed=durations['Melee_Block']*.7)
  bindings['charge.active']=binding('Running_A');bindings['charge.recovery']=binding('Hit_A')
 else:
  for move,clip,start,end in [('close','Melee_Unarmed_Attack_Punch_A',contact['close'],min(contact['close']+.18,durations['Melee_Unarmed_Attack_Punch_A'])),('rope','Throw',.7,.84),('shockwave','Melee_2H_Attack_Chop',contact['shockwave'],min(contact['shockwave']+.15,durations['Melee_2H_Attack_Chop']))]:
   bindings[move+'.windup']=binding(clip,0,start);bindings[move+'.active']=binding(clip,start,end);bindings[move+'.recovery']=binding(clip,end,durations[clip])
 record={'role':role,'sceneResourceId':'enemy.'+role,'sourceRecordIds':['kaykit-character-animations-1.1','head-bouncers-original'],'transform':{'scale':1.0,'footOffset':0.0,'facingCorrection':0.0},'visualEnvelope':{'width':2.5,'height':3.4,'depth':2.5},'allowedMoveIds':moves,'clipBindings':bindings,'defeatHoldTicks':21,'reviewSubjectId':role,'status':'production','sourcePath':str(source.relative_to(ROOT)),'sourceSha256':sha(source),'runtimePath':str(runtime.relative_to(ROOT)),'runtimeSha256':sha(runtime),'exporter':bpy.app.version_string,'adaptations':['Original approved security/coat/rope silhouettes on the retained Medium rig.','Retain only named required motions; pin horizontal hips.','Phase segments use source hand extrema; final gameplay contact/feet review remains separate.']}
 if role=='liam':record['phase2Style']={'kind':'shoulder-chevrons','nonblocking':True}
 return record

def main():
 records=[build(role) for role in ['enforcer','liam']]
 p=ROOT/'content/enemy-presentations.json';doc=json.loads(p.read_text());doc['enemies']=[r for r in doc['enemies'] if r['role'] not in ['enforcer','liam']]+records
 if not any(s['id']=='head-bouncers-original' for s in doc['sources']):doc['sources'].append({'id':'head-bouncers-original','status':'accepted'})
 p.write_text(json.dumps(doc,indent=2)+'\n')
 p=ROOT/'content/resources.json';resources=json.loads(p.read_text())
 for r in records:resources['art'][r['sceneResourceId']]={'path':r['runtimePath'],'sha256':r['runtimeSha256'],'sourceRecordIds':r['sourceRecordIds'],'dependencyIds':['enemy.outfit']}
 p.write_text(json.dumps(resources,indent=2)+'\n')
 p=ROOT/'content/art-provenance.json';doc=json.loads(p.read_text());doc['sources']=[s for s in doc['sources'] if s['id']!='head-bouncers-original']+[{'id':'head-bouncers-original','name':'Original security and head-bouncer skins','creator':'Project artwork authored by Codex at owner request','originalAuthorDeclaration':'Original security vest, coat, shaped hair and rope geometry extend the approved concepts using retained project geometry helpers; KayKit motion is separately attributed.','licenseId':'LicenseRef-Project-Original','sourcePath':'scripts/art/build_bouncers.py','sourceSha256':sha(Path(__file__)),'supportingFiles':[{'path':'scripts/art/build_enemy_pilot.py','sha256':sha(ROOT/'scripts/art/build_enemy_pilot.py')}],'status':'accepted','reviewer':'Codex source inspection; owner concept/reuse direction approved','reviewDate':'2026-10-15'}]
 doc['runtimeAssets']=[r for r in doc['runtimeAssets'] if r.get('role') not in ['enforcer','liam']]+records
 p.write_text(json.dumps(doc,indent=2)+'\n')
if __name__=='__main__':main()
