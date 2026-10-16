import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
export interface Credit {id:string;name:string;creator:string;licenseId:string;attributionText:string;requiredNotices:string[];modifications?:string[];originalAuthorDeclaration?:string;sourceUrl?:string}
export function createCredits(provenance:{sources:any[];runtimeAssets?:any[];runtimeProps?:any[]},resources:{art:Record<string,any>;props?:Record<string,string>;models?:Record<string,string>}):{schemaVersion:number;sources:Credit[];text:string} {
 const shippedProps=new Set(Object.values(resources.props??{}));
 const heroSources=(provenance.runtimeAssets??[]).filter(asset=>asset.id?.startsWith('hero.') && resources.models?.[asset.modelKey]===asset.runtimePath).flatMap(asset=>asset.sourceRecordIds??[]);
 const used=new Set<string>([...heroSources,...Object.values(resources.art).flatMap(r=>r.sourceRecordIds??[]),...(provenance.runtimeProps??[]).filter(prop=>shippedProps.has(prop.runtimePath)).flatMap(prop=>prop.sourceRecordIds??[])]);
 const sources:Credit[]=[...used].sort().map(id=>{
  const source=provenance.sources.find(s=>s.id===id);
  if(!source||source.status!=='accepted')throw new Error(`${id}: used source must be accepted before shipping credits`);
  for(const field of ['name','creator','licenseId'])if(typeof source[field]!=='string'||!source[field].trim())throw new Error(`${id}.${field}: reviewed credit required`);
  if(!source.originalAuthorDeclaration && (typeof source.attributionText!=='string'||!Array.isArray(source.requiredNotices)))throw new Error(`${id}: attribution and notices required`);
  const credit:Credit={id,name:source.name,creator:source.creator,licenseId:source.licenseId,attributionText:source.attributionText??'',requiredNotices:source.requiredNotices??[]};
  credit.modifications=[...new Set<string>([...(provenance.runtimeAssets??[]),...(provenance.runtimeProps??[])].filter(asset=>asset.sourceRecordIds?.includes(id)).flatMap(asset=>asset.adaptations??[]))].sort();
  for(const key of ['originalAuthorDeclaration','sourceUrl'] as const)if(source[key])credit[key]=source[key];
  return credit;
 });
 const text='Artwork Credits\n\n'+sources.map(s=>[s.name,s.creator,s.licenseId,s.attributionText,s.originalAuthorDeclaration,...(s.modifications??[]),...s.requiredNotices,s.sourceUrl].filter(Boolean).join('\n')).join('\n\n');
 return {schemaVersion:1,sources,text};
}
export function generateCredits(){
 const result=createCredits(JSON.parse(readFileSync('content/art-provenance.json','utf8')),JSON.parse(readFileSync('content/resources.json','utf8')));
 mkdirSync('public/assets/credits',{recursive:true});
 writeFileSync('public/assets/credits/art-credits.json',JSON.stringify(result,null,2)+'\n');
 writeFileSync('public/assets/credits/ARTWORK-NOTICES.txt',result.text+'\n');
 return result;
}
if(import.meta.main)generateCredits();
