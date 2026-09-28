# Tasks: Combat View and AI Partner Improvements

**Branch**: `006-combat-view-partner`  
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [runtime contract](contracts/arena-runtime.md), [UI contract](contracts/combat-ui.md), [quickstart.md](quickstart.md).

**Tests**: Mandatory red–green–refactor. Write each behavior's tests and observe the expected failure before implementation; record commands/results in `specs/006-combat-view-partner/validation.md`. Documentation receives consistency review. Use Bun and pinned dependencies; all existing suites must pass before any conventional commit.

**Format**: Every unchecked task has a sequential ID, optional `[P]`, story label for story phases, and exact repository-relative paths. `[P]` marks independent file work within the same test group, after its prerequisites. Shared source edits are sequential. New paths below are intended additions.

**Traceability**: Unqualified FR/SC IDs refer to feature 006; PRD IDs refer to the root product baseline. Checkpoints reference the numbered acceptance scenarios in spec.md. Nothing is marked complete by task generation.

## Phase 1: Setup and Prerequisite Integration

Preserve the existing specification/design edits. This feature does not reimplement the homepage or create a second platform stack.

### Preparation

- [ ] T001 Confirm branch/toolchain and create `specs/006-combat-view-partner/validation.md` with feature requirement/scenario coverage, baseline commands, pending hardware/track/player dependencies, and the manual procedures from `specs/006-combat-view-partner/quickstart.md` (FR-001–012).
- [ ] T002 Integrate the completed 005 selected-role/session/platform work using `specs/005-choose-your-fighter/tasks.md` as its authoritative prerequisite list; verify `src/game/selectors.ts`, `src/game/ai/partner.ts`, `src/app/session.ts`, `src/platform/pwa.ts` and the enhanced `scripts/audit-build.ts`, recording actual readiness in `specs/006-combat-view-partner/validation.md`. Do not mark missing prerequisite code as present; use 005 tasks for unfinished work (FR-005, FR-012).
- [ ] T003 Capture the integrated 005 baseline before camera changes: matched four-room screenshots at 844×390, 915×412 and actual phone sizes, projected floor coverage, actor positions and `src/content/neon-velvet.ts` bounds/spawns; save captures under `specs/006-combat-view-partner/evidence/baseline/` and commands/tool versions/results in `specs/006-combat-view-partner/validation.md` (FR-006–008; SC-003).

## Phase 2: Foundational — Shared Camera and Arena Context

Depends on setup and 005 integration. This shared geometry blocks US1 and US2 because renderer and partner visibility must agree. No gameplay geometry or content changes are allowed.

### Tests first

- [ ] T004 [P] Write and run failing tests in `tests/unit/game/arena.test.ts` for current-room/unlocked-corridor unions, retained trailing-partner regions, full-body visible polygons, segment-limited movement, finite input validation and no new locked-room access (FR-002–003, FR-007).
- [ ] T005 [P] Write and run failing tests in `tests/unit/presentation/camera.test.ts` for fixed-angle envelope fitting, 5% padding, body containment, all three doorway gaps, immediate expansion/constrained smoothing, knocked-out partner exclusion and resize without repositioning (FR-002, FR-006–008).

### Implementation

- [ ] T006 Add numeric ArenaContext, CameraFrame, BodyEnvelope and TransitionState contracts in `src/game/arena.ts`; implement legal-region/visible-polygon helpers and segment-bound movement using the equations and validation rules in `specs/006-combat-view-partner/data-model.md`, without Three/DOM imports (FR-002–003, FR-007).
- [ ] T007 Replace fixed-span/doorway-centre interpolation with computeArenaFrame in `src/presentation/camera.ts`, using the existing (0,8,12) view direction, 90% fit and 0.15-second constrained smoothing; retain a trailing living partner in the fit until natural arrival without delaying player progression (FR-002, FR-006–007).
- [ ] T008 Provide conservative existing-clip body envelopes via `src/presentation/character-assets.ts`, apply the same computed camera frame in `src/presentation/scene.ts`, and pass numeric viewport/transition context through `src/app/game-app.ts` to `src/game/step.ts`; preserve existing AI/damage order and re-fit final positions before rendering (FR-002, FR-007–008, FR-012).
- [ ] T009 Run shared geometry/type/integration checks and record matching render/AI bounds and unchanged room data in `specs/006-combat-view-partner/validation.md`; confirm no DOM/Three dependency entered deterministic game rules and no ordinary camera movement relocates an actor (FR-002, FR-006–008).

## Phase 3: US1 — Fight Alongside an Independent Partner (P1)

**Goal**: Aggressive visible engagement, natural regrouping, correct facing and genuine stuck recovery.

**Independent test**: In a prepared existing encounter, move the player away from an attacking/approaching partner, then cross a doorway and exercise real obstruction; repeat both identities. All US1 scenarios 1–7 must pass after foundation.

### Tests first

- [ ] T010 [P] [US1] Write and run failing engagement tests in `tests/unit/game/partner-engagement.test.ts` for both identities, eligible-target filtering/ranking, retained pursuit/attack despite separation, action expiration before movement returns, preserved damage/cadence, no target oscillation and knockout/solo behavior (FR-001–002, FR-005).
- [ ] T011 [P] [US1] Write and run failing movement/facing tests in `tests/unit/game/partner-movement.test.ts` for horizontal/depth/jitter cases, target-facing attacks, profile-speed travel, settled regroup hysteresis, visible segment bounds and natural doorway catch-up (FR-002, FR-004–005).
- [ ] T012 [P] [US1] Write and run failing obstruction tests in `tests/unit/game/partner-recovery.test.ts` for alternate routing, 120 genuine blocked ticks, progress/destination reset, safe candidate ordering and no recovery from distance, clipping, attack, cooldown, pause or knockout (FR-003, FR-005).

### Implementation

- [ ] T013 [US1] Add transient PartnerIntentState and StuckEvidence to `src/game/types.ts`, reset them through `src/game/run.ts`, and add only provisional intent/recovery/facing thresholds to `src/content/tuning.ts`; preserve all 005 profile speeds, damage and cadence (FR-001–005).
- [ ] T014 [US1] Refactor `src/game/ai/partner.ts` to filter visible reachable targets before existing threat ranking, retain eligible engagement, finish valid underway attacks, expire actions before early returns, and eliminate distance-only follow/repositioning without changing support-hit ordering (FR-001–002, FR-005).
- [ ] T015 [US1] Implement legal normal regrouping and actual-displacement facing in `src/game/ai/partner.ts`, consuming shared arena/transition context, existing normal/catch-up speeds, depth-facing preservation and the model’s 2/1-unit idle-follow hysteresis; never alter player speed or gate wave spawn on the partner (FR-002, FR-004–005).
- [ ] T016 [US1] Implement actual rejected-movement evidence and deterministic safe recovery in `src/game/ai/partner.ts` with obstruction checks in `src/game/arena.ts`; reset evidence on excluded states, retain attack cooldown/health/world state, and remain stopped if no valid recovery candidate exists (FR-003, FR-005).
- [ ] T017 [US1] Migrate the old separation-teleport assertion in `tests/unit/game/crow.test.ts` to the new no-distance-recovery rule while retaining modest-damage/no-healing/knockout assertions; add both-duo live regressions in `tests/e2e/partner-behaviour.spec.ts` for engagement, facing, trailing travel and visibility (FR-001–005).
- [ ] T018 [US1] Run US1 unit/integration/browser checks and record all seven scenario outcomes, recovery events and unchanged combat tuning in `specs/006-combat-view-partner/validation.md`; physical-device observations remain pending until performed (FR-001–005; SC-001–002).

## Phase 4: US2 — See a Larger Presentation of the Existing Room (P1)

**Goal**: Finish enlarged room framing with usable overlays and lifecycle handling.

**Independent test**: Compare matched before/after stable-room captures, unchanged world boundaries/traversal and simultaneous input at reference viewports. Test resize/interruption explicitly (US2 scenarios 1–5). Foundation supplies the camera model; US1 supplies full natural-travel integration.

### Tests first

- [ ] T019 [P] [US2] Write and run failing framing/overlay browser cases in `tests/e2e/combat-view.spec.ts` for greater projected floor coverage than stored baseline, at least 90% viewport span, unchanged angle/bounds/spawns, body visibility, safe-area controls and simultaneous/cancelled input (FR-006–008).
- [ ] T020 [P] [US2] Write and run failing lifecycle tests in `tests/integration/app/arena-lifecycle.test.ts` for viewport changes, hidden/focus/portrait pause, frozen intent/stuck timers, explicit Resume and no displacement or elapsed-time jump while re-fitting (FR-008, FR-012).

### Implementation

- [ ] T021 [US2] Complete stable-room and natural-transition framing in `src/presentation/scene.ts` and `src/presentation/camera.ts`, validating conservative envelopes against existing pose extents; keep full-screen rendering and original view angle while improving projected floor coverage in all four rooms (FR-006–007).
- [ ] T022 [US2] Refine overlay layout in `src/ui/styles.css` and `src/ui/combat.ts` so HUD/controls remain legible inside safe areas with the central action clear; preserve the joystick/diamond arrangement, touch hit regions and room view behind overlays (FR-008).
- [ ] T023 [US2] Complete resize/interruption context handling in `src/app/game-app.ts` and `src/app/session.ts`, fitting both active allies before Resume and freezing movement/recovery/active time during pause; retain 005 audio and input-clearing behavior (FR-008, FR-012).
- [ ] T024 [US2] Run US2 suites and produce matched after captures/coverage metrics under `specs/006-combat-view-partner/evidence/framing/`; compare world bounds, spawns and traversal timing to baseline and record results in `specs/006-combat-view-partner/validation.md` without counting temporary transition widening as stable-room coverage (FR-006–008; SC-003).

## Phase 5: US3 — Know Where to Go After Clearing a Room (P2)

**Goal**: One prominent, correctly directed and noninteractive GO indicator.

**Independent test**: Drive encounter state through intermediate/final wave clearance, travel, next entry, pause/resume, retry/defeat and final victory; confirm exact cue timing and placement (US3 scenarios 1–6). Pure cue work depends only on foundation; live layout validation follows US2.

### Tests first

- [ ] T025 [P] [US3] Write and run failing cue-contract tests in `tests/unit/ui/progression.test.ts` for cleared-plus-next-route eligibility, actual left/right route direction, terminal/reset suppression and pause-state persistence; include a synthetic left route without adding shipped content (FR-009–011).
- [ ] T026 [P] [US3] Write and run failing markup/placement tests in `tests/integration/ui/progression-ui.test.ts` for one arrow/GO label, one announcement per room unlock, static reduced-motion view, 8-px clearance and deterministic safe-area placement; add browser touch pass-through cases in `tests/e2e/progression.spec.ts` (FR-009–011).

### Implementation

- [ ] T027 [US3] Add deriveProgressionCue and placement helpers in `src/ui/progression.ts` using actual next-room existence/direction and session/run state; preserve `src/game/encounters.ts` progression timing rather than introducing a separate cue timer or hardcoded final index (FR-009–010).
- [ ] T028 [US3] Render inline SVG arrow plus GO/status text in `src/ui/progression.ts` and style its dedicated layer in `src/ui/styles.css`, implementing the data-model 96×48 cue, safe-side preferred placement and collision fallback with no pointer events or decorative animation (FR-011).
- [ ] T029 [US3] Integrate the derived cue and measured overlay bounds in `src/app/game-app.ts`, remove duplicate GO markup from `src/ui/combat.ts`, and ensure pause overlays retain precedence, Resume restores the cue, and entry/results/reset remove it (FR-009–011).
- [ ] T030 [US3] Run all US3 cue and browser journeys through the three exits and final boss, recording timing, accessibility, non-overlap and no accidental input interception in `specs/006-combat-view-partner/validation.md` (FR-009–011; SC-004).

## Phase 6: Polish and Cross-Cutting Acceptance

All stories must complete before full acceptance. Missing 005/platform, soundtrack, device or participant evidence stays explicitly pending.

### Final validation

- [ ] T031 Execute both-role regression checks for 005 selection/countdown, audio/storage failures, pause/input clearing, full offline replay and safe waiting updates using `specs/006-combat-view-partner/quickstart.md`; verify new bundled cue code is included by `scripts/audit-build.ts` and record results in `specs/006-combat-view-partner/validation.md` (FR-012).
- [ ] T032 Run both-duo physical checks on iPhone 12/Safari and Pixel 6/Chrome for aggression, body visibility, natural travel, correct facing, touch ergonomics, resize, muted/no-shake/reduced-motion and explicit Resume; record exact versions and evidence in `specs/006-combat-view-partner/validation.md` (FR-001–012; SC-001–004).
- [ ] T033 Verify full cached offline level/audio/results/retry and waiting-update behavior on both phones, including installed mode where supported, using the intended track and completed 005 cache audit; record build/inventory identity in `specs/006-combat-view-partner/validation.md` (FR-012; SC-006).
- [ ] T034 Measure complete runs with both partners using 005 diagnostics, including busiest encounter and widest transition framing, 60-fps target/30-fps minimum, longest frames, draw calls/triangles and visible stalls; record full-asset evidence in `specs/006-combat-view-partner/validation.md` (SC-006).
- [ ] T035 Conduct the five-first-time-player GO direction test from `specs/006-combat-view-partner/quickstart.md`, recording individual response times/directions and at least four correct within three seconds, plus existing PRD combat-readability evaluation, in `specs/006-combat-view-partner/validation.md` (SC-005; PRD SC-004, SC-009).
- [ ] T036 Reconcile FR-001–012 and every story scenario with evidence in `specs/006-combat-view-partner/validation.md`; run typecheck, all Vitest/integration/Playwright/Blender suites, production build, enhanced audit and git diff --check before any conventional commit; leave unmet physical/platform gates unchecked rather than declaring full acceptance (SC-001–006).

## Dependencies and Execution Order

```text
005 runtime prerequisites → Setup/baseline → Shared geometry foundation
                                              ├→ US1 partner behaviour ─┐
                                              ├→ US2 view/lifecycle ────┼→ Combined validation → Final gates
                                              └→ US3 pure cue ──────────┘
US2 final overlay layout → US3 live cue placement validation
US1 natural travel + US2 framing → Both-body transition acceptance
```

Numbered order is the default safe execution sequence. Foundation resolves the shared camera/visibility work before story phases, satisfying the plan's geometry-first order while retaining story grouping. US1 is independently testable with its prepared arena contexts and live foundation renderer; US2 has matched framing/input fixtures; US3 has prepared encounter snapshots. Final end-to-end evidence must use real production paths with both selected identities.

Within each phase, observe expected failures before implementing their corresponding rules. Unmarked implementation tasks are sequential, especially edits to `src/app/game-app.ts`, `src/game/ai/partner.ts`, `src/presentation/camera.ts` and shared UI styles. Keep the player-driven wave/entry order and original content unchanged. A failing baseline must be investigated and recorded; it cannot be silently waived or represented as passing.

005 prerequisite work stays tracked in its existing tasks rather than copied into this feature. Do not perform a blind merge or discard local changes. If source prerequisites are unavailable, independent numeric/test design can proceed, but integration and full acceptance remain blocked on actual dependency completion. External device/track/participant evidence does not prevent unrelated engineering progress.

## Parallel Execution Examples

After each phase's prerequisites, the following independent test files may be prepared/run concurrently. Consolidate shared evidence updates sequentially; no parallel edits to shared production files are implied.

- **Foundation**: T004, T005 — independent failing-test work before implementation.
- **US1**: T010, T011, T012 — independent failing-test work before implementation.
- **US2**: T019, T020 — independent failing-test work before implementation.
- **US3**: T025, T026 — independent failing-test work before implementation.

## Requirement Coverage

| Requirements | Delivery and independent evidence |
| --- | --- |
| FR-001–005 | US1 engagement, facing, bounded travel and real obstruction; all seven US1 scenarios, both identities. |
| FR-006–008 | Foundation framing plus US2 coverage, unchanged world data, overlays and interruption; all five US2 scenarios. |
| FR-009–011 | US3 derived cue, visibility lifecycle, safe placement and input pass-through; all six US3 scenarios. |
| FR-012 | Shared lifecycle plus final 005 platform regression and physical offline checks. |
| SC-001–002 | Both-role partner regressions and observed phone behaviour. |
| SC-003–004 | Matched framing metrics and every progression transition. |
| SC-005–006 | Five-player timed direction recognition and full-run device performance/platform evidence. |

## Implementation Strategy

The smallest useful increment is **foundation plus US1**: a partner that engages without distance pulling and faces natural movement correctly. Foundation necessarily includes shared camera containment, but the full view presentation remains US2. Add US2 and US3 to complete the requested gameplay revision. All stories and final acceptance gates are required for complete feature acceptance.

Use `data-model.md` for provisional thresholds and `contracts/` for behavior. Tune only framing/follow margins, stuck thresholds and cue placement when evidence warrants it; do not enlarge rooms, increase speeds/damage, delay encounter progression for the partner, or add graphics upgrades. Add a failing regression for any acceptance defect before fixing it. No commit, deployment or runtime modification is performed by task generation itself.
