import {test,expect,type Page} from '@playwright/test';
const ids=['cow','crow','lion','plates'];
export const game=async(page:Page)=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
export async function canvasControl(page:Page,id:string){const s=await game(page);const b=s.bounds[id];await page.locator('canvas').click({position:{x:b.x+b.width/2,y:b.y+b.height/2}});}
export async function selectDuo(page:Page,fighter:string,partner:string){await page.goto('/');await expect.poll(()=>game(page).then(s=>s?.phase)).toBe('selecting');for(const id of [fighter,fighter,partner,partner])await canvasControl(page,`character-${id}`);await expect.poll(()=>game(page).then(s=>s?.phase),{timeout:10000}).toBe('running');}
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
