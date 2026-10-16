import {it,expect,afterEach} from 'vitest';
import {readFileSync,mkdtempSync,cpSync,symlinkSync,rmSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {createCredits} from '../../../scripts/art/credits';
import {validateArt} from '../../../scripts/art/validate';
const roots:string[]=[];afterEach(()=>{for(const root of roots.splice(0))rmSync(root,{recursive:true,force:true});});
function fixture(){const root=mkdtempSync(join(tmpdir(),'hero-validation-'));roots.push(root);cpSync('project.godot',join(root,'project.godot'));cpSync('content',join(root,'content'),{recursive:true});for(const dir of ['game','.godot','assets','scripts','scenes'])symlinkSync(join(process.cwd(),dir),join(root,dir),'dir');return {root,read:(name:string)=>JSON.parse(readFileSync(join(root,`content/${name}.json`),'utf8')),save:(name:string,data:unknown)=>writeFileSync(join(root,`content/${name}.json`),JSON.stringify(data))};}
it('discovers accepted hero sources through shipped model authority and preserves unknown receipt dates',()=>{
 const source={id:'universal',status:'accepted',name:'Universal',creator:'Quaternius',licenseId:'CC0-1.0',attributionText:'Quaternius',requiredNotices:[],acquisitionDate:'unknown'};
 const p={sources:[source],runtimeAssets:[{id:'hero.cow',modelKey:'cow',runtimePath:'assets/cow.glb',sourceRecordIds:['universal'],adaptations:['Mapped joints']} ]};
 const c=createCredits(p,{art:{},models:{cow:'assets/cow.glb'}});
 expect(c.sources.map(s=>s.id)).toEqual(['universal']);expect(c.text).toContain('Mapped joints');
 expect(()=>createCredits({...p,sources:[{...source,status:'rejected'}]},{art:{},models:{cow:'assets/cow.glb'}})).toThrow(/accepted/);
 expect(createCredits(p,{art:{},models:{cow:'assets/different.glb'}}).sources).toEqual([]);
});
it('delegates focused hero validation and rejects conflicting focus options',()=>{
 let args:string[]=[];expect(validateArt(['--character','cow'],a=>{args=a;return {status:0,output:'Valid hero'};}).status).toBe(0);expect(args).toContain('--character');
 for(const input of [['--character','unknown'],['--character'],['--character','cow','--room','bar']])expect(validateArt(input).status).toBe(2);
});
it('validates real physical clips and refuses stale runtime hashes, source summaries and phase boundaries without mutations',()=>{
 const f=fixture();const original=f.read('hero-animations');
 const valid=validateArt(['--root',f.root,'--character','cow']);expect(valid.status,valid.output).toBe(0);
 for(const mutation of ['clip','segment','summary','hash','sourceFile']){
  const p=structuredClone(original),ledger=f.read('art-provenance');
  if(mutation==='clip')p.characters[0].bindings.Idle.clipName='MissingHeroClip';
  if(mutation==='segment')p.characters[0].bindings['cow1.active'].startSeconds+=.01;
  if(mutation==='summary')p.sources[0].status='rejected';
  if(mutation==='hash')ledger.runtimeAssets.find((a:any)=>a.id==='hero.cow').runtimeSha256='0'.repeat(64);
  if(mutation==='sourceFile')ledger.runtimeAssets.find((a:any)=>a.id==='hero.cow').selectedMotion[0].sha256='0'.repeat(64);
  f.save('hero-animations',p);f.save('art-provenance',ledger);
  const before=readFileSync(join(f.root,'content/hero-animations.json'),'utf8');
  const r=validateArt(['--root',f.root,'--character','cow']);expect(r.status,mutation+': '+r.output).toBe(1);
  expect(readFileSync(join(f.root,'content/hero-animations.json'),'utf8')).toBe(before);
  f.save('art-provenance',JSON.parse(readFileSync('content/art-provenance.json','utf8')));
 }
},30000);
