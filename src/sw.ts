import { precacheAndRoute, matchPrecache, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { createPartialResponse } from 'workbox-range-requests';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<string | { url: string; revision?: string | null }>;
};

const entries = self.__WB_MANIFEST;
const buildId = entries.map(entry => typeof entry === 'string' ? entry : `${entry.url}:${entry.revision ?? ''}`).sort()
  .join('|').split('').reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0, 2166136261).toString(16);

registerRoute(
  ({ request }) => request.method === 'GET' && request.headers.has('range') && /\.(wav|mp3|ogg|m4a)$/i.test(new URL(request.url).pathname),
  async ({ request }) => {
    const complete = await matchPrecache(request.url);
    if (!complete) return fetch(request);
    const range = request.headers.get('range') ?? '';
    const start = /^bytes=(\d+)-/.exec(range);
    if (start) {
      const size = (await complete.clone().blob()).size;
      if (Number(start[1]) >= size) return new Response('', { status: 416,
        headers: { 'Content-Range': `bytes */${size}` } });
    }
    return createPartialResponse(request, complete);
  },
);
precacheAndRoute(entries);
cleanupOutdatedCaches();

self.addEventListener('message', event => {
  if (event.data?.type !== 'CACHE_STATUS') return;
  const port = event.ports[0];
  if (!port) return;
  void Promise.all(entries.map(async entry => {
    const url = typeof entry === 'string' ? entry : entry.url;
    return await matchPrecache(url) ? null : url;
  })).then(results => port.postMessage({ type: 'CACHE_STATUS', buildId, missing: results.filter(Boolean) }))
    .catch(() => port.postMessage({ type: 'CACHE_STATUS', buildId, missing: ['cache verification failed'] }));
});
