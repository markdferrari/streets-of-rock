import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('starts an encounter, attacks with the touch controls, and pauses explicitly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect(page.getByText('Move to fight')).toBeVisible();
  await page.mouse.move(80, 300);
  await page.mouse.down();
  await page.mouse.move(150, 300);
  await expect(page.getByText('Dodge attacks')).toBeVisible();
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect(page.getByText('Dodge attacks')).toBeVisible();
  await page.mouse.up();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
});
