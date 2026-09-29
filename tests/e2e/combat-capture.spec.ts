import { expect, test } from '@playwright/test';
import { neonVelvet } from '../../src/content/neon-velvet';
import { enterRun } from './helpers/selection';
import { writeFileSync } from 'node:fs';

type CaptureRun = { areaIndex: number; encounter: { status: string; waveIndex: number; aliveEnemyIds: number[] } };

for (const viewport of [{ width: 844, height: 390 }, { width: 915, height: 412 }]) {
  test(`capture four combat rooms at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    test.skip(!process.env.CAPTURE_COMBAT_VIEW, 'Evidence capture is run explicitly before and after framing changes.');
    test.setTimeout(90_000);
    await page.setViewportSize(viewport);
    await page.goto('/');
    await enterRun(page);
    const state = () => page.evaluate(() => (window as unknown as { __sorTest: { snapshot: () => CaptureRun } }).__sorTest.snapshot());
    const metrics: { area: string; halfHeight: number; floorCoverage: number }[] = [];
    for (let index = 0; index < neonVelvet.areas.length; index++) {
      const area = neonVelvet.areas[index]!;
      await expect.poll(async () => (await state()).areaIndex).toBe(index);
      await page.evaluate(x => (window as unknown as { __sorTest: { placePlayer: (x: number) => void } }).__sorTest.placePlayer(x), area.minX + 3);
      await page.evaluate(x => (window as unknown as { __sorTest: { placePartner: (x: number) => void } }).__sorTest.placePartner(x), area.minX + 1);
      await expect.poll(async () => (await state()).encounter.aliveEnemyIds.length).toBeGreaterThan(0);
      if (process.env.CAPTURE_COMBAT_VIEW !== 'baseline') {
        // A newly entered room may still be easing in from the wider travel
        // frame. Measure only after the stable-room fit has returned.
        await expect.poll(async () => {
          const frame = await page.evaluate(() => (window as unknown as { __sorTest: { cameraFrame: () => { halfHeight: number } | null } }).__sorTest.cameraFrame());
          return frame?.halfHeight ?? Number.POSITIVE_INFINITY;
        }, { timeout: 5_000 }).toBeLessThan(6);
      } else {
        await page.waitForTimeout(60);
      }
      const camera = await page.evaluate(() => (window as unknown as { __sorTest: { cameraFrame: () => { halfHeight: number; aspect: number } | null } }).__sorTest.cameraFrame());
      const halfHeight = process.env.CAPTURE_COMBAT_VIEW === 'baseline' ? 6 : camera!.halfHeight;
      const aspect = viewport.width / viewport.height;
      const floorCoverage = 16 / (2 * halfHeight * aspect) * (8 * 8 / Math.sqrt(208)) / (2 * halfHeight);
      metrics.push({ area: area.id, halfHeight, floorCoverage });
      await page.screenshot({ path: `specs/006-combat-view-partner/evidence/${process.env.CAPTURE_COMBAT_VIEW}/${viewport.width}x${viewport.height}-${area.id}.png` });
      if (index === neonVelvet.areas.length - 1) break;
      for (let wave = 0; wave < area.waves.length; wave++) {
        await page.evaluate(() => (window as unknown as { __sorTest: { clearWave: () => void } }).__sorTest.clearWave());
        if (wave + 1 < area.waves.length) await expect.poll(async () => (await state()).encounter.waveIndex).toBe(wave + 1);
        else await expect.poll(async () => (await state()).encounter.status).toBe('cleared');
      }
      await page.evaluate(x => (window as unknown as { __sorTest: { placePlayer: (x: number) => void } }).__sorTest.placePlayer(x), neonVelvet.areas[index + 1]!.minX);
    }
    writeFileSync(`specs/006-combat-view-partner/evidence/${process.env.CAPTURE_COMBAT_VIEW}/${viewport.width}x${viewport.height}-metrics.json`,
      JSON.stringify({ viewport, metrics }, null, 2) + '\n');
  });
}
