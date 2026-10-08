# Research: Godot Rewrite with Functional Parity

**Feature**: [spec.md](spec.md) | **Date**: 2026-10-08 | **Reference**: `58137537a7d4ef992bd27e3fdf7efe92e5e2add1`

## Scope and inspected baseline

The owner's choices are settled: Godot game/runtime UI, retained mobile browser/PWA
delivery, limited browser glue, close existing presentation, all committed features
through PRD 2.5, and separately accounted engine overhead. Native exports and unrelated
backlog ideas remain deferred.

The pre-research constitution assessment passes at design level: the spec maps every
feature requirement to the PRD; this plan must preserve test-first implementation,
physical phone/player acceptance and honest pending evidence. No constitution exception
is needed. Implementation and physical acceptance are not claimed.

Research was split among agents for runtime/assets/testing, browser/storage/delivery,
and authoring/backdrops/acceptance, then reconciled against the actual checkout.
All technical choices below are resolved; executable validation remains implementation work.

Observed tools: Godot 4.7.2 standard (`ed1daf0bf`), Blender 5.2.2 LTS, Bun 1.4.2,
Python 3.12.3; the repository pins Node 24.21.0 and TypeScript 6.0.3.
Godot export templates are currently absent. No Godot project, presets, GUT installation
or Godot tests exist yet.

Earlier exploration in this conversation passed 167 unit/integration tests, typecheck
and the 7.05 MiB production build/audit. The combined browser run had 76 passes,
eight skips and two Chromium failures; the two passed in isolation with one worker
and an increased timeout. This indicates timing sensitivity, not a fully green default
suite. Do not label those outcomes new-engine evidence. Blender tests were not rerun
during this planning workflow.

Feature 008's plan describes missing selection/camera/PWA prerequisites that are now
implemented. Its scenery itself remains absent. Feature 007's authoring commands
exist despite older contracts calling them future interfaces. Preserve those historical
documents and reconcile current obligations in this feature's evidence register.

## R1 — Engine and web configuration

**Decision:** Pin standard Godot 4.7.2 and matching official export templates. Use typed
GDScript, Compatibility rendering, single-thread web export, no GDExtensions and no
Godot-generated PWA. Root `project.godot` remains the development entry point.
Bun continues as package manager and runner for browser/build/authoring tools.

**Rationale:** This follows the chosen engine while retaining web delivery and avoiding
a threading/header dependency. Editor-native running supports development only; it
does not add a native distribution target.

**Alternatives considered:** C# web delivery, threaded exports, a JS gameplay module
hosted inside Godot, and native-first delivery. None fits the agreed minimal web port.

**Sources:** [Godot 4.7.2 release](https://godotengine.org/download/archive/4.7.2-stable/),
[official web export guide](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html).

## R2 — Simulation authority and numerical parity

**Decision:** Port rule/state code into typed RefCounted objects, retaining the exact
manual 60 Hz accumulator and five-step backlog cap. Use separate monotonic active
wall time for results. Preserve stable arrays, explicitly ordered tie breaks, float
division and 64-bit scalar coordinates; convert to rendering vectors at view boundaries.

**Rationale:** Godot physics scheduling, automatic collision resolution, unstable sorting
or lower-precision vector math could alter combat. The source loop discards excess
simulation time while the active clock measures real unpaused time.

**Alternatives considered:** Native character-body physics, fixed-step callbacks replacing
the source accumulator, and interpreting animation completion as an attack event.
Reject these because they change observable behavior or couple testing to rendering.

**Sources:** `src/app/loop.ts`, `src/app/clock.ts`, `src/game/step.ts`,
[GDScript float](https://docs.godotengine.org/en/stable/classes/class_float.html),
[Array ordering](https://docs.godotengine.org/en/stable/classes/class_array.html).

## R3 — Camera is an explicit rules input

**Decision:** Port camera/envelope/arena computations as pure scalar functions. Replay
fixtures include frame timing, viewport changes and supplied ArenaContext in addition
to input and initial run state. Compare discrete state/events exactly and continuous
values with relative/absolute tolerance `1e-9 * max(1, abs(expected), abs(actual))`.

**Rationale:** Partner targeting and Headrest Throw depend on visible regions supplied by
the scene. Identical joystick/action ticks alone are not a sufficient parity fixture.
Tiny numerical differences cannot excuse changed hits, targets, events or terminal results.

**Alternatives considered:** Fixed-room AI bounds, deriving visibility from a new renderer's
frustum, or snapshot-only comparison at the end of a run. These can conceal divergent play.

**Sources:** `src/game/arena.ts`, `src/presentation/camera.ts`,
`src/presentation/scene.ts`, `src/game/specials.ts`.

## R4 — Tests and reference retirement

**Decision:** Pin GUT 9.7.1 for headless GDScript tests, retain Vitest 4.1.11 for browser/tool
modules and Playwright 1.63.0 for Chromium/WebKit. Preserve the Blender suite. Use
recorded reference fixtures and test-case mapping before deleting superseded TS code.
Parameterize each duo into a separate browser test and use state-based waits for normal
flows; test exact action timing in headless replay.

**Rationale:** GUT's compatibility table maps this version to Godot 4.7.x. Existing browser
timing sensitivity must be repaired in the harness without changing combat windows.
Separate actual canvas-input and DOM-accessibility journeys prevent false coverage.

**Alternatives considered:** Rewriting a bespoke test framework, keeping TS combat as the
permanent production authority, discarding old tests without replacements, or globally
loosening gameplay assertions.

**Sources:** [GUT compatibility](https://github.com/bitwes/Gut),
[GUT CLI](https://gut.readthedocs.io/en/v9.7.1/Command-Line.html),
[Godot CLI](https://docs.godotengine.org/en/stable/tutorials/editor/command_line_tutorial.html).

## R5 — Assets, presentation and import hygiene

**Decision:** Reuse existing GLBs, portraits, WAV effects, MP3 music and editable Blender
sources. Disable automatic Blender imports and animation optimization initially.
Drive imported animation samples from simulation state. Retain current camera equations,
body envelopes, 1.25 ally scale, facing and pose adjustments.

Exclude tools, reference code, build output and documentation from Godot scanning;
exclude all authoring sources and test/diagnostic resources from release exports.
Keep runtime assets in their existing locations and move shared definitions to `content/`.

**Rationale:** Re-exporting or regenerating characters is unnecessary and risks changing
their appearance. Imported-resource presence and semantic animations need their own
checks; source GLB checks alone cannot prove a correct Godot import.

**Alternatives considered:** New models, automatic .blend importing in every build,
animation-driven gameplay, and a runtime Three.js compatibility layer.

**Sources:** `src/presentation/character-assets.ts`, `src/content/animation-clips.ts`,
[Blender importer setting](https://docs.godotengine.org/en/stable/classes/class_editorsceneformatimporterblend.html),
[AnimationPlayer](https://docs.godotengine.org/en/stable/classes/class_animationplayer.html).

## R6 — Input and accessible Godot UI

**Decision:** Godot owns physical canvas input, gesture arbitration and visible Controls.
Use touch indices from ScreenTouch/ScreenDrag, including canceled touches, and a reserved
mouse pointer identity. Disable mouse/touch emulation duplication. Browser semantics
mirror Godot's current UI descriptors and return generation-tagged focus/activation/value
intents; the bridge owns no selection or combat rules.

**Rationale:** Keeping DOM gameplay UI would violate the requested migration; canvas-only
UI would discard existing browser semantics. Physical touches and semantic activation
need separate event routes so a single gesture cannot execute twice.

**Alternatives considered:** Retaining the HTML game interface, implementing touch rules
in JS, and using invisible DOM buttons as the only input tests.

**Sources:** `src/input/pointers.ts`, `src/input/selection.ts`, `src/ui/selection.ts`,
[ScreenTouch cancellation](https://docs.godotengine.org/en/stable/classes/class_inputeventscreentouch.html),
[JavaScript bridge](https://docs.godotengine.org/en/stable/tutorials/platform/web/javascript_bridge.html).

## R7 — Persistence, lifecycle and audio

**Decision:** Keep all three existing localStorage keys and JSON formats. GDScript owns
validation and in-memory fallback; JS performs allowlisted raw storage access and
reports lifecycle/safe-area/reduced-motion changes. Use Godot AudioStreamPlayers:
one streamed music player and sample-playback effect voices, with independent levels.
Unlock via actual selection/Retry/Resume gestures, including semantic activation.

**Rationale:** Replacing localStorage with another store would strand returning users.
Streaming music avoids decoding an entire replaceable soundtrack as one sample; effect
samples keep action feedback prompt. Music does not require rhythm-accurate latency.
Phone tests must prove this single-thread audio choice under busy gameplay.

**Alternatives considered:** IndexedDB save migration, persisting partial runs, audio JS
as a second game subsystem, and predecoding arbitrarily long music. No new audio effects
or procedural audio are required. Retain reusable imported effect assets and silent fallback.

**Sources:** `src/platform/settings.ts`, `src/platform/best-result.ts`,
`src/ui/tutorial.ts`, `src/platform/audio.ts`, official web export guide above.

## R8 — One coherent release and worker

**Decision:** Keep `/sw.js` and root scope, use Bun-built Workbox 7.4.1 plus pinned
`workbox-build` 7.4.1 for exact precache injection, and disable the engine's PWA generator.
Use one canonical release ID and immutable release asset URLs. Do not call skipWaiting,
clients.claim or reload clients on controller change; activate naturally after old
windows close. Add digest verification and bounded repair.

**Rationale:** The legacy worker is already deployed-compatible and uses conservative
activation. It checks cache presence only and computes a different build ID from the
inventory tool; corruption repair and a shared identity are required improvements.
Preserve old release URLs during publication/rollback.

**Alternatives considered:** Two service workers, forced activation, broad cache-first
runtime fetching and treating any installed worker as offline-ready.

**Sources:** `src/sw.ts`, `src/platform/pwa.ts`, `scripts/build-asset-inventory.ts`,
[Workbox precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching),
[worker lifecycle](https://web.dev/articles/service-worker-lifecycle).

## R9 — Content budgets and packs

**Decision:** Audit emitted content, including imported resources and PCKs, at 30 MiB
aggregate and 16 MiB per physical content file. Only byte-verified official engine
artifacts qualify for separate overhead. Start with one main pack; if it exceeds the
file cap, use explicit supplemental content export presets and mount packs before
loading referencing resources. Their ownership and split rules are fixed in the
delivery contract.

**Rationale:** The existing precache glob omits WASM/PCK and its global 16 MiB limit
cannot be applied to the approved engine exception. Bundling changes do not waive
content limits or full-build accounting.

**Alternatives considered:** Counting only source assets, labeling the whole Godot export
as engine overhead, arbitrary binary slicing of a resource pack, or unlimited content.

**Sources:** [PCK exports](https://docs.godotengine.org/en/stable/tutorials/export/exporting_pcks.html),
[HTML shell API](https://docs.godotengine.org/en/stable/tutorials/platform/web/html5_shell_classref.html).
The shell API page warns that it may lag 4.7: validate loading with the pinned export
in the foundation slice; documentation alone is not executable evidence.

## R10 — Shared content and authoring workflow

**Decision:** Keep CharacterDefinitionV1 and semantic IDs. Move roster, resource keys,
animation requirements, body envelopes, tuning and level data into engine-neutral JSON.
The GDScript validator is authoritative for runtime and headless validation; existing
Bun CLI entrypoints become thin adapters to that validator. Scaffold still creates
explicitly incomplete drafts, never auto-registering them.

**Rationale:** This removes imports of renderer/game TS from authoring tools and avoids
maintaining two independent final validators. Fix malformed-input gaps found in the
old validator (positive player HP/speed and numeric knockback) with failing fixtures,
preserving valid shipped values. Preserve scoped Blender CLI behavior and original assets.

**Alternatives considered:** Resource-only authoring that breaks existing briefs/tools,
permanently duplicated validators and regenerating all characters.

**Sources:** `scripts/characters/scaffold.ts`, `scripts/characters/validate.ts`,
`src/content/characters.ts`, feature 007 workflow contract and review records.

## R11 — Complete scenery and honest acceptance

**Decision:** Retain feature 008's four reviewed concepts and eight self-contained SVG
panels, imported as static unlit textures. Wall dimensions are 2048x1024 and floors
1024x512. Map original room IDs to the new visual identities without changing level
data. Preserve <=64 MiB decoded backdrop textures including mipmaps and all inherited
render/performance budgets.

**Rationale:** Static editable vector art fits the accepted appearance and existing asset
workflow. All four room groups and quiet connector/backing surfaces must cover camera
travel; active-area-only visibility is insufficient. Actual art, phone, soundtrack and
participant reviews remain delivery dependencies.

**Alternatives considered:** Regenerating characters, a new level pipeline, dynamic
decorative lights, extra interactive furniture, and treating screenshots as player-recognition proof.

**Sources:** [Feature 008 plan](../008-nightclub-backdrops/plan.md),
[Feature 008 visual review](../008-nightclub-backdrops/contracts/visual-review.md),
[PRD evaluation](../../PRD.md).
