import type { Tuning } from './tuning';
export function validateTuning(value: Tuning): void {
  for (const [key, number] of Object.entries(value)) {
    if (!Number.isFinite(number)) throw new Error(`Invalid tuning value: ${key}`);
  }
  for (const key of ['ticksPerSecond', 'cowHp', 'crowHp', 'gruntHp', 'zonerHp', 'enforcerHp', 'liamHp', 'cowSpeed', 'attackRange', 'attackDepthTolerance', 'concurrentAttackers', 'meterPerHit', 'spinDamage', 'tableHp'] as const) {
    if (value[key] <= 0) throw new Error(`Out-of-range tuning value: ${key}`);
  }
  if (!Number.isInteger(value.ticksPerSecond) || !Number.isInteger(value.concurrentAttackers) || value.concurrentAttackers > 2) throw new Error('Invalid tick or attacker count');
  if (value.inputBufferMs < 0 || value.dodgeInvulnerabilityMs < 0) throw new Error('Negative duration');
  if (value.healFraction <= 0 || value.healFraction > 1 || value.meterPerHit > 100) throw new Error('Invalid resource bound');
}
