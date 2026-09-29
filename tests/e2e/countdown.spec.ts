import { expect, test } from '@playwright/test';
import { chooseDuo, enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('does not advance the run during countdown and retains a numeral across interruption', async ({ page }) => {
  await page.goto('/');
  await chooseDuo(page, 'Crow');
  await expect(page.locator('.countdown-menu img[alt="Crow portrait"]')).toBeVisible();
  await expect(page.locator('.countdown-menu img[alt="Cow portrait"]')).toBeVisible();
  const snapshot = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { tick: number; duo: { fighterId: string; partnerId: string } } } }).__sorTest.snapshot());
  expect(await snapshot()).toMatchObject({ tick: 0, duo: { fighterId: 'crow', partnerId: 'cow' } });
  const number = await page.locator('.countdown-number').textContent();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.waitForTimeout(1200);
  expect(await snapshot()).toMatchObject({ tick: 0 });
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.locator('.countdown-number')).toHaveText(number!);
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('.hud')).toContainText('Crow 240 / 240');
  await expect.poll(async () => (await snapshot()).tick).toBeGreaterThan(0);
});

test('retry preserves the Crow-player duo with a new zero-tick countdown; homepage clears it', async ({ page }) => {
  await page.goto('/');
  await chooseDuo(page, 'Crow');
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  const snapshot = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { runId: number; tick: number; duo: { fighterId: string; partnerId: string } } } }).__sorTest.snapshot());
  const first = await snapshot();
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.countdown-number')).toBeVisible();
  expect(await snapshot()).toMatchObject({ tick: 0, duo: first.duo });
  expect((await snapshot()).runId).toBeGreaterThan(first.runId);
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to title' }).click();
  await expect(page.getByRole('heading', { name: 'Choose Your Fighter' })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => unknown } }).__sorTest.snapshot())).toBeNull();
});

test('Crow is controlled while Cow supports, with Crow moves and meter in the HUD', async ({ page }) => {
  await page.goto('/');
  await enterRun(page, 'Crow');
  const snapshot = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { actors: { role: string; characterId?: string; action: { moveId?: string }; specialMeter?: number }[] } } }).__sorTest.snapshot());
  expect((await snapshot()).actors.slice(0, 2)).toMatchObject([
    { role: 'player', characterId: 'crow' }, { role: 'partner', characterId: 'cow' },
  ]);
  await page.evaluate(() => (window as unknown as { __sorTest: { stagePlayerHit: () => void } }).__sorTest.stagePlayerHit());
  await page.getByRole('button', { name: 'Light' }).click();
  await expect.poll(async () => (await snapshot()).actors[0]?.action.moveId).toBe('light1');
  await expect(page.locator('.hud')).toContainText('Special 10%');
});
