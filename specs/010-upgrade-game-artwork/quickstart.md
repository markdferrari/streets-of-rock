# Quickstart and Validation: 3D Venue and Enemy Artwork

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Current status and prerequisites

This is an implementation validation guide, not a report of tests already run. At planning time the tracked application is Three.js; feature 009's Godot project and commands are not integrated. Untracked `.godot/`, `.tools/` or `dist-*` outputs do not satisfy that prerequisite. Use feature branch `010-upgrade-game-artwork` and preserve unrelated local changes.

Use feature 009's pinned Godot 4.7.2 and matching locked standard web templates, Compatibility/single-thread export, Bun 1.4.2, Node 24.21.0, Blender 5.2.2 LTS, Python 3.12.3, GUT 9.7.1 and the repository's pinned browser tooling. Do not auto-upgrade tools during art validation. Physical acceptance needs iPhone 12/Safari, Pixel 6/Chrome, the intended soundtrack, owner concept/gameplay review and five casual players.

Before runtime integration, verify the actual checked-in Godot project, read-only simulation snapshots, camera interface, manual clock, per-instance views, generation-guarded loader and Web Test/Web Release builds. Before offline acceptance, verify the 009 inventory/pack/cache/update implementation. Independent asset assessment and concepts can proceed before these prerequisites. Track remaining 009 work explicitly rather than treating unavailable scripts as successful tests.

## Existing baseline checks

Run from repository root; these commands exist before the migration:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test:unit
bun run test:e2e
bun run build
bun run audit:build
blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
```

Install browser binaries/host dependencies only if needed, following the repository setup. Existing headless browser environment overrides are documented in [009 quickstart](../009-godot-rewrite/quickstart.md). Run all active suites before any commit. This planning-only change receives document/link/requirement checks; it does not require creating artificial game tests.

Capture baseline gameplay views and deterministic traces before modifying presentation, including all room boundaries, the two table locations, mixed enemy waves and both Liam phases. Keep source/build identity, camera/layout, duo, tick and settings with captures so comparisons use equivalent conditions.

## Setup after the 009 foundation and 010 wrappers exist

The following commands are proposed implementation interfaces, not currently runnable claims:

```sh
bun install --frozen-lockfile
bun run setup:godot
bun run playwright install chromium webkit
godot --headless --path . --import
bun run validate:art
bun run build:test
bun run preview -- --dir dist-test --host 127.0.0.1 --port 4173
```

`validate:art` follows the [validation contract](contracts/validation-delivery.md); default mode includes imported resources. `--definitions-only` is useful for explicitly limited authoring checks and cannot establish release readiness. `--room exterior` or `--enemy liam` focuses an iteration; full validation still covers all content before release.

Expected result: the actual exported browser game loads, shows the selected duo, validates every room/enemy type and enters countdown once. Missing required art gives an actionable retry with the duo retained. A raw scene that bypasses the loader/packaged game is supplementary development evidence.

## Automated verification after implementation

| Command | Expected outcome |
| --- | --- |
| `bun run validate:art` | All catalogues, source records and actual imported scene/clip dependencies valid; no missing required art. |
| `bun run test:art` | Focused GUT art/content/pose tests and Vitest provenance/credits/packaging tests pass. |
| `bun run typecheck` | Inherited GDScript/import and TypeScript static checks pass without parser errors. |
| `bun run test:unit` | All active Godot/platform and unretired legacy unit/integration suites pass. |
| `bun run test:parity` | Existing deterministic states/events/camera-dependent behavior remain equivalent. |
| `bun run test:e2e` | Actual exported Web Test journeys pass in Chromium and WebKit, including artwork, offline, updates and controls. |
| `bun run test:blender` | Existing and new scoped export/editability tests pass; unrelated hero assets retain their fingerprints. |
| `bun run test` | Full inherited suite runs, including parity, e2e, Blender and unretired legacy tests; not just focused art tests. |
| `bun run build` | Web Release packages complete resources/credits with one coherent release identity. |
| `bun run audit:build` | Exact emitted inventory, pack dependencies, budgets and absence of test/debug/source resources pass. |
| `bun run build:diagnostics` | Same art/content/settings in a read-only diagnostics release for phone measurements. |
| `bun run audit:build -- --final` | Additionally verifies required current evidence references, soundtrack and acceptance records; missing evidence fails. |

Direct focused GUT invocation after its integration:

```sh
godot --headless --path . -s addons/gut/gut_cmdln.gd -gdir=res://tests/godot/art -ginclude_subdirs -gexit
```

For TDD, run the focused scenario, observe a failure for the intended behavior, implement the minimum change, rerun and refactor. Capture the failure and subsequent pass. Tool setup/import failures do not substitute for a behavioral red test. Broader tests run after meaningful increments and all must pass before conventional commits.

## Acceptance scenarios

### A — Candidate inspection and source/export round trip

Download only shortlisted free source packs needed for evaluation. Retain exact archive hash, license evidence and selected-file inventory; record actual available animation names and missing actions. Compare candidate models alongside Cow/Crow/Lion/Plates at normal gameplay size. Record reuse, adaptation or rejection reasons. Review all eight concepts before final production.

Export a selected character and prop to GLB, import with pinned Godot and inspect in the actual web build. Validate skeleton, canonical orientation/feet, materials, normals, semantic clip segments and clean dependency closure. Confirm unrelated heroes' source/runtime hashes remain unchanged. Repeat the same procedure for every final export; successful import of one asset does not certify a pack.

### B — Four rooms and unchanged gameplay

Traverse exterior -> bar -> dance floor -> stage/VIP. Verify every [required cue](contracts/art-content.md), actual 3D structures, coherent style, quiet combat floor, continuous connectors and correct onward doorway. Inspect camera extrema at 667x375, 844x390, 915x412 and the actual phone layouts with their safe areas. Check both sides of each room and both adjacent views during travel.

Run current wave progression, table/pickup and boss outcome fixtures unchanged. Confirm stable area IDs, X/depth bounds and tables at (22,-2)/(28,2). Decorative props neither block movement nor receive hits/pickups; new geometry does not enlarge camera/AI visibility regions. Final victory has no GO and retry restores the exterior.

### C — Every enemy action and status

Use test-only prepared encounters for reproducible pose checks, then ordinary player controls for gameplay checks. Inspect both facing directions, idle/movement, all move windup/active/recovery boundaries, hit, normal stun/refresh/expiry, defeat and both Liam phases. Match visible contact, bottle release, rope reach and shockwave coverage to simulation timing. Ensure no default rest poses or missing parts.

Show at least two instances of a role in different states; neither pose/material change may affect the other. Stun during windup cancels a normal enemy's attack as before, while a previously released projectile continues. ROAR must not make Liam appear stunned. Phase change must not reset his active attack. Defeat shows a noninteractive pose without delaying wave clearance/results; repeated retries cannot retain old poses or actor IDs.

### D — Readiness, interruption and settings

In test fixtures omit/corrupt a required scene, texture and clip separately. Each must fail preparation with the locked duo retained, Retry available and no combat start. Repair and retry starts exactly once. Abandon a delayed preparation, then allow its callbacks to finish; it cannot replace the current scene or error.

Interrupt preparation/countdown, every attack type, stun, defeat-pose retention and room travel through background, blur and portrait orientation. Return to safe landscape: timing/poses remain frozen until explicit Resume, pending inputs clear and fresh simultaneous movement/action works. Test audio denial and unavailable storage through inherited fallbacks. Reduced motion suppresses nonessential motion; muted/no-shake play preserves visible cues; no flashing/strobing is permitted.

### E — Offline, credits, updates and resource ownership

Cache a complete release online, close, disable networking, reopen and complete all four rooms/results/retry. Repeat on both reference phones in browser and installed modes where supported. Open Artwork Credits offline from Home and paused Settings: all required text/notices are available and returning does not resume combat.

Exercise interrupted caching, corrupt/missing imported resources, quota failure and repair. Cache-only failure leaves loaded online play available without claiming offline readiness. Keep two old-release windows open through preparing/countdown/running/paused states while an update waits; no room/enemy resources may switch until the existing safe update boundary.

Force the split-pack fixture with a small cap, cold-import/export and verify every resource resolves from its sole owner with replacement disabled. Inspect actual release content membership, not just source files. Ten home/run/retry cycles return to settled live-instance counts and show no progressive retained-memory increase.

### F — Physical performance and visual review

Use identical content/settings in diagnostics and release, with intended soundtrack and representative busiest encounters. Record build/asset hashes, OS/browser version, viewport/render density, duo, frame intervals, one-second rolling FPS, longest frames, draw calls, visible triangles, scenery texture residency, character texture residency and total memory where measurable. Exclude loading/countdown/paused/hidden/results samples from active FPS summaries; report transitions and visible stalls separately.

Target 60 fps; every active one-second sample in the busiest encounter must reach at least 30 fps on both phones. Keep whole-scene draw/triangle/render-density and scenery texture budgets; audit 30 MiB content and 16 MiB physical-file limits with separate engine accounting. If costs fail, reduce material/texture/prop expense while retaining setting cues and all enemies; do not reduce waves or hide required characters.

Review all four final rooms and four enemies with every hero silhouette represented across busy gameplay, safe-area controls, muted/no-shake and reduced-motion conditions. Record actual approvals/findings, not placeholders. A phone or intended-audio dependency that is unavailable remains pending.

### G — Five-player evaluation

Use five casual action players. Preserve inherited PRD learning/completion/fighting-style criteria and record feature 010 SC-001–003: at least four correctly identify all four settings without labels/coaching; at least four distinguish melee clubgoer, ranged bartender, charging security enemy and boss after experiencing behavior; at least four prefer the new art in matched before/after views. Counterbalance before/after display order to reduce ordering bias; use equivalent camera/duo/action contexts and record preference per participant.

Record separate responsiveness and readability ratings (at least four score each >=4/5) and GO direction within three seconds (at least four succeed). Use names/role answers and silhouettes, not colour alone. Record each inherited PRD SC-001–013 outcome separately, including outstanding outcomes; no telemetry service is needed.

## Completion evidence

Store real outputs under `specs/010-upgrade-game-artwork/validation/` and `reviews/` during implementation, linked by the [evidence data model](data-model.md). Require all 13 local FRs, their scenarios and seven success criteria to map to current test/review evidence. Preserve 009's remaining obligations; artwork completion does not automatically establish full migration or MVP acceptance. Planning neither deploys nor commits a build.
