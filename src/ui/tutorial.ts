import type { GameEvent, RunState } from '../game/types';
import { getPlayer } from '../game/selectors';
export type PromptId = 'movement' | 'attack' | 'heavy' | 'dodge' | 'special';
const order: PromptId[] = ['movement', 'attack', 'heavy', 'dodge', 'special'];
const key = 'streets-of-rock.tutorial.v1';
export class TutorialProgress {
  private done: Set<PromptId>;
  private sawWarning = false;
  constructor(completed: Iterable<PromptId> = [], private readonly storage: Pick<Storage, 'getItem' | 'setItem'> | null = null) {
    this.done = new Set(completed);
    try {
      const raw = storage?.getItem(key);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null) return;
      const record = parsed as { schemaVersion?: unknown; completed?: unknown };
      if (record.schemaVersion !== 1 || !Array.isArray(record.completed)) return;
      for (const id of record.completed) if (order.includes(id as PromptId)) this.done.add(id as PromptId);
    } catch { /* Storage is optional. */ }
  }
  nextPrompt(): PromptId | null { return order.find(id => !this.done.has(id)) ?? null; }
  suggest(run: RunState): PromptId | null {
    if (!this.done.has('movement')) return 'movement';
    if (!this.done.has('attack')) return 'attack';
    if (!this.done.has('heavy')) return 'heavy';
    if (!this.done.has('dodge') && this.sawWarning) return 'dodge';
    const player = getPlayer(run);
    if (!this.done.has('special') && player.specialMeter === 100) return 'special';
    return null;
  }
  accept(events: GameEvent[], moved: boolean): PromptId[] {
    const gained: PromptId[] = [];
    const valid = new Set(events.map(event => event.type));
    if (valid.has('enemy-warning')) this.sawWarning = true;
    for (const [id, satisfied] of [
      ['movement', moved], ['attack', valid.has('attack')], ['heavy', valid.has('heavy')], ['dodge', valid.has('dodge')], ['special', valid.has('special')],
    ] as [PromptId, boolean][]) {
      if (satisfied && !this.done.has(id)) { this.done.add(id); gained.push(id); }
    }
    if (gained.length) {
      try { this.storage?.setItem(key, JSON.stringify({ schemaVersion: 1, completed: this.completed() })); }
      catch { /* In-memory progress still works. */ }
    }
    return gained;
  }
  completed(): PromptId[] { return order.filter(id => this.done.has(id)); }
}
