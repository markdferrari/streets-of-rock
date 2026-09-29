import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { deriveProgressionCue } from '../../../src/ui/progression';
import { neonVelvet } from '../../../src/content/neon-velvet';

describe('progression cue state', () => {
  it('appears only after the final wave clears and persists during travel and pause', () => {
    const run = fixtureRun();
    expect(deriveProgressionCue(run, 'running').visible).toBe(false);
    run.encounter.status = 'cleared';
    expect(deriveProgressionCue(run, 'running')).toMatchObject({ visible: true, areaId: 'dance-floor',
      nextAreaId: 'vip-lounge', direction: 'right', accessibleLabel: 'Go right to the next room' });
    expect(deriveProgressionCue(run, 'paused').visible).toBe(true);
    run.areaIndex = 1; run.encounter.areaId = 'vip-lounge'; run.encounter.status = 'active';
    expect(deriveProgressionCue(run, 'running').visible).toBe(false);
  });

  it('uses actual route direction and suppresses final or terminal cues', () => {
    const run = fixtureRun();
    run.encounter.status = 'cleared';
    const leftRooms = [{ ...neonVelvet.areas[0]!, id: 'east', minX: 18, maxX: 34 },
      { ...neonVelvet.areas[1]!, id: 'west', minX: 0, maxX: 16 }];
    expect(deriveProgressionCue(run, 'running', leftRooms)).toMatchObject({ visible: true, direction: 'left' });
    run.result = 'defeat';
    expect(deriveProgressionCue(run, 'defeat').visible).toBe(false);
    run.result = null;
    run.areaIndex = 3; run.encounter.areaId = 'alley-exit';
    expect(deriveProgressionCue(run, 'running').visible).toBe(false);
  });
});
