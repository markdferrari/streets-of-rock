import {readFileSync} from 'node:fs';
export const roomMappings=['dance-floor','vip-lounge','backstage-corridor','alley-exit'] as const;
export const settings=['outside-entrance','bar','dance-floor','stage-vip'] as const;
export type BackdropCatalogue={schemaVersion:1;rooms:{roomId:string;setting:string;wall:string;floor:string}[]};
export function validateSvg(text:string,width:number,height:number):string[]{
 const errors:string[]=[];const root=text.match(/<svg\b[^>]*>/i)?.[0]??'';
 if(!root||!new RegExp(`\\bwidth=["']${width}["']`).test(root)||!new RegExp(`\\bheight=["']${height}["']`).test(root)||!new RegExp(`\\bviewBox=["']0 0 ${width} ${height}["']`).test(root))errors.push('Locked SVG dimensions/viewBox required');
 if(/<(?:script|animate\w*|set|foreignObject|image|text)\b|on\w+\s*=|@import|@keyframes|animation\s*:|<!DOCTYPE|<!ENTITY/i.test(text))errors.push('Static self-contained vector source required (outline any text)');
 if(/(?:href|src)\s*=\s*["'](?!#)|url\(\s*["']?(?!#)[^\s)]/i.test(text))errors.push('External resource forbidden');
 const backgrounds=text.match(/<rect\b[^>]*>/gi)??[];
 const opaque=backgrounds.some(rect=>{
  const attr=(key:string)=>rect.match(new RegExp(`\\b${key}=["']([^"']*)["']`,'i'))?.[1];
  const fill=attr('fill')??'';
  return attr('width')===String(width)&&attr('height')===String(height)&&['x','y'].every(key=>!attr(key)||attr(key)==='0')&&['opacity','fill-opacity'].every(key=>!attr(key)||attr(key)==='1')&&!/style=|transform=/.test(rect)&&/^(?:#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{6}ff|rgb\([\d\s,%]+\)|[a-z]+)$/i.test(fill)&&!['none','transparent','inherit'].includes(fill.toLowerCase());
 });
 if(!opaque)errors.push('Full-size opaque background required');
 if(/<svg\b[^>]*(?:opacity=["']0?\.\d|fill-opacity=["']0?\.\d)/i.test(text))errors.push('Opaque root required');
 return errors;
}
export function validateCatalogue(value:unknown):string[]{
 const errors:string[]=[];const v=value as BackdropCatalogue;
 if(!v||v.schemaVersion!==1||!Array.isArray(v.rooms)||v.rooms.length!==4)return ['Exactly four schemaVersion 1 backdrop mappings required'];
 v.rooms.forEach((room,index)=>{
  if(room.roomId!==roomMappings[index]||room.setting!==settings[index])errors.push(`rooms[${index}]: stable room/setting mapping required`);
  for(const kind of ['wall','floor'] as const)if(room[kind]!==`assets/backdrops/${settings[index]}/${kind}.svg`)errors.push(`rooms[${index}].${kind}: locked self-contained SVG path required`);
 });return errors;
}
export function decodedBytes(sizes:{width:number;height:number}[]):number{
 let total=0;
 for(const size of sizes){let {width,height}=size;if(!Number.isSafeInteger(width)||!Number.isSafeInteger(height)||width<=0||height<=0)throw new Error('Positive integer texture dimensions required');for(;;){total+=width*height*4;if(width===1&&height===1)break;width=Math.max(1,Math.floor(width/2));height=Math.max(1,Math.floor(height/2));}}
 return total;
}
export function auditBackdrops(base='.'):number{
 const value=JSON.parse(readFileSync(`${base}/content/backdrops.json`,'utf8')) as BackdropCatalogue;const errors=validateCatalogue(value);
 for(const room of value.rooms)for(const kind of ['wall','floor'] as const)errors.push(...validateSvg(readFileSync(`${base}/${room[kind]}`,'utf8'),kind==='wall'?2048:1024,kind==='wall'?1024:512).map(error=>`${room[kind]}: ${error}`));
 const bytes=decodedBytes(Array.from({length:4},()=>[{width:2048,height:1024},{width:1024,height:512}]).flat());if(bytes>64*1024*1024)errors.push('Decoded texture budget exceeds 64 MiB');if(errors.length)throw new Error(errors.join('\n'));return bytes;
}
export function auditImportedBackdrops(paths:string[]):void{
 const shipped=new Set(paths);
 for(const setting of settings)for(const kind of ['wall','floor']){
  const path=`res://assets/backdrops/${setting}/${kind}.svg.import`;
  if(!shipped.has(path))throw new Error(`Missing required backdrop import: ${path}`);
 }
}
if(import.meta.main)console.log(`Backdrops validated: eight SVGs, ${auditBackdrops()} decoded bytes including mipmaps`);
