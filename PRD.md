# Streets of Rock — MVP Product Requirements

**Version:** 2.1

**Status:** Agreed prototype scope; revised controls specified, pending technical planning and implementation

**Updated:** 2026-09-27

**Delivery:** Mobile browser and installable progressive web app (PWA)  
**Working title:** Streets of Rock

## 1. Product vision

Streets of Rock is a mobile-first, arcade-style belt-scrolling beat ’em up featuring stylized cartoon heroes. Its first playable prototype must prove that touchscreen movement, readable combat, and an AI companion can make one short level satisfying to learn and replay.

The MVP is **one complete 3–5 minute level**, Bondi Beach: a scruffy neon rock venue spanning a dance floor, VIP lounge, backstage corridor, and alley exit. The player controls Cow, a sturdy brawler, with vulnerable AI partner Crow. Defeating Liam the Head Bouncer completes the level.

The audience is casual action players. Difficulty should let a new player learn through play, recover from mistakes, and recognize why an attack hit them. The boss provides a clear final challenge without requiring advanced fighting-game inputs.

### Product pillars

1. **Responsive touch combat:** Simultaneous movement and actions, readable feedback, and forgiving input buffering.
2. **A visible partnership:** Crow contributes useful support and can be lost during a run; Cow remains capable of winning alone.
3. **Distinct character identity:** A muscular cow in a leather jacket and a quick crow in an aviator jacket, expressed through simple stylized 3D models and readable animation.
4. **A complete short session:** Immediate entry, escalating encounters, a boss, a result, and a fast retry.
5. **Mobile web access:** Play through a browser link, install where supported, and replay offline after caching.

## 2. Scope and requirement conventions

Requirements identified by `FR`, `NFR`, and `SC` describe MVP obligations. Values explicitly marked **provisional** are starting points for playtesting, not immutable balance requirements. Future features must not be inferred as MVP dependencies.

### Included

- One playable character: Cow; one fixed AI partner: Crow.
- Simple stylized 3D characters and scenery with a fixed-angle, horizontally tracking camera.
- Horizontal and depth movement, visible fixed joystick, three-hit Light combo, Heavy strike, Dodge, and Bovine Spin Special.
- Four connected combat areas, three common enemy roles, and a two-phase boss.
- Two breakable tables and one deterministic healing-pickup type.
- Title, contextual onboarding, HUD, pause/settings, victory, defeat, and retry flows.
- Owner-supplied soundtrack, basic combat sound effects, and local settings/results.
- Installation support where available and complete offline replay after successful caching.

### Deferred

Character selection; playable Crow, Lion, and Plates; multiplayer; jumping and aerial combat; grapples; directional special attacks; rear strikes; simultaneous-button gestures; weapons; random loot; revives; team special cinematics; boss summons; additional levels; upgrades; accounts; leaderboards; remote analytics; monetization; native app distribution and Capacitor packaging.

Production-quality art and an automated Blender pipeline are not acceptance requirements. The technical stack is selected during SpecKit planning.

## 3. Player journey and session rules

| ID | Requirement |
| --- | --- |
| FR-001 | The player can enter the level from a title screen with a Start action after required assets load. Loading progress and failure/retry states must be visible. |
| FR-002 | A new run starts Cow and Crow alive at full health, with an empty special meter and reset enemies, pickups, objects, and encounter state. |
| FR-003 | Defeating Liam wins the level. Cow reaching zero health loses the run regardless of Crow’s status. If both occur in the same simulation step, defeat takes precedence. |
| FR-004 | Victory and defeat stop combat and offer full-level retry and return to title. There is no checkpoint or countdown failure. |
| FR-005 | Victory shows completion time and best successful time. Measure active gameplay from player control becoming available until victory; exclude loading, pauses, and result screens. |
| FR-006 | The first encounter teaches movement and Light with short contextual prompts. Introduce Heavy during that encounter and Dodge and Special as they become relevant. Prompts must not require a separate tutorial level or block essential controls. Returning players with completed legacy attack prompts must still receive the new Heavy prompt; completing it persists when storage is available. |
| FR-007 | The HUD shows Cow health, Crow health/knockout status, special-meter readiness, and pause. Show Liam’s health during the boss encounter. |

**Session-length definition:** The 3–5 minute target applies to successful full runs. A slower player may continue beyond five minutes without penalty. Failed attempts are not included in completion-time targets.

## 4. Movement, controls, and combat

### Touch layout

Landscape gameplay uses an always-visible fixed joystick on the left and four labelled buttons in a diamond on the right: Special above, Light left, Heavy right, Dodge below. Light and Dodge receive the most accessible thumb positions. HUD interactions take precedence over movement activation. Controls must respect screen safe areas and remain reachable without obscuring the central combat space.

| ID | Requirement |
| --- | --- |
| FR-008 | Cow moves horizontally and along arena depth. Movement stays within walkable arena and camera bounds. There is no player-controlled jump. |
| FR-009 | The fixed-position joystick is visible before any touch during active landscape gameplay, with an outer ring and a centred thumb knob. A touch beginning inside the ring controls movement relative to its centre, with a deadzone. The knob follows the drag up to the ring boundary; dragging beyond it continues movement at maximum input without moving the anchor. Releasing or canceling the controlling touch immediately stops movement and centres the knob. |
| FR-010 | Movement and action touches work simultaneously. Buttons remain usable while the joystick is held; canceled touches cannot leave an action or movement held. |
| FR-011 | Horizontal movement determines facing; vertical-only movement preserves facing. Attacks use the established facing direction. Cow initially faces the direction of progression. |
| FR-012 | Repeated Light taps perform a three-hit combo with a knockback finisher. A missed continuation window resets the next Light attack to the first hit. Buffered actions must not accumulate into an uncontrolled sequence. |
| FR-013 | Dodge moves in the current joystick direction or, with neutral input, the facing direction. It has a visible cooldown and a short invulnerability window. |
| FR-014 | Successful damaging Light and Heavy attacks against enemies fill one special meter, capped at full. Misses, table damage, and Bovine Spin do not fill it. At full meter, Special activates Bovine Spin, damages nearby enemies, knocks them back, and empties the meter. Crow’s attacks and status do not control availability. |
| FR-015 | Unavailable actions give clear feedback and consume no resources. Actions require Cow to be alive and in an actionable state. |
| FR-016 | Attack hits require both range and arena-depth alignment. A single strike can damage each eligible target at most once. |
| FR-017 | Successful hits produce readable visual and sound feedback. Cow receives brief protection after taking damage to prevent unavoidable repeated hits. |
| FR-018 | Enemy attack coordination limits simultaneous attackers. Other enemies wait or reposition instead of all attacking at once. |
| FR-019 | Cow and Crow do not damage or body-block each other. Collision and avoidance must not trap either ally or prevent encounter completion. |
| FR-038 | Heavy performs one facing-directed strike with longer startup and recovery and greater per-target damage than any individual Light hit, plus knockback on eligible enemies. It has no charge gesture, health cost, or meter cost. Starting Heavy resets the Light combo. It obeys the same range, depth, once-per-target, actionable-state, and breakable-damage rules as Light; it grants no invulnerability or recovery cancel. |
| FR-039 | Show four labelled buttons in a right-hand diamond: Special above, Light left, Heavy right, and Dodge below. Light and Dodge occupy the easiest thumb-reach positions. Buttons show press feedback; Dodge shows cooldown progress and Special shows meter progress and readiness. Labels and readiness remain understandable without color, audio, or screen shake. Controls respect safe areas without overlapping each other, the HUD, or central combat warnings. |
| FR-040 | Each action touch requests at most one action; holding or sliding between buttons does not repeat attacks or trigger another button. At most one unexpired follow-up is buffered. The latest eligible request replaces it; requests in the same input sample use Special, Dodge, Heavy, then Light priority. Unavailable requests give feedback without displacing a valid buffered request or spending resources. Actions do not interrupt active startup, execution, or recovery. Cancellation clears requests from that touch; pause, backgrounding, focus loss, portrait rotation, results, and retry clear all active and buffered inputs. Resume requires fresh input. |

### Provisional control and balance values

| Parameter | Starting point | Tuning intent |
| --- | --- | --- |
| Input buffer | 150 ms | Accept a near-timed follow-up without repeated unintended actions. |
| Joystick deadzone | 15% of radius | Ignore small accidental finger motion. |
| Joystick radius | 60 CSS pixels; fixed anchor | Keep the movement control visible and predictable. |
| Light button | 72 CSS pixels | Make the most frequent action easiest to reach. |
| Heavy, Dodge, and Special buttons | 56 CSS pixels each | Keep secondary actions distinct and accessible. |
| Dodge invulnerability | 200 ms | Reward deliberate evasion of telegraphed attacks. |
| Concurrent enemy attackers | At most two | Preserve pressure while giving the player readable response windows. |

Damage, health, attack timings, recovery, knockback, post-hit protection, dodge cooldown, meter gain, movement speed, and hit alignment are configurable tuning data. Choose initial values during implementation and adjust against the acceptance targets. The previous STR/SPD/DEF/RNG formulas and HP tables are not binding: large hero health pools relative to enemy damage could eliminate the intended challenge.

The control revision is defined in [002-revised-controls](specs/002-revised-controls/spec.md), replacing the original floating joystick and three-button layout. Exact spacing, sizes, damage, and timing remain provisional; Heavy’s slower, stronger identity is required. Physical controller support, remapping, automatic attacks, and gesture controls are deferred.

Combat must remain beatable with Cow alone. Bovine Spin has no health cost, separate team activation, or dependence on a Crow meter.

## 5. Crow’s AI and survival

| ID | Requirement |
| --- | --- |
| FR-020 | Crow follows Cow between encounters, stays within the playable camera region, and attacks automatically during combat. |
| FR-021 | Crow prioritizes nearby threats attacking Cow, then reachable ranged threats, then other nearby enemies. Following Cow takes priority when separation would leave Crow behind. |
| FR-022 | Crow takes enemy damage. At zero health, he visibly becomes inactive for the remainder of the run; his body cannot block movement or absorb further attacks. |
| FR-023 | Crow’s knockout does not end the run, block wave completion, remove Cow’s special, or prevent progression. Retry restores Crow. |
| FR-024 | Crow recovers from obstruction or excessive separation. Recovery must not damage enemies, revive him, or lock an encounter. |
| FR-025 | Crow provides modest support rather than reliably completing encounters without player attacks. He does not collect healing items or use a separate special ability. |

## 6. Bondi Beach level

### Encounter sequence

Retain this composition as the initial playtest baseline. Counts and timing budgets are provisional; preserve the four-area progression and distinct enemy roles when tuning.

| Area | Encounter content | Active-time budget |
| --- | --- | --- |
| Dance floor | Wave 1: 3 Raver Grunts. Wave 2: 2 Grunts and 1 Bartender Zoner. Introduce movement and attacks. | 45–60 seconds |
| VIP lounge | Wave 1: 2 Zoners and 2 Grunts. Wave 2: 1 Club Enforcer and 2 Grunts. Include 2 breakable cocktail tables. | 50–65 seconds |
| Backstage corridor | 2 Enforcers and 2 Zoners in one short encounter. | 35–45 seconds |
| Alley exit | Liam the Head Bouncer, two phases, no summoned reinforcements. | 50–70 seconds |
| Travel and transitions | Brief movement between areas and boss introduction. | 10–20 seconds |

These budgets total approximately 190–260 seconds and leave room for player variation within the 3–5 minute target. Result-screen viewing time is excluded.

| ID | Requirement |
| --- | --- |
| FR-026 | Entering a combat area locks the camera and forward progression. The camera angle stays fixed while tracking horizontal progression between areas. |
| FR-027 | Spawn the next wave only after all enemies in the current wave are defeated. Clear the area only after its final wave; unlock progression and display a visible “GO” cue. |
| FR-028 | Enemies and pickups remain reachable. Breakable objects and Crow’s status do not count toward enemy-clear conditions. |
| FR-029 | Introduce heavier and ranged threats progressively. Enemy attacks must give a visible warning and an opportunity to avoid damage. |

### Enemy and boss behavior

| Enemy | Role | Required behavior |
| --- | --- | --- |
| Raver Grunt | Close-range pressure | Approaches and uses a short telegraphed melee attack; reacts clearly to hits. |
| Bartender Zoner | Ranged pressure | Keeps distance where space permits and throws visible, dodgeable projectiles. Retreat cannot make the enemy unreachable. |
| Club Enforcer | Heavy threat | Uses a telegraphed shoulder charge with a clearly punishable recovery. |
| Liam, phase one | Final encounter | Uses a long-range rope swing and close-range strike. |
| Liam, phase two | Escalation | Below half health, adds a telegraphed ground shockwave with a safe dodge opportunity. No grabs or reinforcements. |

**FR-030:** Liam’s phase change must be visibly communicated, occur once, and preserve a readable dodge opportunity for each attack. Phase two must not require jumping or an unavailable ability.

### Breakables and pickups

**FR-031:** Each of the two VIP cocktail tables breaks after receiving sufficient player damage and drops exactly one energy drink. Cow collects it by contact, restoring 25% of maximum health, capped at full health. Collection consumes the pickup even at full health. Crow neither breaks these tables nor collects their drops. Drops and destroyed objects reset on retry.

This replaces the conflicting drink, pizza, kebab, and bottle lists. No random drops or usable weapons are required.

## 7. Art, audio, and settings

| ID | Requirement |
| --- | --- |
| FR-032 | Use simple stylized 3D art, distinctive silhouettes, ground shadows, and clear attack poses. Cow wears a leather jacket; Crow wears an aviator jacket. Liam reads as a large club bouncer. |
| FR-033 | The venue conveys a scruffy neon rock-club atmosphere. Combat is cartoonish and non-graphic; visual effects must not obscure enemy telegraphs. |
| FR-034 | Package an owner-supplied soundtrack as a replaceable development asset. Convert the supplied MP3 or other source file into a format supported by target browsers. Include the shipped music in offline caching. |
| FR-035 | Start audio after the player’s Start interaction. Loop the soundtrack during play, pause it when gameplay pauses, and prevent overlapping music instances on retry. Audio failure must not block gameplay. |
| FR-036 | Provide basic action, impact, damage, pickup, and result sound effects. Offer independent music/effects volume controls and a screen-shake toggle, available from title and pause settings. |
| FR-037 | Essential gameplay feedback must remain understandable with audio muted and screen shake disabled. Communicate health and readiness through shapes/text or animation as well as color. |

There is no runtime audio-file picker and no rhythm-based combat. The owner supplies a distributable track before soundtrack acceptance; a temporary loop may support earlier development.

## 8. Mobile browser and PWA behavior

| ID | Requirement |
| --- | --- |
| NFR-001 | Support mobile Safari on iOS and Chrome on Android, in browser tabs and installed mode where supported. Record tested browser and OS versions with acceptance results. |
| NFR-002 | Use iPhone 12 and Pixel 6 as default reference devices. Target 60 fps and require at least 30 fps during the busiest encounter on both devices, assessed during a complete run. |
| NFR-003 | Landscape controls and HUD must respect safe areas and browser resizing. Portrait orientation pauses play and displays a rotate-device prompt. Returning to landscape does not automatically resume combat. |
| NFR-004 | When the page becomes hidden or loses focus, pause simulation, run timing, and audio, clear active inputs, and require an explicit Resume action. Reloading or browser termination returns to the title screen; in-progress runs are not saved. |
| NFR-005 | Provide a web app manifest and installation support where available. Installation is optional for browser play. Serve the deployed PWA over HTTPS. The release must support future AWS static hosting without a game application server or gameplay-code changes; provisioning and publishing are future deployment work. |
| NFR-006 | Cache the complete playable build, including models, textures, sound effects, and soundtrack. Show offline readiness only once caching succeeds. Afterward, the player can launch and complete a run offline while browser data remains available. |
| NFR-007 | If required loading fails, show an actionable retry state. If offline caching fails, do not claim offline readiness; allow play if required runtime assets loaded successfully. Apply game updates between runs, never during active gameplay. |
| NFR-008 | Persist music/effects settings, screen-shake preference, completed tutorial prompts, and best successful completion time locally. Missing or unavailable storage uses defaults and must not prevent play. |
| NFR-009 | No account, backend service, or network connection is needed during a cached run. Do not require remote telemetry for prototype evaluation. |

Browser-controlled storage can be cleared or evicted. Offline availability is conditional on retaining the cached build; it is not a permanent-storage guarantee.

### Minimum product data and interfaces

- **Run state:** Cow/Crow health and activity, special meter, current encounter, enemy/object/pickup state, elapsed active time, pause state, and terminal result.
- **Persistent preferences/results:** Two volume levels, screen-shake setting, completed tutorial prompts, and best successful time.
- **Tuning data:** Combat values, AI limits, encounter composition, and pickup effects, separated from product acceptance requirements.
- **Asset inputs:** Character/environment assets, animation, effects, and a replaceable bundled soundtrack.

No public network API is required. Engine choice, code types, serialization, render coordinates, cache implementation, and asset pipeline belong in SpecKit technical planning.

## 9. Prioritized player stories and acceptance scenarios

### US-001 — Learn and use touch combat (P1)

As a casual player, I can move and fight immediately so that the game feels understandable and responsive.

**Independent evaluation:** A single test encounter supports movement, Light combo, Heavy, Dodge, Special, damage, and onboarding.

- **AC-001:** Given a first run, when control starts, then movement and Light prompts appear contextually without blocking play, followed by Heavy in the first encounter and Dodge/Special when relevant. Completed prompts remain completed after a normal reload when storage is available; legacy completion does not suppress the new Heavy prompt. (FR-006, NFR-008)
- **AC-002:** Given an active joystick touch, when another finger taps Light, Heavy, Dodge, or Special, then the requested available action executes while movement input remains correctly tracked. Canceling either touch does not leave it stuck. (FR-009–012)
- **AC-003:** Given an attack nearing recovery, when a follow-up is entered within the configured buffer, then it executes once at the next valid opportunity; expired input does not execute later. (FR-012)
- **AC-004:** Given an enemy outside attack depth, when Cow attacks, then it takes no damage. Given a valid overlap, that strike damages it only once. (FR-016)
- **AC-005:** Given a ready dodge, when an attack overlaps its invulnerability window, then Cow takes no damage from that attack. Repeated input during cooldown does not grant another dodge. (FR-013, FR-015)
- **AC-006:** Given a full meter, when Special is pressed in an actionable state, then Bovine Spin fires once and empties the meter. An incomplete meter causes no attack or resource loss. (FR-014–015)
- **AC-007:** Given Cow has just taken damage, when another hit arrives during post-hit protection, then that hit does not reduce health. (FR-017)

- **AC-035:** Given active landscape gameplay before any touch, when the player views and drags the joystick, then its ring and knob are visible, the fixed anchor stays in place, the knob tracks within the ring, and release or cancellation centres it and stops movement. Touches outside the ring do not start movement. (FR-009)
- **AC-036:** Given Cow is actionable, when Heavy is tapped, then one slower, stronger strike occurs without health or meter cost and the next Light begins at hit one. Holding Heavy does not repeat it; its recovery cannot be canceled. (FR-012, FR-038, FR-040)
- **AC-037:** Given equivalent enemy targets, when Light and Heavy land or miss, then range/depth and once-per-target rules hold and only damaging enemy hits fill the capped meter. Table damage and Bovine Spin do not refill it. Both Light and Heavy can break tables under FR-031. (FR-014, FR-016, FR-031, FR-038)
- **AC-038:** Given either reference phone, when controls are shown with audio muted and shake disabled, then the four labels and diamond positions are clear, presses are visible, Dodge cooldown and Special readiness are understandable without color alone, and controls remain reachable within safe areas without covering combat warnings. (FR-037, FR-039, NFR-003)
- **AC-039:** Given overlapping requests or a held/sliding action touch, when inputs are resolved, then only one action and at most one unexpired follow-up are accepted under FR-040, with no unintended repetition or recovery cancel. Cancellation removes that touch’s pending request; interruptions, results, and retry clear every pending input. (FR-010, FR-012, FR-015, FR-040, NFR-004)

### US-002 — Complete and replay the level with Crow (P1)

As a player, I can fight through the venue with my companion, reach a clear result, and try again.

**Independent evaluation:** A complete run through all four areas, including companion-loss and defeat paths.

- **AC-008:** Given an active wave, when its final enemy dies, then exactly one next wave starts or the cleared arena unlocks and shows “GO.” Unbroken tables and a knocked-out Crow do not block progression. (FR-026–028)
- **AC-009:** Given Crow reaches zero health, when Cow continues, then Crow stops acting, his status is visible, and Cow can still use Special and defeat Liam. (FR-022–023)
- **AC-010:** Given Crow remains alive, when Cow reaches zero health, then combat stops and defeat offers retry. Simultaneous Cow/Liam lethal damage also produces defeat. (FR-003–004)
- **AC-011:** Given Liam crosses below half health, then the phase transition is visible and his shockwave can be avoided using the available dodge. Defeating him while Cow survives produces victory and a completion time. (FR-005, FR-030)
- **AC-012:** Given a terminal result, when Retry is selected, then both heroes, the empty meter, all encounters, objects, pickups, and elapsed time reset. (FR-002, FR-004)
- **AC-013:** Given a damaged Cow and a broken table, when Cow contacts its drink, then health increases by 25% of maximum without exceeding maximum and the pickup disappears exactly once. Crow cannot consume it. (FR-031)
- **AC-014:** Given Crow is obstructed or separated, when Cow progresses, then Crow recovers without blocking the camera or granting damage, revival, or encounter completion. (FR-020–024)

### US-003 — Play reliably on a mobile device (P1)

As a mobile player, I can recover from interruptions and understand the game with my preferred settings.

**Independent evaluation:** A representative combat encounter on both target device/browser combinations.

- **AC-015:** Given active combat, when the page loses focus, becomes hidden, or rotates to portrait, then gameplay and audio pause, inputs clear, and active time stops. Returning requires explicit Resume. (NFR-003–004)
- **AC-016:** Given music playback, when the player pauses, resumes, and retries, then audio follows gameplay state without overlapping tracks. Muting audio leaves telegraphs readable. (FR-035–037)
- **AC-017:** Given saved settings and a best time, when the game reloads, then those values return. When storage is unavailable, the game still starts and plays. (NFR-008)
- **AC-018:** Given a full run on either reference device, then essential controls stay visible and performance meets the busiest-encounter target. (NFR-001–003)

### US-004 — Install and replay offline (P2, required for MVP delivery)

As a returning player, I can launch the cached game without a network connection.

**Independent evaluation:** Cache once online, close the game, disable networking, then relaunch and complete the level.

- **AC-019:** Given successful caching, when the player relaunches offline, then the full level, soundtrack, results, and retry work without network access. Repeat in installed mode where supported. (NFR-005–006)
- **AC-020:** Given interrupted caching, then offline readiness is not displayed; retry is available. A required runtime-asset failure presents a loading error rather than an unplayable scene. (FR-001, NFR-007)
- **AC-021:** Given a new build is available during a run, then the active run keeps its current build and updates are applied only between runs. (NFR-007)

## 10. Measurable prototype success

Conduct a formative playtest with five casual action players. Record results manually. These targets guide iteration; the sample does not establish broad market validation.

| ID | Outcome |
| --- | --- |
| SC-001 | At least 4 of 5 players move and perform a Light attack within 30 seconds of gaining control, without verbal coaching. |
| SC-002 | At least 4 of 5 players complete the level within three attempts. |
| SC-003 | At least 4 of 5 players record a first successful run lasting 3–5 minutes of active gameplay. Players who do not finish do not satisfy this criterion. |
| SC-004 | At least 4 of 5 players rate both control responsiveness and combat readability at least 4/5. Ask the two ratings separately. |
| SC-005 | All acceptance scenarios pass, including solo completion after Crow’s knockout and complete offline replay. |
| SC-006 | Both reference devices meet the performance requirement during a complete run. Record frame timing and any visible stalls. |
| SC-007 | At least 4 of 5 players correctly demonstrate Light, Heavy, directed Dodge, and ready Special within two minutes after receiving their contextual prompts, without verbal coaching. Record each action separately. |

For SC-007, start the two-minute window after the final relevant prompt with a reachable enemy and sufficient meter for Special; gameplay or a prepared encounter may provide these prerequisites.

Capture time to first movement/Light and each of the four demonstrated actions, device/browser versions, attempt count, successful-run duration, recurring confusion, Crow survival, and the two ratings. Tune enemy pressure and damage before expanding content if completion or readability goals fail.

## 11. SpecKit handoff and development process

This PRD is the product input to SpecKit, not a claim of compatibility with a separate versioned schema. Use the repository’s actual specification template to derive prioritized player stories, functional requirements, edge cases, and measurable outcomes. Preserve requirement identifiers for traceability.

Recommended delivery sequence:

1. Establish the project constitution and technical plan, including the web engine, test tooling, reference-device verification, and asset workflow.
2. Build a minimal playable combat encounter with Cow, one enemy, touch controls, and deterministic combat tests.
3. Add Crow, the four-area progression, remaining enemies, boss, healing, results, and retry.
4. Complete audio/settings, mobile interruption handling, installation, caching, and offline behavior.
5. Run device acceptance and the five-player evaluation; tune until the prototype meets its goals.

Follow repository instructions: create a feature branch before changes, use test-driven development for implementation, and pass all applicable tests before committing. Write failing automated tests for deterministic gameplay behavior before implementing it; use device testing for touch usability, animation readability, browser audio, offline installation behavior, and performance. The documentation itself requires a consistency review, not a fabricated gameplay test suite.

### Explicit assumptions and dependencies

- Landscape play, the two reference phones, simultaneous-defeat precedence, deterministic energy-drink drops, and the listed provisional tuning values are adopted defaults from this PRD.
- The owner supplies the final bundled soundtrack; representative placeholder art/audio can support earlier implementation.
- Device access is needed for final acceptance. Simulators and desktop touch emulation do not substitute for reference-device performance checks.
- Selecting an engine and exact combat tuning during technical planning does not reopen the agreed product scope.
- Capacitor wrapping is a later milestone; no native plugins or platform-specific app release work are required now.

## 12. Future vision

Retain these concepts for later specifications without treating them as MVP commitments:

- **Cow:** Heavy tank/brawler; potential armor, charge, and grapple expansion.
- **Crow:** Playable speedster/aerial striker; potential double jump and dive attacks.
- **Lion:** Balanced martial-arts champion; roar and pounce identity.
- **Plates:** Anthropomorphic dinner plate with toon limbs; defensive wildcard using spins and unusual thrown objects.
- Selectable teams, coordinated team specials, additional music venues and bosses, environmental weapons, richer pickups, and longer-term progression.
- Automated Blender asset generation where it improves production, followed by native distribution using Capacitor when the web experience is established.

## References

- [Repository SpecKit specification template](.specify/templates/spec-template.md)
- [MDN: Web Audio API best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — initiate browser audio from user interaction.
- [web.dev: Service workers](https://web.dev/learn/pwa/service-workers) — offline request handling and cached resources.

#### Stuff to follow

Character skins + creator - can we make this a reusable skill?

Homepage - start, select your playable character + teammate
    Tapping should show stats, then second tap to confirm



