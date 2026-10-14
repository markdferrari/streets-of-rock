import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {game,canvasControl,selectDuo} from './helpers/godot';
test('normal encounters render approved Grunt and bartender rigs with frozen poses while paused',async({page,browserName})=>{
 const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});
 await page.setViewportSize({width:844,height:390});await selectDuo(page,'cow','crow');
 await expect.poll(()=>game(page).then(s=>Object.values(s.enemyArt.views).filter((v:any)=>v.role==='grunt').length)).toBeGreaterThan(0);
 await page.evaluate(()=>(window as any).__sorTest.command('room',1));
 await expect.poll(()=>game(page).then(s=>Object.values(s.enemyArt.views).filter((v:any)=>v.role==='zoner').length)).toBe(2);
 await canvasControl(page,'pause');await expect.poll(()=>game(page).then(s=>s.phase)).toBe('paused');
 const before=await game(page);await page.waitForTimeout(200);const after=await game(page);
 expect(after.run.tick).toBe(before.run.tick);expect(after.enemyArt).toEqual(before.enemyArt);
 expect(after.enemyArt.errors).toEqual([]);expect(after.ownedInstances).toBe(2+after.enemyArt.ownedInstances);expect(errors).toEqual([]);
 const output='specs/010-upgrade-game-artwork/reviews/gameplay-enemies';mkdirSync(output,{recursive:true});
 await page.screenshot({path:`${output}/${browserName}-bar.png`});
});
test('Grunts pursue both axes and the rendered running pose turns with them',async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,'cow','crow');
 await page.evaluate(()=>{const test=(window as any).__sorTest;test.command('solo');test.command('position',{x:12,depth:2.5});});
 const before=await game(page),grunt=before.run.actors.find((a:any)=>a.role==='grunt'&&a.hp>0);
 await expect.poll(async()=>{
  const state=await game(page),actor=state.run.actors.find((a:any)=>a.id===grunt.id),pose=state.enemyArt.views[String(grunt.id)]?.pose;
  return actor.position.x>grunt.position.x&&actor.position.depth>grunt.position.depth&&actor.facing===1&&pose?.semantic==='Move'&&pose.facing===1;
 }).toBe(true);
 const turning=await game(page),position=turning.run.actors.find((a:any)=>a.id===grunt.id).position;
 await page.evaluate(()=>(window as any).__sorTest.command('position',{x:0,depth:-2.5}));
 await expect.poll(async()=>{
  const state=await game(page),actor=state.run.actors.find((a:any)=>a.id===grunt.id),pose=state.enemyArt.views[String(grunt.id)]?.pose;
  return actor.position.x<position.x&&actor.position.depth<position.depth&&actor.facing===-1&&pose?.semantic==='Move'&&pose.facing===-1;
 }).toBe(true);
});
test('bartender bottles follow the warned aim after the player moves',async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,'cow','crow');
 await page.evaluate(()=>{const test=(window as any).__sorTest;test.command('solo');test.command('room',1);});
 let throwing:any;
 await expect.poll(async()=>{const state=await game(page);throwing=state.run.actors.find((a:any)=>a.role==='zoner'&&a.action.kind==='windup'&&a.action.aimPosition);return !!throwing;}).toBe(true);
 const aim=throwing.action.aimPosition,origin=throwing.position;
 await page.evaluate((x)=>(window as any).__sorTest.command('position',{x,depth:2.5}),aim.x);
 let bottle:any;
 await expect.poll(async()=>{const state=await game(page);bottle=state.run.projectiles.find((p:any)=>p.ownerId===throwing.id);return !!bottle;}).toBe(true);
 const dx=aim.x-origin.x,depth=aim.depth-origin.depth,distance=Math.hypot(dx,depth);
 expect(bottle.velocity.x).toBeCloseTo(dx/distance*5/60,6);
 expect(bottle.velocity.depth).toBeCloseTo(depth/distance*5/60,6);
});
