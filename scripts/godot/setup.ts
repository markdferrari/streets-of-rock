import { createHash } from 'node:crypto';
import { createReadStream, createWriteStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
export interface ToolLock { version: string; editorVersion: string; editorSha256: string; templates: { url: string; sha256: string; sha512: string; files: Record<string, string> }; gut: { version: string; url: string; sha256: string; license: string } }
export function sha256(bytes: Uint8Array | string): string { return createHash('sha256').update(bytes).digest('hex'); }
export function validateVersions(editor: string, template: string, lock: ToolLock): void {
 if (editor.trim() !== lock.editorVersion) throw new Error(`Editor mismatch: expected ${lock.editorVersion}, got ${editor.trim()}`);
 if (template.trim() !== `${lock.version}.stable`) throw new Error(`Template mismatch: expected ${lock.version}.stable, got ${template.trim()}`);
}
export function verifyChecksum(bytes: Uint8Array, expected: string): void {
 if (!/^[a-f0-9]{64}$/.test(expected) || sha256(bytes) !== expected) throw new Error('SHA-256 checksum rejected');
}
export function templateDirectory(root: string, version: string): string {
 if (!/^\d+\.\d+\.\d+$/.test(version) || !isAbsolute(root)) throw new Error('Absolute project root and exact version required');
 return join(root,'.tools/godot',version);
}
export function runnerExit(status: number | null, output: string): number {
 return status !== 0 || /SCRIPT ERROR:|ERROR:|Failing Tests\s*:?\s*[1-9]|\bFailures:\s*[1-9]|\bFAILED\b/.test(output) ? 1 : 0;
}
export function readLock(): ToolLock { return JSON.parse(readFileSync('godot-engine.lock.json','utf8')); }
export function godotBinary(): string { return process.env.SOR_GODOT ?? 'godot'; }
export function runGodot(args: string[]): { status: number; output: string } {
 mkdirSync(resolve('.tmp'),{recursive:true});
 const result=spawnSync(godotBinary(), args, {encoding:'utf8',maxBuffer:32*1024*1024, env:{...process.env, XDG_CONFIG_HOME:resolve('.tools/user/config'), XDG_DATA_HOME:resolve('.tools/user/data'), XDG_CACHE_HOME:resolve('.tools/user/cache')}});
 const output=(result.stdout??'')+(result.stderr??'')+(result.error?.message??'');
 return {status:runnerExit(result.status,output),output};
}
export function verifyEditor(lock=readLock()):void {
 const version=spawnSync(godotBinary(),['--version'],{encoding:'utf8'});
 if(version.status!==0||version.stdout.trim()!==lock.editorVersion)throw new Error('Installed editor does not match locked version');
 const located=spawnSync('which',[godotBinary()],{encoding:'utf8'});
 if(located.status!==0)throw new Error('Locked editor executable unavailable');
 verifyChecksum(readFileSync(located.stdout.trim()),lock.editorSha256);
}
export function verifyInstalled(root=resolve('.'), lock=readLock()): void {
 verifyEditor(lock);
 const version=spawnSync(godotBinary(),['--version'],{encoding:'utf8'});
 const dir=templateDirectory(root,lock.version);
 validateVersions(version.stdout,readFileSync(join(dir,'version.txt'),'utf8'),lock);
 if (!Object.keys(lock.templates.files).length) throw new Error('Template fingerprints missing from lock');
 for(const [name,digest] of Object.entries(lock.templates.files)) verifyChecksum(readFileSync(join(dir,name)),digest);
}
export async function setup(root=resolve('.')): Promise<void> {
 const lock=readLock();verifyEditor(lock);
 const dir=templateDirectory(root,lock.version); const archive=join(root,'.tools/downloads/Godot_v4.7.2-stable_export_templates.tpz');
 if(!existsSync(archive)) {
  mkdirSync(join(root,'.tools/downloads'),{recursive:true});
  const response=await fetch(lock.templates.url); if(!response.ok) throw new Error(`Template download: HTTP ${response.status}`);
  if(!response.body)throw new Error('Template download has no body');
  await pipeline(Readable.fromWeb(response.body as any),createWriteStream(archive));
 }
 const hash256=createHash('sha256'),hash512=createHash('sha512');
 for await (const chunk of createReadStream(archive)) {hash256.update(chunk);hash512.update(chunk);}
 if(hash256.digest('hex')!==lock.templates.sha256||hash512.digest('hex')!==lock.templates.sha512)throw new Error('Official template archive checksum rejected');
 mkdirSync(dir,{recursive:true});
 const result=spawnSync('python3',['-c',`import zipfile,sys,pathlib\nz=zipfile.ZipFile(sys.argv[1]); out=pathlib.Path(sys.argv[2])\nfor n in ['version.txt','web_nothreads_debug.zip','web_nothreads_release.zip']:\n (out/n).write_bytes(z.read('templates/'+n))`,archive,dir],{encoding:'utf8'});
 if(result.status!==0) {rmSync(dir,{recursive:true,force:true}); throw new Error(result.stderr);}
 for (const mode of ['debug','release']) {
  const key=mode==='debug'?'engineDebug':'engineRelease';
  writeFileSync(join(dir,`engine-${mode}.json`),JSON.stringify((lock.templates as unknown as Record<string,unknown>)[key],null,2)+'\n');
 }
 verifyInstalled(root,lock); console.log(`Verified Godot ${lock.version}: ${dir}`);
}
if(import.meta.main) await setup();
