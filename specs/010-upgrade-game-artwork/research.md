# Research: 3D Venue Scenery and Enemy Characters

**Date**: 2026-10-13 | **Feature**: [spec.md](spec.md)

## R1 — Runtime foundation and integration order

**Decision:** Implement the artwork in the Godot runtime specified by feature 009. Establish its minimum working project, simulation/view boundary, content loader, test runner and web delivery before integrating production art. Do not implement a second production artwork system in Three.js. Concepts, license assessment and engine-independent exports can proceed independently.

**Evidence:** At planning time HEAD is `45ccaf0`; tracked application code remains TypeScript/Three.js. Root `project.godot`, `game/`, `content/`, `web/` and `addons/` are absent. The current package scripts still run Vite/Vitest/Playwright. Untracked `.godot/`, `.tools/` and `dist-*` contain local artifacts but cannot establish source integration or passing acceptance. Feature 009's plan selects Godot 4.7.2, matching official export templates, typed GDScript, GUT 9.7.1 and existing Bun/browser tooling. Local tool presence is distinct from project readiness.

**Rationale:** Feature 010 explicitly preserves the approved engine direction; building two art integrations would create disposable implementation and conflicting asset authorities.

**Alternatives considered:** Extend Three.js now (rejected as duplicate work); presume generated Godot output is the source baseline (rejected); block all artwork work until full migration acceptance (unnecessary). The dependency is explicit and resolvable by the existing feature 009 work; it is not an unanswered engine choice.

## R2 — Preserve level and simulation authority

**Decision:** Map visual rooms onto existing stable area IDs. Keep movement, collisions, attack timing, AI, camera equations, tables and waves unchanged. Presentation reads snapshots/events and never emits gameplay hits or movement.

**Evidence:** `src/content/neon-velvet.ts` defines `dance-floor` [0,16], `vip-lounge` [18,34], `backstage-corridor` [36,52], `alley-exit` [54,70], all at depth [-3,3]. The visual mapping is exterior, bar, dance floor, stage/VIP respectively. Tables remain at (22,-2) and (28,2). `src/presentation/scene.ts` uses x/y/depth -> x/height/z, a fixed camera offset and primitive enemy figures. `src/game/status-effects.ts` represents stun separately from actions and forces stunned normal enemies to idle; Liam is immune. `src/game/ai/liam.ts` transitions phases without adding a new invulnerable cutscene or interrupting attacks.

**Rationale:** These values influence reachability, visibility, Specials and progression. Renaming visual locations must not change gameplay identity.

**Alternatives considered:** Rename level IDs to match art (unnecessary migration); let imported root motion or animation callbacks drive combat (violates parity); infer stun from idle animation (incorrect).

## R3 — Actual 3D scenes, explicit exports and restrained lighting

**Decision:** Compose four Godot `Node3D` room scenes using imported GLB structures/props, with shared materials and small flat textures for posters/signage. Use explicit Blender exports and preserve editable sources. Disable automatic `.blend` imports. Start with opaque materials, painted/vertex-colour shading, ambient plus a restrained shared directional light, emissive neon surfaces and existing-style ground blobs. No glow, real-time shadow maps, dynamic GI or lightmap dependency is needed for the baseline. Use static meshes merged by material within room bounds; keep connectors and visible neighboring scenery present.

**Rationale:** The user wants real geometry, while the fixed camera permits inexpensive styling. GLB fits existing authoring and Godot's import workflow. Material counts, transparency and overlapping lights can cost more than modest geometric detail. Room-bounded batches permit visibility culling without an entire-venue batch remaining visible. Compatibility is the renderer for web; the renderer named Mobile is not the web option.

**Alternatives considered:** Entire illustrated room planes (does not meet clarified requirement); direct `.blend` import (adds implicit Blender dependency during build); one dynamic neon light per fixture (unnecessary mobile cost); mandatory lightmaps (adds baking/tooling and texture budgets before evidence requires them). Optional refinements must stay within measured budgets and cannot become an acceptance dependency by accident.

**Primary sources:** [Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html), [3D scene import](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/index.html), [supported interchange formats](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html), [renderer comparison](https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html). Stable documentation is guidance; the pinned editor/export smoke tests establish project compatibility.

## R4 — Free asset selection and remaining production evidence

**Decision:** Evaluate Quaternius Ultimate Modular Men first for the four enemy bases, Kenney Furniture Kit first for interior props, and Kenney City Kit (Commercial) for exterior forms. Quaternius Ultimate House Interior is the alternate interior source. Inspect the exact free archives and license files before accepting any asset. Reuse a candidate only if the review passes; adapt outfits, silhouettes and missing clips, or create original art for documented gaps.

**Evidence:** The [Quaternius character page](https://quaternius.com/packs/ultimatemodularcharacters.html) advertises 11 modular characters, 24 animations and CC0. The [Kenney furniture page](https://kenney.nl/assets/furniture-kit) lists 140 files and CC0; [City Kit (Commercial)](https://kenney.nl/assets/city-kit-commercial) lists 50 files and CC0. The [Quaternius interior page](https://quaternius.com/packs/ultimatehomeinterior.html) lists 123 models and CC0. [Asset candidates](asset-candidates.md) preserves the initial assessment. No archive was downloaded or imported during this planning command; animation names, geometry costs and final visual fit are unverified.

**Rationale:** These are credible free starting points with editable/stylized content. Neither a marketplace screenshot nor an animation count proves Grunt melee, bartender throwing, shoulder charge or Liam's rope/shockwave coverage.

**Alternatives considered:** Buy a complete nightclub pack (outside authorized scope); assume free means redistributable (insufficient evidence); create everything without evaluating reuse (ignores owner preference). No final pack is irrevocably selected by this plan.

## R5 — Animation contracts and defeat presentation

**Decision:** Export per-role GLBs with semantic clips or reviewed clip segments. Manually sample them from simulation tick/action phase; instantiate independent skeletons/animation players. Precedence is defeated, normal-enemy stun, active action, movement, idle. Liam's phase is a nonblocking visual overlay. No root-motion locomotion or animation method/call tracks may alter simulation. Share immutable meshes/materials but keep mutable pose and phase materials instance-local.

**Rationale:** Existing ally animation sampling in `src/presentation/character-animation.ts` already uses normalized action phases. Preserve that principle while adding independent stun awareness and enemy state coverage. The existing scene hides defeated enemies immediately; the new view retains a short, noninteractive defeated pose (initially 21 active simulation ticks) so defeat is visible. This view-only record never counts toward waves, collisions or targets and never delays results; it freezes in the defeated pose at terminal state and clears on view disposal/retry.

**Alternatives considered:** Animation-finished triggers for damage/AI (changes rules); generic continuously playing attack clips (misaligns warnings/hits); a new death state in the simulation (unnecessary); a defeat cinematic before victory (changes session rules). Pose duration is presentation tuning, not an extra gameplay wait.

**Primary sources:** [AnimationPlayer](https://docs.godotengine.org/en/stable/classes/class_animationplayer.html), [AnimationMixer](https://docs.godotengine.org/en/stable/classes/class_animationmixer.html). Validate seek/manual evaluation on the pinned version with boundary-pose tests; do not assume import preserves arbitrary source names.

## R6 — Readiness, packaging and licensing

**Decision:** Extend feature 009's ResourceStore and exact release inventory with room scenes, enemies, animations, imported dependencies and offline credits. All four rooms and enemy types must validate before countdown. Reuse generation-tagged prepare/failure/retry behavior and the existing coherent-release cache protocol. Keep one editable provenance authority; derive the shipping credits subset from it. Source archives, editable Blender files, license-review captures and tests are excluded from runtime exports, but required credit/license notices ship.

**Rationale:** Later rooms must not fetch from asset suppliers or discover missing enemies during combat. An asset manifest describes logical content; the release inventory must also cover physical imported files/PCK ownership. These are different views of the same release, not two manually maintained download lists.

**Alternatives considered:** CDN asset fetching during play (breaks offline); fallback invisible/primitive enemies in an accepted release (hides incomplete art); classify artwork as engine overhead (invalid); ship complete source packs (wastes budget). The [CC0 deed](https://creativecommons.org/publicdomain/zero/1.0/) is a starting point for interpreting advertised terms, not a substitute for downloaded-asset provenance.

## R7 — Performance, test-first work and evidence

**Decision:** Inherit the whole-game ceilings: 30 MiB content, 16 MiB per physical content file, 100k visible triangles, 100 draw calls, render density <=1.5 and 64 MiB decoded scenery textures including mipmaps. Allocate art from measured remaining headroom, counting duplicate shipped bytes. Use GUT for content validation and pure view-state selection, Vitest for packaging/credits tooling, Playwright for actual exported web behavior, and existing Blender checks extended for enemy exports. Start each automatable increment with an observed expected assertion failure; define visual procedures before production.

**Rationale:** The busiest complete encounter with intended audio and both heroes determines performance. Imported engine files are the only separately allowed overhead. Headless tests cannot prove GPU quality, touch ergonomics or phone FPS. Source GLB checks cannot prove imported resources or split packs work.

**Alternatives considered:** Add a new rendering/animation dependency (unnecessary); raise budgets preemptively (unauthorized); accept isolated empty-scene FPS or desktop emulation (insufficient). The diagnostics procedure measures active frame intervals, one-second rolling FPS, stalls, draw calls, triangles and ownership over ten lifecycle cycles on iPhone 12/Safari and Pixel 6/Chrome. [Godot optimization guidance](https://docs.godotengine.org/en/stable/tutorials/performance/optimizing_3d_performance.html) informs batching/material choices; physical measurements remain decisive.

## Research resolution

Runtime selection, integration dependency, level mapping, asset interchange, lighting baseline, animation authority, source assessment, offline ownership, testing and measurement are decided. There are no unresolved technical clarification markers. Actual archive approval, eight concept reviews, imports, runtime foundation, device/player evidence and final acceptance are implementation deliverables with explicit failure gates, not claimed research results.
