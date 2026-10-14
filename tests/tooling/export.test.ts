import {describe,expect,it} from 'vitest';
import {buildIdentity,modeConfig,planPacks,auditOwnership,runtimeContentDefinitions,webTestFixtureFiles} from '../../scripts/godot/export';
import {startRuntime,supportsWorkletAudio} from '../../web/runtime-loader';
import {auditFoundationInventory,type FoundationInventory} from '../../scripts/build-asset-inventory';
describe('web export contract',()=>{
 it('uses a silent driver when the browser cannot provide secure worklet audio',async()=>{
  const engine={init:async()=>{},preloadFile:async()=>{},start:async(config:Record<string,unknown>)=>{expect(config.args).toEqual(['--main-pack','sor.pck','--audio-driver','Dummy']);}};
  await startRuntime(engine,'releases/id/sor',['sor.pck'],false);
  const capabilities={isSecureContext:true,AudioContext:{prototype:{audioWorklet:{}}},AudioWorkletNode:class {}};
  expect(supportsWorkletAudio(capabilities)).toBe(true);
  expect(supportsWorkletAudio({...capabilities,isSecureContext:false})).toBe(false);
  expect(supportsWorkletAudio({...capabilities,AudioContext:{prototype:{}}})).toBe(false);
 });
 it('separates three modes and excludes debug fixtures from release',()=>{
  expect(modeConfig('release')).toEqual({preset:'Web Release',dir:'dist',debug:false});
  expect(modeConfig('test')).toEqual({preset:'Web Test',dir:'dist-test',debug:true});
  expect(modeConfig('diagnostics')).toEqual({preset:'Web Diagnostics',dir:'dist-diagnostics',debug:false});
 });
 it('canonical identity includes sorted payload, mode, engine and shell without circular metadata',()=>{
  const descriptor={mode:'release',engine:{sha256:'a'},payload:{'b.pck':'b','a.js':'a'},packOrder:['b.pck'],browser:{shell:'c',adapter:'d'}};
  expect(buildIdentity(descriptor)).toMatch(/^[a-f0-9]{64}$/);
  expect(buildIdentity(descriptor)).toBe(buildIdentity({...descriptor,payload:{'a.js':'a','b.pck':'b'}}));
  for(const change of [{mode:'test'},{engine:{sha256:'b'}},{browser:{shell:'x',adapter:'d'}},{payload:{'b.pck':'z','a.js':'a'}}])expect(buildIdentity({...descriptor,...change})).not.toBe(buildIdentity(descriptor));
 });
 it('splits only at resource boundaries with shared dependencies mounted first',()=>{
  const packs=planPacks([{path:'shared',bytes:2,group:'shared'},{path:'cow',bytes:5,group:'cow',dependencies:['shared']},{path:'crow',bytes:5,group:'crow',dependencies:['shared']}],8);
  expect(Object.keys(packs).length).toBeGreaterThan(1);
  expect(Object.values(packs).flat().sort()).toEqual(['cow','crow','shared']);
  expect(Object.values(packs)[0]).toContain('shared');
  expect(()=>planPacks([{path:'huge',bytes:9,group:'cow'}],8)).toThrow(/optimi|cap/i);
  expect(()=>planPacks([{path:'cow',bytes:1,group:'cow',dependencies:['missing']}],8)).toThrow(/missing/i);
 });
 it('rejects conflicting ownership and unresolved imported-resource remaps',()=>{
  expect(()=>auditOwnership({main:{'res://cow':'a'},cow:{'res://cow':'b'}})).toThrow(/ownership|conflict/i);
  expect(()=>auditOwnership({main:{'res://cow.import':'a'}},{'res://cow': 'res://missing.scn'})).toThrow(/remap|missing/i);
  expect(()=>auditOwnership({main:{'res://cow.import':'a'},cow:{'res://cow.scn':'b'}},{'res://cow':'res://cow.scn'})).not.toThrow();
 });
 it('preloads every pack before engine start using preserved virtual basenames',async()=>{
  const order:string[]=[];const engine={init:async(p:string)=>{order.push(`init:${p}`);},preloadFile:async(u:string,p:string)=>{order.push(`load:${u}:${p}`);},start:async(c:Record<string,unknown>)=>{order.push(`start:${JSON.stringify(c)}`);}};
  await startRuntime(engine,'releases/id/sor',['sor.pck','cow.pck']);
  expect(order.slice(0,3)).toEqual(['init:releases/id/sor','load:releases/id/sor.pck:sor.pck','load:releases/id/cow.pck:cow.pck']);
  expect(order[3]).toContain('start:');
 });
 it('enforces content budgets and byte-verified engine exceptions',()=>{
  const entry={url:'releases/id/sor.pck',sha256:'a'.repeat(64),bytes:17*1024*1024,category:'content' as const};
  const inventory={schemaVersion:1,buildId:'b'.repeat(64),mode:'test',engine:{version:'4.7.2',templateSha256:'c'.repeat(64)},entrypoint:'index.html',packMountOrder:[entry.url],entries:[entry]} as FoundationInventory;
  expect(()=>auditFoundationInventory(inventory,{})).toThrow(/16 MiB/i);
  expect(()=>auditFoundationInventory({...inventory,entries:[{...entry,category:'engine'}]},{})).toThrow(/engine|fingerprint/i);
  expect(()=>auditFoundationInventory({...inventory,entries:[{...entry,bytes:16*1024*1024},{...entry,url:'releases/id/second.pck',bytes:16*1024*1024}]},{})).toThrow(/30 MiB/i);
 });
});

import {verifyFoundationFiles} from '../../scripts/build-asset-inventory';import {sha256} from '../../scripts/godot/setup';
it('rejects missing, modified or unlisted shipped bytes without circular worker/inventory coverage',()=>{
 const bytes=new TextEncoder().encode('shell');const entry={url:'index.html',sha256:sha256(bytes),bytes:bytes.length,category:'content' as const};
 const inventory={schemaVersion:1,buildId:'b'.repeat(64),mode:'release',engine:{version:'4.7.2',templateSha256:'c'.repeat(64)},entrypoint:'index.html',packMountOrder:[],entries:[entry]} as FoundationInventory;
 expect(()=>verifyFoundationFiles(inventory,{})).toThrow(/missing/i);
 expect(()=>verifyFoundationFiles(inventory,{'index.html':new TextEncoder().encode('modified')})).toThrow(/digest|bytes/i);
 expect(()=>verifyFoundationFiles(inventory,{'index.html':bytes,'unlisted.js':bytes})).toThrow(/unlisted/i);
 expect(()=>verifyFoundationFiles(inventory,{'index.html':bytes,'sw.js':bytes,[`releases/${inventory.buildId}/asset-inventory.json`]:bytes})).not.toThrow();
});

it('keeps editable art provenance out of shipped content while retaining runtime definitions',()=>{
 expect(runtimeContentDefinitions(['content/roster.json','content/art-provenance.json','content/rooms.json','content/enemy-presentations.json','content/tuning.json','content/readme.md'])).toEqual(['content/roster.json','content/rooms.json','content/enemy-presentations.json','content/tuning.json']);
});

it('packages runtime pilot definition fixtures while excluding editable Blender source',()=>{
 expect(webTestFixtureFiles(['tests/godot/fixtures/art/representative.tscn','tests/godot/fixtures/art/enemy_review.gd','tests/godot/fixtures/art/enemy-pilot/definitions.json','tests/godot/fixtures/art/enemy-pilot/grunt/source/character.blend'])).toEqual(['tests/godot/fixtures/art/representative.tscn','tests/godot/fixtures/art/enemy_review.gd','tests/godot/fixtures/art/enemy-pilot/definitions.json']);
});
