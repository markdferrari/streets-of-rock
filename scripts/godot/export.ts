import { readFileSync } from 'node:fs';
import { sha256 } from './setup';
import {auditBackdrops,auditImportedBackdrops} from '../backdrops/validate';
export type Mode='release'|'test'|'diagnostics';
export function modeConfig(mode:Mode):{preset:string;dir:string;debug:boolean} {
 const modes={release:{preset:'Web Release',dir:'dist',debug:false},test:{preset:'Web Test',dir:'dist-test',debug:true},diagnostics:{preset:'Web Diagnostics',dir:'dist-diagnostics',debug:false}};
 if(!modes[mode])throw new Error('Unknown export mode');return modes[mode];
}
function canonical(value:unknown):unknown {
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>[k,canonical(v)]));
 return value;
}
export function buildIdentity(value:unknown):string {return sha256(JSON.stringify(canonical(value)));}
export interface PackResource {path:string;bytes:number;group:string;dependencies?:string[];}
export function planPacks(resources:PackResource[],cap=16*1024*1024):Record<string,string[]> {
 if(!Number.isSafeInteger(cap)||cap<=0)throw new Error('Invalid pack cap');
 const byPath=new Map(resources.map(r=>[r.path,r]));if(byPath.size!==resources.length)throw new Error('Duplicate resource ownership');
 for(const r of resources){if(!Number.isSafeInteger(r.bytes)||r.bytes<0||r.bytes>cap)throw new Error(`${r.path}: optimize resource exceeding cap`);for(const dep of r.dependencies??[])if(!byPath.has(dep))throw new Error(`${r.path}: missing dependency ${dep}`);}
 const consumers=new Map<string,Set<string>>();for(const r of resources)for(const dep of r.dependencies??[]){const groups=consumers.get(dep)??new Set();groups.add(r.group);consumers.set(dep,groups);}
 const groups=['main','shared','cow','crow','lion','plates','outside-entrance','bar','dance-floor','stage-vip','audio'];
 const owner=(r:PackResource)=>consumers.get(r.path)?.size!>1?'shared':r.group;
 const ordered=[...resources].sort((a,b)=>{const x=groups.indexOf(owner(a)),y=groups.indexOf(owner(b));return (x<0?groups.length:x)-(y<0?groups.length:y)||a.path.localeCompare(b.path);});
 const packs:Record<string,string[]>={main:[]};let name='main',size=0,index=0;
 for(const r of ordered){if(size+r.bytes>cap&&packs[name]!.length){name=`content-${++index}`;packs[name]=[];size=0;}packs[name]!.push(r.path);size+=r.bytes;}
 const positions=new Map(Object.values(packs).flatMap((paths,index)=>paths.map(path=>[path,index] as const)));
 for(const r of resources)for(const dep of r.dependencies??[])if(positions.get(dep)!>positions.get(r.path)!)throw new Error(`${r.path}: dependency must mount first`);
 return packs;
}
const duplicateMetadata=new Set(['res://project.binary','res://.godot/uid_cache.bin','res://.godot/global_script_class_cache.cfg']);
export function auditOwnership(packs:Record<string,Record<string,string>>,remaps:Record<string,string>={}):void {
 const owners=new Map<string,string>();
 for(const [pack,entries] of Object.entries(packs))for(const [path,digest] of Object.entries(entries)) {
  if(owners.has(path)&&(!duplicateMetadata.has(path)||owners.get(path)!==digest))throw new Error(`${pack}: conflicting ownership for ${path}`);
  owners.set(path,digest);
 }
 for(const [source,target] of Object.entries(remaps))if(!owners.has(target))throw new Error(`${source}: missing imported-resource remap ${target}`);
}
export interface PckEntry {path:string;bytes:number;sha256:string;data:Buffer;}
// Format follows Godot core/io/file_access_pack.cpp (v2/v3/v4 unencrypted directories).
export function readPck(path:string):PckEntry[] {
 const b=readFileSync(path);if(b.toString('ascii',0,4)!=='GDPC')throw new Error('Invalid PCK magic');const version=b.readUInt32LE(4),flags=b.readUInt32LE(20);
 if(![2,3,4].includes(version)||(flags&1))throw new Error('Unsupported/encrypted PCK');
 const base=Number(b.readBigUInt64LE(24));let p=version>=3?Number(b.readBigUInt64LE(32)):96;
 const count=b.readUInt32LE(p);p+=4;const entries:PckEntry[]=[];
 for(let i=0;i<count;i++) {
  const length=b.readUInt32LE(p);p+=4;const name=b.toString('utf8',p,p+length).replace(/\0+$/,'');p+=length;
  const offset=Number(b.readBigUInt64LE(p))+base,bytes=Number(b.readBigUInt64LE(p+8));p+=36;
  if(offset+bytes>b.length)throw new Error(`${name}: PCK payload out of bounds`);const data=b.subarray(offset,offset+bytes);
  entries.push({path:name.startsWith('res://')?name:`res://${name}`,bytes,sha256:sha256(data),data});
 }return entries;
}

import {cpSync,existsSync,mkdirSync,readdirSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {basename,join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {constants as zlibConstants,gzipSync,brotliCompressSync} from 'node:zlib';
import {injectManifest} from 'workbox-build';
import {readLock,runGodot,verifyInstalled,type ToolLock} from './setup';
import {auditFoundationInventory,type FoundationInventory} from '../build-asset-inventory';
function files(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).filter(e=>e.name!=='.gdignore').flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]).sort();}
function bundle(entry:string,out:string,defines:Record<string,unknown>={}){const args=['build',entry,'--target','browser','--format',entry.endsWith('/sw.ts')?'iife':'esm','--outfile',out,...Object.entries(defines).flatMap(([k,v])=>['--define',`${k}=${JSON.stringify(v)}`])];const result=spawnSync('bun',args,{encoding:'utf8'});if(result.status!==0)throw new Error(result.stderr);}
export function runtimeContentDefinitions(paths:string[]):string[]{
 return paths.filter(path=>path.endsWith('.json') && path !== 'content/art-provenance.json');
}
export function webTestFixtureFiles(paths:string[]):string[]{
 return paths.filter(path=>/\.(gd|tscn|bin|json)$/.test(path));
}
function sources(mode:Mode):Record<string,string[]> {
 const resources=JSON.parse(readFileSync('content/resources.json','utf8'));const groups:Record<string,string[]>={main:[...files('game').filter(n=>/\.(gd|tscn)$/.test(n)&&(mode==='test'||n!=='game/platform/test_bridge.gd')&&(mode==='diagnostics'||n!=='game/platform/diagnostics.gd')),...runtimeContentDefinitions(files('content'))],shared:Object.values(resources.props)};
 for(const id of ['cow','crow','lion','plates'])groups[id]=[resources.models[id],resources.portraits[id]];
 for(const [id,entry] of Object.entries(resources.art??{}) as [string,{path:string}][])groups[id]=[entry.path];
 for(const room of JSON.parse(readFileSync('content/backdrops.json','utf8')).rooms)groups[room.setting]=[room.wall,room.floor];
 groups.audio=files('public/assets/audio').filter(n=>/\.(mp3|wav|ogg)$/.test(n));
 if(mode==='test'){groups.main!.push(...webTestFixtureFiles(files('tests/godot/fixtures')));groups.backdrops=files('assets/backdrops/concepts').filter(n=>n.endsWith('.svg'));}
 return groups;
}
function normalizePacks(stage:string,packs:string[],cap:number):void {
 const sharedMetadata=readPck(join(stage,'full.pck')).filter(e=>duplicateMetadata.has(e.path));
 const scratch=join(stage,'repack');mkdirSync(scratch,{recursive:true});
 for(const [index,pack] of packs.entries()){
  const entries=readPck(join(stage,'raw',pack)).filter(e=>!duplicateMetadata.has(e.path));
  if(index===0)entries.push(...sharedMetadata);
  const records=entries.sort((a,b)=>a.path.localeCompare(b.path)).map((entry,n)=>{const file=join(scratch,`${index}-${n}.bin`);writeFileSync(file,entry.data);return {path:entry.path,file};});
  const manifest=join(scratch,`${index}.json`);writeFileSync(manifest,JSON.stringify(records));
  const target=join(scratch,pack);const result=runGodot(['--headless','--path','.','--log-file','.tmp/repack.log','--script','scripts/godot/repack.gd','--',target,manifest]);
  if(result.status)throw new Error(result.output);if(statSync(target).size>cap)throw new Error(`${pack}: promoted shared metadata exceeds cap`);
  cpSync(target,join(stage,'raw',pack));
 }
}
export async function exportWeb(mode:Mode='release',cap=16*1024*1024,outputDir?:string):Promise<FoundationInventory> {
 const lock=readLock();verifyInstalled();if(cap>16*1024*1024)throw new Error('Content cap cannot exceed 16 MiB');
 const backdropDecodedBytes=auditBackdrops();
 const config=modeConfig(mode);if(outputDir){if(!/^dist(?:-[a-z0-9-]+)?$/.test(outputDir))throw new Error('Output directory must be a dist directory');config.dir=outputDir;}
 const stage=resolve(`.tools/staging/${config.dir}`);rmSync(stage,{recursive:true,force:true});mkdirSync(join(stage,'raw'),{recursive:true});
 const importResult=runGodot(['--headless','--path','.','--log-file','.tmp/export-import.log','--import']);if(importResult.status)throw new Error(importResult.output);
 const groups=sources(mode);const presetOriginal=readFileSync('export_presets.cfg','utf8'),projectOriginal=readFileSync('project.godot','utf8');
 const setFiles=(selected:string[])=>{
  let presets=presetOriginal.replaceAll('export_filter="customized"','export_filter="resources"');
  presets=presets.replaceAll('export_filter="resources"',`export_filter="resources"\nexport_files=PackedStringArray(${selected.map(n=>JSON.stringify('res://'+n)).join(', ')})`);
  presets=presets.replace(/^include_filter=.*$/gm,`include_filter="${selected.filter(n=>n.endsWith('.json')||n.endsWith('.bin')).join(',')}"`);
  writeFileSync('export_presets.cfg',presets);
  writeFileSync('project.godot',projectOriginal.replace(/^run\/content_scene=.*$/m,`run/content_scene=${JSON.stringify(mode==='test'?'res://tests/godot/fixtures/web_test.tscn':'res://game/app/main.tscn')}`));
 };
 const exportPack=(selected:string[],target:string,full=false)=>{
  setFiles(selected);const result=runGodot(['--headless','--path','.','--log-file','.tmp/export.log',full?(config.debug?'--export-debug':'--export-release'):'--export-pack',config.preset,target]);
  writeFileSync(join(stage,'last-export.log'),result.output);if(result.status)throw new Error(result.output);
 };
 let packs=['sor.pck'];
 try{
  exportPack(Object.values(groups).flat(),join(stage,'raw/sor.html'),true);
  if(statSync(join(stage,'raw/sor.pck')).size>cap){
   cpSync(join(stage,'raw/sor.pck'),join(stage,'full.pck'));
   // Measure deterministic category exports with the pinned exporter; never byte-split a PCK.
   const categories=[];
   for(const [group,selected] of Object.entries(groups)){
    const target=join(stage,`${group}.pck`);exportPack(selected,target);categories.push({path:group,group,bytes:statSync(target).size});
   }
   const plan=planPacks(categories,cap);packs=[];
   for(const [name,parts] of Object.entries(plan)){
    const pack=name==='main'?'sor.pck':`${name}.pck`;exportPack(parts.flatMap(part=>groups[part]!),join(stage,'raw',pack));
    if(statSync(join(stage,'raw',pack)).size>cap)throw new Error(`${pack}: exporter metadata exceeds forced cap; use a larger fixture cap or optimize assets`);packs.push(pack);
   }
  }
   if(packs.length>1)normalizePacks(stage,packs,cap);
 }finally{writeFileSync('export_presets.cfg',presetOriginal);writeFileSync('project.godot',projectOriginal);}
 const ownership:Record<string,Record<string,string>>={},remaps:Record<string,string>={};
 for(const pack of packs){const entries=readPck(join(stage,'raw',pack));ownership[pack]=Object.fromEntries(entries.map(e=>[e.path,e.sha256]));
  for(const e of entries){if(/\.blend\d*$|(?:^|\/)(addons|src|scripts|specs)\//.test(e.path)||mode!=='test'&&e.path.includes('/tests/'))throw new Error(`Forbidden export resource ${e.path}`);
   if(e.path.endsWith('.import')||e.path.endsWith('.remap'))for(const match of e.data.toString('utf8').matchAll(/path="(res:\/\/[^"\n]+)"/g))remaps[e.path]=match[1]!;
  }
 }auditOwnership(ownership,remaps);auditImportedBackdrops(Object.values(ownership).flatMap(entries=>Object.keys(entries)));writeFileSync(join(stage,'ownership.json'),JSON.stringify({ownership,remaps},null,2));
 bundle('web/main.ts',join(stage,'browser.js'),{__SOR_DIAGNOSTICS__:mode==='diagnostics'});
 const stock=JSON.parse(readFileSync(`.tools/godot/${lock.version}/engine-${config.debug?'debug':'release'}.json`,'utf8')) as Record<string,string>;
 const staged=files(join(stage,'raw')).filter(p=>!p.endsWith('.html')&&!p.endsWith('.png'));
 const payload=Object.fromEntries(staged.map(p=>[basename(p),sha256(readFileSync(p))]));payload['browser.js']=sha256(readFileSync(join(stage,'browser.js')));
 const shellTemplate=readFileSync('web/shell.html','utf8');const manifest={id:'/',name:'Streets of Rock',short_name:'Streets of Rock',start_url:'/',scope:'/',display:'standalone',orientation:'landscape',background_color:'#0c0b12',theme_color:'#0c0b12',icons:[{src:'/assets/icons/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any'},{src:'/assets/icons/icon-maskable.svg',sizes:'any',type:'image/svg+xml',purpose:'maskable'}]};
 const rawHtml=readFileSync(join(stage,'raw/sor.html'),'utf8');const engineConfig=JSON.parse(rawHtml.match(/const GODOT_CONFIG = (\{[^\n]+\});/)?.[1]??rawHtml.match(/var GODOT_CONFIG = (\{[^\n]+\});/)?.[1]??'{}');
 const buildId=buildIdentity({mode,engine:lock,payload,packOrder:packs,browser:{shell:sha256(shellTemplate),manifest:sha256(JSON.stringify(manifest)),icons:files('public/assets/icons').filter(p=>p.endsWith('.svg')).map(p=>[basename(p),sha256(readFileSync(p))])}});
 const dir=config.dir,prefix=`releases/${buildId}`;rmSync(dir,{recursive:true,force:true});mkdirSync(join(dir,prefix),{recursive:true});writeFileSync(join(dir,'.gdignore'),'');
 for(const p of staged)cpSync(p,join(dir,prefix,basename(p)));cpSync(join(stage,'browser.js'),join(dir,prefix,'browser.js'));
 const boot={buildId,inventoryUrl:`${prefix}/asset-inventory.json`,executable:`${prefix}/sor`,packs,config:engineConfig,mode};
 const shell=shellTemplate.replace('__SOR_BOOT__',JSON.stringify(boot)).replace('__ENGINE_SCRIPT__',`${prefix}/sor.js`).replace('__BROWSER_SCRIPT__',`${prefix}/browser.js`);
 writeFileSync(join(dir,'index.html'),shell);writeFileSync(join(dir,prefix,'index.html'),shell);writeFileSync(join(dir,'manifest.webmanifest'),JSON.stringify(manifest));
 mkdirSync(join(dir,'assets/icons'),{recursive:true});for(const p of files('public/assets/icons').filter(p=>p.endsWith('.svg')))cpSync(p,join(dir,'assets/icons',basename(p)));
 const engineFingerprints:Record<string,string>={};
 const entries=files(dir).map(p=>{const url=p.slice(dir.length+1),bytes=readFileSync(p),digest=sha256(bytes);const engine=Object.values(stock).includes(digest);if(engine)engineFingerprints[url]=digest;return {url,sha256:digest,bytes:bytes.length,category:engine?'engine' as const:'content' as const};});
 const inventory:FoundationInventory={schemaVersion:1,buildId,mode,engine:{version:lock.version,templateSha256:lock.templates.sha256},entrypoint:'index.html',packMountOrder:packs.map(pack=>`${prefix}/${pack}`),entries};auditFoundationInventory(inventory,engineFingerprints);
 const inventoryBytes=JSON.stringify(inventory,null,2)+'\n';writeFileSync(join(dir,boot.inventoryUrl),inventoryBytes);
 bundle('web/sw.ts',join(stage,'sw-bundled.js'),{__SOR_RELEASE__:{inventory,inventoryUrl:boot.inventoryUrl,inventoryDigest:sha256(inventoryBytes)}});
 await injectManifest({swSrc:join(stage,'sw-bundled.js'),swDest:join(dir,'sw.js'),globDirectory:dir,globPatterns:[],additionalManifestEntries:[...entries.map(e=>({url:e.url,revision:e.sha256})),{url:boot.inventoryUrl,revision:sha256(inventoryBytes)}]});
 const final=files(dir).map(p=>readFileSync(p));const engineBytes=entries.filter(e=>e.category==='engine').reduce((n,e)=>n+e.bytes,0),allBytes=final.reduce((n,b)=>n+b.length,0),contentBytes=allBytes-engineBytes;
 if(contentBytes>30*1024*1024||final.some(b=>b.length>16*1024*1024&&!Object.values(stock).includes(sha256(b))))throw new Error('Complete foundation content budget exceeded');
 const report={stage:'playable-scenery',buildId,mode,packCap:cap,packs,engineBytes,contentBytes,backdropDecodedBytes,requiredCachedPayloadBytes:allBytes,gzipEstimateBytes:final.reduce((n,b)=>n+gzipSync(b,{mtime:0} as any).length,0),brotliEstimateBytes:final.reduce((n,b)=>n+brotliCompressSync(b,{params:{[zlibConstants.BROTLI_PARAM_QUALITY]:5}}).length,0),engineFingerprints,inventoryDigest:sha256(inventoryBytes),workerSha256:sha256(readFileSync(join(dir,'sw.js'))),ownership,pending:['browser reliability acceptance','intended soundtrack confirmation','phone and participant acceptance']};
 writeFileSync(join(stage,'report.json'),JSON.stringify(report,null,2)+'\n');console.log(`Web ${mode}: ${buildId}; ${packs.length} pack(s), ${contentBytes} content bytes, ${engineBytes} verified engine bytes`);return inventory;
}
if(import.meta.main){const args=process.argv.slice(2);const mode=(args[0]??'release') as Mode;const capArg=args.indexOf('--pack-cap');const outArg=args.indexOf('--output-dir');await exportWeb(mode,capArg<0?undefined:Number(args[capArg+1]),outArg<0?undefined:args[outArg+1]);}
