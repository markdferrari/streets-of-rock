import { expect, test } from '@playwright/test';

const names = ['Cow', 'Crow', 'Lion', 'Plates'] as const;

test('all four identities can be selected in every ordered distinct duo', async ({ page }) => {
  for (const fighter of names) {
    for (const partner of names.filter(name => name !== fighter)) {
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
      await expect(page.getByRole('group', { name: 'Fighters' }).getByRole('button')).toHaveCount(4);
      const fighterTile = page.getByRole('button', { name: fighter, exact: true });
      await fighterTile.click();
      await expect(fighterTile).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByRole('meter', { name: 'Health' })).toBeVisible();
      await expect(page.getByRole('meter', { name: 'Power' })).toBeVisible();
      await expect(page.getByRole('meter', { name: 'Speed' })).toBeVisible();
      await fighterTile.click();
      await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
      await expect(page.getByRole('button', { name: fighter, exact: true })).toBeDisabled();
      const partnerTile = page.getByRole('button', { name: partner, exact: true });
      await partnerTile.click();
      await expect(partnerTile).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByText('Tap again to choose')).toBeVisible();
      await partnerTile.click();
      await expect(page.locator('.game')).toBeVisible({ timeout: 20_000 });
      await expect(page.locator('.countdown-number')).toHaveText('3');
    }
  }
});
