# Tasks: Lion, Plates and Reusable Character Creation

**Feature branch**: `007-lion-plates-characters`  
**Inputs**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md), [research.md](research.md), [contracts](contracts/), [quickstart.md](quickstart.md).

## Execution rules

Follow repository TDD: write each automated test, observe the expected failure, implement, then refactor with passing tests. Record red/green evidence in `specs/007-lion-plates-characters/validation.md`. Define manual review procedures before asset production. Use Bun and the existing lockfile; stay on the feature branch, preserve unrelated changes, and use conventional commits only after all existing suites pass.

`[P]` identifies independent files within the stated test batch, after earlier prerequisites. It does not authorize concurrent edits to shared runtime files. Paths are repository-relative; new test files use existing suite conventions.

The initial character-builder skill belongs in the foundation because Lion and Plates must actually be built through it. US4 subsequently verifies and finalizes its reusable outcome; retrospective reports do not substitute for real exercises. Concept candidates must be reviewed before final production; unresolved review/device evidence stays pending.

## Phase 1: Setup and prerequisite integration

**Goal**: Establish the implemented 005/006 baseline and an evidence record before extending it.
- [ ] T001 Verify branch and integrate the prerequisite work tracked in `specs/005-choose-your-fighter/tasks.md` and `specs/006-combat-view-partner/tasks.md`: selected roles, selection/session/countdown, asset readiness/cache/full-build audit, visible arena and aggressive partner behavior; record actual implementation status in `specs/007-lion-plates-characters/validation.md`, retaining pending acceptance gates and avoiding duplicate systems.
- [ ] T002 Install locked dependencies with Bun, establish existing unit/integration/browser/Blender and build results from `package.json` and `tests/blender/run_tests.py`, and record versions, commands and baseline failures in `specs/007-lion-plates-characters/validation.md`.
- [ ] T003 Map FR-001–015, every US1–US4 scenario and SC-001–006 to automated/manual evidence in `specs/007-lion-plates-characters/validation.md`; define concept, muted/reduced-motion, phone, offline and five-player procedures from `specs/007-lion-plates-characters/quickstart.md` before implementation.

## Phase 2: Shared foundation

**Goal**: Validated data and safe authoring infrastructure, preserving Cow/Crow. Blocks character builds.

### Tests first

- [ ] T004 [P] Add failing schema/registry tests in `tests/unit/content/characters.test.ts` for unknown fields/version/kinds, malformed IDs, duplicates, numeric/timing domains, three Light stages, role separation and actionable errors; snapshot the integrated 005 Cow/Crow profiles before migration.
- [ ] T005 [P] Add failing resource/semantic-clip readiness tests in `tests/unit/presentation/character-assets.test.ts`, including missing model/portrait/sound/animation keys and unchanged Cow/Crow resource paths.
- [ ] T006 [P] Add failing command tests in `tests/unit/characters/commands.test.ts` for read-only validation, brief/ID errors, unsupported behavior reporting, duplicate/existing-output refusal and unrelated-file preservation using temporary fixtures.
- [ ] T007 [P] Add failing per-character CLI/preflight/export tests in `tests/blender/test_cli.py` and `tests/blender/test_rig_export.py` for scoped output/overwrite, required clip coverage and legacy Cow/Crow invocation compatibility.

### Implementation

- [ ] T008 Implement schemaVersion 1 types and strict pure registry validation in `src/content/characters.ts` and `src/content/types.ts` from `specs/007-lion-plates-characters/data-model.md`, with the bounded areaStrike/roar/straightProjectile union, separate player/partner profiles and no executable configuration.
- [ ] T009 Migrate exact integrated Cow/Crow values into `src/content/characters/cow.json` and `src/content/characters/crow.json`; update consumers in `src/content/tuning.ts`, `src/game/actions.ts` and `src/game/run.ts` atomically to use definitions while keeping existing behavior/snapshots green.
- [ ] T010 Extend static resource/animation manifests in `src/presentation/character-assets.ts` and `src/presentation/character-animation.ts` to validate all semantic phases and expose readiness failures before entry; preserve existing Cow/Crow imports.
- [ ] T011 Implement safe commands in `scripts/characters/validate.ts` and `scripts/characters/scaffold.ts` per `specs/007-lion-plates-characters/contracts/character-definition.md`: character-specific actionable errors, draft definition/report, temporary-test support, nonzero failures, no arbitrary evaluation and no existing-output overwrite.
- [ ] T012 Generalize `scripts/blender/generate.py`, `scripts/blender/characters.py`, `scripts/blender/rig_export.py`, `scripts/blender/render.py` and `scripts/blender/validate.py` for --character and scoped --output-dir/--overwrite; preflight all outputs, preserve unrelated sources and legacy paths, and keep Blender regression tests green.
- [ ] T013 Apply the available skill-creator guidance to create `.agents/skills/character-builder/SKILL.md` and `.agents/skills/character-builder/references/workflow.md`; cover create/update/validate routing, missing intent, supported versus new behavior, concept review, TDD, safe tools, role/cache integration, playable review and honest creation reports; validate frontmatter and references before Lion starts.

## Phase 3: US1 — Play Lion and control groups with ROAR (P1)

**Independent test**: Select Lion with Cow or Crow, verify slow powerful basic moves against the configured Plates values, then ROAR against normals, bosses and a mixed group. No completed Plates asset is required.

### Tests first

- [ ] T014 [P] [US1] Add failing Lion profile/basic-action tests in `tests/unit/game/lion.test.ts` for corresponding damage/cycle/speed values from `specs/007-lion-plates-characters/data-model.md`, broad Heavy, Dodge, basic meter/table rules, eligibility, no-target meter spend and once-only release.
- [ ] T015 [P] [US1] Add failing stun tests in `tests/unit/game/status-effects.test.ts` covering all normal attack phases, active charge hitboxes, slot release/allocation, movement, refresh/exact expiry/fresh decisions, death, room-clearance blocking and survival of already released bottles.
- [ ] T016 [P] [US1] Add failing ROAR integration tests in `tests/integration/game/roar.test.ts` for release-time radius/boundary sampling, normal/boss/mixed classification, zero normal damage/knockback, boss attack continuity/phase/death, simultaneous lethal defeat precedence, pause/retry and no ally/table/meter-gain effects.

### Implementation and actual skill exercise

- [ ] T017 [US1] Invoke the foundation character-builder skill for Lion; record the supplied brief, initial unrelated-resource hashes and concept candidates/review in `specs/007-lion-plates-characters/reviews/lion.md`; keep this report current through the following build tasks and resolve appearance review before final model production.
- [ ] T018 [US1] Create `src/content/characters/lion.json` through the skill using the provisional player/partner and ROAR values in `specs/007-lion-plates-characters/data-model.md`; retain shared Dodge/meter/basic knockback rules and ordinary AI support tuning.
- [ ] T019 [US1] Add explicit enemy combatClass and tick-based stun state in `src/content/types.ts`, `src/content/neon-velvet.ts`, `src/game/types.ts` and `src/game/status-effects.ts`; classify Liam as boss and other existing enemies as normal, cancel owned active attacks/slots/transients and clear status on death/reset.
- [ ] T020 [US1] Integrate stun expiry/cancellation before AI/contact processing in `src/game/step.ts`, `src/game/ai/attack-slots.ts`, `src/game/ai/grunt.ts`, `src/game/ai/zoner.ts` and `src/game/ai/enforcer.ts`; guard every movement/attack path, restore fresh decisions at expiry and preserve released enemy projectiles in `src/game/projectiles.ts`.
- [ ] T021 [US1] Implement once-only Special activation/release dispatch and ROAR in `src/game/actions.ts` and `src/game/specials.ts`; queue boss damage through `src/game/damage.ts` without hurt/action interruption/knockback/meter gain, retaining batched lethal resolution and existing Cow/Crow areaStrike semantics.
- [ ] T022 [US1] Through the skill produce reviewed `assets/characters/lion/source.blend`, `assets/characters/lion/runtime/rigged.blend`, `assets/characters/lion/runtime/character.glb` and `assets/characters/lion/portrait.png`; include all locomotion/hurt/KO/Dodge/combo/Heavy/Special/support clips and validate body envelope and exports with `tests/blender/test_assets.py`.
- [ ] T023 [US1] Integrate Lion resources, action animation and readable ROAR/normal-stun versus boss-impact feedback in `src/presentation/character-assets.ts`, `src/presentation/character-animation.ts`, `src/presentation/scene.ts` and `src/presentation/effects.ts`; keep feedback legible without audio, shake or color-only cues.
- [ ] T024 [US1] Run Lion with an existing partner through selection/combat and the independent ROAR checks; record green tests, visual/playable review, unrelated hashes and pending device/balance evidence in `specs/007-lion-plates-characters/reviews/lion.md`; refine `.agents/skills/character-builder/references/workflow.md` from the real exercise before Plates.

## Phase 4: US2 — Play Plates and throw a headrest (P1)

**Independent test**: Select Plates with Cow or Crow; verify fast movement/long reach and throws against stationary, moving, dead, tied-distance and absent targets, including interception and misses.

### Tests first

- [ ] T025 [P] [US2] Add failing Plates profile/action tests in `tests/unit/game/plates.test.ts` for faster movement/cycles, longer corresponding reach/lower damage, common controls, buffered actual-start target eligibility, nearest visible living target/boss and ID ties, no-target feedback/meter retention and one-time spend.
- [ ] T026 [P] [US2] Add failing segment-entry geometry tests in `tests/unit/game/headrest-collision.test.ts` for high-speed crossing, tangency, initial overlap, reverse-ID interceptors, equal contact fractions and range-clipped final segments; preserve the existing boolean collision contract.
- [ ] T027 [P] [US2] Add failing headrest lifecycle tests in `tests/integration/game/headrest.test.ts` for stored aim after target move/death, changed release origin, zero-vector facing fallback, interrupted windup/no refund, once-only release/impact, protected targets, boss damage, no ally/table/status/knockback/meter effects, range/pause/results/retry and unchanged enemy bottle behavior.

### Implementation and second skill exercise

- [ ] T028 [US2] Invoke the refined character-builder skill for Plates; record brief, unrelated-resource baseline hashes and walking-plate/headrest concept candidates/review in `specs/007-lion-plates-characters/reviews/plates.md` before final asset production, then track the following work as the actual second exercise.
- [ ] T029 [US2] Create `src/content/characters/plates.json` through the skill using provisional values in `specs/007-lion-plates-characters/data-model.md`; add cross-profile relative speed/damage/reach/cycle validation in `src/content/characters.ts` and `tests/unit/content/characters.test.ts`, observing failure first.
- [ ] T030 [US2] Implement actual-start target selection from supplied 006 visible-arena data and stored aim in `src/game/actions.ts`, `src/game/specials.ts` and `src/game/types.ts`; provide no-target unavailable feedback without meter spend, fixed release direction/facing fallback, single release and cancellation without refund.
- [ ] T031 [US2] Add segment-circle entry fractions in `src/game/collision.ts` while retaining its boolean wrapper; implement discriminated headrest travel/hit consumption in `src/game/projectiles.ts` with earliest fraction then ID, clipped remaining range, protection consumption and no premature legacy-bound cleanup or enemy-bottle rule changes.
- [ ] T032 [US2] Through the skill produce reviewed `assets/characters/plates/source.blend`, `assets/characters/plates/runtime/rigged.blend`, `assets/characters/plates/runtime/character.glb`, `assets/characters/plates/portrait.png`, `assets/props/headrest/source.blend` and `assets/props/headrest/headrest.glb`; validate all required clips, body envelope and recognizable conjure/throw poses in `tests/blender/test_assets.py`.
- [ ] T033 [US2] Integrate Plates and the separate headrest prop in `src/presentation/character-assets.ts`, `src/presentation/character-animation.ts`, `src/presentation/scene.ts` and `src/presentation/effects.ts`; show conjure, release, straight flight and impact/miss with correct pause/result/reset cleanup and muted/reduced-motion readability.
- [ ] T034 [US2] Run Plates with an existing partner through independent target/miss/interception cases; record green tests, visual/playable review and unchanged unrelated-resource hashes in `specs/007-lion-plates-characters/reviews/plates.md`, keeping incomplete balance/device evidence explicit.

## Phase 5: US3 — Select and replay with four characters (P1)

**Independent test**: Exercise all twelve ordered distinct duos and reject all four duplicates; verify both new identities in either role, partner loss, player defeat, retry and cached offline entry.

### Tests first

- [ ] T035 [P] [US3] Add failing four-roster browser tests in `tests/e2e/four-character-selection.spec.ts` for portraits/full-body previews/true Health-Power-Speed bars, tap/click/keyboard preview-confirm, partner exclusion, back navigation, smaller screens, readiness and one countdown/launch across twelve ordered duos.
- [ ] T036 [P] [US3] Add failing role/run integration tests in `tests/integration/game/four-character-roles.test.ts` for correct player/partner profiles, ordinary aggressive visible support without AI Specials, HUD, solo completion after partner KO, player defeat, retained-duo retry and complete meter/stun/projectile/prepared-action reset; include Cow/Crow regressions.
- [ ] T037 [P] [US3] Add failing platform/browser tests in `tests/e2e/four-character-offline.spec.ts` for missing-resource readiness failures, full new-asset/audio caching and offline results/retry, storage/audio denial, hidden/focus/orientation interruption with explicit resume and updates deferred through active/paused runs.

### Integration

- [ ] T038 [US3] Extend the 005 registry consumers in `src/ui/screens.ts`, `src/ui/combat.ts` and `src/app/session.ts` to four validated identities, full-body previews and definition-derived bars (Health 500, Power first-Light 20, Speed 5); retain duplicate prevention, accessible controls and readiness/countdown semantics.
- [ ] T039 [US3] Complete all role initializations and transient lifecycle cleanup in `src/game/run.ts`, `src/game/step.ts`, `src/game/types.ts` and `src/app/session.ts`; connect new partner profiles to the integrated 006 AI behavior and verify all twelve duos without granting AI Specials.
- [ ] T040 [US3] Extend the inherited full-build inventory/cache integration through static imports in `src/presentation/character-assets.ts` and checks in `scripts/audit-build.ts` to all portraits/models/clips/headrest/required sounds; resolve four-character load/offline/update failures against the 005 platform implementation.
- [ ] T041 [US3] Run the twelve-pairing/retry, four-duplicate, solo-after-loss and Cow/Crow regression matrix and record outcomes against US3 scenarios in `specs/007-lion-plates-characters/validation.md`; keep physical offline/device acceptance for the final phase.

## Phase 6: US4 — Verify reusable character creation (P2, required)

**Independent test**: Inspect the two genuine skill runs, then exercise incomplete/invalid briefs, unsupported behavior, missing clips, duplicate IDs and safe updates without changing unrelated resources.

### Tests first

- [ ] T042 [P] [US4] Add missing failing negative/update command cases in `tests/unit/characters/workflow.test.ts`: incomplete briefs, unsupported mechanics requiring code/test work, duplicate IDs, missing clips, requested-character-only updates, existing-output refusal and unchanged unrelated hashes; reuse foundation coverage instead of duplicating it.
- [ ] T043 [P] [US4] Add missing failing pipeline preservation checks in `tests/blender/test_workflow.py` for sequential character generation, scoped derived-artifact overwrite and preservation of approved Cow/Crow/Lion sources while creating or updating Plates.

### Completion and review

- [ ] T044 [US4] Resolve remaining workflow failures in `scripts/characters/validate.ts`, `scripts/characters/scaffold.ts` and `scripts/blender/generate.py`; maintain actionable errors and preflight safety without adding arbitrary move execution or broad regeneration.
- [ ] T045 [US4] Finalize `.agents/skills/character-builder/SKILL.md` and `.agents/skills/character-builder/references/workflow.md` using both exercises; verify frontmatter/references with the available skill validator and actual helper commands, including supported/new behavior, review boundaries and incomplete evidence reporting.
- [ ] T046 [US4] Audit `specs/007-lion-plates-characters/reviews/lion.md` and `specs/007-lion-plates-characters/reviews/plates.md` for original briefs, actual skill invocation, concept review, produced assets/definitions, behavior tests, playable review and preservation hashes; complete available reviews and leave unavailable acceptance evidence unchecked.

## Phase 7: Cross-cutting validation and acceptance

**Goal**: Demonstrate the complete feature with real visual, device and player evidence. A playable increment is not full acceptance.

- [ ] T047 Execute the phone visual/control/lifecycle procedure from `specs/007-lion-plates-characters/quickstart.md` on iPhone 12/Safari and Pixel 6/Chrome for both new players with existing partners plus Lion/Plates and Plates/Lion; record action/stun/throw readability, safe areas, muted/no-shake/reduced-motion and interruption results in `specs/007-lion-plates-characters/validation.md`.
- [ ] T048 Verify complete cached offline runs through audio/results/retry and solo completion with each new fighter on the reference phones, browser and installed modes where supported; exercise denied storage/audio and waiting updates and record device/build evidence in `specs/007-lion-plates-characters/validation.md`.
- [ ] T049 Measure full intended-soundtrack runs and busiest encounters on both reference phones using the inherited diagnostics; record 60-fps target/30-fps floor and 30-MiB build, 16-MiB asset, 100k visible-triangle, 100-draw-call and DPR≤1.5 budgets in `specs/007-lion-plates-characters/validation.md`; resolve measured failures within scope before acceptance.
- [ ] T050 Run the five-player evaluation from `specs/007-lion-plates-characters/quickstart.md`, retaining existing control/readability/completion gates; require at least four testers to identify both fighting styles, record responses and tune `src/content/characters/lion.json` and `src/content/characters/plates.json` from evidence while preserving fixed Special semantics and Cow/Crow compatibility.
- [ ] T051 Reconcile all FR/scenario/SC evidence in `specs/007-lion-plates-characters/validation.md` and both `specs/007-lion-plates-characters/reviews/lion.md` and `specs/007-lion-plates-characters/reviews/plates.md`; update `specs/007-lion-plates-characters/quickstart.md` to actual commands and keep any missing art/owner-track/device/participant evidence pending.
- [ ] T052 Run every existing automated suite and final static/build checks from `package.json` and `tests/blender/run_tests.py`: typecheck, test:unit, test:e2e (fresh Chromium/WebKit server), Blender tests, production build, audit:build and git diff --check; record results in `specs/007-lion-plates-characters/validation.md`, verify no test hooks in production, and permit only conventional commits on the feature branch after all tests pass.

## Dependencies and execution order

```text
005 role/session/platform + 006 arena/partner implementation
  -> Setup -> Shared definition/tools/initial skill foundation
  -> US1: actual Lion skill exercise + playable Lion + workflow refinement
  -> US2: actual Plates skill exercise + playable Plates
  -> US3: complete four-character role/platform integration
  -> US4: workflow verification and final report audit
  -> full device/offline/performance/player acceptance
```

- Setup tasks are sequential; prerequisite integration must provide working APIs before foundation migration. Earlier-feature acceptance evidence remains tracked in its original task lists.
- Foundation test tasks T004–T007 may run together after setup. Implementation T008–T013 follows the failing tests and is sequential because validators/manifests/tools share contracts.
- US1 tests T014–T016 may run together; complete the Lion invocation and concept review before final assets, and record the real exercise before US2 starts.
- US2 tests T025–T027 may run together after US1. Mechanics share runtime files with US1, so do not run their implementation concurrently. Character-specific independent tests still use an existing partner.
- US3 tests T035–T037 may run together after both characters. The integrated 005/006 systems own selection/platform/AI; these tasks extend them.
- US4 tests T042–T043 may run together after both exercises. Core skill creation is deliberately T013, not deferred to US4.
- Final acceptance depends on all four stories. Missing review/device access is recorded as pending, not treated as a passing check.

## Parallel examples by story

| Story | Independent batch | Preconditions |
| --- | --- | --- |
| US1 | T014 profile tests, T015 stun tests, T016 ROAR integration tests | Foundation complete; separate files/fixtures, observe expected failures before implementation. |
| US2 | T025 action tests, T026 geometry tests, T027 lifecycle tests | Lion exercise/refinement complete; no shared runtime edits in this batch. |
| US3 | T035 selection, T036 role/reset, T037 offline/lifecycle tests | Both new characters integrated; isolate browser contexts and avoid shared server/state mutations. |
| US4 | T042 command workflow tests, T043 Blender preservation tests | Both actual skill reports exist; use isolated temporary output directories. |

## Implementation strategy

1. **First playable increment (US1)**: Integrate prerequisites, complete foundation and deliver Lion with an existing partner. Demonstrate ROAR normal/boss semantics and collect the first real workflow report. This is the suggested feature development MVP, not acceptance of the four-character product scope.
2. **Second increment (US2)**: Apply the refined skill to Plates; demonstrate fixed-aim throwing and produce the second genuine report.
3. **Complete integration (US3)**: Verify every duo, ordinary AI support, full reset and platform/cache behavior.
4. **Reusable outcome (US4)**: Validate safe future additions/updates and audit both skill exercises.
5. **Acceptance**: Complete physical device, offline, performance and five-player checks, then reconcile evidence and run all suites. Keep incomplete tasks open; do not equate generated documents or passing unit tests with accepted art/gameplay.

## Requirement coverage

| Requirements | Primary tasks |
| --- | --- |
| FR-001–003 definition, validation, presentation | T004–T010, T018, T029, T035, T038 |
| FR-004–006 Lion and stun | T014–T024 |
| FR-007–009 Plates and projectile | T025–T034 |
| FR-010 eligibility/meter | T014, T016, T021, T025, T027, T030 |
| FR-011–012 roles, solo, retry, compatibility | T005, T009, T035–T040, T048 |
| FR-013–014 genuine skill workflow/preservation | T006–T007, T011–T013, T017–T024, T028–T034, T042–T046 |
| FR-015 mobile/platform/readability | T023, T033, T037, T040, T047–T052 |
| SC-001–003 duo and precise Specials | T014–T016, T025–T027, T035–T041 |
| SC-004 two verified exercises | T024, T034, T042–T046, T051 |
| SC-005 style recognition | T050 |
| SC-006 solo/offline/performance | T036–T041, T048–T049 |


