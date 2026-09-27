import type { GameEvent, RunState } from '../game/types';
export type PromptId = 'movement' | 'attack' | 'dodge' | 'special';
const order: PromptId[] = ['movement', 'attack', 'dodge', 'special'];
export class TutorialProgress {
  private done: Set<PromptId>;
  private sawWarning = false;
  constructor(completed: Iterable<PromptId> = []) { this.done = new Set(completed); }
  nextPrompt(): PromptId | null { return order.find(id => !this.done.has(id)) ?? null; }
  suggest(run: RunState): PromptId | null {
    if (!this.done.has('movement')) return 'movement';
    if (!this.done.has('attack')) return 'attack';
    if (!this.done.has('dodge') && this.sawWarning) return 'dodge';
    const cow = run.actors.find(actor => actor.role === 'cow');
    if (!this.done.has('special') && cow?.role === 'cow' && cow.specialMeter === 100) return 'special';
    return null;
  }
  accept(events: GameEvent[], moved: boolean): PromptId[] {
    const gained: PromptId[] = [];
    const valid = new Set(events.map(event => event.type));
    if (valid.has('enemy-warning')) this.sawWarning = true;
    for (const [id, satisfied] of [
      ['movement', moved], ['attack', valid.has('attack')], ['dodge', valid.has('dodge')], ['special', valid.has('special')],
    ] as [PromptId, boolean][]) {
      if (satisfied && !this.done.has(id)) { this.done.add(id); gained.push(id); }
    }
    return gained;
  }
  completed(): PromptId[] { return order.filter(id => this.done.has(id)); }
}
