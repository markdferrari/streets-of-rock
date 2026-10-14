# Implementation Plan: Godot Rewrite with Functional Parity

**Branch**: `009-godot-rewrite` | **Date**: 2026-10-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification in `specs/009-godot-rewrite/spec.md`.
**Status**: Implementation and technical cutover complete; final automated verification recorded in validation/cutover-validation.md. Manual acceptance is owner-waived and unverified.

## Summary

Replace the TypeScript/Three.js game with Godot-owned simulation, rendering and visible
UI while preserving mobile-web/PWA delivery, saved data, controls and existing behavior.
Complete all committed requirements through PRD 2.5, including feature 008's four
illustrated settings and feature 007's character workflow. Reuse existing character
assets and preserve tuning; document any required correction against the current spec.

Use typed GDScript with a pure deterministic rules layer, a manually driven simulation
clock and a small browser adapter for browser services and accessibility semantics.
Keep reference fixtures and replacement-test mappings before retiring the old runtime.
No backend, native distribution, hosting publication or unrelated backlog work is added.

## Technical Context

**Language/Version**: Typed GDScript in standard Godot 4.7.2 (`ed1daf0bf`);
TypeScript 6.0.3 for limited browser glue and tools; Bun 1.4.2, Node 24.21.0;
Blender 5.2.2 LTS and Python 3.12.3 for existing asset tools.

**Primary Dependencies**: Matching official Godot web templates; Compatibility renderer,
single-thread export, no GDExtensions. Workbox 7.4.1 and workbox-build 7.4.1;
Godot's generated PWA disabled. Keep dependencies pinned and verify template checksums.

**Storage**: Existing same-origin localStorage keys and schemas; Godot validates raw
values and supplies safe in-memory defaults. Cache Storage holds verified immutable
release assets. No saved partial runs, server data or remote telemetry.

**Testing**: GUT 9.7.1 for headless GDScript; Vitest 4.1.11 for browser/tool modules;
Playwright 1.63.0 Chromium/WebKit; retained Blender tests; recorded reference traces,
visual comparisons and physical-device/player procedures. Commands and expected outcomes
are in [quickstart.md](quickstart.md).

**Target Platform**: Landscape mobile Safari/iOS and Chrome/Android, optionally installed
as a PWA. Reference devices are iPhone 12 and Pixel 6. Editor-native play is development
support, not a new distribution target.

**Project Type**: Static HTTPS browser game with a root Godot project and Bun tooling.

**Performance Goals**: Target 60 fps and sustain at least 30 fps in the busiest encounter
on both phones with complete assets and intended soundtrack. Retain at most 100,000
visible triangles, 100 draw calls and DPR 1.5; decoded backdrop textures including
mipmaps at most 64 MiB. Preserve at least 90% available landscape combat-view coverage.

**Constraints**: Game content at most 30 MiB and each physical content file at most
16 MiB. Verified stock engine overhead is separately reported. Measure total compressed
download and cached payload. Preserve simultaneous touch, explicit resume, accessible
semantics, complete offline replay, coherent updates and existing saved records.

**Scale/Scope**: Four fighters, twelve ordered distinct duos, four solo-completion
cases, four connected rooms, three enemy roles, a two-phase boss, two breakable tables,
three saved-data records and the reusable character workflow. All 21 feature acceptance
scenarios and inherited PRD SC-001–011 remain required.

## Constitution Check

Both assessments below concern design compliance. A pass does not claim runtime or
release acceptance. No constitution exception or unresolved design clarification remains.

| Gate | Before research | After design: evidence and required verification |
| --- | --- | --- |
| Specification-led delivery | PASS: spec maps included scope and exclusions to PRD 2.5. | PASS: traceability below and the coverage register preserve inherited scenarios; tuning changes require a documented requirement correction. |
| Touch combat | PASS: simultaneous/canceled input and phone checks required. | PASS: runtime/browser contracts cover input ownership, lifecycle, safe areas, muted feedback and explicit resume; real-touch procedures remain mandatory. |
| Test-first implementation | PASS: deterministic rules and browser tests separated. | PASS: GUT, Vitest, replay, Playwright and Blender commands defined; each implementation increment starts with an observed behavioral failure; manual procedures precede visual work. |
| Mobile-web reliability | PASS: existing PWA/data behavior retained in scope. | PASS: browser/delivery contracts cover storage fallback, gesture audio, cache integrity/repair, load retry and old/new multi-window upgrades. |
| Focused scope and measured quality | PASS: dependencies serve the requested migration. | PASS: phone frame timing, complete-content budgets, concept review and five-player thresholds specified in quickstart; absent evidence stays pending. |
| Delivery discipline | PASS: feature branch selected. | PASS: branch remains 009-godot-rewrite; conventional commits require all existing automated tests passing; replacement mapping and actual acceptance evidence gate cutover. |

## Project Structure

### Documentation (this feature)

```text
specs/009-godot-rewrite/
├── spec.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── runtime.md
    ├── browser-platform.md
    ├── delivery.md
    └── authoring.md
```

Dependency-ordered `tasks.md` is a subsequent speckit-tasks output, not part of this
planning command. Actual validation, reviews and evidence records are implementation
outputs; empty records must never stand in for completed checks.

### Source Code (planned repository layout)

```text
project.godot
export_presets.cfg
game/
├── app/
├── simulation/
├── content/
├── input/
├── presentation/
├── ui/
├── platform/
└── tools/validate_content.gd
content/
├── characters/
├── roster.json
├── resources.json
├── animation-clips.json
├── tuning.json
├── levels/neon-velvet.json
└── backdrops.json
web/
├── shell.html
├── browser.ts
├── semantics.ts
├── cache-client.ts
├── runtime-loader.ts
└── sw.ts
assets/                     # Existing runtime/editable art, plus backdrops
public/assets/audio/        # Existing bundled audio
scripts/                    # Bun wrappers/build tools and existing Blender tools
addons/gut/
tests/
├── godot/
├── reference/
├── e2e/
└── blender/
```

Retain TypeScript tool tests and legacy runtime/tests during migration. Move shared
character JSON to `content/characters/` once and update legacy imports during coexistence;
do not create two editable authorities. Exclude legacy code, tools, documentation,
node_modules and outputs from Godot scanning. Disable automatic .blend import; never
exclude a parent directory containing required runtime GLBs. Exclude test/debug and
editable-source resources from release exports.

## Design and boundaries

The [research](research.md) records decisions, alternatives and primary sources.
The [data model](data-model.md) defines content, run, session, timing and release records.

### Runtime and presentation

The [runtime contract](contracts/runtime.md) fixes step ordering, input arbitration,
terminal precedence, resource ownership and comparison rules. Port the existing 60 Hz
manual accumulator, five-step backlog cap and separate unpaused wall clock. Use float64
scalar simulation/camera calculations and explicit stable tie breaks; convert to Godot
vectors only at presentation boundaries. Animation and physics never determine damage.

Camera visibility affects AI and Special targeting. Capture frame timestamps, viewport
and ArenaContext along with inputs in parity fixtures. Discrete states/events must match
exactly; continuous values use the contract's tight tolerance without excusing a changed
hit or target. Preserve poses, scale, facing, framing and semantic animation samples.
Readiness and generation checks prevent late loads from starting abandoned runs.

### Browser services and visible UI

The [browser contract](contracts/browser-platform.md) defines the versioned bridge.
Godot owns visible Controls, physical canvas input and state transitions. Browser DOM
semantics mirror Godot descriptors and return generation-tagged accessibility/keyboard
intents through a single route. Verify canvas touch separately from semantic activation.

Keep localStorage formats and browser lifecycle handling, with Godot-owned validation,
audio and explicit resume. One streamed music player and capped effect voices avoid
overlapping music; real-phone checks must prove gesture activation and busy-scene audio.
No browser-side gameplay subsystem remains.

### Release, offline cache and updates

The [delivery contract](contracts/delivery.md) defines Web Release, Web Test and Web
Diagnostics exports, project-local templates, canonical release IDs and exact inventories.
Use one root-scoped `/sw.js`, immutable release URLs, digest/length checks and bounded
repair. Natural worker activation after old windows close preserves coherent running
builds; no forced activation or controller-change reload. Keep legacy update compatibility.

Start with one content pack. If needed to meet the physical-file cap, export disjoint
supplemental packs in the defined ownership/mount order and load before referencing them.
A forced-small-cap fixture tests this path even when real content fits one pack. Only
verified stock engine bytes receive the overhead exception. Release audit checks actual
emitted resources, including pack contents and absence of test/diagnostic hooks.

### Content, scenery and authoring

The [authoring contract](contracts/authoring.md) retains CharacterDefinitionV1, Bun CLI
entrypoints, existing editable assets and scoped Blender operations. A single GDScript
validator serves runtime and headless authoring. Regression fixtures cover malformed
inputs before correcting legacy validator gaps. Exercise Lion and Plates and produce
new-engine records without relabeling historical reviews.

Review four room concepts before producing eight self-contained SVG panels. Map the
original room identities to outside entrance, bar, dance floor and stage/VIP without
changing geometry, waves, tables or connections. Static unlit panels and quiet backing
surfaces cover transitions; scenery adds no gameplay interactions. In-game review and
five-player recognition remain separate from resource tests.

## Dependency order and validation gates

1. **Establish reference evidence.** Map every existing test and inherited acceptance
   scenario to its replacement or physical procedure. Capture traces and matched visuals
   against commit `58137537a7d4ef992bd27e3fdf7efe92e5e2add1`; record discrepancies explicitly.
2. **Prove the foundation.** Install pinned templates/test runner, import one rigged
   fighter, export actual web builds and test input, semantics, audio, lifecycle,
   offline engine/pack reload and forced pack splitting. Run phone smoke checks as soon
   as devices are available. Demonstrated platform failures block affected integration;
   unavailable devices leave acceptance pending while independent work continues.
3. **Port content and deterministic rules.** Start each behavior with failing GUT/replay
   cases, then implement movement, actions, statuses, AI, projectiles, encounters,
   objects, outcomes, clocks and reset. Preserve numerical values and ordering.
4. **Integrate the playable session.** Test selection and all twelve duos, readiness,
   countdown, touch arbitration, camera, animations, HUD, settings, tutorials and results.
   Establish generation/lifecycle and owned-resource invariants before repeated retries.
5. **Complete browser delivery.** Test retained data, accessible semantics, real gesture
   audio, missing resources, cache-only failures, repair and old/new multi-window updates.
   Build/audit all modes; verify release resources physically exclude test controls.
6. **Complete scenery and authoring.** Follow concept-before-production review, test
   unchanged level behavior and asset readiness, then conduct in-game reviews. Finish
   the shared validator/wrappers and actual Lion/Plates workflow exercises.
7. **Validate and retire the reference runtime.** Run all automated suites and release
   audits, compare presentation, collect intended-track/phone/art/player evidence and
   resolve unexplained differences. Remove superseded runtime/tests only with mapped
   replacements and evidence; preserve the previous deployable release for rollback.

These are dependency stages, not permission checkpoints or generated tasks. Independent
work can proceed within a stage, but tests precede their implementation and final
acceptance cannot precede missing physical evidence. Final audit requires intended-track
confirmation and completed release evidence inputs as specified in quickstart.

## Requirement traceability

Identifiers below are local to feature 009. The spec supplies their PRD mappings.
Implementation's coverage register must expand each referenced story scenario and every
applicable inherited acceptance obligation into a named test or review record.

| Feature requirements | Design owner | Scenarios and success evidence |
| --- | --- | --- |
| FR-001, FR-014 | Coverage register, runtime contract, quickstart | All 21 scenarios; SC-002, SC-007; every PRD SC-001–011 criterion. |
| FR-002 | Session, UI, input | US1.1, US1.6, US3.3, US3.5; SC-001; twelve independent duo journeys. |
| FR-003, FR-004 | Simulation, shared character definitions | US1.1–4; SC-001–002; exact actions, Special rules and role behavior. |
| FR-005 | Partner AI and camera/ArenaContext | US1.2, US1.4; SC-001–002; each fighter completes after partner loss. |
| FR-006 | Encounters, clock, results, tutorials | US1.4–6; SC-001–002; terminal ties, progression and full reset. |
| FR-007 | Presentation, Godot UI, semantic bridge | US1.1, US2.2–4; SC-002, SC-005, SC-007; visual and physical checks. |
| FR-008 | Backdrop catalogue and authoring reviews | US2.1–5; SC-006; four concepts, in-game review and setting recognition. |
| FR-009 | Persistence adapter and validation | US3.1–2; SC-003; compatible, malformed and unavailable storage. |
| FR-010 | Lifecycle and audio | US3.2–3; SC-002, SC-004; explicit resume and real gesture audio. |
| FR-011 | Loader, worker, release inventory | US3.4–6; SC-004; full offline runs, repair and coherent upgrades. |
| FR-012 | Authoring CLI, validator, Blender | US4.1–3; SC-008; actual Lion/Plates output and review records. |
| FR-013 | Static delivery and diagnostics | US3.4, US3.7; SC-004–005; both phones, ten lifecycle cycles. |
| FR-015 | Export and complete-release audit | US3.7; SC-009; physical file/content limits and separate engine totals. |

## Planning outcome and remaining evidence

Phase 0 resolved engine/export, numerical parity, camera inputs, testing, browser
semantics, storage/audio, worker updates, pack budgets, authoring and backdrop choices.
Phase 1 records their data model, interfaces and validation procedures. Post-design
constitution gates pass; there are no unresolved technical clarification placeholders.

The installed editor is available, but matching export templates, Godot project,
GUT integration and new command wrappers still require implementation. Earlier passing
legacy unit/build checks and timing-sensitive browser reruns are baseline observations,
not new-engine validation; see research for the exact limitation. This documentation
change receives link, requirement and cross-artifact consistency checks. No runtime
acceptance, phone results, intended soundtrack approval or participant outcomes are
claimed by completing the plan.

## Approved execution exception — 2026-10-14

The owner's explicit [manual waiver](validation/manual-waiver.md) permits phase 7
cutover after automated verification without the unavailable phone/player records.
These acceptance categories remain unverified; the engine, architecture, numerical
tolerance, content/render budgets and all automated checks retain their planned gates.
Normal JS runtime/validator/inventory ownership is retired with the replacement manifest.
