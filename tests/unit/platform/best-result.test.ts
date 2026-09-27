import { describe, expect, it } from 'vitest';
import { BestResultStore } from '../../../src/platform/best-result';

describe('successful best time', () => {
  it('stores only strictly faster valid successful times', () => {
    const values = new Map<string, string>();
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
    const best = new BestResultStore(storage);
    expect(best.best()).toBeNull();
    expect(best.record(220_000)).toBe(true);
    expect(best.record(220_000)).toBe(false);
    expect(best.record(230_000)).toBe(false);
    expect(best.record(210_000)).toBe(true);
    expect(new BestResultStore(storage).best()).toBe(210_000);
    expect(() => best.record(-1)).toThrow();
  });
  it('survives corrupt or denied storage with an in-memory result', () => {
    const denied = { getItem: (_key: string) => { throw new Error('denied'); }, setItem: (_key: string, _value: string) => { throw new Error('denied'); } };
    const best = new BestResultStore(denied);
    expect(best.record(240_000)).toBe(true);
    expect(best.best()).toBe(240_000);
    const corrupt = { getItem: (_key: string) => 'bad JSON', setItem: (_key: string, _value: string) => {} };
    expect(new BestResultStore(corrupt).best()).toBeNull();
  });
});
