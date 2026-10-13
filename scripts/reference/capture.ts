import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { sha256 } from '../godot/setup';
import { validateReplay } from './compare';
import type { RunState, EnemyState, GameEvent, InputFrame, PlayerState } from '../../src/game/types';
export const REFERENCE='58137537a7d4ef992bd27e3fdf7efe92e5e2add1';
const reference=resolve('.tools/reference');
async function moduleAt(path:string):Promise<any>{return import(pathToFileURL(join(reference,path)).href);}
export async function capture():Promise<void> {
 mkdirSync(reference,{recursive:true});
 // Always materialize the exact commit, independent of the working tree.
 const archive=spawnSync('git',['archive',REFERENCE],{maxBuffer:64*1024*1024});
 if(archive.status!==0)throw new Error('Pinned reference commit unavailable');
 const extract=spawnSync('tar',['-x','-C',reference],{input:archive.stdout});if(extract.status!==0)throw new Error('Reference extraction failed');
 const {createRun}=await moduleAt('src/game/run.ts');const {stepRun}=await moduleAt('src/game/step.ts');
 const {FixedStepLoop}=await moduleAt('src/app/loop.ts');const {computeArenaFrame}=await moduleAt('src/presentation/camera.ts');const {buildArenaContext}=await moduleAt('src/game/arena.ts');
 const ids=['cow','crow','lion','plates'];
 const resources=JSON.parse(readFileSync('content/resources.json','utf8'));
 const contentDigest=sha256(ids.map(id=>readFileSync(join(reference,`src/content/characters/${id}.json`),'utf8')).join('')+readFileSync(join(reference,'src/content/tuning.ts'),'utf8')+readFileSync(join(reference,'src/content/neon-velvet.ts'),'utf8'));
 type Case={id:string;fighter:string;partner:string;family:string;setup?:(run:RunState)=>void;special?:boolean;viewport?:{width:number;height:number};stalls?:boolean};
 const cases:Case[]=[];
 for(const fighter of ids)for(const partner of ids)if(fighter!==partner)cases.push({id:`duo-${fighter}-${partner}`,fighter,partner,family:'selection/role/movement/light/heavy/dodge/meter/AI'});
 for(const fighter of ids)cases.push({id:`special-${fighter}`,fighter,partner:ids.find(id=>id!==fighter)!,family:'Special/status/projectile/protection/interruption',special:true});
 const enemy=(id:number,role:EnemyState['role'],x:number,depth=0):EnemyState=>({id,role,combatClass:role==='liam'?'boss':'normal',team:'enemy',position:{x,depth},facing:-1,hp:{grunt:120,zoner:180,enforcer:340,liam:1600}[role],maxHp:{grunt:120,zoner:180,enforcer:340,liam:1600}[role],action:{kind:'idle',startedTick:0,endTick:0},protectionUntilTick:0,decisionReadyTick:0,attackSlot:false,phase:1});
 const active=(run:RunState,actors:EnemyState[])=>{run.actors.push(...actors);run.encounter.status='active';run.encounter.aliveEnemyIds=actors.map(a=>a.id);run.nextEntityId=Math.max(...actors.map(a=>a.id))+1;};
 for(const role of ['grunt','zoner','enforcer','liam'] as const)cases.push({id:`enemy-${role}`,fighter:'cow',partner:'crow',family:'enemy roles/bottle/charge/boss phases',setup:run=>active(run,[enemy(3,role,2)])});
 for(const width of [667,844,915])cases.push({id:`visible-target-${width}`,fighter:'plates',partner:'lion',family:'camera/partner target/Headrest fixed aim/stable ties',special:true,viewport:{width,height:{667:375,844:390,915:412}[width]!},setup:run=>active(run,[enemy(3,'grunt',1.5),enemy(4,'zoner',15)])});
 cases.push({id:'tables-healing',fighter:'cow',partner:'crow',family:'room bounds/waves/connectors/tables/pickups',setup:run=>{run.areaIndex=1;run.actors[0]!.position={x:22,depth:-2};run.actors[0]!.hp=250;run.encounter={areaId:'vip-lounge',waveIndex:0,status:'awaitingEntry',aliveEnemyIds:[],cameraCenter:26};}});
 cases.push({id:'lethal-tie',fighter:'cow',partner:'crow',family:'terminal defeat precedence/no later ticks',setup:run=>{active(run,[enemy(3,'liam',1)]);run.actors[0]!.hp=0;run.actors[2]!.hp=0;}});
 cases.push({id:'solo-stall-pause',fighter:'lion',partner:'plates',family:'solo/fixed backlog/active pause/frame inputs',stalls:true,setup:run=>{run.actors[1]!.hp=0;(run.actors[1] as any).active=false;}});
 const fixtureDir='tests/reference/fixtures';mkdirSync(fixtureDir,{recursive:true});const manifest:any={schemaVersion:1,referenceCommit:REFERENCE,contentDigest,views:[{width:667,height:375},{width:844,height:390},{width:915,height:412}],fixtures:[],characterDigests:Object.fromEntries(ids.map(id=>[id,sha256(readFileSync(join(reference,`src/content/characters/${id}.json`)))]))};
 for(const c of cases) {
  const run:RunState=createRun(7,{fighterId:c.fighter,partnerId:c.partner});c.setup?.(run);if(c.special&&!c.setup)active(run,[enemy(3,'grunt',1.5),enemy(4,'liam',2.5)]);if(c.special)(run.actors[0] as PlayerState).specialMeter=100;
  const startingRun=structuredClone(run);const frames:any[]=[];const viewport=c.viewport??{width:844,height:390};let currentInput:InputFrame={move:{x:0,depth:0}},arena:any,events:GameEvent[]=[];
  const loop=new FixedStepLoop(()=>events.push(...stepRun(run,currentInput,undefined,arena)));let camera:any=null;let timestampMs=0;
  for(let index=0;index<30;index++) {
   timestampMs+=c.stalls&&index===10?2000:100;
   currentInput={move:{x:index<12?.8:0,depth:index%5===0?.25:0},requests:index%6===1?[{kind:c.special&&index===1?'special':['light','heavy','dodge'][Math.floor(index/6)%3] as any,sourcePointerId:2,order:index}]:[],canceledPointerIds:index===3?[2]:[]};
   camera=computeArenaFrame(run,viewport,{player:resources.bodyEnvelopes[c.fighter],partner:resources.bodyEnvelopes[c.partner]},camera,.1);
   arena=buildArenaContext(run,camera,resources.bodyEnvelopes[c.partner],'partner');arena.playerVisibleRegions=buildArenaContext(run,camera,resources.bodyEnvelopes[c.fighter],'player').visibleRegions;
   events=[];const running=!(c.stalls&&index>=15&&index<=17);const steps=loop.frame(timestampMs,running);
   frames.push({timestampMs,running,viewport,input:structuredClone(currentInput),arena:structuredClone(arena),events:structuredClone(events),steps,discardedMs:loop.discardedMs,state:structuredClone(run)});
  }
  const fixture={schemaVersion:1,referenceCommit:REFERENCE,contentDigest,scenarioId:c.id,requirements:['FR-001','FR-003','FR-004','FR-005','FR-006','FR-007'],family:c.family,startingRun,frames};
  const errors=validateReplay(fixture);if(errors.length)throw new Error(errors.join('\n'));
  const text=JSON.stringify(fixture)+'\n';writeFileSync(`${fixtureDir}/${c.id}.json`,text);manifest.fixtures.push({id:c.id,family:c.family,path:`fixtures/${c.id}.json`,sha256:sha256(text)});
 }
 writeFileSync('tests/reference/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(`Captured ${cases.length} pinned-reference fixtures`);
}
if(import.meta.main)await capture();
