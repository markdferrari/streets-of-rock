import { describe, expect, it } from 'vitest';
import { createRun } from '../../../src/game/run';
import { combatHudMarkup } from '../../../src/ui/combat';

describe('combat HUD roster names', () => {
  it('shows the selected new characters in player and partner roles', () => {
    const markup = combatHudMarkup(createRun(990, { fighterId: 'lion', partnerId: 'plates' }));
    expect(markup).toContain('Lion 500 / 500');
    expect(markup).toContain('Plates 300 / 300');
  });
});
