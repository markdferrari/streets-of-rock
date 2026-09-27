import { describe, expect, it } from 'vitest';
import { fixtureEnemy, fixtureRun } from '../../fixtures/run';
import { updateZoners } from '../../../src/game/ai/zoner';
import { updateEnforcers } from '../../../src/game/ai/enforcer';
import { updateLiam } from '../../../src/game/ai/liam';
import { updateProjectiles } from '../../../src/game/projectiles';

describe('ranged and heavy enemies', () => {
  it('telegraphs a zoner throw and creates a finite visible projectile', () => {
    const run = fixtureRun();
    run.actors.push(fixtureEnemy(3, 'zoner', 4));
    const events: { type: string; tick: number; actorId?: number }[] = [];
    updateZoners(run, events);
    expect(events.some(event => event.type === 'enemy-warning')).toBe(true);
    for (let tick = 1; tick < 45; tick++) { run.tick = tick; updateZoners(run, events); }
    expect(run.projectiles).toHaveLength(1);
    expect(run.projectiles[0]!.remainingTicks).toBeGreaterThan(0);
  });
  it('uses swept projectile contact and consumes the projectile once', () => {
    const run = fixtureRun();
    run.actors.push(fixtureEnemy(3, 'zoner', 4));
    run.projectiles.push({ id: 4, ownerId: 3, attackId: 1, position: { x: 2, depth: 0 }, previousPosition: { x: 2, depth: 0 }, velocity: { x: -4, depth: 0 }, remainingTicks: 10 });
    updateProjectiles(run, []);
    expect(run.actors[0]!.hp).toBe(476);
    expect(run.projectiles).toHaveLength(0);
  });
  it('warns before an enforcer charge and enters recovery afterward', () => {
    const run = fixtureRun();
    run.actors.push(fixtureEnemy(3, 'enforcer', 3));
    const events: { type: string; tick: number; actorId?: number }[] = [];
    updateEnforcers(run, events);
    expect(events.some(event => event.type === 'enemy-warning')).toBe(true);
    expect(run.actors[2]!.action.kind).toBe('windup');
    run.tick = 51;
    updateEnforcers(run, events);
    expect(run.actors[2]!.action.kind).toBe('active');
    run.tick = 82;
    updateEnforcers(run, events);
    expect(run.actors[2]!.action.kind).toBe('recovery');
  });
});

describe('Liam', () => {
  it('changes phase once below half health and warns before the phase-two shockwave', () => {
    const run = fixtureRun();
    const liam = fixtureEnemy(3, 'liam', 2);
    liam.hp = 799;
    run.actors.push(liam);
    const events: { type: string; tick: number; actorId?: number }[] = [];
    updateLiam(run, events);
    expect(liam.phase).toBe(2);
    expect(events.filter(event => event.type === 'boss-phase')).toHaveLength(1);
    expect(events.some(event => event.type === 'enemy-warning')).toBe(true);
    updateLiam(run, events);
    expect(events.filter(event => event.type === 'boss-phase')).toHaveLength(1);
  });
});
