# Implementation Plan: Illustrated Bar and Nightclub Backdrops

**Branch**: `008-nightclub-backdrops` | **Date**: 2026-09-28 | **Spec**: [spec.md](spec.md)

**Input**: `specs/008-nightclub-backdrops/spec.md`

## Summary

Replace primitive venue decoration with four static illustrated cartoon wall/floor compositions inside the existing Three scene. Author editable self-contained SVG artwork, preserve existing 3D characters and simulation, and map stable area IDs to the new visual sequence: exterior → bar → dance floor → stage/VIP. Preload all required textures through the integrated 005 readiness flow; extend 006 framing coverage with continuous decorative floor/backing across transitions. Deliver real concept and gameplay review alongside automated and phone evidence.

## Technical Context

**Language/Version**: TypeScript 6.0.3, ES2022; Bun 1.4.2; SVG artwork with explicit intrinsic raster dimensions.

**Primary Dependencies**: Existing Three.js 0.186.0, Vite 8.3.0, vite-plugin-pwa 1.3.0, Workbox 7.4.1. No new runtime, art-generation or schema dependency. Preserve existing character tooling.

**Storage**: Bundled static illustrations and in-memory shared textures; inherit existing platform cache/preferences. No new persistent data, backend or remote asset service.

**Testing**: Vitest 4.1.11 unit/integration; Playwright 1.63.0 Chromium/WebKit; existing Blender 5.2.x test suite retained as regression gate. Manual concept/in-game/phone and five-player evaluation.

**Target Platform**: Landscape iOS Safari/Android Chrome in browser and installed mode where supported; iPhone 12 and Pixel 6 reference phones.

**Project Type**: Existing browser game; presentation and asset-readiness extension.

**Performance Goals**: Target 60 fps, minimum 30 fps in busiest encounter during complete runs. Retain inherited provisional 30 MiB required build, 16 MiB/file, 100k visible triangles, 100 draw calls and DPR≤1.5. Add ≤64 MiB estimated decoded backdrop textures including mipmaps; verify actual full-scene performance and repeated lifecycle resource counts.

**Constraints**: Preserve bounds, collision, wave composition, tables/spawns, fixed camera angle, enlarged view, GO timing, character graphics and gameplay. No foreground obstacles, dynamic lighting, ambient animation, new interactions or general graphics overhaul. Required-load failures block entry; offline readiness remains a separate complete-cache check.

**Scale/Scope**: Four wall and four floor images, three existing connectors, one shared backdrop asset store and scene-owned layer. Eight static textures; zero new simulation entities.

## Constitution Check

Both reviews concern design; actual art/device acceptance remains outstanding.

| Gate | Before research | After design |
| --- | --- | --- |
| Specification-led delivery | PASS: approved spec and PRD 2.5 authorize room appearance/order revision. | PASS: FR-001–013 mapped below; simulation IDs/layout preserved; no character graphics revision. |
| Touch combat | PASS: unchanged controls still require scenery readability/safe-area checks. | PASS: rear-only decoration, quiet floor, shared 006 frame and muted/no-shake/large-actor phone review; preserve input/cancellation/resume regressions. |
| Test-first | PASS: retain existing suites; manual criteria precede art. | PASS: mapping, coverage, loading, lifecycle/ownership and cache tests precede implementation; concepts precede final production. |
| Mobile reliability | PASS: investigate actual 005 platform status before integration. | PASS: missing prerequisites explicit; all-resource readiness, late-load cleanup, full cache and safe updates plus phone offline checks specified. |
| Focused scope/quality | PASS: four visual replacements with current characters and gameplay. | PASS: static SVG panels in existing 3D scene, no new dependency; complete-build/decoded-memory limits and five-tester recognition checks. |
| Delivery discipline | PASS: branch 008-nightclub-backdrops, preserve existing specification edits. | PASS: Bun, all existing suites before conventional commits, actual review/hardware evidence before acceptance. |

No constitutional exception is needed: illustrated textured scenery remains inside the existing stylized 3D presentation. Missing concepts/phone access are acceptance dependencies, not unresolved design choices.

## Project Structure

### Documentation (this feature)

```text
specs/008-nightclub-backdrops/
  spec.md
  plan.md
  research.md
  data-model.md
  quickstart.md
  contracts/backdrop-runtime.md
  contracts/visual-review.md
  checklists/requirements.md
  reviews/                 # created during concept/implementation review
  validation.md            # created during implementation
```

`tasks.md` belongs to the next speckit-tasks phase and is not generated now.

### Source Code (repository root)

```text
assets/backdrops/
  outside-entrance/{wall,floor}.svg
  bar/{wall,floor}.svg
  dance-floor/{wall,floor}.svg
  stage-vip/{wall,floor}.svg
src/content/backdrops.ts                 # pure visual mapping and validation
src/presentation/backdrop-assets.ts      # static URLs and shared texture store
src/presentation/environments.ts         # owned venue layer and coverage
src/presentation/scene.ts                # attach/update/dispose layer
src/app/game-app.ts                      # extend integrated 005 preparation
src/app/session.ts                      # reuse 005 generation/readiness boundary
scripts/audit-build.ts                   # extend integrated full inventory audit
tests/unit/content/backdrops.test.ts
tests/unit/presentation/backdrop-assets.test.ts
tests/unit/presentation/environments.test.ts
tests/integration/app/backdrop-readiness.test.ts
tests/e2e/backdrops.spec.ts
tests/e2e/backdrops-offline.spec.ts
```

**Structure Decision**: Presentation definitions refer to existing LevelDefinition IDs. Renderer resources remain outside deterministic simulation. SVG is editable source and runtime input; no separate authoring framework or Blender backdrop pipeline is required. Retain one existing worker/inventory implementation from 005.

## Design

### Prerequisite integration

Current code still has the legacy fixed Cow/Crow camera/scene. PWA dependencies are installed, but `vite.config.ts` has no worker, build audit only checks index.html and diagnostics is only an environment flag. Integrate relevant tracked implementation from `specs/005-choose-your-fighter/tasks.md` and `specs/006-combat-view-partner/tasks.md` before combined acceptance; specifically generation-based entry/readiness, full cache inventory/audit, diagnostics, shared CameraFrame and progression cue. Do not duplicate these systems here. Their pending validation remains tracked. Feature 007 characters are a readability integration target when present, not new asset work in 008.

### Art production and composition

Create four camera-composited draft concepts with real existing character/HUD overlays and review them together before final art. Then author outlined SVG wall panels with quiet floor patterns, using vector paths/shapes for text/branding and no external resources or animation. Initial wall dimensions are 2048×1024, floors 1024×512. Preserve originals and actual review decisions in feature reviews.

Use unlit opaque textured materials with sRGB colour maps and tone mapping disabled so existing bright character lights do not wash out illustration colour. Leave actor lighting unchanged. Place rear-wall detail at depth -3.9 and keep recognizable doorways/signs within reviewed landmark regions. The entrance visually leads toward the rightward connection; never place a central rear door suggesting depthward travel. Stools/barriers/seating appear behind or outside the playable region, not as geometry inside it. No new ambient motion is planned.

### Mapping and geometry preservation

Map `dance-floor` → outside entrance, `vip-lounge` → bar, `backstage-corridor` → dance floor, `alley-exit` → stage/VIP. Keep IDs, room bounds, waves, table positions and game state unchanged. Capture baseline assertions from `src/content/neon-velvet.ts` before modification; only separate presentation definitions are new.

Use feature 006's final CameraFrame and level bounds to calculate floor/rear-wall coverage. All three two-unit connectors and camera margins get quiet matching surfaces. Extend backing geometry for wide frames and endpoints without stretching detailed illustrations or changing camera fit. Keep all four lightweight room groups present; ordinary frustum visibility handles drawing. AreaIndex can advance before the camera/partner arrives, so it cannot control exclusive room visibility. Preserve shadows, effect/telegraph ordering and the existing table glow unless review identifies a specific readability conflict.

### Readiness, ownership and offline

GameApp owns the BackdropAssetStore alongside character resources. Load/decode all eight images and initialize textures on the gameplay renderer before initial-frame readiness/countdown. Coalesce concurrent loads; await all settlements for transactional cleanup on failure, including disposal of late resources after retirement. The existing preparation generation blocks stale success/failure from modifying the session.

Scene-owned venue layers dispose their geometry/materials and detach their groups. Store-owned textures survive scene Retry and dispose once after the last consumer retires. Adapt existing scene traversal to avoid double-disposing layer resources. A ten-cycle home/run/retry check must show bounded live allocations.

Extend 005 static asset inventory and worker/audit with every emitted SVG (or containing chunk if inlined). A complete decoded scene is runtime-ready; offline-ready additionally requires successful full-build caching. Missing art produces an actionable loading error; cache-only failure allows loaded play without an offline claim. No room transition performs a new load; active/paused runs never replace artwork from a waiting build.

## Implementation Ordering and Traceability

Every automatable increment begins with an observed failing test; manual procedures are defined in quickstart before visual production.

| Increment | Feature requirements | Evidence |
| --- | --- | --- |
| Integrate 005/006 and capture geometry/encounter baseline | FR-006–009, FR-011, FR-013 | Existing role/input/camera/GO/platform suites; actual inventory/diagnostics readiness. |
| Shared definitions, SVG resource contract, asset store and coverage | FR-001, FR-005–011 | Exhaustive IDs, immutable level baseline, malformed/missing assets, partial/stale loads, disposal and frustum/connector coverage tests. |
| Review all four concepts; final exterior/bar | FR-002–003, FR-005, FR-012 | US1 scenarios; rightward entrance, original interactive tables and reviewed character/HUD composites. |
| Final dance floor/stage | FR-004–005, FR-012 | US2 scenarios; readable floor warnings, boss framing and no false platform/exit. |
| Cross-room combat/layout integration | FR-006–010 | US3 scenes/positions/transitions, 006 camera regressions, device muted/reduced-motion and retry checks. |
| Full caching/lifecycle/performance and acceptance | FR-011–013 and all SC | US4 load/offline/update scenarios, full-run phones, bounded memory, recognition/readability evaluation and all existing suites. |

## Phase Outputs and Delivery

- [research.md](research.md): inspected behavior, decisions, rationale and alternatives.
- [data-model.md](data-model.md): definitions, resource dimensions, ownership states and review records.
- [Runtime contract](contracts/backdrop-runtime.md): asset, scene, loading and offline interfaces.
- [Visual review contract](contracts/visual-review.md): mandatory art cues and review procedure.
- [quickstart.md](quickstart.md): automated commands, phone/offline/performance and five-player validation.

Technical design is complete. No final art, code, task list or runtime acceptance is claimed by this planning phase. Concepts, actual integrated prerequisites, intended soundtrack, physical phones and participant evidence remain delivery dependencies.
