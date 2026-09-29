"""Generate the editable Cow and Crow scenes."""
import argparse
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

TARGETS = ('cow.blend', 'crow.blend', 'comparison.blend')
CHARACTERS = ('cow', 'crow', 'lion', 'plates')

def require_supported(version):
    if tuple(version[:2]) != (5, 2):
        raise RuntimeError(f'Blender 5.2.x is required; found {tuple(version)}')

def preflight(out, overwrite=False, character=None):
    out = Path(out)
    if out.exists() and not out.is_dir():
        raise NotADirectoryError(out)
    if character is not None and (not character.isascii() or not character.replace('-', '').isalnum() or character not in CHARACTERS):
        raise ValueError(f'Unknown character ID: {character}')
    if out.exists():
        targets = (('source.blend' if character in ('lion','plates') else f'{character}.blend'),) if character else TARGETS
        existing = [str(out/name) for name in targets if (out/name).exists()]
        if existing and not overwrite:
            raise FileExistsError('Existing generated files; use --overwrite: ' + ', '.join(existing))
    return out

def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--overwrite', action='store_true')
    parser.add_argument('--character', choices=CHARACTERS, help='generate only the named character source')
    args = parser.parse_args(argv)
    import bpy
    require_supported(bpy.app.version)
    preflight(args.output_dir, args.overwrite, args.character)
    from scripts.blender import characters, presentation
    args.output_dir.mkdir(parents=True, exist_ok=True)
    makers = {'cow': characters.cow, 'crow': characters.crow, 'lion': characters.lion, 'plates': characters.plates}
    if args.character:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        bpy.context.scene.unit_settings.system='METRIC'
        makers[args.character]()
        presentation.setup()
        filename = 'source.blend' if args.character in ('lion','plates') else f'{args.character}.blend'
        bpy.ops.wm.save_as_mainfile(filepath=str((args.output_dir/filename).resolve()), check_existing=False)
        return 0
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
