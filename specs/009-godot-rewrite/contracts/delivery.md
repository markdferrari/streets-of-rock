# Static Release, Cache and Build Contract

**Applies to:** feature 009 FR-009–015; [browser contract](browser-platform.md).

## Tools and build modes

Pin Godot 4.7.2, official matching standard export templates, Bun 1.4.2, Node 24.21.0,
TypeScript 6.0.3, Playwright 1.63.0, Vitest 4.1.11 and Workbox 7.4.1.
Add workbox-build 7.4.1 for exact manifest injection. Pin GUT 9.7.1 as a development
addon with recorded origin/license; exclude it from release.

A committed engine lock records official archive origin, checksum, version and
extracted template fingerprints. `bun run setup:godot` validates the installed editor
and installs matching nonthreaded web templates into ignored `.tools/godot/4.7.2/`.
Export presets use these project-local template paths. Do not auto-upgrade a tool or
silently use a different editor/template version.

| Preset | Engine export | Custom feature | Public output |
| --- | --- | --- | --- |
| Web Release | release | sor_release | dist/ |
| Web Test | debug | sor_test | dist-test/ |
| Web Diagnostics | release | sor_diagnostics | dist-diagnostics/ |

All use Compatibility, thread support off, extension support off and built-in PWA
off. Include web-compatible texture import settings. Keep test and diagnostics
resource entrypoints separate from release, and audit exported resource membership.
A URL parameter or browser setting must not turn a release into a test build.

Root project scanning ignores legacy src, scripts, documentation, node_modules,
build/dist directories and authoring-only folders. Disable automatic .blend import.
Do not place .gdignore above runtime GLBs in mixed source/runtime directories.
Export only required game/content/runtime assets; exclude all .blend backups/source,
tests, GUT, review captures and development fixtures.

## Build sequence and identity

1. Validate tool lock, content and imported resources. Record required logical
   resources and their owning pack. Fail before publication on missing clips or art.
2. Export into an ignored staging directory, preserving engine-generated basenames.
   The pack contains compiled gameplay/scripts/scenes and required imported content.
3. Compute buildId as full lowercase SHA-256 of a canonical sorted descriptor of
   staged payload relative paths/digests, mode, engine lock, pack order, and browser
   bundle/shell/manifest template digests. Generated wrappers containing buildId,
   the final inventory and worker are excluded from this identity input.
4. Place engine/packs/browser bundles under `releases/<buildId>/`; set generated
   shell loader paths to that exact release. Root index.html and an immutable release
   copy use the same bytes. Keep the manifest identity, root start_url and scope.
5. Generate the inventory from final required file bytes. It excludes its own bytes
   and sw.js to avoid circular hashing. Compute inventory digest after serialization.
6. Bundle one Workbox worker and inject the exact inventory entries plus the inventory
   file/digest; embed the same buildId. Worker generation does not feed back into ID.
7. Audit every shipped resource, worker, inventory, boot shell and metadata. Generate
   the size/evidence report outside the served release tree; report all required bytes,
   including inventory and worker, without self-referential totals.

The canonical descriptor includes shell/browser inputs so changing the adapter
changes release identity. Tests must prove identical final staged inputs have identical
identity and that changed content or shell logic produces a different identity.

### Inventory schema version 1

Fields: schemaVersion, buildId, mode, engine(version/templateSha256), entrypoint,
packMountOrder, and entries. Each entry has relative same-origin URL, lowercase
sha256, uncompressed bytes and category `engine` or `content`.

Entry URLs must be unique, normalized and traversal-free. Engine and pack URLs are
immutable release URLs. Root index/manifest/icon entries may be revisioned stable URLs.
The inventory is available at `releases/<buildId>/asset-inventory.json`. The worker
embeds its expected digest; the shell embeds only the buildId and inventory URL,
then obtains verified cache status through the worker protocol. Do not embed the
inventory digest in a shell whose bytes the inventory itself hashes. All required
files must be covered. The inventory
and worker are audited separately as content and included in reported budgets/totals.

## Budget accounting

Only official byte-verified engine WASM, loader and required engine support files
may be category engine. Gameplay scripts, packs, art, audio, custom browser code,
shells, worker, inventory, web manifest and icons are content. Include duplicated
shipped content bytes in the 30 MiB aggregate; every physical content file is <=16 MiB.

Report content bytes, engine bytes, full required cached payload, deterministic gzip
and Brotli transfer estimates, and actual hosted transfer measurements when available.
Label compression estimates clearly; they are not measured phone startup performance.
Worker-registration/browser metadata overhead is browser-controlled and is not
misrepresented as an exact cache-storage footprint.

Use the existing rendering limits: <=100k visible triangles, <=100 draw calls,
DPR-equivalent render density <=1.5; backdrop decoded textures including mipmaps
<=64 MiB. Engine allowance does not relax these or the 30 fps minimum.

## Pack splitting and mounting

Initially export a single main PCK. If it exceeds 16 MiB, export a bootstrap/main pack
and supplemental packs by fixed groups: shared assets, characters in roster order,
backdrops in room order, and audio. Promote common dependencies to the main/shared
owner. Use the smallest ordered grouping that keeps every pack <=16 MiB, without
changing aggregate limits. A single imported resource above the cap requires asset
optimization; arbitrary byte-splitting is forbidden.

Create category export presets through the same pinned Godot exporter. A resource
ownership manifest assigns application resource paths to exactly one pack. Audit
dependencies/remaps and reject missing paths or conflicting payloads. Any unavoidable
identical exporter metadata is explicitly allowlisted and still counted in file sizes.
Mount supplemental packs with replacement disabled so they cannot override application
resources. Prove imported-resource and UID resolution with a cold-export test.

The custom shell initializes the engine and preloads every required pack into its
virtual filesystem before start, using explicit paths. A minimal bootstrap loads
supplemental packs in manifest order before loading scenes/scripts that reference
them. It must not statically preload resources from unmounted packs. Preserve original
exported basenames and configure executable/mainPack paths through the generated shell.

This split path is tested with a deliberately small fixture cap even when the real
release fits one pack. It is not an untested escape hatch added after exceeding a budget.

## Worker ownership and cache protocol

Register `/sw.js` with root scope, retaining the existing installation identity.
Disable generated PWA output from Godot. Do not skipWaiting, clients.claim or reload
on controller change. Show the existing close-all-windows update instruction only
between runs; preparation/countdown/running/paused clients keep their current release.
Use natural waiting activation after all old controlled clients have closed.

Use an exact generated precache list with SHA-256 integrity, including WASM and PCK.
Do not apply a 16 MiB global Workbox cap to allowed engine files or rely on extension
globs. Navigation fallback serves the active release's cached root shell.
Do not introduce arbitrary network/runtime-cache fallbacks that can mix builds.

MessageChannel protocol:

| Request | Response / behavior |
| --- | --- |
| CACHE_STATUS {protocolVersion:1, expectedBuildId, requestId} | {type:CACHE_STATUS, protocolVersion:1, requestId, buildId, missing:[], corrupt:[], state:ready/error}; ready only after matching-ID complete digest/length verification. |
| CACHE_REPAIR {protocolVersion:1, expectedBuildId, requestId} | Progress then the same final audit result; fetch only exact missing/corrupt allowlisted release URLs, verify before inserting. |
| Legacy CACHE_STATUS with no version | Retain type/buildId/missing response fields; represent corrupt entries as missing for legacy compatibility. |
| Wrong version/build, malformed request or unknown URL | Explicit error; do not repair another release or mutate arbitrary caches. |

The worker knows the active inventory, and uses Workbox's revision-aware cache keys
rather than assuming network URLs are raw cache keys. Verify one response at a time
to bound memory; do not buffer the complete engine/content inventory at once.
Serialize repair operations per release. Responses carry requestId; stale replies
cannot update a newer page's readiness.

Publish progress; use a 10-second idle timeout and 120-second total deadline. Timeout,
quota denial, absent worker, digest mismatch or corruption never reports ready. Reset
readiness on each launch/audit; never persist it. A failed audit/repair does not block
otherwise-loaded online play. Caching alone is not runtime scene readiness.

Bundle music in PCKs, so new releases do not need external audio range routing. While
old clients exist they remain under the old worker, whose original range handling
is preserved. Do not clean their caches during new-worker installation. On natural
activation clean only superseded application-owned caches, never unrelated origin data.

## Static hosting and rollback

Serve via HTTPS (localhost for automated tests), with correct WASM, JavaScript, JSON,
PCK and web-manifest MIME types. Missing immutable assets return an error, not index.html.
Use immutable caching for release URLs and revalidation for root HTML and sw.js.
The single-thread build does not require cross-origin-isolation headers.

Publish immutable assets first and root shell/worker last; retain previous immutable
releases and original JS asset URLs during the migration window. Rollback republishes
the previous root/worker references and follows the same natural activation boundary.
Current acceptance work produces deployable artifacts and instructions, not AWS resources
or a deployment pipeline.

## Build and cache acceptance

Fail release audits on content budgets, unhashed engine exceptions, missing/mixed
resources, absent portraits/clips/props/backdrops/audio, incomplete inventory, source
asset leakage, test/diagnostic APIs or fixtures, and incorrect manifest identity.
Run actual release smoke tests in addition to test exports.

The final audit mode additionally requires intended-soundtrack confirmation and
completed acceptance records for the exact release: requirement coverage, concept
and in-game reviews, phone checks, character workflow exercises and five-player
criteria. Missing or mismatched evidence fails final acceptance; ordinary development
builds may still be generated while those reviews are pending.

Exercise two releases from one origin with two old windows, including the real legacy
worker fixture, loading/countdown/running/paused states, old saved values, failed
installation, missing/corrupt cached bytes, quota failure, repair, wrong IDs and
offline full-level completion/retry. Missing WebKit offline emulation capability stays
visible and must be covered on physical Safari before acceptance.

## Owner waiver amendment — 2026-10-14

The [explicit owner decision](../validation/manual-waiver.md) allows final audit to
accept `waived` for phones, performance, playtest and offlineUpdate. It requires an
owner-approved, current-build, digest-verified decision record and all nine evidence
references. Other final categories require measured/recorded pass status. Ordinary
automated, inventory/resource/engine/budget/isolation checks remain mandatory.
The command must print the waived categories as unverified when final auditing succeeds.
