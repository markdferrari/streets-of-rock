import { test, expect } from '@playwright/test';
const snapshot = (page: import('@playwright/test').Page) => page.evaluate(() => (window as any).__sorTest.snapshot());
test('ten retained-duo retry cycles release every old rig and reuse shared imports', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 }); await page.goto('/');
  await expect.poll(() => page.locator('#semantics [data-control-id="character-cow"]').count(), { timeout: 60000 }).toBe(1);
  for (const name of ['Cow', 'Cow', 'Crow', 'Crow']) { await page.getByRole('button', { name, exact: true }).focus(); await page.keyboard.press('Enter'); }
  await expect.poll(() => snapshot(page).then((state: any) => state.phase), { timeout: 15000 }).toBe('running');
  for (let cycle = 0; cycle < 10; cycle++) {
    const oldIds=(await snapshot(page)).ownedInstanceIds;
    await page.evaluate(() => (window as any).__sorTest.command('defeat'));
    await expect.poll(() => snapshot(page).then((state: any) => state.phase)).toBe('defeat');
    const state = await snapshot(page);
    expect(state.ownedInstances).toBe(2+state.enemyArt.ownedInstances+state.scenery.ownedInstances);
    expect(state.preparedResourceCount).toBe(13);
    await page.getByRole('button', { name: 'Retry', exact: true }).focus(); await page.keyboard.press('Enter');
    await expect.poll(() => snapshot(page).then((state: any) => state.phase), { timeout: 15000 }).toBe('running');
    const fresh = await snapshot(page);
    expect(fresh.ownedInstances).toBe(2+fresh.enemyArt.ownedInstances+fresh.scenery.ownedInstances);
    expect(fresh.preparedResourceCount).toBe(13);
    expect(fresh.ownedInstanceIds.filter((id:number)=>oldIds.includes(id))).toEqual([]);
  }
});
