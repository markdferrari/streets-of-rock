# Tasks: Cow and Crow Blender Models

**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [quickstart.md](quickstart.md). No external contracts apply.
**Branch**: `003-cow-crow-models`
**Tests**: Mandatory red–green–refactor under AGENTS.md, the constitution, and feature FR-010. Write behavioral tests, observe the expected failure, then implement. Define visual procedures before modeling. Import errors alone are not sufficient red-stage evidence.
**Organization**: Six phases; three user stories. All paths are repository-relative. `[P]` marks disjoint work that may run concurrently after its prerequisites; it does not authorize skipping a red-stage gate.
**Traceability**: FR/AC identifiers below refer to this feature's spec. Character identity supports PRD FR-032; neon presentation supports PRD FR-033. No task adds rigging, animation, GLB delivery, runtime integration, or playable Crow.

## Phase 1: Setup

**Purpose**: Preserve the working baseline and establish acceptance procedures without adding dependencies.

- [X] T001 Verify the current feature branch and active feature in `.specify/feature.json`, preserve unrelated edits, and record git status plus the bounded Blender version/clean-exit check from quickstart in `specs/003-cow-crow-models/validation/baseline.md`; use the verified execution context and normal approvals if the sandbox hangs (FR-009, FR-011).
- [X] T002 [P] Define the pre-modeling visual checklist and pending verdict fields in `specs/003-cow-crow-models/validation/results.md`, covering AC-001–AC-006, all views, edit/save/reopen, 160-pixel review, clothing intersections, relative scale, and owner approval (FR-010).
- [X] T003 [P] Add narrowly scoped Blender backup and smoke-output exclusions for `assets/characters/cow-crow/` to `.gitignore`, retaining trackability of the three final `.blend` files and ten final PNGs; use temporary directories for tests (FR-004–FR-006, FR-011).

## Phase 2: Foundational — Test and Command Infrastructure

**Purpose**: Establish a usable test runner and protected output handling before writing assets. No package installation or reusable asset platform is needed.

- [X] T004 Create `tests/blender/run_tests.py` using Blender's bundled `unittest` and standard-library subprocess/tempfile tools; discover `test_*.py`, verify an intentionally failing assertion propagates a nonzero exit, enforce 120-second metadata/reopen subprocess timeouts, clean up children, and record harness verification in `specs/003-cow-crow-models/validation/baseline.md` (FR-009, FR-010).
- [X] T005 Write failing command-boundary tests in `tests/blender/test_cli.py` for required output arguments, unsupported Blender version checks, existing-target refusal, unwritable destinations, and explicit overwrite preserving unrelated files; use minimal entry-point stubs as necessary so failures demonstrate behavior, and record red evidence in `specs/003-cow-crow-models/validation/baseline.md` (FR-009, AC-009).
- [X] T006 Implement the tested argument parsing and output preflight in `scripts/blender/generate.py` and `scripts/blender/render.py`, with `--output-dir`, `--overwrite`, render-only `--smoke`, known-target preflight before writes, clear diagnostics, and nonzero errors; make T005 pass without implementing character geometry (FR-009).

**Checkpoint**: Runner, error propagation, and protected destinations work. All later test cases must still fail for the behavior they introduce before that behavior is implemented.

## Phase 3: User Story 1 — Inspect and Edit the Characters (P1)

**Goal**: Deliver two recognizable, editable individual character files.
**Prerequisites**: T001–T006.
**Independent test**: Generate individual files in a temporary directory, reopen each in a fresh Blender process, inspect semantic parts/materials and finite geometry, edit/save/reopen a temporary copy, and visually inspect both characters against AC-001–AC-003. Comparison scenes and final renders are not prerequisites for this increment.

### Tests first

- [X] T007 [P] [US1] Write character generation/reopen tests in `tests/blender/test_assets.py` for exactly one correct character collection per individual scene, required semantic parts, names, ground origin/Z-up/-Y orientation, initial 2.0 m Cow and 1.6 m Crow heights, nonempty finite geometry, editable modifiers, material assignments, and no missing external dependencies (FR-001–FR-004, FR-008; AC-001–AC-003).
- [X] T008 [P] [US1] Write editability tests in `tests/blender/test_editability.py` that change a material color and mesh vertex in a temporary scene, save/reopen in a fresh process, and assert changes survive; check simple Principled material structure without demanding a GLB export (FR-004, FR-008; AC-003).
- [X] T009 [US1] Run T007–T008 tests before implementing the models, confirm missing outputs/parts or failed edit persistence are the expected failures, and record commands/assertions in `specs/003-cow-crow-models/validation/results.md` (FR-010).

### Implementation and verification

- [X] T010 [US1] Build Cow in `scripts/blender/characters.py`: broad stocky body, black biker jacket, rounded muzzle, cream horns, ears, black/white markings, expressive determined eyes, slightly spread arms, sturdy legs, and chunky boots; use named editable meshes, smooth shading, bevel/subdivision, and solid Principled materials (FR-001, FR-003, FR-004, FR-008; AC-001).
- [X] T011 [US1] Build Crow in `scripts/blender/characters.py`: smaller wiry body, brown aviator jacket/cream collar, dark feathers, prominent beak, expressive determined eyes, birdlike feet, and partially open full feather wings through shoulder openings; exclude extra back wings and humanoid hands (FR-002–FR-004, FR-008; AC-002).
- [X] T012 [US1] Implement clean individual-scene assembly and native saving in `scripts/blender/generate.py`, producing `assets/characters/cow-crow/cow.blend` and `assets/characters/cow-crow/crow.blend` with self-contained parts/materials and protected output semantics; keep the command incremental until comparison support arrives in T019 (FR-004, FR-007, FR-008; AC-003).
- [X] T013 [US1] Make all US1 tests pass through fresh-process reopening and edit persistence, refactor shared geometry/material helpers in `scripts/blender/characters.py` while retaining passing checks, and record green results in `specs/003-cow-crow-models/validation/results.md` (FR-004, FR-008, FR-010).
- [X] T014 [US1] Inspect both native scenes against the predefined design checklist, correct shape/shading/intersection issues in `scripts/blender/characters.py`, regenerate affected individual assets, rerun affected checks, and record findings in `specs/003-cow-crow-models/validation/results.md`; defer final owner acceptance to T033 after previews are ready (FR-001–FR-004; AC-001–AC-003).

**Checkpoint**: Two editable concept models can be demonstrated independently. This is the suggested first increment, not completion of the full feature.

## Phase 4: User Story 2 — Review Appearance and Relative Scale (P1)

**Goal**: Deliver a shared comparison scene and ten consistent, complete previews.
**Prerequisites**: US1's generated models and passing automated checks; preliminary visual findings recorded. Final owner approval does not block making reviewable previews.
**Independent test**: Starting from saved models, create/reopen the comparison scene, smoke-render, then review the eight individual and two duo PNGs for full framing, scale, lighting consistency, readability, and intersections (AC-004–AC-006).

### Tests first

- [X] T015 [P] [US2] Write scene/camera tests in `tests/blender/test_presentation.py` for common ground, two correct character collections, Cow's greater height and torso breadth, nonoverlapping evaluated silhouettes, named cameras/light collections, and whole-character camera framing with 10% image margins including horns/wings; compare material/geometry signatures across individual/comparison assets and lighting variants (FR-005, FR-006; AC-004–AC-005).
- [X] T016 [P] [US2] Write render tests in `tests/blender/test_render.py` for loading saved scenes rather than rebuilding edited models, exact ten output names/dimensions, a decodable 128×128 smoke image, full-batch settings, and nonzero render failures; use small test renders and configuration checks instead of rerendering all final images per test run (FR-005, FR-006, FR-009; AC-004–AC-005).
- [X] T017 [US2] Run the new presentation/render tests, observe failures before implementing those behaviors, and record red evidence in `specs/003-cow-crow-models/validation/results.md` (FR-010).

### Implementation and verification

- [X] T018 [US2] Implement ground, bounds-based spacing/framing, front/side/back/three-quarter cameras, duo camera, and neutral/neon light collections in `scripts/blender/presentation.py`; use Cycles CPU, seed 0, denoising, AgX, PNG RGB, fixed duo camera, and unchanged character materials across lighting variants (FR-005, FR-006; AC-004–AC-005).
- [X] T019 [US2] Extend `scripts/blender/generate.py` to save `assets/characters/cow-crow/comparison.blend` with both models and the presentation objects, and save individual cameras/neutral lighting in both character files; preserve shared character geometry/materials and a visible gap between evaluated bounds (FR-004–FR-008; AC-004–AC-005).
- [X] T020 [US2] Implement `scripts/blender/render.py` to load the saved files and render eight 1024×1024 individual PNGs and two 1600×1000 duo PNGs at 64 samples, plus the separate 128×128/8-sample `--smoke` path; retain overwrite preflight, avoid rebuilding geometry, and never resave source scenes merely to render (FR-005, FR-006, FR-009).
- [X] T021 [US2] Run the presentation/render tests and smoke command, verify successful clean process exit and a readable image, and record green/smoke evidence in `specs/003-cow-crow-models/validation/results.md` before launching the full batch (FR-005, FR-006, FR-010).
- [X] T022 [US2] Generate the complete three-scene set and ten final previews under `assets/characters/cow-crow/` using the documented commands and 30-minute batch timeout; validate every PNG's dimensions/readability and record output paths and exit statuses in `specs/003-cow-crow-models/validation/results.md` (FR-004–FR-006; AC-004–AC-005).
- [X] T023 [US2] Review full-size and approximately 160-pixel previews, fix visual issues in `scripts/blender/characters.py` or `scripts/blender/presentation.py`, regenerate/recheck affected outputs, and record review findings plus pending owner verdict in `specs/003-cow-crow-models/validation/results.md` (FR-003, FR-010; AC-006).

**Checkpoint**: All scenes and previews are reviewable. Owner acceptance remains explicit; continue independent US3 work while awaiting feedback.

## Phase 5: User Story 3 — Regenerate and Validate the Assets (P2)

**Goal**: Complete the documented repeatable workflow and trustworthy automated validator.
**Prerequisites**: Generated scenes and working presentation/rendering from US1/US2. No dependency on owner appearance approval.
**Independent test**: Follow quickstart in fresh temporary directories; generate twice, reopen all scenes in new processes, compare semantic properties at 1e-5 tolerance, exercise errors/overwrite protection, reject intentionally damaged assets, and smoke-render (AC-007–AC-009).

### Tests first

- [X] T024 [P] [US3] Add workflow regression tests in `tests/blender/test_workflow.py` for two independent generations preserving names/materials/bounds at 1e-5 tolerance, full-set overwrite refusal before any target changes, explicit overwrite preserving unrelated files, partial-output recovery, and renderer preservation of source-file bytes (FR-007, FR-009; AC-007–AC-009).
- [X] T025 [P] [US3] Add validator tests in `tests/blender/test_validation.py` using valid and deliberately damaged temporary scenes (missing semantic part/material, invalid geometry, missing presentation object/dependency) and a short-lived timeout fixture; assert report schema, failure diagnostics, nonzero status, and timeout rejection even after a printed success marker (FR-008–FR-010; AC-007).
- [X] T026 [US3] Run the new workflow/validator tests and record expected failures in `specs/003-cow-crow-models/validation/results.md`; existing foundation protection cases should remain green, with new tests exposing unimplemented validation or full-workflow behavior (FR-010).

### Implementation and verification

- [X] T027 [US3] Implement `scripts/blender/validate.py` with `--output-dir` and `--report`, fresh-process checks of all three scenes, 120-second child timeouts/cleanup, required parts/materials/geometry/presentation checks, and JSON fields `blender_version`, `python_version`, `checks`, `passed`; return nonzero on any failure without implying visual approval (FR-008–FR-010; AC-007).
- [X] T028 [US3] Resolve failures demonstrated by T024 in `scripts/blender/generate.py` and `scripts/blender/render.py`, preserving deterministic semantic results, complete-target preflight, readable failure/recovery guidance, and existing manual edits unless explicitly overwritten; keep all prior tests green (FR-007, FR-009; AC-008–AC-009).
- [X] T029 [US3] Execute and update `specs/003-cow-crow-models/quickstart.md` against actual entry points, flags, output filenames, supported versions, timeout behavior, overwrite protection, and approved execution context; confirm no extra dependency was introduced (FR-007, FR-009; AC-007–AC-009).
- [X] T030 [US3] Run the complete Blender test suite plus validator and clean-directory generation/smoke workflow, record all exit statuses and reports in `specs/003-cow-crow-models/validation/results.md`, and clearly separate automated pass from pending appearance approval (FR-007–FR-010; AC-007–AC-009).

**Checkpoint**: The complete asset workflow is reproducible and validated without a running game.

## Phase 6: Polish and Cross-Cutting Acceptance

- [X] T031 Run `bun run test` and `bun run build` alongside the completed Blender checks, inspect `dist/` and its generated precache manifest for accidental authoring assets, and record commands/results or baseline blockers in `specs/003-cow-crow-models/validation/results.md`; all existing tests must pass before any conventional commit (FR-011, SC-005).
- [X] T032 Verify the three native files and ten final PNGs in `assets/characters/cow-crow/` are tracked candidates rather than ignored/generated web inputs, remove only feature-owned temporary artifacts, and record deliverable sizes and dependency/requirement coverage in `specs/003-cow-crow-models/validation/results.md` (FR-004–FR-011, SC-001–SC-005).
- [X] T033 Present the actual models and ten previews for owner review; record accepted/changes requested in `specs/003-cow-crow-models/validation/results.md`, address requested visual revisions in `scripts/blender/characters.py` or `scripts/blender/presentation.py`, and rerun affected checks/renders before acceptance; leave this task unchecked while the verdict is pending (FR-010, AC-006, SC-004).
- [X] T034 Reconcile actual outcomes and remaining limitations across `specs/003-cow-crow-models/spec.md`, `specs/003-cow-crow-models/plan.md`, `specs/003-cow-crow-models/quickstart.md`, and `specs/003-cow-crow-models/tasks.md`; mark only evidenced completions and confirm runtime/device/offline acceptance remains deferred to integration (FR-010, FR-011).

## Dependencies and Execution Order

```text
Setup T001 → (T002 || T003)
  → Foundation T004 → T005 red → T006 green
  → US1 (T007 || T008) → T009 red → T010 → T011 → T012 → T013 green → T014 review
  → US2 (T015 || T016) → T017 red → T018 → T019 → T020 → T021 smoke/green → T022 → T023 review
  → US3 (T024 || T025) → T026 red → T027 → T028 → T029 → T030 green
  → T031 → T032 → T033 owner acceptance → T034 reconciliation
```

Story completion order is US1 → US2 → US3 for engineering work; owner appearance acceptance is the final gate. US2 consumes US1 models; US3 verifies the combined pipeline. Each story can be tested independently once its explicitly stated prerequisites exist. Preliminary visual defects can be fixed before proceeding, but waiting for owner feedback must not block unrelated automated verification. After any late visual correction, repeat affected validation/build exclusion checks as appropriate before declaring completion.

Tests are written before the behavior they cover. T006 establishes output protection before the first saved file; US3 extends coverage to the complete workflow. Character code shares one module, so Cow/Crow implementation tasks are sequential. Shared evidence-file updates are also sequential.

## Parallel Execution Examples

Only use these pairs after their listed prerequisites. `[P]` describes scheduling opportunities, not a request to spawn agents.

| Work | Prerequisites | Disjoint work that can proceed together |
| --- | --- | --- |
| Setup | T001 | T002 checklist and T003 ignore rules |
| US1 | T001–T006 | T007 `test_assets.py` and T008 `test_editability.py` |
| US2 | US1 checkpoint | T015 `test_presentation.py` and T016 `test_render.py` |
| US3 | US2 engineering checkpoint | T024 `test_workflow.py` and T025 `test_validation.py` |

Each pair is followed by a shared red-stage verification task before production implementation. Test modules are separated solely to keep responsibility and file ownership clear; the runner discovers all of them.

## Requirement Coverage

| Requirement / acceptance | Main tasks |
| --- | --- |
| FR-001 / AC-001 Cow | T007, T009–T010, T012–T014, T023, T033 |
| FR-002 / AC-002 Crow | T007, T009, T011–T014, T023, T033 |
| FR-003 / AC-006 style and recognition | T002, T010–T011, T014, T023, T033 |
| FR-004 / AC-003 editable native assets | T007–T014, T019, T022, T032 |
| FR-005 / AC-004 individual previews | T015–T023 |
| FR-006 / AC-005 comparison and lighting | T015–T023 |
| FR-007 / AC-007–AC-008 reproducibility | T012, T019, T024, T026, T028–T030 |
| FR-008 / AC-003, AC-007 portable materials/reopening | T007–T013, T025–T027, T030 |
| FR-009 / AC-007, AC-009 errors/protection | T001, T004–T006, T016, T020–T021, T024–T030 |
| FR-010 / AC-006 test-first and visual evidence | T002, T004–T009, T013–T017, T021, T023–T027, T030, T033–T034 |
| FR-011 / SC-005 runtime exclusion | T001, T003, T031–T032, T034 |

## Implementation Strategy

1. Deliver Setup + Foundation + US1 first: two editable models are the smallest useful demonstration. Validate that increment without claiming completion of the ten-preview feature.
2. Add US2 to make appearance and relative scale reviewable. Complete low-resolution smoke validation before the full render batch.
3. Add US3 to finish reproducibility, failure-path validation, and the runnable contributor guide; retain earlier protection checks throughout.
4. Complete regression/bundle evidence, owner review, and documentation reconciliation. Owner review was accepted. Report the unrelated Chromium meter-gain test as an open repository test gate; do not commit while any existing automated test fails.

No device, offline, or five-player acceptance tasks are added because runtime behavior is unaffected. Those gates remain required for later integration. No code, model, or test implementation is performed by task generation itself. Do not commit unless requested; any eventual commit must use conventional format after all existing automated tests pass and must preserve unrelated user changes.
