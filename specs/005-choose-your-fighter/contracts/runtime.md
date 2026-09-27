# Runtime Contract: Selection to Gameplay

Internal TypeScript boundaries; names below are the planned interfaces, not existing public APIs.

## Pure content and simulation

- `validateRoster(roster)` reports duplicate IDs, incomplete profiles/mappings, invalid numbers, and fewer than two entries before selection enables.
- `reduceSelection(state, event, roster)` returns next selection plus an optional confirmed DuoAssignment. It performs no loading, rendering, persistence, or clock reads.
- `createRun(runId, duo, roster = characters): RunState` requires a valid duo; no implicit production Cow/Crow default. Existing fixtures must supply the canonical duo explicitly.
- `getPlayer(run): PlayerState` and `getPartner(run): PartnerState` resolve roles and fail fast for malformed test/content state. Gameplay cannot use character identity to determine inputs, targets, meter, pickups, defeat, or camera ownership.
- Shared semantic moves and animation mappings follow [data-model.md](../data-model.md). Enemy moves remain unchanged. Rename crow-hit/crow-recovered to partner-hit/partner-recovered and migrate all effect/tutorial/test consumers together.

## Browser lifecycle boundary

RunSession accepts selection events, preparation success/failure with generation, frame time, interruption/resume, result Retry, and homepage reset. It owns all transitions and exposes a readonly snapshot plus effects: prepare(duo,generation), launch(run), clearInputs, disposeViews. GameApp executes effects and renders snapshots; it cannot independently assign a conflicting screen phase.

`prepare(duo,generation)` resolves only after required GLBs/portraits validate, the preview canvas is disposed, a new unstepped run and gameplay scene exist, and the initial level frame renders successfully. It does not tick gameplay, start the active clock, or start audible music. Async completions must match current generation; stale completions clean up their resources without altering state.

The countdown accepts injected monotonic timestamps and interruption state; it reports numeral, remaining active time, and a one-shot completed effect. It follows the frame-stall policy in the data model. Launch consumes completion once, resets all input/loop/clock state, then starts simulation and music. Abort or renderer failure yields retryable error with locked duo preserved.

All selection handlers process one activation only. Fresh pointer/key release is required across selection steps and gameplay entry. Resume checks visibility, focus, and orientation and cannot consume held input as a gameplay action.

## Assets and preview

Extend CharacterAssetStore from a fixed pair to registry asset keys with per-identity required clips. Deduplicate loads, report loading stage/completed assets, reset failed promises for Retry, and validate every action mapping. Unknown identity or missing clip is an explicit error.

Preview instances own their mixers/camera/lighting/renderer and temporary scene objects, but share store-owned geometry/materials/textures. Disposal stops actions, uncaches roots and releases preview-owned objects; it does not destroy templates used by later gameplay. A single live preview canvas is allowed. Repeated switches/retries must not accumulate canvases, mixers, or stale handlers.

## Platform boundary

- Preferences expose validated defaults when storage fails, without blocking session transitions.
- Audio unlock is attempted synchronously on a deliberate selection/Retry/Resume gesture. Unlock media silently and pause it for preparation; gameplay launch starts audible playback. Rejection is caught and gameplay proceeds silently, with an optional user gesture to enable sound later. Pause/interruption stops music; retry restarts a single instance. Use short local SFX for action/impact/damage/pickup/result.
- PWA uses existing injectManifest/Workbox dependencies. Inventory covers HTML/JS/CSS, portraits, both GLBs, level content, soundtrack, effects, and icons. Set per-file precache limit 16 MiB and audit the complete 30 MiB budget. Serve full cached music with valid range handling (200/206/416).
- Offline-ready requires all required inventory entries in the current-build cache. Playback denial is distinct from missing cached bytes. No soundtrack still means final audio/offline acceptance pending; development may bundle an explicitly identified placeholder.
- Never invoke skipWaiting/clientsClaim or forced refresh. A waiting update is announced at homepage/results with instructions to close all game windows and reopen; locked preparation/countdown and active/paused runs retain their current worker/build, including with multiple tabs.

## Compatibility

No public API, backend, saved selection, or saved-run schema is introduced. Internal actor/move/event types and every test consumer migrate atomically. Preserve existing preference-independent best-time/tutorial data and Cow-player numeric regressions. Upgrade the production build audit to reject test globals/fixture roster, omitted assets, missing clips and budget violations.
