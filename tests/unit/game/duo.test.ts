import { describe, expect, it } from 'vitest';
import { characters } from '../../../src/content/characters';
import { validateDuo } from '../../../src/game/duo';

describe('duo assignment', () => {
  it('accepts both distinct Cow/Crow orders and returns an immutable snapshot', () => {
    const first = validateDuo({ fighterId: 'cow', partnerId: 'crow' }, characters);
    const second = validateDuo({ fighterId: 'crow', partnerId: 'cow' }, characters);
    expect(first).toEqual({ fighterId: 'cow', partnerId: 'crow' });
    expect(second).toEqual({ fighterId: 'crow', partnerId: 'cow' });
    expect(Object.isFrozen(first)).toBe(true);
  });

  it('rejects duplicate and unknown identities', () => {
    expect(() => validateDuo({ fighterId: 'cow', partnerId: 'cow' }, characters)).toThrow();
    expect(() => validateDuo({ fighterId: 'nobody', partnerId: 'crow' }, characters)).toThrow();
    expect(() => validateDuo({ fighterId: 'cow', partnerId: 'nobody' }, characters)).toThrow();
  });
});
