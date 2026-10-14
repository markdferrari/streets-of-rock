import { spawnSync } from 'node:child_process';
const result=spawnSync(process.env.SOR_BLENDER??'blender',['-noaudio','--background','--factory-startup','--python-exit-code','1','--python','tests/blender/run_tests.py','--',...process.argv.slice(2).filter(arg=>arg!=='--')],{stdio:'inherit'});
process.exit(result.status??1);
