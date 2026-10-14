import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const dir='specs/010-upgrade-game-artwork/validation/evidence/baseline-views';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});const records=[];
for(const [width,height] of [[667,375],[844,390],[915,412]]){
 const page=await browser.newPage({viewport:{width:width!,height:height!}});await page.goto('http://127.0.0.1:4181/');
 await page.waitForFunction(()=>(window as any).__sorTest?.snapshot()?.phase==='selecting');
 for(const id of ['cow','cow','crow','crow']){const state=await page.evaluate(()=>(window as any).__sorTest.snapshot());const b=state.bounds[`character-${id}`];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
 await page.waitForFunction(()=>(window as any).__sorTest.snapshot().phase==='running');
 for(let room=0;room<4;room++){
  await page.evaluate(room=>(window as any).__sorTest.command('room',room),room);await page.waitForFunction(room=>{const s=(window as any).__sorTest.snapshot();return s.run.areaIndex===room&&s.run.encounter.status==='active';},room);
  for(const view of ['entry','center','right-edge']){
   if(view!=='entry'){await page.evaluate(x=>(window as any).__sorTest.command('position',{x,depth:0}),room*18+(view==='center'?8:15));await page.waitForTimeout(150);}
   const path=`${dir}/${width}-${room}-${view}.png`;const state=await page.evaluate(()=>(window as any).__sorTest.snapshot());await page.screenshot({path});records.push({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),viewport:{width,height},state});
  }
 }
 await page.close();
}
writeFileSync(`${dir}/captures.json`,JSON.stringify({sourceCommit:'71f148a412bf39e1b50855ed7901736a3eb0990b',build:JSON.parse(readFileSync([...new Bun.Glob('dist-test/releases/*/asset-inventory.json').scanSync('.')][0]!, 'utf8')),captures:records},null,2)+'\n');
await browser.close();console.log(`Captured ${records.length} baseline views`);
