import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('rejected media playback never blocks a selected duo from entering combat', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new Error('playback denied'));
  });
  await page.goto('/');
  await enterRun(page, 'Crow');
  await expect(page.locator('.hud')).toContainText('Crow 240 / 240');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { tick: number } } }).__sorTest.snapshot().tick)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});
