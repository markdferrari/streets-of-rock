import {describe,it,expect} from 'vitest';
import {createCredits} from '../../../scripts/art/credits';
describe('shipped artwork notices',()=>{
 const source=(id:string,status='accepted')=>({id,status,name:id,creator:'Artist',licenseId:'CC0-1.0',attributionText:`${id} attribution`,requiredNotices:['Keep this notice']});
 it('projects only used accepted sources in stable order with exact notices',()=>{
  const sources=[source('z'),source('unused'),source('a')];
  const resources={art:{one:{sourceRecordIds:['z','a','z']}}};
  const a=createCredits({sources},resources);
  expect(a.sources.map(s=>s.id)).toEqual(['a','z']);
  expect(a.sources[0].requiredNotices).toEqual(['Keep this notice']);
  expect(a.text).toContain('a attribution');expect(a.text).not.toContain('unused');
  expect(createCredits({sources:[...sources].reverse()},resources)).toEqual(a);
 });
 it('rejects missing, pending and rejected used sources rather than omitting credit',()=>{
  for(const sources of [[],[source('bad','pending')],[source('bad','rejected')]])expect(()=>createCredits({sources},{art:{one:{sourceRecordIds:['bad']}}})).toThrow(/bad.*accepted/);
 });
 it('requires a meaningful identity and license and retains original declarations',()=>{
  expect(()=>createCredits({sources:[{id:'x',status:'accepted'}]},{art:{x:{sourceRecordIds:['x']}}})).toThrow(/x/);
  const record={...source('original'),originalAuthorDeclaration:'Original project geometry'};
  expect(createCredits({sources:[record]},{art:{x:{sourceRecordIds:['original']}}}).text).toContain('Original project geometry');
 });
 it('credits shipped props even when they use the inherited props registry',()=>{
  const provenance={sources:[source('supplier')],runtimeProps:[{runtimePath:'assets/bottle.glb',sourceRecordIds:['supplier'],adaptations:['Embedded texture']} ]};
  const credits=createCredits(provenance,{art:{},props:{bottle:'assets/bottle.glb'}});
  expect(credits.sources.map(s=>s.id)).toEqual(['supplier']);expect(credits.text).toContain('Embedded texture');
 });

});
