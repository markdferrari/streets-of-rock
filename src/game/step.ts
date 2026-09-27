import type { GameEvent, InputFrame, RunState } from './types';
import { updateCowAction } from './actions';
import { updateGrunts } from './ai/grunt';
import { updateCrow } from './ai/crow';
import { updateZoners } from './ai/zoner';
import { updateEnforcers } from './ai/enforcer';
import { updateLiam } from './ai/liam';
import { updateProjectiles } from './projectiles';
import { moveCow } from './movement';
import { resolveActorOverlaps } from './collision';
import { applyAttacksBatch } from './damage';
import { updatePickups } from './pickups';
import { updateEncounters } from './encounters';

export interface TickStage { name: string; apply(run: RunState, input: InputFrame, events: GameEvent[]): void }
const defaultStages: TickStage[] = [
  { name: 'input', apply: updateCowAction },
  { name: 'ai', apply: (run, _input, events) => { updateGrunts(run, events); updateZoners(run, events); updateEnforcers(run, events); updateLiam(run, events); updateCrow(run, events); } },
  { name: 'movement', apply: (run, input, events) => { moveCow(run, input); resolveActorOverlaps(run); updateProjectiles(run, events); } },
  { name: 'contacts', apply: (run, _input, events) => {
    applyAttacksBatch(run, run.attacks.filter(attack => run.tick < attack.activeUntilTick), events);
    run.attacks = run.attacks.filter(attack => run.tick < attack.activeUntilTick);
  } },
  { name: 'terminal', apply: (run) => {
    const cow = run.actors.find(actor => actor.role === 'cow');
    const liam = run.actors.find(actor => actor.role === 'liam');
    if (!cow || cow.hp <= 0) run.result = 'defeat';
    else if (liam && liam.hp <= 0) run.result = 'victory';
  } },
  { name: 'progression', apply: (run, _input, events) => { updatePickups(run, events); updateEncounters(run, events); } },
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
