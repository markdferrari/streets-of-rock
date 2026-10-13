export interface EngineInstance {init(path:string):Promise<void>;preloadFile(url:string,path:string):Promise<void>;start(config:Record<string,unknown>):Promise<void>;}
export function supportsWorkletAudio(host:{isSecureContext:boolean;AudioContext?:{prototype:object};AudioWorkletNode?:unknown}):boolean {
 return host.isSecureContext && !!host.AudioContext && 'audioWorklet' in host.AudioContext.prototype && typeof host.AudioWorkletNode==='function';
}
export async function startRuntime(engine:EngineInstance,base:string,packs:string[],audioAvailable=true):Promise<void> {
 if(!packs.length||new Set(packs).size!==packs.length||packs.some(p=>!/^[a-z0-9_-]+\.pck$/.test(p)))throw new Error('Invalid pack mount order');
 await engine.init(base);
 for(const pack of packs)await engine.preloadFile(`${base.slice(0,base.lastIndexOf('/')+1)}${pack}`,pack);
 await engine.start({args:['--main-pack',packs[0],...audioAvailable?[]:['--audio-driver','Dummy']]});
}
