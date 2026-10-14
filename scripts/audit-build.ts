import { readFileSync } from 'node:fs';
import { auditFoundationBuild } from './godot/audit';
const args = process.argv.slice(2).filter(arg => arg !== '--');
const dir = args.find(arg => !arg.startsWith('--')) ?? 'dist';
const final = args.includes('--final');
const result = auditFoundationBuild(dir, final);
console.log(`Web export audit passed: ${result.buildId}, ${(result.contentBytes / 1024 / 1024).toFixed(2)} MiB content, ${(result.engineBytes / 1024 / 1024).toFixed(2)} MiB verified engine; cached ${result.cachedBytes} bytes, gzip estimate ${result.gzipEstimateBytes} bytes, Brotli estimate ${result.brotliEstimateBytes} bytes.`);
if (final) {
 const record = JSON.parse(readFileSync('specs/009-godot-rewrite/validation/acceptance.json', 'utf8'));
 const waived = Object.entries(record.statuses).filter(([, status]) => status === 'waived').map(([key]) => key);
 if (waived.length) console.log(`Owner-authorized manual acceptance waiver: ${waived.join(', ')}. These checks remain unverified.`);
}
