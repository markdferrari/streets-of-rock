import { existsSync } from 'node:fs';

if (!existsSync('dist/index.html')) {
  throw new Error('Build audit requires dist/index.html; run bun run build first.');
}
console.log('Build entry exists. Full asset and precache audit is scheduled for US4.');
