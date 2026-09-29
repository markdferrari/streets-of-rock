"""Create the standalone car-seat headrest projectile prop."""
import argparse
import sys
from pathlib import Path
import bpy

ROOT = Path(__file__).resolve().parents[2]

def preflight(output, overwrite=False):
    output = Path(output)
    if output.exists() and not output.is_dir(): raise NotADirectoryError(output)
    targets = (output/'source.blend', output/'headrest.glb')
    existing = [str(path) for path in targets if path.exists()]
    if existing and not overwrite: raise FileExistsError('Headrest outputs exist; use --overwrite: '+', '.join(existing))
    return output

def create():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    fabric = bpy.data.materials.new('Headrest.Fabric'); fabric.diffuse_color = (.22,.075,.095,1)
    piping = bpy.data.materials.new('Headrest.Piping'); piping.diffuse_color = (.86,.48,.19,1)
    def cushion(name, location, scale, material):
        bpy.ops.mesh.primitive_cube_add(size=1, location=location)
        obj=bpy.context.object; obj.name=f'Headrest.{name}'; obj.scale=scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        obj.data.materials.append(material)
        bevel=obj.modifiers.new('Rounded upholstery','BEVEL'); bevel.width=.12; bevel.segments=4
        obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
        return obj
    cushion('Back',(0,0,.52),(1.0,.28,1.05),fabric)
    cushion('FrontPad',(0,-.14,.45),(.70,.10,.68),piping)
    cushion('Front',(0,-.20,.45),(.62,.11,.60),fabric)
    cushion('Post.L',(-.32,.13,-.03),(.14,.14,.45),piping)
    cushion('Post.R',(.32,.13,-.03),(.14,.14,.45),piping)
    return [obj for obj in scene.objects if obj.type == 'MESH']

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,required=True)
    parser.add_argument('--overwrite',action='store_true')
    args=parser.parse_args(argv)
    if tuple(bpy.app.version[:2]) != (5,2): raise RuntimeError('Blender 5.2.x required')
    preflight(args.output_dir,args.overwrite)
    args.output_dir.mkdir(parents=True,exist_ok=True)
    objects=create()
    bpy.context.preferences.filepaths.save_version=0
    bpy.ops.wm.save_as_mainfile(filepath=str((args.output_dir/'source.blend').resolve()),check_existing=False)
    bpy.ops.object.select_all(action='DESELECT')
    for obj in objects: obj.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.export_scene.gltf(filepath=str((args.output_dir/'headrest.glb').resolve()),export_format='GLB',use_selection=True,export_animations=False,export_cameras=False,export_lights=False,export_yup=True)
    return 0

if __name__=='__main__': main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
