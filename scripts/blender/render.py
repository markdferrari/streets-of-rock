"""Render previews from saved Blender scenes."""
import argparse
import sys
from pathlib import Path

VIEWS = ('front', 'side', 'back', 'three-quarter')
TARGETS = tuple(f'previews/{role}-{view}.png' for role in ('cow', 'crow') for view in VIEWS) + ('previews/duo-neutral.png', 'previews/duo-neon.png')

def preflight(out, smoke=False, overwrite=False):
    out = Path(out)
    if out.exists() and not out.is_dir():
        raise NotADirectoryError(out)
    targets = ('smoke/duo-neutral.png',) if smoke else TARGETS
    existing = [str(out/name) for name in targets if (out/name).exists()]
    if existing and not overwrite:
        raise FileExistsError('Existing renders; use --overwrite: ' + ', '.join(existing))
    return out

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--smoke', action='store_true')
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args(argv)
    preflight(args.output_dir, args.smoke, args.overwrite)
    import bpy
    jobs=[('comparison.blend','duo-neutral.png','Camera.Duo','neutral'),('comparison.blend','duo-neon.png','Camera.Duo','neon')] if args.smoke else [(f'{role}.blend',f'{role}-{view}.png',f'Camera.{view}','neutral') for role in ('cow','crow') for view in VIEWS]+[('comparison.blend','duo-neutral.png','Camera.Duo','neutral'),('comparison.blend','duo-neon.png','Camera.Duo','neon')]
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
