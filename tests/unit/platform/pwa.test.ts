import { describe, expect, it } from 'vitest';
import { pwaStatusText } from '../../../src/platform/pwa';

describe('offline and update status', () => {
  it('keeps runtime and cache readiness distinct', () => {
    expect(pwaStatusText({ readiness: 'caching', waiting: false, buildId: null })).toContain('Caching for offline play');
    expect(pwaStatusText({ readiness: 'ready', waiting: false, buildId: 'build-a' })).toBe('Offline ready');
    expect(pwaStatusText({ readiness: 'error', waiting: false, buildId: 'build-a' })).toBe('Offline cache incomplete');
  });

  it('instructs users to close every window when a worker is waiting', () => {
    expect(pwaStatusText({ readiness: 'ready', waiting: true, buildId: 'build-a' })).toContain('Close all game windows and reopen');
  });
});
