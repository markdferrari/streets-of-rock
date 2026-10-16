import {auditArtDelivery} from '../../scripts/art/delivery';
import {describe,expect,it} from 'vitest';
import {auditExportPath,buildIdentity,modeConfig,planPacks,auditOwnership,runtimeContentDefinitions,webTestFixtureFiles} from '../../scripts/godot/export';
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

import {runtimeGameScripts} from '../../scripts/godot/export';
it('excludes author-only validators from every shipped script group while retaining runtime validation',()=>{
 expect(runtimeGameScripts(['game/tools/validate_art.gd','game/tools/validate_content.gd','game/content/art_catalog.gd','game/app/main.tscn','game/platform/test_bridge.gd','game/platform/diagnostics.gd'],'release')).toEqual(['game/content/art_catalog.gd','game/app/main.tscn']);
 expect(runtimeGameScripts(['game/tools/validate_art.gd','game/platform/test_bridge.gd','game/platform/diagnostics.gd'],'test')).toEqual(['game/platform/test_bridge.gd']);
 expect(runtimeGameScripts(['game/platform/test_bridge.gd','game/platform/diagnostics.gd'],'diagnostics')).toEqual(['game/platform/diagnostics.gd']);
});

it('includes baked hero trial GLBs only in Web Test and excludes authoring files',()=>{
 const paths=['tests/godot/fixtures/hero-animation/review.gd','tests/godot/fixtures/hero-animation/review.tscn','tests/godot/fixtures/hero-animation/candidates/cow/kaykit/character.glb','tests/godot/fixtures/hero-animation/candidates/cow/kaykit/rigged.blend'];
 expect(webTestFixtureFiles(paths)).toEqual(paths.slice(0,3));
 expect(runtimeGameScripts(['game/platform/test_bridge.gd','game/app/main.gd'],'release')).toEqual(['game/app/main.gd']);
});

it('ships hero profile metadata with model closure and excludes donor/review sources',()=>{
 expect(runtimeContentDefinitions(['content/hero-animations.json','content/art-provenance.json'])).toEqual(['content/hero-animations.json']);
 const packs=planPacks([{path:'hero-profile',bytes:300,group:'main'},{path:'hero.glb',bytes:400,group:'cow',dependencies:['hero-profile']}],700);
 expect(Object.values(packs).flat().filter(p=>p==='hero-profile')).toHaveLength(1);
 expect(()=>auditArtDelivery(['res://public/assets/credits/art-credits.json','res://public/assets/credits/ARTWORK-NOTICES.txt'],{art:{},models:{cow:'assets/cow.glb'}})).toThrow(/cow|hero/);
});

it('rejects retained donor sources and review fixtures at the actual release ownership boundary',()=>{
 for(const path of ['res://assets/art-sources/library.glb','res://tests/godot/fixtures/hero-animation/candidates/cow/universal/character.glb','res://assets/characters/cow-crow/runtime/cow-rigged.blend'])expect(()=>auditExportPath(path,'release')).toThrow(/Forbidden/);
 expect(()=>auditExportPath('res://assets/characters/cow-crow/runtime/cow.glb','release')).not.toThrow();
 expect(()=>auditExportPath('res://tests/godot/fixtures/hero-animation/review.gd','test')).not.toThrow();
});
