export type PointerRegion = 'movement' | 'attack' | 'dodge' | 'special' | 'hud' | 'none';
export interface Point { x: number; y: number }
export interface PointerOutput { move: Point; attack: boolean; dodge: boolean; special: boolean }
export class PointerControls {
  private owner: number | null = null;
  private anchor: Point = { x: 0, y: 0 };
  private knob: Point = { x: 0, y: 0 };
  private actions: Pick<PointerOutput, 'attack' | 'dodge' | 'special'> = { attack: false, dodge: false, special: false };
  down(id: number, point: Point, region: PointerRegion): void {
    if (region === 'movement' && this.owner === null) {
      this.owner = id;
      this.anchor = { ...point };
      this.knob = { ...point };
    } else if (region === 'attack' || region === 'dodge' || region === 'special') {
      this.actions[region] = true;
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
  up(id: number): void { if (id === this.owner) this.owner = null; }
  cancel(id: number): void { this.up(id); }
  clear(): void {
    this.owner = null;
    this.actions = { attack: false, dodge: false, special: false };
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
    const output = { move, ...this.actions };
    this.actions = { attack: false, dodge: false, special: false };
    return output;
  }
  joystick(): { anchor: Point; knob: Point } | null {
    return this.owner === null ? null : { anchor: { ...this.anchor }, knob: { ...this.knob } };
  }
}
