export type CacheResult={type:'CACHE_STATUS';protocolVersion:1;requestId:string;buildId:string;missing:string[];corrupt:string[];state:'ready'|'error';error?:string};
export function requestCache(worker:ServiceWorker|null,buildId:string,repair=false,onProgress?:(data:unknown)=>void):Promise<CacheResult> {
 const requestId=crypto.randomUUID();const failed=(error:string):CacheResult=>({type:'CACHE_STATUS',protocolVersion:1,requestId,buildId,missing:[],corrupt:[],state:'error',error});
 if(!worker)return Promise.resolve(failed('Offline cache unavailable'));
 return new Promise(resolve=>{
  const channel=new MessageChannel();let done=false;let idle:ReturnType<typeof setTimeout>;
  const finish=(value:CacheResult)=>{if(done)return;done=true;clearTimeout(idle);clearTimeout(total);channel.port1.close();resolve(value);};
  const reset=()=>{clearTimeout(idle);idle=setTimeout(()=>finish(failed('Cache audit idle timeout')),10000);};
  const total=setTimeout(()=>finish(failed('Cache audit deadline exceeded')),120000);reset();
  channel.port1.onmessage=event=>{
   const data=event.data;if(data?.requestId!==requestId)return;
   if(data.type==='CACHE_PROGRESS'){onProgress?.(data);reset();return;}
   if(data.type!=='CACHE_STATUS'||data.protocolVersion!==1||data.buildId!==buildId||!Array.isArray(data.missing)||!Array.isArray(data.corrupt)||!['ready','error'].includes(data.state)){finish(failed('Cache reply release/protocol mismatch'));return;}
   const validPaths=(items:unknown[])=>items.every(item=>typeof item==='string');
   if(!validPaths(data.missing)||!validPaths(data.corrupt)){finish(failed('Cache reply contains invalid paths'));return;}
   finish({...data,state:data.state==='ready'&&!data.missing.length&&!data.corrupt.length?'ready':'error'});
  };
  channel.port1.onmessageerror=()=>finish(failed('Cache reply could not be decoded'));
  try{worker.postMessage({type:repair?'CACHE_REPAIR':'CACHE_STATUS',protocolVersion:1,expectedBuildId:buildId,requestId},[channel.port2]);}
  catch(error){finish(failed(`Cache request failed: ${String(error)}`));}
 });
}
