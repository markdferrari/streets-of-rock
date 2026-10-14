export type Environment={width:number;height:number;dpr:number;safeInsets:{top:number;right:number;bottom:number;left:number};visible:boolean;focused:boolean;portrait:boolean;reducedMotion:boolean};
export type UiDescriptor={id:string;role:'button'|'slider'|'checkbox'|'heading'|'meter'|'dialog';name:string;text?:string;disabled?:boolean;pressed?:boolean;focused?:boolean;value?:number;min?:number;max?:number;focusOrder?:number;liveRegion?:'off'|'polite'|'assertive';visible?:boolean;bounds:{x:number;y:number;width:number;height:number};};
export type BrowserHost={environment():Environment;read(key:string):string|null;write(key:string,value:string):void;watch(callback:()=>void,onCancel?:(indices:number[])=>void):()=>void;render?(generation:number,descriptors:UiDescriptor[],intent:(id:string,kind:string,value?:unknown)=>void):void;};
import { SemanticProjection, validateSemanticDescriptor } from './semantics';
const keys=['sor.settings.v1','streets-of-rock.best.v1','streets-of-rock.tutorial.v1'];
export class BrowserAdapter {
 readonly apiVersion=1;
 private callback:((json:string)=>void)|null=null;
 private pendingStatus=new Map<string,unknown>();
 private unwatch:(()=>void)|null=null;
 private generation=-1;
 private controls=new Map<string,UiDescriptor>();
 constructor(private host:BrowserHost,private buildId:string,private mode='release'){}
 private environment():Environment {
  const env=this.host.environment();
  if(![env.width,env.height,env.dpr].every(n=>Number.isFinite(n)&&n>0))throw new Error('Invalid environment geometry');
  return env;
 }
 initialize(callback:(json:string)=>void,version=1){
  if(version!==this.apiVersion)throw new Error('Unsupported browser protocol');
  const environment=this.environment();this.dispose();this.callback=callback;
  for(const value of this.pendingStatus.values())callback(JSON.stringify(value));this.pendingStatus.clear();
  this.unwatch=this.host.watch(()=>{this.emit({type:'environment',environment:this.environment()});},indices=>this.emit({type:'touchCancel',indices}));
  return {apiVersion:this.apiVersion,environment,buildId:this.buildId,mode:this.mode,stored:Object.fromEntries(keys.map(key=>[key,this.readStored(key)]))};
 }
 initializeJson(callback:(json:string)=>void,version=1):string{return JSON.stringify(this.initialize(callback,version));}
 private emit(value:unknown):void{
  if(this.callback){this.callback(JSON.stringify(value));return;}
  if(value&&typeof value==='object'&&['cacheStatus','updateWaiting'].includes(String((value as {type?:unknown}).type)))this.pendingStatus.set(String((value as {type:string}).type),value);
 }
 notify(type:string,detail:Record<string,unknown>={}):void{this.emit({...detail,type});}
 readStored(key:string){
  if(!keys.includes(key))return {ok:false,error:'Key is not allowlisted',value:null};
  try{return {ok:true,value:this.host.read(key)};}catch{return {ok:false,error:'Storage unavailable',value:null};}
 }
 writeStored(key:string,value:string){
  if(!keys.includes(key)||typeof value!=='string')return {ok:false,error:'Invalid storage operation'};
  try{this.host.write(key,value);return {ok:true};}catch{return {ok:false,error:'Storage unavailable'};}
 }
 readStoredJson(key:string):string{return JSON.stringify(this.readStored(key));}
 writeStoredJson(key:string,value:string):string{return JSON.stringify(this.writeStored(key,value));}
 publishUi(json:string):void {
  const value=JSON.parse(json) as {generation:number;controls:UiDescriptor[]};
  if(!Number.isSafeInteger(value.generation)||value.generation<this.generation||!Array.isArray(value.controls))return;
  const controls=new Map<string,UiDescriptor>();
  const env=this.environment(),left=env.safeInsets.left,right=env.width-env.safeInsets.right,top=env.safeInsets.top,bottom=env.height-env.safeInsets.bottom;
  for(const source of value.controls){if(!validateSemanticDescriptor(source)||controls.has(source.id))throw new Error('Invalid semantic descriptor');const d={...source,bounds:{...source.bounds}};d.bounds.x=Math.min(Math.max(left,d.bounds.x),right);d.bounds.y=Math.min(Math.max(top,d.bounds.y),bottom);d.bounds.width=Math.max(0,Math.min(d.bounds.width,right-d.bounds.x));d.bounds.height=Math.max(0,Math.min(d.bounds.height,bottom-d.bounds.y));if(!d.bounds.width||!d.bounds.height)d.visible=false;controls.set(d.id,d);}
  this.generation=value.generation;this.controls=controls;
  this.host.render?.(value.generation,[...controls.values()],(id,kind,v)=>this.intent(value.generation,id,kind,v));
 }
 intent(generation:number,id:string,kind:string,value?:unknown):boolean {
  const control=this.controls.get(id);
  if(!this.callback||generation!==this.generation||!control||control.disabled||!['focus','activate','key','value'].includes(kind))return false;
  if(kind==='value'&&(typeof value!=='number'||!Number.isFinite(value)||control.min!==undefined&&value<control.min||control.max!==undefined&&value>control.max))return false;
  this.emit({type:'uiIntent',generation,id,kind,...value===undefined?{}:{value}});return true;
 }
 dispose():void{this.unwatch?.();this.unwatch=null;this.callback=null;}
}
export function installBrowser(win:Window,doc:Document,buildId:string,mode='release'):BrowserAdapter {
 let adapter:BrowserAdapter;
 const probe=doc.createElement('div');probe.style.cssText='position:fixed;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';doc.body.append(probe);
 let focused=doc.hasFocus();
 const layer=doc.getElementById('semantics')!;let dispatch:(id:string,kind:string,value?:unknown)=>void=()=>{};let projection:SemanticProjection;
 const host:BrowserHost={
  environment:()=>{const style=win.getComputedStyle(probe);return {width:win.innerWidth,height:win.innerHeight,dpr:Math.min(win.devicePixelRatio||1,1.5),safeInsets:{top:parseFloat(style.paddingTop)||0,right:parseFloat(style.paddingRight)||0,bottom:parseFloat(style.paddingBottom)||0,left:parseFloat(style.paddingLeft)||0},visible:doc.visibilityState!=='hidden',focused,portrait:win.innerHeight>win.innerWidth,reducedMotion:win.matchMedia('(prefers-reduced-motion: reduce)').matches};},
  read:key=>win.localStorage.getItem(key),write:(key,value)=>win.localStorage.setItem(key,value),
  watch:(callback,onCancel)=>{
   const resize=()=>{const canvas=doc.querySelector('canvas')!;const env=host.environment();canvas.width=Math.round(env.width*env.dpr);canvas.height=Math.round(env.height*env.dpr);callback();};
   const focus=()=>{focused=true;callback();},blur=()=>{focused=false;callback();};
   const touchCancel:EventListener=event=>onCancel?.(Array.from((event as TouchEvent).changedTouches,touch=>touch.identifier));
   const canvas=doc.querySelector('canvas')!;
   const contextListeners:[EventTarget,string,EventListener,boolean?][]=[[canvas,'webglcontextlost',event=>{event.preventDefault();adapter.notify('contextLost');},true],[canvas,'webglcontextrestored',()=>adapter.notify('contextRestored'),true]];
   const listeners:[EventTarget,string,EventListener,boolean?][]=[[canvas,'touchcancel',touchCancel,true],[doc,'visibilitychange',callback],[win,'focus',focus],[win,'blur',blur],[win,'resize',resize],[win,'orientationchange',resize],[win.matchMedia('(prefers-reduced-motion: reduce)'),'change',callback]];
   for(const [target,event,listener,capture] of [...listeners,...contextListeners])target.addEventListener(event,listener,capture);
   return()=>{for(const [target,event,listener,capture] of [...listeners,...contextListeners])target.removeEventListener(event,listener,capture);};
  },
  render:(generation,descriptors,intent)=>{dispatch=intent;projection.render(generation,descriptors);}
 };
 projection=new SemanticProjection(layer,(id,kind,value)=>dispatch(id,kind,value));
 adapter=new BrowserAdapter(host,buildId,mode);
 return adapter;
}
