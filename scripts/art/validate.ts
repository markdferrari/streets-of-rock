import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { runGodot } from '../godot/setup';
export interface Result { status: number; output: string }

export function validateArt(args: string[], runner: (args: string[]) => Result = runGodot): Result {
 let root = process.cwd();
 let focus: '--room' | '--enemy' | '--character' | undefined;
 let id: string | undefined;
 let definitionsOnly = false;
 const seen = new Set<string>();
 try {
  for (let i=0; i<args.length; i++) {
   const flag=args[i];
   if (flag==='--') continue;
   if (!['--room','--enemy','--character','--root','--definitions-only'].includes(flag)) throw new Error(`Unknown argument: ${flag}`);
   if (seen.has(flag)) throw new Error(`Duplicate option: ${flag}`);
   seen.add(flag);
   if (flag==='--definitions-only') { definitionsOnly=true; continue; }
   const value=args[++i];
   if (!value || value.startsWith('--')) throw new Error(`${flag} requires a value`);
   if (flag==='--root') {root=resolve(value);continue;}
   if (focus) throw new Error('Cannot combine --room, --enemy or --character focus options');
   focus=flag as '--room'|'--enemy'|'--character';id=value;
   if (!(flag==='--character'?['cow','crow','lion','plates']:flag==='--room'?['exterior','bar','dance-floor','stage-vip']:['grunt','zoner','enforcer','liam']).includes(id)) throw new Error(`Unknown ${flag.slice(2)} ID: ${id}`);
  }
  if (!existsSync(join(root,'project.godot')) || !existsSync(join(root,'game/tools/validate_art.gd'))) throw new Error('--root requires a Godot project containing project.godot and game/tools/validate_art.gd');
 } catch(error) {return {status:2,output:String(error)};}
 try {
  const command=['--headless','--path',resolve(root),'--script','res://game/tools/validate_art.gd','--'];
  if (focus) command.push(focus,id!);
  if (definitionsOnly) command.push('--definitions-only');
  const result=runner(command);
  if (/ENOENT|executable.*unavailable/i.test(result.output)) return {...result,status:2};
  return {status:result.status===0 && result.output.trim()?0:result.status===2?2:1,output:(result.output || "No validator report received; validation is unverified.")+(definitionsOnly?'\nDefinitions only: imported checks skipped; incomplete for release readiness.':'')};
 } catch(error) {return {status:2,output:`Godot setup failed: ${String(error)}; install/import the pinned Godot project, then retry.`};}
}
if (import.meta.main) { const r=validateArt(process.argv.slice(2)); console.log(r.output); process.exitCode=r.status; }
