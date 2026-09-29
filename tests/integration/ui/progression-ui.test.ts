import { describe, expect, it } from 'vitest';
import { fixtureRun } from '../../fixtures/run';
import { deriveProgressionCue, placeProgressionCue, progressionMarkup } from '../../../src/ui/progression';

describe('progression presentation', () => {
  it('renders one static arrow, one GO label and one directional announcement', () => {
    const run = fixtureRun();
    run.encounter.status = 'cleared';
    const markup = progressionMarkup(deriveProgressionCue(run, 'running'));
    expect(markup.match(/<svg/g)).toHaveLength(1);
    expect(markup.match(/>GO</g)).toHaveLength(1);
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Go right to the next room');
    expect(markup).toContain('aria-hidden="true"');
    expect(progressionMarkup(deriveProgressionCue(run, 'defeat'))).toBe('');
  });

  it('places a 96 by 48 cue at least eight pixels from safe bounds and measured controls', () => {
    const run = fixtureRun(); run.encounter.status = 'cleared';
    const cue = deriveProgressionCue(run, 'running');
    const viewport = { width: 844, height: 390, safe: { top: 12, right: 12, bottom: 12, left: 12 } };
    const controls = [{ x: 0, y: 0, width: 600, height: 60 },
      { x: 656, y: 202, width: 176, height: 176 }, { x: 12, y: 258, width: 120, height: 120 }];
    const point = placeProgressionCue(cue, viewport, controls);
    expect(point).not.toBeNull();
    expect(point!.x).toBeGreaterThanOrEqual(20);
    expect(point!.x + 96).toBeLessThanOrEqual(824);
    expect(point!.y).toBeGreaterThanOrEqual(20);
    expect(point!.y + 48).toBeLessThanOrEqual(370);
    for (const control of controls) {
      expect(point!.x + 96 + 8 <= control.x || point!.x >= control.x + control.width + 8 ||
        point!.y + 48 + 8 <= control.y || point!.y >= control.y + control.height + 8).toBe(true);
    }
  });
});
