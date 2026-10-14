import {test,expect} from '@playwright/test';
// Helpers kept here to avoid importing spec files and registering their tests twice.
const state=async(page:import('@playwright/test').Page)=>page.evaluate(()=>(window as any).__sorTest?.snapshot());
test('actual game semantic selection and held keyboard produce one fresh action',async({page})=>{
 const errors:string[]=[];page.on('console',m=>{if(/SCRIPT ERROR|^ERROR:/.test(m.text()))errors.push(m.text());});
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect.poll(()=>state(page).then(s=>s?.phase)).toBe('selecting');
 for(const name of ['Cow','Cow','Crow','Crow']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
 await expect.poll(()=>state(page).then(s=>s.phase),{timeout:10000}).toBe('running');
 await page.locator('canvas').focus();await page.keyboard.down('j');await page.waitForTimeout(600);await page.keyboard.up('j');
 expect((await state(page)).acceptedMoves.filter((kind:string)=>kind==='light')).toHaveLength(1);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect.poll(()=>state(page).then(s=>s.phase)).toBe('paused');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));expect((await state(page)).phase).toBe('paused');
 await page.getByRole('button',{name:'Resume',exact:true}).focus();await page.keyboard.press('Enter');await expect.poll(()=>state(page).then(s=>s.phase)).toBe('running');expect(errors).toEqual([]);
});
test('actual game preserves simultaneous movement and action, with source-specific native cancellation',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Native multi-touch injection uses Chromium CDP; physical Safari is pending.');
 await page.setViewportSize({width:844,height:390});await page.goto('/');await expect.poll(()=>state(page).then(s=>s?.phase)).toBe('selecting');
 for(const name of ['Cow','Cow','Crow','Crow']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
 await expect.poll(()=>state(page).then(s=>s.phase),{timeout:10000}).toBe('running');
 const b=(await state(page)).bounds.light;const action={x:b.x+b.width/2,y:b.y+b.height/2,id:2};const session=await page.context().newCDPSession(page);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:78,y:312,id:1},action]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:120,y:312,id:1},action]});
 await expect.poll(()=>state(page).then(s=>s.movement.x)).toBeGreaterThan(0.5);
 await expect.poll(()=>state(page).then(s=>s.acceptedMoves.includes('light'))).toBe(true);
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await expect.poll(()=>state(page).then(s=>s.movement.x)).toBe(0);
 const previous=(await state(page)).acceptedMoves.length;await page.waitForTimeout(500);expect((await state(page)).acceptedMoves).toHaveLength(previous);
});
