import {mkdirSync,mkdtempSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {runGodot} from './setup';
const args=process.argv.slice(2).filter(arg=>arg!=='--');
let fixture:string|null=null;
if(args.includes('--self-test-failure')){
 mkdirSync('.tmp',{recursive:true});fixture=mkdtempSync('.tmp/gut-failure-');
 writeFileSync(join(fixture,'test_failure.gd'),'extends GutTest\nfunc test_runner_propagates_failure() -> void:\n assert_true(false, "runner must propagate this deliberate assertion failure")\n');
}
const dir=fixture?`res://${fixture}`:'res://tests/godot';
const result=runGodot(['--headless','--path','.','--log-file','.tmp/gut.log','-s','addons/gut/gut_cmdln.gd',`-gdir=${dir}`,'-ginclude_subdirs','-gexit',...args.filter(arg=>arg!=='--self-test-failure')]);
if(fixture)rmSync(fixture,{recursive:true,force:true});
process.stdout.write(result.output);process.exit(result.status);
