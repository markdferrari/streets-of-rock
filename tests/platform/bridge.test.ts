import {describe,expect,it} from 'vitest';
import {BrowserAdapter,type Environment,type BrowserHost} from '../../web/browser';
const environment:Environment={width:844,height:390,dpr:1.5,safeInsets:{top:0,right:0,bottom:0,left:0},visible:true,focused:true,portrait:false,reducedMotion:false};
function fixture(){let watch:(()=>void)|null=null;let env={...environment};let denied=false;const stored=new Map([['sor.settings.v1','{"schemaVersion":1}']]);const events:any[]=[];const host:BrowserHost={environment:()=>env,read:key=>{if(denied)throw new Error('denied');return stored.get(key)??null;},write:(key,value)=>{if(denied)throw new Error('denied');stored.set(key,value);},watch:cb=>{watch=cb;return()=>{watch=null;};}};const adapter=new BrowserAdapter(host,'a'.repeat(64));return{adapter,events,stored,deny:()=>{denied=true;},change:(next:Partial<Environment>)=>{env={...env,...next};watch?.();},watched:()=>!!watch};}
describe('versioned browser capability boundary',()=>{
 it('keeps the bridge event type when worker detail includes its protocol type',()=>{
  const f=fixture();f.adapter.initialize(json=>f.events.push(JSON.parse(json)));
  f.adapter.notify('cacheStatus',{type:'CACHE_STATUS',state:'ready'});
  expect(f.events).toEqual([{type:'cacheStatus',state:'ready'}]);
 });
 it('retains early cache and update status until Godot connects its callback',()=>{
  const f=fixture();f.adapter.notify('cacheStatus',{state:'ready',buildId:'release'});f.adapter.notify('updateWaiting',{waiting:true});
  f.adapter.initialize(json=>f.events.push(JSON.parse(json)));
  expect(f.events).toEqual([{type:'cacheStatus',state:'ready',buildId:'release'},{type:'updateWaiting',waiting:true}]);
 });
 it('retains callback for synchronous semantic gesture and rejects stale or disabled activation',()=>{
  const f=fixture();f.adapter.initialize(json=>f.events.push(JSON.parse(json)));
  f.adapter.publishUi(JSON.stringify({generation:2,controls:[{id:'activate',role:'button',name:'Activate',bounds:{x:0,y:0,width:100,height:50}},{id:'disabled',role:'button',name:'Disabled',disabled:true,bounds:{x:0,y:0,width:100,height:50}}]}));
  expect(f.adapter.intent(1,'activate','activate')).toBe(false);expect(f.adapter.intent(2,'disabled','activate')).toBe(false);expect(f.adapter.intent(2,'unknown','activate')).toBe(false);
  expect(f.adapter.intent(2,'activate','activate')).toBe(true);
  expect(f.events.filter(e=>e.type==='uiIntent')).toEqual([{type:'uiIntent',generation:2,id:'activate',kind:'activate'}]);
 });
 it('reports interruption and safe return without auto-resume, then unregisters listeners',()=>{
  const f=fixture();f.adapter.initialize(json=>f.events.push(JSON.parse(json)));expect(f.watched()).toBe(true);
  f.change({visible:false});f.change({visible:true});
  expect(f.events.filter(e=>e.type==='environment').map(e=>e.environment.visible)).toEqual([false,true]);
  expect(f.events.some(e=>e.type==='resume')).toBe(false);f.adapter.dispose();expect(f.watched()).toBe(false);
 });
 it('keeps raw persistence behind three keys with denial fallback',()=>{
  const f=fixture();const snapshot=f.adapter.initialize(()=>{});expect(snapshot.buildId).toBe('a'.repeat(64));expect(snapshot.stored['sor.settings.v1'].value).toBe('{"schemaVersion":1}');
  expect(f.adapter.readStored('arbitrary').ok).toBe(false);expect(f.adapter.writeStored('arbitrary','bad').ok).toBe(false);
  f.deny();expect(f.adapter.readStored('sor.settings.v1').ok).toBe(false);expect(f.adapter.writeStored('sor.settings.v1','{}').ok).toBe(false);
 });
 it('rejects unsupported protocol and invalid geometry',()=>{
  const f=fixture();expect(()=>f.adapter.initialize(()=>{},2)).toThrow(/protocol/i);
  f.change({width:0});expect(()=>f.adapter.initialize(()=>{})).toThrow(/geometry/i);
 });
});
it('forwards native touch cancellation without translating actions or guessing pointer IDs',()=>{
 const events:any[]=[];let cancel:((indices:number[])=>void)|undefined;
 const adapter=new BrowserAdapter({environment:()=>environment,read:()=>null,write:()=>{},watch:(_env,onCancel)=>{cancel=onCancel;return()=>{};}},'a'.repeat(64));
 adapter.initialize(json=>events.push(JSON.parse(json)));cancel?.([7]);
 expect(events).toEqual([{type:'touchCancel',indices:[7]}]);
});
