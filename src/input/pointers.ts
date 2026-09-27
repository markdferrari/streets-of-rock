export type PointerRegion = 'movement' | 'attack' | 'dodge' | 'special' | 'hud' | 'none';
export interface Point { x: number; y: number }
export interface PointerOutput { move: Point; attack: boolean; dodge: boolean; special: boolean }
export class PointerControls {
  private owner: number | null = null;
  private anchor: Point = { x: 0, y: 0 };
  private knob: Point = { x: 0, y: 0 };
  private actions = new Map<number, 'attack' | 'dodge' | 'special'>();
  private released = new Set<number>();
  down(id: number, point: Point, region: PointerRegion): void {
    this.released.delete(id);
    if (region === 'movement' && this.owner === null) {
      this.owner = id;
      this.anchor = { ...point };
      this.knob = { ...point };
    } else if (region === 'attack' || region === 'dodge' || region === 'special') {
      this.actions.set(id, region);
    }
  }
  move(id: number, point: Point): void {
    if (id !== this.owner) return;
    this.knob = { ...point };
    const dx = this.knob.x - this.anchor.x;
    const dy = this.knob.y - this.anchor.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 60) {
      const excess = distance - 60;
      this.anchor.x += dx / distance * excess;
      this.anchor.y += dy / distance * excess;
    }
  }
  up(id: number): void { if (id === this.owner) this.owner = null; this.released.add(id); }
  cancel(id: number): void {
    if (this.released.delete(id)) return;
    if (id === this.owner) this.owner = null;
    this.actions.delete(id);
  }
  clear(): void {
    this.owner = null;
    this.actions.clear();
    this.released.clear();
  }
  frame(): PointerOutput {
    const move = { x: 0, y: 0 };
    if (this.owner !== null) {
      const dx = this.knob.x - this.anchor.x;
      const dy = this.knob.y - this.anchor.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 9) {
        const scale = Math.min(1, distance / 60) / distance;
        move.x = dx * scale;
        move.y = dy * scale;
      }
    }
    const pending = [...this.actions.values()];
    const output = { move, attack: pending.includes('attack'), dodge: pending.includes('dodge'), special: pending.includes('special') };
    this.actions.clear();
    return output;
  }
  joystick(): { anchor: Point; knob: Point } | null {
    return this.owner === null ? null : { anchor: { ...this.anchor }, knob: { ...this.knob } };
  }
}
