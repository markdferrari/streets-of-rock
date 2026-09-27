export type PointerRegion = 'movement' | 'attack' | 'dodge' | 'special' | 'hud' | 'none';
export interface Point { x: number; y: number }
export interface PointerOutput { move: Point; attack: boolean; dodge: boolean; special: boolean }
const radius = 60;
const deadzone = radius * .15;
export class PointerControls {
  private owner: number | null = null;
  private anchor: Point | null = null;
  private knob: Point = { x: 0, y: 0 };
  private actions = new Map<number, 'attack' | 'dodge' | 'special'>();
  private released = new Set<number>();
  setCenter(point: Point): void {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    this.owner = null;
    this.anchor = { ...point };
    this.knob = { ...point };
  }
  down(id: number, point: Point, region: PointerRegion): void {
    this.released.delete(id);
    if (region === 'movement' && this.owner === null && this.anchor && Math.hypot(point.x - this.anchor.x, point.y - this.anchor.y) <= radius) {
      this.owner = id;
      this.move(id, point);
    } else if (region === 'attack' || region === 'dodge' || region === 'special') {
      this.actions.set(id, region);
    }
  }
  move(id: number, point: Point): void {
    if (id !== this.owner || !this.anchor) return;
    const dx = point.x - this.anchor.x;
    const dy = point.y - this.anchor.y;
    const distance = Math.hypot(dx, dy);
    const scale = distance > radius ? radius / distance : 1;
    this.knob = { x: this.anchor.x + dx * scale, y: this.anchor.y + dy * scale };
  }
  up(id: number): void {
    if (id === this.owner) { this.owner = null; if (this.anchor) this.knob = { ...this.anchor }; }
    this.released.add(id);
  }
  cancel(id: number): void {
    if (this.released.delete(id)) return;
    if (id === this.owner) { this.owner = null; if (this.anchor) this.knob = { ...this.anchor }; }
    this.actions.delete(id);
  }
  clear(): void {
    this.owner = null;
    if (this.anchor) this.knob = { ...this.anchor };
    this.actions.clear();
    this.released.clear();
  }
  frame(): PointerOutput {
    const move = { x: 0, y: 0 };
    if (this.owner !== null && this.anchor) {
      const dx = this.knob.x - this.anchor.x;
      const dy = this.knob.y - this.anchor.y;
      const distance = Math.hypot(dx, dy);
      if (distance > deadzone) {
        move.x = dx / radius;
        move.y = dy / radius;
      }
    }
    const pending = [...this.actions.values()];
    const output = { move, attack: pending.includes('attack'), dodge: pending.includes('dodge'), special: pending.includes('special') };
    this.actions.clear();
    return output;
  }
  joystick(): { anchor: Point; knob: Point } | null {
    return this.anchor ? { anchor: { ...this.anchor }, knob: { ...this.knob } } : null;
  }
}
