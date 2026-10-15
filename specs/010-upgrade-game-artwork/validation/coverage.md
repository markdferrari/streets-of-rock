# Feature 010 evidence register — T001

Source: `71f148a412bf39e1b50855ed7901736a3eb0990b`, branch `010-upgrade-game-artwork`, 2026-10-14.
This register establishes scope; it does not establish feature acceptance.

## Requirements and inherited obligations

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

## Inherited PRD preservation gates

| Obligation | Automated owner | Additional evidence |
| --- | --- | --- |
| Gameplay preservation: FR-002–004, FR-016–019, FR-026–031, FR-058, FR-061 | Unchanged combat outcomes, wave/exit rules, table drops, enemy roles, stun/boss semantics, reset and independent animation state selection. | Observe every enemy action and both boss phases at phone gameplay scale; compare visible warnings, contact/release and recovery to actual outcomes. |
| Touch/view/accessibility: FR-037, FR-049–050, FR-059; NFR-003 | Existing simultaneous input/cancellation, supported layout, GO timing and reduced-motion behavior pass. | On iPhone 12/Safari and Pixel 6/Chrome, inspect each room's edges, transitions and busy combat with all four heroes, muted/no-shake and reduced motion; verify clear controls, silhouettes, threats and interactables. |
| Lifecycle: FR-005, FR-044, FR-047; NFR-003–004 | Pause freezes active timing/animations, clears input and requires explicit resume; retry clears presentation state. | Interrupt countdown, each enemy attack type and room travel by background/focus/portrait changes; resume and retry without stale poses or scenery. |
| Loading, audio, storage, offline and updates: FR-060, FR-062; NFR-005–009 | Complete resource inclusion, missing/corrupt art failure and repair, truthful cache status and coherent releases. Existing audio/storage failure behavior remains covered. | Cache, close, disconnect and complete/retry all rooms in browser/installed modes on both phones; verify credits where required. Exercise failed art loads, denied audio/storage and updates during locked-duo states. Audio/storage features are unchanged but must still work with the larger asset set. |
| Performance: FR-060; NFR-001–002 | Enforce 30 MiB total game content and 16 MiB per content file; report engine overhead separately. | Record complete-run frame timing, visible stalls, compressed download and cached sizes with intended audio; target 60 fps and require at least 30 fps in busiest encounters on both phones. |
| Visual quality and provenance: FR-061–063; SC-004, SC-009, SC-011–013 | Check required room/enemy coverage and asset-record completeness; automated results cannot establish visual quality or permission by themselves. | Review eight concepts and final gameplay subjects, license evidence and credits; conduct the five-player recognition and matched before/after artwork evaluation below. |

| Local requirement | Task owners | Scenario / outcome coverage |
| --- | --- | --- |
| FR-001 | T008, T011, T016–T018, T020–T026 | US1.1–4; SC-001, SC-007 |
| FR-002 | T005–T006, T014–T015, T019–T026, T066–T067 | US1.1–4, US3.1, US4.3; SC-001, SC-003 |
| FR-003 | T003–T004, T007, T016–T018, T024–T026, T030, T039, T051 | US1.4, US2.4; SC-007 |
| FR-004 | T006, T027, T031–T035, T039–T040, T066 | US2.1–2; SC-002 |
| FR-005 | T009, T027–T030, T031–T040 | US2.3–4; SC-002 |
| FR-006 | T028–T030, T036–T040, T045, T051 | US2.4–5; SC-007 |
| FR-007 | T017, T024–T026, T038, T042, T047, T052, T066 | US1.4, US3.1; SC-003 |
| FR-008 | T028–T029, T036–T037, T042, T047, T052 | US2.5, US3.1–2; SC-004 |
| FR-009 | T041, T043–T044, T046, T048–T053, T055, T058–T060 | US3.3–4, US4.2; SC-004 |
| FR-010 | T015, T019, T044–T045, T048, T050–T053, T064–T068 | US3.5; SC-005 |
| FR-011 | T005, T019, T031–T035, T056, T062 | US4.1; SC-006 |
| FR-012 | T005, T008–T013, T035, T044, T054–T060, T062, T068 | US4.2; SC-006 |
| FR-013 | T002, T006, T026, T040, T054, T061–T062, T066–T069 | US4.3; SC-001–003, SC-007 |



## All 17 acceptance scenarios

| Scenario | Required outcome | Current evidence |
| --- | --- | --- |
| US1.1 | **Given** a new run, **When** the outside entrance appears, **Then** 3D frontage, pavement, queue barriers and a doorway establish the exterior, with a prominent club sign, posters and neon light; the doorway agrees with actual onward progression. | Pending new art; inherited regression only |
| US1.2 | **Given** entry to the bar, **When** looking around the combat view, **Then** a long counter, bottle shelves, stools and booths establish a furnished 3D interior with warm light and neon accents; the two interactive tables remain distinguishable from decoration. | Pending new art; inherited regression only |
| US1.3 | **Given** progression to the dance floor and stage/VIP, **When** each is shown, **Then** the dance floor has a DJ booth, large speakers, overhead fixtures and coloured light pools, and the final room has curtains, stage backdrop, VIP seating, branding and dramatic light. Major structures and props occupy 3D space; a flat room illustration alone does not satisfy the requirement. | Pending new art; inherited regression only |
| US1.4 | **Given** any room, camera limit or transition, **When** moving through supported landscape views, **Then** no scenery gaps, exposed unfinished surfaces or false accessible routes appear; playable boundaries, camera angle, wave composition, exits and table rules retain their existing behavior. | Pending new art; inherited regression only |
| US2.1 | **Given** a mixed wave, **When** viewing enemies at normal phone gameplay size, **Then** the Grunt reads as a rowdy clubgoer, the Zoner as a bartender, and the Enforcer as a heavy security threat. Body shape, clothing or equipment distinguishes each role without depending on colour or labels alone; they are distinguishable from the selected fighter and partner. | Pending new art; inherited regression only |
| US2.2 | **Given** the final encounter, **When** Liam appears beside or after common enemies, **Then** his larger bouncer silhouette and distinctive outfit identify him as the boss rather than a recoloured Enforcer. | Pending new art; inherited regression only |
| US2.3 | **Given** any enemy, **When** it idles, moves, faces left/right, warns, attacks, recovers, takes a hit, is stunned where allowed or is defeated, **Then** its pose or animation communicates the current state without missing parts, visible default rest poses, sliding through an unrelated action or a lingering active stance after defeat. Boss immunity to stun remains intact. | Pending new art; inherited regression only |
| US2.4 | **Given** melee, projectile, charge, rope-swing or shockwave attacks, **When** warnings and strikes play, **Then** visible facing, release, contact and recovery agree with existing attack timing and reach; both boss phases remain avoidable with existing actions. New artwork does not change damage, collisions, targeting, AI decisions or attack windows. | Pending new art; inherited regression only |
| US2.5 | **Given** simultaneous enemies, defeat, pause or retry, **When** their presentation changes, **Then** animation states remain independent, pause freezes active animation and retry restores the correct living enemies without stale effects or bodies. | Pending new art; inherited regression only |
| US3.1 | **Given** crowded combat in any room, **When** playing with sound muted and shake disabled, **Then** fighters, enemies, warnings, projectiles, pickups, interactive tables and GO remain distinguishable; scenery and effects do not hide essential cues or controls. The enlarged combat view and safe areas remain usable. | Pending new art; inherited regression only |
| US3.2 | **Given** reduced motion or pause, **When** decorative motion is present, **Then** nonessential motion is removed for reduced motion and freezes on pause. No room uses flashing or strobing. Backgrounding, focus loss and portrait rotation clear inputs and require explicit resume without advancing active gameplay time. | Pending new art; inherited regression only |
| US3.3 | **Given** complete caching, **When** reopening offline, **Then** all room and enemy artwork, selected duo, audio, results and full-level retry work in browser and installed modes where supported. Missing required art blocks entry with actionable retry; cache-only failure allows already-loaded online play without claiming offline readiness. | Pending new art; inherited regression only |
| US3.4 | **Given** an available update, **When** a duo is preparing, counting down, running or paused, **Then** its scenery and character assets remain from one coherent release until a safe between-run update. | Pending new art; inherited regression only |
| US3.5 | **Given** a complete release with intended soundtrack, **When** playing all rooms and the busiest encounters, **Then** both reference phones meet the existing 60 fps target and 30 fps minimum. Complete game content remains within 30 MiB and each content file within 16 MiB; engine overhead is accounted for separately as authorized in feature 009. | Pending new art; inherited regression only |
| US4.1 | **Given** available free asset candidates, **When** selecting art, **Then** candidates are assessed for theme, consistency with the heroes, animation coverage, mobile suitability and permission for modification and distribution in the game; suitable candidates are reused, with adaptations recorded. Rejected candidates have specific reasons and unmet needs have a documented original-art fallback. | Candidate/source inspection complete; final source/import/owner review pending |
| US4.2 | **Given** any third-party asset proposed for shipping, **When** reviewing its record, **Then** its creator, source page, asset/version identification, acquisition date, license evidence, modifications and required credits are recorded. Missing or incompatible permission prevents inclusion; any required attribution accompanies the distributed game and is available offline. | Retained licenses/hashes and empty runtime inventory; final credits/distribution pending |
| US4.3 | **Given** four room concepts and four enemy concepts, **When** reviewing before final production, **Then** the owner can assess their shared style and role/setting identities. Final in-game review covers all eight subjects, supported enemy actions and phone combat readability; outstanding review or device evidence remains pending. | Pending new art; inherited regression only |

## All seven success criteria

- **SC-001**: All four settings pass concept and in-game review with actual 3D scenery and every required landmark; at least four of five testers correctly identify all four settings without location labels or coaching. (PRD AC-058–060, SC-011)
- **SC-002**: All three common enemy roles and Liam have complete reviewed character designs and presentation for every supported action/state. At least four of five testers distinguish all three common threat roles and the boss from normal gameplay views without enemy labels or colour-only cues, after encountering their behavior. (PRD AC-063, SC-012)
- **SC-003**: At least four of five testers prefer the new artwork in matched before/after gameplay views; at least four rate combat readability and responsiveness separately at least 4/5, and indicate the correct onward direction within three seconds of GO. (PRD SC-004, SC-009, SC-013)
- **SC-004**: Complete cached offline runs, results and retries succeed on both reference phones, including installed mode where supported, with all required art and applicable credits available; all defined loading/interruption/update scenarios pass. (PRD AC-062, AC-064)
- **SC-005**: Both reference phones meet the 60 fps target/30 fps minimum requirement during complete-run evaluation, with busiest-encounter evidence and game content within the inherited 30 MiB total/16 MiB per-file limits. (PRD NFR-002; feature 009)
- **SC-006**: Every shipped third-party asset has a complete provenance record and fulfilled license conditions; the selection record documents accepted/rejected free candidates and any original-art fallback. (PRD AC-064)
- **SC-007**: All defined gameplay-preservation and visual-state scenarios pass with no unexplained changes to enemy behavior, damage, collision, waves, exits or table interactions. Eight concept and eight final gameplay reviews are recorded; none of the required reviews is falsely marked complete. (PRD AC-060, AC-063, AC-065)

## Replacement ownership

| Existing coverage | Replacement / extension owner | Status |
| --- | --- | --- |
| GUT simulation combat/AI/progression/specials/run-clock; immutable parity fixtures | T028–T030, T039, T051 preserve deterministic gameplay and camera/ArenaContext | Existing source; baseline results in baseline.md |
| GUT presentation camera/import/backdrops, content catalogue/resource store | T008–T009, T016, T027–T029, T041 replace scenery/primitive enemy assumptions | New suites absent |
| Vitest tooling/platform inventory/export/cache/worker/semantics/diagnostics | T010, T044–T045, T054–T055 extend shared tooling | New suites absent |
| Playwright Godot backdrop/layout/GO/table/retry suites | T017, T030, T042–T043 replace eight-texture assertions while retaining journeys | New artwork suites absent |
| Blender hero source/export/editability/workflow suite | T009 extends enemies and preserves hero fingerprints | Enemy suite absent |
| 009 phone/player manual waiver | T052–T053, T065–T066 require current artwork evidence | Historical waiver is not feature 010 approval |

Implementation, art review, devices and participants are separate statuses: current Godot baseline present; new final art not implemented; 8 concept drafts rendered with owner review pending and 8 final reviews pending; iPhone 12/Pixel 6 unavailable in this session; five-player evaluation not performed. Source changes invalidate affected capture/review hashes. No deployment is authorized by this task list.

## Inherited PRD SC-001–013

| PRD outcome | Required measure |
| --- | --- |
| SC-001 | At least 4 of 5 players move and perform a Light attack within 30 seconds of gaining control, without verbal coaching. |
| SC-002 | At least 4 of 5 players complete the level within three attempts. |
| SC-003 | At least 4 of 5 players record a first successful run lasting 3–5 minutes of active gameplay. Players who do not finish do not satisfy this criterion. |
| SC-004 | At least 4 of 5 players rate both control responsiveness and combat readability at least 4/5. Ask the two ratings separately. |
| SC-005 | All acceptance scenarios pass, including solo completion after either AI partner’s knockout and complete offline replay. |
| SC-006 | Both reference devices meet the performance requirement during a complete run. Record frame timing and any visible stalls. |
| SC-007 | At least 4 of 5 players correctly demonstrate Light, Heavy, directed Dodge, and ready Special within two minutes after receiving their contextual prompts, without verbal coaching. Record each action separately. |
| SC-008 | At least 4 of 5 first-time testers select their intended fighter and partner and reach gameplay without verbal coaching, and at least 4 correctly identify the AI-controlled character afterward. |
| SC-009 | At least 4 of 5 first-time testers indicate the correct next-room direction within three seconds of the GO arrow appearing, without verbal coaching. |
| SC-010 | At least 4 of 5 testers identify Lion as slower/stronger and Plates as faster/longer-reaching after trying both, without coaching. |
| SC-011 | At least 4 of 5 testers correctly identify all four settings (outside entrance, bar, dance floor, stage/VIP) without location labels or verbal coaching. |
| SC-012 | At least 4 of 5 testers distinguish the melee clubgoer, ranged bartender, charging security enemy and boss from normal gameplay views without enemy labels or colour-only cues, after encountering their behavior. |
| SC-013 | At least 4 of 5 testers prefer the new artwork when shown matched before/after gameplay views of the scenery and enemies; retain separate responsiveness and readability ratings under SC-004. |

All participant/device outcomes remain pending for feature 010. The feature 009 manual waiver is limited to that cutover. Deterministic/parity/browser baseline results are supplementary and cannot establish these human/device outcomes.

## Shared-foundation continuation audit (2026-10-14)

[Foundation evidence](foundation.md) adds full/focused authoring/import validation, source hash/status and dependency checks, a representative explicit room/prop GLB and four independent enemy instances beside the unchanged duo. This advances FR-006/009/010/012 technical evidence without establishing final room/role coverage, credits, physical-phone performance or participant outcomes. The runtime-gate countdown boundary regression is fixed with an observed deterministic red/green case and repeated WebKit verification (FR-008).

Task audit: the original Grunt/Zoner source/runtime work satisfies T031/T032; its final gameplay contact/feet review remains T030/T040. All remaining role-wide tasks retain Enforcer/Liam and phase-two obligations. Inherited SVG tests, shared-generation readiness and offline tests are retained, not relabeled as final feature 010 art acceptance. Missing complete production content correctly fails the new unfiltered validator.

## Complete implementation reconciliation — 2026-10-15

This section supersedes the earlier pilot/foundation statements about missing rooms, roles and credits. All production content and technical interfaces now exist. [Final checks](final-checks.md), [the art register](../reviews/art-register.md), [acceptance](acceptance.md) and [release](release.md) identify actual outcomes and pending evidence.

| Requirements | Current implementation and evidence | Remaining acceptance |
| --- | --- | --- |
| FR-001–003 | Four furnished room GLBs/scenes; every landmark; quiet backing/connectors; unchanged camera/level/tables/waves/exits; room import/ray/layout/transition checks and 26 exact replays. | Physical layouts and participant setting recognition. |
| FR-004–006 | Four distinct rigged roles; every semantic/attack; normal stun/boss immunity; both facings/phases; manual skeleton sampling; exact cues/release; run-bound defeat/ownership; source/Blender/GUT/browser checks. | Physical readability and participant threat recognition. |
| FR-007–008 | Safe controls, original GO rules, static reduced-motion-safe decoration/cues, frozen pause/results, explicit resume/fresh inputs; all duos and inherited interruption/settings/audio/storage checks. | Real phone touch/gesture/lifecycle procedures and participant measures. |
| FR-009–010 | Full prepared art and initial view; actionable failures/retry; immutable cache/update/offline art+credits; actual two-pack cold mounts; 30/16-MiB audits; active-only diagnostics; ten cycles; 53–75 sampled desktop draw calls. | Complete browser/installed phone runs and phone FPS/stalls. |
| FR-011–012 | Retained accepted free-source/license/acquisition/hash records, original fallbacks, rejected candidates, nonmutating full/focused import/prop validation, deterministic shipped-only credits and physical source exclusion. | No unresolved feature-010 artwork source decision is shipped. Inherited soundtrack metadata limits remain explicit. |
| FR-013 | Eight concept/eight final source/build/capture records, explicit owner blanket artwork approval, exact review hashes and technical rechecks. | Five-player evaluation and required physical device observations. |

All 17 scenarios remain mapped above: US1.1–4 → room/catalogue/layout/transition suites; US2.1–5 → enemy catalogue/pose/view/gameplay/neutral-review suites; US3.1–5 → inherited lifecycle/input/loading/cache/offline suites plus art cycles/diagnostics/pack audits; US4.1–3 → source/import/credits tests and owner review records. A passing automation case does not establish its separate phone/participant clause.

SC-001/002/003 retain participant thresholds; SC-004/005 retain physical mobile conditions. SC-006 has complete feature artwork provenance/notices. SC-007 has exact gameplay regressions and all sixteen owner-approved concept/final directions, with no falsely recorded individual screenshot inspection. The feature-specific strict audit intentionally fails missing manual evidence; the old 009 waiver is not reused.
