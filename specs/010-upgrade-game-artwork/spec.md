# Feature Specification: 3D Venue Scenery and Enemy Characters

**Feature Branch**: `010-upgrade-game-artwork`

**Created**: 2026-10-13

**Status**: Draft — specification validated; asset selection, production and acceptance pending

**Input**: “I want to have some better artwork. I would like to have 3d-rendered backdrops, and I want characters for the ai-controlled bad guys. If there's some free to use assets available that suit the theme then great, let's use them.” Owner clarification: actual 3D scenery rendered in the game.

## Product Alignment *(mandatory)*

- **PRD references**: [PRD 2.6](../../PRD.md), FR-001–004, FR-016–019, FR-026–033, FR-037, FR-049–050, FR-056–063; NFR-001–009; AC-058–065; SC-004–006, SC-009, SC-011–013.
- **Included behavior**: Four furnished 3D settings within the existing scruffy neon rock venue; animated, recognizable characters for Raver Grunt, Bartender Zoner, Club Enforcer and Liam the Head Bouncer; coherent art direction; reuse of suitable free assets; recorded asset provenance; mobile readability, offline availability and visual review.
- **Deferred behavior**: New enemy roles, encounter changes, additional levels, playable-roster redesign, new attacks, altered balance, interactive scenery beyond the two existing tables, free camera movement, photorealism, cinematic sequences, paid asset purchases and general-purpose art tooling.
- **Provisional tuning**: Exact clothing, hairstyles, decorative density, palette accents and light intensity can change after visual review. Four setting identities, four distinct enemy identities, real 3D scenery, readable combat and unchanged gameplay rules are obligations.
- **Scope revision**: This owner-requested feature replaces feature [008](../008-nightclub-backdrops/spec.md)'s illustrated-backdrop treatment and enemy-graphics exclusion, and feature [009](../009-godot-rewrite/spec.md)'s visual-parity restriction for scenery and enemies only. Feature 008's setting cues and quality gates remain. Feature 009's engine direction, functional parity and content budgets remain applicable. The four playable fighters and their AI-partner appearances remain the visual reference.
- **Governance**: Follow the [constitution](../../.specify/memory/constitution.md), including test-first implementation and manual visual procedures defined before production. This specification does not mark earlier implementation or acceptance work complete.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fight through a furnished 3D rock venue (Priority: P1)

As a player, I enter a scruffy neon club and progress through four recognizable spaces whose scenery has the same sense of volume as the fighters.

**Why this priority**: Establishes the requested visual improvement throughout the whole level.

**Independent Test**: Visit each room and its camera-travel limits with existing combat available; inspect the setting cues, depth, onward route and playable floor.

**Acceptance Scenarios**:

1. **Given** a new run, **When** the outside entrance appears, **Then** 3D frontage, pavement, queue barriers and a doorway establish the exterior, with a prominent club sign, posters and neon light; the doorway agrees with actual onward progression.
2. **Given** entry to the bar, **When** looking around the combat view, **Then** a long counter, bottle shelves, stools and booths establish a furnished 3D interior with warm light and neon accents; the two interactive tables remain distinguishable from decoration.
3. **Given** progression to the dance floor and stage/VIP, **When** each is shown, **Then** the dance floor has a DJ booth, large speakers, overhead fixtures and coloured light pools, and the final room has curtains, stage backdrop, VIP seating, branding and dramatic light. Major structures and props occupy 3D space; a flat room illustration alone does not satisfy the requirement.
4. **Given** any room, camera limit or transition, **When** moving through supported landscape views, **Then** no scenery gaps, exposed unfinished surfaces or false accessible routes appear; playable boundaries, camera angle, wave composition, exits and table rules retain their existing behavior.

### User Story 2 - Recognize and fight distinct enemy characters (Priority: P1)

As a player, I face club patrons and staff whose appearance and movement help me recognize the threats they pose.

**Why this priority**: Replaces anonymous enemy placeholders and makes the opponents part of the venue.

**Independent Test**: Encounter each common enemy and both Liam phases; compare their silhouettes and observe every supported combat state from normal gameplay distance.

**Acceptance Scenarios**:

1. **Given** a mixed wave, **When** viewing enemies at normal phone gameplay size, **Then** the Grunt reads as a rowdy clubgoer, the Zoner as a bartender, and the Enforcer as a heavy security threat. Body shape, clothing or equipment distinguishes each role without depending on colour or labels alone; they are distinguishable from the selected fighter and partner.
2. **Given** the final encounter, **When** Liam appears beside or after common enemies, **Then** his larger bouncer silhouette and distinctive outfit identify him as the boss rather than a recoloured Enforcer.
3. **Given** any enemy, **When** it idles, moves, faces left/right, warns, attacks, recovers, takes a hit, is stunned where allowed or is defeated, **Then** its pose or animation communicates the current state without missing parts, visible default rest poses, sliding through an unrelated action or a lingering active stance after defeat. Boss immunity to stun remains intact.
4. **Given** melee, projectile, charge, rope-swing or shockwave attacks, **When** warnings and strikes play, **Then** visible facing, release, contact and recovery agree with existing attack timing and reach; both boss phases remain avoidable with existing actions. New artwork does not change damage, collisions, targeting, AI decisions or attack windows.
5. **Given** simultaneous enemies, defeat, pause or retry, **When** their presentation changes, **Then** animation states remain independent, pause freezes active animation and retry restores the correct living enemies without stale effects or bodies.

### User Story 3 - Enjoy richer art while retaining clear mobile combat (Priority: P1)

As a mobile player, I can see threats and use controls comfortably throughout a complete run with the new art.

**Why this priority**: The artwork succeeds only if the game remains readable and responsive.

**Independent Test**: Play busy encounters and a complete cached offline run on both reference phones with all four fighter silhouettes represented; include interruptions, failed loads and retry.

**Acceptance Scenarios**:

1. **Given** crowded combat in any room, **When** playing with sound muted and shake disabled, **Then** fighters, enemies, warnings, projectiles, pickups, interactive tables and GO remain distinguishable; scenery and effects do not hide essential cues or controls. The enlarged combat view and safe areas remain usable.
2. **Given** reduced motion or pause, **When** decorative motion is present, **Then** nonessential motion is removed for reduced motion and freezes on pause. No room uses flashing or strobing. Backgrounding, focus loss and portrait rotation clear inputs and require explicit resume without advancing active gameplay time.
3. **Given** complete caching, **When** reopening offline, **Then** all room and enemy artwork, selected duo, audio, results and full-level retry work in browser and installed modes where supported. Missing required art blocks entry with actionable retry; cache-only failure allows already-loaded online play without claiming offline readiness.
4. **Given** an available update, **When** a duo is preparing, counting down, running or paused, **Then** its scenery and character assets remain from one coherent release until a safe between-run update.
5. **Given** a complete release with intended soundtrack, **When** playing all rooms and the busiest encounters, **Then** both reference phones meet the existing 60 fps target and 30 fps minimum. Complete game content remains within 30 MiB and each content file within 16 MiB; engine overhead is accounted for separately as authorized in feature 009.

### User Story 4 - Reuse suitable free artwork with traceable origins (Priority: P2)

As the game owner, I can reuse suitable free artwork and know where shipped assets came from and which use conditions apply.

**Why this priority**: Reduces art production work while making the delivered game maintainable and distributable. P2 indicates ordering, not optional acceptance.

**Independent Test**: Review the candidate assessment and final asset records alongside room/enemy concepts and in-game views.

**Acceptance Scenarios**:

1. **Given** available free asset candidates, **When** selecting art, **Then** candidates are assessed for theme, consistency with the heroes, animation coverage, mobile suitability and permission for modification and distribution in the game; suitable candidates are reused, with adaptations recorded. Rejected candidates have specific reasons and unmet needs have a documented original-art fallback.
2. **Given** any third-party asset proposed for shipping, **When** reviewing its record, **Then** its creator, source page, asset/version identification, acquisition date, license evidence, modifications and required credits are recorded. Missing or incompatible permission prevents inclusion; any required attribution accompanies the distributed game and is available offline.
3. **Given** four room concepts and four enemy concepts, **When** reviewing before final production, **Then** the owner can assess their shared style and role/setting identities. Final in-game review covers all eight subjects, supported enemy actions and phone combat readability; outstanding review or device evidence remains pending.

### Edge Cases

- Bright neon, dark clothing and large fighters cannot conceal enemy wind-ups or silhouettes; test overlaps and room edges as well as clear centre-floor shots.
- Common enemies may share a base model but cannot rely on colour swaps alone to establish different roles; duplicates must not share animation state accidentally.
- Decorative bottles, furniture and stages cannot imply extra pickups, breakables, platforms or exits. The two existing bar tables retain their rules.
- Oversized limbs, clothing or props cannot suggest attack reach inconsistent with actual hits; released projectiles remain visible and behave correctly if their thrower is stunned or defeated.
- Interrupted attacks, stun expiry, boss phase changes, room travel and repeated retry cannot leave stale animations, missing enemies or the wrong room visible.
- An attractive free model with missing combat animations is only a candidate until the missing presentation is supplied and reviewed.
- A free download with unclear reuse terms, a paid-only dependency or incompatible credits is not a shipping-ready asset. Do not depend on a supplier's website during play.
- Missing/corrupt art and interrupted caching require truthful readiness and retry; partial artwork must not produce an invisible opponent in active play.

## Requirements *(mandatory)*

### Functional Requirements

Feature-local identifiers map to PRD identifiers below; they do not replace them.

| ID | Requirement | Acceptance mapping |
| --- | --- | --- |
| FR-001 | Render the four existing settings as actual 3D scenery with the defining venue features and correct order. | US1.1–3; PRD FR-056–057 |
| FR-002 | Present a coherent stylized neon rock-club appearance with visible depth, grounded characters and quieter detail behind combat. | US1.1–4, US3.1, US4.3; PRD FR-032–033, FR-057, FR-059 |
| FR-003 | Preserve playable layout, fixed camera angle, encounters, object rules, progression and existing playable/partner character identities. | US1.4, US2.4; PRD FR-026–031, FR-049–050, FR-058 |
| FR-004 | Provide distinct complete 3D character designs for all three common enemy roles and Liam, distinguishable by more than colour. | US2.1–2; PRD FR-032, FR-061 |
| FR-005 | Communicate every enemy's supported idle, movement, facing, warning, attack, recovery, hit, stun and defeat state through coherent poses or animation; reflect both Liam phases. | US2.3–4; PRD FR-029–030, FR-061 |
| FR-006 | Align visible attacks with existing timing, direction and reach without altering enemy behavior or balance; keep each instance's presentation independent and resettable. | US2.4–5; PRD FR-016–019, FR-029–030, FR-058, FR-061 |
| FR-007 | Preserve readable combat, interactive-object distinction, GO direction/timing, safe controls and complete scenery coverage across supported views. | US1.4, US3.1; PRD FR-037, FR-049–050, FR-059 |
| FR-008 | Respect muted/no-shake play, reduced motion, pause and explicit-resume behavior; prohibit flashing/strobing scenery. | US2.5, US3.1–2; PRD FR-037, FR-057, FR-059; NFR-003–004 |
| FR-009 | Include all required art and applicable credits in complete offline availability, with truthful readiness, required-load retry, correct reset and coherent between-run updates. | US3.3–4, US4.2; PRD FR-060, FR-062; NFR-005–009 |
| FR-010 | Meet inherited reference-device performance and complete-content size limits, reporting engine overhead separately. | US3.5; PRD FR-060; NFR-001–002; feature 009 download allowance |
| FR-011 | Evaluate free assets first and reuse those meeting theme, readability, animation, distribution and mobile constraints; document rejection reasons and original-art fallbacks where no candidate fits. | US4.1; PRD FR-062 |
| FR-012 | Retain source and license evidence for every shipped third-party asset and adaptation; fulfill required credits and exclude assets with unclear or incompatible permissions. | US4.2; PRD FR-062 |
| FR-013 | Record concepts for four rooms and four enemy identities before final production, then review final gameplay appearance and animation; report incomplete evidence accurately. | US4.3; PRD FR-060, FR-063 |

### Mobile Quality and Validation *(mandatory)*

Define manual procedures before production. Implement automatable behavior through red–green–refactor; art review is additional evidence. Record the build, device, OS/browser versions, observations and outstanding issues. Documentation validation does not establish gameplay acceptance.

| Area and PRD mapping | Automated regression outcomes | Manual acceptance procedure |
| --- | --- | --- |
| Gameplay preservation: FR-002–004, FR-016–019, FR-026–031, FR-058, FR-061 | Unchanged combat outcomes, wave/exit rules, table drops, enemy roles, stun/boss semantics, reset and independent animation state selection. | Observe every enemy action and both boss phases at phone gameplay scale; compare visible warnings, contact/release and recovery to actual outcomes. |
| Touch/view/accessibility: FR-037, FR-049–050, FR-059; NFR-003 | Existing simultaneous input/cancellation, supported layout, GO timing and reduced-motion behavior pass. | On iPhone 12/Safari and Pixel 6/Chrome, inspect each room's edges, transitions and busy combat with all four heroes, muted/no-shake and reduced motion; verify clear controls, silhouettes, threats and interactables. |
| Lifecycle: FR-005, FR-044, FR-047; NFR-003–004 | Pause freezes active timing/animations, clears input and requires explicit resume; retry clears presentation state. | Interrupt countdown, each enemy attack type and room travel by background/focus/portrait changes; resume and retry without stale poses or scenery. |
| Loading, audio, storage, offline and updates: FR-060, FR-062; NFR-005–009 | Complete resource inclusion, missing/corrupt art failure and repair, truthful cache status and coherent releases. Existing audio/storage failure behavior remains covered. | Cache, close, disconnect and complete/retry all rooms in browser/installed modes on both phones; verify credits where required. Exercise failed art loads, denied audio/storage and updates during locked-duo states. Audio/storage features are unchanged but must still work with the larger asset set. |
| Performance: FR-060; NFR-001–002 | Enforce 30 MiB total game content and 16 MiB per content file; report engine overhead separately. | Record complete-run frame timing, visible stalls, compressed download and cached sizes with intended audio; target 60 fps and require at least 30 fps in busiest encounters on both phones. |
| Visual quality and provenance: FR-061–063; SC-004, SC-009, SC-011–013 | Check required room/enemy coverage and asset-record completeness; automated results cannot establish visual quality or permission by themselves. | Review eight concepts and final gameplay subjects, license evidence and credits; conduct the five-player recognition and matched before/after artwork evaluation below. |

Existing five-player learning, completion, responsiveness and fighting-style gates remain applicable. Physical phones, intended soundtrack, owner review and five participants are acceptance dependencies; absent evidence remains outstanding.

### Key Entities

- **Room presentation**: Existing room identity, defining landmarks, decorative furniture, lighting character, combat floor and onward route.
- **Enemy presentation**: Existing enemy role, silhouette, outfit, action states, attack cues and boss-phase appearance.
- **Asset provenance record**: Asset identity, creator, source, acquisition/version details, license evidence, adaptations, intended use and attribution obligations.
- **Visual acceptance record**: Concept or gameplay subject, review context, screenshots or action recordings, reviewer findings and unresolved work.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four settings pass concept and in-game review with actual 3D scenery and every required landmark; at least four of five testers correctly identify all four settings without location labels or coaching. (PRD AC-058–060, SC-011)
- **SC-002**: All three common enemy roles and Liam have complete reviewed character designs and presentation for every supported action/state. At least four of five testers distinguish all three common threat roles and the boss from normal gameplay views without enemy labels or colour-only cues, after encountering their behavior. (PRD AC-063, SC-012)
- **SC-003**: At least four of five testers prefer the new artwork in matched before/after gameplay views; at least four rate combat readability and responsiveness separately at least 4/5, and indicate the correct onward direction within three seconds of GO. (PRD SC-004, SC-009, SC-013)
- **SC-004**: Complete cached offline runs, results and retries succeed on both reference phones, including installed mode where supported, with all required art and applicable credits available; all defined loading/interruption/update scenarios pass. (PRD AC-062, AC-064)
- **SC-005**: Both reference phones meet the 60 fps target/30 fps minimum requirement during complete-run evaluation, with busiest-encounter evidence and game content within the inherited 30 MiB total/16 MiB per-file limits. (PRD NFR-002; feature 009)
- **SC-006**: Every shipped third-party asset has a complete provenance record and fulfilled license conditions; the selection record documents accepted/rejected free candidates and any original-art fallback. (PRD AC-064)
- **SC-007**: All defined gameplay-preservation and visual-state scenarios pass with no unexplained changes to enemy behavior, damage, collision, waves, exits or table interactions. Eight concept and eight final gameplay reviews are recorded; none of the required reviews is falsely marked complete. (PRD AC-060, AC-063, AC-065)

## Assumptions

- The owner confirmed actual 3D scenery rendered during play. Signs, posters and surface decoration may use flat artwork within those scenes; whole-room flat illustrations do not meet the request.
- “AI-controlled bad guys” covers the existing three normal enemy roles and the named boss, rather than the friendly AI partner or additional enemy mechanics. One distinct design per role is sufficient; extra cosmetic variants are optional.
- Stylized clubgoers, bar staff and bouncers fit the established venue and cartoon heroes. Exact designs are settled through concept review.
- “Free to use” means no asset purchase or recurring fee and documented permission to modify and distribute the assets in the game, including commercial distribution. Prefer CC0 where suitable; compatible attribution licenses are acceptable if their conditions are fulfilled.
- [Asset candidates](asset-candidates.md) records initial source-page research, not final selection, downloaded-asset verification or an assertion of complete animation coverage. Suitable free art should be adapted; original work can fill remaining gaps without introducing a paid dependency.
- Features 008 and 009 include unfinished acceptance work. Planning must inspect actual implementation and integrate this revision with the selected runtime; historical specifications or generated local builds are not proof of completion.
- Initial caching needs connectivity and offline play depends on retained browser data. Art rights evidence, owner visual review, reference phones, soundtrack and participants are required before declaring delivery accepted.

## Owner-approved gameplay extension — 2026-10-14

After approving the motion previews, the owner requested that Grunts turn with their movement, pursue up/down as well as left/right, and that enemy throws be easier to dodge. These instructions extend the behavior-preservation requirements in US2.4/FR-006 for those specific behaviors. Grunts now use normalized two-axis pursuit at their existing speed, and Zoners lock the target position at the start of the warning instead of tracking until release. Attack timing, damage, projectile speed and all other rules remain unchanged. The original replay baseline is retained alongside explicit feature 010 checkpoints for the affected scenarios.
