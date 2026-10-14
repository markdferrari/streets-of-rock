import { createHash } from 'node:crypto';
function hash(data: Buffer | string): string { return createHash('sha256').update(data).digest('hex'); }

export interface FoundationEntry {url:string;sha256:string;bytes:number;category:'engine'|'content'}
export interface FoundationInventory {schemaVersion:1;buildId:string;mode:'release'|'test'|'diagnostics';engine:{version:string;templateSha256:string};entrypoint:string;packMountOrder:string[];entries:FoundationEntry[];}
export function auditFoundationInventory(inventory:FoundationInventory,engine:Record<string,string>):void {
 let total=0;const urls=new Set<string>();
 for(const entry of inventory.entries){
  if(entry.category==='content'&&entry.bytes>16*1024*1024)throw new Error(`${entry.url} exceeds 16 MiB`);
  if(entry.category==='engine'&&engine[entry.url]!==entry.sha256)throw new Error(`${entry.url}: engine fingerprint is not verified`);
  if(entry.category==='content')total+=entry.bytes;
  if(!Number.isSafeInteger(entry.bytes)||entry.bytes<0||! /^[a-f0-9]{64}$/.test(entry.sha256))throw new Error('Invalid asset length/digest');
  if(!entry.url||entry.url.startsWith('/')||entry.url.includes('..')||entry.url.includes('\\')||entry.url.includes(':')||entry.url.includes('%')||urls.has(entry.url))throw new Error('Invalid/duplicate inventory URL');
  urls.add(entry.url);
 }
 if(total>30*1024*1024)throw new Error('Content exceeds 30 MiB');
 if(inventory.schemaVersion!==1||! /^[a-f0-9]{64}$/.test(inventory.buildId))throw new Error('Invalid release identity/schema');
 for(const pack of inventory.packMountOrder)if(!urls.has(pack))throw new Error('Missing required pack');
}

export function verifyFoundationFiles(inventory:FoundationInventory,files:Record<string,Uint8Array>):void {
 const listed=new Set(inventory.entries.map(e=>e.url));
 for(const entry of inventory.entries){const bytes=files[entry.url];if(!bytes)throw new Error(`Missing ${entry.url}`);if(bytes.byteLength!==entry.bytes||hash(Buffer.from(bytes))!==entry.sha256)throw new Error(`${entry.url}: digest or bytes changed`);}
 for(const name of Object.keys(files))if(!listed.has(name)&&name!=='sw.js'&&name!==`releases/${inventory.buildId}/asset-inventory.json`)throw new Error(`Unlisted shipped resource ${name}`);
}
