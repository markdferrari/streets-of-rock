export function partitionEntries(entries:{path:string;bytes:number}[],cap:number):string[][] {
 if(!Number.isSafeInteger(cap)||cap<=0)throw new Error('Invalid pack cap');
 if(new Set(entries.map(e=>e.path)).size!==entries.length)throw new Error('Duplicate exported resource ownership');
 const first=(p:string)=>/project\.binary$|(?:^|\/)bootstrap\.(?:gd|gdc|tscn)(?:\.remap)?$|uid_cache\.bin$|global_script_class_cache\.cfg$/.test(p);
 const sorted=[...entries].sort((a,b)=>Number(first(b.path))-Number(first(a.path))||a.path.localeCompare(b.path));
 const packs:string[][]=[[]];let size=0;
 for(const entry of sorted){
  if(!Number.isSafeInteger(entry.bytes)||entry.bytes<0||entry.bytes>cap)throw new Error(`${entry.path}: resource exceeds pack cap; optimize it`);
  if(size+entry.bytes>cap&&packs.at(-1)!.length){if(first(entry.path))throw new Error('Bootstrap resources exceed pack cap');packs.push([]);size=0;}
  packs.at(-1)!.push(entry.path);size+=entry.bytes;
 }
 return packs;
}
export function auditArtDelivery(paths:string[],resources:{art:Record<string,any>;models?:Record<string,string>}):void {
 const shipped=new Set(paths);
 for(const [id,entry] of Object.entries(resources.art)){
  const path=`res://${entry.path}`;
  if(!shipped.has(path)&&!shipped.has(path+'.import')&&!shipped.has(path+'.remap'))throw new Error(`${id}: missing art resource ${path}`);
  for(const dependency of entry.dependencyIds??[])if(!resources.art[dependency])throw new Error(`${id}: missing art dependency ${dependency}`);
 }
 for(const [id,path] of Object.entries(resources.models??{})){
  if(!shipped.has(`res://${path}`)&&!shipped.has(`res://${path}.import`))throw new Error(`${id}: missing hero model ${path}`);
 }
 if(resources.models && !shipped.has('res://content/hero-animations.json'))throw new Error('Missing bundled hero profile catalogue');
 for(const name of ['art-credits.json','ARTWORK-NOTICES.txt'])if(!shipped.has(`res://public/assets/credits/${name}`))throw new Error(`Missing bundled artwork credit ${name}`);
}
