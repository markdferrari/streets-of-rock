import { expect, test } from '@playwright/test';

test('either fighter needs a separate partner preview and confirmation', async ({ page }) => {
  await page.goto('/');
  const crow = page.getByRole('button', { name: 'Crow', exact: true });
  await crow.click(); await crow.click();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await expect(page.getByText('Ai-controlled companion.')).toBeVisible();
  await expect(crow).toBeDisabled();
  await expect(crow.getByText('Your Fighter')).toBeVisible();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.click();
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await cow.click();
  await expect(page.locator('.game')).toBeVisible();
  await expect(page.locator('.countdown-menu')).toContainText('Your Chieftain: Crow');
  await expect(page.locator('.countdown-menu')).toContainText('AI Partner: Cow');
});

test('Back restores the fighter as a preview requiring a fresh confirmation', async ({ page }) => {
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.click(); await cow.click();
  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await cow.click();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
});

test('a held confirmation key cannot choose the partner across steps', async ({ page }) => {
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.focus();
  await page.keyboard.press('Enter');
  await expect(cow).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Press Enter again to choose')).toBeVisible();
  await page.keyboard.down('Enter');
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  await page.keyboard.down('Enter');
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('.game')).toHaveCount(0);
  await page.keyboard.up('Enter');
});
