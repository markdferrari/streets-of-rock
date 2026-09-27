import type { GameEvent, InputFrame, RunState } from './types';

export interface TickStage { name: string; apply(run: RunState, input: InputFrame, events: GameEvent[]): void }
export function stepRun(run: RunState, input: InputFrame, stages: TickStage[] = []): GameEvent[] {
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
