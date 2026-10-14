import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {serveFile} from '../preview';
import {writeFile,mkdir} from 'node:fs/promises';
const server=createServer((req,res)=>{const file=serveFile('dist-test',req.url??'/');res.writeHead(file.status,file.headers);res.end(file.body);});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const address=server.address();if(!address||typeof address==='string')throw new Error('No local address');
const browser=await chromium.launch({headless:true});
const results=[];
try{
 await mkdir('specs/009-godot-rewrite/reviews/characters',{recursive:true});
 for(const fighter of ['lion','plates']){
  const page=await browser.newPage({viewport:{width:844,height:390}});await page.goto(`http://127.0.0.1:${address.port}`);
  await page.getByRole('button',{name:'Cow',exact:true}).waitFor({timeout:60000});
  for(const name of [fighter,fighter,fighter==='lion'?'plates':'lion',fighter==='lion'?'plates':'lion']){
   const button=page.getByRole('button',{name:name[0]!.toUpperCase()+name.slice(1),exact:true});await button.focus();await page.keyboard.press('Enter');
  }
  await page.getByRole('button',{name:'Light',exact:true}).waitFor({timeout:10000});await page.locator('canvas').click({position:{x:420,y:180}});
  const keys=new Set<string>(),rooms=new Set<number>();let latest:any,start=Date.now(),lastLog=0;
  while(Date.now()-start<240000){
   latest=await page.evaluate(()=>(window as any).__sorTest.snapshot());rooms.add(latest.run.areaIndex);
   if(latest.phase!=='running')break;
   const player=latest.run.actors[0],enemies=latest.run.actors.filter((actor:any)=>actor.team==='enemy'&&actor.hp>0);
   enemies.sort((a:any,b:any)=>Math.hypot(a.position.x-player.position.x,a.position.depth-player.position.depth)-Math.hypot(b.position.x-player.position.x,b.position.depth-player.position.depth));
   const target=enemies[0],dx=target?target.position.x-player.position.x:10,depth=target?target.position.depth-player.position.depth:-player.position.depth;
   const desired=new Set<string>();
   if(Math.abs(dx)>(target?0.95:0))desired.add(dx>0?'d':'a');
   else if(target&&player.facing!==(dx>=0?1:-1))desired.add(dx>=0?'d':'a');
   if(Math.abs(depth)>0.18)desired.add(depth>0?'s':'w');
   for(const key of keys)if(!desired.has(key)){await page.keyboard.up(key);keys.delete(key);}
   for(const key of desired)if(!keys.has(key)){await page.keyboard.down(key);keys.add(key);}
   if(target){await page.keyboard.press(player.specialMeter>=100?'l':'k');}
   if(Date.now()-lastLog>10000){lastLog=Date.now();console.log(fighter,latest.phase,'room',latest.run.areaIndex,'hp',Math.round(player.hp),'enemy',enemies.length,'x',player.position.x.toFixed(1));}
   await page.waitForTimeout(180);
  }
  for(const key of keys)await page.keyboard.up(key);
  const buildId=await page.evaluate(()=>(window as any).SorBoot.buildId);
  const result={fighter,partner:fighter==='lion'?'plates':'lion',buildId,outcome:latest.phase,rooms:[...rooms],elapsedMs:latest.elapsedMs,wallMs:Date.now()-start,hp:latest.run.actors[0].hp,runTick:latest.run.tick,method:'Read-only snapshots; native WASD/Heavy/Special input only, no fixture commands or state changes.'};
  console.log(JSON.stringify(result));results.push(result);
  await page.screenshot({path:`specs/009-godot-rewrite/reviews/characters/${fighter}-full-run.png`});await page.close();
 }
 await mkdir('specs/009-godot-rewrite/reviews/characters',{recursive:true});await writeFile('specs/009-godot-rewrite/reviews/characters/full-run-results.json',JSON.stringify(results,null,2)+'\n');
}finally{await browser.close();await new Promise<void>(resolve=>server.close(()=>resolve()));}
