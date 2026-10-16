# Phase 4–6 release validation

Branch `011-phase4-one`, 2026-10-16. Production motion, runtime integration and delivery are implemented. This record covers automated verification; T029/T034 and T043–T046 remain pending. Phase 7 final acceptance/evidence audit is outside this execution scope.

## Immutable candidate

- Release: `86082f722997c4a9a94fee878d8202507e7cbedb7f8fb985f11491c4951d2d95`, local output `dist-hero-final/`.
- Diagnostics: `7efc1a66604dc042640424dbb5685f3474f5ca8bd6650ee5cfbf92ff594e9bed`, local output `dist-diagnostics/`.
- Final Web Test: `207cfb69917d561536926727190ea7e10201da5f73d38405276882170cb93ff0`, local output `dist-hero-test/`.

Exact editable/runtime/source clip identities and hashes are retained in the four [character binding records](../reviews/fighters.md) and `content/art-provenance.json`. The original Universal supplier file, original hero sources, gameplay definitions/simulation and pinned dependency/tool versions are unchanged. Preproduction runtime GLBs are retained in the test-only comparison fixture, with hashes checked against feature 010's historical register.

## Commands and results

| Command | Actual result |
|---|---|
| `bun run typecheck` | Pass: TypeScript and pinned Godot script checks |
| `bun run test:platform` | Pass: 92 tests in 20 files |
| `bun run test:godot` | Pass: 160 tests, 3135 assertions |
| `bun run test:blender` | Pass: 38 tests, including articulated exports and Special contact timing |
| `bun run test:parity` | Pass: all 26 current-rule fixtures match exactly; inherited explicit revisions retained |
| `bun run test:art` | Pass: 63 GUT tests and 26 Vitest tests |
| `bun run validate:art -- --character cow` | Pass: focused profile, provenance and real imported resources |
| `bun run validate:art` | Pass: complete hero/room/enemy/prop catalogue and imported closure |
| `bun scripts/godot/export.ts release --output-dir dist-hero-final` | Pass: final immutable candidate above |
| `bun scripts/godot/export.ts diagnostics` | Pass: final diagnostics identity above |
| `bun scripts/godot/export.ts test --output-dir dist-hero-test` | Pass: final Web Test identity above |
| `bun run audit:build -- dist-hero-final` | Pass: ordinary release audit; no prior manual acceptance waiver applied |
| Browser components of `bun run test` | See [browser.md](browser.md) for exact scopes, reruns, identities and declared skips |

The aggregate `bun run test` wrapper was not reported as passing: its fixed development-server port 4181 was already occupied. Every constituent test scope was run using isolated browser ports/output directories. Initial sandbox socket restrictions required running editor exports/Playwright outside that restriction. The first sandboxed `test:art` Node child returned no report and was unverified; the complete wrapper passed when rerun outside that restriction. Blender subprocess shutdown likewise completed in that environment. No missing report was treated as a pass.

## Delivery accounting

The final release audit reports:

| Measurement | Bytes |
|---|---:|
| Complete game content | 6,454,401 |
| Verified stock engine overhead | 39,804,840 |
| Complete cache | 46,259,241 |
| Total gzip estimate | 16,546,092 |
| Total Brotli estimate | 14,588,982 |

One content pack; content is 6.16 MiB against the inherited 30 MiB budget and the content pack remains below 16 MiB. Stock engine overhead is separately byte-verified. Ownership/remap and model/profile/credits closure checks pass. Retained donor art, editable Blender sources, historical baselines and review fixtures are excluded from Release; required hero credits ship inside the verified cache.

Desktop diagnostic captures/reports are in [gameplay/](gameplay/). They record first-room browser rendering, actual frame samples, draw calls, triangles, textures and owned resources; they do not measure either reference phone, busiest encounters or sustained full runs. Their reported FPS must not be interpreted as mobile acceptance. Phone, full offline and participant requirements remain explicitly pending in their linked records.

## Red–green evidence

Meaningful initial failures were observed for step accumulation/deduplication, phase/contact resolution, manual imported-bone sampling, terminal Resume, preview clocks, animated-attachment batching, cached profile/clip/track integrity, source/credits traversal, hero CLI focus, export exclusions and browser diagnostics/load repair. Regressions also exposed and then verified fixes for duplicated imported rest translation, reaction movement of active contact limbs, late ROAR/Headrest release poses, spins extending into recovery and comparison fixtures accidentally following replaced production files. Focused checks passed before the broader suites.

No physical-device or five-player outcome, final owner animation review, deployment or commit is claimed by this record. [Tasks](../tasks.md) retain those unchecked acceptance obligations.
