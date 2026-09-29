export interface CountdownSnapshot {
  readonly number: 3 | 2 | 1 | null;
  readonly numberElapsedMs: number;
  readonly paused: boolean;
  readonly completed: boolean;
}

export class EntryCountdown {
  private number: 3 | 2 | 1 | null = 3;
  private elapsed = 0;
  private paused = false;
  private completed = false;
  private lastSampleMs: number;

  constructor(private readonly now: () => number) { this.lastSampleMs = now(); }

  snapshot(): CountdownSnapshot {
    return { number: this.number, numberElapsedMs: this.elapsed, paused: this.paused, completed: this.completed };
  }

  frame(): boolean {
    if (this.paused || this.completed) return false;
    const sample = this.now();
    const delta = Math.max(0, sample - this.lastSampleMs);
    this.lastSampleMs = sample;
    this.elapsed += delta;
    if (this.elapsed < 1000) return false;
    this.elapsed = 0; // A stalled frame cannot consume time from the next numeral.
    if (this.number === 1) { this.number = null; this.completed = true; }
    else this.number = (this.number! - 1) as 2 | 1;
    return true;
  }

  pause(): void {
    if (this.paused || this.completed) return;
    this.frame();
    this.paused = true;
  }

  resume(): void {
    if (!this.paused || this.completed) return;
    this.paused = false;
    this.lastSampleMs = this.now();
  }
}
