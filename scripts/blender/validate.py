"""Check saved character scenes in fresh Blender processes and write a JSON report."""
import argparse
import json
import math
import subprocess
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
import bpy
from mathutils import Vector

REQUIRED={
    'cow': ('Torso','Head','Muzzle','Horn.L','Horn.R','Jacket','Boot.L','Boot.R','Eye.L','Eye.R'),
    'crow': ('Torso','Head','Beak','Jacket','Collar','Wing.L','Wing.R','Foot.L','Foot.R','Eye.L','Eye.R'),
}

def inspect(path,role):
    bpy.ops.wm.open_mainfile(filepath=str(path))
    bpy.context.view_layer.update()
    expected=('Cow','Crow') if role=='comparison' else (role.title(),)
    for character in expected:
        col_name=f'Character.{character}'
        assert col_name in bpy.data.collections, f'missing {col_name}'
        col=bpy.data.collections[col_name]
        assert f'{character}.Root' in {o.name for o in col.objects}, f'missing {character}.Root'
        for part in REQUIRED[character.lower()]:
            assert f'{character}.{part}' in bpy.data.objects, f'missing {character}.{part}'
        meshes=[o for o in col.objects if o.type=='MESH']
        assert meshes, f'{character}: no meshes'
        for obj in meshes:
            assert len(obj.data.vertices)>0, f'{obj.name}: empty mesh'
            assert all(math.isfinite(float(v)) for vert in obj.data.vertices for v in vert.co), f'{obj.name}: invalid coordinate'
            assert obj.data.materials, f'{obj.name}: no material'
            for mat in obj.data.materials:
                assert mat and mat.use_nodes and mat.node_tree.nodes.get('Principled BSDF'),f'{obj.name}: invalid material'
        assert bpy.data.objects[f'{character}.Torso'].dimensions.length>0, f'{character}: invalid torso'
    actual={c.name for c in bpy.data.collections if c.name.startswith('Character.')}
    assert actual=={f'Character.{c}' for c in expected}, f'unexpected character collections: {actual}'
    for name in ('Presentation.Cameras','Presentation.Lights.Neutral'):
        assert name in bpy.data.collections, f'missing {name}'
    assert 'Presentation.Ground' in bpy.data.objects, 'missing ground'
    if role=='comparison':
        assert 'Presentation.Lights.Neon' in bpy.data.collections, 'missing neon lighting'
        assert 'Camera.Duo' in bpy.data.objects, 'missing duo camera'
        assert bpy.data.objects['Cow.Torso'].dimensions.x > bpy.data.objects['Crow.Torso'].dimensions.x, 'Cow torso not broader'
        assert bpy.data.objects['Cow.Root'].location.x < bpy.data.objects['Crow.Root'].location.x, 'wrong order'
    else:
        for view in ('front','side','back','three-quarter'):
            assert f'Camera.{view}' in bpy.data.objects, f'missing Camera.{view}'
    assert not bpy.data.libraries, 'linked external library'
    assert not any(image.source=='FILE' and image.filepath and not Path(bpy.path.abspath(image.filepath)).exists() for image in bpy.data.images), 'unresolved image'
    return f'{role}: required parts, materials, geometry and presentation found'

def main(argv=None):
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path)
    parser.add_argument('--report',type=Path)
    parser.add_argument('--probe',choices=('cow','crow','comparison'))
    parser.add_argument('--file',type=Path)
    args=parser.parse_args(argv)
    from scripts.blender.generate import require_supported
    require_supported(bpy.app.version)
    if args.probe:
        try:
            message=inspect(args.file,args.probe)
            print('ASSET_CHECK='+json.dumps({'passed':True,'diagnostic':message}),flush=True)
            return 0
        except Exception as exc:
            print('ASSET_CHECK='+json.dumps({'passed':False,'diagnostic':str(exc)}),flush=True)
            return 1
    if not args.output_dir or not args.report:
        parser.error('--output-dir and --report are required')
    checks=[]
    script=str(Path(__file__).resolve())
    for role in ('cow','crow','comparison'):
        path=args.output_dir/f'{role}.blend'
        if not path.is_file():
            checks.append({'name':role,'passed':False,'diagnostic':f'missing {path}'})
            continue
        cmd=[bpy.app.binary_path,'-noaudio','--background','--factory-startup','--python-exit-code','1','--python',script,'--','--probe',role,'--file',str(path.resolve())]
        try:
            result=subprocess.run(cmd,capture_output=True,text=True,timeout=120)
            marker=next((line.removeprefix('ASSET_CHECK=') for line in result.stdout.splitlines() if line.startswith('ASSET_CHECK=')),None)
            payload=json.loads(marker) if marker else {'passed':False,'diagnostic':(result.stderr or result.stdout)[-500:] or 'probe had no result'}
            checks.append({'name':role,'passed':result.returncode==0 and payload['passed'],'diagnostic':payload['diagnostic']})
        except subprocess.TimeoutExpired:
            checks.append({'name':role,'passed':False,'diagnostic':'fresh Blender process timed out after 120 seconds'})
    report={'blender_version':bpy.app.version_string,'python_version':sys.version.split()[0],'checks':checks,'passed':all(c['passed'] for c in checks)}
    args.report.parent.mkdir(parents=True,exist_ok=True)
    args.report.write_text(json.dumps(report,indent=2)+'\n')
    return 0 if report['passed'] else 1

if __name__=='__main__':
    raise SystemExit(main(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []))
