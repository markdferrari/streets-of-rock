# Feature Specification: Expressive Fighter and Companion Animations

**Feature Branch**: `011-improve-character-animations`

**Created**: 2026-10-15

**Status**: Draft — specification validated; animation-source selection, production and gameplay acceptance pending

**Input**: “I want the player characters + ai companions to have better animations. We have some samples in /home/mark/projects/godot/assets - KayKit_Character_animations and Universal Animation Library which could be candidates. Let's explore rigging the cow, lion, crow and plates characters up.”

## Product Alignment *(mandatory)*

- **PRD references**: [PRD](../../PRD.md), FR-001–004, FR-008–025, FR-032–033, FR-037, FR-040–048, FR-051–055, FR-062, FR-064–069; NFR-001–009; AC-002–007, AC-036–039, AC-043–047, AC-049–057, AC-066–071; SC-004–006, SC-010, SC-014.
- **Included behavior**: Improved articulated animation for Cow, Lion, Crow and Plates in both fighter and AI-partner roles, including selection previews, existing locomotion and combat states; assessment of the two supplied animation libraries; character-specific adaptations; recorded before/after and in-game review.
- **Deferred behavior**: New characters, enemy animation changes, new moves or abilities, altered combat balance, AI changes, redesigned character identities, additional costumes, cinematic sequences, paid assets and general-purpose animation tooling.
- **Provisional tuning**: Motion style, pose exaggeration, secondary movement and transition blending may be adjusted through review. Existing action durations, hit windows, travel speeds, reach, damage, control responsiveness and character identities remain obligations.
- **Scope revision**: This owner-requested feature supersedes feature 009's visual-parity restriction for these four characters' animations and the continued deferral of unrelated graphical upgrades in feature 006 for this animation scope only. Feature 010's scenery/enemy scope remains separate. Changes to articulation or local mesh construction are permitted where needed for animation, while retaining recognizable designs, silhouettes, outfits and body proportions.
- **Governance**: Follow the [constitution](../../.specify/memory/constitution.md). Specify manual visual procedures before production and use test-first development for automatable behavior. This document does not declare earlier device, artwork or gameplay evidence complete.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review animation candidates on the actual characters (Priority: P1)

As the game owner, I can compare the supplied animation libraries on Cow, Lion, Crow and Plates before choosing the animation approach for each character.

**Why this priority**: Both libraries offer useful motion, but their suitability for the existing non-human characters must be demonstrated before full production.

**Independent Test**: Inspect an assessment covering both libraries and matched current/candidate previews for all four characters, without requiring a completed level upgrade.

**Acceptance Scenarios**:

1. **Given** both supplied libraries and the existing four characters, **When** assessing candidates, **Then** each library is evaluated for all four characters against idle, locomotion, basic combat, reactions and special-action needs; record usable motion, adaptation needs, missing coverage, distribution permissions and mobile cost concerns.
2. **Given** each character's candidate motion, **When** reviewing at normal gameplay scale in both facings, **Then** matched before/after previews show idle, movement and a representative attack on the actual character, rather than only a sample mannequin. Record a source recommendation and reasons for each character; custom motion may fill gaps or replace unsuitable candidates.
3. **Given** Crow's wings and Plates' rigid plate body, **When** reviewing motion, **Then** wings retain their recognizable shape and the plate retains its rigid form without human-body distortion, detached parts or replacement by a humanoid mannequin. Cow and Lion retain their respective silhouettes and body proportions.
4. **Given** a source is proposed for production, **When** reviewing its record, **Then** source identity, creator, version, local evidence, acquisition date where known, adaptations and required credits are traceable. Unknown acquisition dates are explicitly recorded as unknown; unclear distribution permissions prevent shipping that source.

---

### User Story 2 - Read and enjoy each fighter's existing actions (Priority: P1)

As a player, I see expressive, connected movement that makes my chosen fighter's actions and fighting style clear while retaining the existing controls and combat rules.

**Why this priority**: Improved motion must be visible during play and remain truthful about when actions take effect.

**Independent Test**: Exercise each character's preview, idle, movement, full three-hit Light combo, Heavy, Dodge, Special, hurt and knockout in controlled encounters in both facings.

**Acceptance Scenarios**:

1. **Given** any of the four characters, **When** previewing or playing, **Then** the character retains its identity and shows articulated idle and alternating locomotion, without default rest poses, a visible loop reset, disconnected limbs or sustained foot sliding during steady unobstructed travel.
2. **Given** a full Light combo or Heavy, **When** executing it, **Then** all three Light strikes are visually distinguishable by striking limb, direction or pose; Heavy has a distinct anticipation and follow-through. Transitions connect without an unintended pose snap or an extra wait before the next legal action.
3. **Given** any attack or directed Dodge, **When** it plays, **Then** visible contact, release, direction and recovery agree with existing action windows and movement. Animation adds no displacement, damage, range, invulnerability or action delay beyond the existing gameplay rules.
4. **Given** each ready Special, **When** activated, **Then** Cow's spin, Crow's wing spin, Lion's ROAR and Plates' Headrest Throw have recognizable individual motion. ROAR communicates its existing effect timing; the thrown headrest visibly releases in the existing release window. AI partners do not gain these Specials.
5. **Given** damage, knockout or a permitted action transition, **When** presentation changes, **Then** the new state takes precedence at the existing legal moment; knockout visibly settles into inactivity and no prior strike, locomotion or default pose persists. If results stop combat before the fall completes, the remaining visual fall may finish without advancing gameplay or run time and without delaying results, Retry or Home; interruptions freeze it and require explicit Resume. Existing buffered input and non-cancelable recovery remain correct.

---

### User Story 3 - See a lively, independent companion (Priority: P1)

As a player, I can understand my AI companion's movement, support attacks, damage and knockout without confusing those actions with my own.

**Why this priority**: Every character can fill either role, and the companion is present throughout the run.

**Independent Test**: Initialize all twelve distinct ordered duos; observe each character as partner during pursuit, ordinary following, catch-up, support attacks, damage and knockout, then retry.

**Acceptance Scenarios**:

1. **Given** any ordered duo, **When** both actors perform different actions simultaneously, **Then** each retains independent animation state, facing and action progress without restarting or changing the other's motion.
2. **Given** a companion following, pursuing or catching up, **When** its travel speed or direction changes, **Then** locomotion follows actual travel, retains the existing depth-only facing rule and does not visibly walk in place once stationary. Existing AI priorities and obstruction recovery remain unchanged.
3. **Given** a companion in attack range, **When** it supports the fighter, **Then** its approach or ready stance supplies anticipation, visible contact coincides with the existing immediate support hit, and interruptible follow-through communicates recovery without adding a gameplay delay; no player-only ability is added.
4. **Given** a knocked-out companion, **When** the fighter continues and retries, **Then** the companion remains visibly inactive during solo continuation and returns alive with fresh motion on retry; no stale pose, prior action or thrown object survives reset.

---

### User Story 4 - Keep mobile combat responsive and available offline (Priority: P1)

As a mobile player, I retain readable, responsive play with improved animations throughout selection, a full run and retry, including offline use and interruptions.

**Why this priority**: Animation quality cannot come at the expense of usable controls, correct pause behavior or supported phones.

**Independent Test**: Follow the mobile procedures below on iPhone 12 and Pixel 6 with the complete build, intended soundtrack, busiest encounters, cached offline launch and retry.

**Acceptance Scenarios**:

1. **Given** busy combat with audio muted and shake disabled, **When** fighting with the improved actors, **Then** attacks, damage, companion inactivity, enemies and warnings remain understandable without colour alone and without obstructing controls or safe areas.
2. **Given** pause, backgrounding, focus loss or portrait rotation, **When** interrupted, **Then** action animation and active gameplay timing freeze, inputs clear and explicit Resume is required. Resuming continues from the paused action without skipping visible contact or repeating an effect. Selection reduced motion retains still previews; gameplay keeps essential action cues and suppresses optional secondary motion.
3. **Given** a cached complete build, **When** launching offline, selecting any duo, completing a run and retrying, **Then** required animations, audio and results are available. Required loading failure offers actionable retry with the duo retained; cache-only failure does not falsely claim offline readiness; updates occur safely between runs.
4. **Given** the complete game on either reference phone, **When** playing a full run including the busiest encounter, **Then** the 60 fps target and at least 30 fps minimum remain applicable; game content stays within the existing 30 MiB total and 16 MiB per-content-file budgets, with engine overhead reported separately.

### Edge Cases

- Rapid movement start/stop, depth-only travel, facing reversals and different catch-up speeds must not leave a walking loop, reverse an attack or create an extra turn delay.
- Buffered follow-ups, a hit at an action boundary, knockout during a strike and same-step terminal outcomes must retain existing priorities and once-per-target rules.
- Crow's wings, horns, jackets, Lion's mane and Plates' body must remain attached and readable at extreme poses, room edges and character overlaps.
- Source motion that translates the character must not move the gameplay actor beyond its allowed travel or misrepresent attack reach.
- A zero-health actor must visibly fall inactive even when the run also ends; inactive bodies must not continue locomotion or appear to support-attack.
- Different characters or the same preview and gameplay character must not share mutable action progress across views.
- Missing required motion cannot silently leave an actor in a rest pose or omit an attack; readiness must surface an actionable failure before gameplay.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Assess both supplied animation libraries for all four characters, document coverage and limitations, and provide matched current/candidate idle, movement and attack previews on each actual character before full production. (PRD FR-064; Story 1.1–1.2)
- **FR-002**: Improve articulated animation for all four characters while retaining their recognizable designs; preserve Crow's wing anatomy and Plates' rigid plate body through all required states. (PRD FR-065; Stories 1.3, 2.1)
- **FR-003**: Cover selection preview, idle, movement, all three Light strikes, Heavy, directed Dodge, each existing Special, hurt and knockout for every fighter; cover actual movement, support attack, hurt and knockout for every partner. Both facings and the twelve ordered duos are required. (PRD FR-065; Stories 2.1–2.5, 3.1–3.4)
- **FR-004**: Present distinguishable strikes and character-specific Specials, continuous transitions and loops without visible rest-pose flashes, detached parts, unintended pose snaps or sustained foot sliding during steady travel. (PRD FR-065–066; Story 2.1–2.4)
- **FR-005**: Preserve existing combat, targeting, movement, AI, buffering, phase timings and effect rules; visible anticipation, contact/release and recovery must agree with the existing action windows. Presentation must not add gameplay displacement or delay an available input. (PRD FR-066; Stories 2.3–2.5, 3.2–3.3)
- **FR-006**: Keep animation independent per actor and view; correctly prioritize reactions and knockout, freeze gameplay motion on pause, resume the same action and fully reset on retry. (PRD FR-067; Stories 2.5, 3.1, 3.4, 4.2)
- **FR-007**: Preserve reduced-motion preview behavior, muted/no-shake readability, essential warnings, safe areas and simultaneous touch controls. (PRD FR-068; Story 4.1–4.2)
- **FR-008**: Bundle required animation assets for complete offline selection, play and retry; preserve readiness, actionable load failure, accurate cache status, nonblocking audio/storage failure and safe updates. (PRD FR-068; Story 4.3)
- **FR-009**: Retain current complete-game mobile performance and content budgets and record reference-device evidence. (PRD FR-068; Story 4.4)
- **FR-010**: Record chosen and rejected source decisions, provenance, modifications, distribution permission and credits, with custom-motion fallbacks for gaps. Record owner review of candidate previews and final gameplay for every required state and role; unfinished visual/device checks remain pending. (PRD FR-062, FR-064, FR-069; Stories 1.1–1.4, 2–4)

### Mobile Quality and Validation *(mandatory)*

Define these procedures before implementation; record outcomes against the numbered acceptance scenarios rather than treating this specification as passing evidence.

| Area | Observable procedure and required outcome | PRD mapping | Validation |
| --- | --- | --- | --- |
| Motion and action truth | For each character in both facings, record preview, idle, steady horizontal/depth travel, start/stop/turn, all Light hits, Heavy, Dodge in allowed directions, Special, hurt and knockout. Compare visible contact/release to existing action windows; inspect full-speed transitions and slowed playback for rest poses, clipping and sliding. | FR-064–067; AC-066–069 | Automated coverage, action-boundary/priority and unchanged-effect regressions written and observed failing before behavior changes; manual review of appearance and timing. |
| Partner independence | Exercise twelve ordered duos; capture simultaneous different actions and each partner's pursuit, follow, catch-up, support, hurt, knockout and retry. | FR-046–048, FR-067; AC-055, AC-069 | Automated role/state-isolation/reset regressions first; manual in-game motion review. |
| Touch and readable combat | On both phones, hold movement while using each action in busy combat with mute/no-shake and reduced motion; inspect safe areas, warnings, actor overlap and selection still poses. No new layout or control change is included. | FR-010, FR-037, FR-043, FR-049; AC-038, AC-051, AC-070 | Existing input regressions retained; manual device checks and five-player readings below. |
| Interruption and timing | Interrupt locomotion and each action phase through pause, hiding, focus loss and portrait rotation; wait, return and explicitly resume. No action/time advances while paused, no stale input, duplicate hit or skipped release follows. Repeat at countdown. | FR-044, FR-067; NFR-003–004; AC-070 | Automated pause/resume/countdown regressions first where affected; manual browser/device checks. |
| Loading, audio, storage and offline | Fail one required animation load and retry; separately fail caching, disable audio/storage, then cache a valid complete release and relaunch offline. Cover every character in both roles across cached runs, finish and retry; offer an update during a run and confirm it waits. Audio activation/storage behavior is unchanged and remains nonblocking. | FR-047, FR-068; NFR-006–009; AC-047, AC-056, AC-071 | Existing platform regressions plus test-first checks for changed asset readiness/cache coverage; manual complete offline runs on both phones. |
| Performance and download | Record OS/browser versions and full-run frame timing with intended soundtrack and busiest encounters on iPhone 12 and Pixel 6; record game-content, largest-file, engine, total download and cached sizes. Target 60 fps, require at least 30 fps; retain 30 MiB game-content and 16 MiB per-content-file limits. | NFR-001–002; FR-068; AC-071; SC-006 | Automated budget validation when delivery changes; actual device measurements required. |
| Five-player evaluation | Show matched before/after gameplay for all four characters and both roles. Ask preference and separately rate responsiveness/readability; have testers identify Light versus Heavy, each Special and companion inactivity. Also retain existing Lion/Plates style evaluation. | SC-004, SC-010, SC-014 | Manual five-player record; no claim of completion without results. |

### Key Entities *(include if feature involves data)*

- **Character animation profile**: The required visual states for a character in each supported role, with identity constraints, motion coverage and links to source decisions.
- **Animation candidate assessment**: A library/character comparison covering suitable motion, adaptations, coverage gaps, permissions and reasons for selection or rejection.
- **Animation review record**: Matched baseline and proposed views, character/role/action/facing coverage, reviewer feedback, acceptance results and outstanding issues.
- **Asset provenance record**: Creator, source, pack/version identity, acquisition date or explicit unknown, license evidence, adaptations and credits for shipped third-party motion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Both candidate libraries are assessed against all four characters; four matched before/after candidate previews and four recorded source decisions exist before full production.
- **SC-002**: Every required state passes the recorded visual review for all four characters and both facings; all twelve ordered duos pass role, independent-motion, knockout and retry checks. No required state shows a missing action, rest-pose flash, detached part or character identity loss.
- **SC-003**: All exercised attacks and Specials show contact/release within their existing action windows, with no added control delay or changed gameplay outcome in the regression scenarios.
- **SC-004**: At least 4 of 5 testers prefer the improved animation in matched before/after gameplay. At least 4 of 5 distinguish Light from Heavy, identify each character's Special and identify the companion's inactive state without coaching; record each judgment separately. At least 4 of 5 rate responsiveness and combat readability at least 4/5, separately, retaining PRD SC-010's style evaluation.
- **SC-005**: Both reference phones meet the 30 fps minimum in the busiest encounter during a complete run, with a 60 fps target; complete-game content stays within existing size budgets.
- **SC-006**: A complete cached offline launch, selection, full run and retry succeeds on each reference phone; collectively recorded offline checks cover all four characters in both roles. All applicable loading-failure, interruption/resume and safe-update acceptance scenarios pass.

## Assumptions

- “AI companions” means the selectable friendly partner, rather than the enemies covered by feature 010.
- The goal includes delivering improved in-game motion after exploration; this specify invocation produces requirements and initial findings, while source trials, production and integration belong to later phases.
- Existing rigs are a starting point, not a promise of direct compatibility. A library is a candidate, not a mandated source, and custom animation is allowed where sample motion does not fit.
- Existing appearances, moves, timings, balance, companion restrictions and controls remain authoritative; imported motion must adapt to them.
- Local samples and editable character sources are available for planning. No purchase or external animation service is required.
- Owner visual feedback, five playtesters and both reference phones are dependencies for final acceptance; absent results remain pending.
