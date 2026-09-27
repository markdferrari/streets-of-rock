"""Editable smooth cartoon character assemblies in metres, facing -Y."""
import math
import bpy
from mathutils import Vector

PALETTE = {
    'Cow': {'Fur':(0.87,0.81,0.68,1),'White':(0.94,0.91,0.83,1),'Spot':(.18,.16,.18,1),'Jacket':(.07,.055,.065,1),'LeatherEdge':(.19,.15,.17,1),'Muzzle':(.88,.56,.55,1),'Horn':(.90,.83,.62,1),'Boot':(.09,.07,.07,1),'Eye':(.055,.04,.045,1),'Iris':(.26,.16,.1,1),'Metal':(.64,.62,.53,1)},
    'Crow': {'Feather':(.045,.052,.09,1),'Wing':(.065,.078,.13,1),'FeatherEdge':(.12,.14,.22,1),'Jacket':(.39,.22,.12,1),'LeatherEdge':(.55,.34,.20,1),'Collar':(.90,.79,.58,1),'Beak':(.87,.56,.12,1),'Foot':(.32,.24,.16,1),'Eye':(.96,.91,.78,1),'Iris':(.09,.11,.17,1),'Metal':(.61,.56,.44,1)}
}

def material(role,key):
    name=f'{role}.Material.{key}'
    if name in bpy.data.materials: return bpy.data.materials[name]
    m=bpy.data.materials.new(name); m.use_nodes=True
    node=m.node_tree.nodes.get('Principled BSDF')
    node.inputs['Base Color'].default_value=PALETTE[role][key]
    node.inputs['Roughness'].default_value=.35 if key in ('Jacket','Metal') else .72
    node.inputs['Metallic'].default_value=.45 if key=='Metal' else 0
    m.diffuse_color=PALETTE[role][key]
    return m

def move_to_collection(obj, collection):
    for col in list(obj.users_collection): col.objects.unlink(obj)
    collection.objects.link(obj)

def ellipsoid(role,name,loc,scale,key,col,segments=16,rings=8):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,location=loc)
    obj=bpy.context.object; obj.name=f'{role}.{name}'
    obj.scale=scale
    obj.data.materials.append(material(role,key))
    for p in obj.data.polygons: p.use_smooth=True
    move_to_collection(obj,col)
    return obj

def cone(role,name,loc,radius,depth,key,col,vertices=12,rotation=(0,0,0)):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=radius,radius2=0,depth=depth,location=loc,rotation=rotation)
    obj=bpy.context.object; obj.name=f'{role}.{name}'
    obj.data.materials.append(material(role,key))
    bevel=obj.modifiers.new('Soft edges','BEVEL'); bevel.width=.025; bevel.segments=2
    obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
    move_to_collection(obj,col)
    return obj

def capsule_between(role,name,a,b,radius,key,col):
    a,b=Vector(a),Vector(b); mid=(a+b)/2; length=(b-a).length
    obj=ellipsoid(role,name,mid,(radius,radius,length/2+radius*.3),key,col)
    obj.rotation_mode='QUATERNION'; obj.rotation_quaternion=Vector((0,0,1)).rotation_difference(b-a)
    return obj

def start(role):
    col=bpy.data.collections.new(f'Character.{role}'); bpy.context.scene.collection.children.link(col)
    root=bpy.data.objects.new(f'{role}.Root',None); col.objects.link(root)
    return col,root

def cow():
    r='Cow'; c,root=start(r)
    ellipsoid(r,'Torso',(0,0,1.08),(.44,.31,.51),'White',c)
    ellipsoid(r,'Belly',(0,-.235,1.00),(.30,.11,.34),'Fur',c)
    ellipsoid(r,'Jacket',(0,.07,1.16),(.49,.34,.43),'Jacket',c)
    ellipsoid(r,'Jacket.Lapel.L',(-.19,-.29,1.34),(.11,.045,.24),'LeatherEdge',c)
    ellipsoid(r,'Jacket.Lapel.R',(.19,-.29,1.34),(.11,.045,.24),'LeatherEdge',c)
    ellipsoid(r,'Jacket.Zipper',(0,-.33,1.12),(.025,.018,.31),'Metal',c)
    ellipsoid(r,'Jacket.Pocket.L',(-.26,-.29,1.05),(.12,.03,.045),'LeatherEdge',c)
    ellipsoid(r,'Jacket.Pocket.R',(.26,-.29,1.05),(.12,.03,.045),'LeatherEdge',c)
    ellipsoid(r,'Neck',(0,0,1.55),(.20,.19,.20),'Fur',c)
    ellipsoid(r,'Head',(0,-.045,1.71),(.32,.27,.29),'White',c)
    ellipsoid(r,'Muzzle',(0,-.27,1.62),(.275,.19,.155),'Muzzle',c)
    for side,x in [('L',-.23),('R',.23)]:
        ellipsoid(r,f'Ear.{side}',(x*1.65,-.01,1.79),(.16,.075,.09),'Fur',c)
        cone(r,f'Horn.{side}',(x,0,1.96),.075,.25,'Horn',c)
        ellipsoid(r,f'Eye.{side}',(x*.55,-.284,1.75),(.08,.03,.095),'Eye',c)
        ellipsoid(r,f'Eye.Shine.{side}',(x*.55-.02,-.313,1.78),(.025,.012,.029),'White',c)
        ellipsoid(r,f'Nostril.{side}',(x*.42,-.445,1.66),(.033,.014,.025),'Spot',c)
        capsule_between(r,f'Arm.{side}',(x*1.95,0,1.37),(x*2.8,-.035,.93),.15,'Jacket',c)
        ellipsoid(r,f'Fist.{side}',(x*2.9,-.035,.85),(.15,.15,.16),'Fur',c)
        capsule_between(r,f'Leg.{side}',(x*.75,0,.74),(x*.75,0,.31),.19,'Spot',c)
        ellipsoid(r,f'Boot.{side}',(x*.82,-.10,.17),(.21,.31,.17),'Boot',c)
    ellipsoid(r,'Marking.L',(-.31,-.275,1.28),(.15,.03,.12),'Spot',c)
    ellipsoid(r,'Marking.R',(.25,-.25,.92),(.10,.03,.09),'Spot',c)
    return root

def crow():
    r='Crow'; c,root=start(r)
    ellipsoid(r,'Torso',(0,0,.88),(.26,.22,.37),'Feather',c)
    ellipsoid(r,'Jacket',(0,.025,.92),(.29,.245,.31),'Jacket',c)
    ellipsoid(r,'Jacket.Front',(0,-.218,.9),(.16,.025,.25),'LeatherEdge',c)
    ellipsoid(r,'Collar',(0,-.08,1.17),(.28,.22,.09),'Collar',c)
    ellipsoid(r,'Neck',(0,0,1.22),(.13,.13,.15),'Feather',c)
    ellipsoid(r,'Head',(0,-.035,1.38),(.245,.22,.23),'Feather',c)
    cone(r,'Beak',(0,-.30,1.38),.13,.35,'Beak',c,rotation=(math.pi/2,0,0))
    for side,x in [('L',-.19),('R',.19)]:
        ellipsoid(r,f'Eye.{side}',(x*.72,-.211,1.44),(.068,.027,.077),'Eye',c)
        ellipsoid(r,f'Iris.{side}',(x*.72,-.236,1.43),(.033,.012,.04),'Iris',c)
        ellipsoid(r,f'Brow.{side}',(x*.72,-.223,1.54),(.105,.025,.028),'FeatherEdge',c)
        capsule_between(r,f'Leg.{side}',(x*.7,0,.59),(x*.75,-.03,.25),.075,'Feather',c)
        ellipsoid(r,f'Foot.{side}',(x*.75,-.14,.095),(.12,.23,.075),'Foot',c)
        for finger in (-1,0,1):
            ellipsoid(r,f'Toe.{side}.{finger}',(x*.75+finger*.065,-.33,.075),(.04,.14,.035),'Foot',c)
        sign=-1 if side=='L' else 1
        ellipsoid(r,f'Jacket.Shoulder.{side}',(sign*.29,0,1.04),(.13,.15,.16),'Jacket',c)
        capsule_between(r,f'Wing.{side}',(sign*.31,0,1.08),(sign*.95,.015,1.28),.12,'Wing',c)
        # Layered feathers point outward and slightly down, leaving the main wing readable.
        for i in range(5):
            start_x=sign*(.48+i*.13)
            end_x=sign*(.60+i*.16)
            capsule_between(r,f'Wing.Feather.{side}.{i}',(start_x,-.02,1.12+i*.035),(end_x,-.075,.76+i*.04),.067,'FeatherEdge' if i%2 else 'Wing',c)
    for i in range(3):
        cone(r,f'Crest.{i}',((i-1)*.07,.09,1.58),.06,.15,'Feather',c)
    return root
