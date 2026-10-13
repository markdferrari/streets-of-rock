import { describe, expect, it, vi } from 'vitest';
import { auditCached, verifyResponse } from '../../web/cache-audit';
import { requestCache } from '../../web/cache-client';

const entry = { url: '/release/data.pck', bytes: 4, sha256: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4' , category: 'content' as const };
const response = (body: string) => new Response(body, { status: 200 });

describe('release cache verification and repair protocol', () => {
  it('ends idle requests after 10 seconds and progressing requests at the 120 second deadline',async()=>{
    vi.useFakeTimers();
    class Channel {port1:any={close:()=>{},onmessage:null};port2:any={postMessage:(data:unknown)=>this.port1.onmessage?.({data})};}
    vi.stubGlobal('MessageChannel',Channel);
    try{
      const idle=requestCache({postMessage:()=>{}} as any,'release');
      await vi.advanceTimersByTimeAsync(10001);expect((await idle).error).toMatch(/idle timeout/);
      let interval:ReturnType<typeof setInterval>;
      const busy=requestCache({postMessage:(message:any,ports:any[])=>{interval=setInterval(()=>ports[0].postMessage({type:'CACHE_PROGRESS',requestId:message.requestId}),9000);}} as any,'release');
      await vi.advanceTimersByTimeAsync(120001);expect((await busy).error).toMatch(/deadline/);clearInterval(interval!);
    }finally{vi.unstubAllGlobals();vi.useRealTimers();}
  });
  it('ignores stale request IDs and rejects invalid required paths',async()=>{
    class Channel {port1:any={close:()=>{},onmessage:null};port2:any={postMessage:(data:unknown)=>this.port1.onmessage?.({data})};}
    vi.stubGlobal('MessageChannel',Channel);
    try{
      const worker={postMessage:(message:any,ports:any[])=>{
        ports[0].postMessage({type:'CACHE_STATUS',requestId:'stale'});
        ports[0].postMessage({type:'CACHE_STATUS',requestId:message.requestId,protocolVersion:1,buildId:'release',state:'ready',missing:[42],corrupt:[]});
      }} as any;
      expect((await requestCache(worker,'release')).error).toMatch(/invalid paths/);
    }finally{vi.unstubAllGlobals();}
  });
  it('requires exact byte length and SHA-256 and distinguishes missing from corrupt files', async () => {
    expect(await verifyResponse(response('1234'), entry)).toBe(true);
    expect(await verifyResponse(response('123'), entry)).toBe(false);
    expect(await auditCached([entry], async () => response('bad!'))).toMatchObject({ state: 'error', corrupt: [entry.url], missing: [] });
    expect(await auditCached([entry], async () => undefined)).toMatchObject({ state: 'error', missing: [entry.url], corrupt: [] });
    expect(await auditCached([entry, entry], async () => response('1234'))).toMatchObject({ state: 'error' });
  });
  it('rejects mismatched build responses and reports the exact repair request', async () => {
    const worker = { postMessage: vi.fn((message: any, ports: MessagePort[]) => ports[0]!.postMessage({ type: 'CACHE_STATUS', protocolVersion: 1, requestId: message.requestId, buildId: 'wrong', state: 'ready', missing: [], corrupt: [] })) } as unknown as ServiceWorker;
    const result = await requestCache(worker, 'a'.repeat(64), true);
    expect(result.state).toBe('error'); expect(result.error).toMatch(/mismatch/);
    expect((worker.postMessage as any).mock.calls[0]![0]).toMatchObject({ type: 'CACHE_REPAIR', protocolVersion: 1, expectedBuildId: 'a'.repeat(64) });
  });
  it('turns quota and missing worker errors into incomplete readiness', async () => {
    expect((await requestCache(null, 'b'.repeat(64))).state).toBe('error');
    const worker = { postMessage: (_message: any, ports: MessagePort[]) => ports[0]!.postMessage({ type: 'CACHE_STATUS', protocolVersion: 1, requestId: _message.requestId, buildId: 'b'.repeat(64), state: 'error', missing: [], corrupt: [], error: 'quota denied' }) } as unknown as ServiceWorker;
    expect((await requestCache(worker, 'b'.repeat(64))).error).toBe('quota denied');
  });
});
