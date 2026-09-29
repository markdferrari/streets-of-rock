export interface PwaStatus {
  readonly readiness: 'unknown' | 'caching' | 'ready' | 'error';
  readonly waiting: boolean;
  readonly buildId: string | null;
}

export function pwaStatusText(status: PwaStatus): string {
  const cache = status.readiness === 'ready' ? 'Offline ready' :
    status.readiness === 'caching' ? 'Caching for offline play…' :
      status.readiness === 'error' ? 'Offline cache incomplete' : '';
  return [cache, status.waiting ? 'Update ready. Close all game windows and reopen.' : ''].filter(Boolean).join(' ');
}

export async function registerPwa(onStatus: (status: PwaStatus) => void): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  let status: PwaStatus = { readiness: 'caching', waiting: false, buildId: null };
  const publish = (change: Partial<PwaStatus>) => { status = { ...status, ...change }; onStatus(status); };
  onStatus(status);
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    const inspectWaiting = () => publish({ waiting: !!registration.waiting });
    inspectWaiting();
    registration.addEventListener('updatefound', () => {
      registration.installing?.addEventListener('statechange', inspectWaiting);
    });
    const active = (await navigator.serviceWorker.ready).active;
    if (!active) { publish({ readiness: 'error' }); return; }
    const reply = await new Promise<{ buildId: string; missing: string[] }>((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = window.setTimeout(() => reject(new Error('cache check timeout')), 10000);
      channel.port1.onmessage = event => { window.clearTimeout(timer); resolve(event.data); };
      active.postMessage({ type: 'CACHE_STATUS' }, [channel.port2]);
    });
    publish({ readiness: reply.missing.length ? 'error' : 'ready', buildId: reply.buildId });
  } catch { publish({ readiness: 'error' }); }
}
