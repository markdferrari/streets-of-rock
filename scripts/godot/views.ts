import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const server=spawn('bun',['scripts/preview.ts','--dir','dist-test','--port','4184'],{stdio:['ignore','ignore','inherit']});
const dir='specs/009-godot-rewrite/validation/evidence/us1-views';mkdirSync(dir,{recursive:true});
const records=[];
try{for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:4184')).ok)break;}catch{}await sleep(100);}
const browser=await chromium.launch();
for(const [width,height] of [[667,375],[844,390],[915,412]]){
 const page=await browser.newPage({viewport:{width,height}});page.on('console',m=>{if(m.type()==='error')console.error(m.text());});await page.goto('http://127.0.0.1:4184');
 const snapshot=()=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
 for(let i=0;i<100&&!(await snapshot())?.ready;i++)await page.waitForTimeout(100);
 for(const id of ['cow','cow','crow','crow']){const b=(await snapshot()).bounds[`character-${id}`];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
 for(let i=0;i<100&&(await snapshot()).phase!=='running';i++)await page.waitForTimeout(100);
 await page.evaluate(()=>(window as any).__sorTest.command('stage-hit'));await page.waitForTimeout(120);
 const path=`${dir}/${width}x${height}.png`;await page.screenshot({path});records.push({width,height,path,buildId:JSON.parse(readFileSync('.tools/staging/dist-test/report.json','utf8')).buildId,snapshot:await snapshot()});await page.close();}
writeFileSync(`${dir}/manifest.json`,JSON.stringify(records,null,2)+'\n');await browser.close();}finally{server.kill();}
