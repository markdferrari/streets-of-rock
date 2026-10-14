# Feature Specification: Godot Rewrite with Functional Parity

**Feature Branch**: `009-godot-rewrite`

**Created**: 2026-10-08

**Status**: Implemented — technical cutover; manual acceptance waived by explicit owner decision

**Input**: Rewrite Streets of Rock using Godot, preserving existing functional behavior and mobile-web delivery, and completing all committed specifications. The owner confirmed mobile web/PWA delivery, limited browser-integration JavaScript, close visual matching, inclusion of unfinished specifications, and a separate allowance for engine download overhead.

## Product Alignment *(mandatory)*

- **PRD references**: [PRD 2.5](../../PRD.md), FR-001–060, NFR-001–009, its current acceptance scenarios and SC-001–011. Features [001](../001-neon-velvet-mvp/spec.md), [002](../002-revised-controls/spec.md), [003](../003-cow-crow-models/spec.md), [004](../004-rigged-cow-crow-gameplay/spec.md), [005](../005-choose-your-fighter/spec.md), [006](../006-combat-view-partner/spec.md), [007](../007-lion-plates-characters/spec.md) and [008](../008-nightclub-backdrops/spec.md) refine these requirements; later revisions supersede conflicting historical behavior.
- **Governance**: [Constitution 1.2.0](../../.specify/memory/constitution.md). Implementation follows specification, technical planning, dependency-ordered tasks, test-first development, feature-branch work and all-tests-before-commit rules. Document validation does not establish runtime acceptance.
- **Player value**: Players retain the familiar complete game, browser access and saved preferences while receiving the complete specified nightclub presentation.
- **Included behavior**: Four selectable fighters, all twelve distinct ordered fighter/partner pairings, the complete one-level experience, current combat and partner behavior, illustrated nightclub scenery, browser installation, offline replay, persistent preferences/results, and the reusable character-creation workflow.
- **Owner constraints**: Godot must own game behavior, rendering and the visible game interface. Limited JavaScript for browser integration and development tooling remains acceptable. Existing presentation must match closely, allowing minor renderer differences and the specified new backdrops. Engine versions, architecture, interfaces and test-tool choices belong in technical planning.
- **Deferred behavior**: Native distribution, additional characters or levels, multiplayer, new combat mechanics, accounts, remote telemetry, monetization and other features explicitly deferred by the PRD. Hosting provisioning and publication remain separate work. This feature does not include unrelated ideas from TODOS.md.
- **Provisional tuning**: Preserve existing combat values, movement speeds, timing and encounter composition during migration. Any correction needed to satisfy a current requirement or its player-evaluation criteria must be separately documented and validated; migration alone is not a reason to rebalance.
- **Download allowance**: Retain the 30 MiB game-content budget and inherited 16 MiB per content-file limit. Engine delivery overhead is an explicit exception to the earlier all-inclusive size limits and must be measured separately. Report total compressed download and cached sizes; do not classify game content as engine overhead.

### Baseline and precedence

The implemented reference is commit `58137537a7d4ef992bd27e3fdf7efe92e5e2add1`.
It already includes four characters, the revised controls, role selection, the enlarged
combat view, partner behavior and browser services. Illustrated backdrops remain
unimplemented; historical unchecked tasks and prior passing reports are not proof
of the current implementation or acceptance status.

The current PRD and applicable feature requirements govern documented discrepancies
with that reference. Preserve implemented behavior elsewhere. Maintain a requirement
and acceptance register distinguishing preserved behavior, missing specified behavior,
intentional corrections and outstanding evidence. This rewrite supersedes engine-specific
technical assumptions in earlier plans without removing their applicable product obligations.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Play the complete game with familiar behavior (Priority: P1)

As a player, I can choose my team and complete the level with the same controls,
character abilities, combat rules and retry behavior.

**Why this priority**: Preserving the playable experience is the purpose of the rewrite.

**Independent Test**: Exercise every distinct team pairing and compare representative
combat, progression and result scenarios against the reference game and current
specifications, using equivalent initial conditions and inputs.

**Acceptance Scenarios**:

1. **Given** the four-character roster, **When** selecting any fighter and a different partner, **Then** separate preview and confirmation actions produce the correct team, followed by readiness and one 3–2–1 countdown. Focus alone, scrolling, canceled touches and held-key repeats do not confirm a choice. (PRD FR-001, FR-041–047, FR-054)
2. **Given** equivalent starting conditions and inputs, **When** fighting, **Then** movement, facing, action timing, buffering, hits, damage, cooldowns, protection, meter changes, AI decisions and progression retain their expected outcomes. Simultaneous movement/action touches and cancellation retain the revised control rules. (PRD FR-008–025, FR-038–040, FR-048)
3. **Given** any selected fighter, **When** using Special, **Then** Cow/Crow area attacks, Lion ROAR and Plates Headrest Throw retain their specified eligibility, targeting, effects, interruption, expiry and meter rules. Normal-enemy stun, boss damage, fixed throw aim and no-target handling remain distinct. (PRD FR-014–017, FR-046, FR-051–054)
4. **Given** partner knockout, player knockout or boss defeat, **When** resolving the outcome, **Then** solo continuation, defeat precedence, victory, active-time reporting and best-time replacement remain correct. Every fighter can finish after losing the partner. (PRD FR-003–005, FR-022–023, FR-030, FR-054)
5. **Given** the four-area level, **When** defeating waves, crossing exits or breaking the two room-2 tables, **Then** encounters, enemy roles, both boss phases, progression and single-use healing drops follow their existing rules. Intact tables and partner knockout never block a cleared exit. (PRD FR-026–031)
6. **Given** a result, **When** retrying, **Then** the same duo starts a fully reset run after readiness/countdown; returning home or reloading clears selection. Tutorial prompts remain contextual and respect previously completed prompts. (PRD FR-002, FR-004, FR-006, FR-047; NFR-008)

### User Story 2 - Recognize the complete nightclub journey (Priority: P1)

As a player, I fight through four recognizable settings while retaining clear
characters, threats, controls and exits.

**Why this priority**: The agreed scope includes the previously unimplemented backdrop specification.

**Independent Test**: Inspect each room and its transitions with all character silhouettes
and representative busy encounters, using the existing character art and interface as references.

**Acceptance Scenarios**:

1. **Given** progression through the level, **When** entering successive rooms, **Then** scenery identifies the outside entrance, bar, dance floor and stage/VIP area through the defining features required by feature 008. The prominent entrance agrees with actual onward progression. (PRD FR-056–057; AC-058–059)
2. **Given** the new scenery, **When** moving and fighting, **Then** existing boundaries, encounters, camera angle, connections, table locations and interaction rules remain unchanged. Decoration adds no obstacles, platforms, hazards, pickups or breakables. (PRD FR-026–031, FR-058)
3. **Given** room clearance or final victory, **When** progression resolves, **Then** GO indicates the actual onward route only when appropriate, remains visible until next-room entry and does not survive reset or terminal results. (PRD FR-027–028, FR-050)
4. **Given** supported landscape layouts, muted audio, disabled shake or reduced motion, **When** playing, **Then** existing character identity, animation meaning, camera framing and interface functions remain recognizable; all essential information remains readable, scenery exposes no gaps, and no flashing or strobing occurs. Controls, focus indicators, labels and settings remain accessible. (PRD FR-032–033, FR-037, FR-039, FR-043, FR-045, FR-049, FR-059; NFR-003)
5. **Given** four reviewable room concepts, **When** reviewing the proposed art, **Then** decisions are recorded before final production; final scenery is subsequently reviewed inside gameplay with characters, effects and controls before acceptance. Unresolved reviews remain pending. (PRD FR-060; AC-060)

### User Story 3 - Continue using the mobile browser game reliably (Priority: P1)

As a returning player, I retain my preferences and results and can play through
interruptions, updates and offline sessions.

**Why this priority**: The engine change must preserve access and existing player data.

**Independent Test**: Upgrade an existing browser installation on the same origin,
interrupt preparation/countdown/combat, and complete cached offline runs in browser
and installed modes on both reference phones.

**Acceptance Scenarios**:

1. **Given** valid saved settings, tutorial progress and best time, **When** opening the rewritten game on the same origin, **Then** those values remain available without restoring an unfinished run or selection. (PRD FR-005–006, FR-047; NFR-004, NFR-008)
2. **Given** unavailable or corrupt storage, or rejected audio playback, **When** starting and playing, **Then** gameplay remains available with safe defaults or silent operation. When audio is available, a deliberate interaction enables it, music starts with gameplay, independent volume settings work, and pause/resume/retry never create overlapping music. (PRD FR-034–037; NFR-008)
3. **Given** preparation, countdown or combat, **When** focus is lost, the page is hidden or orientation becomes portrait, **Then** relevant activity and audio pause, inputs clear, active time stops and explicit Resume is required. Remaining countdown and effect durations are preserved. (PRD FR-005, FR-044; NFR-003–004)
4. **Given** successful complete caching, **When** reopening offline, **Then** selection, all rooms, characters, required audio, results and retry work in browser and installed modes where supported. No account, backend session or remote telemetry is required. (PRD FR-047, FR-054, FR-060; NFR-001, NFR-005–006, NFR-009)
5. **Given** failed required loading or incomplete caching, **When** viewing readiness, **Then** actionable retry is available and offline readiness is not falsely claimed. A cache-only failure does not block otherwise loaded online play. (PRD FR-001, FR-060; NFR-006–007)
6. **Given** an available update and multiple open game windows, **When** a duo is preparing, counting down, running or paused, **Then** its current build remains coherent and uninterrupted; updates take effect only at a safe between-run boundary. This also applies when upgrading from the original game. (PRD FR-044, FR-047; NFR-007)
7. **Given** a complete release with intended assets and audio, **When** completing a run on either reference phone, **Then** performance meets the existing target and minimum, controls remain inside safe areas, and repeat selection/run/retry cycles do not progressively degrade play. (PRD NFR-001–003; SC-006)

### User Story 4 - Continue creating and maintaining characters (Priority: P2)

As a maintainer, I can use the existing character-creation workflow with the rewritten game.

**Why this priority**: The reusable workflow is an existing committed deliverable.
P2 denotes implementation order; it is not optional for completion.

**Independent Test**: Validate the four characters and exercise the workflow for Lion
and Plates without altering unrelated assets or expanding the roster.

**Acceptance Scenarios**:

1. **Given** a supported character definition and complete assets, **When** validating and integrating it, **Then** selection, player behavior, partner behavior, presentation and offline availability use the same character identity and values; editable source assets remain usable. (PRD FR-041–043, FR-051, FR-054–055)
2. **Given** invalid definitions, unsupported mechanics, missing animations or conflicting output, **When** using the workflow, **Then** actionable failures are reported, invalid characters do not become ready and unrelated resources remain intact. (PRD FR-051, FR-055)
3. **Given** actual workflow exercises for Lion and Plates, **When** reporting results, **Then** each produces a review record distinguishing verified outputs from outstanding visual, gameplay or device reviews. Historical reports are retained without being relabeled as new-engine validation. (PRD FR-055; AC-057)

### Edge Cases

- Simultaneous lethal player/boss damage produces defeat.
- Canceled, held, repeated, expired or carried-over input cannot trigger unintended actions.
- Late loading results cannot start an abandoned or superseded run or replace its selected duo.
- Pausing freezes countdown, combat effects, projectiles and active-time accounting; returning to landscape does not resume automatically.
- A full-health fighter consumes a healing drink once without exceeding maximum health; partners cannot collect it.
- A run exceeding five minutes continues without a time-based defeat.
- Cache-only failure permits already-loaded online play; missing required visual content blocks entry with retry.
- Cache eviction removes offline availability; the game must not claim readiness from a stale saved flag.
- Updates cannot combine assets from different releases or interrupt old-version game windows.
- Reload clears transient gameplay while retaining valid persistent data; malformed saved values use safe defaults.
- Scenery, intact tables, uncollected drinks and inactive partners cannot block progression.
- Camera travel and wide/narrow landscape layouts cannot expose gaps or imply false exits or accessible decorative platforms.
- Missing physical-device, intended-track, art-review or participant evidence cannot be reported as passed.

## Requirements *(mandatory)*

### Functional Requirements

Feature-local FR identifiers below map to the PRD; they do not replace PRD numbering.

| ID | Requirement | Acceptance mapping |
| --- | --- | --- |
| FR-001 | Deliver the complete current PRD experience through the requested engine migration, accounting for preserved behavior, missing specified behavior and intentional corrections. | All stories; PRD FR-001–060; SC-002 |
| FR-002 | Preserve all twelve ordered distinct duos and selection/readiness/countdown behavior, including input freshness and retained-duo failure retry. | US1.1, US1.6, US3.3, US3.5; PRD FR-001–002, FR-041–047, FR-054 |
| FR-003 | Preserve movement, facing, input arbitration, combat timing, damage, protection and resource rules. | US1.2–3; PRD FR-008–019, FR-038–040 |
| FR-004 | Preserve all four character identities, abilities and role-dependent behavior. | US1.1–4; PRD FR-046, FR-051–054 |
| FR-005 | Preserve partner engagement, visibility, recovery, knockout and solo continuation. | US1.2, US1.4; PRD FR-020–025, FR-048 |
| FR-006 | Preserve encounters, boss phases, tables, pickups, progression, terminal precedence, active timing, contextual tutorials and reset behavior. | US1.4–6; PRD FR-002–007, FR-026–031, FR-047 |
| FR-007 | Match existing character presentation, animation meaning, camera framing, interface behavior and accessibility closely, preserving safe controls, readable feedback, focus behavior and reduced-motion support. | US1.1, US2.2–4; PRD FR-032–033, FR-037, FR-039, FR-043, FR-045, FR-049; NFR-003 |
| FR-008 | Complete all four illustrated settings with the mandatory visual cues, unchanged gameplay space and required concept/in-game reviews of feature 008. | US2.1–5; PRD FR-050, FR-056–060 |
| FR-009 | Retain valid existing preferences, tutorial completion and best results across migration; keep transient run state unsaved and use safe defaults for invalid or unavailable storage. | US3.1–2; PRD FR-005–006, FR-047; NFR-004, NFR-008 |
| FR-010 | Preserve safe interruption, explicit resume, gesture-enabled audio, independent audio settings and nonblocking audio/storage failure. | US3.2–3; PRD FR-034–037, FR-044; NFR-003–004, NFR-008 |
| FR-011 | Preserve optional installation, complete offline replay, truthful readiness, loading/cache retry and coherent updates across existing and rewritten installations. | US3.4–6; PRD FR-047, FR-054, FR-060; NFR-005–007 |
| FR-012 | Preserve the reusable character workflow, validation, editable assets and review records, and exercise it for Lion and Plates with the rewritten game. | US4.1–3; PRD FR-051, FR-055 |
| FR-013 | Remain deployable as a static HTTPS browser game without accounts, backend sessions or remote telemetry, and meet existing supported-device performance and layout requirements. | US3.4, US3.7; PRD NFR-001–003, NFR-005–009 |
| FR-014 | Account for every inherited acceptance obligation and record actual evidence before declaring completion; specification approval or historical evidence must not substitute for release acceptance. | All stories, SC-001–009; constitution I, III and V |
| FR-015 | Retain the agreed game-content limits, identify engine overhead separately and report the complete release's compressed download and cached sizes. Engine exceptions must not hide oversized game content. | Complete-release size review; SC-009; owner clarification; PRD FR-060 |

### Mobile Quality and Validation *(mandatory)*

Automatable rules require test-first regression coverage. Define manual procedures
before implementation and record build, device, OS/browser versions and actual outcomes.
Desktop/browser emulation supplements physical checks; it does not replace them.

| Area and PRD mapping | Automated regression outcomes | Required manual evidence |
| --- | --- | --- |
| Selection, roles, combat and progression: FR-001–031, FR-038–055 | All twelve duos; fresh confirmation; action timing/buffering; hit-once/depth; meter; Special rules; partner behavior; boss phases; tables/pickups; terminal precedence; timers and full retry reset. | All four fighters remain playable and readable; solo-after-partner-loss completion; five-player learning/completion and fighting-style evaluation. |
| Touch, visibility and accessibility: FR-007–019, FR-037, FR-039–045, FR-049–050, FR-059; NFR-003 | Simultaneous/canceled input; focus and keyboard behavior; minimum control sizes; responsive safe-area layout; muted/no-shake/reduced-motion state; GO timing. | Both phones: real multi-touch, thumb reach, focus/labels, all silhouettes, busy telegraphs, room edges and transitions. The combat view retains feature 006's at-least-90% available landscape width/height coverage. |
| Scenery and presentation: FR-032–033, FR-056–060 | Four correct identities/order/reset; unchanged boundaries/waves/tables; all required resources; transition coverage and no new gameplay interactions. | Four concepts before final production, then in-game views; defining cues, quiet combat floor, rightward entrance, table distinction and no false platforms; five-player setting recognition. |
| Lifecycle: FR-005, FR-044, FR-047; NFR-003–004 | Preparation/countdown/combat interruptions; fresh inputs; frozen active time/effects; explicit resume; late-load rejection; reload clears the run. | Background/focus changes and portrait rotation at each countdown numeral, during Specials and during room transitions on both phones. |
| Audio, loading and persistence: FR-034–037, FR-047; NFR-007–008 | Existing saved-data compatibility; missing/corrupt/denied storage; independent volumes; no overlapping music; nonblocking audio failure; load/cache failure and retry. | Real gesture activation, soundtrack looping, pause/resume/retry, effects and muted play with intended audio; returning-player upgrade retains valid data. |
| Offline and updates: FR-047, FR-054, FR-060; NFR-005–009 | Complete cache verification, missing/corrupt content, repair, offline selection/results/retry and coherent multi-window updates from old and new releases. | Full cached offline runs with all room/character/audio content on both phones, browser and installed modes where supported; update during preparing/countdown/running/paused sessions. |
| Performance and delivery: FR-060; NFR-001–002, NFR-005–009 | Complete-release content limits and engine allowance; no omitted resources or release test controls; diagnostics without remote telemetry. | Full-run frame timing with intended soundtrack and busiest encounters: 60 fps target, at least 30 fps minimum; repeat lifecycle cycles and record visible stalls, download and cache sizes. |
| Character workflow: FR-051, FR-055 | Definitions/assets/animations agree; incomplete inputs and unsupported mechanics fail clearly; unrelated resources survive. | Actual Lion and Plates workflow exercises and playable review reports for the rewritten game. |

Retain all PRD SC-001–011 five-player and acceptance criteria: learning, completion,
successful duration, separate responsiveness/readability ratings, four-action
demonstration, role understanding, exit direction, fighting-style differentiation
and setting recognition. Passing automated checks alone is not full acceptance.

### Key Entities

- **Character definition**: Identity, playable capabilities, partner capabilities and presentation references, shared by selection and gameplay.
- **Run**: Selected duo, combat state, encounters, objects, progression, active duration and result.
- **Player preferences and records**: Audio levels, shake preference, tutorial completion and best successful duration.
- **Room presentation**: Setting identity, defining landmarks, decorative regions and onward-route relationship.
- **Playable release**: A coherent set of required content with readiness, size and update status.
- **Acceptance record**: Requirement, scenario, observed outcome, build/device context and outstanding dependencies.
- **Character-creation record**: Brief, supported capabilities, produced or validated assets, integration results and actual review evidence.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All twelve distinct duos pass selection, countdown, role-correct gameplay, result handling and full retry reset; each of the four fighters can complete after partner loss.
- **SC-002**: Every applicable current PRD/feature acceptance scenario is mapped to evidence. Every behavior-comparison scenario retains its expected outcome or has a documented correction tied to a current requirement; no unexplained functional difference remains.
- **SC-003**: Valid existing preferences, tutorial records and best times survive upgrade in every defined persistence scenario; every defined invalid/unavailable-storage scenario remains playable.
- **SC-004**: Complete cached runs, results and retries succeed on both reference phones in browser and installed modes where supported, with every required setting, character and audio resource available and no mid-session update.
- **SC-005**: Both reference phones target 60 fps and sustain at least 30 fps in the busiest encounter during complete runs with intended assets and soundtrack.
- **SC-006**: All four settings pass concept and in-game review; at least four of five testers identify every setting without location labels or coaching.
- **SC-007**: All inherited PRD SC-001–011 thresholds pass, including at least four of five players completing within three attempts, recording a first successful 3–5 minute run and rating responsiveness and readability separately at least 4/5.
- **SC-008**: Actual character-workflow exercises for Lion and Plates produce two validated output/review records without unintended changes to unrelated resources.
- **SC-009**: Shipped game content remains at most 30 MiB with no content file above 16 MiB; every release size report separately identifies engine overhead, total compressed download and complete cached size.

## Assumptions

- Latest committed product requirements resolve conflicts with historical specifications; existing behavior remains the baseline elsewhere. Historical technical task paths are not additional product requirements.
- Minor renderer differences are acceptable; visual redesign beyond the specified backdrops is excluded. Existing character assets and identities are reused.
- Engine, language, testing and packaging choices discussed during planning must be recorded in the technical plan, not treated as new player-facing requirements.
- Initial caching requires connectivity, and offline availability depends on retained browser data. No first-visit offline guarantee is implied.
- Existing player-data preservation assumes the same browser origin. No account synchronization or cross-origin data transfer is added.
- Intended soundtrack confirmation, visual reviews, reference devices and five participants are acceptance dependencies. Missing evidence remains pending.
- The engine-overhead allowance is authorized; content limits and performance obligations remain. Existing technical budgets not explicitly revised remain planning constraints.
- Work proceeds on a feature branch with test-first implementation. Documentation-only specification validation neither requires new runtime tests nor marks inherited acceptance tasks complete.

## Owner cutover amendment — 2026-10-14

The owner explicitly instructed “waive manual acceptance gates and proceed with cutover”.
For this feature, missing phone smoke/platform/performance/installed/offline/update
measurements and five-first-time-player evaluation are closed as **waived/unverified**,
with their original criteria preserved for future evaluation. They need not block
retirement of the JS reference runtime. Automated replacement coverage, exact parity,
all remaining suites, release smoke, size/resource/engine audits and truthful records
remain required. Final auditing may accept the four documented manual waiver categories
only when the owner decision and evidence references match the actual release.
See [the exact exception](validation/manual-waiver.md) and [cutover](validation/cutover.md).
This amendment does not assert that unperformed measurements passed.
