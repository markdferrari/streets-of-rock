export class FixedStepLoop {
  readonly stepMs = 1000 / 60;
  private lastNow: number | null = null;
  private accumulatedMs = 0;
  discardedMs = 0;
  constructor(private readonly step: () => void, private readonly maxSteps = 5) {}
  frame(now: number, running: boolean): number {
    if (!running) { this.reset(); return 0; }
    if (this.lastNow === null) { this.lastNow = now; return 0; }
    this.accumulatedMs += Math.max(0, now - this.lastNow);
    this.lastNow = now;
    const maxAccumulation = this.maxSteps * this.stepMs;
    if (this.accumulatedMs > maxAccumulation) {
      this.discardedMs += this.accumulatedMs - maxAccumulation;
      this.accumulatedMs = maxAccumulation;
    }
    let steps = 0;
    while (this.accumulatedMs + 1e-9 >= this.stepMs && steps < this.maxSteps) {
      this.step();
      this.accumulatedMs -= this.stepMs;
      steps++;
    }
    return steps;
  }
  reset(): void { this.lastNow = null; this.accumulatedMs = 0; }
}
