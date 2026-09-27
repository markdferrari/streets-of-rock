export interface Tuning {
  ticksPerSecond: number;
  cowHp: number;
  crowHp: number;
  gruntHp: number;
  zonerHp: number;
  enforcerHp: number;
  liamHp: number;
  cowSpeed: number;
  attackRange: number;
  attackDepthTolerance: number;
  inputBufferMs: number;
  dodgeInvulnerabilityMs: number;
  concurrentAttackers: number;
  meterPerHit: number;
  spinDamage: number;
  tableHp: number;
  healFraction: number;
}
export const tuning: Readonly<Tuning> = {
  ticksPerSecond: 60, cowHp: 500, crowHp: 240, gruntHp: 120, zonerHp: 180,
  enforcerHp: 340, liamHp: 1600, cowSpeed: 3.2, attackRange: 1.3,
  attackDepthTolerance: 0.45, inputBufferMs: 150, dodgeInvulnerabilityMs: 200,
  concurrentAttackers: 2, meterPerHit: 10, spinDamage: 60, tableHp: 24, healFraction: 0.25,
};
export function millisecondsToTicks(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('Invalid duration');
  return Math.ceil(milliseconds * tuning.ticksPerSecond / 1000);
}
