import { afterEach, describe, expect, it } from 'vitest';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateArt } from '../../../scripts/art/validate';
import { createHash } from 'node:crypto';
const roots:string[]=[];
afterEach(()=>{for (const root of roots.splice(0)) rmSync(root,{recursive:true,force:true});});
function fixture() {
 const root=mkdtempSync(join(tmpdir(),'art-import-'));roots.push(root);
 cpSync('project.godot',join(root,'project.godot'));
 for (const dir of ['game','.godot']) symlinkSync(join(process.cwd(),dir),join(root,dir),'dir');
 for (const path of ['assets/enemies/grunt/runtime/character.glb','assets/enemies/grunt/runtime/character.glb.import','assets/enemies/grunt/source/character.blend','assets/enemies/shared/outfit.tres']) {
  mkdirSync(join(root,path,'..'),{recursive:true});cpSync(path,join(root,path));
 }
 mkdirSync(join(root,'content'));mkdirSync(join(root,'scenes/art/rooms'),{recursive:true});
 const cues:Record<string,string[]>={exterior:['frontage','club-sign','neon-doorway','light-spill','pavement','queue-barriers','event-posters'],bar:['long-counter','bottle-shelves','stools','booths','warm-light','neon-accents'],'dance-floor':['dance-floor','dj-booth','large-speakers','overhead-fixtures','coloured-light-pools'],'stage-vip':['curtains','stage-backdrop','vip-seating','club-branding','dramatic-light']};
 const areas=['dance-floor','vip-lounge','backstage-corridor','alley-exit'];
 const art:Record<string,unknown>={'outfit':{path:'assets/enemies/shared/outfit.tres',sourceRecordIds:['original'],dependencyIds:[]}};
 const rooms=Object.keys(cues).map((id,i)=>{
  const path=`scenes/art/rooms/${id}.tscn`;
  writeFileSync(join(root,path),'[gd_scene load_steps=3 format=3]\n[sub_resource type="StandardMaterial3D" id="mat"]\n[sub_resource type="BoxMesh" id="box"]\nmaterial = SubResource("mat")\n[node name="Room" type="Node3D"]\n'+cues[id].map(name=>`[node name="${name}" type="MeshInstance3D" parent="."]\nmesh = SubResource("box")\n`).join(''));
  art[id]={path,sourceRecordIds:['original'],dependencyIds:[]};
  return {areaId:areas[i],visualId:id,sceneResourceId:id,sourceRecordIds:['original'],requiredLandmarks:cues[id],dependencyIds:[],coverageBounds:{minX:-2,maxX:18,minDepth:-8,maxDepth:8},reviewSubjectId:id};
 });
 const base=JSON.parse(readFileSync('content/enemy-presentations.json','utf8')).enemies[0];
 const enemies=['grunt','zoner','enforcer','liam'].map(role=>{
  const d=structuredClone(base);d.role=role;d.sourceRecordIds=['original'];d.sceneResourceId=role;
  d.allowedMoveIds=role==='grunt'?['grunt']:role==='zoner'?['throw']:role==='enforcer'?['charge']:['close','rope','shockwave'];
  d.clipBindings={};
  for (const key of ['Idle','Move','Hurt','Defeated',...(role==='liam'?[]:['Stunned']),...d.allowedMoveIds.flatMap((move:string)=>['windup','active','recovery'].map(phase=>`${move}.${phase}`))]) d.clipBindings[key]=structuredClone(base.clipBindings.Idle);
  art[role]={path:'assets/enemies/grunt/runtime/character.glb',sourceRecordIds:['original'],dependencyIds:['outfit']};return d;
 });
 const source={id:'original',status:'accepted',name:'Fixture',creator:'Fixture author',originalAuthorDeclaration:'Original isolated fixture, never shipped',licenseId:'LicenseRef-Fixture',reviewer:'Fixture author',reviewDate:'2026-10-14',sourcePath:'content/original.txt',sourceSha256:createHash('sha256').update('fixture source').digest('hex')};
 writeFileSync(join(root,'content/original.txt'),'fixture source');
 // Full validation includes the current hero catalogue; this fixture only replaces venue/enemy records.
 for(const name of ['hero-animations','animation-clips','roster'])cpSync(`content/${name}.json`,join(root,`content/${name}.json`));
 cpSync('content/characters',join(root,'content/characters'),{recursive:true});
 for(const dir of ['assets/characters','assets/art-sources','scripts'])symlinkSync(join(process.cwd(),dir),join(root,dir),'dir');
 const liveResources=JSON.parse(readFileSync('content/resources.json','utf8'));
 const liveProvenance=JSON.parse(readFileSync('content/art-provenance.json','utf8'));
 const heroAssets=liveProvenance.runtimeAssets.filter((a:any)=>a.id?.startsWith('hero.'));
 const heroIds=new Set(heroAssets.flatMap((a:any)=>a.sourceRecordIds));
 const heroSources=liveProvenance.sources.filter((s:any)=>heroIds.has(s.id));
 const data={rooms:{schemaVersion:1,rooms},enemies:{schemaVersion:1,enemies},resources:{art,models:liveResources.models},provenance:{schemaVersion:1,sources:[source,...heroSources],runtimeAssets:heroAssets}};
 const save=()=>{for (const [key,path] of [['rooms','rooms'],['enemies','enemy-presentations'],['resources','resources'],['provenance','art-provenance']] as const) writeFileSync(join(root,`content/${path}.json`),JSON.stringify(data[key]));};
 save();return {root,data,save};
}
describe('actual Godot art authoring validation',()=>{
 it('accepts complete isolated imports and labels definitions-only as incomplete',()=>{
  const f=fixture();
  const r=validateArt(['--root',f.root]);expect(r.output).toMatch(/Valid/);expect(r.status,r.output).toBe(0);
  expect(validateArt(['--root',f.root,'--definitions-only']).output).toMatch(/incomplete.*release/i);
 },30000);
 it('validates the complete production catalogue after all four rooms and roles are registered',()=>{
  const r=validateArt([]);expect(r.status,r.output).toBe(0);expect(r.output).toMatch(/Valid: full artwork catalogue/);
 });
 it('scopes to one enemy without failing an unrelated incomplete room catalogue',()=>{
  const f=fixture();f.data.rooms.rooms=[];f.save();
  expect(validateArt(['--root',f.root,'--enemy','grunt']).status).toBe(0);
  expect(validateArt(['--root',f.root]).status).toBe(1);
 });
 it('checks missing imported clips, corrupt resources, forbidden room nodes and landmarks',()=>{
  const f=fixture();f.data.enemies.enemies[0].clipBindings.Idle.clipName='Missing_Idle';f.save();
  let r=validateArt(['--root',f.root,'--enemy','grunt']);expect(r.status).toBe(1);expect(r.output).toContain('Missing_Idle');
  f.data.enemies.enemies[0].clipBindings.Idle.clipName='Idle_A';f.save();
  writeFileSync(join(f.root,'scenes/art/rooms/exterior.tscn'),'invalid scene');
  r=validateArt(['--root',f.root,'--room','exterior']);expect(r.status).toBe(1);expect(r.output).toMatch(/exterior/);
  writeFileSync(join(f.root,'scenes/art/rooms/exterior.tscn'),'[gd_scene format=3]\n[node name="Room" type="Node3D"]\n[node name="Collider" type="StaticBody3D" parent="."]\n');
  r=validateArt(['--root',f.root,'--room','exterior']);expect(r.status).toBe(1);expect(r.output).toMatch(/forbidden|StaticBody3D/);expect(r.output).toMatch(/frontage/);
 });
 it('rejects unaccepted or hash-mismatched provenance even in definitions-only and never mutates files',()=>{
  const f=fixture();const before=readFileSync(join(f.root,'content/original.txt'),'utf8');
  f.data.provenance.sources[0].status='candidate';f.save();
  let r=validateArt(['--root',f.root,'--enemy','grunt','--definitions-only']);expect(r.status).toBe(1);expect(r.output).toContain('original');
  f.data.provenance.sources[0].status='accepted';f.save();writeFileSync(join(f.root,'content/original.txt'),'changed');
  r=validateArt(['--root',f.root,'--enemy','grunt','--definitions-only']);expect(r.status).toBe(1);expect(r.output).toMatch(/sha256|hash/i);expect(readFileSync(join(f.root,'content/original.txt'),'utf8')).toBe('changed');expect(before).toBe('fixture source');
 });
 it('rejects undeclared scene dependencies and missing dependency files',()=>{
  const f=fixture();
  writeFileSync(join(f.root,'scenes/art/rooms/shared.tres'),'[gd_resource type="StandardMaterial3D" format=3]\n[resource]\nalbedo_color = Color(1,0,0,1)\n');
  const path=join(f.root,'scenes/art/rooms/exterior.tscn');
  writeFileSync(path,readFileSync(path,'utf8').replace('load_steps=3','load_steps=4').replace('[sub_resource type="StandardMaterial3D"','[ext_resource type="Material" path="res://scenes/art/rooms/shared.tres" id="external"]\n[sub_resource type="StandardMaterial3D"')+'[node name="Dependency" type="MeshInstance3D" parent="."]\nmesh = SubResource("box")\nmaterial_override = ExtResource("external")\n');
  const r=validateArt(['--root',f.root,'--room','exterior']);expect(r.status).toBe(1);expect(r.output).toMatch(/shared.tres.*undeclared|undeclared.*shared.tres/);
 });
 it('rejects changed GLB bytes even when the old imported scene is still loadable',()=>{
  const f=fixture();const bytes='corrupted unimported replacement';
  writeFileSync(join(f.root,'assets/enemies/grunt/runtime/character.glb'),bytes);
  f.data.enemies.enemies[0].runtimeSha256=createHash('sha256').update(bytes).digest('hex');f.save();
  const r=validateArt(['--root',f.root,'--enemy','grunt']);
  expect(r.status,r.output).toBe(1);expect(r.output).toMatch(/stale|reimport|corrupt/i);
 });

 it('rejects rejected or pending used sources and missing role coverage',()=>{
  const f=fixture();
  for(const status of ['pending','rejected']){f.data.provenance.sources[0].status=status;f.save();const r=validateArt(['--root',f.root,'--enemy','grunt']);expect(r.status).toBe(1);expect(r.output).toMatch(/unaccepted/);}
  f.data.provenance.sources[0].status='accepted';f.data.enemies.enemies.pop();f.save();
  expect(validateArt(['--root',f.root]).status).toBe(1);
 });
 it('requires retained acquisition and license evidence for a third-party source',()=>{
  const f=fixture();const source:any=f.data.provenance.sources[0];delete source.originalAuthorDeclaration;
  source.sourceUrl='https://supplier.example/art';source.acquisitionDate='2026-10-15';source.acquiredPath='content/original.txt';source.sha256=source.sourceSha256;
  source.permissions={commercial:true,modification:true,gameDistribution:true,purchaseCost:0,recurringFee:0};source.attributionText='Supplier credit';source.requiredNotices=[];
  source.licenseEvidencePaths=[];f.save();
  let r=validateArt(['--root',f.root,'--enemy','grunt']);expect(r.status).toBe(1);expect(r.output).toMatch(/licenseEvidence/);
  source.licenseEvidencePaths=['content/original.txt'];source.evidenceSha256={'content/original.txt':source.sourceSha256};f.save();
  r=validateArt(['--root',f.root,'--enemy','grunt']);expect(r.status,r.output).toBe(0);
  source.evidenceSha256['content/original.txt']='0'.repeat(64);f.save();r=validateArt(['--root',f.root,'--enemy','grunt']);expect(r.status).toBe(1);expect(r.output).toMatch(/licenseEvidence.*hash mismatch/);
 });

 it('checks shipped prop provenance instead of validating only room and enemy definitions',()=>{
  const f=fixture();const provenance:any=f.data.provenance;
  provenance.sources.push({...provenance.sources[0],id:'prop-supplier',status:'rejected'});
  const path='assets/enemies/grunt/runtime/character.glb';
  (f.data.resources as any).props={bottle:path};
  provenance.runtimeProps=[{id:'prop.bottle',runtimePath:path,runtimeSha256:createHash('sha256').update(readFileSync(join(f.root,path))).digest('hex'),sourceRecordIds:['prop-supplier']}];f.save();
  const r=validateArt(['--root',f.root]);expect(r.status).toBe(1);expect(r.output).toContain('prop-supplier');
  expect(validateArt(['--root',f.root,'--enemy','grunt']).status).toBe(0);
 });

});
