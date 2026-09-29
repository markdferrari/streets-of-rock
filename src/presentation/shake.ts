export function cameraShakeOffset(ageMs: number, enabled: boolean, reducedMotion = false): number {
  if (!enabled || reducedMotion || ageMs <= 0 || ageMs >= 180) return 0;
  return Math.sin(ageMs * .11) * .12 * (1 - ageMs / 180);
}
