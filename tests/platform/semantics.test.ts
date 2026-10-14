import { describe, expect, it } from 'vitest';
import { BrowserAdapter, type BrowserHost, type Environment, type UiDescriptor } from '../../web/browser';

const env: Environment = { width: 844, height: 390, dpr: 1, safeInsets: { top: 0, right: 0, bottom: 0, left: 0 }, visible: true, focused: true, portrait: false, reducedMotion: false };
function fixture() {
  const state: { current?: { generation: number; descriptors: UiDescriptor[]; intent: (id: string, kind: string, value?: unknown) => void } } = {};
  const host: BrowserHost = { environment: () => env, read: () => null, write: () => {}, watch: () => () => {}, render: (generation, descriptors, intent) => { state.current = { generation, descriptors, intent }; } };
  const events: unknown[] = [];
  const adapter = new BrowserAdapter(host, 'b'.repeat(64)); adapter.initialize(value => events.push(JSON.parse(value)));
  return { adapter, state, events };
}

describe('semantic projection', () => {
  it('publishes accessible roles, ranges, focus intent and generation-safe intents exactly once', () => {
    const f = fixture();
    f.adapter.initialize(value => { f.events.push(JSON.parse(value)); });
    f.adapter.publishUi(JSON.stringify({ generation: 2, controls: [{ id: 'music', role: 'slider', name: 'Music volume', value: 0.5, min: 0, max: 1, bounds: { x: 10, y: 20, width: 100, height: 24 } }, { id: 'resume', role: 'button', name: 'Resume', bounds: { x: 20, y: 50, width: 90, height: 30 } }] }));
    const current = f.state.current!;
    expect(current.descriptors[0]).toMatchObject({ role: 'slider', value: 0.5, min: 0, max: 1 });
    current.intent('resume', 'activate');
    current.intent('resume', 'activate');
    current.intent('resume', 'activate');
    expect(f.events.filter((event: any) => event.type === 'uiIntent' && event.id === 'resume')).toHaveLength(3);
    f.adapter.publishUi(JSON.stringify({ generation: 3, controls: [] }));
    current.intent('resume', 'activate');
  });

  it('rejects out-of-range values and clips CSS bounds to the safe viewport', () => {
    const f = fixture(); const host = f.state;
    f.adapter.publishUi(JSON.stringify({ generation: 1, controls: [{ id: 'gain', role: 'slider', name: 'Gain', value: 0.5, min: 0, max: 1, bounds: { x: 830, y: 380, width: 100, height: 50 } }] }));
    expect(host.current!.descriptors[0]!.bounds).toEqual({ x: 830, y: 380, width: 14, height: 10 });
    host.current!.intent('gain', 'value', 2);
    expect(f.events.filter((event: any) => event.type === 'uiIntent')).toHaveLength(0);
  });
});
