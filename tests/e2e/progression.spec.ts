import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('one noninteractive directional GO cue follows room clearance, pause and entry', async ({ page }) => {
  await page.goto('/');
  await enterRun(page);
  const cue = page.locator('.progression-cue');
  await expect(cue).toHaveCount(0);
  const state = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { encounter: { waveIndex: number; status: string } } } }).__sorTest.snapshot());
  await page.evaluate(() => (window as unknown as { __sorTest: { clearWave: () => void } }).__sorTest.clearWave());
  await expect.poll(async () => (await state()).encounter.waveIndex).toBe(1);
  await expect(cue).toHaveCount(0);
  await page.evaluate(() => (window as unknown as { __sorTest: { clearWave: () => void } }).__sorTest.clearWave());
  await expect.poll(async () => (await state()).encounter.status).toBe('cleared');
  await expect(cue).toBeVisible();
  await expect(cue).toContainText('GO');
  await expect(cue).toHaveAttribute('aria-label', 'Go right to the next room');
  expect(await cue.locator('svg').count()).toBe(1);
  expect(await cue.evaluate(element => getComputedStyle(element).pointerEvents)).toBe('none');
  await expect(page.locator('.hud .go')).toHaveCount(0);
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(cue).toHaveCount(1);
  await page.getByRole('button', { name: 'Resume' }).click();
  await page.evaluate(() => (window as unknown as { __sorTest: { placePlayer: (x: number) => void } }).__sorTest.placePlayer(18));
  await expect(cue).toHaveCount(0);
});

test('GO follows all three exits and never appears after the final boss', async ({ page }) => {
  await page.goto('/');
  await enterRun(page, 'Crow');
  const state = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => {
    areaIndex: number; encounter: { waveIndex: number; status: string } } } }).__sorTest.snapshot());
  const waves = [2, 2, 1, 1];
  const entries = [18, 36, 54];
  const cue = page.locator('.progression-cue');
  for (let area = 0; area < waves.length; area++) {
    await expect.poll(async () => (await state()).areaIndex).toBe(area);
    await expect(cue).toHaveCount(0);
    for (let wave = 0; wave < waves[area]; wave++) {
      await page.evaluate(() => (window as unknown as { __sorTest: { clearWave: () => void } }).__sorTest.clearWave());
      if (wave + 1 < waves[area]) await expect.poll(async () => (await state()).encounter.waveIndex).toBe(wave + 1);
      else if (area < 3) await expect.poll(async () => (await state()).encounter.status).toBe('cleared');
    }
    if (area < 3) {
      await expect(cue).toHaveAttribute('aria-label', 'Go right to the next room');
      await page.evaluate(x => (window as unknown as { __sorTest: { placePlayer: (x: number) => void } }).__sorTest.placePlayer(x), entries[area]);
      await expect(cue).toHaveCount(0);
    }
  }
  await expect(page.getByRole('heading', { name: 'Victory' })).toBeVisible();
  await expect(cue).toHaveCount(0);
});
