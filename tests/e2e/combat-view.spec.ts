import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

for (const viewport of [{ width: 844, height: 390 }, { width: 915, height: 412 }]) {
  test(`room-fit combat view fills ${viewport.width}x${viewport.height} while controls stay over the scene`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await enterRun(page);
    const canvas = page.locator('.scene-host canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(viewport.width * .9);
    expect(box!.height).toBeGreaterThanOrEqual(viewport.height * .9);
    const frame = await page.evaluate(() => (window as unknown as { __sorTest: { cameraFrame: () => { halfHeight: number; aspect: number } | null } }).__sorTest.cameraFrame());
    expect(frame).not.toBeNull();
    expect(frame!.halfHeight).toBeLessThan(6);
    const oldCoverage = 16 / (12 * viewport.width / viewport.height) * (8 * 8 / Math.sqrt(208)) / 12;
    const newCoverage = 16 / (2 * frame!.halfHeight * frame!.aspect) * (8 * 8 / Math.sqrt(208)) / (2 * frame!.halfHeight);
    expect(newCoverage).toBeGreaterThan(oldCoverage * 1.25);
    const controls = await page.locator('.hud-host, .actions, .joystick').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
    }));
    for (const control of controls) {
      expect(control.x).toBeGreaterThanOrEqual(0);
      expect(control.y).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(viewport.width);
      expect(control.bottom).toBeLessThanOrEqual(viewport.height);
    }
  });
}
