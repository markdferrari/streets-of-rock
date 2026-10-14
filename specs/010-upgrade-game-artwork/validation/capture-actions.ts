// Development evidence only: drive the existing exported test game, without changing it.
import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const dir='specs/010-upgrade-game-artwork/validation/evidence/baseline-actions';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});const records=[];
const inventory=JSON.parse(readFileSync([...new Bun.Glob('dist-test/releases/*/asset-inventory.json').scanSync('.')][0]!, 'utf8'));
for(const [fighter,partner] of [['cow','crow'],['lion','plates']]){
 const page=await browser.newPage({viewport:{width:844,height:390}});await page.goto('http://127.0.0.1:4181/');
 const snapshot=()=>page.evaluate(()=>(window as any).__sorTest.snapshot());
 const command=(name:string,value?:unknown)=>page.evaluate(({name,value})=>(window as any).__sorTest.command(name,value),{name,value});
 const control=async(id:string)=>{const state=await snapshot(),b=state.bounds[id];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});};
 const capture=async(name:string)=>{const path=`${dir}/${fighter}-${name}.png`,state=await snapshot();await page.screenshot({path});records.push({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),state});};
 await page.waitForFunction(()=>(window as any).__sorTest?.snapshot()?.phase==='selecting');
 for(const id of [fighter,fighter,partner,partner])await control(`character-${id}`);
 await page.waitForFunction(()=>(window as any).__sorTest.snapshot().phase==='running');
 for(const move of ['light','heavy','dodge','special']){
  await command('stage-hit');if(move==='special')await command('meter',100);
  await control(move);await page.waitForFunction(move=>(window as any).__sorTest.snapshot().acceptedMoves.includes(move),move);
  await capture(move);await page.waitForTimeout(1000);
 }
 for(const x of [17,35,53]){await command('position',{x,depth:0});await page.waitForTimeout(150);await capture(`connector-${x}`);}
 await command('room',3);await page.waitForFunction(()=>(window as any).__sorTest.snapshot().run.actors.some((a:any)=>a.role==='liam'&&a.hp>0));await capture('liam-phase-1');
 // Use real strikes to reach phase two; record a missing view honestly if the budget expires.
 let phase2=false;
 for(let attempt=0;attempt<65;attempt++){
  const state=await snapshot();const boss=state.run.actors.find((a:any)=>a.role==='liam'&&a.hp>0);
  if(!boss||state.phase!=='running')break;
  if(boss.phase===2){await capture('liam-phase-2');phase2=true;break;}
  await command('position',{x:boss.position.x-1.0,depth:boss.position.depth});
  await control('heavy');await page.waitForTimeout(650);
 }
 if(!phase2)records.push({subject:`${fighter}-liam-phase-2`,status:'pending',reason:'No phase-two snapshot reached within capture attempt budget'});
 await page.close();
}
writeFileSync(`${dir}/captures.json`,JSON.stringify({sourceCommit:'71f148a412bf39e1b50855ed7901736a3eb0990b',buildId:inventory.buildId,inventorySha256:createHash('sha256').update(JSON.stringify(inventory)).digest('hex'),note:'Snapshots sampled immediately before screenshot; browser may advance a frame. Use recorded state/camera for matched comparisons, not exact frame contact proof.',captures:records},null,2)+'\n');
await browser.close();console.log(`Recorded ${records.length} action/connector/boss outcomes`);
