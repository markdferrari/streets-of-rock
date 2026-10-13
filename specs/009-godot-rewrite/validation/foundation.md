# Phase 2 foundation evidence — 2026-10-09

T001–T020 are implemented on `009-godot-rewrite-phase-2`. The automated phase 2
checkpoint passed. T021 remains unchecked because physical iPhone 12/Safari and
Pixel 6/Chrome smoke evidence is unavailable. No phase 3 gameplay or final release
acceptance is claimed.

## Environment and reproducible commands

Godot `4.7.2.stable.official.ed1daf0bf`, official matching nonthreaded web templates,
GUT 9.7.1, Bun 1.4.2, Node 24.21.0, Playwright 1.63.0 and Blender 5.2.2 LTS.
Engine/editor/template fingerprints are locked in `godot-engine.lock.json`; GUT retains
its upstream origin and MIT license. Browser tests use the project-local browser and
libavif bundles described in [quickstart](../quickstart.md). Local listeners and Blender
probes ran through the approved execution path on this restricted host.

```sh
bun run typecheck
bun run test:unit
bun run test:e2e:legacy
bun run test:blender
bun run test:foundation
bun run build:diagnostics
bun scripts/godot/export.ts test --pack-cap 4194304 --output-dir dist-split
SOR_SKIP_EXPORT=1 SOR_TEST_DIR=dist-split bun run test:e2e:godot -- --project chromium --grep 'complete immutable|native simultaneous'
bun scripts/audit-build.ts dist
bun scripts/audit-build.ts dist-test
bun scripts/audit-build.ts dist-diagnostics
bun scripts/audit-build.ts dist-split
```

## Actual automated results

| Check | Result | Evidence |
| --- | --- | --- |
| Retained JS unit/integration | 167 tests passed, 47 files | [unit log](evidence/final-unit.log) |
| New tooling/platform contracts | 24 tests passed, 6 files | [unit log](evidence/final-unit.log) |
| GUT catalogue, gestures, import/manual pose/ownership | 8 tests passed, 81 assertions | [unit log](evidence/final-unit.log) |
| TypeScript and Godot import/static script checks | Passed | [TypeScript](evidence/final-typescript.log), [Godot](evidence/final-godot-typecheck.log) |
| Full retained browser suite | 78 passed, 8 existing skips; full sequential rerun | [legacy browser log](evidence/final-legacy-browser.log) |
| Existing Blender suite | All 24 tests passed | [Blender log](evidence/legacy-blender-approved.log) |
| Complete foundation command | Tooling/platform and GUT passed; Web Test 6 passed, 2 explicitly skipped; actual Release 2 passed | [foundation log](evidence/final-foundation.log) |
| Actual forced two-pack fixture | Native simultaneous touch/cancel and complete cold offline reload both passed in Chromium | [split browser log](evidence/browser-split-green.log) |
| Release, Web Test, Diagnostics and split artifact audits | All passed on actual exported bytes | [Release](evidence/audit-release.log), [Web Test](evidence/audit-test.log), [Diagnostics](evidence/audit-diagnostics.log), [split](evidence/audit-split.log) |
| Real deliberately failing runner probes | GUT and Blender each exited 1 for their deliberate assertion failure | [GUT](evidence/gut-runner-failure.log), [Blender](evidence/blender-runner-failure.log) |

The two WebKit foundation skips are offline emulation and Chromium CDP native
multi-touch, which this host cannot supply for WebKit. WebKit actually passed physical
canvas activation, semantic keyboard activation, gesture audio, blur/explicit resume
and the actual Release smoke. These checks do not establish physical Safari support.
The eight legacy skips remain visible; a passing isolated rerun was not substituted
for the full legacy suite.

The rig test verifies actual imported skeleton rotations change with manual pose
sampling and remain stationary between samples. An added stronger assertion first
failed when inactive playback only changed bookkeeping; the corrected manual mixer
processing passes [red](evidence/bone-sampling-red.log) and
[green](evidence/bone-sampling-green.log). Resource readiness checks every semantic
clip, import aliases and owned instance release. Browser tests exercise the actual
Godot Control and a retained semantic callback, gesture audio starts, input clearing,
explicit resume and a fresh browser page after offline mode is enabled.

Stock web touch cancellation arrives as an ordinary release. The adapter forwards
only cancellation identifiers before the native release so Godot clears the originating
input. [Tooling evidence](tooling.md) records the pinned engine source and regression;
engine bytes remain unmodified and there is no JavaScript movement/action translator.

All immutable packs are preloaded before the bootstrap mounts supplementary packs
and loads content. The forced 4 MiB cap produced actual `sor.pck` and `content-1.pck`,
with resource ownership/remap validation and a cold offline imported-fighter launch.
Production Release/Diagnostics omit the foundation fixture and mutation hooks; actual
Release smoke confirms query parameters cannot register test or diagnostics hooks.

## Export identity and budgets

These are foundation artifacts, with all current fighter resources. They do not include
the later full game and eight final backdrop textures. Content is below 30 MiB and each
non-engine file is below its configured cap. Engine bytes are a separately verified
stock exception, not a content-budget exemption for arbitrary application data.

| Output | Content bytes | Verified engine bytes | Required cached payload bytes | Packs | Exact evidence |
| --- | ---: | ---: | ---: | ---: | --- |
| dist | 5,093,758 | 39,804,840 | 44,898,598 | 1 | [report](evidence/foundation-dist-report.json) |
| dist-test | 5,101,165 | 38,228,054 | 43,329,219 | 1 | [report](evidence/foundation-dist-test-report.json) |
| dist-diagnostics | 5,093,770 | 39,804,840 | 44,898,610 | 1 | [report](evidence/foundation-dist-diagnostics-report.json) |
| dist-split | 5,103,005 | 38,228,054 | 43,331,059 | 2 | [report](evidence/foundation-dist-split-report.json) |

Build identities:

- `dist`: `0c16dbd49aad2df75d26d0577e43c6077577815aa37912fe5d96001f2a052a8d`
- `dist-test`: `2bbea9331d4bfc128ff0c3e8ed2b1bfee8c82e6425160df5f4915d1fe8fc1ffa`
- `dist-diagnostics`: `850c87c7426374e0b074da96ab14afa6ac6a43675b6575ce2f98299840f21459`
- `dist-split`: `f095236d770f728757a7a4790ed8f5ede0803c5dafaf2918b622d0e8b9d7b3b2`

Each report records the inventory digest, worker hash, per-resource pack ownership and
raw/gzip/Brotli estimates. Compression estimates are generated outside served output.
The required cached payload includes engine plus content; the inventory and root worker
are intentionally outside the inventory's own byte accounting to avoid circular hashes.
An unchanged repeated Release export produced the same build ID before the final pose
correction ([repeat log](evidence/export-release-repeat.log)); changing implementation
appropriately changed the final build identity.

## Physical-device dependency and remaining acceptance

Device discovery was attempted: `idevice_id -l` returned
`ERROR: Unable to retrieve device list!` ([iOS log](evidence/phones-ios.log)); `lsusb`
returned `unable to initialize libusb: -99` ([USB log](evidence/phones-usb.log)). Android
`adb` is absent. No physical iPhone 12 or Pixel 6 was accessible. OS/browser versions,
real safe areas, physical touch/audio, offline installed mode and phone frame pacing
therefore remain unmeasured. T021 stays open until both phone smoke records can be
completed using [the defined procedures](procedures.md).

Full gameplay parity starts in phase 3; final art/concept approval, intended soundtrack
confirmation, accessibility device review, performance and five-player acceptance are
later tasks. Final auditing deliberately rejects absent full-game/art/device evidence.
The retained legacy runtime and suites remain available. Nothing is published.
