"""Explicit editable-source/GLB room + selected Kenney prop import proof.

Development-only fixture. Manual checks: feature 010 validation/procedures.md.
Never writes final rooms, heroes, supplier inputs or the motion pilot skins.
"""
import hashlib
import json
import zipfile
from pathlib import Path
import bpy
from mathutils import Vector

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'tests/godot/fixtures/art/representative-room'
bpy.ops.wm.read_factory_settings(use_empty=True)
(OUT/'source').mkdir(parents=True,exist_ok=True)
(OUT/'runtime').mkdir(exist_ok=True)

def material(name,color):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    shader=m.node_tree.nodes['Principled BSDF']
    shader.inputs['Base Color'].default_value=(*color,1)
    shader.inputs['Roughness'].default_value=.8
    return m

def box(name,at,size,color):
    bpy.ops.mesh.primitive_cube_add(size=1,location=at)
    obj=bpy.context.object
    obj.name=name
    obj.scale=size
    obj.data.materials.append(material(name,color))
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)

# Blender +z up/-y forward matches runtime y up/+z forward after explicit export.
box('Floor',(6,0,-.1),(24,10,.15),(.058,.051,.077))
box('BackWall',(6,4,2),(24,.3,4),(.021,.016,.038))
box('LongCounter',(7,3.7,.75),(5,1,1.5),(.119,.048,.070))
member='Models/GLTF format/stoolBar.glb'
archive=ROOT/'assets/art-sources/kenney-furniture/archive.zip'
selected=OUT/'source/stoolBar.glb'
selected.write_bytes(zipfile.ZipFile(archive).read(member))
for x in [5.5,7.5,9.0]:
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(selected))
    imported=set(bpy.data.objects)-before
    for obj in imported:
        if obj.parent not in imported:
            obj.location+=Vector((x,3.15,0))
            obj.scale*=1.2
bpy.context.view_layer.update()
source=OUT/'source/room.blend'
bpy.ops.wm.save_as_mainfile(filepath=str(source))
# One opaque palette surface for this whole room, including reused stools.
bpy.ops.object.select_all(action='DESELECT')
meshes=[o for o in bpy.data.objects if o.type=='MESH']
for obj in meshes:obj.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.object.join()
mesh=bpy.context.object
mesh.name='RepresentativeRoomGeometry'
colours=mesh.data.color_attributes.new(name='RoomColor',type='FLOAT_COLOR',domain='CORNER')
for face in mesh.data.polygons:
    m=mesh.data.materials[face.material_index]
    color=m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value
    for loop in face.loop_indices:colours.data[loop].color=color
palette=material('RepresentativeRoomPalette',(1,1,1))
node=palette.node_tree.nodes.new('ShaderNodeVertexColor')
node.layer_name='RoomColor'
palette.node_tree.links.new(node.outputs['Color'],palette.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
mesh.data.materials.clear()
mesh.data.materials.append(palette)
for face in mesh.data.polygons:face.material_index=0
bpy.ops.object.select_all(action='SELECT')
runtime=OUT/'runtime/room.glb'
bpy.ops.export_scene.gltf(filepath=str(runtime),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
record={'id':'representative.room','status':'prototype','sourceRecordIds':['kenney-furniture','representative-room-original'],'sourcePath':str(source.relative_to(ROOT)),'sourceSha256':sha(source),'runtimePath':str(runtime.relative_to(ROOT)),'runtimeSha256':sha(runtime),'exporter':bpy.app.version_string,'selectedSource':{'path':member,'sha256':sha(selected)},'adaptations':['Original floor, wall, counter and palette; imported three selected Kenney stools; one opaque vertex-colour surface.'],'originalAuthorDeclaration':'Fixture geometry and batching authored by Codex at owner request; Kenney stools remain separately attributed.'}
for key,path in [('importSettings',OUT/'runtime/room.glb.import'),('palette',OUT/'palette.tres')]:
    if path.exists():record[key]={'path':str(path.relative_to(ROOT)),'sha256':sha(path)}
(OUT/'record.json').write_text(json.dumps(record,indent=2)+'\n')
