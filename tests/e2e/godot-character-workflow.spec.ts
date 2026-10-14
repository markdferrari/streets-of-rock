import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {selectDuo,game,canvasControl} from './helpers/godot';
for(const [fighter,partner] of [['lion','plates'],['plates','lion']])test(`${fighter} Godot authoring review exercises every move, interruption, and retained retry`,async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,fighter!,partner!);
 for(const move of ['light','heavy','dodge']){
  await canvasControl(page,move);await expect.poll(()=>game(page).then(state=>state.acceptedMoves.includes(move))).toBe(true);
  await page.waitForTimeout(1000);
 }
 await page.evaluate(()=>(window as any).__sorTest.command('meter',100));await canvasControl(page,'special');
 await expect.poll(()=>game(page).then(state=>state.acceptedMoves.includes('special'))).toBe(true);
 await mkdir('specs/009-godot-rewrite/reviews/characters',{recursive:true});
 await page.screenshot({path:`specs/009-godot-rewrite/reviews/characters/${fighter}-godot.png`});
 await canvasControl(page,'pause');await expect.poll(()=>game(page).then(state=>state.phase)).toBe('paused');
 await canvasControl(page,'resume');await expect.poll(()=>game(page).then(state=>state.phase)).toBe('running');
 await page.evaluate(()=>(window as any).__sorTest.command('defeat'));await expect.poll(()=>game(page).then(state=>state.phase)).toBe('defeat');
 await canvasControl(page,'retry');await expect.poll(()=>game(page).then(state=>state.phase),{timeout:10000}).toBe('running');
 expect((await game(page)).run.duo).toEqual({fighterId:fighter,partnerId:partner});
 expect(await page.evaluate(()=>(window as any).SorBoot.mode)).toBe('test');
});
