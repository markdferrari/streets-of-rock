import { expect, type Page } from '@playwright/test';

export async function chooseDuo(page: Page, fighter: 'Cow' | 'Crow' = 'Cow'): Promise<void> {
  const partner = fighter === 'Cow' ? 'Crow' : 'Cow';
  await expect(page.getByRole('heading', { name: 'Choose Your Fighter' })).toBeVisible();
  const fighterTile = page.getByRole('button', { name: fighter, exact: true });
  await fighterTile.click();
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await fighterTile.click();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
  const partnerTile = page.getByRole('button', { name: partner, exact: true });
  await partnerTile.click();
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await partnerTile.click();
  await expect(page.locator('.game')).toBeVisible();
}

export async function enterRun(page: Page, fighter: 'Cow' | 'Crow' = 'Cow'): Promise<void> {
  await chooseDuo(page, fighter);
  await expect(page.locator('.countdown-number')).toHaveText('3');
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('.hud')).toContainText(fighter);
}
