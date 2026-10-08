# Data Model: Godot Rewrite

**Feature**: [spec.md](spec.md) | **Rules contract**: [runtime](contracts/runtime.md)

## Representation and compatibility

Simulation objects are typed GDScript RefCounted records with explicit constructors,
owned arrays and deliberate deep copies at run boundaries. They contain no Nodes,
browser objects, Resources, renderer vectors or asynchronous callbacks. Positions,
velocities and camera math use separate 64-bit scalar floats; ticks and IDs use integers.

Keep the existing JSON CharacterDefinitionV1 wire shape and semantic IDs. GDScript
member names may use snake_case; JSON, reference fixtures and browser test projections
retain documented camelCase names. Normalize absent optional fields to null in both
reference and Godot comparison projections. Preserve ordered collections; do not sort
away event, attack or actor-order differences.

## Content catalogue

Move `src/content/characters/*.json` unchanged into `content/characters/`.
During coexistence the legacy TS registry reads these same files; there is no second
editable character catalogue. Add these declarative records:

| Record | Fields / source | Constraints |
| --- | --- | --- |
| Roster | Ordered character IDs: cow, crow, lion, plates | Unique known IDs; fixture rosters belong only to test exports. |
| Resource manifest | Model/portrait/animation/sound/prop keys mapped to res paths; per-character body envelope and semantic clip list | Relative project paths only; known keys; no executable definitions or remote resources. |
| LevelDefinition | id, ordered areas with id/minX/maxX/minDepth/maxDepth and ordered spawn waves; room-2 table positions | Copy current `neon-velvet.ts` values exactly; preserve stable area IDs and all three connectors. |
| Tuning | Existing scalar combat/AI values and move tables not owned by character definitions | Copy current values, preserving units and integer tick semantics. Remove redundant tables only after callers and parity tests prove them unnecessary. |
| BackdropDefinition | Stable areaId, visualId, wallKey, floorKey, image dimensions, landmark rectangles, onward direction | Exactly four mappings below; eight self-contained static images; visual-only data. |

Scene-only choices such as light intensity or material settings stay in scenes/resources;
behavior-affecting body envelopes and framing constants stay in shared content/pure code.

### CharacterDefinitionV1

Retain `schemaVersion: 1`, `id`, `displayName`, `description`, `fightingStyle`,
`player`, `partner` and `presentation`. Exact nested fields come from the existing
[character definition contract](../007-lion-plates-characters/contracts/character-definition.md)
and shipped JSON, with current code taking precedence over that document's obsolete
claim that the CLI does not exist.

- Player: maxHp, moveSpeed, three Light moves, Heavy, dodge and discriminated Special.
- Move: windupTicks, activeTicks, recoveryTicks, damage, range, depthTolerance, knockback.
- Dodge: durationTicks, speed, invulnerabilityTicks, cooldownTicks.
- areaStrike Special: timing, damage, range, depthTolerance and knockback.
- roar Special: timing, radius, stunTicks and bossDamage.
- straightProjectile Special: timing, projectileKey, speed, maxDistance, damage and collisionRadius.
- Partner: maxHp, moveSpeed, catchUpSpeed, supportDamage, supportCooldownTicks, animationKey.
- Presentation: modelKey, portraitKey, animationSetKey, soundSetKey and specialLabel.

Reject unknown/missing fields, duplicate/non-kebab-case IDs, nonfinite values,
nonpositive HP/speed/range/damage, negative or nonnumeric knockback, noninteger or
nonpositive timing, incomplete Light triplets, unsupported Special kinds, and unknown
resource/animation/prop keys. Player-only Specials do not appear in partner data.
All shipped valid values remain unchanged. The stronger malformed-input checks close
identified validator gaps rather than rebalance content.

Derived selection stats remain maximum playable health, first Light damage and normal
speed against shared scales 500, 20 and 5. Identity is independent of player/partner role.

## Run and combat records

| Entity | Fields / relationships | Invariants |
| --- | --- | --- |
| DuoAssignment | fighterId, partnerId | Both registered, distinct, immutable for this session/retry. |
| RunState | duo, runId, tick, nextEntityId, nextAttackId, nextSpecialActivationId, areaIndex, waveIndex, actors, attacks, projectiles, pendingSpecialDamage, tables, pickups, encounter, result | Fresh counters and collections per run; terminal runs never advance. |
| Actor | id, role, team, position(x,depth), facing, hp/maxHp, action, protectionUntilTick, targetId, decisionReadyTick, attackSlot, phase | IDs unique within run; facing -1/+1; role distinguishes player, partner and enemy types. |
| PlayerState | Actor plus characterId, comboStep/deadline, dodgeReadyTick, specialMeter, optional dodgeDirection/pendingAction/preparedSpecial | Meter 0–100; at most one buffered request; full valid Special spends once. |
| PartnerState | Actor plus characterId, active, lastProgressTick, intentState | No Special/pickup/table authority; knockout persists until reset. |
| PartnerIntentState | intent, targetId, destination, lastHorizontalFacing, blockedTicks, blockedDestination, lastResolvedPosition, lastRecoveryTick | Intent engage/regroup/idle/recover; ordinary separation is not obstruction. |
| EnemyState | Actor plus combatClass, stunnedUntilTick, shockwaveReadyTick | normal/boss classification is explicit; ROAR stun does not apply to boss. |
| ActionState | kind, moveId, startedTick, endTick | idle/windup/active/recovery/hurt/dodge/knockedOut; simulation owns transitions. |
| PendingAction | kind, sourcePointerId, order, expiresTick | light/heavy/dodge/special; cancellation removes only matching source. |
| AttackInstance | id, ownerId, moveId, origin, facing, activeUntilTick, range, depthTolerance, damage, hitTargetIds | Once per eligible target; retain source attack ordering. |
| BottleProjectile | id, ownerId, attackId, position, previousPosition, velocity, remainingTicks | Released projectiles outlive owner stun; simulation advances lifetime. |
| HeadrestProjectile | id, ownerId, activationId, position, previousPosition, direction, speedPerSecond, remainingDistance, damage, radius | Fixed release direction, swept first-hit collision, no homing or piercing. |
| PreparedSpecial | activationId, kind, aimPosition, targetIdForDiagnostics, released | Aim copied at action start; released latch prevents duplicate creation. |
| PendingSpecialDamage | activationId, ownerId, targetId, damage | Participates in existing damage/terminal ordering. |
| BreakableTable / EnergyDrink | Stable IDs, source relationship, area/position, HP/broken/pickupId or available | Exactly one drop per table; player-only collection; reset restores originals. |
| EncounterState | areaId, waveIndex, status, aliveEnemyIds, cameraCenter | awaitingEntry/active/cleared; no progress after terminal result. |
| GameEvent | type, tick, optional actorId/targetId | Ordered per-step output, never reused as next step's list. |

Allocate ally entity IDs 1 and 2 at run creation; nextEntityId starts at 3, attack
and Special activation IDs at 1. Preserve baseline starting positions and constructor
values, even when the camera subsequently clamps presentation or movement.

## Frame, viewport and time records

- InputFrame: move(x,depth), ordered action requests and canceled source IDs. Drain
  transient requests only when a simulation tick executes; movement state persists.
- Pointer state: one movement owner, fixed center, clamped knob, action owners and
  monotonic request order. Godot touch indices are local identities; DOM pointerId
  is never assumed equivalent.
- CameraFrame: anchorX, anchorDepth, anchorHeight, halfHeight, aspect.
- BodyEnvelope: min/max X, Y and depth, preserving current per-character values.
- ArenaContext: legalRegions, visibleRegions, playerVisibleRegions, frame, body and
  optional obstructions. Rectangles are scalar world bounds; cameras do not introduce
  new movement geometry.
- FixedStepLoop: last monotonic sample, accumulatedMs, discardedMs, 1000/60 step and
  maxSteps=5. ActiveClock separately records accumulatedMs and optional activeSince.
- ReplayFixture: schemaVersion=1, reference commit, content digest, scenario ID and
  requirement IDs, starting run, ordered frames/ticks with timestamps/input/arena
  context, expected ordered events and canonical state checkpoints. Reference
  correction cases additionally cite the requirement and reason for expected change.

## Session and readiness state

SessionSnapshot retains phase, selection, duo, run, generation, countdown, resumeTarget
and error. Phases: selecting, preparing, countdown, running, paused, victory, defeat,
error. Selection retains step, focusedId, previewedId, fighterId and locked flag.

| Trigger | Transition / effects |
| --- | --- |
| Fresh first activation | Change preview only; loading/error blocks confirmation. |
| Fresh activation of ready preview | Fighter step moves to partner; partner step locks duo and enters preparing. |
| Back from partner | Clear partner, restore fighter as unconfirmed preview. |
| Begin preparation / Retry | Increment generation; discard old run; clear input; retain locked duo; replace views safely. |
| Matching preparation success | Create countdown at tick zero, or retain paused state with countdown as resume target. |
| Stale completion | Ignore session mutation and release obsolete owned view resources. |
| Matching required-load failure | Enter error with retained duo and retry action. |
| Countdown completion | Launch exactly once; start simulation/music/active clock; clear selection inputs. |
| Hidden, blur, portrait, context loss | Pause preparation/countdown/running; clear all held/buffered input; freeze active clocks. |
| Explicit safe Resume | Restore resumeTarget; do not accept carried input. |
| Terminal run | Defeat wins ties; stop simulation/time; record only improved victory time. |
| Home / reload | Clear duo/selection/run; retain valid preferences and asset cache only. |

Countdown retains number (3,2,1 or null), numberElapsedMs, paused, completed and
lastSampleMs. A stalled frame advances at most one numeral and discards surplus
time for the next numeral, preserving the current implementation.

Runtime readiness and offline readiness are separate records. Runtime readiness
covers mounted packs, validated definitions, imported visual resources, chosen
characters, all eight backdrop textures and a successfully rendered initial view.
Audio failure remains nonblocking. Offline readiness requires byte verification of
the complete emitted release, including required audio and all roster content.

ResourceStore states: unloaded/loading/ready/error/retired, with owned resource refs,
pending requests and current generation. It coalesces loads and survives Retry;
retired-generation completions cannot restore UI or leak instances. Shared resources
are released after their final consumer; scene-owned nodes are freed with the scene.

## Room presentation mapping

| Stable areaId | visualId | Required identity | Preserved interactions |
| --- | --- | --- | --- |
| dance-floor | outside-entrance | Pavement, club frontage/sign, rightward neon doorway, queue barriers, posters | Original first two waves. |
| vip-lounge | bar | Counter, bottles, stools, booths, warm/neon accents | Original waves and two tables at (22,-2), (28,2). |
| backstage-corridor | dance-floor | DJ booth, speakers, fixtures, coloured floor lights | Original heavier/ranged encounter. |
| alley-exit | stage-vip | Curtains, stage backing, VIP seating and branding | Original two-phase Liam fight. |

All rooms remain renderable during transitions; only ordinary visibility culling is
allowed. Decorative entities never enter RunState or collision/targeting collections.

## Persistent data, releases and review records

Persistence and browser projections use the exact shapes in the
[browser contract](contracts/browser-platform.md). Release identity, inventory and pack
ownership use the [delivery contract](contracts/delivery.md).

A ValidationRecord identifies feature/PRD/scenario IDs, status (pending/pass/fail/blocked),
build and content identity, test command or manual procedure, observed result, evidence
path, device/browser where applicable and any unresolved dependency. CreationReports
also record brief, source/runtime outputs and actual review decisions. Historical
records are immutable evidence of their original build, not proof of this rewrite.
