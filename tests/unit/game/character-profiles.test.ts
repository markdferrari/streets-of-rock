import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { getPlayer } from '../../../src/game/selectors';
import { playerMoveTuning } from '../../../src/game/moves';
import { movePlayer } from '../../../src/game/movement';

describe('Lion and Plates profile data', () => {
  it('uses Lion slow movement and the defined heavy Light cycle', () => {
    const run = createRun(701, { fighterId: 'lion', partnerId: 'cow' });
    const player = getPlayer(run);
    movePlayer(run, { move: { x: 1, depth: 0 } });
    expect(player.position.x).toBeCloseTo(2.6 / 60);
    expect(playerMoveTuning(run, 'light1')).toMatchObject({ windup: 12, active: 8, recovery: 20, damage: 18, range: 1.4 });
    expect(playerMoveTuning(run, 'light2')).toMatchObject({ damage: 22 });
    expect(playerMoveTuning(run, 'light3')).toMatchObject({ windup: 16, recovery: 26, damage: 32 });
    expect(playerMoveTuning(run, 'heavy')).toMatchObject({ windup: 20, active: 8, recovery: 32, damage: 44, range: 1.8 });
  });

  it('uses Plates faster movement, longer shorter-cycle attacks and lower damage', () => {
    const run = createRun(702, { fighterId: 'plates', partnerId: 'crow' });
    const player = getPlayer(run);
    movePlayer(run, { move: { x: 1, depth: 0 } });
    expect(player.position.x).toBeCloseTo(4.2 / 60);
    expect(playerMoveTuning(run, 'light1')).toMatchObject({ windup: 6, active: 5, recovery: 12, damage: 10, range: 2 });
    expect(playerMoveTuning(run, 'light3')).toMatchObject({ windup: 9, recovery: 18, damage: 18 });
    expect(playerMoveTuning(run, 'heavy')).toMatchObject({ windup: 12, active: 6, recovery: 22, damage: 28, range: 2.4 });
  });
});
