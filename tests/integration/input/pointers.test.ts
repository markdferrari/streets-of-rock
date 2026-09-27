import { describe, expect, it } from 'vitest';
import { PointerControls } from '../../../src/input/pointers';

describe('touch ownership', () => {
  it('tracks movement and an action on independent fingers and consumes a tap once', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 50, y: 100 }, 'movement');
    controls.move(1, { x: 110, y: 100 });
    controls.down(2, { x: 200, y: 100 }, 'attack');
    expect(controls.frame()).toMatchObject({ move: { x: 1, y: 0 }, attack: true });
    expect(controls.frame()).toMatchObject({ move: { x: 1, y: 0 }, attack: false });
    controls.cancel(2);
    expect(controls.frame().move.x).toBe(1);
    controls.cancel(1);
    expect(controls.frame().move).toEqual({ x: 0, y: 0 });
  });
  it('keeps HUD touches out of the joystick and respects a deadzone', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 10, y: 10 }, 'hud');
    expect(controls.joystick()).toBeNull();
    controls.down(2, { x: 100, y: 100 }, 'movement');
    controls.move(2, { x: 106, y: 100 });
    expect(controls.frame().move).toEqual({ x: 0, y: 0 });
    controls.move(2, { x: 160, y: 100 });
    expect(controls.frame().move.x).toBe(1);
  });
  it('normalizes diagonal movement and follows sustained dragging beyond 60 pixels', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 100, y: 100 }, 'movement');
    controls.move(1, { x: 160, y: 160 });
    expect(Math.hypot(...Object.values(controls.frame().move))).toBeCloseTo(1);
    expect(controls.joystick()?.anchor.x).toBeGreaterThan(100);
    controls.clear();
    expect(controls.joystick()).toBeNull();
  });
  it('rejects duplicate movement owners and clears lost capture', () => {
    const controls = new PointerControls();
    controls.down(1, { x: 0, y: 0 }, 'movement');
    controls.down(2, { x: 100, y: 0 }, 'movement');
    controls.move(1, { x: 60, y: 0 });
    controls.up(2);
    expect(controls.frame().move.x).toBe(1);
    controls.cancel(1);
    expect(controls.frame().move.x).toBe(0);
  });
});
