import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {validateSvg,validateCatalogue,decodedBytes,auditBackdrops,auditImportedBackdrops} from '../../scripts/backdrops/validate';
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024" viewBox="0 0 2048 1024"><rect width="2048" height="1024" fill="#171024"/></svg>';
it('accepts an editable opaque static self-contained SVG at the locked size',()=>{expect(validateSvg(svg,2048,1024)).toEqual([]);});
it('rejects wrong image sizes, external resources, scripts and animated or transparent roots',()=>{
 for(const bad of [svg.replace('2048','1024'),svg.replace('</svg>','<script>alert(1)</script></svg>'),svg.replace('</svg>','<image href="https://example.com/art.png"/></svg>'),svg.replace('</svg>','<animate attributeName="opacity"/></svg>'),svg.replace('fill="#171024"','fill="none"'),svg.replace('</svg>','<style>@import url(https://example.com/font)</style></svg>'),svg.replace('<rect ', '<rect opacity="0.5" '),svg.replace('fill="#171024"','fill="#17102400"'),svg.replace('<rect ', '<rect x="20" '),svg.replace('</svg>','<style>@keyframes blink {to{opacity:0}} rect{animation:blink 1s infinite}</style></svg>')])expect(validateSvg(bad,2048,1024).length).toBeGreaterThan(0);
});
it('requires exactly the four stable room mappings and safe locked wall/floor paths',()=>{
 const catalogue=JSON.parse(readFileSync('content/backdrops.json','utf8'));expect(validateCatalogue(catalogue)).toEqual([]);
 for(const value of [{...catalogue,schemaVersion:2},{...catalogue,rooms:catalogue.rooms.slice(0,3)},{...catalogue,rooms:catalogue.rooms.map((r:any,i:number)=>({...r,roomId:i===1?'dance-floor':r.roomId}))},{...catalogue,rooms:catalogue.rooms.map((r:any)=>({...r,wall:'../missing.svg'}))}])expect(validateCatalogue(value).length).toBeGreaterThan(0);
});
it('accounts for all eight decoded RGBA textures including the complete mip pyramid',()=>{
 const sizes=Array.from({length:4},()=>[{width:2048,height:1024},{width:1024,height:512}]).flat();expect(decodedBytes(sizes)).toBe(55924064);expect(decodedBytes(sizes)).toBeLessThanOrEqual(64*1024*1024);expect(decodedBytes([...sizes,{width:4096,height:4096}])).toBeGreaterThan(64*1024*1024);
});
it('audits the actual eight final vector panels and their complete decoded budget',()=>{
 expect(auditBackdrops()).toBe(55924064);
});
it('requires all eight actual final texture imports in a shipped pack, never concept substitutes',()=>{
 const catalogue=JSON.parse(readFileSync('content/backdrops.json','utf8'));
 const paths=catalogue.rooms.flatMap((room:any)=>['wall','floor'].map(kind=>'res://'+room[kind]+'.import'));
 expect(()=>auditImportedBackdrops(paths)).not.toThrow();
 expect(()=>auditImportedBackdrops(paths.slice(1))).toThrow(/required backdrop/i);
 expect(()=>auditImportedBackdrops(paths.map((path:string)=>path.replace('backdrops/','backdrops/concepts/')))).toThrow(/required backdrop/i);
});
