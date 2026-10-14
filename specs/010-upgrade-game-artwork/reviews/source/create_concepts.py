"""Author review-only 3D blockouts; not shipping rooms, rigs or animation evidence.

Run with Blender --background --factory-startup --python-exit-code 1 --python <this file>.
Manual acceptance procedure: ../../validation/procedures.md, defined before production.
"""
import bpy
import json
import math
import zipfile
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'specs/010-upgrade-game-artwork/reviews/concepts'
OUT.mkdir(parents=True, exist_ok=True)
PALETTE = {
    'wall': '#292335', 'floor': '#494456', 'metal': '#171a24', 'wood': '#754744',
    'pink': '#f94e9a', 'cyan': '#53d4eb', 'gold': '#edc16a', 'skin': '#c88666',
    'white': '#eee8dc', 'violet': '#7761aa', 'red': '#a53050', 'blue': '#314d76',
}
MATERIALS = {}

def mat(name, emission=False):
    key = (name, emission)
    if key in MATERIALS:
        return MATERIALS[key]
    m = bpy.data.materials.new(name + ('-emissive' if emission else ''))
    c = PALETTE.get(name, name).lstrip('#')
    rgb = tuple((int(c[i:i+2], 16) / 255) ** 2.2 for i in (0, 2, 4))
    m.diffuse_color = (*rgb, 1)
    m.use_nodes = True
    shader = m.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*rgb, 1)
    shader.inputs['Roughness'].default_value = .8
    if emission:
        shader.inputs['Emission Color'].default_value = (*rgb, 1)
        shader.inputs['Emission Strength'].default_value = 1
    MATERIALS[key] = m
    return m

def cube(name, at, size, color, emission=False):
    bpy.ops.mesh.primitive_cube_add(size=1, location=at)
    obj = bpy.context.object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat(color, emission))
    return obj

def sphere(name, at, scale, color):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, location=at)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    obj.data.materials.append(mat(color))
    return obj

def text(name, body, at, size, color, rotation=(math.pi / 2, 0, 0)):
    curve = bpy.data.curves.new(name, 'FONT')
    curve.body = body
    curve.align_x = 'CENTER'
    curve.size = size
    curve.extrude = .008
    obj = bpy.data.objects.new(name, curve)
    bpy.context.collection.objects.link(obj)
    obj.location = at
    obj.rotation_euler = rotation
    obj.data.materials.append(mat(color, True))
    return obj

def prop(name, member, x, y, scale=1):
    archive = ROOT / 'assets/art-sources/kenney-furniture/archive.zip'
    target = OUT / 'source-inputs' / Path(member).name
    target.parent.mkdir(exist_ok=True)
    target.write_bytes(zipfile.ZipFile(archive).read(member))
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(target))
    imported = set(bpy.data.objects) - before
    roots = [o for o in imported if o.parent not in imported]
    for obj in roots:
        obj.name = name + '-' + obj.name
        obj.location += Vector((x, y, 0))
        obj.scale *= scale

def hero(character, x):
    path = {'cow': 'cow-crow/runtime/cow.glb', 'crow': 'cow-crow/runtime/crow.glb',
            'lion': 'lion/runtime/character.glb', 'plates': 'plates/runtime/character.glb'}[character]
    before = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(ROOT / 'assets/characters' / path))
    imported = set(bpy.data.objects) - before
    root = bpy.data.objects.new('Reference-' + character, None)
    bpy.context.collection.objects.link(root)
    for obj in imported:
        if obj.parent not in imported:
            obj.parent = root
    root.location = (x, -.5, 0)
    # Match the unchanged presentation's general hero size; not a runtime-envelope change.
    root.scale = (1.25, 1.25, 1.25)
    root.rotation_euler.z = math.pi / 2

def hud(camera):
    # Projection guide uses current 844x390 control positions. It is concept geometry,
    # not a screenshot or a claim about real UI integration.
    half_h = 4.21011058451817
    half_w = half_h * 844 / 390
    def label(body, px, py, size=.23):
        o = text('HUD-guide-' + body, body, (0, 0, 0), size, 'gold', (0, 0, 0))
        o.parent = camera
        o.location = ((px / 844 * 2 - 1) * half_w, (1 - py / 390 * 2) * half_h, -8)
    label('HERO REFERENCES   |   CONCEPT / NOT GAMEPLAY', 300, 23)
    for body, px, py in [('PAUSE',800,32),('MOVE',72,319),('LIGHT',692,292),
                         ('HEAVY',805,293),('DODGE',745,350),('SPECIAL',748,230)]:
        label(body,px,py,.24)

def scene(subject, heroes):
    s = bpy.data.scenes.new(subject)
    bpy.context.window.scene = s
    s.render.engine = 'CYCLES'
    s.cycles.samples = 16
    s.render.resolution_x = 844
    s.render.resolution_y = 390
    s.render.resolution_percentage = 100
    s.world = bpy.data.worlds.new(subject + '-world')
    s.world.use_nodes = True
    s.world.node_tree.nodes['Background'].inputs['Color'].default_value = (.24, .24, .28, 1)
    s.world.node_tree.nodes['Background'].inputs['Strength'].default_value = .8
    s.view_settings.view_transform = 'Standard'
    cube('Quiet-combat-floor', (0, 0, -.12), (20, 8, .2), 'floor')
    bpy.ops.object.light_add(type='AREA', location=(-2, -4, 10))
    light = bpy.context.object
    light.data.energy = 1700
    light.data.shape = 'DISK'
    light.data.size = 8
    light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat('-Z', 'Y').to_euler()
    bpy.ops.object.camera_add(location=(0, -12, 9.55))
    camera = bpy.context.object
    camera.rotation_euler = (Vector((0, 0, 1.55)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera.data.type = 'ORTHO'
    camera.data.ortho_scale = 2 * 4.21011058451817 * 844 / 390
    s.camera = camera
    hud(camera)
    for character, x in heroes:
        hero(character,x)
    return s

def venue(subject):
    cube('Volumetric-back-wall', (0, 4.5, 2), (20, .45, 4), 'wall')
    if subject == 'exterior':
        for x in [-7, -2]:
            cube('Frontage-column', (x, 4.1, 2), (.5, .8, 4), 'metal')
        cube('Door-recess', (6, 4.05, 1.4), (2.6, .6, 2.8), 'metal')
        for x in [4.5,7.5]: cube('Neon-door-jamb', (x, 3.68, 1.5), (.08,.08,3), 'pink',True)
        cube('Neon-door-lintel', (6,3.68,3), (3,.08,.08), 'pink',True)
        text('Club-sign','BONDI BEACH',(-1,3.4,2.55),.62,'cyan')
        for x in [-5,-3]:
            cube('Event-poster', (x,3.95,1.7), (1.1,.08,1.3),'red')
            text('Poster-lettering','LIVE',(x,3.86,1.7),.28,'gold')
        for x in [-6,-4,-2]: cube('Queue-post', (x,3.5,.6),(.1,.1,1.2),'metal')
        cube('Queue-rail',(-4,3.5,.95),(4,.12,.12),'gold')
        cube('Pavement-curb',(0,3.4,.06),(20,.35,.12),'white')
    elif subject == 'bar':
        cube('Long-bar-counter', (-2,4.6,.8),(10,1.25,1.6),'wood')
        cube('Counter-top',(-2,4.6,1.65),(10.3,1.35,.12),'metal')
        for x in [-5,-3,-1,1]:
            prop('Counter','Models/GLTF format/kitchenBar.glb',x,4.6,1.6)
            prop('Stool','Models/GLTF format/stoolBar.glb',x,3.5,1.3)
        for height in [1.8,2.6]:
            cube('Bottle-shelf',(-2,4, height),(9,.5,.12),'wood')
            for i in range(14): cube('Bottle',(-6+i*.58,3.8,height+.3),(.15,.15,.5),['cyan','red','gold'][i%3])
        prop('Booth','Models/GLTF format/loungeSofa.glb',5,3.4,1.5)
        text('Neon-bar-sign','LAST ORDERS',(5,3.85,3),.42,'pink')
        for x,y in [(-4,2),(2,-2)]:cube('Simulation-table-reference',(x,y,.6),(1.3,1.3,.12),'red')
    elif subject == 'dance-floor':
        cube('DJ-booth',(0,3.7,.7),(4,1.2,1.4),'metal')
        text('DJ-sign','NV',(0,3.01,.7),.65,'cyan')
        for x in [-4,4]:
            cube('Speaker-stack',(x,3.7,1.25),(1.4,1,2.5),'metal')
            for z in [.6,1.7]:sphere('Speaker-driver',(x,3.15,z),(.45,.08,.45),'violet')
        cube('Overhead-truss',(0,3.9,3.4),(13,.3,.2),'metal')
        for x in [-5,-2,2,5]:cube('Overhead-fixture',(x,3.5,3.2),(.5,.5,.4),'pink')
        for x,c in [(-4,'pink'),(0,'cyan'),(4,'violet')]:cube('Static-light-pool',(x,2.8,.01),(2,1.4,.015),c)
    else:
        for x in [-6,6]:
            for i in range(6):cube('Curtain-fold',(x+i*.22,3.8,1.7),(.3,.6,3.4),'red')
        cube('Decorative-stage',(0,4,.3),(9,1.5,.6),'metal')
        text('Stage-branding','BONDI BEACH',(0,3.75,2.2),.6,'gold')
        for x in [-7.5,6.7]:prop('VIP-seat','Models/GLTF format/loungeSofa.glb',x,3.3,1.3)
        cube('Stage-canopy',(0,4,3.7),(12,.5,.2),'wood')

def enemy(role):
    wide={'grunt':.43,'zoner':.4,'enforcer':.65,'liam':.79}[role]
    height={'grunt':2.1,'zoner':2.15,'enforcer':2.6,'liam':2.95}[role]
    c={'grunt':'red','zoner':'white','enforcer':'blue','liam':'metal'}[role]
    for x in [-wide*.45,wide*.45]:
        cube('Boot',(x,0,.15),(.35,.55,.3),'metal')
        cube('Trouser-leg',(x,.05,.65),(.32,.35,1),'metal')
    sphere('Jacket-torso',(0,0,height*.57),(wide,.35,height*.26),c)
    for x in [-wide-.12,wide+.12]:sphere('Arm',(x,0,height*.55),(.18,.22,height*.23),c)
    sphere('Head',(0,0,height*.88),(.31,.29,.38),'skin')
    for x in [-.1,.1]:sphere('Eye',(x,-.28,height*.91),(.035,.025,.04),'metal')
    if role=='grunt':
        for z in [height+.02,height+.15]:cube('Mohawk',(0,0,z),(.14,.45,.2),'pink')
        cube('Torn-vest-front',(0,-.31,height*.58),(.5,.08,.8),'metal')
    elif role=='zoner':
        cube('Apron',(0,-.34,1.08),(.66,.07,1),'metal')
        cube('Bow-tie',(0,-.37,1.65),(.26,.1,.12),'red')
        cube('Bottle-in-hand',(.57,-.15,1.25),(.15,.15,.5),'cyan')
    elif role=='enforcer':
        cube('Security-vest',(0,-.3,1.5),(1.1,.15,.8),'metal')
        text('Vest-badge','SEC',(0,-.4,1.5),.18,'white')
        cube('Crew-cut',(0,0,height+.07),(.62,.48,.18),'metal')
    else:
        for x in [-.78,.78]:sphere('Oversized-coat-shoulder',(x,0,2.12),(.4,.4,.4),'metal')
        for x in [-.22,.22]:cube('Cream-coat-lapel',(x,-.38,1.8),(.2,.08,.75),'gold')
        cube('Belt-buckle',(0,-.4,1.15),(.36,.1,.2),'gold')
        cube('Boss-hair',(0,.05,2.99),(.67,.52,.18),'white')
        cube('Coiled-rope-reference',(.96,-.1,1.15),(.24,.28,.65),'wood')

records=[]
for subject in ['exterior','bar','dance-floor','stage-vip','grunt','zoner','enforcer','liam']:
    is_room=subject in ['exterior','bar','dance-floor','stage-vip']
    references=[('cow',-1.6),('crow',1.6)] if subject in ['exterior','dance-floor','grunt','enforcer'] else [('lion',-3.2),('plates',3.2)]
    if not is_room:references=[(references[0][0],-4),(references[1][0],4)]
    s=scene(subject,references)
    if is_room:venue(subject)
    else:enemy(subject)
    s.render.filepath=str(OUT/(subject+'.png'))
    bpy.ops.render.render(write_still=True)
    records.append({'subject':subject,'stage':'concept','result':'pending','reviewer':None,'capture':str((OUT/(subject+'.png')).relative_to(ROOT)),'source':'reviews/source/create_concepts.py','notes':'Review-only 3D blockout with unchanged hero references and projected HUD guides; no runtime, rig/action or final art acceptance.'})
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'concepts.blend'))
(OUT/'records.json').write_text(json.dumps(records,indent=2)+'\n')
