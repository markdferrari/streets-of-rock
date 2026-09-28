# Feature Specification: Combat View and AI Partner Improvements

**Feature Branch**: `006-combat-view-partner`

**Created**: 2026-09-27

**Status**: Draft — validated specification; implementation and acceptance evidence pending

**Input**: The agreed Combat View and AI Partner Improvements PRD: aggressive independent companion combat within the visible arena; natural regrouping and correct movement/attack facing; nearly full-screen presentation of the existing room with overlaid controls; directional “GO” when the next room unlocks. Enlarge the view only. Better graphics are deferred.

## Product Alignment *(mandatory)*

- **PRD references**: PRD FR-010–011, FR-019–029, FR-032–033, FR-037, FR-039–040, FR-046, new FR-048–050; NFR-001–009; AC-008, AC-014–021, AC-038–039, new AC-047–052; SC-004–006 and new SC-009. The supplied PRD's AI-001–009, VIEW-001–006, and GO-001–006 are mapped to feature requirements below.
- **Included behavior**: Aggressive partner engagement bounded by the visible walkable arena, natural follow/recovery and directional facing; expanded room presentation behind existing controls/HUD; directional progression cue for non-final cleared rooms. Rules apply to either selected AI partner.
- **Deferred behavior**: New models, textures, lighting, effects, increased room dimensions, changed encounter composition, new abilities or aggression settings, player-issued partner commands, new levels/enemies, and changes to homepage selection.
- **Provisional tuning**: Framing scale, following margins, stuck-detection interval, directional deadzone, and indicator size/placement may be tuned in planning/playtests. Freedom to fight, staying visible, no distance-only repositioning, preserved world dimensions, and correct progression timing are obligations.
- **Relationship to earlier features**: Feature 005 provides selectable roles. This specification supersedes its preservation of the old follow/recovery behavior and earlier fixed-distance tether assumptions; its role selection, combat abilities, knockout rules and remaining requirements still apply. The root PRD is revised to 2.3. Constitution 1.1.0 remains applicable without amendment because this improves existing companion, camera and progression behavior within the agreed scope.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fight alongside an independent partner (Priority: P1)

As a player, I want my partner to seek enemies and contribute to combat without being dragged away whenever I move.

**Why this priority**: Repeated pulling and idle following currently undermine the companion's usefulness and readable movement.

**Independent Test**: In an existing encounter, vary player separation while reachable enemies remain visible. Repeat with either character as the partner, then exercise room transition and genuine obstruction recovery.

**Acceptance Scenarios**:

1. **Given** a living partner able to act and reachable visible enemies, **When** the fighter moves farther away but both remain inside the visible arena, **Then** the partner continues approaching/attacking rather than switching to follow solely because of separation.
2. **Given** an attack already underway, **When** the fighter moves, **Then** the partner finishes the attack if staying inside the visible walkable arena permits it; damage, knockout, or loss of valid target may still interrupt under existing combat rules.
3. **Given** the player begins moving into the next room, **When** following becomes necessary to remain visible, **Then** the partner regroups through normal movement, stays visible, and resumes engagement with reachable visible enemies when appropriate.
4. **Given** a partner moving left or right during pursuit/regrouping, **When** its horizontal direction changes, **Then** it faces its direction of travel rather than sliding backwards. Depth-only movement preserves facing; attacks face the target.
5. **Given** a target outside the visible walkable arena, **When** targets are evaluated, **Then** the partner does not chase it off-screen and selects another eligible target or regroups normally.
6. **Given** genuine obstruction prevents progress toward a valid destination despite normal movement attempts, **When** stuck recovery occurs, **Then** the partner recovers to a visible walkable position without causing damage, reviving, blocking the fighter, or advancing the encounter. Ordinary separation, attacking in place, cooldown, pause, and knockout do not qualify as stuck.
7. **Given** a knocked-out partner, **When** the fighter moves or clears a room, **Then** the partner remains inactive and the fighter can progress and win alone under existing rules.

### User Story 2 - See a larger presentation of the existing room (Priority: P1)

As a player, I want the room and combat to make fuller use of the screen while retaining familiar controls.

**Why this priority**: A small-looking room wastes display space and makes action harder to see.

**Independent Test**: Compare the same room and character positions before/after on each supported reference phone in landscape; inspect framing, control overlays, safe areas, and unchanged traversal boundaries.

**Acceptance Scenarios**:

1. **Given** active landscape gameplay, **When** viewing an existing room, **Then** the room's displayed combat surface uses substantially more of the screen with less unused surrounding space; merely keeping a full-size canvas does not satisfy the change.
2. **Given** the expanded view, **When** movement and action controls are used together, **Then** both inputs work, the room renders behind the overlays, and controls/HUD remain inside safe areas without fixed panels shrinking the view.
3. **Given** the same level before and after the revision, **When** moving to room boundaries or fighting its waves, **Then** walkable dimensions, room connections, actor movement speeds, encounter composition and combat abilities remain unchanged.
4. **Given** browser chrome resizing or a supported landscape viewport change, **When** layout updates, **Then** controls, HUD, player, active partner and essential warnings remain readable and the central combat space is not covered by fixed controls or large HUD panels.
5. **Given** portrait orientation or background/focus interruption, **When** the player returns to supported landscape play, **Then** existing pause, cleared-input and explicit Resume behavior applies; no partner movement or active timing occurs during the pause.

### User Story 3 - Know where to go after clearing a room (Priority: P2)

As a player, I want an obvious direction cue when I can move to the next room.

**Why this priority**: Players should not need to guess whether combat is finished or where progression leads.

**Independent Test**: Clear each non-final room, observe the arrow through travel into the next room, retry/reset, then defeat the final boss.

**Acceptance Scenarios**:

1. **Given** enemies or required waves remain, **When** viewing the room, **Then** no next-room “GO” arrow appears.
2. **Given** the final wave is cleared and progression unlocks, **When** the room is ready to leave, **Then** a prominent directional arrow and “GO” appear toward the actual next-room route.
3. **Given** the arrow is visible, **When** travelling toward the next room or pausing/resuming, **Then** it remains available until entry into that room, stays within safe areas, and does not obstruct controls or HUD.
4. **Given** entry into the next room or a fresh run/retry, **When** progression state changes, **Then** the prior arrow is removed and does not reappear until that room's own progression condition is met.
5. **Given** final-boss victory, **When** the result screen appears, **Then** no next-room arrow is shown. Defeat and other result screens also suppress the cue.
6. **Given** sound muted, colour-independent viewing or reduced motion, **When** progression unlocks, **Then** arrow shape and “GO” still convey direction; decorative motion is unnecessary.

### Edge Cases

- Eligible area means the intersection of current visible gameplay space and existing walkable boundaries, including unlocked travel space between rooms. UI overlays do not create new world obstacles. Keep the active partner's recognizable body within view, rather than only its position marker.
- When camera movement would put pursuit outside view, visibility takes priority over attack completion. Stop or redirect through normal movement; distance alone never authorizes a snap. Camera/layout behavior must support keeping both active allies visible without enlarging world geometry.
- If an enemy is visible but not reachable inside valid bounds, select another eligible target. With no eligible enemies, regroup or idle without oscillating between pursuit and follow.
- Small changes in horizontal position must not cause rapid facing flicker; depth-only movement preserves the last valid horizontal facing. Hit reactions follow existing rules rather than being mistaken for normal backwards running.
- A viewport change during interruption must settle valid framing before explicit Resume. It must not cause an attack, recovery teleport or elapsed-time jump during pause.
- The final enemy of an intermediate wave must not trigger GO while further waves remain. A partner knockout or intact breakable never prevents normal room clearance.
- Arrow and room state must reset together on retry/homepage; no stale cue should survive a defeat or appear over a new combat encounter.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: An active partner MUST default to seeking and attacking reachable visible enemies; separation alone MUST NOT interrupt valid pursuit or an underway attack while both allies remain within the visible arena. Existing threat priorities among eligible targets remain applicable. (Input AI-001–003; PRD FR-020–021, FR-048)
- **FR-002**: Partner movement, target pursuit and regrouping MUST remain in visible walkable space. Following MUST take priority only when needed to retain visibility or accompany progression; finish underway attacks when those bounds and existing combat rules permit. (AI-004, AI-009; PRD FR-020–021, FR-026, FR-048)
- **FR-003**: Routine regrouping MUST use normal movement. Repositioning MUST require genuine failed movement due to obstruction, never ordinary separation, and MUST restore a valid visible position without damage, revival or progression side effects. (AI-005–006; PRD FR-019, FR-024)
- **FR-004**: Normal horizontal partner movement MUST face the direction of travel; depth-only movement MUST preserve facing; attacks MUST face the target. Prevent visible backwards running and facing flicker during normal pursuit/follow. (AI-007–009; PRD FR-048)
- **FR-005**: Partner behavior MUST apply to either selected identity while retaining existing damage, attack cadence, abilities, vulnerability, knockout, no-player-healing/no-separate-Special restrictions and solo completion rules. Aggression changes willingness to engage, not attack strength. (AI-009; PRD FR-019, FR-022–025, FR-046)
- **FR-006**: Gameplay MUST present the existing room nearly full-screen, with enlarged visible combat-surface presentation and reduced unused surroundings relative to the baseline. Render behind HUD/controls; increasing only a containing canvas is insufficient. (VIEW-001–002; PRD FR-026, FR-049)
- **FR-007**: The view change MUST preserve world dimensions, walkable boundaries, connections, fixed camera angle, enemy/wave composition, movement speeds and combat abilities. Retain camera tracking/encounter locking while changing framing/layout as needed. (VIEW-005; PRD FR-026, FR-049)
- **FR-008**: Overlaid controls and HUD MUST preserve existing arrangement, simultaneous movement/action, input cancellation, legibility, safe areas and central combat visibility across supported viewport changes. (VIEW-003–004, VIEW-006; PRD FR-010, FR-037, FR-039–040; NFR-003)
- **FR-009**: Every cleared non-final room MUST show a directional arrow with “GO” when progression unlocks, pointing toward its next-room route; it MUST remain available through travel until next-room entry. (GO-001–002; PRD FR-027, FR-050)
- **FR-010**: GO MUST be absent while enemies/required waves remain, after next-room entry until its own clearance, on reset, and on terminal screens including final-boss victory. (GO-004–005; PRD FR-027–028, FR-050)
- **FR-011**: The arrow MUST stay visible inside safe areas, avoid essential controls/HUD, require no interaction, and communicate direction through shape and text without colour or sound alone. Reduced motion MUST remove decorative animation without hiding the cue. (GO-003, GO-006; PRD FR-037, FR-050; NFR-003)
- **FR-012**: These changes MUST preserve pause/resume and active-time rules, existing offline/error/update behavior, and playability when storage/audio are unavailable. Use existing art; no graphics overhaul or new combat content is required. (VIEW-006; PRD FR-032–033, FR-037; NFR-001–009)

### Mobile Quality and Validation *(mandatory)*

Define the following procedures before implementation. Automatable rules require failing regression tests before correction. This specification's documentation receives consistency review; the table does not assert completed runtime evidence.

| Area and PRD mapping | Automated outcomes | Manual acceptance procedure |
| --- | --- | --- |
| Partner freedom, facing, visibility and recovery: FR-019–025, FR-048 | Both identities: separation during approach/attack, bounds/target eligibility, normal regrouping, facing, genuine stuck detection, no recovery during idle/attack/cooldown/pause/knockout, no recovery side effects. | On both phones, move the fighter across the room while partner fights; observe useful aggression, no distance-induced dragging or backwards running. Move to each next room and inspect visibility throughout travel. |
| View, touch, safe areas and telegraphs: FR-010, FR-026, FR-039–040, FR-049; NFR-001–003 | Preserve level geometry/composition and multi-touch/cancel behavior; compare matched framing and overlay bounds at reference landscape sizes. | Capture matched room/actor positions before/after. Verify larger room presentation, no reserved control bands, readable warnings and central action, reachable controls and full safe-area handling under browser resizing. |
| GO timing and accessibility: FR-027–028, FR-037, FR-050 | Intermediate versus final wave, next-room entry, retry, final victory/defeat, pause/resume, reduced motion and noninteractive cue. | Clear every room with sound/shake off; verify correct direction, persistence and placement. Repeat with reduced motion; arrow/text must remain understandable. |
| Interruption and timing: FR-040; NFR-003–004 | Suspend partner, combat and timers on interruption; clear inputs, preserve cue state and require Resume. | Hide/focus-switch/rotate during pursuit, attack and room travel. Restore landscape and explicitly resume; no unearned movement, attack or run time. |
| Audio/loading/storage/offline/update: FR-035–037; NFR-005–009 | Regression checks for existing entry/failure/pause/update behavior and inclusion of any cue assets in cached build. | After successful caching, replay full level/results/retry offline on both phones, including installed mode where supported. Confirm unavailable audio/storage do not block play and updates wait between runs. No new persistence/audio policy is introduced. |
| Performance and five-player evaluation: NFR-002; SC-004–006, SC-009 | Preserve existing automated performance/build gates; record actual device evidence separately. | Complete runs on iPhone 12 and Pixel 6 with each selected partner; target 60 fps and require at least 30 fps in busiest encounter. Record OS/browser, frame timing and stalls with full assets/audio. Test five first-time players' next-room direction recognition without coaching and retain existing combat-readability evaluation. |

### Key Entities *(include if feature involves data)*

- **Partner intent**: Engage, regroup, idle or recover; current valid target/destination, movement direction, action and activity state.
- **Visible walkable arena**: The currently visible portion of allowed room/travel space; constrains partner pursuit and regrouping independently of distance to the fighter.
- **Combat presentation**: Displayed room framing, safe-area bounds, overlays and essential warning visibility; distinct from unchanged world geometry.
- **Progression cue**: Current room clearance/unlock status, next-room route/direction and whether GO should be shown; follows encounter state rather than creating progression.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All partner scenarios pass for both role assignments, with zero separation-only approach/attack cancellations, zero routine repositioning events, and zero pursuit outside visible walkable bounds in the prescribed encounter and travel tests.
- **SC-002**: All normal left/right pursuit and regrouping cases face travel correctly, all attack cases face the target, and depth-only cases retain facing; reviewed phone sessions show no backwards running attributable to follow behavior.
- **SC-003**: On each reference phone, matched before/after room captures show increased displayed combat-surface coverage and reduced unused surroundings. The gameplay view spans at least 90% of available landscape width and height, renders behind controls, and all essential controls/HUD remain inside safe areas; world boundaries and traversal speeds match the baseline.
- **SC-004**: Every non-final room shows the correctly directed GO cue after final-wave clearance and removes it on next-room entry; zero cues appear during unfinished combat or final victory/defeat in acceptance runs.
- **SC-005**: At least four of five first-time testers indicate the correct next-room direction within three seconds of GO appearing, without coaching. Record response time/direction for each participant. (PRD SC-009)
- **SC-006**: Both reference phones retain the existing performance gate during complete runs with either partner, alongside passing simultaneous-input, interruption and cached-offline regression checks. Existing PRD combat-readability and full-MVP gates remain required.

## Assumptions

- This feature follows feature 005's role model for final both-character acceptance. Existing Cow-player/Crow-partner gameplay can support early behavior checks; it does not satisfy both-assignment acceptance by itself.
- “Larger view” means the same room is presented larger with less surrounding empty space, not larger geometry or additional enemies. The currently full-screen canvas alone is not proof that this outcome is met. Capture the same room/actor positions and viewport before implementation for comparison.
- Available landscape screen excludes browser chrome; safe-area overlays remain constrained while background art may extend behind insets. Exact framing/margins are planning/playtest decisions, constrained by visible allies, readable warnings and unchanged angle/world dimensions.
- Aggressive remains supportive: no new damage, cooldown, AI-only attacks, commands or selectable aggression modes. Existing threat-priority ordering applies only among eligible visible reachable enemies.
- Visibility has priority over finishing an attack when bounds conflict. Ordinary camera travel must be supported by natural regrouping, not interpreted as stuck recovery. A knocked-out partner retains existing inactive behavior and is not forced to follow.
- Arrow plus GO is an interface cue, not a graphics upgrade. Existing art and styling are sufficient. No deployment, new asset production pipeline, accounts or remote telemetry is required by this scope.
- Baseline platform requirements remain applicable. Any incomplete prerequisite from earlier features must be recorded during planning; this specification does not claim those systems are already implemented or waive final regression evidence.
