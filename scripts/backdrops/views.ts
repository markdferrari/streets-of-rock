import {chromium} from '@playwright/test';
import {spawn} from 'node:child_process';
import {setTimeout as sleep} from 'node:timers/promises';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const final=process.argv.includes('--final');
const dir=`specs/009-godot-rewrite/reviews/${final?'final':'concepts'}`;mkdirSync(dir,{recursive:true});
const server=spawn('bun',['scripts/preview.ts','--dir','dist-test','--port','4184'],{stdio:['ignore','ignore','inherit']});
const records=[];const settings=['outside-entrance','bar','dance-floor','stage-vip'];const duos=[['cow','crow'],['crow','lion'],['lion','plates'],['plates','cow']];
try{for(let i=0;i<50;i++){try{if((await fetch('http://127.0.0.1:4184')).ok)break;}catch{}await sleep(100);}
const browser=await chromium.launch();
for(let index=0;index<4;index++){
 const page=await browser.newPage({viewport:{width:844,height:390}});const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});
 await page.goto('http://127.0.0.1:4184');const snapshot=()=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
 for(let i=0;i<100&&!(await snapshot())?.ready;i++)await page.waitForTimeout(100);
 const [fighter,partner]=duos[index]!;
 for(const id of [fighter,fighter,partner,partner]){const b=(await snapshot()).bounds[`character-${id}`];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
 for(let i=0;i<100&&(await snapshot()).phase!=='running';i++)await page.waitForTimeout(100);
 await page.evaluate((room:number)=>(window as any).__sorTest.command('room',room),index);
 if(!final)await page.evaluate(()=>(window as any).__sorTest.command('concepts'));
 await page.waitForTimeout(250);
 const path=`${dir}/${settings[index]}.png`;await page.screenshot({path});
 const record={setting:settings[index],width:844,height:390,path,duo:{fighter,partner},buildId:JSON.parse(readFileSync('.tools/staging/dist-test/report.json','utf8')).buildId,snapshot:await snapshot(),errors,transitions:[] as {path:string;snapshot:unknown}[]};
 if(final&&index<3){
  for(let attempt=0;attempt<3&&(await snapshot()).run.encounter.status!=='cleared';attempt++){await page.evaluate(()=>(window as any).__sorTest.command('clear-wave'));await page.waitForTimeout(100);}
  if((await snapshot()).run.encounter.status!=='cleared')throw new Error('Expected actual clearance');
  for(const mode of ['cleared','connector']){
   if(mode==='connector'){await page.evaluate((x:number)=>(window as any).__sorTest.command('position',{x,depth:0}),17+18*index);await page.waitForTimeout(200);}
   const transitionPath=`${dir}/${settings[index]}-${mode}.png`;await page.screenshot({path:transitionPath});record.transitions.push({path:transitionPath,snapshot:await snapshot()});
  }
 }
 records.push(record);if(errors.length)throw new Error(errors.join('\n'));await page.close();
}
writeFileSync(`${dir}/manifest.json`,JSON.stringify(records,null,2)+'\n');await browser.close();}finally{server.kill();}
