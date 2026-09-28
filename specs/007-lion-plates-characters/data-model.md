# Data Model: Four Characters and Special Effects

## CharacterDefinition v1

One bundled JSON file per ID: cow, crow, lion, plates. Fields:

- `schemaVersion: 1`, `id`, `displayName`, `description`, `fightingStyle`.
- `player`: maxHp, moveSpeed, light[3], heavy, dodge, special. Basic moves contain windup/active/recovery ticks, damage, range, depthTolerance and knockback. Dodge retains existing duration/speed/invulnerability/cooldown.
- `partner`: maxHp, moveSpeed, catchUpSpeed, supportDamage, supportCooldownTicks, support animation key. No Special configuration is accepted here.
- `presentation`: modelKey, portraitKey, animationSetKey, soundSetKey, specialLabel. Static manifests map keys to bundled assets; no executable paths or expressions in data.

Special is a discriminated union: `areaStrike` (existing Cow/Crow), `roar` (radius, stunTicks, bossDamage), or `straightProjectile` (projectileKey, speed, maxDistance, damage, collisionRadius). Each has windup/active/recovery ticks and shares full-meter eligibility/one-time spending. JSON validation rejects unknown fields, unsupported versions/kinds, duplicate IDs, nonfinite/negative values and missing required fields/resources. Allow zero only for valid effect-free values such as knockback. Require exactly three Light stages and all semantic animation mappings. IDs use lowercase kebab-case and uniquely index the registry.

Enemy definitions gain explicit `combatClass: normal | boss`; current Liam=boss and grunt/zoner/enforcer=normal. Do not infer from size/name/HP. Definition validation checks Lion/Plates relative movement, corresponding damage/reach and basic-cycle durations.

## Provisional initial tuning

Values below are starting points, not acceptance substitutes. Preserve integrated 005 Cow/Crow profiles exactly; do not copy legacy hardcodes over them.

| Player parameter | Lion | Plates |
| --- | --- | --- |
| HP / speed | 500 / 2.6 | 300 / 4.2 |
| Light damage | 18 / 22 / 32 | 10 / 12 / 18 |
| Light windup/active/recovery ticks | 12/8/20, 12/8/20, 16/8/26 | 6/5/12, 6/5/12, 9/5/18 |
| Light range / depth tolerance | 1.4 / 0.45 | 2.0 / 0.45 |
| Heavy damage / range | 44 / 1.8 | 28 / 2.4 |
| Heavy windup/active/recovery | 20/8/32 | 12/6/22 |
| Special windup/active/recovery | 18/1/30 | 12/1/24 |
| Special parameters | radius 3; stun 120 ticks; boss damage 60 | speed 12 world units/sec; range 12; damage 50; radius 0.25 |

Both retain 005 Dodge/meter/basic knockback rules and 006 partner intent. Partner HP and normal speed use the character profile; supportDamage=8, supportCooldownTicks=54, catchUpSpeed=4.5 for each, preserving ordinary support strength. Special cost is the existing full 100-point meter. Stun duration uses 60-Hz run ticks. Selection bars use 005's shared scale and true values; Power remains first-Light damage, not Special damage.

## Stun and one-shot release

`EnemyState.stunnedUntilTick?: number` is active iff alive, normal-class and tick < expiry. A refresh sets expiry=tick+configuredDuration. Applying it cancels current action/owned active melee attacks, releases attack-slot ownership and clears move-specific transient state; mark normal decision readiness at expiry so the cancelled move does not resume. Death clears status. Existing released projectiles remain separate entities.

`SpecialAction` retains ordinary action timing plus a monotonic activation ID and optional prepared throw: `aimPosition`, `targetIdForDiagnostics`, `released`. Target ID is never consulted after aiming. On windup→active emit one release effect and set released once; cancellation drops prepared state without meter refund. ROAR evaluates targets at effect time, not action start.

`PendingSpecialDamage` contains activation ID, owner ID, target ID, damage, and flags disabling stun/knockback/meter gain. Resolve boss damage alongside collected melee damage so existing simultaneous lethal outcomes survive; terminal defeat still wins ties. Zero-health targets receive no later status.

## HeadrestProjectile

Discriminated `kind: headrest` alongside the existing enemy projectile kind. Fields: id, ownerId, team, previousPosition, position, normalizedDirection, speedPerSecond, remainingDistance, damage, radius, activationId. No live target reference or homing logic. At release use actual origin and the fixed stored aim point; zero vector falls back to facing. Existing windup interruption rules prevent release after cancellation.

Each tick advances min(speed/60, remainingDistance). For living opposing enemies, calculate segment-circle entry fraction using combined projectile radius and existing target hit radius; initial overlap is fraction zero, tangency counts. Resolve lowest fraction then numeric target ID. Move to impact, apply normal damage rules with no added status/knockback/meter and remove. Protected targets still consume the projectile. Without hit subtract actual distance and remove at zero. Do not apply legacy projectile broad-world-bound cleanup to a valid headrest before its configured range expires.

Pause freezes simulation; results/retry clear projectiles/status/prepared actions. Do not change existing enemy projectile rules except making stun unable to delete already released projectiles.

## Asset and creation records

Presentation manifest resolves character GLB, portrait, sound set and semantic clips: Idle/Move/Hurt/KnockedOut/Dodge, three Light phases, Heavy phases, Special phases, support. Lion ROAR visibly expands without displacing victims; normal stun uses a visible non-colour-only status cue. Plates' throw includes the conjured prop at release; keep the projectile prop separate from the character mesh. Body envelopes join 006 framing validation.

`CreationReport` records character ID, input brief, concept-review status/reference, definition/assets changed, implemented behaviour kinds, validation commands/results, playable review location, unresolved art/balance/device items and unrelated-resource checks. Reports do not claim completion until mandatory evidence passes. Store under this feature's `reviews/lion.md` and `reviews/plates.md` during implementation.
