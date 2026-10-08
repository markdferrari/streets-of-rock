# Runtime and Gameplay Contract

**Applies to:** feature 009 FR-001–008, FR-010, FR-014; [data model](../data-model.md).

## Authority and interfaces

- `create_run(run_id, duo, content) -> RunState` creates independent mutable state from
  validated immutable content. Duplicate or unknown identities fail before preparation.
- `step_run(run, input_frame, arena_context) -> Array[GameEvent]` executes one tick;
  only simulation rules may mutate combat, movement, AI, progression or results.
- `compute_arena_frame(run, viewport, envelopes, previous_frame, active_delta)` and
  `build_arena_context(run, frame, body, role)` remain pure scalar functions.
- `RunSession` accepts selection, preparation result, interruption, safe explicit
  resume, frame, finish, retry and home commands. It emits prepare/launch/clear-input/
  dispose-view effects and read-only UI snapshots.
- ResourceStore prepares content and returns generation-tagged readiness or a
  player-facing failure. Visual scenes consume snapshots/events; they cannot infer
  damage from animation tracks, visual overlap or frame count.

These are GDScript interfaces, not web endpoints. Rules never access the browser,
real-time waits, nodes or imported visual resources.

## Tick and time contract

Drive the existing accumulator from `_process` using monotonic milliseconds, not
Godot physics scheduling. Step size is `1000.0 / 60.0`, maximum five steps per frame;
clamp accumulated backlog before stepping and record discarded time. Preserve the
source `+1e-9` comparison tolerance. The first running frame establishes time without
advancing; pause resets accumulator/timestamp. Drain action requests only on a tick.

Order is statuses -> player actions -> AI (grunt, zoner, enforcer, Liam, partner) ->
movement/overlaps/projectiles -> active attack contacts -> terminal ->
pickups/encounters. Stop remaining stages when terminal. Resolve mutual lethal
contacts before selecting defeat precedence; increment tick as in the source.
A terminal run produces no later ticks/events.

ActiveClock measures elapsed unpaused wall time independently of simulation ticks.
Loading, selection, countdown, pause and result time do not count. Countdown shows
each numeral for a full second, advances at most once per frame and preserves
partial-numeral time through interruption. No five-minute failure is introduced.

## Combat and role parity

Port current functions and tuning before cleanup. Preserve stable entity/event
ordering; explicitly retain original-index ties where JS stable sorting supplied
them, and ID ties where already specified. Use float operands for noninteger division.

Action priority remains Special, Dodge, Heavy, Light for the same input sample;
otherwise the latest eligible request replaces the single unexpired buffer.
Unavailable input does not spend resources or displace a valid request. No recovery
cancel, held-button repetition, ally damage or ally body-blocking is introduced.

Cow/Crow area Specials, Lion's normal-only stun/boss-only damage and Plates' fixed
nearest-visible-target throw retain feature 007 semantics. Each of the twelve
duos must use role-correct health, meter, healing, support AI and terminal rules.
Preserve released projectiles through owner stun, all hit-once constraints, pickup
ownership and terminal/reset cleanup.

## Viewport, camera and presentation

Use world x -> x, depth -> z, ground y=0. Preserve scalar body envelopes from
`src/presentation/character-assets.ts`, camera offset (0,8,12), source smoothing,
padding and fitting equations. Orthographic vertical size is twice halfHeight.
Supply pre-render camera state/arena regions to rules in the same order as the source.

Ally scale remains 1.25 with existing facing yaw, action lean/stretch and spin.
Port the semantic clip selection and normalized phase samples, including
`(tick % 28) / 28` idle/move sampling. Imported animation playback is manually sampled;
animation events cannot alter simulation state. Keep enemy silhouettes, blob shadows,
telegraphs and restrained effects close to their source presentation.

Use one root viewport/world at a time, with Godot Control overlays and preview
presentation owned by the selected screen. Preview scenes release on phase changes.
Required resources, all room textures and the first gameplay view must be prepared
before countdown; later transitions cannot introduce new network dependencies.
All room groups may remain visible across camera travel; areaIndex alone is not a culling rule.

## Lifecycle, readiness and ownership

Preparation increments a generation and retains its locked duo. Only matching
results may change the session. Home, retry or replacement invalidates old results;
late success/error must release obsolete scene instances safely. Missing required
definitions/models/clips/scenery blocks entry with retry. Audio/cache-only failures
are nonblocking when the visual game is ready.

RunSession freezes simulation, clocks, animation/effects and music on interruption.
Keep pause/settings/error UI processing available; do not freeze the entire scene
tree in a way that prevents Resume. Resume requires fresh explicit input and a safe,
focused landscape environment.

On recoverable graphics context restoration, revalidate visual readiness and require
Resume. If the engine cannot restore its context, present a boot-layer reload action,
retain preferences, and discard the unsaved run; never resume a partially broken view.

Shared resource references survive Retry. Scene-local skeletons, animation players,
nodes and effects are released when retired. A ten-cycle home/run/retry scenario
must settle to the same live-owned-instance counts without increasing resource ownership.

## Parity and browser-test boundary

Record baseline run/input/events together with frame timestamps, viewport history
and supplied arena context. Compare integers, IDs, actions, event order and results
exactly; continuous values use the research tolerance. Missing optional fields become
null on both projections. A tolerance never waives a different hit, target or outcome.

Keep `window.__sorTest` only in Web Test exports for canonical snapshots, camera
frames, accepted moves, fixture setup and control bounds. Preserve equivalent setup
capabilities of existing tests, and add explicit step/replay access for deterministic
tests. Actual user journeys click/touch the canvas or use browser semantics; they
do not invoke gameplay fixture commands as a substitute for input coverage.

Web Diagnostics exports expose read-only `window.__sorDiagnostics` snapshots/download.
Release excludes these registration scripts, fixtures and GUT resources physically;
query parameters cannot enable them. Read-only browser UI projections contain only
information needed for accessibility, not arbitrary combat mutation.
