import { readFileSync } from 'node:fs';
import { auditFoundationBuild,finalEvidencePath } from './godot/audit';
const args = process.argv.slice(2).filter(arg => arg !== '--');
const evidenceIndex=args.indexOf('--evidence');
if(evidenceIndex>=0&&(!args[evidenceIndex+1]||args[evidenceIndex+1]!.startsWith('--')))throw new Error('--evidence requires a project-relative JSON path');
const evidencePath=finalEvidencePath(evidenceIndex>=0?args[evidenceIndex+1]:undefined);
const positional=args.filter((arg,index)=>index!==evidenceIndex+1||evidenceIndex<0);
const dir = positional.find(arg => !arg.startsWith('--')) ?? 'dist';
const final = args.includes('--final');
const result = auditFoundationBuild(dir, final,evidencePath);
console.log(`Web export audit passed: ${result.buildId}, ${(result.contentBytes / 1024 / 1024).toFixed(2)} MiB content, ${(result.engineBytes / 1024 / 1024).toFixed(2)} MiB verified engine; cached ${result.cachedBytes} bytes, gzip estimate ${result.gzipEstimateBytes} bytes, Brotli estimate ${result.brotliEstimateBytes} bytes.`);
if (final) {
 const record = JSON.parse(readFileSync(evidencePath, 'utf8'));
 const waived = Object.entries(record.statuses).filter(([, status]) => status === 'waived').map(([key]) => key);
 if (waived.length) console.log(`Owner-authorized manual acceptance waiver: ${waived.join(', ')}. These checks remain unverified.`);
}
