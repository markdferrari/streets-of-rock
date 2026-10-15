import { spawnSync } from 'node:child_process';
import { runGodot, runnerExit } from '../godot/setup';
import type { Result } from './validate';
export function runArtTests(runner?: (command: string[]) => Result): Result {
 const commands=[['godot','--headless','--path','.','--log-file','.tmp/art-gut.log','-s','addons/gut/gut_cmdln.gd','-gdir=res://tests/godot/art','-ginclude_subdirs','-gexit'],['node','node_modules/vitest/vitest.mjs','run','tests/unit/art']];
 const results=commands.map(command=>{
  try {
  if (runner) return runner(command);
  if (command[0]==='godot') return runGodot(command.slice(1));
  const result=spawnSync(command[0],command.slice(1),{encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:32*1024*1024});
  const output=(result.stdout??'')+(result.stderr??'')+(result.error?.message??'');
  return {status:runnerExit(result.status,output),output};
  } catch(error) {return {status:1,output:`Art runner setup failed: ${String(error)}`};}
 });
 return {status:results.some(r=>r.status!==0 || !r.output.trim())?1:0,output:results.map((r,i)=>r.output.trim()?r.output:`${commands[i][0]}: no test report received; suite execution is unverified`).join('\n')};
}
if (import.meta.main) { const r=runArtTests(); console.log(r.output); process.exitCode=r.status; }
