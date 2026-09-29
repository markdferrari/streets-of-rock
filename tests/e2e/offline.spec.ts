import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('a complete installed cache relaunches offline for both duos, results and retry', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit reports an internal navigation error under offline emulation; physical Safari acceptance is pending.');
  await page.goto('/');
  await expect(page.getByText('Offline ready')).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Choose Your Fighter' })).toBeVisible();
  const media = await page.evaluate(async () => {
    const url = '/assets/audio/music-placeholder.wav';
    const full = await fetch(url);
    const partial = await fetch(url, { headers: { Range: 'bytes=0-9' } });
    const invalid = await fetch(url, { headers: { Range: 'bytes=999999999-' } });
    return { full: full.status, partial: partial.status, range: partial.headers.get('Content-Range'),
      partialBytes: (await partial.arrayBuffer()).byteLength, invalid: invalid.status };
  });
  expect(media).toMatchObject({ full: 200, partial: 206, partialBytes: 10, invalid: 416 });
  expect(media.range).toMatch(/^bytes 0-9\//);
  await enterRun(page, 'Crow');
  await expect(page.locator('.hud')).toContainText('Crow 240 / 240');
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('.hud')).toContainText('Crow 240 / 240');
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Return to title' }).click();
  await enterRun(page, 'Cow');
  await expect(page.locator('.hud')).toContainText('Cow 500 / 500');
  await page.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
  await expect(page.getByRole('heading', { name: 'Defeat' })).toBeVisible();
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
  await expect(page.locator('.hud')).toContainText('Cow 500 / 500');
});

test('missing cached bytes never appear as offline ready', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Offline ready')).toBeVisible({ timeout: 20_000 });
  const removed = await page.evaluate(async () => {
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        if (request.url.includes('/assets/audio/music-placeholder.wav')) return cache.delete(request);
      }
    }
    return false;
  });
  expect(removed).toBe(true);
  await page.reload();
  await expect(page.getByText('Offline cache incomplete')).toBeVisible({ timeout: 20_000 });
});
