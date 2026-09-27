"""Generate the editable Cow and Crow scenes."""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

TARGETS = ('cow.blend', 'crow.blend', 'comparison.blend')

def preflight(out, overwrite=False):
    out = Path(out)
    if out.exists() and not out.is_dir():
        raise NotADirectoryError(out)
    if out.exists():
        existing = [str(out/name) for name in TARGETS if (out/name).exists()]
        if existing and not overwrite:
            raise FileExistsError('Existing generated files; use --overwrite: ' + ', '.join(existing))
    return out

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args(argv)
    preflight(args.output_dir, args.overwrite)
    import bpy
    from scripts.blender import characters, presentation
    args.output_dir.mkdir(parents=True, exist_ok=True)
    for role, make in (('cow', characters.cow), ('crow', characters.crow)):
        bpy.ops.wm.read_factory_settings(use_empty=True)
        scene=bpy.context.scene
        scene.unit_settings.system='METRIC'
        make()
        presentation.setup()
        bpy.ops.wm.save_as_mainfile(filepath=str((args.output_dir/f'{role}.blend').resolve()), check_existing=False)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene=bpy.context.scene;scene.unit_settings.system='METRIC'
    cow=characters.cow(); crow=characters.crow()
    cow.location.x=-1.25; crow.location.x=1.25
    # Parent each mesh to its ground-centred root without moving existing geometry.
    for role, root in (('Cow',cow),('Crow',crow)):
        for obj in bpy.data.collections[f'Character.{role}'].objects:
            if obj != root: obj.parent=root
    presentation.setup(duo=True)
    bpy.ops.wm.save_as_mainfile(filepath=str((args.output_dir/'comparison.blend').resolve()),check_existing=False)
    return 0

if __name__ == '__main__':
    main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
