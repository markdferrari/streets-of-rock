import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tests/tooling/**/*.test.ts', 'tests/platform/**/*.test.ts', 'tests/unit/art/**/*.test.ts'] } });
