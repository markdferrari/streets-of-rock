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
export const cowMoveTuning = {
  cow1: { windup: 8, active: 6, recovery: 14, damage: 12, range: 1.3, depthTolerance: .45, knockback: 0 },
  cow2: { windup: 8, active: 6, recovery: 14, damage: 14, range: 1.3, depthTolerance: .45, knockback: 0 },
  cow3: { windup: 11, active: 6, recovery: 20, damage: 22, range: 1.3, depthTolerance: .45, knockback: 1.2 },
  cowHeavy: { windup: 14, active: 6, recovery: 24, damage: 30, range: 1.3, depthTolerance: .45, knockback: 1.2 },
  spin: { windup: 6, active: 6, recovery: 21, damage: 60, range: 2, depthTolerance: 2, knockback: 1.5 },
} as const;
export function millisecondsToTicks(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('Invalid duration');
  return Math.ceil(milliseconds * tuning.ticksPerSecond / 1000);
}
