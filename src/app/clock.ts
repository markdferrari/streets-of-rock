export class ActiveClock {
  private accumulatedMs = 0;
  private activeSince: number | null = null;
  constructor(private readonly now: () => number) {}
  start(): void { if (this.activeSince === null) this.activeSince = this.now(); }
  pause(): void {
    if (this.activeSince !== null) {
      this.accumulatedMs += Math.max(0, this.now() - this.activeSince);
      this.activeSince = null;
    }
  }
  reset(): void { this.accumulatedMs = 0; this.activeSince = null; }
  elapsedMs(): number { return this.accumulatedMs + (this.activeSince === null ? 0 : Math.max(0, this.now() - this.activeSince)); }
}
