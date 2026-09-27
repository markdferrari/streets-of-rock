import type { ActionRequest, PlayerAction } from '../game/types';
export type PointerRegion = 'movement' | 'attack' | 'heavy' | 'dodge' | 'special' | 'hud' | 'none';
export interface Point { x: number; y: number }
export interface PointerOutput { move: Point; requests: ActionRequest[]; canceledPointerIds: number[] }
const radius = 60;
const deadzone = radius * .15;
export class PointerControls {
  private owner: number | null = null;
  private anchor: Point | null = null;
  private knob: Point = { x: 0, y: 0 };
  private actions = new Map<number, ActionRequest>();
  private actionOwners = new Set<number>();
  private canceledPointerIds: number[] = [];
  private nextOrder = 1;
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
    } else if ((region === 'attack' || region === 'heavy' || region === 'dodge' || region === 'special') && !this.actionOwners.has(id)) {
      const kind: PlayerAction = region === 'attack' ? 'light' : region;
      this.actions.set(id, { kind, sourcePointerId: id, order: this.nextOrder++ });
      this.actionOwners.add(id);
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
    this.actionOwners.delete(id);
  }
  cancel(id: number): void {
    if (this.released.delete(id)) return;
    if (id === this.owner) { this.owner = null; if (this.anchor) this.knob = { ...this.anchor }; }
    this.actions.delete(id);
    if (this.actionOwners.delete(id)) this.canceledPointerIds.push(id);
  }
  clear(): void {
    this.owner = null;
    if (this.anchor) this.knob = { ...this.anchor };
    this.actions.clear();
    this.actionOwners.clear();
    this.canceledPointerIds = [];
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
    const requests = [...this.actions.values()];
    const output = { move, requests, canceledPointerIds: [...this.canceledPointerIds] };
    this.actions.clear();
    this.canceledPointerIds = [];
    return output;
  }
  joystick(): { anchor: Point; knob: Point } | null {
    return this.anchor ? { anchor: { ...this.anchor }, knob: { ...this.knob } } : null;
  }
}
