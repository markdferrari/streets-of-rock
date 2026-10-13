import { test, expect } from '@playwright/test';
const snapshot = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__sorTest.snapshot());

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(() => page.locator('#semantics [data-control-id="character-cow"]').count(), { timeout: 60000 }).toBe(1);
});

test('roster has a single tab stop; focus does not preview and arrows move focus', async ({ page }) => {
  const roster = page.locator('#semantics [data-control-id^="character-"]');
  await expect(roster).toHaveCount(4);
  await expect(page.locator('#semantics [data-control-id="character-cow"]')).toHaveJSProperty('tabIndex', 0);
  await expect(page.locator('#semantics [data-control-id="character-crow"]')).toHaveJSProperty('tabIndex', -1);
  await page.getByRole('button', { name: 'Cow', exact: true }).focus();
  expect((await snapshot(page)).selection.previewedId).toBeNull();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Crow', exact: true })).toBeFocused();
  expect((await snapshot(page)).selection.previewedId).toBeNull();
});
test('a twelve-entry semantic roster keeps one tab stop and supports wraparound focus',async({page})=>{
  await page.evaluate(()=>{const controls=Array.from({length:12},(_,index)=>({id:`character-fixture-${index}`,role:'button',name:`Fixture ${index}`,focused:index===0,focusOrder:index,bounds:{x:10+index%6*100,y:10+Math.floor(index/6)*60,width:90,height:44}}));(window as any).SorBrowser.publishUi(JSON.stringify({generation:100000,controls}));});
  const entries=page.locator('#semantics [data-control-id^="character-fixture-"]');await expect(entries).toHaveCount(12);
  expect(await entries.evaluateAll(elements=>elements.filter(element=>(element as HTMLElement).tabIndex>=0).length)).toBe(1);
  await page.getByRole('button',{name:'Fixture 0',exact:true}).focus();await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('button',{name:'Fixture 11',exact:true})).toBeFocused();
  expect((await snapshot(page)).selection.previewedId).toBeNull();
});

test('settings expose a trapped dialog and native volume ranges with stable identity', async ({ page }) => {
  const settings = page.getByRole('button', { name: 'Settings', exact: true });
  await settings.focus(); await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  const music = page.getByRole('slider', { name: 'Music volume' });
  await expect(music).toHaveAttribute('aria-valuemin', '0');
  await expect(music).toHaveAttribute('aria-valuemax', '1');
  await music.focus(); await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Lower music' })).toBeFocused();
  await music.evaluate(element => (element as HTMLInputElement).value = '0.4');
  await music.dispatchEvent('input');
  await expect.poll(() => snapshot(page).then((state: any) => state.settings.musicVolume)).toBeCloseTo(0.4, 1);
  expect(await music.evaluate(element => element === document.querySelector('[data-control-id="music-volume"]'))).toBe(true);
  await music.focus();await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button',{name:'Close settings'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(settings).toBeFocused();
});
