import {expect,it} from 'vitest';
import {auditCached,digest,verifyResponse} from '../../web/cache-audit';
it('audits every engine/pack byte and never treats missing or corrupt data as ready',async()=>{
 const bytes=new TextEncoder().encode('engine bytes');const entry={url:'engine.wasm',bytes:bytes.length,sha256:await digest(bytes.buffer),category:'engine' as const};
 expect(await verifyResponse(new Response(bytes),entry)).toBe(true);
 expect(await auditCached([entry],async()=>undefined)).toEqual({missing:['engine.wasm'],corrupt:[],state:'error'});
 expect(await auditCached([entry],async()=>new Response('changed bytes'))).toEqual({missing:[],corrupt:['engine.wasm'],state:'error'});
 expect(await auditCached([entry],async()=>new Response(bytes))).toEqual({missing:[],corrupt:[],state:'ready'});
});

it('rejects an empty or duplicate required inventory instead of claiming offline readiness',async()=>{
 expect((await auditCached([],async()=>undefined)).state).toBe('error');
 const entry={url:'engine.wasm',bytes:1,sha256:await digest(new Uint8Array([1]).buffer),category:'engine' as const};
 expect((await auditCached([entry,entry],async()=>new Response(new Uint8Array([1])))).state).toBe('error');
});
