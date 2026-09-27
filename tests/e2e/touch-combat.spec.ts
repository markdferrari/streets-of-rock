import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true });

test('shows a fixed joystick and labelled diamond before movement', async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  const stick = page.locator('.joystick');
  await expect(stick).toBeVisible();
  await expect(stick.locator('.knob')).toBeVisible();
  const centers = await Promise.all(['Special', 'Light', 'Heavy', 'Dodge'].map(async label => {
    const box = await page.getByRole('button', { name: label, exact: true }).boundingBox();
    expect(box).not.toBeNull();
    return { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };
  }));
  expect(centers[0]!.y).toBeLessThan(centers[1]!.y);
  expect(centers[3]!.y).toBeGreaterThan(centers[1]!.y);
  expect(centers[1]!.x).toBeLessThan(centers[2]!.x);
  for (const center of centers) {
    expect(center.x).toBeGreaterThan(0);
    expect(center.x).toBeLessThan(568);
    expect(center.y).toBeGreaterThan(0);
    expect(center.y).toBeLessThan(320);
  }
});

test('starts an encounter, attacks and moves with the touch controls, and pauses explicitly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  await page.getByRole('button', { name: 'Start' }).click();
  await expect(page.getByText('Cow 500 / 500')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();
  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.getByText('Move to fight')).toBeVisible();
  await page.mouse.move(80, 300);
  await page.mouse.down();
  await page.mouse.move(150, 300);
  await expect(page.getByText('Move to fight')).toBeHidden();
  await page.getByRole('button', { name: 'Light' }).click();
  await page.mouse.up();
  await page.getByRole('button', { name: 'Pause' }).click();
  await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
  await page.getByRole('button', { name: 'Resume' }).click();
  await expect(page.getByRole('button', { name: 'Light' })).toBeVisible();
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
    fixture.placeCow(6);
  });
  await page.getByRole('button', { name: 'Light' }).click();
  await expect(page.getByText('Special 10%')).toBeVisible();
});

test('continues the combo with a timely second tap', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start' }).click();
  const action = () => page.evaluate(() => {
    const fixture = (window as unknown as { __sorTest: { snapshot: () => { actors: { action: { kind: string; moveId?: string } }[] } } }).__sorTest;
    return fixture.snapshot().actors[0]!.action;
  });
  await page.getByRole('button', { name: 'Light' }).click();
  await expect.poll(async () => (await action()).kind).toBe('windup');
  await page.waitForFunction(() => {
    const fixture = (window as unknown as { __sorTest: { snapshot: () => { actors: { action: { kind: string } }[] } } }).__sorTest;
    return fixture.snapshot().actors[0]!.action.kind === 'idle';
  }, null, { polling: 'raf' });
  await page.getByRole('button', { name: 'Light' }).click();
  await expect.poll(async () => (await action()).moveId).toBe('cow2');
});
