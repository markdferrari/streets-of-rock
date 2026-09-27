# Tasks: Visible Joystick and Four-Button Combat

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [controls contract](contracts/controls.md), and [quickstart.md](quickstart.md).

**Branch at generation**: `002-implement` (feature branch; the plan records the earlier `feat/revised_controls` branch). Before a code or documentation commit, verify the active branch is not `main`.

**Tests**: The constitution and `AGENTS.md` require test-first implementation. For every automatable change, write a meaningful failing test, observe the expected failure, implement, then run the affected tests and the full suite before committing. Documentation changes receive a consistency review. Reference-phone, offline, performance, and five-player observations are separate acceptance evidence.

**Organization**: Phases follow the three P1 user stories in the feature spec. Tasks cite feature acceptance scenarios (`CTRL-AC-*`) and PRD requirements. Existing MVP work remains in `specs/001-neon-velvet-mvp/tasks.md`; this feature replaces only its old control behavior. A completed story is an independently demonstrable increment, not full MVP acceptance.

## Phase 1: Setup (Existing Project Baseline)

**Purpose**: Confirm branch and repair the known browser regression so milestone commits can satisfy the repository gate.

- [X] T001 Record the active feature branch, clean/dirty state, pinned Bun/package versions, and current test baseline in specs/002-revised-controls/validation/baseline.md; do not work or commit on `main` (AGENTS.md).
- [X] T002 Reproduce and diagnose the old `Dodge attacks` and `Special 10%` failures in tests/e2e/touch-combat.spec.ts using the current full-level opening; repair scenario setup and assertions so they prove intended tutorial/meter behavior, preserving real failures (FR-006, FR-014; MVP AC-001, AC-006).
- [X] T003 Run `bun run typecheck`, `PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test`, and `bun run build`; record outputs in specs/002-revised-controls/validation/baseline.md and require a fully passing suite before the first conventional milestone commit (AGENTS.md, constitution III).
- [X] T004 Update the superseded joystick, `InputFrame`, and Playing-control clauses in specs/001-neon-velvet-mvp/contracts/runtime.md to point to specs/002-revised-controls/contracts/controls.md, and annotate affected completed MVP control tasks in specs/001-neon-velvet-mvp/tasks.md as historical without erasing unrelated unfinished MVP tasks (FR-009, FR-038–040).

**Checkpoint**: Baseline tests pass, documentation points to the revised control contract, and the active branch is safe for implementation.

---

## Phase 2: Foundational (Shared Test and Evidence Boundaries)

**Purpose**: Make manual and automated acceptance repeatable before visual or gameplay changes.

- [X] T005 Define the phone evidence form in specs/002-revised-controls/validation/device-procedure.md before control UI changes: iPhone 12 Safari/Pixel 6 Chrome versions, landscape safe areas, 568×320 CSS-pixel layout, two-thumb reach, warning visibility, mute/no-shake, lost touches, explicit Resume, and installed-mode checks (FR-037, FR-039–040; NFR-001–004; CTRL-AC-012–013).
- [X] T006 Define the full-run frame timing, stall, offline, and five-player evidence form in specs/002-revised-controls/validation/acceptance-procedure.md before implementation: target 60 fps/minimum 30 fps, four-action demonstration timing, SC-001–007, 3–5 minute successful runs, solo victory, and dependencies on unfinished MVP audio/PWA work (NFR-002, NFR-005–009; SC-001–007).

**Checkpoint**: Manual acceptance procedures are written before work on control appearance or behavior; no device result is claimed yet.

---

## Phase 3: User Story 1 — Recognize and Operate Movement Immediately (Priority: P1) 🎯 First validation increment

**Goal**: Show a fixed joystick and labelled four-button diamond from the first active frame; movement remains precise and independent of action/HUD touches.

**Independent Test**: Start one encounter on a supported landscape viewport, move from the visible ring, cross the deadzone and ring edge, release/cancel, and confirm Cow stops while the four labels and central combat remain visible (CTRL-AC-001–004).

### Tests first — observe the expected failure

- [ ] T007 [P] [US1] Write and observe failing fixed-centre, inside-ring ownership, deadzone, capped drag, second-finger, release/cancel, and HUD-precedence tests in tests/integration/input/pointers.test.ts (FR-008–011; CTRL-AC-002–004).
- [ ] T008 [P] [US1] Write and observe failing browser checks for the initially visible ring/centred knob, fixed anchor, labelled diamond order, and safe-area visibility at 568×320 in tests/e2e/touch-combat.spec.ts (FR-009, FR-039; CTRL-AC-001–003).

### Implementation

- [ ] T009 [US1] Replace the floating anchor with a fixed rendered-ring centre and clamped knob/movement vector in src/input/pointers.ts; allow ownership only for a down inside the ring, keep independent action fingers, and pass T007 (FR-009–010; CTRL-AC-002–003).
- [ ] T010 [US1] Add the persistent ring and inner knob plus four labelled diamond buttons in src/app/game-app.ts and src/ui/styles.css; use safe-area insets and preserve a central warning corridor at the existing lower landscape size (FR-039; CTRL-AC-001, CTRL-AC-012).
- [ ] T011 [US1] Connect ring hit testing, geometry updates after resize, HUD precedence, and knob rendering in src/app/game-app.ts and src/input/frame.ts; clear ownership before invalid geometry is reused and pass T008 without changing combat resolution yet (FR-009–011, FR-040; CTRL-AC-001–004).
- [ ] T012 [US1] Run affected tests and the full `bun run test`/`bun run build` gate, record the movement increment and remaining phone checks in specs/002-revised-controls/validation/us1-results.md, then make a conventional milestone commit only if all tests pass (CTRL-AC-001–004; AGENTS.md).

**Checkpoint**: The visible joystick works in one encounter. Four labels are present for layout validation; the controls are ready for a player-facing demo after US2 makes Heavy functional.

---

## Phase 4: User Story 2 — Choose Between Quick and Committed Attacks (Priority: P1)

**Goal**: Keep the Light combo, add a single slower/stronger Heavy strike, make ordered touch requests deterministic, and teach Heavy independently to returning players.

**Independent Test**: In a controlled encounter with an enemy and table, compare three Light hits with Heavy, verify range/depth, recovery, combo reset, meter/table effects, buffering and tutorial persistence (CTRL-AC-005–009).

### Tests first — observe each expected failure before its implementation

- [ ] T013 [P] [US2] Write failing pure-game tests for Heavy windup/active/recovery, greater per-hit damage than each Light strike, one strike, knockback, no cost/invulnerability/cancel, and combo reset only when Heavy starts in tests/unit/game/combat.test.ts (FR-012, FR-038; CTRL-AC-005–006).
- [ ] T014 [US2] Write failing hit/table tests for Heavy range, depth, one hit per target, two VIP table drops, enemy-only meter gain, full-meter cap, and Spin not refilling in tests/unit/game/level.test.ts and tests/unit/game/combat.test.ts (FR-014, FR-016, FR-031, FR-038; CTRL-AC-007).
- [ ] T015 [P] [US2] Write failing ordered-request tests in tests/integration/input/pointers.test.ts for one request per down, held/sliding fingers, source IDs, normal release versus cancellation, same-sample priority, and independent movement (FR-010, FR-040; CTRL-AC-005, CTRL-AC-008).
- [ ] T016 [US2] Write failing deterministic buffer tests in tests/unit/game/combat.test.ts for one latest eligible request, Special > Dodge > Heavy > Light ties, unavailable feedback without replacing a valid buffer, exclusive expiry, cancellation after sampling, and no action interruption (FR-012, FR-015, FR-040; CTRL-AC-008).
- [ ] T017 [P] [US2] Write failing tutorial and storage-fallback tests in tests/integration/ui/combat-ui.test.ts for Light retaining the legacy `attack` ID, independent Heavy prompt/completion, first-encounter order, reload persistence, and unavailable/corrupt storage (FR-006; NFR-008; CTRL-AC-009).
- [ ] T018 [P] [US2] Write and observe failing Chromium/WebKit checks for Light/Heavy labels, one-tap Heavy action, recovery feedback, no hold repeat or slide switching, and first-run/legacy Heavy prompt in tests/e2e/touch-combat.spec.ts (FR-006, FR-038–040; CTRL-AC-005–009).

### Implementation

- [ ] T019 [US2] Extend `MoveId`, `InputFrame`, pending action, and provisional attack tuning in src/game/types.ts and src/content/tuning.ts; migrate Light values to tuning data and set Heavy's initial 14/6/24 ticks, 30 damage, 1.3 range, 0.45 depth tolerance, 1.2 knockback, and 10 meter per enemy hit (FR-012, FR-014, FR-038–040).
- [ ] T020 [US2] Emit ordered Light/Heavy/Dodge/Special action requests plus canceled source IDs from src/input/pointers.ts and src/input/frame.ts; keep a normal released tap through capture loss and pass T015 (FR-010, FR-040; CTRL-AC-008).
- [ ] T021 [US2] Implement Heavy state transitions and the single eligible request buffer in src/game/actions.ts and src/game/step.ts; check resources on receipt, preserve valid pending work against unavailable presses, reset combo only on accepted Heavy start, and pass T013/T016 (FR-012, FR-015, FR-038, FR-040; CTRL-AC-005–008).
- [ ] T022 [US2] Apply Heavy enemy damage/knockback/meter and table damage through src/game/damage.ts, src/game/collision.ts, and src/game/pickups.ts; keep once-per-target registration, boss eligibility and arena bounds, and pass T014 (FR-014, FR-016, FR-031, FR-038; CTRL-AC-007).
- [ ] T023 [US2] Add a readable Heavy pose/impact using existing assets in src/presentation/actors.ts and src/presentation/effects.ts; drive it from simulation state/events without applying damage in presentation (FR-017, FR-038; CTRL-AC-006).
- [ ] T024 [US2] Add the Heavy contextual prompt and safe local completion storage in src/ui/tutorial.ts and src/app/game-app.ts; preserve existing preference/best data, keep legacy `attack` as Light, and pass T017 (FR-006; NFR-008; CTRL-AC-009).
- [ ] T025 [US2] Wire the four buttons and action feedback into src/app/game-app.ts and src/ui/combat.ts, update old Attack-labelled browser cases to Light with meaningful assertions, and pass T018 in Chromium/WebKit (FR-012, FR-038–040; CTRL-AC-005–009).
- [ ] T026 [US2] Run affected tests and the full `bun run test`/`bun run build` gate, record combat behavior and outstanding phone/balance evidence in specs/002-revised-controls/validation/us2-results.md, then make a conventional milestone commit only if all tests pass (CTRL-AC-005–009; AGENTS.md).

**Checkpoint**: Light, Heavy, buffering, meter, tables, and tutorial work in a representative encounter. This is an independent combat increment; it does not certify phone ergonomics or complete MVP delivery.

---

## Phase 5: User Story 3 — Use Defensive and Special Actions Confidently (Priority: P1)

**Goal**: Keep directional Dodge and meter-powered Special usable during movement, show readiness on buttons, and clear all input safely through interruptions and retry.

**Independent Test**: With a telegraphed enemy and full meter, use Dodge/Special while moving, mute audio/disable shake, interrupt held and buffered inputs, explicitly Resume, and retry with no inherited input (CTRL-AC-010–013).

### Tests first — observe the expected failure

- [ ] T027 [P] [US3] Write failing unit/integration checks for directed/neutral Dodge, invulnerability/cooldown, full/empty Special after Crow KO, source-touch cancellation, full input clearing, retry state, and paused active-time accounting in tests/unit/game/combat.test.ts and tests/integration/app/session.test.ts (FR-013–015, FR-040; NFR-003–004; CTRL-AC-010–013).
- [ ] T028 [P] [US3] Write failing browser checks for pressed states, text/shape Dodge cooldown and Special percentage/readiness, muted/no-shake legibility, pause/visibility/focus/portrait interruption, and explicit Resume in tests/e2e/touch-combat.spec.ts (FR-037, FR-039–040; NFR-003–004; CTRL-AC-010–013).

### Implementation

- [ ] T029 [US3] Render pressed/readiness state on all four controls in src/app/game-app.ts and src/ui/styles.css, with readable Dodge seconds/Ready and Special percentage/Ready plus existing HUD redundancy; pass UI portions of T028 (FR-037, FR-039; CTRL-AC-011–012).
- [ ] T030 [US3] Clear pointer ownership, outstanding requests, and Cow's buffered source action on pause, hidden/blur, portrait, result, retry, and layout-invalidating resize in src/app/game-app.ts, src/input/pointers.ts, and src/game/actions.ts; stop active timing, preserve existing audio pause integration, require explicit Resume/new touches, and pass T027/T028 (FR-040; NFR-003–004; CTRL-AC-013).
- [ ] T031 [US3] Execute the two-phone touch/readability procedure from specs/002-revised-controls/validation/device-procedure.md on iPhone 12 Safari and Pixel 6 Chrome; record versions, grip changes, missed taps, safe-area/telegraph visibility, muted/no-shake feedback, and interruption behavior in specs/002-revised-controls/validation/us3-device.md, keeping unavailable evidence open (FR-037, FR-039; NFR-001–004; CTRL-AC-012–013).
- [ ] T032 [US3] Run affected tests and the full `bun run test`/`bun run build` gate, record outcomes and remaining device/audio dependencies in specs/002-revised-controls/validation/us3-results.md, then make a conventional milestone commit only if all tests pass (CTRL-AC-010–013; AGENTS.md).

**Checkpoint**: Dodge/Special feedback and interruption behavior are demonstrable; real-device evidence is recorded or explicitly pending. Existing MVP audio work may still block full lifecycle acceptance.

---

## Phase 6: Polish and Cross-Cutting Acceptance

**Purpose**: Reconcile the control feature with the complete one-level MVP and gather final evidence without treating an isolated encounter as full acceptance.

- [ ] T033 [P] Run a full-level balance pass and Cow-solo-after-Crow-KO run with both attacks; tune only data in src/content/tuning.ts and record attempts, 3–5 minute successful active duration, damage/readability observations, and changes in specs/002-revised-controls/validation/balance.md (FR-038; SC-002–003, SC-005).
- [ ] T034 [P] Once the original MVP PWA/audio tasks are complete, run browser and installed offline relaunch, full level, soundtrack, retry, loading/cache failure, storage failure, and between-run-update checks on both phones; record actual outcomes and any pending external dependency in specs/002-revised-controls/validation/offline.md (NFR-005–009; PRD AC-019–021).
- [ ] T035 [P] Record complete-run frame intervals and visible stalls on both reference phones, including the busiest encounter and release build, in specs/002-revised-controls/validation/performance.md; require at least 30 fps and note the 60 fps target (NFR-002; SC-006).
- [ ] T036 [P] Conduct the five-player no-coaching evaluation using specs/002-revised-controls/quickstart.md and record each player's 30-second movement/Light outcome, four-action demonstration within two minutes after prompts, separate responsiveness/readability scores, attempt count, successful duration, Crow survival, and confusion in specs/002-revised-controls/validation/playtest.md (SC-001–004, SC-007).
- [ ] T037 Review PRD FR-006/008–017/031/037–040, CTRL-AC-001–013, the superseding runtime contract, and unfinished MVP tasks; update the traceability and remaining gates in specs/002-revised-controls/validation/coverage.md without marking unperformed device/offline/player checks complete (constitution I–V).
- [ ] T038 Run `bun run typecheck`, full `bun run test`, `bun run build`, and the applicable static-build audit; document commands/results in specs/002-revised-controls/validation/final.md, then make a conventional final milestone commit only with all tests passing and report any remaining MVP acceptance dependencies (AGENTS.md; SC-005–006).

**Checkpoint**: All 13 feature scenarios are verified where the required environment exists. Final MVP acceptance still depends on the original level, audio, PWA, performance, and five-player gates.

---

## Dependencies and Execution Order

```text
Setup T001–T004 → Foundation T005–T006 → US1 T007–T012 → US2 T013–T026 → US3 T027–T032 → Polish T033–T038
```

- T002 reproduces the currently failing browser cases before changing them. T003 is the first all-tests-pass gate; no commit precedes it. T004 is a documentation consistency edit and receives a document review.
- T005/T006 must precede visual and device work. The US1 pointer adapter and UI are prerequisites for US2's ordered action requests; US2's four working actions are prerequisites for US3's readiness/lifecycle browser checks. Each story remains independently demonstrable at its checkpoint using the stated prerequisites.
- Within each story, create and observe all relevant red tests before implementation tasks. For a later defect, add a failing regression test before fixing it. Retest after every change; all existing tests must pass before each milestone commit.
- T031 requires physical access to both phones. T034 additionally depends on completion of the original MVP audio/cache tasks and the distributable soundtrack for final soundtrack acceptance; a temporary loop is acceptable during development. T035 needs a complete playable run. T036 needs five casual players and a reachable enemy/full meter for the four-action measurement window. Keep those gates pending until actually observed.
- The documented `feat/revised_controls` name in older artifacts is historical; use the active `002-implement` feature branch unless intentionally switched to another non-`main` feature branch. No new package or backend is needed; the static build remains AWS-compatible.

## Acceptance Coverage

| Story | Feature scenarios | Primary task range |
| --- | --- | --- |
| US1 | CTRL-AC-001, CTRL-AC-002, CTRL-AC-003, CTRL-AC-004 | T007–T012 |
| US2 | CTRL-AC-005, CTRL-AC-006, CTRL-AC-007, CTRL-AC-008, CTRL-AC-009 | T013–T026 |
| US3 | CTRL-AC-010, CTRL-AC-011, CTRL-AC-012, CTRL-AC-013 | T027–T032 |

The recommended player-facing increment is US1 plus US2, since US1 intentionally validates the layout before Heavy works. US3 and the final phase complete the feature’s reliability and acceptance evidence.

## Parallel Opportunities

- **US1:** T007 and T008 touch different test files and can be written concurrently; T009–T011 then integrate sequentially.
- **US2:** T013, T015, T017, and T018 cover distinct test files and can be written concurrently. T014/T016 share `tests/unit/game/combat.test.ts` with T013, so coordinate those edits or serialize them. T019–T025 follow the red tests in dependency order.
- **US3:** T027 and T028 cover different test layers and can be written concurrently; T029/T030 integrate sequentially.
- **Polish:** T033–T036 gather separate kinds of evidence and can proceed concurrently when their external prerequisites exist; T037/T038 depend on their results.

## Parallel Examples

- **US1:** Write the pointer ownership cases in tests/integration/input/pointers.test.ts while writing the initial-visible-controls browser case in tests/e2e/touch-combat.spec.ts; run both red, then implement T009–T011.
- **US2:** Write Heavy phase assertions in tests/unit/game/combat.test.ts, ordered touch assertions in tests/integration/input/pointers.test.ts, and tutorial migration assertions in tests/integration/ui/combat-ui.test.ts; observe each expected failure before T019–T025.
- **US3:** Write deterministic interruption rules in tests/integration/app/session.test.ts while writing browser readiness/Resume checks in tests/e2e/touch-combat.spec.ts; run both red before T029/T030.

## Implementation Strategy

1. Restore the test baseline and complete the evidence forms so commits and phone checks have a reliable starting point.
2. Deliver US1 as the first validation increment: visible fixed movement and recognizable button map. Demonstrate the full four-button layout to players after US2 makes Heavy functional.
3. Deliver US2 as the first player-facing feature increment: working Heavy, precise action ordering, and Heavy onboarding.
4. Deliver US3 as the reliability increment: readiness feedback, safe interruption, and explicit Resume.
5. Run complete-level tuning and cross-feature acceptance after the original MVP audio/PWA dependencies are ready. Record any unperformed phone or five-player gate rather than inferring a pass from automated tests.

**Milestone rule:** Make conventional commits at relevant completed checkpoints only after `bun run test` passes. Use Bun for Node package and script commands. Preserve unrelated work and never commit on `main`.
