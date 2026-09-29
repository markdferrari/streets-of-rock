import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('homepage settings persist without previewing or confirming a fighter', async ({ page }) => {
  await page.goto('/');
  const button = page.getByRole('button', { name: 'Settings' });
  await button.click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Music volume').fill('0.2');
  await dialog.getByLabel('Effects volume').fill('0.4');
  await dialog.getByLabel('Screen shake').uncheck();
  await dialog.getByRole('button', { name: 'Close settings' }).click();
  await expect(button).toBeFocused();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(dialog.getByLabel('Music volume')).toHaveValue('0.2');
  await expect(dialog.getByLabel('Effects volume')).toHaveValue('0.4');
  await expect(dialog.getByLabel('Screen shake')).not.toBeChecked();
});

test('paused settings return focus to pause without resuming the run', async ({ page }) => {
  await page.goto('/');
  await enterRun(page);
  await page.getByRole('button', { name: 'Pause' }).click();
  const snapshot = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => { tick: number } } }).__sorTest.snapshot());
  const pausedTick = (await snapshot()).tick;
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('dialog', { name: 'Settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Close settings' }).click();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeFocused();
  expect((await snapshot()).tick).toBe(pausedTick);
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
});
