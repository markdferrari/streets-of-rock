import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('starts the four-area level and retries after defeat with fresh heroes', async ({ page }) => {
  await page.goto('/');
  await enterRun(page);
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  const state = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { encounter: { areaId: string; aliveEnemyIds: number[] }; actors: { role: string; hp: number; maxHp: number }[] } } }).__sorTest.snapshot());
  await expect.poll(async () => (await state()).encounter.aliveEnemyIds.length).toBe(3);
  expect((await state()).encounter.areaId).toBe('dance-floor');
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  await expect.poll(async () => (await state()).encounter.aliveEnemyIds.length).toBe(3);
});
