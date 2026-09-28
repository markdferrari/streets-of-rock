# Data Model: Combat View and AI Partner Improvements

## Existing state and compatibility

Use feature 005's CharacterId, PlayerState, PartnerState, DuoAssignment and `getPlayer`/`getPartner`. Keep identities, HP, support damage/cooldowns, movement/catch-up speeds, attack clips and level definitions unchanged. New state is transient and reset on new run; no browser-storage migration.

## ArenaContext

- `viewport`: finite positive CSS width/height and safe insets; aspect is width/height. Browser chrome is excluded. Safe insets govern overlays, not world collisions.
- `frame`: `anchorX`, `anchorDepth`, `anchorHeight`, `halfHeight`, `aspect`, plus fixed basis. The view direction uses offset (0,8,12); right=(1,0,0), up=(0,12,-8)/sqrt(208).
- `legalRegions`: union of existing current-room rectangle and unlocked travel rectangle(s), bounded by original level coordinates/depth. For a trailing partner, include its outgoing cleared room/corridor until arrival; never unlock a new enemy room early on the player's behalf.
- `bodyEnvelope`: conservative local x/y/depth min/max of each ally at existing gameplay scale, covering its existing movement/attack poses. Presentation loads numeric bounds during asset readiness; rules see numbers only. Validate finiteness and positive extents. Add 0.1 world-unit padding as provisional safety margin; test actual existing clips against the envelope before acceptance.
- `visibleRegion`: legal positions whose full partner body envelope projects inside the padded viewport. Rectangles plus the fixed projection's linear constraints yield a convex visible polygon per legal rectangle; use their union. UI buttons do not remove world-space movement regions.

All movement proposals must lie in the legal region and visible polygon. Limit the proposed displacement along its segment to the boundary; do not assign the actor directly to a distant boundary point. Select another route/intent if the destination is invalid. The camera frame includes the actor's current body so normal viewport changes cannot require a teleport into its visible region.

## CameraFrame and TransitionState

Build the required envelope from active-room walkable corners (-3..3 depth in the current content), conservative hero height/extents, both living allies' current body boxes, and required player travel position. During clearance blend the room anchor toward the next room by the existing doorway fraction, then fit around that anchor. At next-room entry include the trailing living partner and its legal travel path until it enters the current room.

For required points projected onto the fixed right/up axes, compute extrema. Candidate centre is the projected envelope midpoint adjusted toward the room anchor only while containment holds. With 5% padding per side, choose:

`halfHeight = max(projectedHeight / 1.8, projectedWidth / (1.8 * aspect))`.

Recompute span after any centre smoothing. No stretching or camera-angle change is allowed. Fit expansion and any correction needed to retain bodies are immediate. Default centre/zoom-in exponential smoothing half-life is 0.15 seconds of active time; smoothing cannot override containment. Stable combat frames fit the room at a fixed centre. Transition envelopes may temporarily widen, then shrink once the trailing partner arrives. Freeze during pause; on resize compute a fresh containing fit without simulating the actors, then require normal explicit Resume where applicable.

`TransitionState` holds outgoing/current area IDs and whether a living partner remains in an outgoing unlocked region. Clear the outgoing region after arrival; no persistent history, enemy respawn or new progression gate. If the partner is knocked out, omit it from camera containment and catch-up rather than reviving/moving it. Player entry and wave spawning remain unchanged.

The 90% width/height specification criterion concerns the gameplay viewport; the room footprint must separately gain projected area against the old half-height-6 baseline in matched stable-room captures. Do not promise that a fixed-angle floor alone occupies 90% of both axes: its aspect ratio makes that incompatible with fitting the whole room without distortion.

## PartnerIntentState

Fields: `intent: engage | regroup | idle | recover`, `targetId: number | null`, `destination: Position | null`, `lastHorizontalFacing: -1 | 1`, `blockedTicks`, `blockedDestination`, `lastResolvedPosition`, and `lastRecoveryTick`. Existing activity/action/health and decisionReadyTick remain authoritative.

| Condition | Behavior |
| --- | --- |
| Partner inactive/KO, terminal run, or paused | No movement, attack or obstruction accumulation; do not revive or drag. |
| Existing action phase expires | Set the proper following phase/idle before evaluating new intent, even if a movement branch would otherwise return. |
| Underway valid attack inside safe visible region | Face target and complete the existing action; player separation alone cannot cancel. |
| Camera travel requires visibility-safe following | Regroup by normal movement; cancel only the non-damaging remaining pose if necessary for visibility, never replay damage or reset attack cooldown. |
| Eligible enemies exist | Engage; retain valid current target unless a higher-ranked immediate threat is chosen between attacks. |
| No eligible enemy, room travel in progress | Regroup toward player through the existing unlocked path. |
| No eligible enemy, settled room | Follow normally only when no combat approach/attack is displaced, then idle near player. |
| Actually blocked movement persists | Try alternate legal axis/depth movement first; recover only under the evidence rules below. |

Target ranking: enemies actively threatening the player, then reachable zoners, then other enemies; distance then entity ID breaks ties. Filter dead/unreachable/off-screen enemies first. A valid route must stay inside the visible legal polygon union. Current rooms have no navigation-blocking furniture or ally body-blocking; do not invent table obstacles or change collisions.

Regroup destination begins 0.8 world units behind the player's facing, constrained to the legal visible region; choose the nearest valid destination if that ideal point is unavailable. With no eligible combat target, enter settled following at distance >2 units and stop within 1 unit (hysteresis). These thresholds never override an eligible engagement. Use the existing partner profile's normal speed, and existing catch-up speed only for travel/visibility regrouping; do not increase either.

Movement facing follows resolved displacement when abs(dx)>0.001 world units per tick. Smaller dx or depth-only movement preserves the last horizontal facing. During an attack use horizontal target relation, retaining previous facing when equal. No turn-animation content is added.

## StuckEvidence and recovery

Increment `blockedTicks` only when normal movement is requested toward a valid destination, its path is genuinely obstructed after alternate legal movement attempts, and resolved progress is less than 0.02 world units across the observation window. Require 120 consecutive active simulation ticks of genuine blockage (two seconds at the existing 60-Hz simulation). Reset on progress, destination/target change, invalid destination, active attack/cooldown waiting, pause or knockout. Separation, camera movement and viewport clipping alone do not count as obstruction.

Recovery chooses the nearest unblocked point inside the same visible legal union that restores a valid path toward the intended destination. Candidate order: valid player-adjacent destination, then points at 0.5-unit intervals on the visible-region edges ordered by distance to the partner and x/depth tie-break. Never cross a locked doorway. If no safe candidate exists, remain safely stopped and retry normal routing; do not invent a location or complete the encounter. Apply recovery at most once per 120 ticks and reset evidence. Preserve health, meter, attack cooldown, enemies and progression; issue a diagnostic event only.

## ProgressionCue

Derived fields: `visible`, `areaId`, `nextAreaId`, `direction: left | right`, `label: GO`, and `accessibleLabel: Go left/right to the next room`.

Visible iff encounter.status is cleared, a next route exists, run.result is null, and session has an active run rather than selection/results. Derive direction from next-room entry relative to the current room. Current content always points right; test a synthetic left route without adding a shipped level. No timer or persisted cue field. Next-room entry, reset and terminal result remove it automatically.

Placement uses viewport safe rect minus measured HUD/action/joystick rectangles with 8 CSS px clearance. Preferred location is exit side at 40% viewport height and 16 CSS px safe inset. Fit a 96×48 CSS px cue; if it collides, scan that side's free vertical interval below HUD and above controls, then use a free band below HUD. Never take pointer input. Keep text at least 18 CSS px; required supported-phone layouts must have a valid nonoverlapping placement and tests must fail rather than accepting occlusion.
