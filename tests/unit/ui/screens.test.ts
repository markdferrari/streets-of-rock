import { describe, expect, it } from 'vitest';
import { lockedDuoMarkup, preparingMarkup } from '../../../src/ui/screens';

describe('duo preparation screens', () => {
  it('renders the registered portraits and display names for every new-role pairing', () => {
    const markup = preparingMarkup({ fighterId: 'lion', partnerId: 'plates' }, 'Loading character models…');
    expect(markup).toContain('Your Chieftain: Lion');
    expect(markup).toContain('AI Partner: Plates');
    expect(markup).toContain('alt="Lion portrait"');
    expect(markup).toContain('alt="Plates portrait"');
    expect(() => lockedDuoMarkup({ fighterId: 'plates', partnerId: 'lion' })).not.toThrow();
  });
});
