"""Render previews from saved Blender scenes."""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

VIEWS = ('front', 'side', 'back', 'three-quarter')
TARGETS = tuple(f'previews/{role}-{view}.png' for role in ('cow', 'crow') for view in VIEWS) + ('previews/duo-neutral.png', 'previews/duo-neon.png')
PORTRAIT_SIZE = 512

def portrait_jobs():
    return [('cow.blend', 'cow.png'), ('crow.blend', 'crow.png')]

def preflight(out, smoke=False, overwrite=False, only=None, portraits=False, character=None):
    out = Path(out)
    if out.exists() and not out.is_dir():
        raise NotADirectoryError(out)
    if portraits:
        if character is not None and character not in ('cow','crow','lion','plates'): raise ValueError(f'Unknown character ID: {character}')
        targets = ('portrait.png',) if character in ('lion','plates') else tuple(f'portraits/{name}' for source, name in portrait_jobs() if (character or only) is None or source.startswith(f'{character or only}.'))
    else:
        targets = ('smoke/duo-neutral.png',) if smoke else tuple(t for t in TARGETS if only is None or (only=='duo' and t.startswith('previews/duo-')) or t.startswith(f'previews/{only}-'))
    existing = [str(out/name) for name in targets if (out/name).exists()]
    if existing and not overwrite:
        raise FileExistsError('Existing renders; use --overwrite: ' + ', '.join(existing))
    return out

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--smoke', action='store_true')
    parser.add_argument('--portraits', action='store_true', help='render fixed 512px head-and-shoulders portraits')
    parser.add_argument('--only', choices=('cow','crow','duo'), help='render one character or the duo')
    parser.add_argument('--character', choices=('cow','crow','lion','plates'), help='render the named character portrait')
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args(argv)
    import bpy
    from scripts.blender.generate import require_supported
    require_supported(bpy.app.version)
    if args.smoke and args.only:
        parser.error('--smoke and --only cannot be combined')
    if args.smoke and args.portraits:
        parser.error('--smoke and --portraits cannot be combined')
    if args.character and args.only:
        parser.error('--character and --only cannot be combined')
    if args.portraits and args.only == 'duo':
        parser.error('--portraits cannot render duo')
    preflight(args.output_dir, args.smoke, args.overwrite, args.only, args.portraits, args.character)
    if args.portraits:
        from mathutils import Vector
        if args.character in ('lion','plates'):
            source = args.output_dir/'source.blend'
            bpy.ops.wm.open_mainfile(filepath=str(source.resolve()))
            scene = bpy.context.scene
            camera = bpy.data.objects['Camera.front'].copy(); camera.data = bpy.data.objects['Camera.front'].data.copy()
            scene.collection.objects.link(camera); camera.name = 'Camera.Portrait'
            camera.location = Vector((0, -6, 1.25 if args.character == 'plates' else 1.55))
            target_z = 1.15 if args.character == 'plates' else 1.55
            camera.rotation_euler = (Vector((0, 0, target_z)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
            camera.data.type = 'ORTHO'; camera.data.ortho_scale = 2.5; scene.camera = camera
            scene.cycles.samples = 64; scene.cycles.seed = 0; scene.cycles.use_animated_seed = False
            scene.render.resolution_x = PORTRAIT_SIZE; scene.render.resolution_y = PORTRAIT_SIZE
            scene.render.resolution_percentage = 100; scene.render.filepath = str((args.output_dir/'portrait.png').resolve())
            bpy.ops.render.render(write_still=True)
            return 0
        target_dir = args.output_dir / 'portraits'
        target_dir.mkdir(parents=True, exist_ok=True)
        jobs = portrait_jobs()
        if args.character in ('cow','crow'): jobs = [(f'{args.character}.blend', f'{args.character}.png')]
        for source, filename in jobs:
            if (args.only or args.character) and not source.startswith(f'{args.character or args.only}.'):
                continue
            bpy.ops.wm.open_mainfile(filepath=str((args.output_dir / source).resolve()))
            scene = bpy.context.scene
            camera = bpy.data.objects['Camera.front'].copy()
            camera.data = bpy.data.objects['Camera.front'].data.copy()
            scene.collection.objects.link(camera)
            camera.name = 'Camera.Portrait'
            camera.location = Vector((0, -6, 1.65))
            direction = Vector((0, 0, 1.65)) - camera.location
            camera.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
            camera.data.type = 'ORTHO'
            camera.data.ortho_scale = 2.3
            scene.camera = camera
            scene.cycles.samples = 64
            scene.cycles.seed = 0
            scene.cycles.use_animated_seed = False
            scene.render.resolution_x = PORTRAIT_SIZE
            scene.render.resolution_y = PORTRAIT_SIZE
            scene.render.resolution_percentage = 100
            scene.render.filepath = str((target_dir / filename).resolve())
            bpy.ops.render.render(write_still=True)
        return 0
    jobs=[('comparison.blend','duo-neutral.png','Camera.Duo','neutral')] if args.smoke else [(f'{role}.blend',f'{role}-{view}.png',f'Camera.{view}','neutral') for role in ('cow','crow') for view in VIEWS]+[('comparison.blend','duo-neutral.png','Camera.Duo','neutral'),('comparison.blend','duo-neon.png','Camera.Duo','neon')]
    if args.only:
        jobs=[job for job in jobs if (args.only=='duo' and job[1].startswith('duo-')) or job[1].startswith(args.only+'-')]
    target_dir=args.output_dir/('smoke' if args.smoke else 'previews')
    target_dir.mkdir(parents=True,exist_ok=True)
    current=None
    for source, filename, camera, lighting in jobs:
        if source!=current:
            bpy.ops.wm.open_mainfile(filepath=str((args.output_dir/source).resolve()))
            current=source
        scene=bpy.context.scene
        scene.camera=bpy.data.objects[camera]
        if 'Presentation.Lights.Neon' in bpy.data.collections:
            for col_name,enabled in (('Presentation.Lights.Neutral',lighting=='neutral'),('Presentation.Lights.Neon',lighting=='neon')):
                for obj in bpy.data.collections[col_name].objects: obj.hide_render=not enabled
        scene.cycles.samples=8 if args.smoke else 64
        if args.smoke: scene.render.resolution_x=128;scene.render.resolution_y=128
        else:
            scene.render.resolution_x=1600 if source=='comparison.blend' else 1024
            scene.render.resolution_y=1000 if source=='comparison.blend' else 1024
        scene.render.filepath=str((target_dir/filename).resolve())
        bpy.ops.render.render(write_still=True)
    return 0

if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
