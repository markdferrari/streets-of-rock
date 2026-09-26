# Data Model: The Neon Velvet MVP

**Status:** Phase 1 design. Types below describe implementation contracts, not existing code.
**Related:** [Specification](spec.md), [plan](plan.md), [runtime contracts](contracts/runtime.md).

## Coordinates, identity, and clocks

- Simulation coordinates are `x` (horizontal progression) and `depth` (arena lane). Three
  renders `(x, 0, depth)`; model height is visual only. There is no jump axis in gameplay.
- Positions and directions are finite numbers. Normalize movement vectors to length at most
  one; enforce walkable rectangular bounds and reject non-finite input.
- Entity IDs and attack IDs are monotonically allocated within a run. IDs are never reused
  before reset. Iterate entities and resolve ties by ascending ID for repeatable results.
- Simulation advances in integer ticks at 60 Hz. Convert tuning milliseconds using ceiling
  to ticks. Commands have a simulation-tick deadline; no Date/performance calls in game rules.
- The app separately measures active elapsed wall time using a monotonic clock. It starts
  when control becomes available and stops during all pauses and terminal results. This is
  the displayed/recorded time, so dropped rendering frames cannot improve a best time.

## Entities and validation

| Entity | Fields and relationships | Invariants |
| --- | --- | --- |
| RunState | runId, tick, nextEntityId, nextAttackId, areaIndex, waveIndex, actors, attacks, projectiles, tables, pickups, encounter, result | One Cow and one Crow; exactly one terminal outcome; new run is built from fresh defaults |
| Actor | id, role, team, position, facing, hp, maxHp, action, protectionUntilTick, targetId | hp clamped 0..maxHp; facing -1 or +1; zero-health actors cannot act or receive further hits |
| CowState | Actor plus comboStep, comboDeadlineTick, dodgeReadyTick, specialMeter, pendingAction | comboStep 0..2; meter 0..100; at most one buffered action |
| CrowState | Actor plus active/knockedOut, lastProgressTick, following/engaging, desiredTargetId | Knockout lasts until new run; no drops, table damage, special, or friendly collision |
| EnemyState | Actor plus grunt/zoner/enforcer/liam, decisionReadyTick, attackSlot, phase | Liam phase is 1 or 2 and only advances; other enemy roles have no phase |
| ActionState | idle/moving/windup/active/recovery/hurt/dodge/knockedOut, moveId, startedTick, endTick | Damage windows come from action state, never animation callbacks |
| AttackInstance | id, ownerId, moveId, origin, facing, active interval, shape, hitTargetIds | Each target takes at most one hit from each attack; expired instances cannot damage |
| Projectile | id, ownerId, attackId, position, previousPosition, velocity, remainingTicks | Swept collision prevents tunneling; consumed on first eligible hit or arena exit |
| EncounterState | areaId, waveIndex, awaitingEntry/active/cleared, aliveEnemyIds, cameraCenter, bounds | Next wave starts once after aliveEnemyIds empties; pickups/tables/Crow do not count |
| BreakableTable | id, areaId, position, hp, intact/broken, pickupId | Exactly two VIP tables; only Cow damages them; one drop transition each |
| EnergyDrink | id, sourceTableId, position, available/collected | Only living Cow collects; heal 0.25*maxHp capped at maximum; consume even at full hp |
| PreferencesV1 | schemaVersion=1, musicVolume, effectsVolume, screenShake, tutorialCompleted | Volumes finite 0..1; boolean shake; tutorial IDs limited to movement/attack/dodge/special |
| BestResultV1 | schemaVersion=1, bestSuccessfulMs or null | Finite positive elapsed milliseconds; only strictly faster successful results replace it |
| OfflineStatus | runningBuildId, workerBuildId, unknown/preparing/ready/unavailable, missingUrls, reason | Ready means matching active build and a complete current cache audit, not a saved flag |

Preferences and best results are separate records under `streets-of-rock.preferences.v1` and
`streets-of-rock.best.v1`. Parse defensively; unknown schema, invalid JSON, or invalid fields
fall back to defaults. Defaults: music 0.5, effects 0.75, shake off, no completed prompts,
no best time. Ignore unrecognized fields. Catch read/write errors and use in-memory state.
There is no migration from earlier application versions because none exist; future schema
changes require an explicit migration or deliberate reset policy.

## Application and run transitions

| Current state | Trigger | Next state and effects |
| --- | --- | --- |
| loading | required visual/game assets ready | title; audio failure allows silent title |
| loading | required asset or WebGL 2 failure | loadingError; explain issue, offer Retry where recovery is possible |
| title | Start, landscape, required assets ready | running; new RunState, unlock audio, reset active clock |
| running | Pause, hidden, blur, portrait, renderer context loss | paused; stop clocks/audio, clear pointers and pending action |
| paused | environment safe plus explicit Resume | running; reset render accumulator, resume audio from gesture |
| paused | environment still blocked | paused; Resume disabled with clear reason |
| running | Cow hp reaches zero | defeat, even if Liam also dies; stop combat/timing/audio |
| running | Liam hp reaches zero and Cow survives | victory; stop combat/timing/audio, update best result |
| victory/defeat | Retry in safe landscape | running with completely new run state |
| victory/defeat | Return to title | title; dispose transient run resources |
| any | reload/termination and reopening | loading then title, retaining only valid local data |

Keep `pauseLatch` separate from the set of environment blockers. Removing a blocker never
clears the latch. Multiple blockers compose; foregrounding alone cannot resume. Terminal
states take precedence over pause/resume commands. Context restoration recreates render
resources then allows explicit Resume; unrecoverable restoration offers return/reload with
an explanation that the partial run cannot be restored.

## Fixed-step order and terminal precedence

For each active tick:

1. Consume validated input; expire old commands. Choose facing and actionable transitions.
2. Select AI targets and assign at most two shared enemy attack slots (including Liam).
3. Move actors/projectiles; constrain to walkable/camera bounds; resolve non-allied overlap.
4. Advance action phases, generate attack instances, and collect eligible contacts.
5. Resolve contacts in stable attack/target-ID order using pre-resolution alive status. Cow's
   first accepted hit in the tick grants protection against later contacts. Queue all damage
   before applying deaths, so simultaneous Cow/Liam lethal damage remains possible.
6. Apply damage, knockback, meter changes, table break/drop transitions, and knockouts.
7. Resolve defeat before victory. If terminal, do not collect pickups or spawn another wave.
8. Otherwise collect Cow's drinks, advance Liam's phase if below half health, and transition
   wave/area state once. A phase change never resets Liam's health or grants an extra attack.
9. Emit ordered events for HUD, audio, animation, and effects; increment the tick.

The render loop caps accumulated work at five simulation steps per frame, discards excess
simulation backlog, and records a stall. Active wall time still counts that interval.
Pauses reset the accumulator. This prevents runaway catch-up while keeping timing honest.

## Action and AI rules

- One pending action, newest action tap replaces the previous one, expires after the configured
  buffer. Commands are consumed only once. Priority for simultaneous taps is Special, Dodge,
  Attack; pointer order is the tie-breaker within the same action. No action interrupts hurt,
  windup, active, recovery, or dodge in this MVP. Buffering accepts the next eligible action.
- Basic combo continuation must occur by the configured deadline after recovery; expiry resets
  to hit one. Attack direction is captured at windup start. Movement during attacks is zero;
  movement input is retained for resumption. Dodge direction is captured at activation.
- Dodge invulnerability is shorter than the dodge movement; cooldown begins at activation.
- Basic Cow hits add meter per accepted enemy hit, clamped to 100. Spin activation consumes
  100 immediately. Spin damage does not refill its own meter; this is a tuning interpretation
  of a meter-spending special and must be covered by AC-006. Table damage adds no meter.
- Crow uses nearest eligible targets within the same arena: threats attacking Cow, then ranged
  enemies, then other enemies. Distance ties use ID. Follow above 4 units separation; above
  6 units or 2 seconds without progress, reposition alive Crow beside Cow inside walkable bounds
  with no damage or healing. Knocked-out Crow never recovers or teleports back into combat.
- Enemies prefer their nearest living ally target, with Cow winning distance ties. An enemy
  reserves an attack slot from windup through recovery; death/cancel releases it. Waiting
  enemies visibly reposition and cannot deal attack damage. Two is the provisional shared cap.
- No random drops or random stun chances. Initial enemy decisions use fixed priorities and
  cooldowns; scripted sequences and stable IDs allow reproducible tests.

## Initial tuning baseline

These values are **provisional implementation defaults**, not amendments to product scope.
Change them with tests and playtest evidence, preserving the specification's measurable goals.
One world unit is approximately a character body width. Areas are 16 units wide and 6 deep,
joined by short walkable transitions; camera fit must show the full locked combat rectangle.

| Parameter | Initial value |
| --- | --- |
| Cow / Crow maximum hp | 500 / 240 |
| Grunt / Zoner / Enforcer / Liam hp | 120 / 180 / 340 / 1600 |
| Cow basic damage | 12, 14, 22; final hit knocks back 1.2 units |
| Cow basic windup / active / recovery | 120/100/230 ms; 120/100/230 ms; 180/100/320 ms |
| Combo continuation deadline | 300 ms after recovery ends |
| Cow basic range / depth tolerance | 1.3 / 0.45 units |
| Cow movement speed / body radius | 3.2 units/sec / 0.3 units |
| Crow attack | 8 damage, 900 ms complete cycle, 1.1 range, 0.45 depth tolerance |
| Crow walk / follow speed | 3.4 / 4.5 units/sec |
| Grunt / Zoner / Enforcer speed | 2.4 / 2.0 / 1.5 units/sec |
| Grunt attack | 18 damage; 450 ms windup, 100 ms active, 750 ms recovery; 1.0 range |
| Zoner throw | 24 damage; 650 ms windup, 100 ms release, 1100 ms recovery; projectile 5 units/sec, radius 0.15, lifetime 3 seconds |
| Enforcer charge | 40 damage; 850 ms warning, 500 ms dash at 7 units/sec, 1000 ms recovery |
| Liam movement / rope / close strike | 1.8 units/sec; rope 30 damage, 700/150/900 ms, 3.0 range; close 24 damage, 450/100/750 ms, 1.1 range |
| Liam shockwave | 45 damage, 1000 ms warning, 100 ms contact, 1200 ms recovery; once per 6 seconds in phase two, crosses full arena |
| Post-hit Cow protection / hurt | 600 / 180 ms; protection applies to melee, projectiles, and shockwave |
| Dodge movement / invulnerability / cooldown | 300 ms at 6 units/sec / first 200 ms / 900 ms |
| Bovine Spin | 60 damage per target, 2.0-unit circular radius, 100/100/350 ms; knockback 1.5 units |
| Meter gain | 10 per basic enemy hit, cap 100 |
| Table hp / pickup radius | 24 / 0.5 units |
| Input buffer / joystick / buttons | PRD baselines: 150 ms, 15% deadzone, 60 CSS px radius; 72/56 CSS px buttons |

Liam prioritizes due shockwave in phase two, otherwise close strike when in range, otherwise
rope when in range, otherwise approach. Grunt/rope/close strikes use 0.45 depth tolerance.
Zoners aim toward the target at release and prefer 3–5 units separation. Charge direction is
fixed at windup end, with visible lane warning throughout windup. Shockwave is a one-tick
impact at the end of its warning, letting timed dodge protection avoid it; the expanding ring
is presentation only and cannot generate extra hits. Final tuning must prove solo viability
and all four encounter timing targets through real play.

## Content and resource ownership

One level definition owns ordered area/wave descriptors and exactly two table placements.
Each run instantiates independent mutable actors/objects. Loaded geometry, materials, textures,
and SFX buffers are shared resources owned by the app; reset disposes transient attacks/effects
without duplicating shared resources. One music element exists for the app lifetime.

An asset inventory identifies each required local resource, URL, byte length, SHA-256 digest,
and build ID. Build output expands this into the complete precache list including shell,
scripts/styles, manifest, icons, models/textures when present, effects, and music. The worker
verifies cache completeness for that same build; see [delivery contract](contracts/delivery.md).
