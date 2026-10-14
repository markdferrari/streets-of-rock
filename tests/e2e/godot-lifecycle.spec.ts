import { test, expect } from '@playwright/test';
import {selectDuo,game,canvasControl} from './helpers/godot';
const snapshot = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__sorTest.snapshot());
test('context loss pauses; restoration never resumes without an explicit gesture', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 }); await page.goto('/');
  await expect.poll(() => page.locator('#semantics [data-control-id="character-cow"]').count(), { timeout: 60000 }).toBe(1);
  for (const name of ['Cow', 'Cow', 'Crow', 'Crow']) { await page.getByRole('button', { name, exact: true }).focus(); await page.keyboard.press('Enter'); }
  await expect.poll(() => snapshot(page).then((state: any) => state.phase), { timeout: 15000 }).toBe('running');
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect.poll(() => snapshot(page).then((state: any) => state.phase)).toBe('paused');
  await page.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextrestored')));
  expect((await snapshot(page)).phase).toBe('paused');
  await page.getByRole('button', { name: 'Resume', exact: true }).focus(); await page.keyboard.press('Enter');
  await expect.poll(() => snapshot(page).then((state: any) => state.phase)).toBe('running');
});

for(const number of [3,2,1])for(const [key,unsafe] of [['visible',false],['focused',false],['portrait',true]] as const)test(`countdown ${number} freezes through ${key} interruption until explicit resume`,async({page})=>{
  await page.setViewportSize({width:844,height:390});await page.goto('/');
  await expect.poll(()=>game(page).then(state=>state?.phase)).toBe('selecting');
  for(const name of ['Cow','Cow','Crow','Crow']){await page.getByRole('button',{name,exact:true}).focus();await page.keyboard.press('Enter');}
  await expect.poll(()=>page.evaluate(()=>(window as any).__sorCountdownNumber)).toBe(number);
  await page.evaluate(({key,unsafe})=>{const host=(window as any);host.SorBrowser.notify('environment',{environment:{...host.__sorTest.snapshot().environment,[key]:unsafe}});},{key,unsafe});
  await expect.poll(()=>game(page).then(state=>state.phase)).toBe('paused');
  const frozen=await page.evaluate(()=>(window as any).__sorCountdownNumber);await page.waitForTimeout(1100);
  expect(await page.evaluate(()=>(window as any).__sorCountdownNumber)).toBe(frozen);
  await page.evaluate(({key,unsafe})=>{const host=(window as any);host.SorBrowser.notify('environment',{environment:{...host.__sorTest.snapshot().environment,[key]:!unsafe}});},{key,unsafe});
  expect((await game(page)).phase).toBe('paused');
  await page.getByRole('button',{name:'Resume'}).focus();await page.keyboard.press('Enter');
  await expect.poll(()=>game(page).then(state=>state.phase),{timeout:10000}).toBe('running');
});
for(const fighter of ['lion','plates'])for(const [key,unsafe] of [['visible',false],['focused',false],['portrait',true]] as const)test(`${fighter} Special freezes through ${key} interruption until explicit resume`,async({page})=>{
  await page.setViewportSize({width:844,height:390});await selectDuo(page,fighter,'cow');
  await page.evaluate(()=>(window as any).__sorTest.command('meter',100));await canvasControl(page,'special');
  await expect.poll(()=>game(page).then(state=>state.acceptedMoves.includes('special'))).toBe(true);
  await page.evaluate(({key,unsafe})=>{const host=(window as any);host.SorBrowser.notify('environment',{environment:{...host.__sorTest.snapshot().environment,[key]:unsafe}});},{key,unsafe});
  await expect.poll(()=>game(page).then(state=>state.phase)).toBe('paused');
  const before=await game(page);await page.waitForTimeout(600);const after=await game(page);
  expect(after.run.tick).toBe(before.run.tick);expect(after.elapsedMs).toBe(before.elapsedMs);
  await page.evaluate(({key,unsafe})=>{const host=(window as any);host.SorBrowser.notify('environment',{environment:{...host.__sorTest.snapshot().environment,[key]:!unsafe}});},{key,unsafe});
  expect((await game(page)).phase).toBe('paused');
  await canvasControl(page,'resume');await expect.poll(()=>game(page).then(state=>state.phase)).toBe('running');
});
