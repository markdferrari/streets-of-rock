import { expect, type Page } from '@playwright/test';

export async function chooseDuo(page: Page, fighter: 'Cow' | 'Crow' | 'Lion' | 'Plates' = 'Cow',
  partner: 'Cow' | 'Crow' | 'Lion' | 'Plates' = fighter === 'Cow' ? 'Crow' : 'Cow'): Promise<void> {
  if (fighter === partner) throw new Error('Fighter and partner must be different');
  await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
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

export async function enterRun(page: Page, fighter: 'Cow' | 'Crow' | 'Lion' | 'Plates' = 'Cow',
  partner?: 'Cow' | 'Crow' | 'Lion' | 'Plates'): Promise<void> {
  await chooseDuo(page, fighter, partner);
  await expect(page.locator('.countdown-number')).toHaveText('3');
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('.hud')).toContainText(fighter);
}
