# Feature Specification: Bondi Beach Mobile Game MVP

**Feature Branch**: `001-neon-velvet-mvp`

**Created**: 2026-09-26

**Status**: MVP implementation in progress; controls revised by feature 002 on 2026-09-27

**Input**: User-provided Streets of Rock MVP Product Requirements v2.0, dated 2026-09-26.

## Product Alignment *(mandatory)*

- **PRD references**: [PRD v2.1](../../PRD.md), FR-001 through FR-040, NFR-001 through NFR-009, SC-001 through SC-007, and AC-001 through AC-021 plus AC-035 through AC-039. AC-022 through AC-034 retain their existing supplemental meanings.
- **Governance**: [Constitution v1.0.0](../../.specify/memory/constitution.md). Implementation follows test-first development on a feature branch. This document specifies outcomes; engine and implementation choices belong to technical planning.
- **Player value**: Casual action players can learn readable touch combat, fight with an AI companion, and finish and replay one complete 3–5 minute rock-club level.
- **Included behavior**: Cow with vulnerable AI Crow; simple stylized 3D; four connected areas; movement, Light combo, Heavy, Dodge, and Bovine Spin; three common enemy roles; two-phase Liam; two breakable tables and healing drinks; onboarding, HUD, pause/settings, results/retry; bundled soundtrack; mobile-browser installation and offline replay.
- **Deferred behavior**: Character selection, playable Crow/Lion/Plates, multiplayer, jumping/aerial combat, grapples, directional special moves, rear strikes, simultaneous-button gestures, weapons, random loot, revives, team cinematics, boss summons, additional levels, upgrades, accounts, leaderboards, remote analytics, monetization, native distribution, Capacitor wrapping, rhythm combat, and player-selected music files.
- **Provisional tuning**: Encounter counts, pacing budgets, and the starting control values below are adjustable against acceptance goals. Damage, health, timings, recovery, knockback, post-hit protection, cooldowns, meter gain, movement, and hit alignment are tuning values. Production art and an automated asset-generation pipeline are not delivery gates.

The 3–5 minute target measures successful active gameplay, not loading, pauses, or results.
There is no countdown failure: players may take longer. Crow can be knocked out for the rest
of a run, but Cow can still win alone. A complete MVP requires all four stories, including P2
offline play; an independently demonstrated story is only an increment.

The controls in [002-revised-controls](../002-revised-controls/spec.md) replace the original floating joystick and three-button layout. This document is synchronized to that product revision. Existing MVP plan, contracts, tasks, and validation evidence describe the earlier implementation baseline; revised-control planning must update affected contracts and tests before code changes, and prior passing results do not validate the new controls.

## Clarifications

### Session 2026-09-26

- Q: What future deployment platform must the MVP stack support? → A: AWS. The owner supplied this constraint directly; the game must remain deployable as static assets over HTTPS on AWS. Provisioning and publishing are future work.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Learn and use touch combat (Priority: P1)

As a casual player, I can move and fight immediately so the game feels understandable and responsive.

**Why this priority**: Every encounter depends on usable touch input and predictable combat.

**Independent Test**: A representative encounter with Cow, Crow, and test enemies supports movement, attacks, dodge, special, damage, and onboarding. This can be evaluated before the complete level exists.

**Acceptance Scenarios**:

1. **AC-001:** Given a first run, when control starts, then movement and Light prompts appear contextually without blocking play; Heavy is introduced in the first encounter, and Dodge and Special when relevant. Completed prompts persist when storage is available; legacy attack completion does not suppress the new Heavy prompt. (FR-006, NFR-008)
2. **AC-002:** Given an active joystick touch, when another finger taps Light, Heavy, Dodge, or Special, then the requested available action executes while movement input remains correctly tracked. Canceling either touch does not leave it stuck. (FR-009–012)
3. **AC-003:** Given an attack nearing recovery, when a follow-up is entered within the configured buffer, then it executes once at the next valid opportunity; expired input does not execute later. (FR-012)
4. **AC-004:** Given an enemy outside attack depth, when Cow attacks, then it takes no damage. Given a valid overlap, that strike damages it only once. (FR-016)
5. **AC-005:** Given a ready dodge, when an attack overlaps its invulnerability window, then Cow takes no damage from that attack. Repeated input during cooldown does not grant another dodge. (FR-013, FR-015)
6. **AC-006:** Given a full meter, when Special is pressed in an actionable state, then Bovine Spin fires once and empties the meter. An incomplete meter causes no attack or resource loss. Cow’s damaging Light/Heavy enemy hits fill the meter; Crow, table damage, misses, and Bovine Spin do not, and unavailable or non-actionable states cannot spend it. (FR-014–015)
7. **AC-007:** Given Cow has just taken damage, when another hit arrives during post-hit protection, then that hit does not reduce health. (FR-017)
8. **AC-022:** Given landscape play and an initial facing toward progression, when Cow moves horizontally, moves only along depth, or reaches an arena edge, then facing follows horizontal movement and persists for depth-only movement, and Cow remains in bounds. Touching Pause or another HUD control does not start movement. (FR-007, FR-008, FR-009, FR-011)
9. **AC-023:** Given Cow is actionable, when the player enters three timely Light taps, then a three-hit sequence ends in knockback; after a missed continuation window, the next attack starts a new sequence. Neutral-input dodge follows facing, directed dodge follows movement, and each unavailable action gives feedback without consuming resources. (FR-012, FR-013, FR-015)
10. **AC-024:** Given several enemies and both allies share an arena, when attacks occur, then no more enemies attack concurrently than the configured limit, other enemies wait or reposition, allies cannot damage or body-block each other, and hit reactions and post-hit protection are visible. (FR-017, FR-018, FR-019)

11. **AC-035:** Given active landscape gameplay before any touch, when the player views and drags the joystick, then its ring and knob are visible, the fixed anchor stays in place, the knob tracks within the ring, and release or cancellation centres it and stops movement. Touches outside the ring do not start movement. (FR-009)
12. **AC-036:** Given Cow is actionable, when Heavy is tapped, then one slower, stronger strike occurs without health or meter cost and the next Light begins at hit one. Holding Heavy does not repeat it; its recovery cannot be canceled. (FR-012, FR-038, FR-040)
13. **AC-037:** Given equivalent enemy targets, when Light and Heavy land or miss, then range/depth and once-per-target rules hold and only damaging enemy hits fill the capped meter. Table damage and Bovine Spin do not refill it. Both Light and Heavy can break tables under FR-031. (FR-014, FR-016, FR-031, FR-038)
14. **AC-038:** Given either reference phone, when controls are shown with audio muted and shake disabled, then the four labels and diamond positions are clear, presses are visible, Dodge cooldown and Special readiness are understandable without color alone, and controls remain reachable within safe areas without covering combat warnings. (FR-037, FR-039, NFR-003)
15. **AC-039:** Given overlapping requests or a held/sliding action touch, when inputs are resolved, then only one action and at most one unexpired follow-up are accepted under FR-040, with no unintended repetition or recovery cancel. Cancellation removes that touch’s pending request; interruptions, results, and retry clear every pending input. (FR-010, FR-012, FR-015, FR-040, NFR-004)

### User Story 2 - Complete and replay the level with Crow (Priority: P1)

As a player, I can fight through the venue with my companion, reach a clear result, and try again.

**Why this priority**: The complete progression, companion stakes, boss, and retry establish the core short-session experience.

**Independent Test**: Given working basic combat, play all four areas and separately exercise Crow knockout, solo victory, Cow defeat, and retry. Test encounter transitions and terminal outcomes independently using controlled starting states.

**Acceptance Scenarios**:

1. **AC-008:** Given an active wave, when its final enemy dies, then exactly one next wave starts or the cleared arena unlocks and shows “GO.” Unbroken tables and a knocked-out Crow do not block progression. (FR-026–028)
2. **AC-009:** Given Crow reaches zero health, when Cow continues, then Crow stops acting, his status is visible, and Cow can still use Special and defeat Liam. (FR-022–023)
3. **AC-010:** Given Crow remains alive, when Cow reaches zero health, then combat stops and defeat offers retry. Simultaneous Cow/Liam lethal damage also produces defeat. (FR-003–004)
4. **AC-011:** Given Liam is in phase one, when his health falls below half, then the phase change is visible and occurs once, and phase two adds a visibly telegraphed, dodgeable ground shockwave to his rope swing and close-range strike. Defeating him while Cow survives produces victory and a completion time. (FR-003, FR-005, FR-029, FR-030)
5. **AC-012:** Given a terminal result, when Retry is selected, then both heroes, the empty meter, all encounters, objects, pickups, and elapsed time reset. (FR-002, FR-004)
6. **AC-013:** Given a damaged Cow and a broken table, when Cow contacts its drink, then health increases by 25% of maximum without exceeding maximum and the pickup disappears exactly once. Crow cannot consume it. (FR-031)
7. **AC-014:** Given Crow is obstructed or separated, when Cow progresses, then Crow recovers without blocking the camera or granting damage, revival, or encounter completion. (FR-020–024)
8. **AC-025:** Given the title screen, when loading completes and Start is selected, then a fresh run begins with both heroes at full health and an empty meter; health, partner status, special readiness, and Pause are visible. Liam’s health appears during his encounter. (FR-001, FR-002, FR-007)
9. **AC-026:** Given Crow has nearby targets, when one attacks Cow, then Crow prioritizes that reachable threat; without such a threat he favors a reachable ranged enemy, then another nearby enemy. If following Cow conflicts with attacking, he follows. Over equal active attack time against equivalent targets, Crow deals less damage than Cow using basic attacks. Crow never uses a special or collects a pickup, and remains within the playable camera region during following and combat. (FR-020, FR-021, FR-025)
10. **AC-027:** Given successive areas, when the player encounters each enemy role, then grunts approach for telegraphed melee, zoners throw visible avoidable projectiles without retreating out of reach, and enforcers telegraph a charge followed by punishable recovery. The camera tracks horizontally at a fixed angle between areas and locks during combat. (FR-026, FR-028, FR-029)
11. **AC-028:** Given the two VIP tables, when Cow breaks each table, then each produces exactly one drink; Crow cannot break the tables. A drink collected at full health disappears without exceeding maximum health. A defeated Crow neither acts, blocks, nor absorbs further attacks until retry. (FR-022, FR-031)
12. **AC-029:** Given a run lasting longer than five minutes, when the player continues, then there is no time-based defeat. Victory displays elapsed active time excluding pauses, loading, and results; only a faster successful run replaces the best time. Defeat and victory both offer full retry and return to title, and terminal combat no longer advances. (FR-003, FR-004, FR-005)

### User Story 3 - Play reliably on a mobile device (Priority: P1)

As a mobile player, I can recover from interruptions and understand the game with my preferred settings.

**Why this priority**: Real-world interruptions, screen constraints, sound preferences, and performance directly affect whether the game is playable.

**Independent Test**: A representative combat encounter with the settings and presentation can validate interruption handling, audio, and layout on both reference phones. Final performance acceptance uses the completed level.

**Acceptance Scenarios**:

1. **AC-015:** Given active combat, when the page loses focus, becomes hidden, or rotates to portrait, then gameplay and audio pause, inputs clear, and active time stops. Returning requires explicit Resume. (NFR-003–004)
2. **AC-016:** Given music playback, when the player pauses, resumes, and retries, then audio follows gameplay state without overlapping tracks. Muting audio leaves telegraphs readable. (FR-035–037)
3. **AC-017:** Given saved settings and a best time, when the game reloads, then those values return. When storage is unavailable, the game still starts and plays. (NFR-008)
4. **AC-018:** Given either reference device, when the player completes a full run including the busiest encounter, then essential controls stay visible and performance meets the busiest-encounter target. (NFR-001–003)
5. **AC-030:** Given the title or pause settings, when the player adjusts music and effects separately or disables shake, then the chosen effects apply independently. With sound muted and shake disabled, players can still recognize warnings, health, and action readiness without relying on color alone. Audio failure permits continued play. (FR-035, FR-036, FR-037)
6. **AC-031:** Given the completed level presentation, when a player traverses the club, then simple stylized 3D silhouettes, shadows, and poses distinguish Cow in a leather jacket, Crow in an aviator jacket, and Liam as a large bouncer. The four spaces convey the neon rock venue, combat is non-graphic, and effects do not obscure attack warnings. (FR-032, FR-033)
7. **AC-032:** Given a run with active inputs, when the browser reloads or terminates and is reopened, then the title screen appears rather than restoring the partial run; starting again does not preserve held touches. (NFR-004)
8. **AC-034:** Given the owner’s supplied soundtrack is included, when the player starts, pauses, resumes, retries, and later reopens offline after caching, then the track plays and loops without overlapping instances. Attack, hit, damage, pickup, and result events have their respective effects when effects volume is enabled. (FR-034, FR-035, FR-036, NFR-006)

### User Story 4 - Install and replay offline (Priority: P2)

As a returning player, I can launch the cached game without a network connection.

**Why this priority**: Offline replay and optional installation complete the agreed PWA experience. This story is mandatory for MVP delivery after the core session works.

**Independent Test**: Given a complete playable level, cache once online, close it, disable networking, relaunch, finish the level, and retry. Repeat in browser and installed modes where supported.

**Acceptance Scenarios**:

1. **AC-019:** Given successful caching, when the player relaunches offline, then the full level, soundtrack, results, and retry work without network access. Repeat in installed mode where supported. (NFR-005–006)
2. **AC-020:** Given required content is loading, when loading or offline preparation fails, then the game explains the failure and offers retry; offline readiness is not displayed before preparation completes. If playable content is available, an offline-preparation failure alone does not prevent play. (FR-001, NFR-007)
3. **AC-021:** Given an active run, when a new build becomes available, then the active run keeps its current build and updates are applied only between runs. (NFR-007)
4. **AC-033:** Given a supported mobile browser, when the static release is served through an AWS-compatible secure hosting setup and opened at its root address, then play does not require installation, an account, or a backend session. Where installation is available, the installed game can also start and play; after caching, neither full runs nor retries require network access or remote telemetry. (NFR-001, NFR-005, NFR-006, NFR-009)

### Edge Cases

- Cow and Liam receive lethal damage together: defeat takes precedence; exactly one result is shown.
- Cow dies while Crow lives: defeat. Crow dies while Cow lives: continue, with no revive before retry.
- Expired buffered commands or canceled touches: no delayed attack, stuck movement, or unintended resume input.
- Vertical-only movement, neutral dodge, and arena edges: retain facing, dodge toward facing, and stay within bounds.
- Repeated overlap from one strike: one damage event per eligible target; nearby enemies on another depth lane are not hit.
- Several enemy attacks converge: honor coordination and Cow’s post-hit protection; attacks must retain a visible avoidance opportunity.
- Crow gets separated or obstructed: recover position without reviving, damaging enemies, or clearing a wave.
- A table remains intact, a pickup remains uncollected, or Crow is knocked out: none prevents an enemy-cleared arena from unlocking.
- A full-health Cow touches a drink: consume it without exceeding maximum health. Each table drops once per run.
- Pause, background, focus loss, or portrait rotation: stop gameplay, audio, and active timing; returning requires explicit Resume in landscape. A result screen must not resume combat.
- Reload or browser termination: discard the partial run and return to title. Available local preferences and best time remain.
- Local storage unavailable or corrupt: use safe defaults and allow play; do not invent a best time.
- Audio unavailable: permit silent play with visible feedback. Retry must never multiply soundtrack instances.
- Offline preparation interrupted: do not claim readiness. Continue if playable content is available; offer retry for preparation failure.
- Browser cache evicted: offline availability is lost; reconnect and prepare the game again. No offline first-visit guarantee is made.
- A new version becomes available mid-run: finish the current run without replacing its content; apply changes between runs.
- A run exceeds five minutes: continue normally. Failed runs do not set best successful times.

## Requirements *(mandatory)*

### Functional Requirements

The following IDs correspond directly to the PRD. All are required for this feature.

- **FR-001**: The player can enter the level from a title screen with a Start action after required assets load. Loading progress and failure/retry states must be visible.
- **FR-002**: A new run starts Cow and Crow alive at full health, with an empty special meter and reset enemies, pickups, objects, and encounter state.
- **FR-003**: Defeating Liam wins the level. Cow reaching zero health loses the run regardless of Crow’s status. If both occur in the same simulation step, defeat takes precedence.
- **FR-004**: Victory and defeat stop combat and offer full-level retry and return to title. There is no checkpoint or countdown failure.
- **FR-005**: Victory shows completion time and best successful time. Measure active gameplay from player control becoming available until victory; exclude loading, pauses, and result screens.
- **FR-006**: The first encounter teaches movement and Light with short contextual prompts. Introduce Heavy during that encounter and Dodge and Special as they become relevant. Prompts must not require a separate tutorial level or block essential controls. Returning players with completed legacy attack prompts must still receive the new Heavy prompt; completing it persists when storage is available.
- **FR-007**: The HUD shows Cow health, Crow health/knockout status, special-meter readiness, and pause. Show Liam’s health during the boss encounter.
- **FR-008**: Cow moves horizontally and along arena depth. Movement stays within walkable arena and camera bounds. There is no player-controlled jump.
- **FR-009**: The fixed-position joystick is visible before any touch during active landscape gameplay, with an outer ring and a centred thumb knob. A touch beginning inside the ring controls movement relative to its centre, with a deadzone. The knob follows the drag up to the ring boundary; dragging beyond it continues movement at maximum input without moving the anchor. Releasing or canceling the controlling touch immediately stops movement and centres the knob.
- **FR-010**: Movement and action touches work simultaneously. Buttons remain usable while the joystick is held; canceled touches cannot leave an action or movement held.
- **FR-011**: Horizontal movement determines facing; vertical-only movement preserves facing. Attacks use the established facing direction. Cow initially faces the direction of progression.
- **FR-012**: Repeated Light taps perform a three-hit combo with a knockback finisher. A missed continuation window resets the next Light attack to the first hit. Buffered actions must not accumulate into an uncontrolled sequence.
- **FR-013**: Dodge moves in the current joystick direction or, with neutral input, the facing direction. It has a visible cooldown and a short invulnerability window.
- **FR-014**: Successful damaging Light and Heavy attacks against enemies fill one special meter, capped at full. Misses, table damage, and Bovine Spin do not fill it. At full meter, Special activates Bovine Spin, damages nearby enemies, knocks them back, and empties the meter. Crow’s attacks and status do not control availability.
- **FR-015**: Unavailable actions give clear feedback and consume no resources. Actions require Cow to be alive and in an actionable state.
- **FR-016**: Attack hits require both range and arena-depth alignment. A single strike can damage each eligible target at most once.
- **FR-017**: Successful hits produce readable visual and sound feedback. Cow receives brief protection after taking damage to prevent unavoidable repeated hits.
- **FR-018**: Enemy attack coordination limits simultaneous attackers. Other enemies wait or reposition instead of all attacking at once.
- **FR-019**: Cow and Crow do not damage or body-block each other. Collision and avoidance must not trap either ally or prevent encounter completion.
- **FR-020**: Crow follows Cow between encounters, stays within the playable camera region, and attacks automatically during combat.
- **FR-021**: Crow prioritizes nearby threats attacking Cow, then reachable ranged threats, then other nearby enemies. Following Cow takes priority when separation would leave Crow behind.
- **FR-022**: Crow takes enemy damage. At zero health, he visibly becomes inactive for the remainder of the run; his body cannot block movement or absorb further attacks.
- **FR-023**: Crow’s knockout does not end the run, block wave completion, remove Cow’s special, or prevent progression. Retry restores Crow.
- **FR-024**: Crow recovers from obstruction or excessive separation. Recovery must not damage enemies, revive him, or lock an encounter.
- **FR-025**: Crow provides modest support rather than reliably completing encounters without player attacks. He does not collect healing items or use a separate special ability.
- **FR-026**: Entering a combat area locks the camera and forward progression. The camera angle stays fixed while tracking horizontal progression between areas.
- **FR-027**: Spawn the next wave only after all enemies in the current wave are defeated. Clear the area only after its final wave; unlock progression and display a visible “GO” cue.
- **FR-028**: Enemies and pickups remain reachable. Breakable objects and Crow’s status do not count toward enemy-clear conditions.
- **FR-029**: Introduce heavier and ranged threats progressively. Enemy attacks must give a visible warning and an opportunity to avoid damage.
- **FR-030**: Liam’s phase change must be visibly communicated, occur once, and preserve a readable dodge opportunity for each attack. Phase two must not require jumping or an unavailable ability.
- **FR-031**: Each of the two VIP cocktail tables breaks after receiving sufficient player damage and drops exactly one energy drink. Cow collects it by contact, restoring 25% of maximum health, capped at full health. Collection consumes the pickup even at full health. Crow neither breaks these tables nor collects their drops. Drops and destroyed objects reset on retry.
- **FR-032**: Use simple stylized 3D art, distinctive silhouettes, ground shadows, and clear attack poses. Cow wears a leather jacket; Crow wears an aviator jacket. Liam reads as a large club bouncer.
- **FR-033**: The venue conveys a scruffy neon rock-club atmosphere. Combat is cartoonish and non-graphic; visual effects must not obscure enemy telegraphs.
- **FR-034**: The game MUST ship with the owner-supplied soundtrack, provided during development as an MP3 or other source audio file. The shipped track MUST play on both supported browsers and remain available offline after caching. Players do not select replacement audio files.
- **FR-035**: Start audio after the player’s Start interaction. Loop the soundtrack during play, pause it when gameplay pauses, and prevent overlapping music instances on retry. Audio failure must not block gameplay.
- **FR-036**: Provide basic action, impact, damage, pickup, and result sound effects. Offer independent music/effects volume controls and a screen-shake toggle, available from title and pause settings.
- **FR-037**: Essential gameplay feedback must remain understandable with audio muted and screen shake disabled. Communicate health and readiness through shapes/text or animation as well as color.

- **FR-038**: Heavy performs one facing-directed strike with longer startup and recovery and greater per-target damage than any individual Light hit, plus knockback on eligible enemies. It has no charge gesture, health cost, or meter cost. Starting Heavy resets the Light combo. It obeys the same range, depth, once-per-target, actionable-state, and breakable-damage rules as Light; it grants no invulnerability or recovery cancel.
- **FR-039**: Show four labelled buttons in a right-hand diamond: Special above, Light left, Heavy right, and Dodge below. Light and Dodge occupy the easiest thumb-reach positions. Buttons show press feedback; Dodge shows cooldown progress and Special shows meter progress and readiness. Labels and readiness remain understandable without color, audio, or screen shake. Controls respect safe areas without overlapping each other, the HUD, or central combat warnings.
- **FR-040**: Each action touch requests at most one action; holding or sliding between buttons does not repeat attacks or trigger another button. At most one unexpired follow-up is buffered. The latest eligible request replaces it; requests in the same input sample use Special, Dodge, Heavy, then Light priority. Unavailable requests give feedback without displacing a valid buffered request or spending resources. Actions do not interrupt active startup, execution, or recovery. Cancellation clears requests from that touch; pause, backgrounding, focus loss, portrait rotation, results, and retry clear all active and buffered inputs. Resume requires fresh input.

#### Level and encounter baseline

Cow moves horizontally and along arena depth. Landscape gameplay uses an always-visible fixed joystick on the left and four labelled buttons in a diamond on the right: Special above, Light left, Heavy right, Dodge below. Light and Dodge receive the most accessible thumb positions. HUD interactions take precedence over movement activation. Controls must respect screen safe areas and remain reachable without obscuring the central combat space.

| Area | Provisional composition | Active-time budget |
| --- | --- | --- |
| Dance floor | Wave 1: 3 Grunts; wave 2: 2 Grunts and 1 Zoner | 45–60 seconds |
| VIP lounge | Wave 1: 2 Zoners and 2 Grunts; wave 2: 1 Enforcer and 2 Grunts; 2 breakable tables | 50–65 seconds |
| Backstage corridor | 2 Enforcers and 2 Zoners | 35–45 seconds |
| Alley exit | Liam, two phases, no reinforcements | 50–70 seconds |
| Travel/transitions | Short travel and boss introduction | 10–20 seconds |

Preserve all four areas and the enemy roles when tuning counts. These budgets total 190–260
seconds; they are not enforced timers. Required enemy behavior:

- Raver Grunts approach and use short telegraphed melee attacks with visible hit reactions.
- Bartender Zoners maintain distance when possible and throw visible, dodgeable projectiles; retreat never makes them unreachable.
- Club Enforcers telegraph shoulder charges with a punishable recovery.
- Liam uses a long-range rope swing and close-range strike in phase one; below half health, he adds the telegraphed dodgeable shockwave. The phase change happens once. No attack requires a jump or a grapple escape.

Provisional starting values remain 150 ms input buffering, a 15% joystick deadzone, a fixed joystick
radius of 60 CSS pixels, 72 CSS pixels for Light, 56 CSS pixels
for Heavy/Dodge/Special, 200 ms dodge invulnerability, and at most two concurrent enemy attackers.
These are supplied product tuning baselines, not a choice of engine or rendering technique.
Bovine Spin has no health cost or team meter and remains available after Crow falls.

### Mobile Quality and Validation *(mandatory)*

- **NFR-001**: Support mobile Safari on iOS and Chrome on Android, in browser tabs and installed mode where supported. Record tested browser and OS versions with acceptance results.
- **NFR-002**: Use iPhone 12 and Pixel 6 as default reference devices. Target 60 fps and require at least 30 fps during the busiest encounter on both devices, assessed during a complete run.
- **NFR-003**: Landscape controls and HUD must respect safe areas and browser resizing. Portrait orientation pauses play and displays a rotate-device prompt. Returning to landscape does not automatically resume combat.
- **NFR-004**: When the page becomes hidden or loses focus, pause simulation, run timing, and audio, clear active inputs, and require an explicit Resume action. Reloading or browser termination returns to the title screen; in-progress runs are not saved.
- **NFR-005**: Players MUST be able to install the game where their browser supports installation, without needing installation for browser play. The deployed game MUST be available through a secure web connection. Its release build MUST support future AWS static hosting without a game application server or changes to gameplay code.
- **NFR-006**: Cache the complete playable build, including models, textures, sound effects, and soundtrack. Show offline readiness only once caching succeeds. Afterward, the player can launch and complete a run offline while browser data remains available.
- **NFR-007**: If required loading fails, show an actionable retry state. If offline caching fails, do not claim offline readiness; allow play if required runtime assets loaded successfully. Apply game updates between runs, never during active gameplay.
- **NFR-008**: Persist music/effects settings, screen-shake preference, completed tutorial prompts, and best successful completion time locally. Missing or unavailable storage uses defaults and must not prevent play.
- **NFR-009**: No account, backend service, or network connection is needed during a cached run. Do not require remote telemetry for prototype evaluation.

#### Validation responsibilities

Automated tests must be written and observed failing before implementing automatable behavior,
in accordance with the constitution. Device procedures must be defined before the associated
visual or browser behavior is implemented. No test results are claimed by this specification.

| Coverage | Required verification |
| --- | --- |
| Input, facing, combo buffering, hit rules, damage protection, dodge, meter, AI decisions, waves, boss phase, terminal state, pickups, reset, timing, and local preferences | Automated behavior/regression tests, including negative and boundary cases |
| Loading failures, lost touches, pause/resume, orientation, storage failure, offline preparation, and updates | Automated integration checks where feasible, plus supported-browser checks |
| Touch ergonomics, safe areas, telegraphs, art readability, mute/no-shake feedback, and soundtrack behavior | Manual checks on both reference phones with OS/browser versions recorded |
| Installation and complete offline replay | Online preparation followed by closed-game relaunch without connectivity; complete and retry in browser and installed modes where supported |
| Performance | Record frame timing and visible stalls through a full run and the busiest encounter on both reference phones; validate NFR-002 |
| Casual-player outcomes | Five-player evaluation described in Success Criteria, with manual observations and ratings |

All mobile quality areas apply. Reference phones are iPhone 12 with Safari and Pixel 6 with
Chrome. Emulation supplements but does not replace device acceptance.

#### Requirement-to-scenario coverage

Each row identifies the primary acceptance scenarios; scenarios can cover multiple requirements.
AC-001 through AC-021 retain their PRD meaning, with additional explicit Given/When/Then detail.

| Requirements | Scenarios |
| --- | --- |
| FR-001, FR-002, FR-007 | AC-012, AC-020, AC-025, AC-022 |
| FR-003, FR-004, FR-005 | AC-009, AC-010, AC-011, AC-012, AC-029 |
| FR-006 | AC-001 |
| FR-009, FR-038, FR-039, FR-040 | AC-035, AC-036, AC-037, AC-038, AC-039 |
| FR-008, FR-009, FR-010, FR-011 | AC-002, AC-022 |
| FR-012, FR-013, FR-014, FR-015 | AC-003, AC-005, AC-006, AC-009, AC-023 |
| FR-016, FR-017, FR-018, FR-019 | AC-004, AC-007, AC-024 |
| FR-020, FR-021, FR-022, FR-023, FR-024, FR-025 | AC-009, AC-014, AC-026, AC-028 |
| FR-026, FR-027, FR-028, FR-029, FR-030 | AC-008, AC-011, AC-027 |
| FR-031 | AC-012, AC-013, AC-028 |
| FR-032, FR-033 | AC-031 |
| FR-034, FR-035, FR-036, FR-037 | AC-016, AC-030, AC-034 |
| NFR-001, NFR-002, NFR-003 | AC-015, AC-018, AC-033 |
| NFR-004 | AC-015, AC-029, AC-032 |
| NFR-005, NFR-006, NFR-007, NFR-009 | AC-019, AC-020, AC-021, AC-033, AC-034 |
| NFR-008 | AC-001, AC-017, AC-029 |

### Key Entities *(include if feature involves data)*

- **Player/run**: A current attempt with active elapsed time, pause status, current area/wave, and one victory or defeat result; no partial-run persistence.
- **Cow**: Player position, facing, health, current action, protection/cooldown state, combo progress, and special-meter readiness.
- **Crow**: Partner position, health, target/follow behavior, and active or knocked-out status. Knockout lasts until a new run.
- **Enemy**: Role, position, health, attack state, and target; Liam additionally has a one-way phase transition.
- **Encounter**: Ordered arena and wave content, reachable bounds, camera lock, and completion state.
- **Breakable/pickup**: Each table’s intact/broken state and its single drink’s available/collected state.
- **Preferences/tutorial progress**: Independent audio levels, shake preference, and completed prompts local to the browser.
- **Best result**: The fastest successful active completion time; failed attempts never replace it.
- **Offline availability**: Whether all content for the current playable version is available locally; readiness is lost if required browser data disappears.
- **Game content and tuning**: Character/environment presentation, soundtrack/effects, encounter composition, and adjustable combat/control values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 4 of 5 players move and perform a Light attack within 30 seconds of gaining control, without verbal coaching.
- **SC-002**: At least 4 of 5 players complete the level within three attempts.
- **SC-003**: At least 4 of 5 players record a first successful run lasting 3–5 minutes of active gameplay. Players who do not finish do not satisfy this criterion.
- **SC-004**: At least 4 of 5 players rate both control responsiveness and combat readability at least 4/5. Ask the two ratings separately.
- **SC-005**: All acceptance scenarios pass, including solo completion after Crow’s knockout and complete offline replay.
- **SC-006**: Both reference devices meet the performance requirement during a complete run. Record frame timing and any visible stalls.

- **SC-007**: At least 4 of 5 players correctly demonstrate Light, Heavy, directed Dodge, and ready Special within two minutes after receiving their contextual prompts, without verbal coaching. Record each action separately.

For SC-007, start the two-minute window after the final relevant prompt with a reachable enemy and sufficient meter for Special; gameplay or a prepared encounter may provide these prerequisites.

SC-005 covers all 39 scenarios in this specification, including the original 21 PRD scenarios and five control-revision scenarios.
SC-006 targets 60 fps and requires at least 30 fps in the busiest encounter during a complete
run on both reference phones. The technical plan must define a repeatable measurement procedure.

Recruit five casual action players for a formative evaluation. Each receives at most three
attempts and no verbal control coaching. Record time to first movement and Light, each action demonstration under SC-007, attempt
count, first successful active-run duration, Crow survival, recurring confusion, and separate
1–5 responsiveness/readability ratings. At least four must meet each SC-001 through SC-004
threshold. The same four need not satisfy every criterion. Players who do not finish fail
the completion-time criterion. Record device/browser versions; do not claim statistical market
validation from this small sample. No remote analytics are required.

## Assumptions

- This is a single-player, landscape, mobile-web prototype. The MVP baseline has four prioritized stories; feature 002 revises its controls. Native wrapping remains deferred.
- The original PRD IDs remain authoritative. AC-022–034 clarify the original requirements; AC-035–039 cover the explicitly approved controls revision and new Heavy attack.
- To make “modest support” observable, Crow’s damage is lower than Cow’s basic-attack damage over equal active attack time against equivalent targets. This comparison is an adopted acceptance interpretation; exact damage values remain tunable.
- A new run resets all combat state but keeps available local settings, completed prompts, and best time. Equal or slower successful times do not replace the fastest time. No account or cross-device sync exists.
- Missing/corrupt local preferences fall back to playable defaults; missing results mean no recorded best time. Initial audio levels are audible and adjustable, and shake can be disabled; exact initial volume levels are presentation tuning.
- First use and initial offline preparation require connectivity. Later offline play depends on retained browser data and cannot be guaranteed after eviction or deletion.
- The owner supplies a distributable soundtrack before final audio acceptance. Placeholder art/audio can support earlier increments. Source music may be converted for supported playback without adding a player file picker.
- Both reference phones must be available for final device validation. Lack of hardware or the supplied soundtrack is a visible acceptance dependency, not permission to report unperformed checks as passing.
- Future production hosting is AWS. Compatibility is required now; provisioning, account/region/domain selection, and publishing are future deployment work. Validate the static release locally now and repeat installation, offline replay, and update checks on the eventual AWS HTTPS origin.
- Technical choices must preserve AWS static-hosting compatibility. Engine, packages, internal interfaces, asset workflow, tuning, and performance tools remain technical-plan decisions within the accepted product scope.
