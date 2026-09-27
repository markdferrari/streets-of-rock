import { describe, expect, it } from 'vitest';
import { PointerControls } from '../../../src/input/pointers';

describe('touch ownership', () => {
  it('reports distinct ordered requests and cancels a sampled pending source', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 200, y: 100 }, 'attack');
    controls.down(2, { x: 250, y: 100 }, 'heavy');
    expect(controls.frame().requests).toEqual([
      { kind: 'light', sourcePointerId: 1, order: 1 },
      { kind: 'heavy', sourcePointerId: 2, order: 2 },
    ]);
    controls.cancel(2);
    expect(controls.frame().canceledPointerIds).toEqual([2]);
  });
  it('does not repeat a held action or change it when the finger slides', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 200, y: 100 }, 'attack');
    controls.move(1, { x: 300, y: 100 });
    controls.down(1, { x: 300, y: 100 }, 'heavy');
    expect(controls.frame().requests.map(request => request.kind)).toEqual(['light']);
    expect(controls.frame().requests).toEqual([]);
    controls.up(1);
  });
  it('uses a fixed visible centre and ignores touches that begin beyond the ring', () => {
    const controls = new PointerControls();
    controls.setCenter({ x: 100, y: 100 });
    expect(controls.joystick()).toEqual({ anchor: { x: 100, y: 100 }, knob: { x: 100, y: 100 } });
    controls.down(1, { x: 180, y: 100 }, 'movement');
    controls.move(1, { x: 100, y: 100 });
    expect(controls.frame().move).toEqual({ x: 0, y: 0 });
    controls.down(2, { x: 100, y: 100 }, 'movement');
    controls.move(2, { x: 220, y: 100 });
    expect(controls.frame().move).toEqual({ x: 1, y: 0 });
    expect(controls.joystick()).toEqual({ anchor: { x: 100, y: 100 }, knob: { x: 160, y: 100 } });
    controls.up(2);
    expect(controls.joystick()?.knob).toEqual({ x: 100, y: 100 });
  });
  it('tracks movement and an action on independent fingers and consumes a tap once', () => {
    const controls = new PointerControls();
    controls.setCenter({ x: 50, y: 100 });
    controls.down(1, { x: 50, y: 100 }, 'movement');
    controls.move(1, { x: 110, y: 100 });
    controls.down(2, { x: 200, y: 100 }, 'attack');
    expect(controls.frame()).toMatchObject({ move: { x: 1, y: 0 }, requests: [{ kind: 'light' }] });
    expect(controls.frame()).toMatchObject({ move: { x: 1, y: 0 }, requests: [] });
    controls.cancel(2);
    expect(controls.frame().move.x).toBe(1);
    controls.cancel(1);
    expect(controls.frame().move).toEqual({ x: 0, y: 0 });
  });
  it('keeps HUD touches out of the joystick and respects a deadzone', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 10, y: 10 }, 'hud');
    expect(controls.joystick()).toBeNull();
    controls.setCenter({ x: 100, y: 100 });
    controls.down(2, { x: 100, y: 100 }, 'movement');
    controls.move(2, { x: 106, y: 100 });
    expect(controls.frame().move).toEqual({ x: 0, y: 0 });
    controls.move(2, { x: 160, y: 100 });
    expect(controls.frame().move.x).toBe(1);
  });
  it('normalizes diagonal movement and clamps the knob beyond 60 pixels', () => {
    const controls = new PointerControls();
    controls.setCenter({ x: 100, y: 100 });
    controls.down(1, { x: 100, y: 100 }, 'movement');
    controls.move(1, { x: 160, y: 160 });
    expect(Math.hypot(...Object.values(controls.frame().move))).toBeCloseTo(1);
    expect(controls.joystick()?.anchor.x).toBe(100);
    controls.clear();
    expect(controls.joystick()?.knob).toEqual({ x: 100, y: 100 });
  });
  it('rejects duplicate movement owners and clears lost capture', () => {
    const controls = new PointerControls();
    controls.setCenter({ x: 0, y: 0 });
    controls.down(1, { x: 0, y: 0 }, 'movement');
    controls.down(2, { x: 100, y: 0 }, 'movement');
    controls.move(1, { x: 60, y: 0 });
    controls.up(2);
    expect(controls.frame().move.x).toBe(1);
    controls.cancel(1);
    expect(controls.frame().move.x).toBe(0);
  });
  it('removes a pending action if that touch is canceled before the next frame', () => {
    const controls = new PointerControls();
    controls.down(7, { x: 200, y: 100 }, 'special');
    controls.cancel(7);
    expect(controls.frame().requests).toEqual([]);
  });
  it('keeps a completed tap when pointer capture is released normally', () => {
    const controls = new PointerControls();
    controls.down(7, { x: 200, y: 100 }, 'attack');
    controls.up(7);
    controls.cancel(7);
    expect(controls.frame().requests[0]?.kind).toBe('light');
  });
});
