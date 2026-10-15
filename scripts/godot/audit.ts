import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {join,resolve,relative,isAbsolute} from 'node:path';
import {constants as zlibConstants,gzipSync,brotliCompressSync} from 'node:zlib';
import {auditFoundationInventory,verifyFoundationFiles,type FoundationInventory} from '../build-asset-inventory';
import {readLock,sha256} from './setup';
import {readPck} from './export';
import {auditArtDelivery} from '../art/delivery';
function files(dir:string,base=dir):string[]{return readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.gdignore').flatMap(e=>e.isDirectory()?files(join(dir,e.name),base):[join(dir,e.name).slice(base.length+1)]).sort();}
export function auditFoundationBuild(dir='dist',final=false,evidencePath?:string):{buildId:string;contentBytes:number;engineBytes:number;files:number;cachedBytes:number;gzipEstimateBytes:number;brotliEstimateBytes:number} {
 const actual=files(dir);const inventories=actual.filter(p=>/^releases\/[a-f0-9]{64}\/asset-inventory\.json$/.test(p));
 if(inventories.length!==1)throw new Error('Exactly one release inventory required');
 const bytes=readFileSync(join(dir,inventories[0]!)),inventory=JSON.parse(bytes.toString()) as FoundationInventory;
 const lock=readLock(),stock=(lock.templates as unknown as Record<string,Record<string,string>>)[inventory.mode==='test'?'engineDebug':'engineRelease'];
 if(inventory.engine.version!==lock.version||inventory.engine.templateSha256!==lock.templates.sha256)throw new Error('Engine lock mismatch');
 const emitted=Object.fromEntries(actual.map(p=>[p,readFileSync(join(dir,p))]));verifyFoundationFiles(inventory,emitted);
 const engine:Record<string,string>={};for(const entry of inventory.entries)if(Object.values(stock).includes(entry.sha256))engine[entry.url]=entry.sha256;auditFoundationInventory(inventory,engine);
 const worker=emitted['sw.js']!.toString();if(!worker.includes(sha256(bytes))||!worker.includes(inventory.buildId))throw new Error('Worker-owned inventory digest or identity missing');
 const shell=emitted['index.html']!.toString();if(!shell.includes(inventory.buildId)||shell.includes(sha256(bytes)))throw new Error('Shell identity missing or circular inventory hash');
 if(!emitted[`releases/${inventory.buildId}/index.html`]?.equals(emitted['index.html']!))throw new Error('Immutable and root boot shells differ');
 const shippedPaths:string[]=[];
 for(const pack of inventory.packMountOrder){for(const e of readPck(join(dir,pack))){
  shippedPaths.push(e.path);
  if(/\.blend\d*$|(?:^|\/)(addons|src|scripts|specs)\//.test(e.path))throw new Error(`Source/development resource shipped: ${e.path}`);
  if(inventory.mode!=='test'&&(e.path.includes('/tests/')||e.data.includes(Buffer.from('__sorTest'))||e.data.includes(Buffer.from('__sorDiagnostics'))))throw new Error(`Test/diagnostic resource shipped: ${e.path}`);
 }}
 auditArtDelivery(shippedPaths,JSON.parse(readFileSync('content/resources.json','utf8')));
 for(const [path,data] of Object.entries(emitted))if(inventory.mode==='release'&&path.endsWith('.js')&&/__sorTest|__sorDiagnostics/.test(data.toString()))throw new Error('Release contains mutation/diagnostic registration');
 const engineBytes=inventory.entries.filter(e=>e.category==='engine').reduce((n,e)=>n+e.bytes,0),total=Object.values(emitted).reduce((n,b)=>n+b.length,0),contentBytes=total-engineBytes;
 if(contentBytes>30*1024*1024)throw new Error('Complete content exceeds 30 MiB');for(const [path,data] of Object.entries(emitted))if(!engine[path]&&data.length>16*1024*1024)throw new Error(`${path} exceeds 16 MiB`);
 if(final){
  const path=finalEvidencePath(evidencePath);
  if(!existsSync(path))throw new Error(`Missing final acceptance evidence: ${path}`);
  validateFinalEvidence(inventory.buildId,JSON.parse(readFileSync(path,'utf8')));
 }
 return {buildId:inventory.buildId,contentBytes,engineBytes,files:actual.length,gzipEstimateBytes:Object.values(emitted).reduce((n,b)=>n+gzipSync(b,{mtime:0} as any).length,0),brotliEstimateBytes:Object.values(emitted).reduce((n,b)=>n+brotliCompressSync(b,{params:{[zlibConstants.BROTLI_PARAM_QUALITY]:5}}).length,0),cachedBytes:Object.values(emitted).reduce((n,b)=>n+b.length,0)};
}

export const FINAL_EVIDENCE_KEYS = ['phones', 'performance', 'playtest', 'soundtrack', 'offlineUpdate', 'coverage', 'conceptReview', 'inGameReview', 'characterWorkflow'] as const;

const MANUAL_EVIDENCE_KEYS = new Set(['phones', 'performance', 'playtest', 'offlineUpdate']);

export function validateFinalEvidence(buildId: string, value: unknown, root = '.'): void {
 if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Missing final acceptance evidence record');
 const record = value as { buildId?: unknown; statuses?: Record<string, unknown>; evidence?: Record<string, unknown>; soundtrack?: unknown; manualWaiver?: unknown };
 if (record.buildId !== buildId) throw new Error('Final evidence build identity does not match the audited release');
 for (const key of FINAL_EVIDENCE_KEYS) {
  const status = record.statuses?.[key];
  if (status !== 'pass' && !(status === 'waived' && MANUAL_EVIDENCE_KEYS.has(key))) throw new Error(`Final evidence ${key} must be pass before --final`);
 }
 const verifyFile = (key: string, path: unknown, digest: unknown): void => {
  if (typeof path !== 'string' || !path || isAbsolute(path) || path.includes('\\')) throw new Error(`${key}: invalid evidence path`);
  const resolved = resolve(root, path), local = relative(resolve(root), resolved);
  if (local === '..' || local.startsWith('../') || isAbsolute(local)) throw new Error(`${key}: evidence path escapes repository`);
  if (!existsSync(resolved)) throw new Error(`${key}: missing evidence file ${path}`);
  if (typeof digest !== 'string' || !/^[a-f0-9]{64}$/.test(digest) || sha256(readFileSync(resolved)) !== digest) throw new Error(`${key}: evidence digest mismatch`);
 };
 if (FINAL_EVIDENCE_KEYS.some(key => record.statuses?.[key] === 'waived')) {
  const waiver = record.manualWaiver as { approvedBy?: unknown; buildId?: unknown; path?: unknown; sha256?: unknown; reason?: unknown } | undefined;
  if (waiver?.approvedBy !== 'owner' || typeof waiver.reason !== 'string' || !waiver.reason.trim()) throw new Error('Manual waiver requires an explicit owner decision and reason');
  if (waiver.buildId !== buildId) throw new Error('Manual waiver build identity mismatch');
  verifyFile('manual waiver', waiver.path, waiver.sha256);
 }
 for (const key of FINAL_EVIDENCE_KEYS) {
  const entry = record.evidence?.[key] as { buildId?: unknown; path?: unknown; sha256?: unknown } | undefined;
  if (!entry || typeof entry !== 'object') throw new Error(`${key}: missing final evidence reference`);
  if (entry.buildId !== buildId) throw new Error(`${key}: evidence build identity mismatch`);
  verifyFile(key, entry.path, entry.sha256);
 }
 const soundtrack = record.soundtrack as { ownerApproved?: unknown; title?: unknown; license?: unknown; audioFile?: unknown; sha256?: unknown } | undefined;
 if (soundtrack?.ownerApproved !== true) throw new Error('Soundtrack owner approval is required');
 if (typeof soundtrack.title !== 'string' || !soundtrack.title.trim() || typeof soundtrack.license !== 'string' || !soundtrack.license.trim()) throw new Error('Soundtrack identity and licensing confirmation are required');
 if (soundtrack.audioFile !== 'public/assets/audio/brightside.mp3') throw new Error('Soundtrack must identify the configured bundled audio path');
 verifyFile('soundtrack', soundtrack.audioFile, soundtrack.sha256);
}

export function finalEvidencePath(explicit?: string): string {
 const path=explicit??'specs/009-godot-rewrite/validation/acceptance.json';
 if(!path||isAbsolute(path)||path.includes('\\')||path.split('/').includes('..')||!path.endsWith('.json'))throw new Error('Final evidence path must be a project-relative JSON file');
 return path;
}
