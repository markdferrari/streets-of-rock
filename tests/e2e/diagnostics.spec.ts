import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, acceptDownloads: true });

test('diagnostics build samples active run frames and exports locally', async ({ page }) => {
  test.skip(process.env.VITE_DIAGNOSTICS !== '1', 'Run with VITE_DIAGNOSTICS=1');
  await page.goto('/');
  await enterRun(page);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __sorDiagnostics: { snapshot: () => { frames: unknown[] } } }).__sorDiagnostics.snapshot().frames.length)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause' }).click();
  const before = await page.evaluate(() => (window as unknown as { __sorDiagnostics: { snapshot: () => { frames: unknown[] } } }).__sorDiagnostics.snapshot().frames.length);
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => (window as unknown as { __sorDiagnostics: { snapshot: () => { frames: unknown[] } } }).__sorDiagnostics.snapshot().frames.length);
  expect(after).toBe(before);
  const download = page.waitForEvent('download');
  await page.evaluate(() => (window as unknown as { __sorDiagnostics: { download: () => void } }).__sorDiagnostics.download());
  expect((await download).suggestedFilename()).toBe('streets-of-rock-diagnostics.json');
});
