# Implementation Plan: Visible Joystick and Four-Button Combat

**Branch**: `feat/revised_controls` (actual Git branch; SpecKit directory identifier `002-revised-controls`) | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-revised-controls/spec.md`.

## Summary

Replace the floating, hidden movement control with a visible fixed joystick and change the right controls to a labelled Light/Heavy/Dodge/Special diamond. Preserve the existing Light combo, Dodge, and Bovine Spin, and add one slower, stronger Heavy strike. Extend pointer and simulation contracts to retain action order and source touch so one buffered action can be replaced or canceled correctly. Keep game rules deterministic, the build static and AWS-compatible, and final acceptance tied to real-phone and five-player checks.

## Technical Context

**Language/Version**: TypeScript 6.0.3, Bun 1.4.2, JavaScript browser runtime.
**Primary Dependencies**: Three 0.186.0, Vite 8.3.0, `vite-plugin-pwa` 1.3.0; no new package for controls.
**Storage**: Existing browser local storage for settings/tutorial/best time, with in-memory fallback; no run-state persistence. Existing service-worker asset cache remains the PWA delivery mechanism when implemented.
**Testing**: Vitest 4.1.11 for deterministic unit/integration behavior; Playwright 1.63.0 for Chromium/WebKit browser integration; manual iPhone 12 Safari and Pixel 6 Chrome checks. Commands: `bun run typecheck`, `bun run test:unit`, `bun run test:e2e`, `bun run build`; full pre-commit gate `bun run test`.
**Target Platform**: Landscape mobile Safari on iPhone 12 and Chrome on Pixel 6, in browser and installed PWA where supported; static HTTPS deployment compatible with AWS S3/CloudFront.
**Project Type**: Single-project mobile browser game/PWA with deterministic simulation and DOM/Three presentation.
**Performance Goals**: 60 fps target and 30 fps minimum during the busiest encounter in a complete run on both phones; retain 3–5 minute successful active-run target.
**Constraints**: Simultaneous independent touches, responsive safe-area layout down to the existing 568×320 CSS-pixel contract, no stuck or latent action on interruption, legible feedback when muted/no-shake, no backend or extra runtime library.
**Scale/Scope**: One level, Cow plus Crow, four action buttons, one fixed joystick, one new Heavy move and prompt; no additional character, level, or network interface.

## Constitution Check

*GATE: checked before research and rechecked after design. All six planning gates pass. Current browser test failures block a later commit, so the plan includes their repair and does not claim implementation acceptance.*

| Gate | Before Phase 0: evidence and planned verification | After Phase 1: decision |
| --- | --- | --- |
| Specification-led delivery | PRD v2.1 and feature spec align FR-006/009/012/014/038–040 with CTRL-AC-001–013; deferred items and provisional tuning are explicit. Existing MVP plan/tasks/contracts need a superseding control contract. | Pass: [controls contract](contracts/controls.md) supersedes original joystick/input clauses; task generation must reconcile the MVP backlog without treating historical pass results as revised-controls evidence. |
| Touch combat | Owner selected visible fixed stick and four-button diamond; spec covers independent touches, cancellation, safe areas, mute/no-shake, and explicit Resume. | Pass: contract defines ownership/cancellation and phone procedure checks reach, warnings, and feedback. |
| Test-first implementation | `AGENTS.md` and constitution require red–green–refactor, all tests before commit. Current baseline is 58 Vitest pass; 4 of 10 browser cases fail on old tutorial/meter assumptions. | Pass as planning rule: repair existing cases with meaningful evidence, then write/observe failing tests for each new behavior before code. No commit until full suite passes. [Quickstart](quickstart.md) records sequence. |
| Mobile-web reliability | Controls intersect lifecycle, local prompt storage, and offline delivery; audio/loading/PWA work is already in MVP scope and not complete. | Pass: contract specifies clearing/resume/storage and quickstart retains audio, loading, offline, installation, and safe-update regression checks when those systems exist. No new remote service. |
| Focused scope and measured quality | Same pinned stack and procedural Three assets; Heavy and visible controls meet the owner's requested UX change. Phone/playtest evidence is pending. | Pass: no new dependency or asset pipeline; record phone frame intervals, stalls, action reach, five-player SC-001/004/007 and MVP SC-002/003. |
| Delivery discipline | Git reports `feat/revised_controls`; user requested milestone commits earlier. Existing tests fail, so no current commit is authorized under the repository's pass-all-tests rule. | Pass: implementation tasks must establish a passing baseline and full passing suite/build before each conventional milestone commit; record remaining device/asset evidence honestly. |

## Project Structure

### Documentation (this feature)

```text
specs/002-revised-controls/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── controls.md
└── checklists/
    └── requirements.md
```

`tasks.md` is generated in the next SpecKit phase. The existing `specs/001-neon-velvet-mvp/` plan and tasks remain the MVP baseline; control-specific clauses in its runtime contract are superseded by this feature contract. During task generation, mark affected MVP control tasks as replaced or dependent on feature 002, and refresh their acceptance mapping without erasing unfinished unrelated work.

### Source Code (repository root)

```text
src/
├── input/                 # pointer ownership, ordered action requests, sampled frame
├── game/                  # Cow action states, attacks, hits, meter, table interactions
├── content/               # adjustable move/balance tuning
├── app/                   # DOM composition, lifecycle, interruption, result/retry
├── ui/                    # responsive controls, HUD/readiness, contextual tutorial
├── presentation/          # existing Three scene and Heavy action pose/effect
└── platform/              # existing local persistence boundary

tests/
├── unit/                  # pure combat and tuning rules
├── integration/           # pointer/touch, tutorial/storage, lifecycle contracts
└── e2e/                   # visible layout and browser flows in Chromium/WebKit
```

**Structure Decision**: Extend the current single-project browser game. `PointerControls` owns browser touch identity, `InputFrame` carries ordered requests and canceled IDs, and `stepRun` remains the deterministic authority for eligibility, buffering, action state, hit registration, and meter. Presentation reads state/events and does not decide combat outcomes. Do not introduce a control library, framework, backend, or native shell.

## Implementation Design

1. **Restore test baseline before milestone work.** The current four browser failures concern `Dodge attacks` and `Special 10%` expectations from the older training encounter while Start now enters the full first wave. Inspect the rendered prompt and actual enemy position; update fixtures/assertions to set up a reachable target and prompt preconditions. Keep behavior-focused assertions. Run full suite green before committing any documentation or code milestone.
2. **Input and control surface.** Introduce the persistent ring/knob and four-button diamond, keeping HUD priority and safe insets. Limit movement activation to a down within the rendered ring. Replace floating anchor movement with fixed-centre clamped output. Capture touches independently. Emit ordered one-shot action requests with source pointer IDs and cancellation IDs; preserve normal taps across `lostpointercapture`. Define layout at the existing 568×320 lower bound and verify on both phones before locking dimensions.
3. **Deterministic combat.** Extend `MoveId`, input state, Cow action transition, attack instance, damage knockback, meter, and table handling for Heavy. Initial provisional values are in [research](research.md). Keep one eligible pending action and same-tick Special > Dodge > Heavy > Light priority. An unavailable request reports once and cannot erase a valid pending one. Store source ID for canceling a still-buffered request. No recovery cancel or repeated hold input. Move timing/damage values to tuning data and preserve the Light combo deadline and simultaneous-defeat rule.
4. **Player feedback and teaching.** Add pressed states and text/shape readiness to the buttons, with redundant HUD values. Teach movement/Light first, Heavy during encounter one, Dodge on warning, and Special when ready. Retain the legacy `attack` progress ID for Light and add an independent `heavy` ID. Use the existing safe local-storage boundary or in-memory fallback without touching settings/best time.
5. **Integration and final evidence.** Clear both adapter and Cow buffer on pause, hidden/blur, portrait, result, retry, and geometry-invalidating resize. Keep active time/audio paused and require explicit Resume. Update affected MVP runtime-control contract references and browser tests. Validate static build and complete PWA regressions when the still-pending MVP audio/cache work is available. Run phone and five-player procedures in [quickstart](quickstart.md), record OS/browser, frame timing, stalls, touch misses, grip changes, and gameplay outcomes. The feature is accepted only after all CTRL-AC cases and relevant PRD gates pass.

## Phase 0 Research and Phase 1 Design

- [Research decisions](research.md): fixed touch ownership, ordered requests, Heavy tuning, layout, tutorial migration, existing test baseline, and static delivery.
- [Data model](data-model.md): movement/action touch state, sampled input, pending Cow action, Heavy attack, readiness, and prompt persistence.
- [Player/runtime contract](contracts/controls.md): visible controls and input/lifecycle obligations superseding the original MVP control clauses.
- [Quickstart](quickstart.md): reproducible automated, phone, offline, performance, and five-player validation procedures.

**Post-design constitution recheck:** All six planning gates above remain satisfied. No unresolved technical clarification or complexity exception is needed. Browser tests and actual device/player results remain pending implementation and are explicitly recorded as such.
