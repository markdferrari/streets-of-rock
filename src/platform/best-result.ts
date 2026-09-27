export class BestResultStore {
  private static readonly key = 'streets-of-rock.best.v1';
  private value: number | null = null;
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null) {
    try {
      const raw = storage?.getItem(BestResultStore.key);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return;
      const candidate = parsed as { schemaVersion?: unknown; bestSuccessfulMs?: unknown };
      if (candidate.schemaVersion === 1 && typeof candidate.bestSuccessfulMs === 'number' && Number.isFinite(candidate.bestSuccessfulMs) && candidate.bestSuccessfulMs > 0) this.value = candidate.bestSuccessfulMs;
    } catch { /* Storage denial or corrupt data leaves defaults. */ }
  }
  best(): number | null { return this.value; }
  record(elapsedMs: number): boolean {
    if (!Number.isFinite(elapsedMs) || elapsedMs <= 0) throw new Error('Invalid successful time');
    if (this.value !== null && elapsedMs >= this.value) return false;
    this.value = elapsedMs;
    try { this.storage?.setItem(BestResultStore.key, JSON.stringify({ schemaVersion: 1, bestSuccessfulMs: elapsedMs })); }
    catch { /* In-memory result still works. */ }
    return true;
  }
}
