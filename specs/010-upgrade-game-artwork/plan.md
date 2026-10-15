# Implementation Plan: 3D Venue Scenery and Enemy Characters

**Branch**: `010-upgrade-game-artwork` | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: `specs/010-upgrade-game-artwork/spec.md`
**Status**: All four furnished rooms, all four rigged enemy roles, complete authoring/import validation, art preparation, optimized presentation, split-pack delivery and offline credits are implemented. Owner visual direction is approved. Current automation and pending phone/participant acceptance are tracked in [progress](validation/progress.md).

## Summary

Replace the venue's placeholder scenery with four furnished 3D settings and replace enemy placeholders with distinct animated Grunt, Zoner, Enforcer and Liam designs. Reuse suitable free art after inspecting its actual contents and license, preserve the cartoon heroes and all combat rules, and retain mobile-web/offline quality.

Implement on feature 009's approved Godot foundation using explicit GLB exports, room scenes, a validated enemy-presentation catalogue and simulation-driven pose sampling. At planning time the tracked runtime was Three.js. The 2026-10-14 merge supplies Godot source; [implementation audit](validation/prerequisites.md) verifies its boundaries and records command evidence. Godot integration remains an explicit validated prerequisite. Independent concept, provenance and asset preparation can start first. [Research](research.md) records decisions, repository evidence, alternatives and primary sources.

## Technical Context

**Language/Version**: Typed GDScript for pinned Godot 4.7.2 (`ed1daf0bf`); TypeScript 6.0.3 for inherited browser/build tooling; Bun 1.4.2, Node 24.21.0; Blender 5.2.2 LTS and Python 3.12.3 for scoped asset export/validation. Local Godot/Bun/Blender binaries were observed; project integration and matching templates still require verification through feature 009.

**Primary Dependencies**: Feature 009 root Godot project, Compatibility renderer and single-thread standard web export with matching locked templates; GUT 9.7.1, Vitest 4.1.11, Playwright 1.63.0 and Workbox 7.4.1 inherited from 009. No new runtime library, renderer, backend or paid asset dependency. External art candidates are evaluated inputs, not blindly trusted packages.

**Storage**: Version-controlled JSON catalogues/provenance, editable art and license evidence; shared in-memory imported resources and scene-local pose state; immutable same-origin release assets in Cache Storage. Existing preferences/results remain unchanged. No saved enemy pose or run-state schema change.

**Testing**: GUT headless content/view-state tests, retained deterministic parity fixtures, Vitest inventory/credits tooling tests, Playwright Chromium/WebKit exported-game journeys, Blender export checks, eight concept and eight gameplay reviews, physical-phone and five-player procedures. Commands distinguish existing from proposed interfaces in [quickstart.md](quickstart.md).

**Target Platform**: Landscape Safari on iOS and Chrome on Android, browser and optional installed PWA. Reference phones: iPhone 12 and Pixel 6. Desktop/editor views are development evidence only.

**Project Type**: Static browser game; extend the planned root Godot project and Bun tooling.

**Performance Goals**: Target 60 fps; require at least 30 fps in the busiest encounter during a complete run with intended audio. Inherit <=100k visible triangles, <=100 draw calls, rendering density <=1.5 and <=64 MiB decoded scenery textures including mipmaps/lightmaps. Report character textures and total memory separately; preserve >=90% available landscape combat-view coverage.

**Constraints**: <=30 MiB shipped game content and <=16 MiB per physical content file, including duplication across packs. Only byte-verified stock engine payload receives the existing overhead exception. Actual geometry, quiet combat floor, no flashing/strobing, no new colliders/interactions, correct attack timing/reach, full offline art/credits and coherent updates are required. Paid packs and automatic asset fetching during play are excluded.

**Scale/Scope**: Four visual rooms plus three connectors, three normal enemy roles and one two-phase boss; all twelve existing hero/partner duos remain compatible. One art validation entrypoint and the existing export workflow suffice; no general-purpose asset-authoring framework or playable-roster rewrite.

## Constitution Check

These are design assessments; “PASS” does not assert implemented behavior or release acceptance. No constitution amendment or exception is required: the owner explicitly revised visual scope through PRD 2.6 and feature 010.

| Gate | Before research | After design: evidence / required verification |
| --- | --- | --- |
| Specification-led delivery | PASS: 13 local FRs map to PRD 2.6 and observable scenarios. | PASS: traceability below, stable IDs and explicit precedence over 008/009 art choices; provisional art tuning separated from gameplay invariants. |
| Touch combat | PASS: all affected readability, touch and lifecycle obligations retained. | PASS: presentation contract protects camera and combat authority; phone procedures cover overlaps, muted/no-shake, safe areas, simultaneous/canceled input and explicit resume. |
| Test-first implementation | PASS: automatable outcomes and manual art procedures identified. | PASS: missing-resource, animation/status, lifecycle, inventory and license-record fixtures precede implementation; headless/Blender tests supplement real visual checks. |
| Mobile-web reliability | PASS: no new service or persistent game state. | PASS: all room/enemy assets join generation-guarded readiness, verified complete caching and existing between-run updates; failed loads, audio/storage regression and actual offline runs are required. |
| Focused scope and measured quality | PASS: bounded 3D scenery/enemy upgrade, no mechanics expansion. | PASS: reuse existing tools; a representative full encounter proves budget headroom before broad production; phone FPS and PRD player thresholds remain gates. |
| Delivery discipline | PASS: existing feature branch 010 is active, unrelated local outputs preserved. | PASS: conventional commits only after all existing automated suites pass; missing Godot source is a prerequisite, not a claimed pass. Device/art/player evidence must exist before acceptance. |

## Project Structure

### Documentation (this feature)

```text
specs/010-upgrade-game-artwork/
├── spec.md
├── checklists/requirements.md
├── asset-candidates.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── art-content.md
    ├── presentation.md
    └── validation-delivery.md
```

`tasks.md` is generated later by speckit-tasks. Review/evidence outputs are created during implementation with actual outcomes, not empty passing reports.

### Source Code (planned additions to feature 009)

```text
project.godot                         # 009 prerequisite
export_presets.cfg                    # 009 prerequisite
content/
├── resources.json                    # existing 009 planned shared resource authority
├── rooms.json                        # replaces illustrated backdrops catalogue for 010
├── enemy-presentations.json
└── art-provenance.json                # single editable provenance/candidate authority
assets/
├── rooms/<visual-id>/                 # source/ and runtime/; four rooms + shared props
├── enemies/<role>/                    # source/ and runtime/; four designs
└── art-sources/<source-id>/            # source license/evidence; not runtime exported
scenes/art/rooms/<visual-id>.tscn       # composition, decorative geometry/materials only
game/
├── content/art_catalog.gd
├── presentation/venue_view.gd
├── presentation/enemy_view.gd
├── presentation/enemy_pose.gd         # pure state-to-pose selection
├── presentation/art_store.gd          # integrates 009 ResourceStore ownership
└── tools/validate_art.gd
scripts/art/validate.ts                # Bun wrapper and source/provenance checks
scripts/art/credits.ts                 # deterministic generated shipping credits
public/assets/credits/                 # generated offline credits/notices
web/                                  # inherited 009 delivery; no parallel art loader
addons/gut/                           # 009 test prerequisite
tests/
├── godot/art/                         # catalogue, imported resources, pose and ownership
├── unit/art/                          # provenance, credits and packaging tooling
├── e2e/artwork.spec.ts
└── blender/                          # add scoped enemy export checks
```

**Structure Decision**: Extend the 009 presentation/content boundaries. Proposed paths are contracts for implementation, not claims that files already exist. Reuse the inherited build, cache, diagnostics and validation runners. Source and runtime folders must be separately filtered; never ignore an ancestor containing runtime GLBs. Shared props/resources have one pack owner. Do not generate 008's eight illustration panels as a prerequisite for replacing them.

## Design and integration boundaries

### Minimum runtime prerequisite

Before integrating production art, feature 009 must supply a checked-in Godot project that imports an existing hero, exposes read-only run/camera snapshots, manually drives simulation, owns per-instance views and supports generation-tagged readiness. GUT and actual web test/release export must work. Full offline/update acceptance additionally depends on 009's inventory/pack/cache implementation. Prove these capabilities with actual source and commands; local output directories do not satisfy the gate.

Feature 010 does not reimplement the engine migration. If prerequisites are incomplete, tasks must explicitly depend on the corresponding 009 tasks; concepts and source preparation remain available. Demonstrated runtime or browser failures block affected integration until fixed, while unavailable devices leave acceptance pending.

### Room composition and gameplay preservation

[Content contracts](contracts/art-content.md) define the room map and required landmarks. All four rooms are prepared before countdown. Place major props outside the playable rectangle, with the existing floor underneath; keep connectors and camera margins covered. Do not cull by current area index: adjacent rooms can be visible during travel. Use room-bounded geometry/material batches and camera-frustum visibility.

Prefer low material counts, opaque surfaces and small shared palettes. Keep hero lighting recognizable; emissive signs provide neon styling without depending on bloom. Decoration has no gameplay identity, colliders, navigation, scripts, timers or attack tracks. Existing interactive tables remain simulation-owned views at their existing coordinates. Artwork must not alter camera/ArenaContext calculations or hero body envelopes to fit oversized art.

### Enemy presentation

[Presentation contract](contracts/presentation.md) defines role/move bindings, normalized phase sampling, stun precedence, per-instance ownership, phase overlay and defeat-pose retention. Every clip/segment is verified in both its source GLB and Godot import. Missing required clips fail before countdown; no invisible, default-rest-pose or primitive fallback counts as final art.

Author action poses around existing start/contact/recovery boundaries. Ground position comes only from simulation; facing transforms are applied outside the skeleton. Imported root tracks cannot translate the actor through the level. Role designs differ in silhouette/outfit; Liam needs a visibly distinct boss shape, not just a tint/scale of the Enforcer. His phase overlay cannot interrupt current actions or hide a warning.

### Asset reuse and provenance

Evaluate Quaternius modular characters and Kenney props first, using the [candidate assessment](asset-candidates.md). Inspect exact archives, record hashes/licenses and compare representative models beside the heroes. Complete four room and four enemy concepts before final production, recording owner review outcomes. Only necessary meshes, materials and animations enter runtime assets. Adaptations and original work fill documented gaps without a purchase dependency.

The [data model](data-model.md) gives every runtime asset a source record. Generate offline credits and required notices deterministically; expose credits from Settings/Home through the existing UI/semantic bridge, without disrupting a locked duo or active run. Credits contain bundled text; following a supplier website is never necessary for gameplay or reading required attribution.

### Readiness, resources and release

Use one shared resource authority and one generation token per preparation. Load all required imported dependencies and instantiate/check each room and enemy type before countdown; render the initial view. Release late failed/abandoned preparations without corrupting current readiness. Cache-only/audio failures retain existing nonblocking behavior, while missing visual resources block entry with retry.

Reuse feature 009's immutable release inventory, exact pack ownership and worker protocol. Replace `backdrops.json`/eight-image expectations with the room dependency closure; include enemy packs and credits. Shared resources belong to one pack. Keep every physical content pack below 16 MiB and aggregate content below 30 MiB; measure imported/exported bytes rather than source estimates. Do not change worker ownership or add supplier network requests.

## Dependency order and validation gates

1. **Baseline and prerequisite record:** Capture current source/build identities, existing rules and matched before views; map relevant 009 foundation tasks. Set the evidence/requirement register before modifying code.
2. **Candidate and concept work:** Inspect free archives/licenses and actual clips, make representative prototypes, then review all eight concepts. Author manual review procedures first; keep unresolved findings visible.
3. **Representative export proof:** With 009 foundation available, test a furnished room, four mixed-role enemy instances and an existing duo in the web build. Write failing resource/pose/import/ownership checks before integration. Measure complete-scene costs and phone smoke behavior before producing all final art.
4. **Catalogue and preparation:** Add failing schema, missing-clip, recursive dependency, stale-generation and invalid-license-record tests; implement validated catalogues, source records, credits and transactional preparation.
5. **Complete scenery and enemies:** Follow concept decisions, implement room composition and every enemy action/state, test independent poses, stun, phase change, defeat, reset and unchanged deterministic outcomes. Review all final in-game subjects.
6. **Delivery and lifecycle:** Test missing/corrupt art, forced pack splitting, offline full runs/retry, credits, safe updates, interruption, reduced motion and ten ownership cycles; audit all emitted resource membership and budgets.
7. **Acceptance evidence:** Run all active automated suites and build audits, then record both phones, intended soundtrack, eight final reviews and five-player outcomes. Resolve failed gates; unavailable evidence stays pending. No deployment or automatic commit is part of planning.

## Requirement traceability

Identifiers are local to feature 010; PRD mappings remain in [spec.md](spec.md).

| Requirement | Design / test owner | Scenarios and outcome |
| --- | --- | --- |
| FR-001 | Room catalogue/composition, import/layout checks | US1.1–3; SC-001; four setting reviews and recognition. |
| FR-002 | Art direction and representative scene review | US1.1–4, US3.1, US4.3; SC-001, SC-003. |
| FR-003 | Stable area map, pure presentation boundary, parity suites | US1.4, US2.4; SC-007; unchanged geometry/waves/tables/camera. |
| FR-004 | Enemy catalogue, silhouette/outfit review | US2.1–2; SC-002; all four identities. |
| FR-005 | Pose resolver, clip validation and action review | US2.3–4; SC-002; every role/move/state and both phases. |
| FR-006 | Tick sampling, instance isolation, gameplay comparison | US2.4–5; SC-007; no new hits/timing/AI and correct reset. |
| FR-007 | Scene coverage, existing UI/camera and device checks | US1.4, US3.1; SC-003; controls/warnings/GO stay clear. |
| FR-008 | Lifecycle/manual clock and settings tests | US2.5, US3.1–2; SC-004; frozen poses and fresh explicit resume. |
| FR-009 | ResourceStore, credits, release inventory and worker | US3.3–4, US4.2; SC-004; full offline/retry and failure recovery. |
| FR-010 | Export budget audit and complete-run diagnostics | US3.5; SC-005; physical phones and measured complete release. |
| FR-011 | Candidate assessment and fallback decisions | US4.1; SC-006; evaluated free reuse, no forced unsuitable pack. |
| FR-012 | Provenance validation, license review and credits | US4.2; SC-006; complete origins and fulfilled notices. |
| FR-013 | Concept/gameplay evidence register | US4.3; SC-001–003, SC-007; eight concept/eight final reviews. |

## Post-design outcome

All six constitution design gates pass and technical decisions are resolved. [Data model](data-model.md), [contracts](contracts/art-content.md) and [quickstart](quickstart.md) describe implementation and observable validation. This is ready for task generation with the 009 foundation dependency explicit. It does not assert downloaded-asset suitability, runtime integration, test execution, owner art approval, phone performance or player acceptance.

Document validation passed: required template fields, all 13 requirement mappings, local links, Markdown fences, absence of unresolved placeholders and whitespace checks. A separate runtime-consistency review found no material conflict with the current game or 009 foundation. No game tests or asset import tests were executed for this documentation-only planning change. No before/after planning hooks are configured.

## Complexity Tracking

No constitutional violations or exceptions. The inherited stock-engine size allowance remains explicit; it never exempts game artwork. No additional framework, backend or general authoring pipeline is introduced.


## Owner-requested gameplay extension (2026-10-14)

After approving the Grunt/Zoner previews and trying normal encounters, the owner requested correct turning, up/down Grunt pursuit and less accurate thrown objects. These explicit instructions extend the artwork-only scope for those behaviors: normalized two-axis Grunt pursuit with movement facing, and Zoner target position locked at warning start. The original attack timings and projectile speed remain. Versioned current-rule replay checkpoints preserve the frozen legacy baseline and exact comparison rules.
