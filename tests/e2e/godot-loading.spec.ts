import { test, expect } from '@playwright/test';
const snapshot = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__sorTest.snapshot());
test('ten retained-duo retry cycles release every old rig and reuse shared imports', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 }); await page.goto('/');
  await expect.poll(() => page.locator('#semantics [data-control-id="character-cow"]').count(), { timeout: 60000 }).toBe(1);
  for (const name of ['Cow', 'Cow', 'Crow', 'Crow']) { await page.getByRole('button', { name, exact: true }).focus(); await page.keyboard.press('Enter'); }
  await expect.poll(() => snapshot(page).then((state: any) => state.phase), { timeout: 15000 }).toBe('running');
  for (let cycle = 0; cycle < 10; cycle++) {
    await page.evaluate(() => (window as any).__sorTest.command('defeat'));
    await expect.poll(() => snapshot(page).then((state: any) => state.phase)).toBe('defeat');
    expect((await snapshot(page)).ownedInstances).toBe(2);
    await page.getByRole('button', { name: 'Retry', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect.poll(() => snapshot(page).then((state: any) => state.phase), { timeout: 15000 }).toBe('running');
    expect((await snapshot(page)).ownedInstances).toBe(2);
  }
});
