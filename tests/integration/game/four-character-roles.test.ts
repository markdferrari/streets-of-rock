import { describe, expect, it } from 'vitest';
import { characters } from '../../../src/content/characters';
import { createRun } from '../../../src/game/run';
import { getPartner, getPlayer } from '../../../src/game/selectors';

describe('four-character role and fresh-run integration', () => {
  it('initializes every ordered distinct duo with the selected player and ordinary partner profile', () => {
    for (const fighter of characters) for (const partner of characters) {
      if (fighter.id === partner.id) continue;
      const run = createRun(800 + runCount++, { fighterId: fighter.id, partnerId: partner.id });
      expect(run.duo).toEqual({ fighterId: fighter.id, partnerId: partner.id });
      expect(getPlayer(run)).toMatchObject({ role: 'player', characterId: fighter.id,
        maxHp: fighter.playerProfile.maxHp, hp: fighter.playerProfile.maxHp, specialMeter: 0 });
      expect(getPartner(run)).toMatchObject({ role: 'partner', characterId: partner.id,
        maxHp: partner.partnerProfile.maxHp, hp: partner.partnerProfile.maxHp, active: true });
      expect(getPartner(run)).not.toHaveProperty('specialMeter');
      expect(run).toMatchObject({ tick: 0, nextSpecialActivationId: 1, attacks: [], projectiles: [], pendingSpecialDamage: [], result: null });
    }
  });

  it('rejects all four duplicate pairings', () => {
    for (const character of characters) expect(() => createRun(900, { fighterId: character.id, partnerId: character.id })).toThrow(/different registered partner/);
  });
});

let runCount = 0;
