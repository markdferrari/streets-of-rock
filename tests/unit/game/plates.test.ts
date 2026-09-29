import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { getPlayer } from '../../../src/game/selectors';
import { updatePlayerAction } from '../../../src/game/actions';
import { playerMoveTuning } from '../../../src/game/moves';
import { fixtureEnemy } from '../../fixtures/run';
import type { ArenaContext } from '../../../src/game/arena';

const arena: ArenaContext = { legalRegions: [], visibleRegions: [{ minX: 0, maxX: 10, minDepth: -3, maxDepth: 3 }],
  frame: { anchorX: 4, anchorDepth: 0, anchorHeight: 2, halfHeight: 4, aspect: 1.5 },
  body: { minX: -1, maxX: 1, minY: 0, maxY: 2, minDepth: -1, maxDepth: 1 } };
const quiet = { move: { x: 0, depth: 0 } } as const;

describe('Plates profile and Headrest Throw', () => {
  it('uses the faster, longer-reach, lower-damage basic moves', () => {
    const run = createRun(720, { fighterId: 'plates', partnerId: 'cow' });
    expect(playerMoveTuning(run, 'light1')).toMatchObject({ windup: 6, active: 5, recovery: 12, range: 2, damage: 10 });
    expect(playerMoveTuning(run, 'heavy')).toMatchObject({ windup: 12, active: 6, recovery: 22, range: 2.4, damage: 28 });
  });

  it('snapshots nearest visible target and spends meter when a buffered Special actually starts', () => {
    const run = createRun(721, { fighterId: 'plates', partnerId: 'crow' });
    const player = getPlayer(run); player.specialMeter = 100;
    const far = fixtureEnemy(3, 'grunt', 5); const nearBoss = fixtureEnemy(4, 'liam', 3);
    const equalBoss = fixtureEnemy(5, 'liam', 3);
    const invisible = fixtureEnemy(6, 'grunt', 20);
    run.actors.push(far, nearBoss, equalBoss, invisible);
    const events: { type: string; tick: number; actorId?: number; targetId?: number }[] = [];
    updatePlayerAction(run, { ...quiet, requests: [{ kind: 'special', sourcePointerId: 1, order: 1 }] }, events, arena);
    expect(player.specialMeter).toBe(0);
    expect(player.preparedSpecial).toMatchObject({ kind: 'headrest', aimPosition: { x: 3, depth: 0 }, targetIdForDiagnostics: 4 });
    nearBoss.position.x = 9;
    for (let tick = 1; tick <= 12; tick++) { run.tick = tick; updatePlayerAction(run, quiet, events, arena); }
    const headrest = run.projectiles.find(projectile => projectile.kind === 'headrest');
    expect(headrest).toMatchObject({ kind: 'headrest', direction: { x: 1, depth: 0 }, remainingDistance: 12 });
    expect(events.filter(event => event.type === 'headrest-release')).toHaveLength(1);
  });

  it('does not spend meter or create a projectile when no visible target exists at start', () => {
    const run = createRun(722, { fighterId: 'plates', partnerId: 'cow' });
    const player = getPlayer(run); player.specialMeter = 100;
    run.actors.push(fixtureEnemy(3, 'grunt', 20));
    const events: { type: string; tick: number; actorId?: number }[] = [];
    updatePlayerAction(run, { ...quiet, requests: [{ kind: 'special', sourcePointerId: 1, order: 1 }] }, events, arena);
    expect(player.specialMeter).toBe(100);
    expect(run.projectiles).toEqual([]);
    expect(events.some(event => event.type === 'unavailable')).toBe(true);
  });
});
