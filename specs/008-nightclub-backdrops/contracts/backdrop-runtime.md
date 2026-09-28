# Contract: Backdrop Assets and Scene Integration

No public network API, saved-state migration or gameplay schema change. These internal contracts support the user-facing room presentation.

## Definitions and assets

`src/content/backdrops.ts` maps every existing level area ID exactly once to a presentation definition described in [data-model.md](../data-model.md). It contains no renderer objects or behavior controlling encounters. Resolve texture keys in `src/presentation/backdrop-assets.ts` through static imported URLs.

Assets live under `assets/backdrops/{outside-entrance,bar,dance-floor,stage-vip}/wall.svg` and `floor.svg`. Each SVG is both editable source and bundled runtime illustration; preserve intrinsic dimensions/viewBox, opaque backing and self-contained vector content. No remote fonts, images, scripts, animated SVG or foreignObject. Draw branding as paths/shapes. Wall dimensions start at 2048×1024 and floor at 1024×512; changes require memory-budget and phone review.

## Suggested internal interfaces

- `validateBackdropDefinitions(definitions, level, manifest)` reports missing/duplicate area IDs, keys, invalid dimensions/landmark bounds and incorrect route metadata before readiness.
- `BackdropAssetStore.load(): Promise<void>` coalesces concurrent requests and completes only after all required images load/decode. `get(key)` rejects before ready. `dispose()` is idempotent and retires in-flight work.
- `createVenueLayer(level, definitions, assets): VenueLayer` creates presentation-only geometry/materials and no run entities.
- `VenueLayer.updateCoverage(frame)` expands quiet backing/floor coverage for the shared 006 CameraFrame; never changes that frame or the arena.
- `VenueLayer.dispose()` removes its group and frees only scene-owned geometry/materials. Shared textures belong exclusively to BackdropAssetStore.

## Preparation and lifecycle

1. The integrated 005 GameApp preparation loads selected character assets plus all four rooms' eight backdrop textures under its existing generation token.
2. Await all load settlements for cleanup. On any failure dispose fulfilled allocations, account for late arrivals/retirement, report the resource/room and expose Retry without losing the duo. No partial ready state.
3. Assign illustration colour textures to sRGB, use unlit opaque materials with tone mapping disabled, and leave existing character lighting unchanged. Pre-initialize all required GPU textures on the gameplay renderer before initial-frame readiness so room 4 does not pay first-upload cost mid-fight; count this as loading time. Confirm first-use behavior with transition timings.
4. Create the unstepped scene and render the exterior behind entry UI; only a matching non-retired generation signals ready. Existing explicit-resume and countdown rules control launch. Loading/decode time never advances gameplay time.
5. Transitions use already prepared textures and require no network or decoding. Keep outgoing/incoming groups available; areaIndex alone is not a visibility rule.
6. Retry disposes the old layer, retains the valid store, resets run/room and creates a new layer. Home/app retirement follows established 005 ownership; dispose textures only once no scene references them. A retired load cannot repopulate the store or signal readiness.

## Preservation and coverage

Never rename simulation areas, reorder waves, move tables/spawns, alter depth/X bounds, change camera fit/angle or add colliders. Existing arrow/GO derives solely from the 006 progression cue. New entrance imagery points to the real rightward path rather than a false door at the centre of the rear wall.

Ground/rear-wall coverage must contain their visible frustum intersections for every supported 006 stable/transition frame, including three connectors and viewport margins. Fill edges with quiet matching geometry; do not stretch signage or furnish the walkable floor. Floors stay behind shadows/pickups/actor feet without coplanar flicker. Decorative wall images remain behind all playable actor envelopes. Geometry bounds tests are supplemented by screenshots at floor-edge/boss/large-fighter positions.

## Offline and failure behavior

Extend 005's single complete-build inventory, worker precache and audit. Include each emitted illustration or its containing chunk if inlined; no alternate service worker. Runtime texture readiness and complete offline readiness are distinct. A required texture failure blocks entry with Retry; cache-only failure permits loaded play without claiming offline-ready. Cached build A remains coherent while build B waits; no texture replacement or forced reload during active/paused gameplay.

## Required tests

Observe failing tests first for mapping/exhaustiveness, dimensions/self-contained resources, immutable gameplay baseline, coverage at stable/transition extremes, all-room preload, concurrent loads, decode/partial failures, late completions, retry, idempotent disposal and shared ownership. Browser tests cover interior-resource failure before first launch, transitions without fetches, pause/resume, resize, result/retry and full offline replay. Do not replace 005/006 regressions with weaker backdrop-specific assertions.
