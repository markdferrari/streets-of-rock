# Implementation Plan: Expressive Fighter and Companion Animations

**Branch**: `011-improve-character-animations` | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

**Input**: `specs/011-improve-character-animations/spec.md`

**Status**: Phase 0 research and Phase 1 design complete; ready for task generation. Candidate trials, source selection, production, runtime integration and acceptance remain pending.

## Summary

Improve Cow, Lion, Crow and Plates in both playable and companion roles by adapting supplied KayKit and Universal motion offline in Blender, then baking selected and custom motion into the existing character assets. Compare both sources on each actual character before production. Preserve character identities and authoritative combat behavior while adding articulated limbs, continuous action poses, travel-driven locomotion, event-derived reactions and independent preview/actor motion.

Extend the existing Godot presentation, resource validation, provenance and export paths. Introduce a small hero profile and a read-only per-step motion observer; manually sample authored clips against existing gameplay phase timing. No new runtime library, service, enemy behavior or gameplay ability is required. [Research](research.md) records decisions and alternatives; [data model](data-model.md) and [contracts](contracts/animation-presentation.md) define the boundaries.

## Technical Context

**Language/Version**: Typed GDScript for pinned Godot 4.7.2; TypeScript 6.0.3 and Bun 1.4.2 for inherited tooling; Blender 5.2.2 LTS Python for asset adaptation. Godot, Bun and Blender versions were confirmed locally. Use the existing locked web templates and package lock, without upgrading tools for this feature.

**Primary Dependencies**: Existing Compatibility renderer/single-thread web export, GUT 9.7.1, Vitest 4.1.11, Playwright 1.63.0 and Workbox 7.4.1. Supplied KayKit Character Animations 1.1 and Universal Animation Library Standard are authoring candidates. No added runtime dependency; reuse existing Blender action-slot/export patterns and resource/credits tooling.

**Storage**: Version-controlled profiles, provenance, editable `.blend` sources and baked GLBs; private in-memory presentation state; existing immutable release inventory/Cache Storage. No new saved run fields, account or database. Sources and review artifacts stay outside Web Release.

**Testing**: GUT pure resolver/observer and imported-scene tests; unchanged deterministic simulation/parity fixtures; Blender rig/export checks; Vitest provenance/credits/export checks; Playwright Chromium/WebKit selection, twelve-duo, lifecycle, loading and offline checks. Manual candidate/animation review, real-phone frame timing and five-player evaluation complement automation. [Quickstart](quickstart.md) separates existing commands from planned interfaces.

**Target Platform**: Landscape mobile Safari/iOS and Chrome/Android, browser and installed PWA where supported. Reference devices: iPhone 12 and Pixel 6. Editor and desktop browser captures do not establish phone acceptance.

**Project Type**: Existing static Godot browser game with Bun build/validation tooling and Blender authoring scripts.

**Performance Goals**: Target 60 fps, require >=30 fps in the busiest encounter during a full run with intended soundtrack. Preserve inherited whole-scene limits (<=100k visible triangles, <=100 draw calls, render density <=1.5) and current character batching guard of <=10 visible surfaces per hero unless a measured, documented design adjustment remains within the whole-scene budget. Retain <=64 MiB scenery texture budget; report hero texture/memory costs separately.

**Constraints**: <=30 MiB game content and <=16 MiB per physical content file, including pack duplication; verified stock engine overhead reported separately. Existing action windows, effects, movement, facing, AI and camera envelopes remain authoritative. Animation cannot delay controls or emit gameplay callbacks. Four identities, complete offline replay, correct pause/resume and source provenance are acceptance obligations.

**Scale/Scope**: Four characters, twelve ordered duos, eight source trials assembled into four before/current-candidate comparisons, all existing required states in both facings, four final character reviews. One profile catalogue, two small presentation modules and extensions to current validation/export tooling. No universal retargeting framework or new runtime animation state machine.

## Constitution Check

These are design gates, not declarations of completed runtime or device acceptance. Pre-research review found no policy violation; post-design review confirms the following safeguards. The owner-authorized animation scope is recorded in PRD 2.7/feature 011; no constitution exception is required.

| Gate | Before research | After design: evidence / planned verification |
| --- | --- | --- |
| Specification-led delivery | PASS: ten FRs, four stories and six measurable outcomes map to PRD FR-064–069 and AC-066–071. | PASS: traceability below; clear exclusions and provisional presentation tuning. Support timing and terminal knockout clarifications align the spec with observed runtime behavior. |
| Touch combat | PASS: existing input, warnings, safe areas and explicit resume retained. | PASS: no animation-driven input gate; muted/no-shake, reduced motion, overlap, simultaneous/cancelled touches and lifecycle checks specified before visual work. |
| Test-first implementation | PASS: meaningful automated rules and manual procedures identified. | PASS: failing observer/profile/import/rig tests precede changes; simulation remains independently tested. Manual source/character review procedures precede production. |
| Mobile-web reliability | PASS: same bundled-resource and cache boundaries. | PASS: hero profile/clip failures block readiness; stale generations, full cached replay, source credits, safe updates and nonblocking audio/storage have regression procedures. |
| Focused scope and measured quality | PASS: four existing characters, no new gameplay/dependency. | PASS: bounded offline workflow and source trial gate; physical-phone full-run FPS and five-player thresholds retained. Candidate/source choice remains evidence-driven. |
| Delivery discipline | PASS: active feature branch is 011; existing uncommitted specification work preserved. | PASS: all existing automated suites before conventional commits; preserve unrelated changes, never commit valid secrets, and keep missing source/device/review evidence pending. |

## Project Structure

### Documentation (this feature)

```text
specs/011-improve-character-animations/
├── spec.md
├── exploration.md
├── checklists/requirements.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── animation-presentation.md
    └── animation-assets.md
```

`tasks.md` is generated by the next workflow. `reviews/` and `validation/` are populated during implementation with actual trial/review/test evidence; this plan does not generate empty passing reports.

### Source Code (existing paths and planned additions)

```text
content/
├── hero-animations.json                 # NEW profiles and minimal accepted-source summaries
├── animation-clips.json                 # retain semantic coverage authority
├── resources.json                      # retain model-path/body-envelope authority
└── art-provenance.json                  # extend hero runtime/source records
assets/characters/                      # existing editable sources and runtime GLBs
assets/art-sources/                     # retained selected source/license evidence
scripts/blender/
├── rig_export.py                        # extend/replace coarse hero authoring path
└── hero_motion.py                       # NEW scoped mapping/bake helpers
scripts/art/{validate,credits,delivery}.ts # extend existing validation/credits traversal
scripts/godot/export.ts                  # existing resource closure and source exclusions
game/content/
├── hero_animation_catalog.gd            # NEW profile/import validation
├── catalogue.gd                        # load/freeze profiles
└── resource_store.gd                    # hero-aware preparation, generic enemies unchanged
game/presentation/
├── character_motion_state.gd            # NEW private per-view observer state
├── character_pose.gd                    # NEW pure semantic/phase resolver
├── character_view.gd                    # manual sampling and bounded visual blending
├── character_batches.gd                 # retain safe bone-driven batching
└── world_view.gd                        # observe steps, apply independent hero poses
game/app/{main,run_session}.gd            # per-step observation, preview/results clocks
game/tools/validate_art.gd               # extend existing imported-resource validator
tests/
├── blender/                            # articulate/attachment/export checks
├── godot/presentation/                  # resolver/observer/import tests
├── godot/content/                       # profiles/readiness/resource ownership
├── godot/app/                           # preview and terminal resume behavior
├── godot/fixtures/hero-animation/        # NEW test-only actual-character review setup
├── unit/art/                           # provenance, credits, asset closure
└── e2e/hero-animation.spec.ts            # NEW explicitly registered browser journeys
playwright.godot.config.ts               # register new testMatch entry
```

**Structure Decision**: Extend current content/presentation ownership. Proposed paths are not claimed to exist. Reuse generic ResourceStore loading and enemy/venue code without changing their behavior; add hero-specific preparation that resolves physical clips from profiles rather than treating semantic keys as physical names. Keep model paths single-sourced. No backend, separate cache, parallel credits ledger or runtime retargeting subsystem.

## Design and implementation sequence

### A. Establish the baseline and authoring contracts

Capture current four-character motion and source/build hashes with matched camera/settings. Define failing rig/profile/continuity/identity tests and manual comparison procedures before changing assets. Inventory exact supplied source clips and licenses; retain additional selected source files through existing provenance practices. Preserve feature 010's historical fingerprints and supplier hashes. Replace only obsolete hero-freeze/seven-bone assertions with meaningful new contracts.

### B. Run bounded source trials

Adapt an articulated target per body using explicit mesh attachments. Split/reshape or weight joints; keep Plates' complete face/plate rigid and Crow's feather groups coherent. Use existing Blender donor-action/NLA patterns, with character-specific mapping and rest/proportion correction. Eight trials cover both libraries on each character; four review comparisons show current/KayKit/Universal idle, travel and attack in both facings. Record failures and custom-motion alternatives. Review and record source decisions before full production.

### C. Build timing and readiness foundations test-first

Add profile validation, immutable catalogue loading and `prepare_hero`-equivalent profile-aware ResourceStore integration. Observe every fixed step before result handling, including up to five steps between renders. Add pure sampling and private actor/preview states. Prove actual-distance locomotion, duplicate-render stability, phase continuity, immediate support contact, event-derived reactions, independent actors and zero-HP priority against failing tests before implementing behavior.

Author four directional gait loops or adapted equivalents; blend at most two for diagonal travel with simulation-owned facing. Fit all action clips into existing timing; use shared source intervals for contiguous phases. Remove legacy hero squash/tilt and double-spin contributions only when authored replacements land. Batch only bone-driven surfaces; keep the simulation headrest projectile separate from the launch gesture.

### D. Produce full character coverage and integrate

After source review, bake complete required states per character, retaining semantic inventory and existing runtime paths. Export only needed bones/clips/materials; verify import round trips, skin weights, rigid attachments, contact points, loops, envelopes and dependency closure. Apply per-instance manual sampling and limited transitions. Animate previews independently with reduced-motion still poses. Add bounded terminal knockout settling with existing Resume behavior and no simulation/time advancement; results and retry stay immediate.

### E. Complete delivery and acceptance

Extend provenance/credits discovery to heroes, validate source-summary consistency at build time and ship only runtime metadata/assets. Test all twelve duos, action/role independence, missing clips, stale preparation, lifecycle, retry and release fixture exclusion. Run all existing suites and release audit. Complete two physical-phone full/offline runs, every required action/facing review and five-player evaluation; any absent evidence remains pending.

## Requirement traceability

| Local requirement | Design / verification | PRD acceptance and outcome |
| --- | --- | --- |
| FR-001 | Eight source trials, four matched comparisons, decision records | AC-066; local SC-001 |
| FR-002 | Explicit articulated attachment maps, rigid plate/wing constraints, source and imported review | AC-067; SC-002 |
| FR-003 | Exact semantic profile coverage, action/facing matrix, twelve-duo tests | AC-067, AC-069; SC-002 |
| FR-004 | Continuous source segments, directional travel loops, bounded blends and visual review | AC-067–068; SC-002–004 |
| FR-005 | Read-only per-step observation, existing action authority, unchanged parity fixtures | AC-068; SC-003 |
| FR-006 | Per-view state, hit/KO event handling, terminal settle, pause/resume and reset tests | AC-069–070; SC-002–003 |
| FR-007 | Preview reduced motion and phone touch/readability/lifecycle procedures | AC-070; SC-004 |
| FR-008 | Profile-aware readiness, inventory/cache/credits and release journeys | AC-071; SC-006 |
| FR-009 | Full-release byte audits and reference-phone frame timing | AC-071; SC-005 |
| FR-010 | Source records, owner trial/final reviews, build-bound evidence register | AC-066, AC-071; SC-001–006 |

## Post-design outcome

All six constitution design gates pass; no unresolved technical clarification remains. The [data model](data-model.md), [presentation contract](contracts/animation-presentation.md), [asset contract](contracts/animation-assets.md) and [quickstart](quickstart.md) are ready for dependency-ordered task generation. Source selections remain an implementation review gate; no candidate animation or phone outcome is claimed accepted.

Document validation covers template sections, internal links, requirement coverage, command/path accuracy, source/runtime ownership and absence of unresolved placeholders. This documentation-only phase does not execute gameplay suites or produce assets. No before/after planning hooks are configured.

## Complexity Tracking

No constitution violations or exceptions. The extra private motion observer is required because the runtime may simulate multiple ticks before rendering and existing hit/support events do not map directly to action states. The bounded results clock affects only an unfinished knockout; it neither introduces a second gameplay clock nor delays results. A general-purpose retargeter, autonomous gameplay AnimationTree and new network service are unnecessary.
