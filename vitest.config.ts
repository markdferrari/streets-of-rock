import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts', 'tests/tooling/**/*.test.ts', 'tests/platform/**/*.test.ts'] },
});
