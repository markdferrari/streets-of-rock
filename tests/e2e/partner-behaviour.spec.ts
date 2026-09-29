import { expect, test } from '@playwright/test';
import { enterRun } from './helpers/selection';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

for (const fighter of ['Cow', 'Crow'] as const) {
  test(`${fighter} player keeps a naturally moving partner engaged during separation`, async ({ page }) => {
    await page.goto('/');
    await enterRun(page, fighter);
    await page.evaluate(() => {
      const hooks = (window as unknown as { __sorTest: { placePlayer: (x: number) => void; placePartner: (x: number) => void } }).__sorTest;
      hooks.placePlayer(10);
      hooks.placePartner(1);
    });
    const partner = () => page.evaluate(() => {
      const run = (window as unknown as { __sorTest: { snapshot: () => { actors: { role: string; position: { x: number }; facing: number; targetId?: number }[] } } }).__sorTest.snapshot();
      return run.actors.find(actor => actor.role === 'partner')!;
    });
    await expect.poll(async () => (await partner()).position.x).toBeGreaterThan(1);
    const current = await partner();
    expect(current.position.x).toBeLessThan(3);
    expect(current.facing).toBe(1);
    expect(current.targetId).toBeTruthy();
  });
}
