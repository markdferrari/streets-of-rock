import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { runGodot } from './setup';
function scripts(dir:string):string[] {return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scripts(join(dir,e.name)):e.name.endsWith('.gd')?[join(dir,e.name)]:[]);}
let result:{status:number;output:string};
for(const path of [...scripts('game'),...scripts('tests/godot')]) {
 result=runGodot(['--headless','--path','.','--log-file','.tmp/check.log','--check-only','--script',path]);
 if(result.status) {process.stderr.write(result.output);process.exit(result.status);}
}
console.log('Godot script checks passed');
