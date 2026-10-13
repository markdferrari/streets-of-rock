import {afterEach,describe,expect,it,vi} from 'vitest';
import {digest} from '../../web/cache-audit';
vi.mock('workbox-precaching',()=>({precacheAndRoute:vi.fn(),createHandlerBoundToURL:vi.fn(),cleanupOutdatedCaches:vi.fn(),getCacheKeyForURL:(url:string)=>url+'?__WB_REVISION__=digest'}));
vi.mock('workbox-routing',()=>({registerRoute:vi.fn(),NavigationRoute:class {}}));
vi.mock('workbox-core',()=>({cacheNames:{precache:'release-cache'}}));
afterEach(()=>vi.unstubAllGlobals());
async function workerFixture() {
  vi.resetModules();
  const entry={url:'/release/data.pck',bytes:4,sha256:await digest(new TextEncoder().encode('1234').buffer),category:'content'};
  const inventory={buildId:'release',entries:[entry]},inventoryBody=JSON.stringify(inventory);
  const files=new Map<string,string>([['/inventory.json?__WB_REVISION__=digest',inventoryBody]]);
  const cache={match:vi.fn(async(key:string)=>files.has(key)?new Response(files.get(key)):undefined),put:vi.fn(async(key:string,response:Response)=>{files.set(key,await response.text());})};
  let handler:(event:any)=>void=()=>{};
  vi.stubGlobal('self',{__WB_MANIFEST:[],addEventListener:(_type:string,callback:any)=>{handler=callback;}});
  vi.stubGlobal('__SOR_RELEASE__',{inventory,inventoryUrl:'/inventory.json',inventoryDigest:await digest(new TextEncoder().encode(inventoryBody).buffer)});
  vi.stubGlobal('caches',{open:async()=>cache});vi.stubGlobal('fetch',vi.fn(async()=>new Response('1234')));
  await import('../../web/sw');
  const request=(type='CACHE_STATUS',extra:Record<string,unknown>={})=>{
    const messages:any[]=[];let pending=Promise.resolve();
    handler({data:{type,protocolVersion:1,expectedBuildId:'release',requestId:crypto.randomUUID(),...extra},ports:[{postMessage:(data:any)=>messages.push(data)}],waitUntil:(task:Promise<void>)=>{pending=task;}});
    return pending.then(()=>messages.at(-1));
  };
  return {request,files,cache,entry};
}
describe('actual worker repair protocol',()=>{
  it('uses revision-aware keys and repairs missing and corrupt bytes',async()=>{
    const fixture=await workerFixture();
    expect(await fixture.request()).toMatchObject({state:'error',missing:[fixture.entry.url]});
    fixture.files.set(fixture.entry.url+'?__WB_REVISION__=digest','bad!');
    expect(await fixture.request()).toMatchObject({corrupt:[fixture.entry.url]});
    expect(await fixture.request('CACHE_REPAIR')).toMatchObject({state:'ready',missing:[],corrupt:[]});
    expect(fixture.cache.put).toHaveBeenCalledWith(fixture.entry.url+'?__WB_REVISION__=digest',expect.any(Response));
  });
  it('serializes repairs and surfaces quota denial without readiness',async()=>{
    const fixture=await workerFixture();let active=0,max=0;
    vi.stubGlobal('fetch',vi.fn(async()=>{active++;max=Math.max(max,active);await new Promise(resolve=>setTimeout(resolve,10));active--;return new Response('1234');}));
    const responses=await Promise.all([fixture.request('CACHE_REPAIR'),fixture.request('CACHE_REPAIR')]);
    expect(max).toBe(1);expect(responses.every(response=>response.state==='ready')).toBe(true);
    fixture.files.delete(fixture.entry.url+'?__WB_REVISION__=digest');fixture.cache.put.mockRejectedValueOnce(new Error('quota denied'));
    expect(await fixture.request('CACHE_REPAIR')).toMatchObject({state:'error',error:expect.stringContaining('quota denied')});
  });
  it('rejects wrong protocol/build IDs and tampered inventory',async()=>{
    const fixture=await workerFixture();
    expect(await fixture.request('CACHE_STATUS',{protocolVersion:2})).toMatchObject({state:'error'});
    expect(await fixture.request('CACHE_STATUS',{expectedBuildId:'wrong'})).toMatchObject({state:'error'});
    fixture.files.set('/inventory.json?__WB_REVISION__=digest','{}');
    expect(await fixture.request()).toMatchObject({state:'error',error:'Inventory digest mismatch'});
  });
});
