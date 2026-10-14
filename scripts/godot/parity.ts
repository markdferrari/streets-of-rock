import {readFileSync} from 'node:fs';
import {runGodot,sha256} from './setup';
import {compare} from '../reference/compare';
const result=runGodot(['--headless','--path','.','--log-file','.tmp/parity.log','--script','tests/godot/replay_runner.gd']);
process.stdout.write(result.output);if(result.status!==0)process.exit(result.status);
const outputs=JSON.parse(readFileSync('.tmp/parity.json','utf8'));
const manifest=JSON.parse(readFileSync('tests/reference/manifest.json','utf8'));
const revisions=JSON.parse(readFileSync('tests/reference/feature-010/manifest.json','utf8'));
if(sha256(readFileSync('tests/reference/manifest.json'))!==revisions.baselineManifestSha256)throw new Error('Feature 010 replay revision no longer matches the frozen baseline');
let failures=0;
for(const entry of manifest.fixtures){
 const revision=revisions.fixtures.find((r:{id:string})=>r.id===entry.id);
 if(revision&&revision.baselineSha256!==entry.sha256)throw new Error(`${entry.id}: revision has the wrong baseline`);
 const selected=revision??entry,bytes=readFileSync(`tests/reference/${selected.path}`);
 if(sha256(bytes)!==selected.sha256)throw new Error(`${entry.id}: checkpoint digest mismatch`);
 const fixture=JSON.parse(bytes.toString()),errors=compare(fixture.frames,outputs[entry.id]);
 if(errors.length){failures++;console.error(`${entry.id}: ${errors.length} differences\n${errors.slice(0,8).join('\n')}`);}else console.log(`PASS ${entry.id}: ${fixture.frames.length} exact state/event/camera frames (${revision?'requested feature 010 gameplay revision':'original baseline'})`);
}
if(failures)process.exit(1);
console.log(`All ${manifest.fixtures.length} current-rule fixtures match; ${revisions.fixtures.length} explicit gameplay revisions, original baseline retained; no discrete outcome tolerance.`);
