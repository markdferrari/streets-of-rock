# Tasks: Choose Your Fighter

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [UI contract](contracts/selection-ui.md), [runtime contract](contracts/runtime.md), and [quickstart.md](quickstart.md).

**Branch**: `005-choose-your-fighter`

**Tests**: TDD is mandatory. Write each behavior's tests, run them and observe the expected failure before implementing that behavior; then refactor with passing tests. Record red/green commands in `specs/005-choose-your-fighter/validation.md`. Documentation tasks receive consistency review. Use Bun and existing pinned dependencies. All existing suites must pass before any conventional commit.

**Format**: `- [ ] Tnnn [P?] [USn?] Description with exact paths`. `[P]` means different files can be worked on together after the stated phase prerequisites; it never overrides test-first dependencies. Unmarked tasks run sequentially. Paths are repository-relative. Newly named source/test files are intended additions.

**Traceability**: `FR` and `SC` without a prefix refer to feature 005. `PRD` identifies baseline requirements. Story scenario numbers refer to spec.md. All tasks start unchecked; generating this list does not implement or verify runtime behavior.

## Phase 1: Setup

Preserve prior uncommitted specification/design changes. Do not create another feature or upgrade dependencies.

### Preparation

- [X] T001 Confirm the feature branch and pinned toolchain, run the existing TypeScript/Vitest/Playwright/Blender baseline commands from `specs/005-choose-your-fighter/quickstart.md`, and record actual results and pre-existing failures in `specs/005-choose-your-fighter/validation.md`; do not report missing tools as passing.
- [X] T002 Create the requirement/scenario evidence matrix and manual procedures in `specs/005-choose-your-fighter/validation.md` using `specs/005-choose-your-fighter/quickstart.md`; identify owner-track, device, and five-player dependencies as pending, and record full-build budgets and test-first workflow (FR-001–014; SC-001–006).

## Phase 2: Foundational — Shared roster and contracts

Blocking prerequisites for all stories. Keep content pure and preserve the existing gameplay entry while adding these shared definitions.

### Tests first

- [X] T003 [P] Write and run failing registry/profile tests in `tests/unit/content/characters.test.ts` for unique IDs, two-entry minimum, known asset keys, finite positive tuning, the fixed stat scales, both profiles, and a twelve-entry injected fixture (FR-003, FR-009, FR-012).
- [X] T004 [P] Write and run failing duo-validation tests in `tests/unit/game/duo.test.ts` for unknown or duplicate identities, readonly confirmed assignment, and both valid Cow/Crow combinations (FR-004, FR-009).

### Implementation

- [X] T005 Add `src/content/characters.ts` with pure CharacterId/CharacterDefinition profiles, validateRoster, playable-stat derivation, shared scale endpoints, and exact provisional values from `specs/005-choose-your-fighter/data-model.md`; keep existing Cow tuning authoritative rather than duplicating divergent constants (FR-003, FR-009, FR-012).
- [X] T006 Add DuoAssignment and validateDuo in `src/game/duo.ts`, and an injectable twelve-entry navigation fixture in `tests/fixtures/roster.ts`; reject unknown/duplicate assignments and keep fixture content out of production (FR-004, FR-009, FR-012).

## Phase 3: US1 — Inspect and choose a fighter (P1)

**Goal**: Deliver the first independently demonstrable homepage increment.

**Independent test**: On a fresh page preview both fighters, inspect accurate bars/animated full bodies, then confirm either into the partner-selection boundary without launching gameplay (US1 scenarios 1–4).

### Tests first

- [X] T007 [P] [US1] Write and run failing fighter-step reducer tests in `tests/unit/app/selection.test.ts` for empty initial preview, focus without selection, preview switching, and second-activation confirmation emitting only one transition (FR-001–003, FR-006).
- [X] T008 [P] [US1] Write and run failing portrait-export tests in `tests/blender/test_portraits.py` for two 512×512 images from approved source models, framing configuration, reproducibility, and overwrite protection (FR-001, FR-003, FR-013).
- [X] T009 [P] [US1] Write and run failing tests in `tests/unit/presentation/character-preview.test.ts` and `tests/unit/presentation/character-assets.test.ts` for registry asset resolution, load failure/retry, stale preview completion, independent cloned Idle poses, and disposal preserving shared template resources (FR-003, FR-013).
- [X] T010 [P] [US1] Write and run failing browser tests in `tests/e2e/fighter-selection.spec.ts` for named tiles, exact stat values, confirmation instructions, visible focus, click/tap/Enter/Space equivalence, held-key suppression, and preview-loading failure blocking confirmation (FR-001–003, FR-006).

### Implementation

- [X] T011 [US1] Implement fighter-step state and pure events in `src/app/selection.ts`, separating focused/previewed/confirmed identities and emitting the partner-step transition only after a fresh activation of the ready preview (FR-001–003, FR-006).
- [X] T012 [US1] Extend `scripts/blender/render.py` to render head/shoulders portraits from existing approved sources and generate `assets/characters/cow-crow/portraits/cow.png` and `assets/characters/cow-crow/portraits/crow.png`; preserve existing render modes and overwrite safeguards (FR-001, FR-003, FR-013).
- [X] T013 [US1] Extend `src/presentation/character-assets.ts` for registry asset keys and retryable loading, then add `src/presentation/character-preview.ts` with one canvas, Idle full-body framing, generation guards and template-safe disposal; retain current gameplay clip requirements until US3 extends them (FR-003, FR-013).
- [X] T014 [US1] Add `src/ui/selection.ts` and roster styles in `src/ui/styles.css` with names, stat meters, preview host, arcade typography/frames, two-entry layout and confirmation instruction; add canonical click/keyboard activation and roving focus in `src/input/selection.ts` without double handling synthetic clicks (FR-001–003, FR-006, FR-013).
- [X] T015 [US1] Wire selection into `src/app/session.ts` and `src/app/game-app.ts` as the authoritative homepage state, replacing Start; make GameApp render session snapshots, preserve preview during errors, block confirmation until preview ready, and hand confirmed identity to the partner-step boundary (FR-001–003, FR-006).
- [X] T016 [US1] Run US1 automated and Blender tests and inspect both previews in a browser; record outcomes and any outstanding phone evidence in `specs/005-choose-your-fighter/validation.md`. Confirm no active run is created by merely browsing or confirming the fighter (FR-001–003, FR-006, FR-013).

## Phase 4: US2 — Form a valid duo and revise it (P1)

**Prerequisite**: US1.

**Goal**: Complete distinct AI-partner selection and Back.

**Independent test**: Start from either confirmed fighter; preview/confirm the other, verify duplicate prevention and AI wording, and use Back to revise the fighter (US2 scenarios 1–4). A controlled preparation adapter can capture the locked duo before US3 supplies real launch.

### Tests first

- [X] T017 [P] [US2] Add and run failing partner reducer tests in `tests/unit/app/selection.test.ts` for no automatic partner preview, unavailable fighter activation, exactly two partner activations, changed partner previews, Back clearing confirmation, and duplicate/unknown rejection (FR-002, FR-004–005).
- [X] T018 [P] [US2] Write and run failing browser tests in `tests/e2e/partner-selection.spec.ts` for AI explanation, retained fighter identity, unavailable “Your Fighter” tile, eligible focus, Back/reconfirmation, one valid candidate, and no cross-step input carryover (FR-002, FR-004–006).

### Implementation

- [X] T019 [US2] Complete partner transitions and Back in `src/app/selection.ts`; emit one validated immutable DuoAssignment, reset preview on entering partner selection, restore former fighter as unconfirmed preview on Back, and ignore activation after lock (FR-002, FR-004–005).
- [X] T020 [US2] Extend `src/ui/selection.ts` and `src/input/selection.ts` with AI-role explanation, confirmed fighter summary, disabled labelled tile, Back/focus restoration, and separate activation per step; confirm stats describe the playable profile (FR-003–006).
- [X] T021 [US2] Connect confirmed duo and preparation boundary in `src/app/session.ts` and `src/app/game-app.ts`, clearing active gestures/held keys and retaining both identities; use the existing prepared-state contract without auto-launching an incomplete run (FR-004–008).
- [X] T022 [US2] Run both-duo and Back journeys and record independent US2 outcomes in `specs/005-choose-your-fighter/validation.md`; verify that a two-character roster never bypasses partner inspection or allows duplicates (FR-002, FR-004–006).

## Phase 5: US3 — Enter and replay with chosen roles (P1)

**Prerequisite**: US2.

**Goal**: Implement actual role-correct gameplay, preparation, interrupted countdown and retry.

**Independent test**: Both assignments enter through readiness and 3–2–1, receive correct controls/AI/HUD, handle partner/player knockout and lethal ties, and retry with a fresh run of the same duo (US3 scenarios 1–7).

### Tests first

- [X] T023 [P] [US3] Write and run failing both-duo actor/action tests in `tests/unit/game/run.test.ts`, `tests/unit/game/combat.test.ts`, and `tests/unit/game/step.test.ts` for identity versus role, four player actions, semantic moves, profile damage, meter/protection, full reset and existing Cow numeric regressions (FR-009–011).
- [X] T024 [P] [US3] Write and run failing role-based regression cases in `tests/unit/game/crow.test.ts`, `tests/unit/game/enemies.test.ts`, `tests/unit/game/level.test.ts`, and `tests/unit/presentation/camera.test.ts` for partner target/follow/recovery, enemy player targeting, pickups/tables, progression, solo victory and defeat precedence (FR-009–011).
- [X] T025 [P] [US3] Write and run failing fake-clock tests in `tests/unit/app/countdown.test.ts` for each 1000-ms boundary, 400/600-ms interrupted fractions, explicit resume, no hidden time, frame-stall numeral retention and one-shot completion (FR-007–008; SC-003).
- [X] T026 [P] [US3] Write and run failing tests in `tests/integration/app/session.test.ts` for production session ownership, readiness before countdown, stale generation results, loading interruption latch, error retry retaining duo, zero run time/ticks before launch, and full retry/homepage reset (FR-007–008, FR-011).
- [X] T027 [P] [US3] Extend and run failing coverage in `tests/blender/test_rig_export.py` and `tests/unit/presentation/character-animation.test.ts` for Crow Dodge and every player phase, Cow support mapping, semantic Special poses, and required-clip validation (FR-009–010, FR-013).
- [X] T028 [P] [US3] Extend and run failing tests in `tests/integration/ui/combat-ui.test.ts` for selected names, player meter/cooldown, partner knockout, role-correct tutorial cues and result actions; add browser readiness/interruption/retry cases in `tests/e2e/countdown.spec.ts` (FR-007–011).

### Implementation

- [X] T029 [US3] Migrate `src/game/types.ts`, `src/content/types.ts`, `src/game/run.ts`, `src/content/tuning.ts`, and `tests/fixtures/run.ts` to PlayerState/PartnerState plus characterId, required duo construction, semantic moves and profile tuning; add `src/game/selectors.ts` and update callers atomically to preserve type safety (FR-009–011).
- [X] T030 [US3] Generalize `src/game/actions.ts`, `src/game/movement.ts`, `src/game/damage.ts`, `src/game/projectiles.ts`, `src/game/collision.ts`, and `src/game/pickups.ts` to role selectors/profile moves, preserving attack order, buffering, protection, radial Special, knockback, meter and player-only healing/table rules (FR-009–010).
- [X] T031 [US3] Generalize `src/game/ai/crow.ts` into `src/game/ai/partner.ts`, migrate player targeting in `src/game/ai/grunt.ts`, `src/game/ai/zoner.ts`, `src/game/ai/enforcer.ts`, and `src/game/ai/liam.ts`, and update `src/game/step.ts`/`src/game/encounters.ts`; retain support direct-hit ordering and solo/tie rules (FR-009–010).
- [X] T032 [US3] Extend `scripts/blender/rig_export.py` with Crow player clips/Dodge, regenerate `assets/characters/cow-crow/runtime/cow.glb`, `assets/characters/cow-crow/runtime/crow.glb` and their rigged .blend sources, then validate semantic mappings in `src/presentation/character-animation.ts` and `src/presentation/character-assets.ts` before readiness (FR-007, FR-009–010).
- [X] T033 [US3] Migrate `src/presentation/scene.ts`, `src/presentation/actors.ts`, `src/presentation/camera.ts`, `src/presentation/effects.ts`, `src/ui/combat.ts`, and `src/ui/tutorial.ts` to role-correct behavior with identity-specific models/clips; rename support events and preserve Cow Bovine Spin/Crow Wing Spin presentation (FR-009–010).
- [X] T034 [US3] Implement `src/app/countdown.ts` with an injected monotonic clock and numeral-preserving pause/stall rules, then complete `src/app/session.ts` preparation/countdown/running/result/error transitions, generation tokens, resume targets and retained-duo retry (FR-007–008, FR-011).
- [X] T035 [US3] Replace remaining independent screen mutations in `src/app/game-app.ts` with RunSession effects; dispose preview before constructing/rendering the unstepped gameplay scene, signal matching-generation readiness, clear all inputs/loop/clock state at launch, and handle blur/visibility/orientation and WebGL failure (FR-007–008, FR-011).
- [X] T036 [US3] Add locked-duo portraits, honest stage progress, retryable errors, countdown/status announcements and explicit Resume in `src/ui/selection.ts`/`src/ui/screens.ts`; retain identities through errors and retry and clear them on homepage/reload (FR-007–008, FR-011).
- [X] T037 [US3] Add full two-activation-per-role journey helpers in `tests/e2e/helpers/selection.ts`; migrate `tests/e2e/level.spec.ts`, `tests/e2e/characters.spec.ts`, `tests/e2e/touch-combat.spec.ts`, and role-based test hooks in `src/app/game-app.ts` to both duos without bypassing selection/countdown (FR-007–011).
- [X] T038 [US3] Run both-role combat/session/browser/Blender regressions and record all US3 scenario outcomes in `specs/005-choose-your-fighter/validation.md`, including correct stats, partner-loss solo continuation, no stale async launch and exactly one run per confirmation (FR-007–011; SC-002–003).

## Phase 6: US4 — Select across devices and replay offline (P2, required)

**Prerequisite**: US3 for end-to-end completion. Isolated test tasks may be prepared earlier after foundation with no edits to shared story files.

**Goal**: Complete responsive/reduced-motion input and missing settings/audio/offline/update prerequisites.

**Independent test**: Browse two/twelve-entry rosters with each input mode; repeat with reduced motion and unavailable storage/audio; cache and relaunch both duos through full runs/results/retry without networking (US4 scenarios 1–4).

### Tests first

- [X] T039 [P] [US4] Write and run failing tests in `tests/e2e/selection-accessibility.spec.ts` for two/twelve-entry grid navigation, safe areas, 44-px controls, scroll/drag/cancel suppression, focus restoration, portrait blocking and dynamic reduced motion; keep fixture roster test-only (FR-006, FR-012–013).
- [X] T040 [P] [US4] Write and run failing tests in `tests/unit/platform/settings.test.ts` for versioned defaults, per-field validation and denied storage, plus `tests/e2e/settings.spec.ts` for homepage/pause modal focus, persistence and no selection/countdown side effects (FR-001, FR-014).
- [X] T041 [P] [US4] Write and run failing tests in `tests/unit/platform/audio.test.ts` for synchronous gesture unlock, rejected playback, independent volumes, pause/resume, single-instance retry and no audible countdown; test nonblocking browser audio failure in `tests/e2e/audio.spec.ts` (FR-014).
- [X] T042 [P] [US4] Write and run failing coverage in `tests/unit/platform/pwa.test.ts` and `tests/e2e/offline.spec.ts` for current-build cache readiness, full offline duo flow, cache failures, media 200/206/416, two-tab/two-build natural worker waiting and no forced refresh (FR-014; SC-005).
- [X] T043 [P] [US4] Write and run failing tests in `tests/unit/platform/build-audit.test.ts` using temporary build/inventory fixtures for omitted precache assets, missing required clips, byte budgets, absent final-track evidence and production test-hook/fixture exclusion (FR-014; PRD NFR-006–007).

### Implementation

- [X] T044 [US4] Complete `src/ui/styles.css`, `src/input/selection.ts`, and `src/presentation/character-preview.ts` for responsive scrolling/grid focus, 8-px drag threshold, touch-action override, safe areas, 44-px controls, reduced-motion still Idle and suspension when hidden/unfocused/portrait/settings-covered (FR-006, FR-012–013).
- [X] T045 [US4] Add `src/platform/settings.ts` and `src/ui/settings.ts`, wiring homepage/pause controls in `src/app/game-app.ts` for music/effects/shake, validated sor.settings.v1 defaults, focus restoration and live preferences without changing existing tutorial/best-result keys or persisting selections (FR-001, FR-014).
- [X] T046 [US4] Add `src/platform/audio.ts` and bundled development music/SFX in `public/assets/audio/`; connect gesture unlock, silent preparation, audible run entry, pause/resume, volumes and single-instance retry in `src/app/game-app.ts`, with catch-and-continue behavior for denied/unavailable playback (FR-014; PRD FR-034–037).
- [X] T047 [US4] Configure injectManifest in `vite.config.ts`, add `src/sw.ts` and `src/platform/pwa.ts`, register through `src/main.ts`, and add manifest/icons in `public/assets/icons/`; precache the complete versioned build with range-aware audio, no skipWaiting/clientsClaim and no forced reload (FR-014).
- [X] T048 [US4] Add required asset inventory generation in `scripts/build-asset-inventory.ts`, replace the placeholder checks in `scripts/audit-build.ts`, and integrate commands in `package.json`; verify all shipped assets/revisions, actual precache entries, clip coverage, 16-MiB per-file/30-MiB total budgets and production hook exclusion (FR-014).
- [X] T049 [US4] Wire current-build cache verification and waiting-update status into `src/platform/pwa.ts`, `src/app/game-app.ts`, and `src/ui/screens.ts`; distinguish runtime readiness from complete offline readiness and show close-all-windows update instructions only at homepage/results (FR-007, FR-014).
- [ ] T050 [US4] Run US4 browser/unit/audit scenarios and record storage/audio failure, all input modes, full cached duo journeys and two-tab update results in `specs/005-choose-your-fighter/validation.md`; retain physical-device and intended-track checks as pending until performed (FR-001, FR-006, FR-012–014; SC-004–005).

## Phase 7: Polish and Cross-Cutting Acceptance

All four stories must be implemented before final acceptance. Missing soundtrack/device/player evidence remains visibly incomplete, while independent engineering tasks continue.

### Evidence and final gates

- [X] T051 Write and run failing tests in `tests/unit/platform/diagnostics.test.ts` for phase/encounter frame sampling, hidden/paused exclusion, rolling FPS and local export without production hooks; implement the diagnostic adapter in `src/platform/diagnostics.ts` and integrate `src/app/game-app.ts` under VITE_DIAGNOSTICS only (SC-006).
- [ ] T052 Package the intended owner-supplied soundtrack in `public/assets/audio/`, replacing any identified development placeholder, rebuild its inventory and record provenance/codec/duration in `specs/005-choose-your-fighter/validation.md`; leave this task unchecked if the intended track is unavailable (FR-014; PRD FR-034).
- [ ] T053 Execute the selection, interruption, muted/no-shake, reduced-motion, gesture-audio and both-role animation procedures from `specs/005-choose-your-fighter/quickstart.md` on iPhone 12/Safari and Pixel 6/Chrome; record exact browser/OS and scenario results in `specs/005-choose-your-fighter/validation.md` (FR-001–014).
- [ ] T054 Verify complete cached relaunch/full runs/results/retry with both duos, intended soundtrack, installed mode where supported and safe waiting updates on both phones; record build identity and inventory evidence in `specs/005-choose-your-fighter/validation.md` (SC-005; PRD NFR-005–009).
- [ ] T055 Measure both fighters through full soundtrack-inclusive runs on both phones using diagnostics, including busiest-encounter rolling FPS, longest frames, draw/triangle counts and ten selection/run/retry cycles; record evidence in `specs/005-choose-your-fighter/validation.md` against 60-fps target and 30-fps minimum (SC-006).
- [ ] T056 Conduct the five-player protocol in `specs/005-choose-your-fighter/quickstart.md`, recording intended duo, uncoached completion, AI-role identification and existing combat evaluation outcomes in `specs/005-choose-your-fighter/validation.md`; meet 4-of-5 selection/understanding thresholds and retain all PRD evaluation gates (SC-001; PRD SC-001–008).
- [X] T057 Reconcile every feature requirement/scenario against evidence in `specs/005-choose-your-fighter/validation.md`; run typecheck, all Vitest/integration/Playwright/Blender suites, production build, enhanced audit and git diff --check; update `specs/005-choose-your-fighter/checklists/requirements.md` only for justified specification changes and retain pending evidence before any conventional commit (FR-001–014; SC-001–006).

## Dependencies and Execution Order

```text
Setup → Foundation → US1 → US2 → US3 → US4 → Final acceptance
                       fighter  partner  playable  complete mobile/offline flow
```

The user journey creates real story dependencies; do not treat US2/US3 as independent production branches. Each story has its own independently executable test with the prerequisites above. Pure tests can use prepared state; full browser acceptance must traverse the actual UI.

- Foundation tests precede registry/duo implementation; no story begins before both are green.
- Within each story, all listed test tasks precede corresponding implementation; run only the relevant failing suites while working, then the story's full regression set at its checkpoint. Do not disable old tests to make the new flow appear green.
- US1 produces a usable preview/confirmation increment. US2 completes selection into a controlled preparation boundary. US3 implements that boundary and migrates every role-dependent runtime/test consumer. US4 supplies mandatory platform acceptance prerequisites.
- All implementation tasks touching `src/app/game-app.ts`, `src/app/session.ts`, shared UI/styles or content/types run sequentially. No `[P]` label authorizes simultaneous edits to those files.
- US3 actor/type migration may temporarily require consumer updates in the same working increment; finish the subsequent combat/AI/presentation migrations before claiming the whole app typechecks. Preserve failing tests and avoid commits at an intentionally incomplete type migration.
- Diagnostics must exist before performance measurement. Intended soundtrack must be packaged before final audio/offline/performance acceptance. The documentation of unavailable devices/participants does not complete their tasks.

## Parallel Execution Examples

Only test tasks with `[P]` are marked as independent file work. Each group runs after its phase prerequisite and before implementation; shared evidence updates are consolidated by one executor. These are scheduling opportunities, not a requirement to spawn agents.

- **US1**: T007, T008, T009, T010 can prepare and run their independent failing suites concurrently.
- **US2**: T017, T018 can prepare and run their independent failing suites concurrently.
- **US3**: T023, T024, T025, T026, T027, T028 can prepare and run their independent failing suites concurrently.
- **US4**: T039, T040, T041, T042, T043 can prepare and run their independent failing suites concurrently.

## Requirement Coverage

| Feature requirements | Primary story / evidence |
| --- | --- |
| FR-001–003 | US1 fighter preview; US4 settings; registry tests and US1 scenarios 1–4 |
| FR-004–005 | US2 distinct partner, Back and reconfirmation; all US2 scenarios |
| FR-006 | US1/US2 activation plus US4 responsive input; keyboard/touch cancellation and focus |
| FR-007–008 | US3 preparation/countdown/lifecycle; US3 scenarios 1–2/6–7 and fake-clock boundaries |
| FR-009–011 | US3 both-role simulation/presentation and retry; US3 scenarios 3–5 |
| FR-012–013 | US1 portraits/previews plus US4 roster growth/reduced motion; US4 scenarios 1–2 |
| FR-014 | US4 audio/settings/offline/update adapters; US4 scenarios 3–4 and final device evidence |
| SC-001–006 | Five-player selection, both-duo regressions, countdown, roster accessibility, offline phone runs, and frame evidence respectively |

## Implementation Strategy

The smallest demonstration is **US1** after setup/foundation: inspect and confirm either fighter. It is a homepage increment, not a playable or accepted game. The smallest new playable journey is **US1–US3**. Full feature/MVP acceptance requires **US4 and all final gates**, including real devices and the five-player evaluation.

Deliver and validate each story increment in order. Keep no new production roster entries beyond Cow/Crow, no unique movesets, no backend or native packaging. Use `data-model.md` for exact provisional tuning and `contracts/` for behavior; do not invent competing defaults. If acceptance exposes a defect, add its failing regression before correction and update the relevant evidence. Only commit on the feature branch using conventional messages after all existing suites pass; committing or deployment is not required to complete task generation.
