import type { GameEvent } from '../game/types';
export type PromptId = 'movement' | 'attack' | 'dodge' | 'special';
const order: PromptId[] = ['movement', 'attack', 'dodge', 'special'];
export class TutorialProgress {
  private done: Set<PromptId>;
  constructor(completed: Iterable<PromptId> = []) { this.done = new Set(completed); }
  nextPrompt(): PromptId | null { return order.find(id => !this.done.has(id)) ?? null; }
  accept(events: GameEvent[], moved: boolean): PromptId[] {
    const gained: PromptId[] = [];
    const valid = new Set(events.map(event => event.type));
    for (const [id, satisfied] of [
      ['movement', moved], ['attack', valid.has('attack')], ['dodge', valid.has('dodge')], ['special', valid.has('special')],
    ] as [PromptId, boolean][]) {
      if (satisfied && !this.done.has(id)) { this.done.add(id); gained.push(id); }
    }
    return gained;
  }
  completed(): PromptId[] { return order.filter(id => this.done.has(id)); }
}
