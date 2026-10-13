import {readFileSync} from 'node:fs';
import {runGodot} from './setup';
import {compare} from '../reference/compare';
const result=runGodot(['--headless','--path','.','--log-file','.tmp/parity.log','--script','tests/godot/replay_runner.gd']);
process.stdout.write(result.output);if(result.status!==0)process.exit(result.status);
const outputs=JSON.parse(readFileSync('.tmp/parity.json','utf8'));
const manifest=JSON.parse(readFileSync('tests/reference/manifest.json','utf8'));
let failures=0;
for(const entry of manifest.fixtures){const fixture=JSON.parse(readFileSync(`tests/reference/${entry.path}`,'utf8'));const errors=compare(fixture.frames,outputs[entry.id]);if(errors.length){failures++;console.error(`${entry.id}: ${errors.length} differences\n${errors.slice(0,8).join('\n')}`);}else console.log(`PASS ${entry.id}: ${fixture.frames.length} exact state/event/camera frames`);}
if(failures)process.exit(1);
console.log(`All ${manifest.fixtures.length} reference fixtures match; no discrete outcome tolerance.`);
