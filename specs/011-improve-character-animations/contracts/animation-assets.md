# Contract: Animation Assets, Validation and Delivery

**Applies to**: local FR-001–004, FR-008–010; PRD FR-062, FR-064–069, AC-066–071.

## Authoring and candidate boundary

Keep original supplied packs read-only. Retain selected source files and license evidence with hashes under the existing `assets/art-sources/` convention. Use exact file/clip identities; KayKit Medium and Large names may differ. Eight trials feed four matched comparison reviews before final production. Each source decision records actual owner feedback or remains pending. Custom original motion is a valid fallback, with the rejected sample and reason retained.

Editable source characters remain at their existing paths. Production exports keep:

| Character | Runtime model path |
| --- | --- |
| Cow | assets/characters/cow-crow/runtime/cow.glb |
| Crow | assets/characters/cow-crow/runtime/crow.glb |
| Lion | assets/characters/lion/runtime/character.glb |
| Plates | assets/characters/plates/runtime/character.glb |

Export only required target geometry, deform bones and baked clips. Target rig anatomy and weights must preserve the silhouettes and articulated attachments in the [data model](../data-model.md). Donor mannequins and unused motion/finger tracks do not ship. Exported root remains stationary; useful local body motion remains within existing character envelopes. Every required semantic key maps to a valid intentional clip segment; `RESET`/rest poses do not satisfy action coverage.

## Planned validator interface

Extend the existing command, rather than introduce a separate validator:

```sh
bun run validate:art -- --character cow
bun run validate:art -- --character crow
bun run validate:art -- --character lion
bun run validate:art -- --character plates
bun run validate:art
```

`--character` is a proposed option and is not implemented by this plan. Unfiltered validation must include all four hero profiles as well as current rooms/enemies/props. Retain existing `--root` isolated-project support. Reject unknown IDs and incompatible focus options with an actionable nonzero result. Validation is nonmutating and exits nonzero on any required failure. `--definitions-only` remains explicitly incomplete import/release evidence.

Checks must cover:

- Profile schema, exact semantic coverage, model-key agreement, accepted provenance, selected file/hash and editable/runtime hash consistency.
- Actual fresh Godot import: required physical clips, valid track/bone targets, finite transforms/weights, positive durations, ordered in-range segments and contact markers.
- Source/export rigid attachment rules, valid skin weights, no unweighted vertices, no donor geometry or unwanted root travel, no missing materials/dependencies.
- Matching attack phase boundary samples and loop seams within declared numerical tolerances; record tolerances alongside checks. Visual review still decides clipping, foot sliding, weight and readability.
- Reject method/audio tracks, tracks targeting gameplay/world transforms, and node animation incompatible with batching. Animation carries presentation only.
- Each actor can instantiate and sample independently; stale cached templates cannot bypass profile or physical-clip validation. Import alias normalization must not collapse distinct names silently.

Missing scene, malformed profile, missing segment/clip or invalid track must block character readiness with a named diagnostic and retry route. Validate selectable previews before use and revalidate the locked duo during generation-guarded preparation. Abandoned load generations cannot publish errors or assets into a newer run.

## Provenance and credits

Extend existing hero traversal through `resources.models` plus `hero-animations.json` to accepted `art-provenance.json` sources/runtime records. The runtime model path has one authority; do not silently fork it under `resources.art`. Generated offline credits must discover the actual hero sources as well as existing rooms/enemies/props. Keep source/license files in authoring evidence; bundle required notices using the existing credits pipeline. Unknown original receipt dates stay unknown; current repository acquisition is separately dated.

## Release boundary

Reuse current explicit resource roots, imported dependency closure, unique pack ownership, hashed inventory and complete-cache readiness. New hero profile metadata ships with content; full provenance, `.blend` files, donor libraries and review fixtures do not. Register a planned test-only `?fixture=hero-animation` route and browser tests for repeatable review; explicitly exclude it from Web Release and assert its absence in release tests.

Complete release content remains <=30 MiB and each physical content file <=16 MiB, including any duplication; byte-verified stock engine bytes are accounted separately. Record total cached bytes and compressed estimates. Use current diagnostics and budget checks, preserving inherited whole-scene triangle/draw-call/render-density limits. Do not reduce enemy waves or hide required actors to pass performance.

Full cached launch, all-character selection, play, results, retry, offline credits, accurate cache failure and safe between-run update behavior must pass on the actual release. Hero pose telemetry for tests is limited to the test bridge; no remote service or telemetry is added.

## Historical regression and evidence policy

Feature 011 intentionally changes hero hashes and seven-bone assumptions. Replace those assertions with meaningful new rig/attachment/motion checks before implementation, while retaining feature 010's historical fingerprint files and unchanged supplier/enemy/scenery checks. Never regenerate deterministic simulation expectations merely to accommodate changed animation.

`validation/acceptance.json` is produced during implementation using the current audit schema and exact build identity. A missing device, owner review, source trial or participant result is pending, not passed. Feature 010's evidence or waiver cannot be relabelled as feature 011 acceptance.
