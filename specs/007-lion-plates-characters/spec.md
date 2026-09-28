# Feature Specification: Lion, Plates and Reusable Character Creation

**Feature Branch**: `007-lion-plates-characters`

**Created**: 2026-09-28

**Status**: Draft — specification validated; implementation and acceptance pending

**Input**: Add Lion, a powerful slow brawler with a broad Heavy swipe and ROAR that stuns normal enemies but damages bosses without stunning them. Add Plates, a fast, long-reaching walking dinner plate whose Special conjures a car-seat headrest and throws it straight toward the nearest visible enemy's initial position. Establish shared character definitions and a reusable character-creation skill, exercised for both characters.

## Product Alignment *(mandatory)*

- **PRD references**: PRD FR-002–019, FR-020–025, FR-031–047, FR-048, new FR-051–055; NFR-001–009; AC-040–046, AC-047–052 and new AC-053–057; SC-004–008 and new SC-010.
- **Included behavior**: Four-character roster supporting every distinct player/AI pairing; Lion and Plates with readable basic actions and distinct Specials; validated per-character definitions; reusable creation workflow from brief through asset review, integration and validation.
- **Deferred behavior**: Additional characters beyond these four, new levels/enemies, graphical overhaul, general equipment/pickup weapons, grapples, aerial combat, player-issued AI commands, AI Specials, multiplayer and arbitrary user-scripted moves.
- **Provisional tuning**: Exact HP, speed, attack damage/reach/timing, ROAR radius/stun duration/boss damage and headrest speed/range/damage are playtest values. Lion must remain slower with stronger corresponding basic hits; Plates must remain faster with longer corresponding basic reach. Their Special effects are fixed requirements.
- **Baseline revision**: PRD 2.4 and constitution 1.2.0 authorize four roster identities and these two distinct Specials. This feature supersedes 005's two-character production scope and universal area-damage Special assumption only; 005 selection/role rules and 006 partner/view/progression rules remain applicable. The headrest is a conjured Special projectile, not a collectible weapon system.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play Lion and control groups with ROAR (Priority: P1)

As a player, I can choose a slow, powerful lion whose swipes exploit openings created by a roar.

**Why this priority**: Delivers one new playable identity and the first new Special effect.

**Independent Test**: Select Lion with an existing partner; compare movement/basic attacks with Plates' configured profile, then use ROAR against normal enemies, a boss and a mixed group.

**Acceptance Scenarios**:

1. **Given** Lion selected as player, **When** using Light, Heavy and Dodge, **Then** his claw combo and broad Heavy have readable windup/recovery and he moves/attacks more slowly than Plates while corresponding basic hits deal more damage.
2. **Given** a full meter and normal enemies in ROAR radius, **When** its effect occurs, **Then** each is stunned once without damage or knockback; enemies outside the radius and allies are unaffected.
3. **Given** a boss in range, **When** ROAR affects it, **Then** it takes damage once without stun, knockback or interruption of its attack. A mixed group receives the correct effect per target classification.
4. **Given** a normal enemy attacking, **When** stunned, **Then** its current attack ends and movement/attacks stop for the duration. Previously released projectiles continue; repeated stun refreshes rather than adds duration. On expiry it returns to normal decision-making without resuming the cancelled attack.
5. **Given** an unavailable Special or an interrupted game, **When** ROAR is requested or stun is active, **Then** existing action/meter rules apply and pause freezes remaining stun time. Boss defeat and enemy death still use existing terminal/clearance rules.

### User Story 2 - Play Plates and throw a headrest (Priority: P1)

As a player, I can move quickly, fight at longer reach and launch a readable improvised projectile.

**Why this priority**: Delivers the second character and proves a different Special can share the definition workflow.

**Independent Test**: Select Plates with an existing partner; exercise movement/reach and Headrest Throw against stationary, moving, tied-distance and absent targets.

**Acceptance Scenarios**:

1. **Given** Plates selected, **When** moving or using Light/Heavy, **Then** he is recognisably a large walking dinner plate, moves faster than Lion and reaches farther with corresponding basic attacks while dealing less damage per hit.
2. **Given** a full meter and eligible enemies, **When** the throw begins, **Then** Plates visibly conjures a car-seat headrest, selects the nearest living visible enemy including bosses, records that target position, and spends the meter once.
3. **Given** the target moves or dies after aiming, **When** the headrest is released, **Then** it follows the original straight trajectory without homing or retargeting and may miss.
4. **Given** a projectile intersects enemies, **When** the first collision occurs, **Then** that enemy takes damage once and the projectile disappears, without stun, knockback, piercing or ally damage. Another enemy may intercept the shot.
5. **Given** no hit, **When** maximum travel distance is reached, **Then** the projectile disappears. Pause freezes its movement/lifetime; retry/results clear it.
6. **Given** no living visible target or an incomplete meter, **When** Special is requested, **Then** no projectile is launched, no meter is consumed, and unavailable-action feedback appears.

### User Story 3 - Select and replay with a four-character roster (Priority: P1)

As a player, I can inspect and choose any two different characters and receive the correct player and AI roles.

**Why this priority**: New characters must participate in the existing complete game, not just isolated demonstrations.

**Independent Test**: Initialise all twelve ordered distinct duos and test both new characters as player and partner through combat, knockout, retry and offline entry.

**Acceptance Scenarios**:

1. **Given** the roster, **When** inspecting Lion/Plates, **Then** names, portraits, full-body previews and Health/Power/Speed bars match actual definitions; first activation previews, second confirms, and duplicates remain unavailable.
2. **Given** any distinct ordered duo, **When** entry countdown ends, **Then** the chosen fighter has all four controls and the partner uses ordinary support attacks and the visible aggressive behaviour from 006, without player Specials.
3. **Given** partner knockout, **When** either new fighter continues, **Then** solo completion and player Special remain possible; player knockout still causes defeat. Retry retains the duo and resets health, meter, stun and projectile state.
4. **Given** a completely cached build, **When** relaunched offline, **Then** character previews, required assets, combat/audio, results and retry work. Storage/audio denial does not block playable operation.
5. **Given** Cow/Crow in the expanded roster, **When** using their existing actions and roles, **Then** their established stats, move behaviour and presentation remain compatible.

### User Story 4 - Add characters through a reusable creation skill (Priority: P2, required)

As a developer or coding agent, I can turn a character brief into a validated, reviewable roster addition through a repeatable workflow.

**Why this priority**: Both additions should establish a practical foundation for later roster expansion.

**Independent Test**: Use the same skill for Lion and Plates, retain each run's inputs/output report, and deliberately submit incomplete or invalid definitions to verify actionable feedback.

**Acceptance Scenarios**:

1. **Given** a character brief, **When** the skill starts, **Then** it checks identity, visual/combat intent, required information and supported move behaviour, reporting missing decisions before dependent work.
2. **Given** a valid brief, **When** the workflow runs, **Then** it produces a definition, model/portrait/animation assets, roster and role integration, tests, and a playable review with a completion report.
3. **Given** a new unsupported Special behaviour, **When** definitions are prepared, **Then** the workflow identifies required behaviour and test work instead of treating configuration as an arbitrary ability interpreter.
4. **Given** invalid values, duplicate identity or missing assets/animations, **When** validation runs, **Then** actionable failures identify the character and affected field/resource before readiness is declared.
5. **Given** the second character is created or an existing one is revised, **When** the workflow runs, **Then** unrelated assets/definitions are preserved, visual/gameplay review is required and unfinished art/balance/device checks remain visible in its report.

### Edge Cases

- ROAR classifies every living in-range target independently; boss identity is an explicit classification, not inferred from size or remaining health. A boss killed by its damage still enters normal victory/phase logic as applicable.
- Stunned enemies remain alive and count toward encounter clearance. Stun cannot survive retry or advance while paused; death ends the target's remaining stun.
- ROAR samples its radius when the effect occurs, uses existing arena-distance conventions and affects each target once. It can be activated without a target and still spends the meter; Plates' no-target protection is explicitly different.
- Headrest aim is fixed when the valid action begins. Aiming and release animation may be separated, but target motion/death cannot retarget the projectile. Damage applies on impact, not on selection.
- Equal-distance eligible targets use a stable target ordering; simultaneous collision ties also resolve consistently to one first hit. A target at the launch position remains hittable without an invalid trajectory.
- Both Specials cannot damage allies or break tables/collect pickups. Stun or Special damage cannot refill the Special meter. Basic attacks retain existing table/pickup rules.
- If a throw is interrupted before release under existing action rules, it does not leave an orphan projectile or refund the consumed meter. Results/retry remove any remaining effect/projectile.
- Concept approval concerns appearance; it cannot waive missing animations, wrong Special effects or unreadable attacks. Existing character assets must not be silently replaced by a new workflow run.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide a validated shared character-definition format and one independently editable configuration per roster character, containing identity, description/style, player stats/moves, partner support tuning and presentation references. Cow/Crow MUST remain compatible. (PRD FR-051)
- **FR-002**: Definitions MUST reference supported move behaviours and their parameters; unsupported mechanics MUST require explicit behaviour/test work. Invalid values, duplicate IDs, missing assets or incomplete required animations MUST prevent character readiness with actionable feedback. (PRD FR-051, FR-055)
- **FR-003**: Selection stats MUST derive from gameplay definitions. Character identity MUST remain independent of player/AI role, with names, portraits, full-body previews and required action feedback for all four identities. (PRD FR-041–043, FR-051, FR-054)
- **FR-004**: Lion MUST be a powerful slow brawler with claw Light combo and broad Heavy swipe, slower movement/basic attack cycles and greater corresponding basic-hit damage than Plates. (PRD FR-052)
- **FR-005**: ROAR MUST stun normal enemies within its configurable radius once per activation, causing no damage or knockback; it MUST instead damage bosses without stun, knockback or ROAR-induced attack interruption. (PRD FR-052)
- **FR-006**: Stun MUST interrupt normal enemies' current attacks, suspend movement/new attacks, expire after its configured active duration and refresh rather than add durations. Previously released projectiles MUST remain active; pause freezes stun time and reset clears it. (PRD FR-052; NFR-004)
- **FR-007**: Plates MUST be a large walking dinner plate with faster movement, longer corresponding Light/Heavy reach and lower corresponding basic-hit damage than Lion. Heavy MUST have distinct windup/recovery. (PRD FR-053)
- **FR-008**: Headrest Throw MUST visibly conjure a car-seat headrest and fix aim toward the nearest living visible enemy's position when the action begins, including bosses with consistent distance ties. It MUST travel straight without homing/retargeting and allow misses/interceptions. (PRD FR-053)
- **FR-009**: The headrest MUST damage only the first enemy hit once, then disappear; it MUST not stun, knock back, pierce or damage allies. Misses expire at configured maximum travel distance; pause/results/reset MUST handle projectiles safely. (PRD FR-053; NFR-004)
- **FR-010**: Both Specials MUST use existing action eligibility and full Special meter. Valid activation consumes it once; Specials never refill it. Plates with no eligible target MUST produce unavailable feedback without a throw or meter spend. (PRD FR-014–015, FR-052–053)
- **FR-011**: All twelve distinct ordered player/partner pairings MUST initialise with correct roles and use existing preview/confirm, duplicate prevention, countdown, HUD, defeat and retry rules. Lion/Plates AI partners MUST use ordinary support attacks and 006 behaviour, without Specials. (PRD FR-041–048, FR-054)
- **FR-012**: Each new fighter MUST be able to finish the level alone after partner knockout; Cow/Crow actions and values MUST pass compatibility regression. Retry MUST retain the duo and clear all transient combat/effect state. (PRD FR-002–004, FR-023, FR-047, FR-054)
- **FR-013**: Deliver a reusable character-creation skill accepting a brief and guiding definition, concept review, model/portrait/animation work, supported/new move behaviour, roster/role integration, tests and playable review. It MUST be exercised for both Lion and Plates. (PRD FR-055)
- **FR-014**: The skill MUST detect incomplete briefs/unsupported behaviours, preserve unrelated character work, follow test-first development for automatable rules, require visual/gameplay review and report verified outputs separately from incomplete art, balance and validation work. (PRD FR-055)
- **FR-015**: Required character assets and audio MUST work after successful offline caching, with readable muted/no-shake/reduced-motion presentation, safe mobile controls, existing pause/update rules and nonblocking storage/audio failure. No graphical overhaul is required. (PRD FR-032–037; NFR-001–009)

### Mobile Quality and Validation *(mandatory)*

Automatable rules require failing tests before implementation. Define these manual checks before visual/asset work; specification review alone is not runtime acceptance.

| Area and PRD mapping | Automated outcomes | Manual procedure |
| --- | --- | --- |
| Controls, telegraphs, safe areas: FR-010–018, FR-039–040, FR-052–054; NFR-003 | Both characters' four actions, range, hit-once, meter, stun/boss classification, projectile ties/misses, simultaneous/cancelled input. | On both reference phones play each character, inspect windups/releases/recovery and HUD/controls, use sound/shake off, then reduced motion. ROAR stun versus boss damage and headrest trajectory must remain legible. |
| Lifecycle: FR-002–005, FR-047; NFR-004 | Pause during stun and before/after headrest release; no hidden effect time, attack, repeated impact or carried input. Full reset/defeat precedence. | Background/focus-switch/rotate during each Special, explicitly resume and verify remaining effects, single launch/impact and unchanged active-run timing. |
| Loading/audio/storage/cache/update: FR-034–037; NFR-005–009 | Missing assets/animations block readiness; audio/storage failure does not block play; inventory includes new portraits/models/projectile/sounds; safe updates. | Cache complete intended build, relaunch offline and play Lion/Plates through full level/results/retry, browser and installed modes where supported. Exercise failures and pending updates without replacing a running build. |
| Performance: NFR-001–002; SC-006 | Asset/animation coverage and existing build-budget regressions, all twelve pairing initialisations. | On iPhone 12 and Pixel 6, record OS/browser and complete-run timing for Lion and Plates with both new-character pairings, including multiple enemies under ROAR and headrest travel; retain 60-fps target/30-fps busiest-encounter floor. |
| Workflow and player understanding: FR-051, FR-055; SC-010 | Definition validation, incomplete brief and unsupported-move reporting, unrelated asset preservation. | Review both skill-produced characters before acceptance. Five testers try both without coaching; at least four identify Lion as slower/stronger and Plates as faster/longer-reaching. Retain existing combat/readability evaluation gates. |

### Key Entities *(include if feature involves data)*

- **Character definition**: Stable identity, presentation, player/partner attributes and configured move references; shared source for gameplay and selection information.
- **Move behaviour**: Supported combat effect and configurable timing/range/damage/status parameters; includes normal area Special, ROAR and straight projectile.
- **Stun effect**: Affected normal enemy and remaining active duration; interruption, refresh, expiry and reset semantics.
- **Headrest projectile**: Origin, fixed aim/trajectory, travel limit, damage and resolved/expired state; no ongoing target tracking.
- **Creation run**: Character brief, review decisions, produced assets/configuration/integration, validation results and outstanding work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All twelve distinct ordered duos initialise correct identities/roles, reject duplicates and retain the duo across a fully reset retry.
- **SC-002**: All ROAR scenarios pass with zero damage/knockback on normal enemies, zero stun/attack interruption on bosses, and at most one effect per eligible target per activation.
- **SC-003**: All Headrest Throw scenarios pass with fixed initial aim, at most one enemy hit, no ally damage, successful misses/expiry and zero meter spend without an eligible target.
- **SC-004**: The reusable skill is exercised once for Lion and once for Plates, producing two complete review reports; every required definition/asset/animation/integration check passes and no unrelated character resource is overwritten.
- **SC-005**: At least four of five testers correctly identify both Lion's slower/stronger style and Plates' faster/longer-reaching style after trying both; record each response and retain existing readability/controls gates. (PRD SC-010)
- **SC-006**: Both new fighters complete solo-after-partner-loss and cached-offline runs through results/retry, and both reference phones meet the existing performance requirement with full assets and intended audio.

## Assumptions

- Feature 005's roster/role/entry foundation and feature 006's partner behaviour are prerequisites; their specifications do not imply their code is already complete.
- Light combo, Heavy, Dodge and Special controls and meter gain remain; Lion/Plates have distinct Special effects but no AI Specials. Normal enemies means non-boss enemies; boss classification is explicit.
- Lion/Plates comparison applies to corresponding basic strikes and total basic attack-cycle duration, not ROAR versus headrest damage. Health and comparisons against Cow/Crow remain provisional balance choices.
- ROAR's area is centred on Lion when its effect occurs. Stun refresh resets remaining duration to the configured duration. Cancelled enemy attacks do not resume on expiry; released projectiles remain independent.
- Headrest targets use nearest arena distance at action start, stable identity order for ties, and collision along the full straight travel path. It deals damage to bosses under ordinary damage rules. Environmental weapons/collectibles are not introduced.
- No-target ROAR still consumes a valid full meter; no-target Plates does not. Neither Special grants meter, ally damage, table destruction or pickup collection.
- Lion clothing/palette and Plates limb design are settled in concept review using the current art style before final model production. Numeric balance is established in planning and refined by playtesting; art-quality upgrades remain deferred.
- The creation skill is a development deliverable, not an in-game character editor or guarantee of automatic art quality. This specification does not itself create or install that skill; creation and its two exercises belong to implementation.
- Intended soundtrack, reference-phone access, concept review and five participants remain acceptance dependencies. Missing evidence must stay visible.
