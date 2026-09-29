import { auditBuild } from './build-asset-inventory';

const result = auditBuild('dist', { requireFinalTrack: process.argv.includes('--final') });
console.log(`Build audit passed: ${result.files} precached assets, ${(result.bytes / 1024 / 1024).toFixed(2)} MiB.`);
if (!process.argv.includes('--final')) console.log('Intended soundtrack evidence remains pending final acceptance.');
