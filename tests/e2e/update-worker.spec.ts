import { expect, test } from '@playwright/test';
import { createServer } from 'node:http';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { chooseDuo } from './helpers/selection';

test('a changed worker waits while two tabs stay open and never reloads a selected duo', async ({ browser, browserName }) => {
  test.skip(browserName === 'webkit', 'Natural two-tab worker update is exercised in Chromium; physical Safari update acceptance is pending.');
  const directory = await mkdtemp(join(tmpdir(), 'sor-update-'));
  await cp(resolve('dist'), directory, { recursive: true });
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const file = resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(directory + sep)) { response.writeHead(403).end(); return; }
    try {
      const body = await readFile(file);
      const type = file.endsWith('.js') ? 'text/javascript' : file.endsWith('.html') ? 'text/html' :
        file.endsWith('.css') ? 'text/css' : file.endsWith('.webmanifest') ? 'application/manifest+json' :
          file.endsWith('.png') ? 'image/png' : file.endsWith('.glb') ? 'model/gltf-binary' :
            file.endsWith('.wav') ? 'audio/wav' : 'application/octet-stream';
      response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' }).end(body);
    } catch { response.writeHead(404).end(); }
  });
  await new Promise<void>(resolveListen => server.listen(0, '127.0.0.1', resolveListen));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No test server address');
  const origin = `http://127.0.0.1:${address.port}`;
  const context = await browser.newContext({ viewport: { width: 844, height: 390 }, serviceWorkers: 'allow' });
  try {
    const first = await context.newPage();
    const second = await context.newPage();
    await first.goto(origin);
    await second.goto(origin);
    await expect(first.getByText('Offline ready')).toBeVisible({ timeout: 20_000 });
    await expect(second.getByText('Offline ready')).toBeVisible({ timeout: 20_000 });
    await first.reload();
    await second.reload();
    expect(await first.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    expect(await second.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
    const workerPath = join(directory, 'sw.js');
    await writeFile(workerPath, `${await readFile(workerPath, 'utf8')}\n// second-build-update\n`);
    await first.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
    await expect(first.getByText('Update ready. Close all game windows and reopen.')).toBeVisible({ timeout: 20_000 });
    await expect(second.getByRole('heading', { name: 'Choose Your Chieftain' })).toBeVisible();
    await chooseDuo(first, 'Cow');
    await expect(first.locator('.overlay')).toBeHidden({ timeout: 10_000 });
    await expect(first.locator('.hud')).toContainText('Cow 500 / 500');
    await expect(first.locator('.pwa-status')).toHaveCount(0);
    expect(await first.evaluate(async () => !!(await navigator.serviceWorker.getRegistration())?.waiting)).toBe(true);
    await first.evaluate(() => (window as unknown as { __sorTest: { defeatPlayer: () => void } }).__sorTest.defeatPlayer());
    await expect(first.getByRole('heading', { name: 'Defeat' })).toBeVisible();
    await expect(first.getByText('Update ready. Close all game windows and reopen.')).toBeVisible();
  } finally {
    await context.close();
    await new Promise<void>((resolveClose, reject) => server.close(error => error ? reject(error) : resolveClose()));
    await rm(directory, { recursive: true, force: true });
  }
});
