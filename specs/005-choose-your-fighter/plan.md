# Implementation Plan: Choose Your Chieftain

**Branch**: `005-choose-your-fighter` | **Date**: 2026-09-27 | **Spec**: [spec.md](spec.md)

**Input**: `specs/005-choose-your-fighter/spec.md`

## Summary

Replace the Start screen with portrait-grid fighter selection, different AI partner selection, animated previews, and readiness-gated countdown. Separate character identity from player/partner control throughout the simulation. Reuse Three.js, DOM UI, the fixed simulation loop, and the existing asset store. Make RunSession the single session-state owner used by GameApp and tests.

Complete the currently absent settings/audio/offline entry prerequisites required by this feature rather than treating installed dependencies as working functionality. This is a design handoff; runtime implementation, regenerated assets, physical-device evidence, and owner soundtrack acceptance remain outstanding.

## Technical Context

**Language/Version**: TypeScript 6.0.3, ES2022 build target; Bun 1.4.2 (manifest and installed version).

**Primary Dependencies**: Existing Three.js 0.186.0, Vite 8.3.0, vite-plugin-pwa 1.3.0, Workbox 7.4.1. Keep bun.lock and exact versions; add no UI/state-machine dependency. Existing Blender workflow requires 5.2.x for asset export.

**Storage**: In-memory selection/run assignment; retain existing best-result/tutorial storage. Add versioned local preferences with guarded access and full-build Cache Storage through Workbox. No backend, accounts, or telemetry.

**Testing**: Vitest 4.1.11 covers unit and integration suites; Playwright 1.63.0 covers Chromium/WebKit; Blender bundled unittest validates authored assets. Commands and manual procedures are in [quickstart.md](quickstart.md).

**Target Platform**: Landscape iOS Safari and Android Chrome, tabs and installed PWA where available; desktop mouse and keyboard selection. iPhone 12 and Pixel 6 remain reference devices.

**Project Type**: Single browser game with deterministic simulation, DOM controls, Three presentation, and platform adapters.

**Performance Goals**: Target 60 fps; at least 30 fps in busiest encounter during complete runs on both reference devices with either fighter. Provisional budgets inherited from 001: 30 MiB complete required build, 16 MiB maximum asset, 100k visible triangles, 100 draw calls, DPR capped at 1.5. Measure the complete soundtrack-inclusive build.

**Constraints**: No hidden-page countdown or combat, no carried selection input, no duplicate roster identity, no active-session update, complete cached replay. Asset failure blocks entry; audio failure permits silent play without falsely claiming complete offline readiness.

**Scale/Scope**: Two production characters, both role assignments, one existing level; twelve-entry fixture for grid growth. Full-body previews reuse existing models. Additional production fighters and distinct movesets remain deferred.

## Constitution Check

Both reviews assess the design and required verification, not runtime acceptance.

| Gate | Before research | After design |
| --- | --- | --- |
| Specification-led delivery | PASS: approved spec and PRD 2.2 explicitly expand roles; constitution 1.1.0 permits it. | PASS: feature FR-001–014 mapped below; tuning separated from obligations and exclusions. |
| Touch combat | PASS: both roles require control and animation regressions plus real phone checks. | PASS: role selectors, fresh-input barriers, safe-area grid, no-colour-only feedback, and explicit resume defined. |
| Test-first implementation | PASS: retain existing Vitest, Playwright, and Blender tooling. | PASS: each implementation increment starts with failing behavioral tests; quickstart defines device procedures before visual changes. |
| Mobile-web reliability | PASS with planned investigation of actual platform support; no waiver of offline/audio/settings. | PASS: missing platform adapters explicitly included; loading, full precache, range media, interruption, storage fallback, and natural waiting-worker policy specified. |
| Focused scope and measured quality | PASS: use installed dependencies and approved shared-action scope. | PASS: asset reuse, full-build budgets, both phone measurements, and five-player selection plus existing combat gates retained. |
| Delivery discipline | PASS: existing feature branch; preserve prior uncommitted specification edits. | PASS: conventional commits only after all existing suites pass; acceptance evidence remains pending until run. |

No constitutional exception is required. Final track delivery and real-device access are acceptance dependencies, not unresolved technical choices. Technical planning is complete; do not mark gameplay accepted from this document.

## Project Structure

### Documentation (this feature)

```text
specs/005-choose-your-fighter/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── selection-ui.md
│   └── runtime.md
└── checklists/requirements.md
```

`tasks.md` is the next command's output and is not created by this workflow.

### Source Code (repository root)

```text
src/
├── content/characters.ts           # new pure roster/tuning registry
├── game/                          # role-based actor types/selectors and rules
│   └── ai/partner.ts              # generalize existing crow support behavior
├── app/
│   ├── selection.ts               # new deterministic selection reducer
│   ├── countdown.ts               # new injected-clock countdown
│   ├── session.ts                 # sole session lifecycle owner
│   └── game-app.ts                # browser adapter for session and rendering
├── ui/selection.ts                # new grid, stat bars, duo/status markup
├── presentation/                  # asset store, preview renderer, gameplay scene
├── platform/                      # settings, audio, PWA/readiness adapters
└── sw.ts                          # full-build precache and cached media routes
assets/characters/cow-crow/         # existing sources; expanded clips and portrait exports
public/assets/                    # bundled prepared music/SFX and PWA icons
scripts/                           # Blender workflow and full asset/precache audit
tests/{unit,integration,e2e,blender}/
```

**Structure Decision**: Extend existing boundaries. The roster contains no DOM/Three objects; presentation resolves static asset imports by identity. Selection and countdown rules remain testable without rendering. No new application framework or generic character engine.

## Design and Data Flow

1. Read pure roster data; validate at least two complete entries and distinct IDs. Render the accessible grid and load preview assets with actionable failure feedback. Use pre-rendered portraits so the grid does not allocate a WebGL context per tile.
2. Selection reducer owns focus/preview/confirmation; browser input supplies one activation per gesture. Back invalidates partner state. Confirmation freezes an immutable duo.
3. RunSession requests preparation tagged with a monotonically increasing generation. GameApp loads required visuals, disposes the preview renderer, creates an unstepped run and gameplay scene, and renders its initial frame behind the duo overlay. Only a matching generation may signal ready or failure.
4. After readiness and any required explicit Resume, countdown consumes three seconds of foreground active time. Frozen duo portraits remain visible. At completion clear pointers, pending actions, held keys, event queues, and fixed-loop accumulator, then start gameplay clock and simulation exactly once.
5. The run resolves player/partner through role selectors; identity selects stats, models, clips, and names. Retry prepares a fresh run with the same duo; homepage/reload clears assignment and disposes session views.
6. Selection preserves state across interruption. Locked loading may finish in the background but cannot start countdown until explicit Resume. Countdown and gameplay remember their resume target independently. Settings pause preview motion and never advance countdown.

### Identity and actions

Adopt `PlayerState` and `PartnerState` discriminated by `role`, with `characterId` on allies. Enemy roles remain their archetype. Add `getPlayer`/`getPartner`; remove identity-based control decisions from movement, actions, damage, projectiles, pickups, enemy targeting, partner AI, camera, encounters, HUD, tutorials, effects, and test helpers.

Use semantic player moves `light1`, `light2`, `light3`, `heavy`, `special`, plus partner `support`; keep enemy move IDs. Map semantic moves to authored clips by identity. Preserve Cow player tuning and existing support damage ordering; do not replace the partner direct-hit path with player combat machinery.

Provisional Crow player tuning and stat scales are fixed in [data-model.md](data-model.md) for implementation, with later playtest adjustment permitted. Extend Crow's exported Dodge and player-action clips; reuse Cow Light animation for Cow support through an explicit mapping. Missing required clips fail readiness rather than silently holding an old pose.

### Presentation and resource ownership

Use charcoal/neon venue colours, heavy system-font headings, chunky portrait borders, and a visible textual selected/unavailable state. At landscape widths of 768 CSS px and above use a 42% roster / 58% preview split; below this use equal columns with independently scrollable roster and compact preview. Minimum interactive target is 44 CSS px; safe-area padding applies to the whole page. Two entries fill a two-column roster; larger rosters use responsive columns with a minimum 96 CSS px tile width. Portrait orientation shows rotate guidance while preserving selection.

Render 512×512 PNG portraits from the existing approved Blender characters using a fixed head/shoulders camera; bundle them as imported URLs. No image-generation dependency or new art direction. Preview uses one Three canvas with an Idle clip and framed full body. Reduced motion fixes Idle at time zero and removes decorative transitions. Cap preview DPR at 1.5 and suspend animation when hidden, unfocused, portrait, or covered by settings. Stop mixers and dispose preview-owned GPU resources when leaving; shared asset templates/materials remain store-owned. Gameplay preparation starts only after preview renderer disposal, bounding simultaneous WebGL contexts to one.

### Required platform prerequisites

The repository currently has no working settings/audio/worker despite PRD requirements. Implement the minimum adapters as part of feature completion: independent music/SFX controls and shake preference on homepage/pause; local-storage fallback; gesture-unlocked audio with silent failure; full-build offline inventory and update status. Keep existing best-time and tutorial keys compatible.

Reuse the 001 design: injectManifest worker with explicit full precache, cached MP3 range responses, no `skipWaiting` or `clientsClaim`. Show pending updates at homepage/results, directing users to close all game windows and reopen. Never force reload during selection preparation, countdown, running, or paused play. Offline-ready requires a successful current-build cache audit, never just a stored flag. Upgrade the existing audit script beyond its current index-file check.

## Implementation Ordering and Traceability

Each row becomes test-first tasks in the next phase, followed by implementation and refactoring with green tests.

| Increment | Feature requirements | Acceptance evidence |
| --- | --- | --- |
| Roster and role separation | FR-003, FR-009–010, FR-012 | US1 preview stats; US3 scenarios 3–4; parameterized combat, AI, outcomes, HUD, and camera tests for both duos; preserve old Cow numeric regressions. |
| Selection and accessible input | FR-001–006, FR-012–013 | US1–2 and US4 scenarios 1–2; switching, Back, cancellation, focus, held keys, larger roster and reduced motion. |
| Expanded clips, portraits, preview assets | FR-003, FR-007, FR-013 | Export/mapping coverage, resource disposal tests, load retry and actual phone animation inspection. |
| Single lifecycle and ready/countdown flow | FR-007–008, FR-011 | US3 scenarios 1–2/5–7; fake clock, stale promises, interruption, launch-once, full reset, role-aware browser helpers. |
| Audio/settings/cache/update prerequisites | FR-001, FR-014 | US4 scenarios 3–4; complete inventory audit, media range tests, storage/audio failure, offline relaunch, two-build/two-tab update checks. |
| Complete integration and acceptance | FR-001–014 | All feature SC-001–006, PRD SC-001–008, both phone frame records, five-player evaluation, all automated suites and build audits. |

## Phase Outputs and Delivery

- Phase 0: [research.md](research.md) records resolved technical decisions and alternatives with repository evidence.
- Phase 1: [data-model.md](data-model.md), [UI contract](contracts/selection-ui.md), [runtime contract](contracts/runtime.md), and [quickstart.md](quickstart.md) define the handoff.
- No public network API or saved-run migration. Internal TypeScript consumers and tests must migrate together; existing preference/tutorial/best-time data remains readable.
- Ship as one static build containing both roles and all new assets after automated and applicable manual gates. No feature flag or server deployment is needed for this planning phase. Release evidence records build identity, browsers, devices, complete asset size, frame timing, and outstanding soundtrack status.
