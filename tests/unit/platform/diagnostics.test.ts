import { describe, expect, it } from 'vitest';
import { FrameDiagnostics } from '../../../src/platform/diagnostics';

describe('local frame diagnostics', () => {
  it('records active frame intervals by phase and encounter while excluding pauses and hidden time', () => {
    const meter = new FrameDiagnostics();
    expect(meter.sample({ now: 0, phase: 'selecting', encounter: null, hidden: false, draws: 2, triangles: 100 })).toBeNull();
    meter.sample({ now: 16, phase: 'selecting', encounter: null, hidden: false, draws: 2, triangles: 100 });
    meter.sample({ now: 32, phase: 'running', encounter: 'dance-floor', hidden: false, draws: 40, triangles: 20000 });
    meter.sample({ now: 5000, phase: 'paused', encounter: 'dance-floor', hidden: false, draws: 0, triangles: 0 });
    expect(meter.sample({ now: 10000, phase: 'running', encounter: 'vip', hidden: true, draws: 0, triangles: 0 })).toBeNull();
    expect(meter.sample({ now: 12000, phase: 'running', encounter: 'vip', hidden: false, draws: 50, triangles: 30000 })).toBeNull();
    meter.sample({ now: 12033, phase: 'running', encounter: 'vip', hidden: false, draws: 50, triangles: 30000 });
    const rows = meter.snapshot().frames;
    expect(rows.map(row => [row.phase, row.encounter, row.frameMs])).toEqual([
      ['selecting', null, 16], ['running', 'dance-floor', 16], ['running', 'vip', 33],
    ]);
    expect(meter.snapshot().longestFrameMs).toBe(33);
    expect(meter.snapshot().peakDraws).toBe(50);
    expect(meter.snapshot().peakTriangles).toBe(30000);
  });

  it('reports one-second rolling FPS and exports only local JSON', () => {
    const meter = new FrameDiagnostics();
    for (let now = 0; now <= 1200; now += 20) {
      meter.sample({ now, phase: 'running', encounter: 'street', hidden: false, draws: 10, triangles: 500 });
    }
    expect(meter.snapshot().frames.at(-1)?.rollingFps).toBeCloseTo(50, 0);
    const exported = JSON.parse(meter.exportJson());
    expect(exported.frames.at(-1).encounter).toBe('street');
    expect(exported.minimumRollingFps).toBeGreaterThanOrEqual(49);
  });
});
