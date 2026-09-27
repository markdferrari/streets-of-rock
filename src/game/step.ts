import type { GameEvent, InputFrame, RunState } from './types';
import { updateCowAction } from './actions';
import { updateGrunts } from './ai/grunt';
import { moveCow } from './movement';
import { applyAttacksBatch } from './damage';

export interface TickStage { name: string; apply(run: RunState, input: InputFrame, events: GameEvent[]): void }
const defaultStages: TickStage[] = [
  { name: 'input', apply: updateCowAction },
  { name: 'ai', apply: (run, _input, events) => updateGrunts(run, events) },
  { name: 'movement', apply: (run, input) => moveCow(run, input) },
  { name: 'contacts', apply: (run, _input, events) => {
    applyAttacksBatch(run, run.attacks.filter(attack => run.tick < attack.activeUntilTick), events);
    run.attacks = run.attacks.filter(attack => run.tick < attack.activeUntilTick);
  } },
];
export function stepRun(run: RunState, input: InputFrame, stages: TickStage[] = defaultStages): GameEvent[] {
  if (run.result) return [];
  const events: GameEvent[] = [];
  for (const stage of stages) {
    stage.apply(run, input, events);
    if (run.result) break;
  }
  const cow = run.actors.find(actor => actor.role === 'cow');
  const liam = run.actors.find(actor => actor.role === 'liam');
  if (cow && cow.hp <= 0) run.result = 'defeat';
  else if (liam && liam.hp <= 0) run.result = 'victory';
  run.tick++;
  return events;
}
