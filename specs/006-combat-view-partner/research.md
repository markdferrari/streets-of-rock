# Research: Combat View and AI Partner Improvements

Date: 2026-09-28. Repository inspection is the source of truth. Delegated camera/AI research was attempted as required by the planning workflow but could not complete because the agent service reported a usage limit; findings below were completed directly from source.

## R1. Actual view bottleneck

**Decision:** Replace fixed camera span with orthographic room-envelope fitting, retaining the view direction and existing geometry.

**Rationale:** `src/ui/styles.css` already stretches game, scene host and canvas to the viewport with absolute overlays. `src/presentation/scene.ts` fixes vertical span at 12 world units; a 16-unit room therefore occupies a limited horizontal fraction on wide phones. Floors are 16×8 while walkable depth is -3..3 (`environments.ts`, `neon-velvet.ts`). Fit the walkable footprint plus hero body envelope, then compare projected floor area in matched captures. Enlarging DOM alone changes nothing.

**Alternatives considered:** Bigger room meshes violate unchanged geometry. Camera tilt changes violate fixed-angle presentation. Stretching the image distorts graphics. Cropping around the player risks off-screen partner/enemies; fit the room, preserving visibility instead.

## R2. Transition speed and natural catch-up

**Decision:** Include both active allies in transition framing and retain the trailing partner's existing unlocked travel region until arrival, without delaying player progression.

**Rationale:** Rooms are [0,16], [18,34], [36,52], [54,70]. Existing camera interpolation moves its centre 18 units while the player crosses only 2 world units: centre movement is nine times doorway movement. Existing AI is clamped to the current room and teleports at separation >6, a direct cause of pulling. Merely removing that teleport can leave the partner off-screen or unable to cross the gap. Shared fit bounds and explicit trailing travel state solve the combined failure.

**Alternatives considered:** Raising partner speed changes character tuning and still does not guarantee visibility. Clamping the partner to a moving viewport edge drags it. Waiting for the partner before spawning waves changes progression. Temporarily widening the camera preserves ordinary movement and player-driven progression.

## R3. Engagement, facing and recovery

**Decision:** Keep existing threat ranking after visibility/reachability filtering, finish valid attacks before regrouping, face resolved movement, and detect genuine rejected movement rather than player separation or time since position updates.

**Rationale:** `src/game/ai/crow.ts` tests separation before targeting and updates facing only at attack range. Its lastProgressTick conflates intentional waiting with obstruction. Support currently deals 8 damage every 54 ticks and has a six-tick active pose; no new attack strength or action stages are needed. Feature 005 supplies role-based profiles; 006 must preserve those values.

**Alternatives considered:** A behaviour-tree package or navmesh adds complexity unsupported by the current rectangle-based world. Increasing aggression through damage changes violates scope. Removing all recovery leaves genuine bad-position failures unhandled; use actual obstruction evidence with conservative fallback.

## R4. Shared geometry without rendering dependencies

**Decision:** Pure projection helpers consume finite aspect ratio, camera anchor/span and conservative body envelopes. Simulation receives numeric arena context at fixed ticks; rendering uses that same context. No Three or DOM import enters game rules.

**Rationale:** Partner visibility depends on camera framing, but deterministic rules remain independently testable under the constitution. Orthographic projection with a fixed basis is linear, so projected envelope extremes come from corners and do not require a scene raycast. Baseline room/camera constants and loaded model extents provide numeric input.

**Alternatives considered:** Reading live renderer state inside AI couples rules to frame rate. A fixed world tether ignores actual view. Independent camera/AI bounds would disagree at resizing and doorway transitions.

## R5. GO is already present but insufficient

**Decision:** Promote `combatHudMarkup()`'s small GO span into a dedicated noninteractive cue model/view. Derive eligibility from actual next-area existence and terminal state.

**Rationale:** The current implementation checks `areaIndex < 3` and places GO among health labels; it does not provide the requested prominent exit cue. `updateEncounters()` already distinguishes final-wave clearance from intermediate waves, so the new UI must consume progression state, not duplicate encounter logic.

**Alternatives considered:** A timed event animation can disappear before travel completes or survive resets. A new image asset adds cache/art work unnecessarily; inline SVG and text suffice with existing styling.

## R6. Prerequisites and verification

**Decision:** Implement on 005's completed selected-role foundation and platform adapters. Preserve its settings/audio/cache/update design and run regression evidence rather than creating competing infrastructure. Write tests before all automatable changes.

**Rationale:** This checkout still contains CowState/CrowState, fixed-role selectors, an unconfigured PWA plugin and an index-only audit. Feature 005's documents describe the required migration and missing platform work, but do not constitute its implementation. Early legacy fixtures help investigate; final acceptance must use both assignments and actual offline behavior.

**Alternatives considered:** Duplicating 005 in this plan risks conflicting models and excessive scope. Skipping offline/both-role gates falsely declares completion. Explicit integration prerequisites permit useful independent geometry tests without weakening final acceptance.

## Resolution

All design questions have chosen defaults in the data model/contracts. Remaining work is implementation and evidence, not unanswered product intent. No dependency upgrades, external APIs, new art or additional rooms are required.
