# Quickstart and Validation: Nightclub Backdrops

This is the future implementation validation guide. Planning has not produced final scenery or implemented loaders.

## Prerequisites

Use feature branch `008-nightclub-backdrops`, Bun 1.4.2 and the existing lockfile. Integrate tracked feature 005 role/session/readiness/platform/diagnostics and feature 006 camera/visible-arena/GO work first; current source still has legacy camera/loading and an index-only build audit. Do not treat installed PWA packages as a working offline build. Test all character silhouettes present after integration; 007 assets are not authored by this feature.

From repository root:

```sh
bun install --frozen-lockfile
bunx playwright install chromium webkit
bun run dev
```

Create this feature's `validation.md` before implementation, mapping FR-001–013, every story scenario and SC-001–006 to evidence. Record the unchanged level/encounter/table baseline, red/green test results and manual review procedures. Prepare and review all four concepts before final art per [visual-review.md](contracts/visual-review.md).

## Automated gates

```sh
bun run typecheck
bun run test:unit
CI=1 bun run test:e2e
/usr/local/bin/blender -noaudio --background --factory-startup --python-exit-code 1 --python tests/blender/run_tests.py
bun run build
bun run audit:build
git diff --check
```

Vitest includes integration tests; Playwright runs Chromium/WebKit with a fresh test build on port 4173. Rebuild production after browser tests. Existing Blender tests remain an all-tests-before-commit gate even though SVG scenery requires no Blender authoring. Use the installed supported Blender path if different and record it. No new package/script is required to generate SVG art.

Required automated outcomes:

- All four stable area IDs map exactly once, preserving bounds/waves/table locations; all eight self-contained art resources have valid dimensions and keys.
- Meaningful failed tests precede mapping, layout coverage, loading/partial failure/retry, readiness generations and disposal implementation.
- Rear/ground frustum coverage includes stable views, expanded transition frames, connectors and endpoints without changing 006 camera/arena assertions.
- All room images load/decode/initialize before entry readiness; block an interior asset and verify no launch, actionable Retry and retained duo. Partial/stale loads release allocations and cannot launch.
- Scene retries preserve shared textures; ten home/run/retry cycles show no accumulating live textures/contexts after ownership boundaries settle. Retirement disposes resources once.
- All three transitions, final victory, pause, resize and retry show the correct scene with no transition fetch or stale GO. Existing input/encounter/table regressions pass.
- Full-build audit includes all required artwork, intended audio and characters, with correct worker inventory/readiness. Legacy index-only audit is insufficient.

## Visual and phone procedure

On iPhone 12/Safari and Pixel 6/Chrome, record OS/browser/build and play the entire level. Inspect all positions, large characters/boss warnings, busy groups, interactive tables/drops and every transition with trailing partner. Use muted audio/no shake and reduced motion. Capture matched baseline/new camera views to establish preserved framing and readable controls/GO. See [visual-review.md](contracts/visual-review.md) for mandatory cues and failure conditions.

Hide/focus-switch and rotate during combat and travel; returning requires Resume, active time remains frozen, room presentation stays coherent and controls do not remain held. Retry from defeat and victory and verify return to the exterior.

## Offline and updates

Serve the production build over HTTPS (localhost is suitable for desktop checks; plain phone LAN HTTP is not worker evidence). Finish caching, close/relaunch with networking disabled and complete all four rooms with intended audio through results and retry on both phones; repeat installed where supported. Denied storage/audio must not block loaded gameplay. A required art loading failure must offer retry; failed caching cannot claim offline-ready. Verify cached build A remains coherent while B waits during play/pause and only changes between runs under 005 policy.

## Performance and recognition

After 005 diagnostics exist, use `bun run build:diagnostics` and record full soundtrack-inclusive runs. Target 60 fps; require ≥30 fps in active one-second windows of the busiest encounters on both phones. Record frame-time distribution, longest frames, visible transition/upload stalls, draw calls, triangles and texture allocations. Retain complete-build 30 MiB total/16 MiB per asset, 100k visible triangles, 100 draw calls and DPR≤1.5. Backdrop texture allocation starts with a provisional ≤64 MiB mipmap-inclusive budget; include all four walls/floors even if only one is currently visible. Transfer compression is not GPU-memory evidence.

Five testers identify each of the four settings without labels/coaching; at least four identify all four correctly. Collect separate readability/control ratings and exit-direction timing, retaining other PRD evaluation gates. If art fails recognition or readability, revise it and repeat affected review; do not alter combat/layout to disguise the failure.

## Completion record

Keep concept decisions and final in-game screenshots in `reviews/`; record FR/scenario coverage, commands, build resource inventory, device frame evidence, offline/lifecycle outcomes and participant responses in `validation.md`. Missing approval, soundtrack, hardware or participants stays pending. Only passing actual evidence establishes acceptance; this plan establishes design readiness.
