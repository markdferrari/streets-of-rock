import {test,expect} from '@playwright/test';
const ids=['cow','crow','lion','plates'];
import {game,canvasControl,selectDuo} from './helpers/godot';
export {game,canvasControl,selectDuo};
for(const fighter of ids)for(const partner of ids)if(fighter!==partner)test(`${fighter} with ${partner}: canvas selection, actions, defeat, retained retry and home`,async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,fighter,partner);
 expect((await game(page)).run.duo).toEqual({fighterId:fighter,partnerId:partner});
 await canvasControl(page,'light');await expect.poll(()=>game(page).then(s=>s.acceptedMoves.includes('light'))).toBe(true);
 await page.evaluate(()=>(window as any).__sorTest.command('defeat'));
 await expect.poll(()=>game(page).then(s=>s.phase)).toBe('defeat');await canvasControl(page,'retry');
 await expect.poll(()=>game(page).then(s=>s.phase),{timeout:10000}).toBe('running');expect((await game(page)).run.duo).toEqual({fighterId:fighter,partnerId:partner});
 await page.evaluate(()=>(window as any).__sorTest.command('victory'));await expect.poll(()=>game(page).then(s=>s.phase)).toBe('victory');
 await canvasControl(page,'home');await expect.poll(()=>game(page).then(s=>s.phase)).toBe('selecting');
});
