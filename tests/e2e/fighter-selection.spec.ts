import { expect, test } from '@playwright/test';

test.use({ hasTouch: true });

test('homepage compares named fighters and confirms only after a second activation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  const crow = page.getByRole('button', { name: 'Crow', exact: true });
  await expect(cow).toBeVisible();
  await expect(crow).toBeVisible();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await cow.click();
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await expect(page.getByRole('meter', { name: 'Health' })).toHaveAttribute('aria-valuenow', '500');
  await expect(page.getByRole('meter', { name: 'Power' })).toHaveAttribute('aria-valuenow', '12');
  await expect(page.getByRole('meter', { name: 'Speed' })).toHaveAttribute('aria-valuenow', '3.2');
  await crow.click();
  await expect(page.getByRole('meter', { name: 'Health' })).toHaveAttribute('aria-valuenow', '240');
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  await crow.click();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await expect(page.locator('.game')).toHaveCount(0);
});

test('keyboard focus is visible but does not preview; repeated Enter cannot confirm', async ({ page }) => {
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.focus();
  await expect(cow).toBeFocused();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.keyboard.down('Enter');
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Press Enter again to choose')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  await page.keyboard.up('Enter');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
});

test('Space uses fresh presses and a failed preview blocks confirmation until Retry', async ({ page }) => {
  await page.route('**/*.glb', route => route.abort());
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.focus();
  await expect(cow).toHaveCSS('outline-style', 'solid');
  await page.keyboard.down('Space');
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Unable to load character')).toBeVisible();
  await page.keyboard.up('Space');
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  await page.unroute('**/*.glb');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Press Enter again to choose')).toBeVisible();
  await cow.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
});

test('touch activation previews and confirms with separate taps', async ({ page }) => {
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.tap();
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await cow.tap();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await expect(page.locator('.game')).toHaveCount(0);
});
