import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('loads the rigged partners before a run and can retry after defeat', async ({ page }) => {
  const models: string[] = [];
  page.on('response', response => { if (response.url().endsWith('.glb')) models.push(response.url()); });
  await page.goto('/');
  await enterRun(page);
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  expect(models.some(url => /cow-[^/]+\.glb$/.test(url))).toBe(true);
  expect(models.some(url => /crow-[^/]+\.glb$/.test(url))).toBe(true);
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
});

test('explains preview loading failure and retries successfully', async ({ page }) => {
  await page.route('**/*.glb', route => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Cow', exact: true }).click();
  await expect(page.getByText('Unable to load character')).toBeVisible();
  await page.unroute('**/*.glb');
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await page.getByRole('button', { name: 'Cow', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose Your Partner' })).toBeVisible();
});
