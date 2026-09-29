import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { neonVelvet, vipTables } from '../../../src/content/neon-velvet';
import { updateEncounters } from '../../../src/game/encounters';
import { updatePickups } from '../../../src/game/pickups';
import { movePlayer } from '../../../src/game/movement';

describe('Bondi Beach', () => {
  it('defines four areas and the agreed initial wave composition', () => {
    expect(neonVelvet.areas.map(area => area.id)).toEqual(['dance-floor', 'vip-lounge', 'backstage-corridor', 'alley-exit']);
    expect(neonVelvet.areas.map(area => area.waves.map(wave => wave.map(spawn => spawn.role)))).toEqual([
      [['grunt', 'grunt', 'grunt'], ['grunt', 'grunt', 'zoner']],
      [['zoner', 'zoner', 'grunt', 'grunt'], ['enforcer', 'grunt', 'grunt']],
      [['enforcer', 'enforcer', 'zoner', 'zoner']],
      [['liam']],
    ]);
    expect(vipTables).toHaveLength(2);
  });
  it('spawns each wave exactly once, ignores Crow/tables for clear, then shows GO', () => {
    const run = fixtureRun();
    const events: { type: string; tick: number }[] = [];
    updateEncounters(run, events);
    expect(run.encounter.aliveEnemyIds).toHaveLength(3);
    updateEncounters(run, events);
    expect(run.actors.filter(actor => actor.team === 'enemy')).toHaveLength(3);
    for (const actor of run.actors.filter(actor => actor.team === 'enemy')) actor.hp = 0;
    updateEncounters(run, events);
    expect(run.encounter.waveIndex).toBe(1);
    expect(run.encounter.aliveEnemyIds).toHaveLength(3);
    run.tables.push({ id: 99, areaId: 'dance-floor', position: { x: 2, depth: 0 }, hp: 24, broken: false });
    run.actors[1]!.hp = 0;
    for (const actor of run.actors.filter(actor => actor.team === 'enemy')) actor.hp = 0;
    updateEncounters(run, events);
    expect(run.encounter.status).toBe('cleared');
    expect(events.filter(event => event.type === 'go')).toHaveLength(1);
    updateEncounters(run, events);
    expect(events.filter(event => event.type === 'go')).toHaveLength(1);
  });
  it('drops exactly one Cow-collected drink and caps healing, including full-health consumption', () => {
    const run = fixtureRun();
    const cow = run.actors[0]!;
    cow.hp = 300;
    run.tables.push({ id: 3, areaId: 'vip-lounge', position: { x: 2, depth: 0 }, hp: 12, broken: false });
    run.attacks.push({ id: 1, ownerId: 1, moveId: 'light1', origin: { x: 1, depth: 0 }, facing: 1, activeUntilTick: 10, range: 1.3, depthTolerance: .45, damage: 12, hitTargetIds: [] });
    updatePickups(run, []);
    expect(run.tables[0]!.broken).toBe(true);
    expect(run.pickups).toHaveLength(1);
    expect(cow.hp).toBe(300);
    cow.position.x = 2;
    updatePickups(run, []);
    expect(cow.hp).toBe(425);
    expect(run.pickups[0]!.available).toBe(false);
    updatePickups(run, []);
    expect(run.pickups).toHaveLength(1);
  });
  it('lets one Heavy strike break a table without adding special meter', () => {
    const run = fixtureRun();
    run.tables.push({ id: 3, areaId: 'vip-lounge', position: { x: 2, depth: 0 }, hp: 24, broken: false });
    run.attacks.push({ id: 1, ownerId: 1, moveId: 'heavy', origin: { x: 1, depth: 0 }, facing: 1,
      activeUntilTick: 10, range: 1.3, depthTolerance: .45, damage: 30, hitTargetIds: [] });
    updatePickups(run, []);
    updatePickups(run, []);
    expect(run.tables[0]!.broken).toBe(true);
    expect(run.pickups).toHaveLength(1);
    expect(run.actors[0]).toMatchObject({ specialMeter: 0 });
  });
  it('opens the next travel boundary only after the arena clears', () => {
    const run = fixtureRun();
    run.actors[0]!.position.x = 16;
    movePlayer(run, { move: { x: 1, depth: 0 } });
    expect(run.actors[0]!.position.x).toBe(16);
    run.encounter.status = 'cleared';
    movePlayer(run, { move: { x: 1, depth: 0 } });
    expect(run.actors[0]!.position.x).toBeGreaterThan(16);
    for (let i = 0; i < 100; i++) movePlayer(run, { move: { x: 1, depth: 0 } });
    expect(run.actors[0]!.position.x).toBe(18);
  });
});
