import {precacheAndRoute,createHandlerBoundToURL,getCacheKeyForURL,cleanupOutdatedCaches} from 'workbox-precaching';
import {registerRoute,NavigationRoute} from 'workbox-routing';
import {cacheNames} from 'workbox-core';
import type {FoundationInventory,FoundationEntry} from '../scripts/build-asset-inventory';
declare const __SOR_RELEASE__:{inventory:FoundationInventory;inventoryUrl:string;inventoryDigest:string};
import {auditCached,digest,verifyResponse} from './cache-audit';
if(typeof __SOR_RELEASE__!=='undefined') {
 const config=__SOR_RELEASE__,inventory=config.inventory;
 const integrity=(hex:string)=>'sha256-'+btoa(String.fromCharCode(...hex.match(/../g)!.map(s=>parseInt(s,16))));
 precacheAndRoute((self as any).__WB_MANIFEST.map((entry:any)=>({...entry,integrity:integrity(entry.revision)})));
 registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));cleanupOutdatedCaches();
 const worker=self as unknown as ServiceWorkerGlobalScope;let repair:Promise<unknown>=Promise.resolve();
 worker.addEventListener('message',event=>{
  const data=event.data,port=event.ports[0];if(!port)return;
  const legacy=data?.protocolVersion===undefined;
  const fail=(error:string)=>port.postMessage({type:'CACHE_STATUS',protocolVersion:1,requestId:data?.requestId,buildId:inventory.buildId,state:'error',missing:[],corrupt:[],error});
  if(!data||!['CACHE_STATUS','CACHE_REPAIR'].includes(data.type)||!legacy&&data.protocolVersion!==1||data.expectedBuildId&&data.expectedBuildId!==inventory.buildId){fail('Unsupported protocol or mismatched release');return;}
  const task=async()=>{
   try{
    const cache=await caches.open(cacheNames.precache);
    const match=(url:string)=>cache.match(getCacheKeyForURL(url)??url);
    const inv=await match(config.inventoryUrl);
    if(!inv||await digest(await inv.arrayBuffer())!==config.inventoryDigest){fail('Inventory digest mismatch');return;}
    let result=await auditCached(inventory.entries,match);
    if(data.type==='CACHE_REPAIR'){
     for(const url of [...result.missing,...result.corrupt]){
      const entry=inventory.entries.find(e=>e.url===url)!;port.postMessage({type:'CACHE_PROGRESS',requestId:data.requestId,url});
      const response=await fetch(url,{cache:'no-store'});if(!await verifyResponse(response.clone(),entry))throw new Error('Repair digest mismatch');
      await cache.put(getCacheKeyForURL(url)??url,response);
     }
     result=await auditCached(inventory.entries,match);
    }
    port.postMessage({type:'CACHE_STATUS',protocolVersion:1,requestId:data.requestId,buildId:inventory.buildId,...result,missing:legacy?[...result.missing,...result.corrupt]:result.missing});
   }catch(error){fail(String(error));}
  };
  const pending=data.type==='CACHE_REPAIR'?(repair=repair.then(task,task)):task();event.waitUntil(pending);
 });
}
