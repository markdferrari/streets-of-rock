# Implementation Plan: Bondi Beach Mobile Game MVP

**Branch**: `001-neon-velvet-mvp` | **Date**: 2026-09-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification at `specs/001-neon-velvet-mvp/spec.md`.
**Status**: Phase 0 research and Phase 1 design complete; implementation and runtime validation pending.

## Summary

Build one mobile-browser beat ’em up level using TypeScript and Three.js, with deterministic
combat independent of presentation. Cow and vulnerable AI Crow traverse four arenas, defeat
Liam, and reach a result/retry flow in a target 3–5 active minutes. Deliver a static PWA with
complete offline content, a bundled owner soundtrack, and reliable pause/resume behavior.

Keep the engine integration narrow: no physics engine, UI framework, backend, accounts, native
wrapper, or generalized entity framework. Use plain DOM/CSS controls, simple collision rules,
low-poly assets, and observable acceptance scenarios from the spec.

## Technical Context

**Language/Version**: TypeScript 6.0.3, strict mode; Node 24.21.0 for Node-based tools;
Bun 1.4.2 for dependency management and package scripts, per AGENTS.md (2026-09-27).

**Primary Dependencies**: Three.js 0.186.0 and matching types; Vite 8.3.0;
vite-plugin-pwa 1.3.0; Workbox 7.4.1 precaching, routing, and range-request modules.
Select exact matching type-package patch at setup and lock all dependencies in bun.lock.
Use `bun install --frozen-lockfile` after initial setup and `bun run` for package scripts.

**Storage**: Validated versioned localStorage for preferences/tutorial/best result; Cache Storage
for the full playable build. No saved run, database, or network service.

**Testing**: Vitest 4.1.11 for deterministic rules and adapters; Playwright 1.63.0 for
Chromium/WebKit production-build flows; actual iPhone 12/Safari and Pixel 6/Chrome checks.

**Target Platform**: Landscape mobile Safari and Android Chrome with WebGL 2; browser and
installed PWA modes. Test current stable OS/browser versions available on both reference
phones and record exact versions. No claim of broad historical-browser support.

**Project Type**: Single static web game with a service worker and a DOM overlay over a 3D canvas.
Future hosting target is AWS; the existing stack emits deployable static files and needs no
Node server at runtime. Reference hosting is private S3 behind CloudFront over HTTPS.

**Performance Goals**: Target 60 fps; minimum 30 fps in the busiest encounter on both reference
phones. Use active one-second rolling windows, sampled every 250 ms, with at least 30 rendered
frames/sec in every full window of the busiest encounter. Log all >100 ms frame gaps and
full-run percentiles. Exclude explicit pauses/loading, not ordinary combat stalls. A second
complete run after warm-up checks sustained behavior. See [quickstart](quickstart.md).

**Constraints**: 3–5 minute successful active runs; four areas; Cow survives independently of
Crow. Complete offline caching, gesture-started audio, no active-run updates. Initial budgets
are 30 MiB required download, 16 MiB per file, 100k visible triangles, 100 draw calls, and DPR
≤1.5. Validate with real devices rather than assuming these budgets guarantee performance.

**Scale/Scope**: One player, two allies, at most four normal enemies in the current encounter
baseline, three enemy archetypes plus Liam, two tables, one healing type, one soundtrack.
Small entity counts justify direct array iteration and simple collision checks.

## Constitution Check

*Gate evaluated before research and re-evaluated after design against constitution v1.0.0.*

| Gate | Before research | After design and evidence |
| --- | --- | --- |
| Specification-led delivery | PASS: accepted spec preserves all PRD IDs and bounded scope | PASS: subsystem mapping below, spec coverage table, and contracts preserve all 46 requirements and 34 scenarios |
| Touch combat | PASS: simultaneous input, readable combat, and manual checks required | PASS: runtime contract defines pointer ownership, safe layouts, pause latch, and accessible feedback; quickstart defines device procedures |
| Test-first implementation | PASS: no implementation authorized before failing behavior tests | PASS: pure fixed-step model, Vitest/Playwright commands, manual procedures, and regression boundaries defined |
| Mobile-web reliability | PASS: offline/audio/lifecycle/storage requirements in spec | PASS: full precache, range handling, build audit, storage fallback, and natural worker activation defined |
| Focused scope and measured quality | PASS: one level, no native/backend work | PASS: minimal dependencies, asset budgets, repeatable frame timing, and five-player evaluation retained |
| Delivery discipline | PASS: already on 001-neon-velvet-mvp; preserve existing spec | PASS: all existing tests before conventional commits, traceable evidence, and explicit unperformed hardware/asset acceptance |

These are design-compliance passes, not runtime test results. No constitution exceptions or
unresolved technical clarifications remain. Owner soundtrack and reference-device access are
delivery dependencies, not reasons to weaken acceptance.

## Project Structure

### Documentation (this feature)

```text
specs/001-neon-velvet-mvp/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── tasks.md
├── contracts/
│   ├── runtime.md
│   └── delivery.md
└── checklists/requirements.md
```

[tasks.md](tasks.md) contains the implementation sequence generated on 2026-09-27.

### Source Code (repository root)

The following is the planned implementation layout; none of this application code exists yet.

```text
src/
├── main.ts
├── app/              # screen/lifecycle state, clocks, app composition
├── game/             # pure simulation, actions, collision, AI, encounters
├── content/          # level definitions and provisional tuning
├── input/            # pointer ownership and input frames
├── presentation/     # Three scene, models, poses, camera, bounded effects
├── ui/               # DOM screens, HUD, settings, styles
├── audio/            # music element and short effect buffers
├── platform/         # local persistence, capability checks, worker client
└── sw.ts             # custom precache/range/audit worker
assets/source/music/  # owner source and provenance note
public/assets/        # prepared soundtrack, SFX, catalog, optional GLB/textures
public/icons/         # installation icons
scripts/              # version assets, create inventory, audit release budgets
tests/
├── unit/
├── integration/
├── e2e/
└── fixtures/
index.html
package.json
bun.lock
tsconfig.json
vite.config.ts
vitest.config.ts
playwright.config.ts
```

**Structure Decision**: One browser application. Game rules never import Three, DOM, audio,
storage, or clocks. Browser adapters communicate through [runtime contracts](contracts/runtime.md).
No backend or native subtree is required. Generated dist/ and test reports are ignored.

## Phase 0: Research decisions

[research.md](research.md) records decisions, rationale, alternatives, and primary sources.
Resolved unknowns: renderer, versions, deterministic timing, collision approach, UI controls,
assets/audio workflow, full offline caching and update safety, persistence, test tools,
performance measurement, and static-host deployment constraints.

## Phase 1: Design and data flow

1. Load and validate content/settings; build the scene and DOM; separately prepare offline
   caching. Required visual/game content gates Start; audio failure allows silent play.
2. Start creates fresh run state, unlocks audio, and starts the active clock. Pointer adapters
   emit input frames into a 60 Hz simulation. The model owns hit windows and terminal outcomes.
3. The app consumes simulation events into Three poses/effects, DOM feedback, and audio.
   Fixed-step rules never depend on asset animation timing or render-frame frequency.
4. Lifecycle changes latch pause, clear input, freeze active timing, and suspend sound.
   Returning to landscape/focus requires Resume. Reload discards the partial run.
5. Defeat wins a simultaneous lethal tie; victory records only a faster valid completion time.
   Retry destroys transient run state and recreates heroes/enemies without duplicating resources.
6. Worker installation caches all required content. The active-build audit controls offline
   readiness; missing resources produce actionable repair guidance. A newer worker waits until
   all old game clients close. No update can switch the active simulation underneath a player.

Authoritative entity fields, state transitions, step ordering, AI behavior, and initial tuning
are in [data-model.md](data-model.md). Player/module boundaries are in
[contracts/runtime.md](contracts/runtime.md); asset, message, and cache rules are in
[contracts/delivery.md](contracts/delivery.md).

### Requirement ownership and delivery order

| Increment / subsystem | PRD requirements | Scenarios |
| --- | --- | --- |
| First touch-combat encounter: input, movement, facing, hit rules, combo, dodge, special, feedback | FR-006, FR-008–019 | AC-001–007, AC-022–024 |
| Run/HUD, Crow, level, enemies/boss, healing, results/reset | FR-001–005, FR-007, FR-020–031 | AC-008–014, AC-025–029 |
| Presentation, soundtrack/settings, interruptions, performance | FR-032–037, NFR-001–004, NFR-008 | AC-015–018, AC-030–032, AC-034 |
| Installation, offline completeness, cache failures, safe updates | NFR-005–007, NFR-009; FR-001/034 | AC-019–021, AC-033–034 |
| Complete-device and player acceptance | SC-001–006 | All AC-001–034 |

Implement a representative combat scene early and profile it on phones before expanding art.
Begin each automatable increment with meaningful failing tests; define its manual procedures
before implementation. Add the full level and PWA behavior incrementally without claiming the
MVP complete until every required story and acceptance outcome passes.

## Validation and rollout

[quickstart.md](quickstart.md) defines future setup, command scripts, TDD order, production PWA
checks, device interruption/audio tests, two-build update validation, frame-time evidence, and
the five-player evaluation. It explicitly distinguishes planned commands from existing tools.

Validate the static release locally first; the future AWS reference deployment uses a private
S3 REST origin behind CloudFront over HTTPS, as defined in the delivery contract. Record build ID, dependency lock, target versions,
asset identity, automated results, manual scenarios, and frame/player evidence. Keep rollout
local/private until validation is complete; selecting this architecture does not publish it.
Package owner music before final offline/audio acceptance. Missing hardware evidence remains
open rather than silently replaced by desktop tests. AWS account, region, domain, infrastructure
provisioning, and deployment automation are deferred to deployment work; no stack replacement
or AWS browser SDK is required for the current MVP.

## Complexity Tracking

No constitution violations. The custom simulation serves testable combat; the custom worker
serves complete offline media and safe cache auditing. Do not add networking, generalized
engine architecture, native plugins, or an automated art pipeline without an accepted need.
