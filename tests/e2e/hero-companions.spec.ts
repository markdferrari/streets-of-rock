import {test,expect} from '@playwright/test';
import {game,canvasControl,selectDuo} from './helpers/godot';
const ids=['cow','crow','lion','plates'];
for(const fighter of ids)for(const partner of ids)if(fighter!==partner)test(`${fighter}/${partner} owns independent motion and holds companion knockout`,async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,fighter,partner);
 const a=await game(page);expect(a.heroArt.views['1'].skeletonId).not.toBe(a.heroArt.views['2'].skeletonId);
 await page.evaluate(()=>(window as any).__sorTest.command('solo'));
 await expect.poll(()=>game(page).then(s=>s.heroArt.views['2'].semantic)).toBe('KnockedOut');
 await expect.poll(()=>game(page).then(s=>s.heroArt.views['2'].terminalHold)).toBe(true);
 expect((await game(page)).phase).toBe('running');
 await canvasControl(page,'heavy');await expect.poll(()=>game(page).then(s=>s.acceptedMoves.includes('heavy'))).toBe(true);
 await page.evaluate(()=>(window as any).__sorTest.command('defeat'));
 await expect.poll(()=>game(page).then(s=>s.phase)).toBe('defeat');await canvasControl(page,'retry');
 await expect.poll(()=>game(page).then(s=>s.phase),{timeout:10000}).toBe('running');
 const fresh=await game(page);expect(fresh.run.duo).toEqual({fighterId:fighter,partnerId:partner});
 expect(fresh.heroArt.views['2'].terminalHold).toBe(false);
 expect(fresh.heroArt.views['1'].skeletonId).not.toBe(a.heroArt.views['1'].skeletonId);
 expect(fresh.heroArt.motionCount).toBe(2);
});
