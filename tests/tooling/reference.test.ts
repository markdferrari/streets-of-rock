import { describe, expect, it } from 'vitest';
import { compare, validateReplay } from '../../scripts/reference/compare';
describe('canonical replay contract', () => {
 it('preserves event order and exact hit/target/outcome identities', () => {
  expect(compare([{type:'hit',targetId:3},{type:'stun',targetId:4}],[{type:'stun',targetId:4},{type:'hit',targetId:3}])).not.toEqual([]);
  for(const actual of [{targetId:4},{hp:100.00000001},{tick:1.0000000001},{result:'victory'}]) expect(compare({targetId:3,hp:100,tick:1,result:'defeat'},actual).length).toBeGreaterThan(0);
 });
 it('normalizes absent optionals to null without dropping array order', () => {
  expect(compare({actor:{targetId:null}},{actor:{}})).toEqual([]);
  expect(compare([1,2],[2,1])).not.toEqual([]);
 });
 it('uses tight relative continuous tolerance in both directions', () => {
  expect(compare({position:{x:1,depth:1000}},{position:{x:1+5e-10,depth:1000+5e-7}})).toEqual([]);
  expect(compare({position:{x:1}},{position:{x:1+2e-9}})).not.toEqual([]);
  expect(compare({position:{x:NaN}},{position:{x:NaN}})).not.toEqual([]);
 });
 it('requires frame time, viewport, ArenaContext, ordered input and checkpoints', () => {
  const fixture={schemaVersion:1,referenceCommit:'a'.repeat(40),contentDigest:'b'.repeat(64),scenarioId:'combat',requirements:['FR-003'],startingRun:{},frames:[{timestampMs:0,running:true,viewport:{width:844,height:390},input:{move:{x:0,depth:0}},arena:{legalRegions:[],visibleRegions:[],frame:{},body:{}},events:[],state:{}}]};
  expect(validateReplay(fixture)).toEqual([]);
  for(const key of ['timestampMs','viewport','input','arena','events','state']) {const bad=structuredClone(fixture) as any;delete bad.frames[0][key];expect(validateReplay(bad)).not.toEqual([]);}
  expect(validateReplay({...fixture,schemaVersion:2})).not.toEqual([]);
  expect(validateReplay({...fixture,frames:[{...fixture.frames[0],timestampMs:NaN}]})).not.toEqual([]);
 });
});

import {readFileSync} from 'node:fs';import {join} from 'node:path';import {sha256} from '../../scripts/godot/setup';
it('committed fixtures retain pinned provenance, digests and executable frame inputs',()=>{
 const manifest=JSON.parse(readFileSync('tests/reference/manifest.json','utf8'));
 expect(manifest.referenceCommit).toBe('58137537a7d4ef992bd27e3fdf7efe92e5e2add1');expect(manifest.fixtures.length).toBeGreaterThanOrEqual(26);
 for(const [id,expected] of Object.entries(manifest.characterDigests))expect(sha256(readFileSync(`content/characters/${id}.json`))).toBe(expected);
 for(const entry of manifest.fixtures){const bytes=readFileSync(join('tests/reference',entry.path));expect(sha256(bytes)).toBe(entry.sha256);const value=JSON.parse(bytes.toString());expect(validateReplay(value)).toEqual([]);expect(compare(value,structuredClone(value))).toEqual([]);}
});
it('feature 010 gameplay checkpoints retain the original replay inputs and bind revisions to frozen hashes',()=>{
 const baselineBytes=readFileSync('tests/reference/manifest.json'),baseline=JSON.parse(baselineBytes.toString());
 const revisions=JSON.parse(readFileSync('tests/reference/feature-010/manifest.json','utf8'));
 expect(revisions.schemaVersion).toBe(1);expect(revisions.baselineManifestSha256).toBe(sha256(baselineBytes));expect(revisions.reason).toContain('Owner requested');
 expect(new Set(revisions.fixtures.map((e:any)=>e.id)).size).toBe(revisions.fixtures.length);
 for(const entry of revisions.fixtures){
  const original=baseline.fixtures.find((e:any)=>e.id===entry.id);expect(original).toBeDefined();expect(entry.baselineSha256).toBe(original.sha256);
  const before=JSON.parse(readFileSync(join('tests/reference',original.path),'utf8'));
  const bytes=readFileSync(join('tests/reference',entry.path)),after=JSON.parse(bytes.toString());expect(sha256(bytes)).toBe(entry.sha256);expect(validateReplay(after)).toEqual([]);
  expect(after.startingRun).toEqual(before.startingRun);
  const inputs=(frames:any[])=>frames.map(({timestampMs,running,viewport,input})=>({timestampMs,running,viewport,input}));
  expect(inputs(after.frames)).toEqual(inputs(before.frames));expect(compare(before.frames,after.frames).length).toBeGreaterThan(0);
 }
});
