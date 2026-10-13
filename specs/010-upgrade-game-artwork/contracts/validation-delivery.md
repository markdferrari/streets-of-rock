# Validation, Build and Delivery Contract

**Applies to:** FR-006, FR-009–013. Extends feature 009's [delivery contract](../../009-godot-rewrite/contracts/delivery.md).

## Authoring validation CLI (to implement)

From repository root:

```sh
bun run validate:art
bun run validate:art -- --definitions-only
bun run validate:art -- --room exterior
bun run validate:art -- --enemy liam
```

Wrapper: `scripts/art/validate.ts`, with `--root <directory>` for fixture repositories. `--room` and `--enemy` are optional mutually exclusive focus filters using visual ID/role; omitted means the whole catalogue. Unknown flags, IDs or simultaneous filters are errors. Full release validation always runs without filters.

Default mode validates schema, complete required identities, safe paths, accepted provenance/evidence, runtime source files, hashes, imported resource closure and all required clip bindings via `game/tools/validate_art.gd`. It must propagate parser/import/load errors and nonzero test exit status. Exit 0 means all requested structural/import checks passed; exit 1 means validation failed; exit 2 means usage/setup is invalid. Diagnostics identify subject, field/resource, reason and remediation. Never download or mutate production assets as a validation side effect.

`--definitions-only` explicitly skips engine import checks and labels its result incomplete for release readiness. It still checks cross-record identifiers, required semantic bindings and source/permission-record completeness where relevant; fixture records can use fixture files under the explicit root. Normal validation must not silently fall back to this mode because Godot or a clip is missing. Human art/rights decisions are referenced records, not claims proved by this CLI.

`bun run test:art` (to implement) runs focused GUT `tests/godot/art/` and Vitest `tests/unit/art/` suites, propagating any failure and setup/import errors. It is a focused developer command, not a substitute for `bun run test`, the complete Blender suite or release audit.

## Test-first cases

Before implementing each behavior, run its focused test and record the expected assertion failure. Missing tools, missing runtime foundation or malformed test code are setup failures, not red-phase evidence.

- Valid catalogues and exactly four stable room mappings; duplicate/unknown IDs and invalid dependency paths fail.
- Valid independent enemy instances; missing role, clip/segment, bad skeleton and unsupported tracks/nodes fail before readiness.
- Tick-boundary windup/active/recovery, moving vs camera-only motion, normal stun precedence/refresh/expiry, boss immunity, phase-two overlay, hit/death interruption and no animation-generated hits.
- Defeated-view lifetime, removed actors, new wave, terminal result, pause and reused IDs after retry; simulation results remain unchanged.
- Missing/corrupt imported art, stale success/failure, repeated Retry and disposal with in-flight preparation; current duo/run starts once.
- Provenance status/hash/evidence validation, missing mandatory credits, source-only export exclusion and deterministic credits generation from shipped assets.
- Exact dependency/pack ownership, forced small-cap split export, cold import/mount, complete inventory and content-size classification.
- Exported-browser full four-room flow, real controls, offline credits/play/retry, cache failure, pending updates and ten lifecycle cycles.

Retain current gameplay and browser regression coverage until 009 supplies equivalent replacements. Add scoped Blender checks for source/export editability, canonical transforms, clip/bone/material preservation and unrelated hero-file fingerprints. Visual procedures precede art production and supplement automated checks.

## Release content and size

Replace the old eight-SVG backdrop assumption with actual room-scene dependency closure. Extend the existing resource catalogue and immutable release inventory; do not maintain another list of downloads. Each imported application resource has one owning pack, common art goes to shared ownership and supplemental packs mount before dependent scenes/scripts load. When splitting is needed, groups include shared props, rooms and enemy art, alongside inherited hero/audio groups. Use deterministic order and replacement-disabled mounts.

Count exported scenes, GLB imports, textures, animation resources, materials, credits/notices, custom scripts and packaging overhead as content. Include duplicated physical payload bytes. Require <=30 MiB content total and <=16 MiB each physical content file; optimize an individual oversized imported resource rather than arbitrary byte splitting. Only verified stock engine files receive the inherited engine exception. Source archives, editable .blend files, candidate evidence/review images and test/debug scripts must not be served.

Report raw content bytes, engine bytes, full cached payload, estimated gzip/Brotli transfer size and actual hosted transfer measurements when available. Mark estimates as estimates. Report <=100k visible triangles, <=100 draws, render density <=1.5 and <=64 MiB decoded scenery texture residency including mipmaps. Count hero/enemy texture memory separately and report total residency; the scenery allowance is not a blanket total-memory claim.

## Offline and updates

All required artwork, material/texture/animation dependencies and shipping credits/notices participate in feature 009's verified cache/integrity readiness. Complete selection/run/results/retry needs no supplier connection. Cache failures do not claim offline readiness; missing required runtime art prevents countdown with retry.

Use the existing root-scoped worker and natural between-run update process. No forced activation, mid-run asset substitution, second worker or resource override pack. A pending release cannot mix old enemy rigs with new clips/materials during preparing/countdown/running/paused states. Test old/new windows and retained cached releases.

## Evidence and acceptance

The final audit links build and asset hashes to eight concept reviews, eight final subject reviews, complete action/landmark coverage, actual license decisions/notices, both phones and PRD player outcomes. Changed resource hashes require affected evidence to be refreshed. A source-page candidate assessment cannot stand in for archive validation or final art approval.

Release exposes neither GUT resources nor fixture mutation/diagnostics interfaces. Web Test and Web Diagnostics can expose the inherited controlled test/read-only evidence interfaces only in their respective modes. Report unresolved evidence honestly; no missing suite, device, soundtrack approval or participant outcome can count as passing.
