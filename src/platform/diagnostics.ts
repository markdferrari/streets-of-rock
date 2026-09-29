export interface FrameSample {
  readonly now: number;
  readonly phase: string;
  readonly encounter: string | null;
  readonly hidden: boolean;
  readonly draws: number;
  readonly triangles: number;
}

export interface FrameRecord extends Omit<FrameSample, 'hidden'> {
  readonly frameMs: number;
  readonly rollingFps: number;
}

export interface DiagnosticSnapshot {
  readonly frames: readonly FrameRecord[];
  readonly minimumRollingFps: number | null;
  readonly longestFrameMs: number;
  readonly peakDraws: number;
  readonly peakTriangles: number;
}

export class FrameDiagnostics {
  private lastPresented: number | null = null;
  private recent: { now: number; delta: number }[] = [];
  private frames: FrameRecord[] = [];
  private longestFrameMs = 0;
  private peakDraws = 0;
  private peakTriangles = 0;
  private minimumRollingFps: number | null = null;

  sample(sample: FrameSample): FrameRecord | null {
    if (sample.hidden || sample.phase === 'paused' || sample.phase === 'preparing' || sample.phase === 'error') {
      this.lastPresented = null;
      this.recent = [];
      return null;
    }
    const previous = this.lastPresented;
    this.lastPresented = sample.now;
    if (previous === null || sample.now <= previous) return null;
    const delta = sample.now - previous;
    this.recent.push({ now: sample.now, delta });
    this.recent = this.recent.filter(entry => sample.now - entry.now < 1000);
    const average = this.recent.reduce((sum, entry) => sum + entry.delta, 0) / this.recent.length;
    const rollingFps = 1000 / average;
    const record = { now: sample.now, phase: sample.phase, encounter: sample.encounter,
      draws: sample.draws, triangles: sample.triangles, frameMs: delta, rollingFps };
    this.frames.push(record);
    this.longestFrameMs = Math.max(this.longestFrameMs, delta);
    this.peakDraws = Math.max(this.peakDraws, sample.draws);
    this.peakTriangles = Math.max(this.peakTriangles, sample.triangles);
    this.minimumRollingFps = Math.min(this.minimumRollingFps ?? Infinity, rollingFps);
    return record;
  }

  snapshot(): DiagnosticSnapshot {
    return { frames: [...this.frames], minimumRollingFps: this.minimumRollingFps,
      longestFrameMs: this.longestFrameMs, peakDraws: this.peakDraws, peakTriangles: this.peakTriangles };
  }

  exportJson(): string { return JSON.stringify(this.snapshot(), null, 2); }
}
