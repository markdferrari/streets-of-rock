"""Explicit editable Blender/GLB venue exports from approved room directions.

Never writes heroes, level, tuning or acquired sources. Procedures precede production:
specs/010-upgrade-game-artwork/validation/procedures.md.
"""
import bpy
import hashlib
import json
import math
import zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/rooms'
COLORS={'floor':'#393541','wall':'#292335','metal':'#171a24','wood':'#754744','pink':'#f94e9a','cyan':'#53d4eb','gold':'#edc16a','white':'#eee8dc','violet':'#7761aa','red':'#a53050','blue':'#314d76'}
MATERIALS={}
GROUPS={}
ROOMS={
 'exterior':('dance-floor',['frontage','club-sign','neon-doorway','light-spill','pavement','queue-barriers','event-posters']),
 'bar':('vip-lounge',['long-counter','bottle-shelves','stools','booths','warm-light','neon-accents']),
 'dance-floor':('backstage-corridor',['dance-floor','dj-booth','large-speakers','overhead-fixtures','coloured-light-pools']),
 'stage-vip':('alley-exit',['curtains','stage-backdrop','vip-seating','club-branding','dramatic-light'])}
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def material(color,glow=False):
 key=(color,glow)
 if key in MATERIALS:return MATERIALS[key]
 value=COLORS.get(color,color).lstrip('#');rgb=tuple((int(value[i:i+2],16)/255)**2.2 for i in (0,2,4))
 m=bpy.data.materials.new(color+('-glow' if glow else ''));m.use_nodes=True
 shader=m.node_tree.nodes['Principled BSDF'];shader.inputs['Base Color'].default_value=(*rgb,1);shader.inputs['Roughness'].default_value=.8
 if glow:shader.inputs['Emission Color'].default_value=(*rgb,1);shader.inputs['Emission Strength'].default_value=1
 m['venue_glow']=glow;MATERIALS[key]=m;return m

def group(name):
 if name not in GROUPS:
  o=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(o);GROUPS[name]=o
 return GROUPS[name]

def box(name,at,size,color,glow=False):
 x,y,z=at;sx,sy,sz=size
 bpy.ops.mesh.primitive_cube_add(size=1,location=(x,-z,y));o=bpy.context.object;o.scale=(sx,sz,sy)
 o.name=name+'.part';o.parent=group(name);o.data.materials.append(material(color,glow));return o

def cylinder(name,at,radius,height,color,front=False):
 x,y,z=at;bpy.ops.mesh.primitive_cylinder_add(vertices=16,radius=radius,depth=height,location=(x,-z,y))
 o=bpy.context.object;o.name=name+'.round';o.parent=group(name)
 if front:o.rotation_euler.x=math.pi/2
 o.data.materials.append(material(color));return o

def reset():
 bpy.ops.wm.read_factory_settings(use_empty=True);MATERIALS.clear();GROUPS.clear()

def batch_and_export(path):
 for root in list(GROUPS.values()):
  meshes=[o for o in root.children if o.type=='MESH']
  if not meshes:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in meshes:o.select_set(True)
  bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();skin=bpy.context.object;skin.name=root.name+'Geometry'
  colors=skin.data.color_attributes.new(name='VenueColor',type='FLOAT_COLOR',domain='CORNER');glow_faces=[]
  for face in skin.data.polygons:
   old=skin.data.materials[face.material_index];color=old.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
   for loop in face.loop_indices:colors.data[loop].color=color
   glow_faces.append(bool(old.get('venue_glow',False)))
  palettes=[]
  for glow in [False,True]:
   name='VenueGlow' if glow else 'VenueOpaque';palette=bpy.data.materials.get(name)
   if palette is None:
    palette=bpy.data.materials.new(name);palette.use_nodes=True;shader=palette.node_tree.nodes['Principled BSDF'];shader.inputs['Roughness'].default_value=.8
    vertex=palette.node_tree.nodes.new('ShaderNodeVertexColor');vertex.layer_name='VenueColor';palette.node_tree.links.new(vertex.outputs['Color'],shader.inputs['Base Color'])
    if glow:palette.node_tree.links.new(vertex.outputs['Color'],shader.inputs['Emission Color']);shader.inputs['Emission Strength'].default_value=1
   palettes.append(palette)
  skin.data.materials.clear()
  for palette in palettes:skin.data.materials.append(palette)
  for face,glow in zip(skin.data.polygons,glow_faces):face.material_index=int(glow)
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.export_scene.gltf(filepath=str(path),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)

def save_export(folder,filename):
 (folder/'source').mkdir(parents=True,exist_ok=True);(folder/'runtime').mkdir(exist_ok=True);(folder/'source/.gdignore').touch()
 source=folder/'source'/f'{filename}.blend';bpy.ops.wm.save_as_mainfile(filepath=str(source))
 runtime=folder/'runtime'/f'{filename}.glb';batch_and_export(runtime)
 return {'sourcePath':str(source.relative_to(ROOT)),'sourceSha256':sha(source),'runtimePath':str(runtime.relative_to(ROOT)),'runtimeSha256':sha(runtime),'exporter':bpy.app.version_string}

def shared_prop(name,member):
 reset();target=OUT/'shared/source-inputs'/Path(member).name;target.parent.mkdir(parents=True,exist_ok=True);(target.parent/'.gdignore').touch()
 target.write_bytes(zipfile.ZipFile(ROOT/'assets/art-sources/kenney-furniture/archive.zip').read(member));bpy.ops.import_scene.gltf(filepath=str(target));g=group(name)
 for o in list(bpy.data.objects):
  if o.type=='MESH':world=o.matrix_world.copy();o.parent=g;o.matrix_world=world
 record=save_export(OUT/'shared',name)
 record.update(id='room.prop.'+name,status='production',sourceRecordIds=['kenney-furniture','venue-original'],selectedSource={'path':member,'sha256':sha(target)},adaptations=['Retain selected prop; preserve editable source and batch palette by vertex colour.'])
 return record

def geometry(id):
 reset();floor='pavement' if id=='exterior' else ('dance-floor' if id=='dance-floor' else 'QuietFloor')
 box(floor,(8,-.08,0),(16,.15,16),'floor')
 wall={'exterior':'frontage','bar':'neon-accents','dance-floor':'dj-booth','stage-vip':'stage-backdrop'}[id];box(wall,(8,3,-4.7),(16,6,.35),'wall')
 if id=='exterior':
  for x in [1,10.8]:box('frontage',(x,2.8,-4.5),(.4,5.6,.5),'metal')
  box('club-sign',(6,2.2,-4.5),(9.4,1.3,.15),'metal')
  for y in [1.55,2.85]:box('club-sign',(6,y,-4.36),(9.5,.07,.08),'cyan',True)
  box('neon-doorway',(14,1.45,-4.4),(2.4,2.9,.3),'metal')
  for x in [12.7,15.3]:box('neon-doorway',(x,1.45,-4.2),(.10,2.9,.10),'pink',True)
  box('neon-doorway',(14,2.9,-4.2),(2.7,.10,.1),'pink',True);box('light-spill',(14,.01,-2.6),(3.3,.008,3.6),'#513c52')
  for x in [1.5,4.5,7.5]:box('queue-barriers',(x,.6,-3.8),(.12,1.2,.12),'metal')
  box('queue-barriers',(4.5,.85,-3.8),(6,.08,.08),'gold')
  for x,c in [(2.4,'red'),(5,'blue'),(7.6,'violet')]:box('event-posters',(x,1.0,-4.5),(1.5,1.4,.08),c)
 elif id=='bar':
  box('long-counter',(5.7,.72,-4.9),(10.4,1.44,1.25),'wood');box('long-counter',(5.7,1.5,-4.9),(10.7,.15,1.4),'metal')
  for x in [1.3,3.5,5.7,7.9,10.1]:box('long-counter',(x,.75,-4.24),(.07,1.3,.03),'gold')
  for y in [1.75,2.4]:
   box('bottle-shelves',(5.8,y,-4.4),(10,.12,.6),'wood')
   for i in range(16):
    x=1.2+i*.61;c=['cyan','red','gold','white'][i%4];cylinder('bottle-shelves',(x,y+.28,-4.2),.09,.45,c);cylinder('bottle-shelves',(x,y+.55,-4.2),.035,.14,c)
  for x in [11.8,14.8]:box('warm-light',(x,2.5,-4.3),(.28,1.0,.2),'gold',True);box('booth-backing',(x,.9,-4.45),(1.7,1.8,.25),'red')
  box('neon-accents',(5.8,2.9,-4.3),(10.5,.06,.1),'pink',True)
 elif id=='dance-floor':
  for x in [4,8,12]:
   for z in [-2,0,2]:box('dance-floor',(x,.005,z),(2.8,.008,1.7),'#403c48')
  box('dj-booth',(8,.8,-4.7),(4,1.6,1.2),'metal');box('dj-booth',(8,.8,-4.08),(3.6,.08,.05),'cyan',True)
  for x in [7,9]:cylinder('dj-booth',(x,1.65,-4.6),.45,.08,'white')
  for x in [2.8,13.2]:
   box('large-speakers',(x,1.4,-4.8),(1.5,2.8,1.25),'metal')
   for y in [.7,1.9]:cylinder('large-speakers',(x,y,-4.12),.49,.12,'violet',True)
  box('overhead-fixtures',(8,3.0,-4.6),(13,.2,.35),'metal')
  for x,c in [(3,'pink'),(6,'cyan'),(10,'violet'),(13,'gold')]:box('overhead-fixtures',(x,2.65,-4.5),(.5,.6,.6),'metal');box('overhead-fixtures',(x,2.4,-4.18),(.4,.12,.1),c,True)
  for x,c in [(4,'#49374a'),(8,'#34484d'),(12,'#443c50')]:box('coloured-light-pools',(x,.019,-1.4),(2.8,.008,1.4),c)
 else:
  box('stage-backdrop',(8,.3,-4.9),(8,.6,2.1),'metal')
  for x in [.6,1,1.4,1.8,2.2,13.8,14.2,14.6,15,15.4]:box('curtains',(x,2.5,-4.35),(.45,5,.55),'red')
  box('club-branding',(8,2.4,-4.5),(9.5,1.4,.1),'metal')
  for x in [3.3,12.7]:box('club-branding',(x,2.4,-4.35),(.08,1.5,.08),'gold',True)
  for x in [5,11]:box('dramatic-light',(x,3.0,-4.3),(.5,.4,.5),'gold',True)
  box('dramatic-light',(8,.62,-4.8),(7.6,.01,1.7),'#69533d')
 return save_export(OUT/id,'room')

def labels(id):
 if id=='exterior':return [('Brand','BONDI BEACH',(6,2.2,-4.25),'cyan',55),('Posters','LIVE / LOUD',(5,1.0,-4.35),'white',25),('Entrance','BAR >',(14,1.8,-4.05),'gold',34)]
 if id=='bar':return [('Bar','LAST ORDERS',(5.8,2.55,-4.15),'pink',48),('Exit','DANCE >',(14.4,2.4,-4.1),'cyan',26)]
 if id=='dance-floor':return [('DJ','NV',(8,.95,-4.03),'cyan',48),('Exit','STAGE >',(14.5,2.6,-4.5),'gold',26)]
 return [('Brand','BONDI BEACH',(8,2.4,-4.2),'gold',52),('VIP','VIP',(12,2.1,-4.3),'white',30)]

def scene(id):
 target=ROOT/f'scenes/art/rooms/{id}.tscn';target.parent.mkdir(parents=True,exist_ok=True)
 furniture=[]
 if id=='bar':furniture=[('stools','stool',x,-3.75,1) for x in [2,5,8]]+[('booths','sofa',x,-4.6,1.1) for x in [12,14.6]]
 if id=='stage-vip':furniture=[('vip-seating','sofa',x,-4.5,1.1) for x in [3.8,12.2]]
 kinds=sorted({p[1] for p in furniture});lines=[f'[gd_scene load_steps={2+len(kinds)} format=3]',f'[ext_resource type="PackedScene" path="res://assets/rooms/{id}/runtime/room.glb" id="geometry"]']
 for kind in kinds:lines.append(f'[ext_resource type="PackedScene" path="res://assets/rooms/shared/runtime/{kind}.glb" id="{kind}"]')
 lines+=['[node name="Room" type="Node3D"]','[node name="Geometry" parent="." instance=ExtResource("geometry")]']
 for name in dict.fromkeys(p[0] for p in furniture):lines.append(f'[node name="{name}" type="Node3D" parent="."]')
 for i,(name,kind,x,z,scale) in enumerate(furniture):lines += [f'[node name="Prop{i}" parent="{name}" instance=ExtResource("{kind}")]',f'position = Vector3({x},0,{z})',f'scale = Vector3({scale},{scale},{scale})']
 for name,text,at,color,size in labels(id):
  rgb=COLORS[color].lstrip('#');rgb=[int(rgb[i:i+2],16)/255 for i in (0,2,4)]
  lines += [f'[node name="{name}Lettering" type="Label3D" parent="."]',f'position = Vector3({at[0]},{at[1]},{at[2]})',f'text = "{text}"',f'font_size = {size}','pixel_size = 0.009',f'modulate = Color({rgb[0]},{rgb[1]},{rgb[2]},1)','outline_size = 8','shaded = false','no_depth_test = false']
 target.write_text('\n'.join(lines)+'\n');return target,kinds

def main():
 shared=OUT/'shared';shared.mkdir(parents=True,exist_ok=True)
 (shared/'opaque.tres').write_text('[gd_resource type="StandardMaterial3D" format=3]\n[resource]\nresource_name = "VenueOpaque"\nvertex_color_use_as_albedo = true\nroughness = 0.8\n')
 (shared/'glow.tres').write_text('[gd_resource type="StandardMaterial3D" format=3]\n[resource]\nresource_name = "VenueGlow"\nvertex_color_use_as_albedo = true\nroughness = 0.8\nshading_mode = 0\n')
 records=[shared_prop('stool','Models/GLTF format/stoolBar.glb'),shared_prop('sofa','Models/GLTF format/loungeSofa.glb')]
 resources=json.loads((ROOT/'content/resources.json').read_text());art=resources.setdefault('art',{})
 def register(id,path,sources,deps):art[id]={'path':str(path.relative_to(ROOT)),'sha256':sha(path),'sourceRecordIds':sources,'dependencyIds':deps}
 register('room.palette',shared/'opaque.tres',['venue-original'],[]);register('room.glow',shared/'glow.tres',['venue-original'],[])
 for r in records:register(r['id'],ROOT/r['runtimePath'],r['sourceRecordIds'],['room.palette'])
 room_defs=[]
 for id,(area,cues) in ROOMS.items():
  record=geometry(id);record.update(id='room.'+id+'.geometry',status='production',sourceRecordIds=['venue-original'],adaptations=['Original approved room direction; batch opaque and static glow geometry by landmark; no gameplay nodes.']);records.append(record)
  register(record['id'],ROOT/record['runtimePath'],record['sourceRecordIds'],['room.palette','room.glow'])
  target,kinds=scene(id);deps=[record['id']]+['room.prop.'+kind for kind in kinds];sources=['venue-original']+(['kenney-furniture'] if kinds else [])
  register('room.'+id,target,sources,deps)
  room_defs.append({'areaId':area,'visualId':id,'sceneResourceId':'room.'+id,'sourceRecordIds':sources,'requiredLandmarks':cues,'dependencyIds':deps,'decorationBounds':{'minX':0,'maxX':16,'minDepth':-6.4,'maxDepth':-3.1},'coverageBounds':{'minX':0,'maxX':16,'minDepth':-8,'maxDepth':8},'exitLandmark':None if id=='stage-vip' else ('EntranceLettering' if id=='exterior' else 'ExitLettering'),'reviewSubjectId':id})
 doc={'schemaVersion':1,'sources':[{'id':s,'status':'accepted'} for s in ['venue-original','kenney-furniture']],'rooms':room_defs,'coverage':{'connectors':[[16,18],[34,36],[52,54]],'backing':{'minX':-35,'maxX':105,'minDepth':-32,'maxDepth':32,'wallHeight':12,'wallDepth':-4.7}}}
 (ROOT/'content/rooms.json').write_text(json.dumps(doc,indent=2)+'\n');(ROOT/'content/resources.json').write_text(json.dumps(resources,indent=2)+'\n')
 provenance=json.loads((ROOT/'content/art-provenance.json').read_text())
 provenance['sources']=[s for s in provenance['sources'] if s['id']!='venue-original']+[{'id':'venue-original','name':'Original rock venue room geometry, signs and palettes','creator':'Project artwork authored by Codex at owner request','originalAuthorDeclaration':'Original venue structures, signs and palette/batching authored from the owner-approved four-room concepts; Kenney furniture remains separately attributed.','licenseId':'LicenseRef-Project-Original','sourcePath':'scripts/art/build_venue.py','sourceSha256':sha(Path(__file__)),'status':'accepted','reviewer':'Codex source inspection; owner concept directions already approved','reviewDate':'2026-10-15'}]
 provenance['runtimeAssets']=[r for r in provenance['runtimeAssets'] if not str(r.get('id','')).startswith('room.')]+records
 (ROOT/'content/art-provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
if __name__=='__main__':main()
