# Feature Specification: Illustrated Bar and Nightclub Backdrops

**Feature Branch**: `008-nightclub-backdrops`

**Created**: 2026-09-28

**Status**: Draft — specification validated; art, implementation and acceptance pending

**Input**: Approved four-room backdrop PRD: retain the existing nightclub setting, use illustrated cartoon scenery, start outside and continue through a bar, dance floor and stage/VIP area without gameplay changes.

## Product Alignment *(mandatory)*

- **PRD references**: PRD 2.5 FR-026–028, FR-031–033, FR-037, FR-049–050, new FR-056–060; NFR-001–009; AC-058–062; SC-004–006, SC-009 and new SC-011.
- **Included behavior**: Four distinct illustrated cartoon environments within the existing Bondi Beach neon rock venue, reviewed concepts and final in-game scenery, readable combat and exits, complete offline availability and existing mobile quality gates.
- **Deferred behavior**: Character graphics upgrades, new rooms/enemies/encounters, changed arena dimensions/collision/camera angle, new interactive or destructible furniture, lighting hazards, and a general graphics overhaul.
- **Provisional tuning**: Palette, decorative density, contrast and optional subtle ambient motion may change through review. Room order, recognizable setting cues, gameplay preservation and no flashing/strobing are fixed requirements.
- **Baseline revision**: This feature supersedes earlier room appearance/name descriptions only: room 1 outside entrance, room 2 bar, room 3 dance floor, room 4 stage/VIP. Existing encounters, two interactive tables in room 2, progression and boss rules remain. The illustrated look concerns scenery; existing character presentation and combat-view requirements remain applicable.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enter a recognizable nightclub (Priority: P1)

As a player, I start outside a recognizable club and enter its bar, understanding where I am and where to go.

**Why this priority**: Establishes the venue and the exterior-to-interior journey.

**Independent Test**: Play rooms 1 and 2 with existing characters; identify the exterior/bar from scenery and follow the unlocked route without changing encounters or movement boundaries.

**Acceptance Scenarios**:

1. **Given** a new run, **When** room 1 appears, **Then** pavement, club frontage, prominent club sign, neon doorway, queue barriers and event posters establish an outside entrance, with light spilling from the doorway.
2. **Given** room 1's final wave is cleared, **When** the existing exit unlocks, **Then** its arrow/GO and visible entrance agree with the actual next-room direction; decoration does not imply another usable route.
3. **Given** entry to room 2, **When** the player views the arena, **Then** a long counter, colourful bottle shelves, stools, booths and warm lighting with neon accents identify a bar belonging to the same venue.
4. **Given** the two existing interactive tables in room 2, **When** fighting or collecting their drops, **Then** their location and rules remain unchanged and they can be distinguished from decorative furniture.

### User Story 2 - Fight through the dance floor to the final stage (Priority: P1)

As a player, I progress deeper into the club through distinct interiors that build toward the final fight.

**Why this priority**: Completes the agreed four-room visual journey.

**Independent Test**: Review and play rooms 3 and 4 directly with their existing encounters; identify each setting and verify room-clearance, boss and results behavior.

**Acceptance Scenarios**:

1. **Given** room 3, **When** combat starts, **Then** a dance floor, DJ booth, large speakers, overhead fixtures and coloured light pools identify its purpose without a location label.
2. **Given** room 4, **When** the final fight begins, **Then** curtains, a stage backdrop, VIP seating, club branding and dramatic lighting frame the existing boss encounter.
3. **Given** decorative stage elevation or seating, **When** the player navigates, **Then** it remains outside the playable floor and does not suggest a usable platform or route.
4. **Given** clearance or final victory, **When** progression resolves, **Then** existing wave/exit rules apply, with no next-room cue after final victory and no stale room backdrop on retry.

### User Story 3 - Read combat and controls against richer scenery (Priority: P1)

As a player, I can see characters, threats and exits clearly while enjoying more detailed surroundings.

**Why this priority**: Visual improvement must preserve usable combat on phones.

**Independent Test**: Inspect all four rooms during busy encounters and transitions on both reference phones, including supported landscape sizes, muted/no-shake and reduced-motion settings.

**Acceptance Scenarios**:

1. **Given** any room in active combat, **When** actors overlap detailed scenery, **Then** their silhouettes, attack warnings, pickups and interactive objects remain distinguishable; decorative objects never cover essential combat information.
2. **Given** the large arena and overlaid HUD/controls, **When** the viewport resizes or transitions between rooms, **Then** scenery has no exposed gaps, keeps essential setting/exit cues visible and does not reduce the existing fighting view or obstruct controls.
3. **Given** audio muted and shake disabled, **When** fighting or following GO, **Then** all essential cues remain understandable through visible shape/text/poses, not colour alone.
4. **Given** reduced motion or pause, **When** optional decorative animation exists, **Then** reduced motion removes nonessential movement and pause freezes it; no setting uses flashing or strobing.

### User Story 4 - Replay the complete illustrated level reliably (Priority: P1)

As a player, I can load and replay the whole level offline without scenery failures or degraded mobile play.

**Why this priority**: Backdrops must be part of the complete playable experience.

**Independent Test**: Cache a complete build, relaunch offline, finish all four rooms and retry on both reference phones; separately exercise loading failure and interrupted play.

**Acceptance Scenarios**:

1. **Given** successful complete caching, **When** relaunching offline, **Then** all four backdrops, characters, required audio, results and retry work without network access, including installed mode where supported.
2. **Given** missing required scenery or failed caching, **When** loading is attempted, **Then** required-load failure offers actionable retry and unsuccessful caching never claims offline readiness.
3. **Given** hidden-page, focus loss or portrait rotation, **When** returning, **Then** existing pause/input-clear/explicit-resume behavior holds without incorrect scenery, repeated effects or elapsed gameplay time during interruption.
4. **Given** complete runs on both reference phones, **When** the busiest encounters and transitions occur, **Then** existing performance requirements remain satisfied; updates do not replace scenery during an active or paused run.

### Edge Cases

- Wide/narrow supported landscape views and camera travel must not reveal scenery edges, crop all identifying features or place false exits beside the real route.
- Large fighters, groups, boss warnings and Special effects must remain readable against bright bottle shelves, neon signs and light pools.
- Decorative bottles, tables and seating must not be mistaken for pickups, breakable objects or traversable platforms; existing interactive tables retain their room-2 behavior.
- Room clearance cannot depend on decoration. Unfinished waves suppress GO; the final room never advertises another room after victory.
- Retry restores the exterior backdrop with the reset run; interrupted transitions cannot show the wrong room or leave the player facing an invisible boundary.
- Optional ambient animation cannot obscure warnings, flash, advance during pause or be needed to recognize a location.
- Scenery asset failure must not strand the player in an unreadable fight. Cached old builds remain coherent while an update waits.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Present exactly four room identities in order: outside entrance, bar, dance floor, stage/VIP, retaining the existing Bondi Beach nightclub identity. (PRD FR-056)
- **FR-002**: Room 1 MUST show the entrance cues in US1.1 and align the visually prominent doorway with actual onward progression. (PRD FR-056, FR-050)
- **FR-003**: Room 2 MUST show the bar cues in US1.3 and preserve its two existing interactive tables, their locations and behavior. (PRD FR-056, FR-031)
- **FR-004**: Room 3 MUST show the dance-floor cues in US2.1; room 4 MUST show the stage/VIP cues in US2.2, with decorative elevations outside the playable space. (PRD FR-056)
- **FR-005**: Use a coherent illustrated cartoon treatment with bold outlines, exaggerated shapes, shared palette/branding and visible floor-to-background depth. Keep detail quieter behind active combat and richer outside it; each location must be recognizable without a room label. (PRD FR-057)
- **FR-006**: Preserve room geometry, collision boundaries, fixed camera angle, encounter composition, enemy/spawn rules, progression, interactive objects, character graphics and combat behavior. Decoration MUST NOT add obstacles, platforms, pickups, breakables or hazards. (PRD FR-058)
- **FR-007**: Preserve the enlarged fighting view and overlaid controls/HUD. Scenery MUST keep actors, warnings, pickups and interactive objects distinguishable during busy combat and must not cover essential cues. (PRD FR-049, FR-059)
- **FR-008**: Keep the existing arrow/GO visible and aligned with the actual route from clearance until next-room entry, respecting safe areas and existing suppression/reset/final-victory rules. (PRD FR-050, FR-059)
- **FR-009**: Fit scenery across supported landscape layouts and transitions without exposed gaps or losing essential location/exit cues; decorative furniture must be visibly outside movement paths. (PRD FR-059; NFR-003)
- **FR-010**: Use mostly static lighting, no flashing or strobing, and only optional subtle ambient animation; reduced motion removes nonessential animation, pause freezes it, and muted/no-shake play retains essential feedback. (PRD FR-037, FR-057, FR-059)
- **FR-011**: Include every required backdrop resource in complete offline availability; retain actionable loading errors, accurate caching readiness, coherent between-run updates and reset to the correct room on retry. (PRD FR-060; NFR-004–007)
- **FR-012**: Produce reviewable concepts for all four rooms before final asset production and record their visual review. Review final scenery inside gameplay with characters, effects and controls before acceptance; unresolved reviews remain pending. (PRD FR-060)
- **FR-013**: Retain mobile performance and complete-build asset budgets, validated during full runs with intended audio and the busiest encounters, not isolated scenery previews. (PRD FR-060; NFR-001–002)

### Mobile Quality and Validation *(mandatory)*

Automatable behavior follows test-first development. Define manual procedures before production and retain screenshots, device/build versions and review outcomes. Specification validation alone does not establish runtime acceptance.

| Area and PRD mapping | Automated regression outcomes | Manual procedure |
| --- | --- | --- |
| Rooms/progression: FR-026–028, FR-031, FR-050, FR-056–058 | Correct room order/reset, unchanged boundaries/encounters/table rules, exit timing and final-victory suppression. | Review all concepts, then all four rooms in gameplay; compare playable floor/route and interactive objects to baseline. |
| Controls/readability: FR-037, FR-049, FR-059; NFR-003 | Existing simultaneous input/cancellation, safe-area layouts and reduced-motion behavior remain valid. | On iPhone 12/Safari and Pixel 6/Chrome play busy encounters, room-edge positions and transitions; inspect silhouettes, warnings, pickups, controls and GO with sound/shake off. Check all roster silhouettes available in the integrated build. |
| Lifecycle: NFR-003–004 | Hidden/focus/orientation pause, cleared input, frozen active time/ambient movement, explicit resume and correct retry backdrop. | Interrupt combat and room transitions, rotate back to landscape, explicitly resume and confirm no visual discontinuity or incorrect room. |
| Loading/audio/storage/offline/update: FR-060; NFR-005–009 | Required-resource failure/retry, complete cache inclusion, accurate readiness and updates between runs. Existing nonblocking audio/storage failure retained. | Fully cache, close/relaunch offline and complete all rooms/audio/results/retry in browser and installed modes where supported; exercise missing assets, denied storage/audio and a pending update. Audio/storage design is unchanged; regression coverage remains required. |
| Performance: FR-060; NFR-001–002 | Enforce existing complete-build resource budgets selected during planning. | Record full-run frame timing and visible stalls on both reference phones with intended soundtrack and busy encounters; target 60 fps, require at least 30 fps. |
| Recognition/readability: SC-004, SC-009, SC-011 | No automated substitute for user recognition. | Five testers encounter all four settings without labels/coaching, identify each and rate combat readability separately; retain existing controls, completion and exit-direction evaluation gates. |

### Key Entities

- **Room backdrop**: Room identity, defining venue features, palette/branding, decorative regions and actual exit relationship.
- **Decorative element**: Visual-only furniture, signage or lighting; does not change interaction or walkable space.
- **Visual review record**: Concept and in-game views, decisions, device/build context, recognition/readability results and outstanding work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least four of five testers correctly identify all four intended settings without location labels or verbal coaching. (PRD SC-011)
- **SC-002**: All four rooms pass in-game review for the required defining features, coherent style, unchanged playable boundaries/encounters and distinguishable interactive objects. (PRD AC-058–060)
- **SC-003**: At least four of five testers rate combat readability at least 4/5; at least four indicate the correct next-room direction within three seconds of GO, retaining existing control/readability gates. (PRD SC-004, SC-009)
- **SC-004**: A complete cached offline run through all four rooms, results and retry succeeds on both reference phones, in browser and installed modes where supported. (PRD SC-005, AC-062)
- **SC-005**: Both reference phones target 60 fps and sustain at least 30 fps in their busiest encounter during complete runs with the full intended assets/audio; record frame timing and visible stalls. (PRD SC-006)
- **SC-006**: All supported-layout, muted/no-shake, reduced-motion, interruption, loading-error and reset acceptance scenarios pass, with zero flashing/strobing backdrops and no essential cue obscured in the defined device reviews. (PRD AC-061–062)

## Assumptions

- Existing venue branding is reused; this is not a rename of Bondi Beach or a new level.
- Room identities change by sequence, not encounter relocation. In particular, the two former VIP-room interactive tables remain in room 2, now visually the bar; Liam remains in room 4, now stage/VIP.
- Illustrated cartoon describes the scenery's appearance; technical rendering choices belong in planning and existing character graphics stay unchanged.
- Features 005/006 provide selection/platform, enlarged view, partner visibility and exit-cue foundations. Verify their actual implementation before integration; previous specifications do not imply completed code. Feature 007 character graphics are outside this feature, but integrated characters require readability checks.
- Ambient animation is optional; static backdrops can fully meet scope.
- Initial complete caching requires connectivity. Art review, both reference phones, intended soundtrack and five testers are acceptance dependencies; missing evidence remains pending.
