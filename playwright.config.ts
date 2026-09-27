import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], serviceWorkers: 'allow' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'], serviceWorkers: 'allow' } },
  ],
  webServer: {
    command: 'bun run build:test && bun run preview --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: 'http://127.0.0.1:4173' },
});
