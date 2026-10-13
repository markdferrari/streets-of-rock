import type {FoundationEntry} from '../scripts/build-asset-inventory';
export async function digest(bytes:ArrayBuffer):Promise<string>{return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');}
export async function verifyResponse(response:Response|undefined,entry:Pick<FoundationEntry,'bytes'|'sha256'>):Promise<boolean> {
 if(!response||!response.ok)return false;const bytes=await response.arrayBuffer();return bytes.byteLength===entry.bytes&&await digest(bytes)===entry.sha256;
}
export async function auditCached(entries:FoundationEntry[],match:(url:string)=>Promise<Response|undefined>):Promise<{missing:string[];corrupt:string[];state:'ready'|'error'}> {
 const missing:string[]=[],corrupt:string[]=[];
 if(!entries.length||new Set(entries.map(e=>e.url)).size!==entries.length)return {missing:['invalid required inventory'],corrupt:[],state:'error'};
 for(const entry of entries){const response=await match(entry.url);if(!response)missing.push(entry.url);else if(!await verifyResponse(response,entry))corrupt.push(entry.url);}
 return {missing,corrupt,state:missing.length||corrupt.length?'error':'ready'};
}
