# Shared authoring and representative export foundation

2026-10-14; branch `010-upgrade-game-artwork`. This record distinguishes the technical foundation from final artwork/phone/player acceptance. Raw red/green reports and build reports are under [evidence/shared-foundation](evidence/shared-foundation/).

## Implemented checks and commands

- `bun run validate:art`: nonmutating Bun -> Godot validation. Full catalogues require all four stable rooms and roles. Optional mutually exclusive `--room <visual-id>` / `--enemy <role>` scopes validate the requested subject and its declared/imported dependency closure.
- `--root <directory>` uses that absolute Godot project, including its content and imported assets. Invalid usage/setup returns 2; invalid content/imports return 1; successful requested validation returns 0. Empty/unverified child output cannot be accepted as success.
- `--definitions-only` still validates structure, referenced source records/files/hashes and explicit runtime paths, but skips imported scene/clip inspection and labels its result incomplete for release readiness. Normal mode never silently downgrades.
- `bun run test:art`: both GUT `tests/godot/art/` and Vitest `tests/unit/art/`; either scope or setup failure propagates. These tests also participate in inherited full unit commands.
- Imported scenes reject forbidden scripts, collision/navigation nodes, unsupported animation tracks and top-level-bone translation regardless of supplier naming. Required clips/segments, geometry/materials and room landmark nodes are inspected. Missing or undeclared imported dependencies are actionable failures.
- Source checks verify accepted records, acquired/retained evidence and authored/exported hashes. Complete final shipping-provenance/review invalidation and credits remain T054–T062; the authoring foundation does not automate ownership/style judgments.

Both actual production focuses (`--enemy grunt`, `--enemy zoner`) pass. They exposed a missing shared outfit-material dependency, now registered once with a hash. Full production validation intentionally fails because `content/rooms.json` and complete four-role production coverage are still absent. The full isolated four-room/four-role fixture passes; it is explicitly not shipping content or final art approval.

## Representative room/prop/rig round trip

`tests/godot/fixtures/art/representative.tscn` now includes an explicit room GLB: original floor/wall/counter plus three selected Kenney Furniture Kit stools. `scripts/art/build_representative_room.py` preserves editable named Blender parts, then exports one opaque vertex-colour surface. The original Kenney archive/member hashes are retained. [The record](../../../tests/godot/fixtures/art/representative-room/record.json) binds source/runtime/import/palette hashes; `content/art-provenance.json` identifies the prototype and its original/retained sources. Authoring input is protected from automatic import by `source/.gdignore`.

A pinned-importer palette regression reproduced white geometry in an actual browser capture. An explicit palette material/import mapping fixes it. The imported prototype contains no collision, navigation or gameplay scripts. Existing independent Grunt/Zoner skeletons, clip/material sharing, original heroes and production ResourceStore boundaries are exercised; teardown waits for deferred engine helpers and asserts no new orphan nodes.

The browser review contains four enemy instances (two of each current design) and Cow/Crow. It retains real Grunt/Zoner AI phase/projectile timing, pause-safe sampling and both facings. [Current prototype captures](../reviews/foundation/) are separate from the preserved owner-reviewed two-design motion artifacts. This is not an Enforcer/Liam or final-room substitution.

The GLB runtime hash is `24cab5e0cb37b372e45d97ec8592e2512405b42bfe36bcea120adb8e4b097bb9`. A clean unrestricted Blender rerun exits successfully and reproduces those exact runtime bytes. The earlier sandbox export produced the asset but hung during audio shutdown; that process was stopped, and its log is not claimed as a successful process result.

## Desktop headroom and delivery

Chromium and WebKit each pass the three representative browser cases (six total). At 667x375, 844x390 and 915x412, captures show four rigs plus the duo with 97 total draws and 27,874–29,526 rendered primitives. These are whole review-frame counters including its debug controls, with approximately 70k primitive and three-draw headroom under the inherited ceilings. They do not establish final complete-game FPS or predict the cost of unbuilt rooms/roles.

The prototype adds no scenery textures: its palette is vertex colour. Inherited eight-SVG scenery still occupies 55,924,064 decoded bytes including mipmaps; replacing that readiness/packaging path remains US1/US3 work. Test/Release reports retain actual content/engine/cache and compression-estimate bytes separately. Release is approximately 5.72 MiB content plus 37.96 MiB fingerprint-verified engine overhead; its single content pack remains below 16 MiB. Prototype sources/fixtures and author-only validators are excluded from Release. Exact final build IDs/bytes are in the retained reports.

## Runtime prerequisite and regression

Tracked project/presets, shared resource store, read-only simulation/camera snapshots, GUT and actual Test/Release exports exist. Initial complete browser verification found one genuine final-countdown interruption defect. A deterministic session regression demonstrates completion being sampled by `interrupt` before the next frame; the corrected frame handler launches exactly once after explicit safe Resume, including an already-completed countdown. Three repeats of the affected WebKit case pass. The complete rerun is retained separately before T007 is checked.

## Reference phones and acceptance limits

The iPhone 12/Safari and Pixel 6/Chrome smoke procedures from [procedures](procedures.md) were considered separately. No physical reference devices or remote device session were supplied, and this execution environment exposes no USB device tree. Their procedures could not be executed: both outcomes are **unavailable / pending**, never passing. Desktop emulation is not substituted for either phone.

Missing phone measurements remain T052/T053/T065 acceptance work, as explicitly permitted by T015's missing-phone clause. Intended soundtrack confirmation, five-player evaluation, all final-subject reviews and complete art/offline/credits acceptance remain open. No deployment, final feature acceptance or automatic commit is authorized by this evidence.

## Verification

Final command outcomes are recorded in `evidence/shared-foundation/`: platform/tooling, GUT, parity, Blender, typecheck, focused CLI/import/runner checks, representative browsers, complete browser recheck, Release smoke and build audit. Any skipped browser case is retained as a skip. No missing test/device/review is counted as passing.

## Extension hooks

`.specify/extensions.yml` is absent; both before_implement and after_implement hooks are skipped under the skill rules. No registered hook requires dispatch.
