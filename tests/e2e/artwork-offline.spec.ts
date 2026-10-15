import {test,expect} from '@playwright/test';
import {game,canvasControl} from './helpers/godot';
test('complete furnished art, every threat role and credits survive a cold offline run and retry',async({page,context,browserName})=>{
 test.skip(browserName==='webkit','Physical Safari offline behavior remains a device acceptance gate.');
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect.poll(()=>game(page).then(s=>s?.readiness.offline),{timeout:60000}).toBe('ready');
 await context.setOffline(true);const cold=await context.newPage();await cold.setViewportSize({width:844,height:390});await cold.goto('/');
 await expect.poll(()=>game(cold).then(s=>s?.phase),{timeout:60000}).toBe('selecting');
 await canvasControl(cold,'artwork-credits');await expect(cold.getByRole('heading')).toContainText('Kay Lousberg');await canvasControl(cold,'close-credits');
 for(const name of ['Cow','Cow','Crow','Crow']){await cold.getByRole('button',{name,exact:true}).focus();await cold.keyboard.press('Enter');}
 await expect.poll(()=>game(cold).then(s=>s.phase),{timeout:15000}).toBe('running');
 for(const index of [0,1,2,3]){
  await cold.evaluate(i=>(window as any).__sorTest.command('room',i),index);
  await expect.poll(()=>game(cold).then(s=>s.run.areaIndex)).toBe(index);
  expect((await game(cold)).scenery.kind).toBe('furnished');
 }
 await canvasControl(cold,'pause');
 for(const role of ['grunt','zoner','enforcer','liam']){
  await cold.evaluate(role=>(window as any).__sorTest.command('enemy-art',{role,semantic:'Idle',facing:1,phase:2}),role);
  await expect.poll(()=>game(cold).then(s=>s.enemyArt.views['900']?.role)).toBe(role);
  expect((await game(cold)).enemyArt.errors).toEqual([]);
 }
 await canvasControl(cold,'resume');await cold.evaluate(()=>(window as any).__sorTest.command('victory'));
 await expect.poll(()=>game(cold).then(s=>s.phase)).toBe('victory');await canvasControl(cold,'retry');
 await expect.poll(()=>game(cold).then(s=>s.phase),{timeout:15000}).toBe('running');
 expect((await game(cold)).readiness.offline).toBe('ready');await context.setOffline(false);
});
