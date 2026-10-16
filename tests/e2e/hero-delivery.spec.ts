import {test,expect} from '@playwright/test';
import {game,canvasControl,selectDuo} from './helpers/godot';
for(const [fighter,partner] of [['cow','crow'],['crow','lion'],['lion','plates'],['plates','cow']])test(`${fighter}/${partner} repairs failed hero readiness with locked duo and truthful cache`,async({page})=>{
 await page.setViewportSize({width:844,height:390});await selectDuo(page,fighter,partner);
 await page.evaluate((id)=>(window as any).__sorTest.command('hero-break',id),fighter);
 await page.evaluate(()=>(window as any).__sorTest.command('defeat'));
 await expect.poll(()=>game(page).then(s=>s.phase)).toBe('defeat');await canvasControl(page,'retry');
 await expect.poll(()=>game(page).then(s=>s.phase)).toBe('error');
 const failed=await game(page);expect(failed.run).toEqual({});expect(failed.duo).toEqual({fighterId:fighter,partnerId:partner});
 expect(failed.readiness.runtime).toBe('error');
 await canvasControl(page,'retry');await expect.poll(()=>game(page).then(s=>s.phase),{timeout:15000}).toBe('running');
 expect((await game(page)).run.duo).toEqual({fighterId:fighter,partnerId:partner});
});
test('reduced-motion preview stays still and terminal interruptions require Resume',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect.poll(()=>game(page).then(s=>s?.phase)).toBe('selecting');
 await canvasControl(page,'character-lion');
 const preview=(await game(page)).heroPreview;expect(preview.characterId).toBe('lion');
 await page.waitForTimeout(250);expect((await game(page)).heroPreview.sampleTime).toBe(preview.sampleTime);
 await canvasControl(page,'character-lion');await canvasControl(page,'character-plates');await canvasControl(page,'character-plates');
 await expect.poll(()=>game(page).then(s=>s.phase),{timeout:10000}).toBe('running');
 await page.evaluate(()=>(window as any).__sorTest.command('defeat'));await expect.poll(()=>game(page).then(s=>s.phase)).toBe('defeat');
 const terminal=await game(page);
 await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect.poll(()=>game(page).then(s=>s.phase)).toBe('paused');
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForTimeout(100);expect((await game(page)).phase).toBe('paused');
 await canvasControl(page,'resume');await expect.poll(()=>game(page).then(s=>s.phase)).toBe('defeat');
 const resumed=await game(page);expect(resumed.run.tick).toBe(terminal.run.tick);expect(resumed.elapsedMs).toBe(terminal.elapsedMs);
});

test('verified cached hero motion and source credits survive cold offline roles and retry',async({page,context,browserName})=>{
 test.setTimeout(180000);
 test.skip(browserName==='webkit','Physical Safari cold offline acceptance remains required.');
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect.poll(()=>game(page).then(s=>s?.readiness.offline),{timeout:60000}).toBe('ready');
 await context.setOffline(true);
 const cold=await context.newPage();await cold.setViewportSize({width:844,height:390});await cold.goto('/');
 await expect.poll(()=>game(cold).then(s=>s?.phase),{timeout:60000}).toBe('selecting');
 await canvasControl(cold,'artwork-credits');await expect(cold.getByRole('heading')).toContainText('Universal Animation Library');await canvasControl(cold,'close-credits');
 for(const [fighter,partner] of [['cow','crow'],['crow','lion'],['lion','plates'],['plates','cow']]){
  await selectDuo(cold,fighter,partner);
  expect(Object.keys((await game(cold)).heroArt.views)).toEqual(['1','2']);
  await cold.evaluate(()=>(window as any).__sorTest.command('victory'));await expect.poll(()=>game(cold).then(s=>s.phase)).toBe('victory');
  await canvasControl(cold,'retry');await expect.poll(()=>game(cold).then(s=>s.phase),{timeout:10000}).toBe('running');
  expect((await game(cold)).readiness.offline).toBe('ready');
 }
 await context.setOffline(false);
});
