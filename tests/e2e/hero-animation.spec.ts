import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
test.use({video:{mode:'on',size:{width:844,height:390}}});
const snapshot=async(page:any)=>page.evaluate(()=>(window as any).__sorHeroReview?.snapshot());
const command=async(page:any,name:string,value?:unknown)=>page.evaluate(({name,value}:any)=>(window as any).__sorHeroReview.command(name,value),{name,value});
for(const character of ['cow','crow','lion','plates'])test(`${character} compares current, KayKit and Universal with isolated paused sampling`,async({page,browserName})=>{
 await page.setViewportSize({width:844,height:390});
 await page.goto(`/?fixture=hero-animation&character=${character}`);
 await expect.poll(()=>snapshot(page).then((s:any)=>s?.errors??['not ready']),{timeout:20000}).toEqual([]);
 await expect.poll(()=>snapshot(page).then((s:any)=>s?.ready)).toBe(true);
 await command(page,'pause',true);
 let state=await snapshot(page);
 expect(state.errors).toEqual([]);expect(Object.keys(state.views)).toEqual(['current','kaykit','universal']);
 expect(new Set(Object.values(state.views).map((v:any)=>v.skeletonId)).size).toBe(3);
 const dir='specs/011-improve-character-animations/reviews/comparisons';mkdirSync(dir,{recursive:true});
 for(const facing of [-1,1])for(const action of ['Idle','Move','Attack']){
  await command(page,'facing',facing);await command(page,'action',action);
  await command(page,'pause',false);
  const longest=Math.max(...Object.values((await snapshot(page)).views).map((v:any)=>v.duration));
  await page.waitForTimeout(Math.ceil(longest*1000)+150);await command(page,'pause',true);await command(page,'sample',0.5);
  state=await snapshot(page);
  for(const view of Object.values(state.views) as any[]){expect(view.semantic).toBe(action);expect(view.facing).toBe(facing);expect(view.playing).toBe(false);expect(view.boneCount).toBeGreaterThan(6);expect(view.bones.length).toBe(view.boneCount);}
  const frozen=state.views;await page.waitForTimeout(100);expect((await snapshot(page)).views).toEqual(frozen);
  await page.screenshot({path:`${dir}/${browserName}-${character}-${action.toLowerCase()}-face${facing}.png`});
 }
 await command(page,'action','Move');await command(page,'sample',0.2);const first=await snapshot(page);
 await command(page,'sample',0.7);const second=await snapshot(page);
 for(const source of ['kaykit','universal'])expect(second.views[source].bones).not.toEqual(first.views[source].bones);
 await command(page,'pause',false);await expect.poll(()=>snapshot(page).then((s:any)=>s.elapsed)).toBeGreaterThan(second.elapsed);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await expect.poll(()=>snapshot(page).then((s:any)=>s.paused)).toBe(true);
 const video=page.video();await page.close();if(video)await video.saveAs(`${dir}/${browserName}-${character}.webm`);
});
