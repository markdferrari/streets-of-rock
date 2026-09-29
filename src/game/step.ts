import type { GameEvent, InputFrame, RunState } from './types';
import { updatePlayerAction } from './actions';
import { updateGrunts } from './ai/grunt';
import { updatePartner } from './ai/partner';
import { updateZoners } from './ai/zoner';
import { updateEnforcers } from './ai/enforcer';
import { updateLiam } from './ai/liam';
import { updateProjectiles } from './projectiles';
import { movePlayer } from './movement';
import { resolveActorOverlaps } from './collision';
import { applyAttacksBatch } from './damage';
import { updatePickups } from './pickups';
import { updateEncounters } from './encounters';
import { getPlayer } from './selectors';
import type { ArenaContext } from './arena';
import { updateEnemyStatuses } from './status-effects';

export interface TickStage { name: string; apply(run: RunState, input: InputFrame, events: GameEvent[], arena?: ArenaContext): void }
const defaultStages: TickStage[] = [
  { name: 'statuses', apply: (run, _input, events) => {
    const status = updateEnemyStatuses(run);
    for (const id of status.expiredIds) events.push({ type: 'stun-ended', tick: run.tick, actorId: id });
  } },
  { name: 'input', apply: updatePlayerAction },
  { name: 'ai', apply: (run, _input, events, arena) => { updateGrunts(run, events); updateZoners(run, events); updateEnforcers(run, events); updateLiam(run, events); updatePartner(run, events, arena); } },
  { name: 'movement', apply: (run, input, events) => { movePlayer(run, input); resolveActorOverlaps(run); updateProjectiles(run, events); } },
  { name: 'contacts', apply: (run, _input, events) => {
    applyAttacksBatch(run, run.attacks.filter(attack => run.tick < attack.activeUntilTick), events);
    run.attacks = run.attacks.filter(attack => run.tick < attack.activeUntilTick);
  } },
  { name: 'terminal', apply: (run) => {
    const cow = getPlayer(run);
    const liam = run.actors.find(actor => actor.role === 'liam');
    if (cow.hp <= 0) run.result = 'defeat';
    else if (liam && liam.hp <= 0) run.result = 'victory';
  } },
  { name: 'progression', apply: (run, _input, events) => { updatePickups(run, events); updateEncounters(run, events); } },
];
export function stepRun(run: RunState, input: InputFrame, stages: TickStage[] = defaultStages, arena?: ArenaContext): GameEvent[] {
  if (run.result) return [];
  const events: GameEvent[] = [];
  for (const stage of stages) {
    stage.apply(run, input, events, arena);
    if (run.result) break;
  }
  const cow = getPlayer(run);
  const liam = run.actors.find(actor => actor.role === 'liam');
  if (cow.hp <= 0) run.result = 'defeat';
  else if (liam && liam.hp <= 0) run.result = 'victory';
  run.tick++;
  return events;
}
