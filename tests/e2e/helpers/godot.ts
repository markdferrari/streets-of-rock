import {expect,type Page} from '@playwright/test';
export const game=async(page:Page)=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
export async function canvasControl(page:Page,id:string){const state=await game(page),bounds=state.bounds[id];await page.locator('canvas').click({position:{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2}});}
export async function selectDuo(page:Page,fighter:string,partner:string,url='/'){
 await page.goto(url);
 await expect.poll(()=>game(page).then(state=>state?.phase)).toBe('selecting');
 await canvasControl(page,`character-${fighter}`);
 await expect.poll(()=>game(page).then(state=>[state.selection.step,state.selection.previewedId])).toEqual(['fighter',fighter]);
 await canvasControl(page,`character-${fighter}`);
 await expect.poll(()=>game(page).then(state=>[state.selection.step,state.selection.fighterId,state.selection.previewedId])).toEqual(['partner',fighter,null]);
 await canvasControl(page,`character-${partner}`);
 await expect.poll(()=>game(page).then(state=>[state.selection.step,state.selection.previewedId])).toEqual(['partner',partner]);
 await canvasControl(page,`character-${partner}`);
 await expect.poll(()=>game(page).then(state=>state?.phase),{timeout:10000}).toBe('running');
}
