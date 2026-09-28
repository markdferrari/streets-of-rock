# Tasks: Illustrated Bar and Nightclub Backdrops

**Branch**: `008-nightclub-backdrops`
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [runtime contract](contracts/backdrop-runtime.md), [visual review contract](contracts/visual-review.md), [quickstart.md](quickstart.md).

## Execution rules

All paths are repository-relative. FR/SC references below are feature-local unless prefixed PRD. Follow TDD for automatable behavior: write a meaningful test, observe the expected failure, implement, then refactor green. Baseline tests may already pass; record them as baselines rather than claiming an invented failure. Record commands and evidence in `specs/008-nightclub-backdrops/validation.md`.

Stay on the feature branch, use Bun and the locked dependencies, preserve unrelated edits, and use conventional commits only after all existing suites pass. Documentation-only work requires consistency review. `[P]` means independent files within the stated batch after its prerequisites; shared manifest/runtime edits remain sequential.

All four concepts must be prepared and reviewed before final artwork production. Foundation uses explicitly identified draft assets to make the all-room loading contract executable; US1/US2 replace them with final reviewed art. Draft rooms are not accepted production scenery. Missing concept, phone, soundtrack or participant evidence remains pending.

## Phase 1: Setup and prerequisite integration

**Goal**: Establish the actual 005/006 runtime baseline and acceptance procedures.

- [ ] T001 Verify branch and integrate the tracked prerequisites in `specs/005-choose-your-fighter/tasks.md` and `specs/006-combat-view-partner/tasks.md`: role/session readiness generations, full cache inventory/worker/audit, diagnostics, shared CameraFrame and GO; record actual status in `specs/008-nightclub-backdrops/validation.md` without duplicating their systems or closing their outstanding acceptance tasks. (FR-006–011, FR-013)
- [ ] T002 Install locked dependencies and browser binaries using the commands in `specs/008-nightclub-backdrops/quickstart.md`; run existing suites/build checks from `package.json` and `tests/blender/run_tests.py` and record versions, baseline results and existing failures in `specs/008-nightclub-backdrops/validation.md`. (FR-006, FR-013)
- [ ] T003 Create the FR-001–013, all sixteen story scenarios and SC-001–006 evidence matrix in `specs/008-nightclub-backdrops/validation.md`; define concept, in-game, phone, offline, performance and five-tester procedures before art work, and capture baseline bounds/waves/table positions from `src/content/neon-velvet.ts` plus matched 006 camera views. (FR-006, FR-012–013)

## Phase 2: Shared foundation

**Goal**: Validate visual definitions, resource ownership and scene integration before either room pair is finalized.

### Tests first

- [ ] T004 [P] Add failing definition/resource-contract tests in `tests/unit/content/backdrops.test.ts` for exhaustive unique stable area IDs, correct visual order/route metadata, known wall/floor keys, dimensions/landmark bounds and self-contained static SVG content; retain passing baseline assertions for unchanged level geometry/waves/table locations. (FR-001, FR-005–006, FR-010)
- [ ] T005 [P] Add failing store tests in `tests/unit/presentation/backdrop-assets.test.ts` for eight-resource loading/decoding, concurrent request coalescing, reuse, partial failures, late arrivals after retirement, retry, get-before-ready and idempotent texture disposal. (FR-011, FR-013)
- [ ] T006 [P] Add failing layer tests in `tests/unit/presentation/environments.test.ts` for decoration-only scene objects, rear-wall/floor placement, connector coverage, immutable run/level data and scene-owned geometry/material cleanup that preserves store-owned textures. (FR-006–009, FR-013)
- [ ] T007 [P] Add failing integration tests in `tests/integration/app/backdrop-readiness.test.ts` for all-room preload/GPU initialization before first-frame readiness, interior-image failure blocking entry, retained-duo Retry, stale generation rejection and loading time excluded from gameplay. (FR-011)

### Concepts and implementation

- [ ] T008 Prepare four draft wall/floor concepts with actual camera/character/HUD composites in `specs/008-nightclub-backdrops/reviews/concepts.svg` and `specs/008-nightclub-backdrops/reviews/concepts.md`; record real review of all room identities, common branding, rightward entrance and playable-floor separation before final production, reusing explicit accepted decisions. (FR-002–005, FR-012)
- [ ] T009 Implement readonly visual definitions and validation in `src/content/backdrops.ts`: map dance-floor→outsideEntrance, vip-lounge→bar, backstage-corridor→danceFloor, alley-exit→stageVip; read bounds from existing level data, preserve stable IDs and use the field/resource constraints in `specs/008-nightclub-backdrops/data-model.md`. (FR-001, FR-005–006)
- [ ] T010 Place clearly documented draft SVGs at `assets/backdrops/outside-entrance/wall.svg`, `assets/backdrops/outside-entrance/floor.svg`, `assets/backdrops/bar/wall.svg`, `assets/backdrops/bar/floor.svg`, `assets/backdrops/dance-floor/wall.svg`, `assets/backdrops/dance-floor/floor.svg`, `assets/backdrops/stage-vip/wall.svg` and `assets/backdrops/stage-vip/floor.svg`; add explicit imports and transactional BackdropAssetStore in `src/presentation/backdrop-assets.ts`, with awaited settlements, failed/late-resource cleanup, retry and shared texture ownership. (FR-001, FR-010–011)
- [ ] T011 Replace primitive decoration with the owned VenueLayer in `src/presentation/environments.ts`; use static opaque unlit materials with sRGB maps/tone mapping disabled, preserve character lighting, add quiet connector/backing surfaces, expose coverage updates from the shared 006 frame and dispose only layer-owned geometry/materials. (FR-005–010)
- [ ] T012 Integrate the store/layer with `src/app/game-app.ts`, `src/app/session.ts` and `src/presentation/scene.ts`: load/decode/initialize all textures before matching-generation readiness, render the exterior before countdown, retain store textures across Retry, retire them after consumers and prevent double disposal in existing traversal. (FR-011, FR-013)

**Checkpoint**: All-room draft loading, retry and ownership work; all four concepts have actual review recorded. Independent code/test work may continue while concept review is pending, but final asset production cannot.

## Phase 3: US1 — Enter a recognizable nightclub (P1)

**Goal**: Deliver final exterior and bar scenery with unchanged gameplay.

**Independent test**: Play rooms 1–2; recognize entrance/bar, follow the actual rightward GO route and use the two unchanged interactive tables. Rooms 3–4 may still use documented draft assets for this development increment.

### Tests first

- [ ] T013 [US1] Add failing exterior/bar integration cases in `tests/e2e/backdrops.spec.ts` for the correct room textures, no location-label dependence, rightward exit relationship and unchanged room-2 table/drop behavior; define screenshot capture positions and manual landmark checks without treating snapshots as proof of recognition. (FR-002–003, FR-006, FR-008)

### Final art and integration

- [ ] T014 [P] [US1] After T008 review and T013 expected failures, finalize `assets/backdrops/outside-entrance/wall.svg` and `assets/backdrops/outside-entrance/floor.svg` with frontage/pavement, club sign, neon doorway near the rightward route, queue barriers, posters and doorway light; keep furniture outside playable space and preserve quiet fighting-floor detail. (FR-002, FR-005, FR-010)
- [ ] T015 [P] [US1] After T008 review and T013 expected failures, finalize `assets/backdrops/bar/wall.svg` and `assets/backdrops/bar/floor.svg` with counter, bottle shelves, stools, booths, warm/neon light and common branding; distinguish decorative furniture from the two existing interactive tables without changing those objects. (FR-003, FR-005–006, FR-010)
- [ ] T016 [US1] Refine exterior/bar landmark regions, palette and panel composition in `src/content/backdrops.ts` and `src/presentation/environments.ts` against integrated camera views; keep geometry/encounter/table regressions and T013 green, with no false depthward door or movement obstacle. (FR-002–003, FR-006–009)
- [ ] T017 [US1] Review final rooms 1–2 in gameplay with character/effect/control overlays and record screenshots, required-cue results, GO alignment, table distinction and actual review decisions in `specs/008-nightclub-backdrops/reviews/outside-entrance.md` and `specs/008-nightclub-backdrops/reviews/bar.md`; leave unperformed phone/player checks pending. (FR-012; SC-002)

## Phase 4: US2 — Fight through the dance floor to the final stage (P1)

**Goal**: Complete the four-room visual journey and final-fight setting.

**Independent test**: Start test runs in rooms 3 and 4, identify dance-floor/stage cues, finish their existing encounters and verify final victory/Retry. This does not depend on judging rooms 1–2 artwork.

### Tests first

- [ ] T018 [US2] Add failing room-3/4 browser cases in `tests/e2e/backdrops.spec.ts` for dance-floor/stage mapping, retained encounters/boss behavior, final-victory GO suppression and exterior restoration on Retry; define in-game review captures for stage elevation and floor-warning readability. (FR-004, FR-006, FR-008, FR-011)

### Final art and integration

- [ ] T019 [P] [US2] After T008 review and T018 expected failures, finalize `assets/backdrops/dance-floor/wall.svg` and `assets/backdrops/dance-floor/floor.svg` with DJ booth, large speakers, overhead fixtures, recognizable floor pattern and static light pools; keep ground warnings/actor feet legible. (FR-004–005, FR-007, FR-010)
- [ ] T020 [P] [US2] After T008 review and T018 expected failures, finalize `assets/backdrops/stage-vip/wall.svg` and `assets/backdrops/stage-vip/floor.svg` with curtains, stage backdrop, VIP seating, branding and dramatic static light; frame the existing boss while clearly keeping decorative elevation inaccessible. (FR-004–007, FR-010)
- [ ] T021 [US2] Refine dance-floor/stage landmark regions, palettes and panel composition in `src/content/backdrops.ts` and `src/presentation/environments.ts`; replace remaining draft resources, keep T018 and baseline encounters green, and preserve original boss arena geometry and final-result flow. (FR-004–009, FR-011)
- [ ] T022 [US2] Review final rooms 3–4 in gameplay and record required-cue results, boss/ground-warning readability, absence of false platforms/routes and final-victory/Retry screenshots in `specs/008-nightclub-backdrops/reviews/dance-floor.md` and `specs/008-nightclub-backdrops/reviews/stage-vip.md`. (FR-012; SC-002)

## Phase 5: US3 — Read combat and controls against richer scenery (P1)

**Goal**: Keep all four rooms readable across phone layouts and camera travel.

**Independent test**: Exercise each room's busy encounter and all three transitions at supported landscape sizes, including trailing partner, floor-edge positions, muted/no-shake and reduced motion.

### Tests first

- [ ] T023 [P] [US3] Extend `tests/unit/presentation/environments.test.ts` with missing failing ground/rear-wall frustum-coverage cases for 006 stable/expanded transition frames, all connectors, endpoints, resizing and outgoing scenery after areaIndex advances; assert no camera/arena mutation and no stretched landmark regions. (FR-006, FR-009)
- [ ] T024 [P] [US3] Add failing browser layout/lifecycle cases in `tests/e2e/backdrop-readability.spec.ts` for 844×390, 915×412 and inherited supported extrema, edge positions/large silhouettes, trailing-partner travel, HUD/GO visibility, simultaneous input/cancellation, muted/no-shake, reduced motion and hidden/focus/orientation explicit resume. (FR-007–010)

### Implementation and review

- [ ] T025 [US3] Resolve coverage failures in `src/presentation/environments.ts` and `src/presentation/scene.ts`: extend quiet backing/floor geometry to visible plane intersections, cover connectors/endpoints, keep outgoing/incoming groups available, prevent coplanar flicker and preserve existing 006 camera fitting and actor/shadow/effect ordering. (FR-006–009)
- [ ] T026 [US3] Resolve composition/readability findings in the eight files under `assets/backdrops/` and landmark/palette values in `src/content/backdrops.ts`; retain all required cues, static lighting and external-resource-free SVGs while removing cue occlusion, false routes and misleading decorative objects. (FR-002–010)
- [ ] T027 [US3] Execute the visual/control/lifecycle procedure in `specs/008-nightclub-backdrops/contracts/visual-review.md` on iPhone 12/Safari and Pixel 6/Chrome; record all four rooms, all three transitions, integrated roster silhouettes, warnings, pickups, GO, muted/reduced-motion and explicit-resume outcomes in `specs/008-nightclub-backdrops/validation.md`. (FR-007–010, FR-012; SC-002–003, SC-006)

## Phase 6: US4 — Replay the complete illustrated level reliably (P1)

**Goal**: Complete all-room offline, loading, lifecycle and mobile-performance acceptance.

**Independent test**: Cache the full build, relaunch offline, finish all four rooms and Retry on both phones; separately exercise interior-resource failure, partial cache, waiting updates and repeated scene retirement.

### Tests first

- [ ] T028 [P] [US4] Add failing offline/browser cases in `tests/e2e/backdrops-offline.spec.ts` for all eight emitted resources/containing chunks in complete caching, interior-image failure before entry and Retry, no transition fetches, failed-cache readiness, offline results/Retry, denied storage/audio and cached build A remaining coherent while B waits during active/paused runs. (FR-011)
- [ ] T029 [P] [US4] Add missing failing readiness/resource lifecycle cases in `tests/integration/app/backdrop-readiness.test.ts` for ten home/run/retry cycles, bounded live allocations/contexts, final consumer retirement and late-load races; retain foundation assertions without duplicating them. (FR-011, FR-013)
- [ ] T030 [P] [US4] Add failing full-build audit cases in `tests/unit/platform/backdrop-inventory.test.ts` for missing required illustration resources, SVG dimensions/content constraints and decoded texture budget accounting including all eight images/mipmaps, alongside inherited total-build/render budgets. (FR-010–011, FR-013)

### Platform integration and acceptance

- [ ] T031 [US4] Extend the integrated 005 inventory/worker audit through `scripts/audit-build.ts` and static imports in `src/presentation/backdrop-assets.ts` so every backdrop or containing chunk is cached and verified; retain one existing worker and distinguish decoded runtime readiness from successful complete-build offline readiness. (FR-011, FR-013)
- [ ] T032 [US4] Resolve remaining failure/race/allocation regressions in `src/presentation/backdrop-assets.ts`, `src/presentation/scene.ts` and `src/app/game-app.ts`; preserve shared textures on Retry, release them after final consumers, prevent stale launch and confirm pre-countdown GPU initialization avoids first-use transition uploads. (FR-011, FR-013)
- [ ] T033 [US4] Complete cached offline runs through all rooms/intended audio/results/Retry on both reference phones, browser and installed mode where supported, using HTTPS; verify missing-art retry, denied audio/storage, interruption and waiting updates, and record build/device evidence in `specs/008-nightclub-backdrops/validation.md`. (FR-011; SC-004, SC-006)
- [ ] T034 [US4] Measure complete intended-soundtrack runs on both reference phones using integrated 005 diagnostics; record frame timing/visible stalls and 60-fps target/30-fps busiest-window floor, 30-MiB build/16-MiB asset, 100k triangles/100 draw calls/DPR≤1.5 and ≤64-MiB decoded backdrop budget in `specs/008-nightclub-backdrops/validation.md`; resolve measured failures within scope and repeat affected checks. (FR-013; SC-005)

## Phase 7: Cross-cutting review and completion

**Goal**: Reconcile the four-room feature with actual user and regression evidence.

- [ ] T035 Conduct the five-player evaluation from `specs/008-nightclub-backdrops/contracts/visual-review.md`; record uncoached identification of all four settings, separate readability/control ratings and GO direction timing in `specs/008-nightclub-backdrops/validation.md`, requiring four of five to identify all settings, rate readability/controls ≥4/5 and meet the three-second direction criterion while retaining other PRD gates. (SC-001, SC-003; PRD SC-004, SC-009, SC-011)
- [ ] T036 Resolve failed art/evaluation findings in the relevant files under `assets/backdrops/` with scoped revisions and repeat affected checks; finalize actual review decisions in `specs/008-nightclub-backdrops/reviews/outside-entrance.md`, `specs/008-nightclub-backdrops/reviews/bar.md`, `specs/008-nightclub-backdrops/reviews/dance-floor.md` and `specs/008-nightclub-backdrops/reviews/stage-vip.md` without changing gameplay to mask visual failures. (FR-002–010, FR-012; SC-001–003)
- [ ] T037 Reconcile every requirement/story scenario/success criterion in `specs/008-nightclub-backdrops/validation.md`, verify no draft art remains, update `specs/008-nightclub-backdrops/quickstart.md` to actual commands and retain missing owner review, soundtrack, phone or participant evidence as pending. (FR-001–013; SC-001–006)
- [ ] T038 Run all existing suites and final checks from `package.json` and `tests/blender/run_tests.py`: typecheck, test:unit, fresh Chromium/WebKit test:e2e, Blender tests, production build after browser tests, full audit:build and git diff --check; record results in `specs/008-nightclub-backdrops/validation.md`, verify no test hooks/fixtures in production and permit only conventional commits on the feature branch after all tests pass. (FR-006, FR-011, FR-013)

## Dependencies and execution order

```text
Implemented 005 session/platform + 006 camera/arena/GO
  → Setup T001–T003
  → Foundation tests T004–T007
  → Concepts T008 + shared implementation T009–T012
  → US1 exterior/bar T013–T017
  → US2 dance-floor/stage T018–T022
  → US3 readability T023–T027
  → US4 offline/performance T028–T034
  → Final evaluation/verification T035–T038
```

- T001 is a real prerequisite integration gate, not evidence that earlier plans are implemented. Preserve their ownership and pending acceptance records.
- T004–T007 can run together after setup. T009–T012 are sequential shared-contract/runtime work. T008 concept review gates T014/T015/T019/T020 final art; it does not block independent foundation code/tests.
- US1 and US2 are independently demonstrable against the shared foundation. Their art files can be produced independently after concepts and corresponding failing tests, but their browser test file and manifest/environment edits must be serialized. The numbered default order avoids these conflicts.
- Foundation includes loadable drafts for all four rooms because readiness requires every resource. A US1 demonstration may use drafts in rooms 3–4 but cannot claim full feature acceptance or ship draft scenery as complete.
- US3 cross-room acceptance requires final US1/US2 artwork. Its test batch can be prepared after foundation, but final review waits for both room pairs.
- US4 platform test preparation can begin after foundation; full offline/performance evidence uses all final art plus US3 corrections. Hardware/evaluation tasks remain open if required evidence is unavailable.
- Final acceptance requires all four stories; generated files, passing snapshots or desktop emulation do not substitute for real art/player/phone evidence.

## Parallel examples by story

| Story | Independent work | Preconditions |
| --- | --- | --- |
| US1 | T014 exterior SVGs and T015 bar SVGs | Foundation, reviewed four-room concepts and T013 expected failures. |
| US2 | T019 dance-floor SVGs and T020 stage/VIP SVGs | Foundation, reviewed concepts and T018 expected failures; no concurrent shared-manifest edits. |
| US3 | T023 geometry tests and T024 browser layout tests | Foundation APIs available; separate files and isolated fixtures. |
| US4 | T028 offline tests, T029 lifecycle tests and T030 audit tests | Foundation complete; independent files and isolated browser/build fixtures; serialize builds sharing dist/. |

## Implementation strategy

1. **Suggested development MVP**: Setup + foundation + US1. Demonstrate the exterior-to-bar journey with unchanged encounters and the reviewed visual direction. Other rooms may use clearly documented drafts until US2; this is not full product acceptance.
2. **Complete the visual journey**: US2 finalizes dance floor/stage, replacing all drafts.
3. **Protect usability**: US3 verifies all view sizes, combat cues and camera transitions on actual phones.
4. **Establish reliability**: US4 completes asset/cache/lifecycle/performance evidence for the full build.
5. **Accept the result**: Five-player evaluation, scoped corrections, evidence reconciliation and all-suite verification. Preserve all outstanding acceptance dependencies explicitly.

## Requirement coverage

| Feature requirements | Primary tasks/evidence |
| --- | --- |
| FR-001 mapping/order | T004, T009–T010, T013, T018 |
| FR-002 exterior | T008, T013–T014, T016–T017 |
| FR-003 bar/tables | T003–T004, T008, T013, T015–T017 |
| FR-004 dance/stage | T008, T018–T022 |
| FR-005 style | T008, T011, T014–T022, T026, T035–T036 |
| FR-006 preservation | T001, T003–T004, T006, T009, T013, T016, T018, T021, T023–T025 |
| FR-007–009 readability/GO/coverage | T006, T011, T013–T027 |
| FR-010 static/reduced motion | T004, T010–T011, T014–T015, T019–T020, T024, T026–T027, T030 |
| FR-011 readiness/offline/reset | T005, T007, T010, T012, T018, T028–T033 |
| FR-012 reviews | T003, T008, T017, T022, T027, T035–T037 |
| FR-013 resource/performance | T002, T005–T007, T012, T029–T034, T038 |

All SC-001–006 are assigned explicitly in story/manual/final tasks. T003 and T037 maintain the detailed per-scenario evidence matrix, including inherited PRD gates.
