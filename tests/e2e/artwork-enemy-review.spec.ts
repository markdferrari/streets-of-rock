import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
import {game,canvasControl,selectDuo} from './helpers/godot';
test('neutral enemy review shows unobscured silhouettes, attack reach and both boss phases',async({page,browserName})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,'cow','crow');await canvasControl(page,'pause');
 await page.evaluate(()=>(window as any).__sorTest.command('enemy-neutral'));
 await expect.poll(()=>game(page).then(s=>s.scenery.kind)).toBe('neutral-review');
 const dir='specs/010-upgrade-game-artwork/reviews/enemies-final';mkdirSync(dir,{recursive:true});
 for(const [role,moves] of Object.entries({grunt:['grunt'],zoner:['throw'],enforcer:['charge'],liam:['close','rope','shockwave']}))for(const phase of role==='liam'?[1,2]:[1])for(const facing of [-1,1])for(const move of moves){
  await page.evaluate(value=>(window as any).__sorTest.command('enemy-art',value),{role,phase,facing,semantic:`${move}.active`});
  await expect.poll(()=>game(page).then(s=>s.enemyArt.views['900']?.pose.semantic)).toBe(`${move}.active`);
  const state=await game(page);expect(state.enemyArt.errors).toEqual([]);expect(state.enemyArt.views['900'].phaseOverlay).toBe(phase===2);
  await page.screenshot({path:`${dir}/${browserName}-${role}-${move}-${facing}-phase${phase}.png`});
 }
});
