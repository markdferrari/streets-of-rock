# Implementation Plan: Combat View and AI Partner Improvements

**Branch**: `006-combat-view-partner` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: `specs/006-combat-view-partner/spec.md`

## Summary

Make the partner engage reachable enemies without a distance tether, face actual movement, and regroup naturally inside the visible arena. Replace oversized fixed camera extents with room-fit orthographic framing that retains the existing angle and accommodates both active allies during travel. Promote the existing HUD GO text into a dedicated directional overlay derived from progression state.

Implement against feature 005's selected-role model. Its role, session and platform prerequisites are not yet present in this checkout; integration is an explicit dependency, not evidence of completed behavior. This feature replaces its obsolete partner follow/recovery policy without rebuilding its homepage or adding graphics content.

## Technical Context

**Language/Version**: TypeScript 6.0.3, ES2022, Bun 1.4.2 as pinned in package.json.

**Primary Dependencies**: Existing Three.js 0.186.0 and Vite 8.3.0; reuse feature 005's platform adapters and installed PWA/Workbox dependencies. No added runtime package, navigation engine or rendering pipeline.

**Storage**: Transient partner intent, obstruction observations and camera transition state only. No persistence/schema migration; retain baseline settings/tutorial/best-result data.

**Testing**: Vitest 4.1.11, Playwright 1.63.0 Chromium/WebKit, existing Blender regression suite. See [quickstart.md](quickstart.md).

**Target Platform**: Landscape mobile Safari and Android Chrome, reference iPhone 12 and Pixel 6; browser and installed offline modes inherited from 005.

**Project Type**: Existing deterministic browser game with Three presentation and DOM controls.

**Performance Goals**: Target 60 fps, at least 30 fps in the busiest encounter on both phones with either partner. Retain 005 budgets: 30 MiB full build, 16 MiB per asset, 100k visible triangles, 100 draw calls, DPR ≤1.5. Camera changes can expose more scenery during transitions; measure full runs, not empty rooms.

**Constraints**: Unchanged room geometry, camera angle, player/partner speeds, combat strength, wave composition and abilities. No distance-triggered repositioning, no hidden active-time progression, no new art assets beyond a code-native arrow.

**Scale/Scope**: Four existing rooms and three room exits; two selected-role assignments. No new enemies, levels, abilities, commands, or aggression setting.

## Constitution Check

| Gate | Before research | After design |
| --- | --- | --- |
| Specification-led delivery | PASS: PRD 2.3/feature 006 authorize changed AI/view/cue rules. | PASS: all FR-001–012 mapped below; 005 supersession and unchanged scope explicit. |
| Touch combat | PASS: presentation and AI affect readability and require device checks. | PASS: overlay hit testing, both-role aggression/facing, safe areas, telegraphs and interruption procedures specified. |
| Test-first implementation | PASS: existing tooling and TDD required. | PASS: pure camera/intent/cue contracts enable failing tests before implementation; visual procedures defined before changes. |
| Mobile-web reliability | PASS: baseline platform obligations still apply. | PASS: integrate 005 prerequisites and rerun offline/audio/storage/update/lifecycle cases; no unsupported claim that they already work. |
| Focused scope and measured quality | PASS: existing art and rooms only. | PASS: no new dependencies; natural movement and room-fit camera solve current needs; frame and five-player evidence required. |
| Delivery discipline | PASS: feature branch active, prior spec edits preserved. | PASS: Bun, conventional commits, all suites before commit; evidence pending until actually executed. |

Design review passes without constitutional exception. Missing runtime prerequisites are explicit implementation dependencies. Do not mark either feature or the MVP accepted until platform, both-role and physical-device gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/006-combat-view-partner/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── arena-runtime.md
│   └── combat-ui.md
└── checklists/requirements.md
```

`tasks.md` belongs to the following task-generation phase.

### Source Code (repository root)

```text
src/game/arena.ts                  # pure legal region / visible envelope helpers
src/game/ai/partner.ts             # consume 005 role selectors, new intent/facing/recovery
src/game/types.ts                  # intent/progress observations on partner
src/game/step.ts                   # arena context passed to partner at fixed tick boundary
src/presentation/camera.ts         # pure fit/transition calculation
src/presentation/scene.ts          # apply camera frame and report envelope diagnostics
src/ui/progression.ts              # pure cue model and dedicated markup
src/ui/combat.ts                   # remove duplicate HUD GO item
src/ui/styles.css                 # cue positioning, safe-area layout
src/app/game-app.ts                # viewport context, cue/lifecycle integration
src/content/tuning.ts              # provisional behavioral/framing parameters
 tests/unit/game/                 # aggression, facing, bounds, recovery, encounters
 tests/unit/presentation/         # camera-fit and transition invariants
 tests/integration/ui/            # cue states and input pass-through
 tests/e2e/                       # reference viewport, lifecycle and role journeys
```

**Structure Decision**: Extend current boundaries after 005 integration. Pure numeric arena/camera helpers cannot import Three, DOM or browser clocks. Presentation applies their results; simulation receives explicit viewport geometry. No world data edits in `src/content/neon-velvet.ts` or new environment meshes are required.

## Design

### Camera and visible space

Current canvas is already full-screen; `GameScene.resize()` uses vertical half-span 6 independent of room fit, and `cameraCenterX()` advances from one room centre to the next over a two-unit gap. Replace this with the pure framing contract in [data-model.md](data-model.md).

Keep the existing view direction (camera offset 0,8,12) and orthographic projection. Fit the active room's unchanged walkable footprint plus conservative character-body envelope to 90% of the viewport. Start with 5% padding on each axis; room framing determines zoom, not separate control bands. The gameplay canvas remains 100% of available landscape width/height. Coverage acceptance measures actual projected floor coverage against matched baseline captures, not canvas dimensions alone.

During unlocked travel blend room framing anchors with player doorway progress, but expand the fit envelope to include both living allies and the outgoing playable region needed by the trailing partner. Fit expansion is immediate; centre movement and zoom-in are smoothed, then revalidated to contain the required envelope. At the next room's entry, encounter progression remains player-driven; retain the trailing partner's previously unlocked corridor/room path until it naturally reaches the new room. Camera centres toward the new room and returns to its fixed encounter framing once the partner catches up. No boundary-clamp teleport, speed boost, player slowdown, or partner-gated wave spawn.

The render frame and partner visibility calculations share the same pure projection and current numeric viewport input. World geometry is unchanged. Viewport shrink re-fits around allies before Resume, rather than relocating the partner. Temporary wider framing during legitimate travel/recovery is permitted to guarantee visibility; stable-room comparisons establish the enlargement goal.

### Partner intent

Eligibility filters dead, off-screen, out-of-walkable-region and unreachable targets before existing threat ranking. Keep a current eligible target while approaching/attacking; switch for a newly threatening higher-priority target only between attacks. Among equal-priority new targets use distance then entity ID. Distance from player never overrides a valid visible engagement.

Priority: inactive/terminal → visibility safety → finish valid current attack → engage eligible target → regroup during travel or idle with no targets → recover only after genuine blocked movement. Preserve support damage timing/cadence and all 005 profile values. Update action expiration before early-return movement branches so attacks cannot remain active forever. Face resolved horizontal movement except when attacking, when target facing wins. Depth-only movement preserves facing.

No global pathfinding system: current walkable regions are rectangles/corridor unions and allies do not body-block. Use direct movement constrained to the legal region, with alternate valid depth/axis movement when obstruction is reported. Accumulate stuck evidence only when an actual collision/obstruction rejects attempted progress toward a valid destination; elapsed time while intentionally stationary never counts. Use the bounded recovery policy in the runtime contract.

### Progression UI

Derive a cue from cleared encounter + actual next-room route + nonterminal session, not a transient event or hardcoded area index. Render an inline SVG arrow with GO text in a dedicated pointer-events:none layer. Remove the duplicate HUD cue. Initially place it toward the exit side at 40% of safe viewport height, with a 16-px inset; resolve overlap with actual HUD/action rectangles, preferring the free side strip, then the band below HUD. Static appearance is sufficient; no decorative animation is required.

Cue state persists across pause, while the pause/rotate overlay remains visually above it. Resume restores its visible placement; terminal/reset states clear it. It cannot consume joystick or action touches and must remain distinguishable without audio/colour alone.

## Implementation Order and Traceability

1. Integrate and verify 005's selected-role/session/platform prerequisites; retain its current combat profiles, replacing only partner follow/recovery behavior. Capture baseline room screenshots/projection metrics before camera edits.
2. Add failing pure projection/region/transition tests, then implement shared numeric geometry and constrained frame fitting (FR-002, FR-006–008; US2 scenarios 1–5).
3. Add failing both-role partner intent/facing/obstruction tests, then implement aggression and natural travel with shared bounds (FR-001–005; US1 scenarios 1–7).
4. Add failing cue state/layout/input tests, then dedicated GO overlay and remove duplicate HUD text (FR-009–011; US3 scenarios 1–6).
5. Integrate fixed-tick context and viewport/lifecycle behavior, then run both-role browser regressions and prerequisite platform checks (FR-012).
6. Complete real-phone frame/input/offline evidence and five-player direction-recognition protocol (SC-001–006); tune only declared margins/framing parameters, never room size or attack strength.

## Phase Outputs and Readiness

[research.md](research.md) resolves technical choices; [data-model.md](data-model.md) defines numeric state; [runtime contract](contracts/arena-runtime.md) and [UI contract](contracts/combat-ui.md) specify interfaces; [quickstart.md](quickstart.md) defines validation.

No external API or persistent-data migration. This plan creates no game code, generated graphics, commit or deployment. Feature 005 runtime completion, final track and physical device/player access are acceptance dependencies. Record missing evidence openly; it is not grounds to weaken the gates or duplicate a second platform implementation in 006.
