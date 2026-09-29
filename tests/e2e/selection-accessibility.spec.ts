import { expect, test } from '@playwright/test';
import { chooseDuo } from './helpers/selection';

test('twelve-entry test roster remains keyboard reachable and scrollable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/?roster=12');
  await expect(page.locator('[data-character]')).toHaveCount(12);
  const first = page.getByRole('button', { name: 'Fixture 1', exact: true });
  await first.focus();
  for (let index = 0; index < 5; index++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowRight');
  const last = page.getByRole('button', { name: 'Fixture 12', exact: true });
  await expect(last).toBeFocused();
  await expect(last).toBeInViewport();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
});

test('dragging a tile does not choose it and visible controls meet 44-pixel targets', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  const box = await cow.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 30, box!.y + box!.height / 2 + 30);
  await page.mouse.up();
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  for (const button of await page.locator('.selection-footer button').all()) {
    const bounds = await button.boundingBox();
    expect(bounds!.height).toBeGreaterThanOrEqual(44);
  }
});

test('portrait orientation waits for landscape and explicit Resume before launch', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await chooseDuo(page);
  await expect(page.getByText('Rotate device')).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.waitForTimeout(1200);
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.locator('.overlay')).toBeHidden({ timeout: 10_000 });
});

test('cancelled touch leaves the fighter unselected and reduced-motion preview remains usable', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  const cow = page.getByRole('button', { name: 'Cow', exact: true });
  await cow.dispatchEvent('pointerdown', { pointerId: 9, clientX: 100, clientY: 100 });
  await cow.dispatchEvent('pointercancel', { pointerId: 9 });
  await cow.dispatchEvent('click', { detail: 1 });
  await expect(page.locator('[aria-pressed="true"]')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await cow.click();
  await expect(page.getByText('Tap again to choose')).toBeVisible();
  await expect(page.locator('.preview-canvas-host canvas')).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('.preview-canvas-host canvas')).toBeVisible();
  for (const button of await page.locator('.selection-footer button').all()) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(667);
    expect(box!.y + box!.height).toBeLessThanOrEqual(375);
  }
});
