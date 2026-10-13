import { describe, expect, it } from 'vitest';
import { BrowserAdapter, type BrowserHost, type Environment } from '../../web/browser';

const environment: Environment = { width: 844, height: 390, dpr: 1, safeInsets: { top: 0, right: 0, bottom: 0, left: 0 }, visible: true, focused: true, portrait: false, reducedMotion: false };
function hostFixture() {
  const values = new Map<string, string>();
  let denied = false;
  const host: BrowserHost = { environment: () => environment, read: key => { if (denied) throw new Error('denied'); return values.get(key) ?? null; }, write: (key, value) => { if (denied) throw new Error('denied'); values.set(key, value); }, watch: () => () => {} };
  return { host, values, deny: () => { denied = true; } };
}

describe('browser storage boundary', () => {
  it('exposes exactly the three stable raw keys and reports unavailable storage without throwing', () => {
    const f = hostFixture();
    const adapter = new BrowserAdapter(f.host, 'a'.repeat(64));
    const initial = adapter.initialize(() => {});
    expect(Object.keys(initial.stored).sort()).toEqual(['sor.settings.v1', 'streets-of-rock.best.v1', 'streets-of-rock.tutorial.v1']);
    expect(adapter.writeStored('unrelated.key', '{}').ok).toBe(false);
    f.deny();
    expect(adapter.readStored('sor.settings.v1').ok).toBe(false);
    expect(adapter.writeStored('streets-of-rock.tutorial.v1', '{}').ok).toBe(false);
  });
});
