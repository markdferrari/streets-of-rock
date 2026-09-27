import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('starts an encounter, attacks with the touch controls, and pauses explicitly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect(page.getByText('Move to fight')).toBeVisible();
  await page.mouse.move(80, 300);
  await page.mouse.down();
  await page.mouse.move(150, 300);
  await expect(page.getByText('Dodge attacks')).toBeVisible();
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect(page.getByText('Dodge attacks')).toBeVisible();
  await page.mouse.up();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('button', { name: 'Attack' })).toBeVisible();
});

test('releases movement and gives feedback for an unavailable special', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  const x = () => page.evaluate(() => {
    const fixture = (window as unknown as { __sorTest?: { snapshot: () => { actors: { position: { x: number } }[] } } }).__sorTest;
    return fixture!.snapshot().actors[0]!.position.x;
  });
  const before = await x();
  await page.mouse.move(80, 300);
  await page.mouse.down();
  await page.mouse.move(150, 300);
  await expect.poll(x).toBeGreaterThan(before);
  await page.mouse.up();
  const after = await x();
  await page.waitForTimeout(100);
  expect(await x()).toBeCloseTo(after, 2);
  await page.getByRole('button', { name: 'Special' }).click();
  await expect(page.getByRole('status')).toHaveText('Action not ready');
});

test('shows meter gain after a damaging attack', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  await page.evaluate(() => {
    const fixture = (window as unknown as { __sorTest: { placeCow: (x: number) => void } }).__sorTest;
    fixture.placeCow(1.5);
  });
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect(page.getByText('Special 10%')).toBeVisible();
});

test('continues the combo with a timely second tap', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  const action = () => page.evaluate(() => {
    const fixture = (window as unknown as { __sorTest: { snapshot: () => { actors: { action: { kind: string; moveId?: string } }[] } } }).__sorTest;
    return fixture.snapshot().actors[0]!.action;
  });
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect.poll(async () => (await action()).kind).toBe('windup');
  await page.waitForFunction(() => {
    const fixture = (window as unknown as { __sorTest: { snapshot: () => { actors: { action: { kind: string } }[] } } }).__sorTest;
    return fixture.snapshot().actors[0]!.action.kind === 'idle';
  }, null, { polling: 'raf' });
  await page.getByRole('button', { name: 'Attack' }).click();
  await expect.poll(async () => (await action()).moveId).toBe('cow2');
});
