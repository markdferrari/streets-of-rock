import {test,expect} from '@playwright/test';
const snapshot=async(page:import('@playwright/test').Page)=>page.evaluate(()=> (window as any).__sorTest);
test.beforeEach(async({page})=>{await page.setViewportSize({width:844,height:390});await page.goto('/?fixture=foundation');await expect.poll(()=>snapshot(page).then(s=>s?.ready),{timeout:60000}).toBe(true);});
test('real canvas Control and semantic keyboard each activate exactly once with gesture audio',async({page})=>{
 await page.locator('canvas').click({position:{x:700,y:310}});
 await expect.poll(()=>snapshot(page).then(s=>s.activations)).toBe(1);
 await page.getByRole('button',{name:'Activate',exact:true}).focus();await page.keyboard.press('Enter');
 await expect.poll(()=>snapshot(page).then(s=>s.activations)).toBe(2);
 expect((await snapshot(page)).semanticActivations).toBe(1);expect((await snapshot(page)).audioStarts).toBe(2);
});
test('blur clears input and returning requires explicit safe resume',async({page})=>{
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
 await expect.poll(()=>snapshot(page).then(s=>s.paused)).toBe(true);
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));expect((await snapshot(page)).paused).toBe(true);
 await page.getByRole('button',{name:'Resume',exact:true}).focus();await page.keyboard.press('Enter');
 await expect.poll(()=>snapshot(page).then(s=>s.paused)).toBe(false);
});
test('complete immutable engine and pack release reloads cold offline',async({page,context,browserName})=>{
 test.skip(browserName==='webkit','WebKit offline emulation is unavailable; physical Safari remains required');
 await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
 await expect.poll(()=>page.evaluate(async()=>{const b=(window as any).SorBrowser;return (await b.cacheStatus()).state;}),{timeout:60000}).toBe('ready');
 await context.setOffline(true);await page.close();const cold=await context.newPage();await cold.setViewportSize({width:844,height:390});await cold.goto('/?fixture=foundation');
 await expect.poll(()=>snapshot(cold).then(s=>s?.ready),{timeout:60000}).toBe(true);
 await cold.locator('canvas').click({position:{x:700,y:310}});await expect.poll(()=>snapshot(cold).then(s=>s.activations)).toBe(1);
 await context.setOffline(false);
});
test('native simultaneous touches, cancel and outside release clear their originating inputs',async({page,browserName})=>{
 test.skip(browserName!=='chromium','Chromium CDP supplies native multi-touch; phones cover Safari');
 const session=await page.context().newCDPSession(page);
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:70,y:300,id:1},{x:700,y:310,id:2}]});
 await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:115,y:300,id:1},{x:700,y:310,id:2}]});
 await expect.poll(()=>snapshot(page).then(s=>s.movement.x)).toBeGreaterThan(0);
 await session.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
 await expect.poll(()=>snapshot(page).then(s=>s.touches)).toBe(0);expect((await snapshot(page)).movement.x).toBe(0);expect((await snapshot(page)).activations).toBe(0);
 await page.mouse.move(700,310);await page.mouse.down();await page.mouse.move(900,450);await page.mouse.up();
 expect((await snapshot(page)).activations).toBe(0);
});
