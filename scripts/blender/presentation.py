"""Lighting and camera setup for character preview scenes."""
import bpy
from mathutils import Vector

def collection(name):
    col=bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col

def put(obj,col):
    for current in list(obj.users_collection): current.objects.unlink(obj)
    col.objects.link(obj)

def camera(name,location,target,scale,col):
    data=bpy.data.cameras.new(name)
    obj=bpy.data.objects.new(name,data); col.objects.link(obj)
    obj.location=location
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
    data.type='ORTHO';data.ortho_scale=scale;data.lens=50
    return obj

def light(name,location,power,color,size,col):
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);col.objects.link(obj);obj.location=location
    obj.rotation_euler=(Vector((0,0,1))-obj.location).to_track_quat('-Z','Y').to_euler()
    return obj

def setup(duo=False):
    scene=bpy.context.scene
    scene.render.engine='CYCLES'
    scene.cycles.device='CPU';scene.cycles.samples=64;scene.cycles.seed=0
    scene.cycles.use_denoising=True
    scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB'
    scene.view_settings.view_transform='AgX'
    world=bpy.data.worlds.new('Presentation.World');scene.world=world;world.use_nodes=True
    world.node_tree.nodes['Background'].inputs['Color'].default_value=(.20,.19,.25,1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value=.45
    bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.02))
    ground=bpy.context.object;ground.name='Presentation.Ground'
    gcol=collection('Presentation.Ground')
    put(ground,gcol)
    mat=bpy.data.materials.new('Presentation.Material.Ground');mat.diffuse_color=(.12,.11,.15,1);ground.data.materials.append(mat)
    cameras=collection('Presentation.Cameras')
    neutral=collection('Presentation.Lights.Neutral')
    light('Light.Key',(-3,-4,6),700,(1,.88,.77),4,neutral)
    light('Light.Fill',(4,-2,4),450,(.72,.80,1),3,neutral)
    light('Light.Rim',(0,3,5),600,(1,1,1),3,neutral)
    if duo:
        camera('Camera.Duo',(0,-8,3.2),(0,0,1),5.7,cameras)
        neon=collection('Presentation.Lights.Neon')
        light('Light.Neon.Magenta',(-3,-2,4),850,(1,.14,.48),3,neon)
        light('Light.Neon.Cyan',(3,-1,4),750,(.12,.80,1),3,neon)
        light('Light.Neon.Rim',(0,3,5),650,(.87,.54,1),3,neon)
        scene.camera=bpy.data.objects['Camera.Duo']
    else:
        for name,loc in (('front',(0,-6,2.4)),('side',(6,0,2.4)),('back',(0,6,2.4)),('three-quarter',(4,-6,2.5))):
            camera(f'Camera.{name}',loc,(0,0,1.06),3.3,cameras)
        scene.camera=bpy.data.objects['Camera.three-quarter']
    scene.render.resolution_x=1600 if duo else 1024
    scene.render.resolution_y=1000 if duo else 1024
    scene.render.resolution_percentage=100
