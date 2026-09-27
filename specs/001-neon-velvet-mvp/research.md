# Research: The Neon Velvet MVP

**Date:** 2026-09-26
**Scope:** Resolve technical choices for [the specification](spec.md), under constitution v1.0.0.
**Status:** All planning unknowns resolved. No application build or device benchmark has run.

## R1. Browser rendering and toolchain

**Decision:** Use TypeScript 6.0.3, Three.js 0.186.0 with WebGLRenderer, Vite 8.3.0,
Node 24.21.0, and Bun 1.4.2 as package manager per the owner's 2026-09-27 instruction.
Use matching Three 0.186 type definitions. Save exact dependency versions and commit bun.lock;
use `bun install --frozen-lockfile` thereafter and `bun run` for package scripts.
Node and Bun versions were observed in the workspace. These are selected baseline releases,
not an assertion that every package is the newest available version.

Keep Node available for tools with Node shebangs; do not force their runtime to Bun or replace
Vitest with Bun's test runner. Bun is the required dependency manager, and its script runner
respects Node executables. See [Bun installation commands](https://bun.sh/docs/pm/cli/install),
[lockfile](https://bun.sh/docs/pm/lockfile), and [execution behavior](https://bun.sh/docs/runtime).

**Rationale:** Three provides rendering, cameras, assets, and animation while allowing combat
to remain an independently testable TypeScript model. Use an orthographic camera, DOM/CSS
menus and controls, and no UI framework or physics engine. WebGL 2 capability failure needs
an explanatory screen; actual performance still requires device evidence.

**Alternatives considered:** Babylon.js is a capable integrated engine but supplies more
systems than this scope needs. Godot web export is viable, including single-threaded iOS
exports, but introduces a different editor/export and testing workflow. No measured engine
performance or bundle-size advantage is claimed.

**Sources:** [Three r186](https://github.com/mrdoob/three.js/releases/tag/r186),
[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html),
[Vite requirements](https://vite.dev/guide/),
[TypeScript releases](https://github.com/microsoft/TypeScript/releases),
[Babylon capabilities](https://www.babylonjs.com/specifications/),
[Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html).

## R2. Simulation, input, and reproducibility

**Decision:** Use a 60 Hz fixed-step simulation with explicit input, stable entity IDs,
integer tick deadlines, and deterministic enemy choices. Keep the simulation independent
of DOM, rendering, audio, storage, and wall-clock APIs. Render interpolated positions;
animations display authoritative action phases rather than decide damage.

**Rationale:** The game needs controlled hit/depth checks, short action windows, reliable
simultaneous defeat handling, and regression tests. A general physics engine and ECS are
unnecessary. Use simple body circles, attack rectangles/circles, and swept projectile/charge
checks. Treat this as a design inference from the requirements, not an engine guarantee.

**Alternatives considered:** Variable-step collision risks missed contacts; animation-event
combat couples correctness to asset playback. A physics engine adds integration and tuning
work without a current requirement for rigid-body simulation.

**Input/lifecycle:** Pointer Events with one captured movement pointer and independent action
pointers; HUD receives events first. Clear input and queued commands on cancellation or pause.
Lifecycle blockers prevent automatic resume. See [data model](data-model.md) for tick order.

**Sources:** [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events),
[page visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

## R3. Offline build and update policy

**Decision:** Use vite-plugin-pwa 1.3.0 with injectManifest and Workbox 7.4.1. Use a custom
worker that precaches the full versioned build, including the soundtrack. Validate generated
precache entries against the game asset inventory and build output. Explicitly set a 16 MiB
per-file precache limit; fail the build if a required asset is omitted or exceeds a budget.

**Rationale:** Runtime-only caching would omit unseen content and full audio. A completed
install plus an audit of the active build's cache establishes current offline readiness;
a persisted boolean does not. Keep all runtime resources on the application origin.

**Alternatives considered:** A handwritten caching engine repeats revision and install logic.
An automatically activating worker can disrupt an active run in another tab. Use the natural
waiting lifecycle: never call skipWaiting or clientsClaim. Announce a pending update at
title/results with instructions to close all game windows and reopen. No mid-run activation
or forced reload; paused runs also retain the current build.

**Compatibility evidence:** The plugin's tagged package declares Vite 8 and Workbox 7.4.1
compatibility. This is package-level evidence; the implementation must verify its build.

**Sources:** [Plugin package](https://raw.githubusercontent.com/vite-pwa/vite-plugin-pwa/v1.3.0/package.json),
[Workbox package](https://raw.githubusercontent.com/GoogleChrome/workbox/v7.4.1/packages/workbox-build/package.json),
[injectManifest](https://vite-pwa-org.netlify.app/guide/inject-manifest),
[precache size limits](https://vite-pwa-org.netlify.app/guide/faq),
[precaching](https://developer.chrome.com/docs/workbox/modules/workbox-precaching),
[worker lifecycle](https://web.dev/articles/service-worker-lifecycle).

## R4. Music, effects, assets, and memory

**Decision:** One HTMLAudioElement plays the looping bundled MP3 soundtrack. Decode only
short effects into Web Audio buffers. Invoke play/resume directly from Start or Resume;
catch rejection and permit silent play. Independent gain/volume settings control music and
SFX. Cache the complete music response and serve byte-range requests correctly from it.

**Rationale:** Decoding a long stereo soundtrack into memory is avoidable on phones. Partial
streaming responses are insufficient for offline playback. Attach RangeRequestsPlugin to
the precache strategy, before registering its route, so its range-aware handler actually
receives music requests. Test 200/206/416 responses and offline playback.

**Asset decision:** Start with code-created low-poly character groups and scenery, with poses
keyed to action state. They must show the specified silhouettes/clothes and four environments.
Use GLB through Three's GLTFLoader only when replacing these with authored assets; embedded
resources avoid hidden remote dependencies. Ground shadows are transparent blobs, with one
key light plus ambient light, no postprocessing or dynamic shadow maps. Keep the soundtrack
source replaceable in the build inventory. Optional artist tools are not build dependencies.

**Alternatives considered:** Full soundtrack AudioBuffer decoding increases memory; streamed
music without range-aware caching is unreliable offline. An automated Blender pipeline is
not justified for the first prototype.

**Sources:** [Cached media](https://developer.chrome.com/docs/workbox/serving-cached-audio-and-video),
[range requests](https://developer.chrome.com/docs/workbox/modules/workbox-range-requests),
[audio practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices),
[Three animation](https://threejs.org/manual/pages/animation-system.html).

## R5. Tests and device evidence

**Decision:** Vitest 4.1.11 for pure rules/adapters and Playwright 1.63.0 for Chromium/WebKit
browser flows. Run PWA cases against production builds with service workers enabled, not
against Vite's development server. Use persistent browser profiles for cache/relaunch cases.
Keep test fixtures behind a test-build flag; exclude mutation/debug controls from release.

**Rationale:** Browser automation covers integration but does not prove touch ergonomics,
installed iOS behavior, audio codecs, or actual phone GPU performance. Manual acceptance
uses iPhone 12/Safari and Pixel 6/Chrome. Define procedures before implementation, and follow
red–green–refactor for automatable behavior. Do not treat an absent application suite as passed.

**Alternatives considered:** Device-only testing misses regressions; desktop-only emulation
cannot establish device acceptance. No hosted device or analytics service is required.

**Sources:** [Vitest releases](https://github.com/vitest-dev/vitest/releases),
[Vitest migration requirements](https://vitest.dev/guide/migration.html),
[Playwright releases](https://playwright.dev/docs/release-notes),
[service-worker tests](https://playwright.dev/docs/service-workers),
[browser emulation](https://playwright.dev/docs/emulation).

## R6. Persistence, budgets, and deployment

**Decision:** Versioned localStorage for preferences/tutorial/best time, with validation and
in-memory fallback. Never persist runs. The owner clarified future hosting as AWS. Use private
S3 behind CloudFront as the compatible reference deployment at the origin root, with
versioned assets cached immutably and HTML/worker responses requiring revalidation. Preserve
old hashed resources through at least the next release; no third-party runtime CDN dependencies.
CloudFront serves this application’s own assets. The TypeScript/Three/Vite stack needs no
server process after building. Provisioning and publishing remain future work.

**Rationale:** Local data is small, and a server/database would not serve an MVP requirement.
Cache readiness is conditional on storage retention. Start with a 30 MiB complete download,
16 MiB largest asset, 100k visible triangles, 100 draw calls, and device pixel ratio capped
at 1.5. These are engineering starting budgets; measured device performance is the acceptance
criterion. Adjust budgets through the plan with evidence, without relaxing PRD gates.

**Alternatives considered:** IndexedDB for a few preferences and remote persistence add
complexity. Optimizing an empty scene would not validate the complete level.

**Sources:** [WebKit storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/),
[Three responsive rendering](https://threejs.org/manual/pages/responsive.html),
[AWS S3 origins](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/RequestAndResponseBehaviorS3Origin.html),
[CloudFront cache policy](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistValuesCacheBehavior.html).

## Outcome and remaining delivery dependencies

No unresolved technical clarification remains. The owner soundtrack, both reference phones,
and actual performance/player evidence are implementation acceptance dependencies. Source
research selects the design; it does not establish that the future implementation passes.
