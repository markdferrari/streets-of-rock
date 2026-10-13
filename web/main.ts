import {installBrowser} from './browser';
import {requestCache} from './cache-client';
import {startRuntime,supportsWorkletAudio,type EngineInstance} from './runtime-loader';
declare const __SOR_DIAGNOSTICS__: boolean;
type Boot={buildId:string;inventoryUrl:string;executable:string;packs:string[];config:Record<string,unknown>;mode:'release'|'test'|'diagnostics'};
const host=window as unknown as {SorBoot:Boot;SorBrowser:unknown;SorPackMountOrder:string[];Engine:new(config:Record<string,unknown>)=>EngineInstance};
const boot=host.SorBoot;const adapter=installBrowser(window,document,boot.buildId,boot.mode);
const checkCache=async(repair=false)=>{
 try{
  if(!navigator.serviceWorker)throw new Error('Offline play requires HTTPS or localhost.');
  const registration=await navigator.serviceWorker.ready;
  const result=await requestCache(navigator.serviceWorker.controller??registration.active,boot.buildId,repair);
  adapter.notify('cacheStatus',result);
  return result;
 }catch(error){const result={state:'error' as const,error:String(error),missing:[],corrupt:[]};adapter.notify('cacheStatus',result);return result;}
};
const browserApi=Object.assign(adapter,{cacheStatus:()=>checkCache(false),repairCache:()=>checkCache(true)});
if(__SOR_DIAGNOSTICS__){const {downloadDiagnostics}=await import('./diagnostics');Object.assign(browserApi,{downloadDiagnostics:(value:unknown)=>downloadDiagnostics(value)});}
host.SorBrowser=browserApi;
host.SorPackMountOrder=boot.packs.slice(1);
const canvas=document.querySelector('canvas')!;canvas.width=Math.round(innerWidth*Math.min(devicePixelRatio||1,1.5));canvas.height=Math.round(innerHeight*Math.min(devicePixelRatio||1,1.5));
const status=document.getElementById('status')!,retry=document.getElementById('retry') as HTMLButtonElement;
retry.addEventListener('click',()=>location.reload());
async function launch(){
 try{
  const engine=new host.Engine({...boot.config,canvas,canvasResizePolicy:0,executable:boot.executable,mainPack:boot.packs[0],onProgress:(done:number,total:number)=>{status.textContent=total?`Loading ${Math.round(done/total*100)}%…`:'Loading Streets of Rock…';}});
  await startRuntime(engine,boot.executable,boot.packs,supportsWorkletAudio(window));document.getElementById('boot')!.hidden=true;
 }catch(error){status.textContent=`Unable to load Streets of Rock: ${String(error)}`;retry.hidden=false;}
}
void navigator.serviceWorker?.register('/sw.js',{scope:'/'}).then(registration=>{
 const publish=()=>{if(registration.waiting)adapter.notify('updateWaiting',{waiting:true});};
 publish();registration.addEventListener('updatefound',()=>registration.installing?.addEventListener('statechange',publish));
 void checkCache(false);
}).catch(error=>adapter.notify('cacheStatus',{state:'error',error:String(error),missing:[],corrupt:[]}));
if(!navigator.serviceWorker)adapter.notify('cacheStatus',{state:'error',error:'Offline play requires HTTPS or localhost.',missing:[],corrupt:[]});
void launch();
