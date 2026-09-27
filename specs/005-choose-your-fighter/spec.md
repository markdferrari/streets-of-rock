# Feature Specification: Choose Your Fighter

**Feature Branch**: `005-choose-your-fighter`

**Created**: 2026-09-27

**Status**: Draft — specification validated; gameplay implementation and device acceptance pending

**Input**: Arcade homepage inspired by Street Fighter and classic beat ’em ups. Select a fighter and a different AI partner using separate preview and confirmation activations, then enter the level after a 3–2–1 countdown. Owner decisions: animated full-body 3D previews, Health/Power/Speed bars, shared Light/Heavy/Dodge/Special combat rules with character-specific stats and presentation.

## Product Alignment *(mandatory)*

- **PRD references**: FR-001–005, FR-007–025, FR-028, FR-031–040 and new FR-041–047; NFR-001–009; AC-004–021, AC-035–046; SC-001–008.
- **Included behavior**: Replace the title Start journey with fighter selection, partner selection, readiness feedback, countdown, and entry to Bondi Beach. Both Cow and Crow support player and AI roles. Existing settings remain reachable from the homepage.
- **Deferred behavior**: Additional production characters, unique character movesets, multiplayer, character unlocks, skins, character creation, new levels, new AI tactics, and native distribution.
- **Provisional tuning**: Exact health, basic attack damage, movement speed, bar scale endpoints, selection transition duration, portrait framing, and layout spacing are adjustable. Role correctness, three labelled comparable bars, two deliberate activations per role, and one second per countdown number are obligations.
- **Baseline revision**: This feature supersedes the fixed Cow-player/Crow-partner and title-Start assumptions in 001-neon-velvet-mvp and the fixed-role assumptions in 002-revised-controls and 004-rigged-cow-crow-gameplay. The visual identities and asset quality requirements of 003-cow-crow-models and 004 remain applicable to both roles. Earlier specs remain historical records; their unaffected behavior remains binding. PRD 2.2 and constitution 1.1.0 explicitly authorize this scope expansion.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Inspect and choose a fighter (Priority: P1)

As a player, I can recognise the roster and compare fighters before committing to the character I will control.

**Why this priority**: This is the homepage and first required step into every new selection session.

**Independent Test**: Open the homepage with the two launch characters; inspect both and confirm either without starting gameplay.

**Acceptance Scenarios**:

1. **Given** a fresh homepage, **When** it opens, **Then** Cow and Crow appear as named portrait tiles without empty placeholder slots, with neither previewed nor confirmed.
2. **Given** no preview or a different preview, **When** a portrait is activated, **Then** its name, animated full-body preview, Health/Power/Speed bars, selection frame, and “Tap again to choose” prompt (or equivalent Enter instruction) appear without confirmation.
3. **Given** a previewed fighter, **When** the same portrait is deliberately activated again, **Then** that fighter is confirmed and partner selection begins without carrying that input into the next step.
4. **Given** keyboard navigation, **When** arrows move focus, **Then** focus remains distinct from selection; the first Enter previews and a subsequent fresh Enter confirms. Holding Enter cannot confirm repeatedly.

### User Story 2 - Form a valid duo and revise it (Priority: P1)

As a player, I can choose an AI companion and correct my fighter choice before committing to a run.

**Why this priority**: The player must understand both roles and cannot start with duplicate characters.

**Independent Test**: Begin with either fighter confirmed, then inspect the other character, use Back, and complete either valid duo.

**Acceptance Scenarios**:

1. **Given** a confirmed fighter, **When** partner selection opens, **Then** “Choose Your Partner” and an AI-control explanation appear, the fighter remains visible, and its unavailable tile is labelled “Your Fighter.” No partner is previewed automatically.
2. **Given** the two-character roster, **When** the only eligible partner is activated once, **Then** their preview appears; only a second activation confirms. Activating the unavailable fighter does nothing.
3. **Given** partner selection, **When** Back is activated, **Then** all partner state clears and fighter selection returns with the previous fighter previewed but requiring confirmation again.
4. **Given** a larger roster, **When** an eligible partner preview is changed, **Then** no partner is confirmed until that newly previewed character is activated again.

### User Story 3 - Enter and replay the level with the chosen roles (Priority: P1)

As a player, I see my duo prepare, receive a predictable countdown, and control the fighter I selected.

**Why this priority**: Selection must determine real gameplay, including reversed Cow/Crow roles.

**Independent Test**: Run both role assignments through readiness, countdown, player control, partner knockout, defeat, and retry using prepared encounters where appropriate.

**Acceptance Scenarios**:

1. **Given** partner confirmation, **When** required assets are still loading, **Then** the duo is locked, both identities remain visible, and loading progress is shown without countdown or combat. Failure offers retry and retains the duo.
2. **Given** a locked duo and a ready level, **When** entry begins, **Then** 3, 2, and 1 each appear for one second with both characters visible; one run begins after 1, with no intermediate Start action.
3. **Given** either valid duo, **When** gameplay starts, **Then** the fighter receives player controls and all four actions, the partner follows and attacks automatically, both start at full health, and run time starts only when player control becomes available.
4. **Given** either role assignment, **When** the partner is knocked out, **Then** the fighter can continue, use Special, collect healing, and win alone; fighter knockout causes defeat even if the partner survives. Simultaneous fighter/boss defeat retains defeat precedence.
5. **Given** a terminal result, **When** Retry is activated, **Then** the same duo is restored through readiness and a new countdown with fully reset run state. Return to homepage or reload instead clears both choices.
6. **Given** countdown, **When** focus is lost, the page hides, or portrait orientation interrupts, **Then** countdown and audio suspend and inputs clear. Explicit Resume in supported orientation continues the remaining countdown time; gameplay never starts in the background.
7. **Given** repeated activations during loading or countdown, **When** readiness completes, **Then** exactly one countdown and one run launch occur and selection input does not trigger a combat action.

### User Story 4 - Select comfortably across devices and roster sizes (Priority: P2)

As a player, I can select characters using touch, mouse, or keyboard and understand every state with reduced motion or muted audio.

**Why this priority**: The homepage must remain usable on supported phones and as the roster grows.

**Independent Test**: Exercise selection with two characters and a twelve-entry test roster on both reference phones, then repeat with keyboard and reduced motion.

**Acceptance Scenarios**:

1. **Given** a supported landscape screen and either roster size, **When** browsing, **Then** every tile is reachable, previews and confirmation instructions remain legible, and Back/settings remain inside safe areas.
2. **Given** reduced motion, muted sound, and disabled shake, **When** selecting, **Then** previews use still poses, decorative motion is removed, and text/framing still communicate focus, preview, confirmation, and unavailability.
3. **Given** a successfully cached build, **When** launched offline, **Then** both duo assignments can complete selection, previews, countdown, gameplay, results, and retry without network access.
4. **Given** unavailable storage or audio, **When** selecting and entering the level, **Then** the flow remains usable with defaults; no saved selection is required.

### Edge Cases

- A cancelled touch or a drag used to scroll the grid does not activate a portrait. Each completed activation affects at most one selection step.
- An unexpectedly incomplete roster with fewer than two eligible characters blocks confirmation with an explanatory recovery message; duplicates are never substituted.
- Required preview or gameplay assets failing to load produce actionable retry feedback; a broken preview is not treated as ready.
- Keyboard movement cannot select the unavailable partner tile. Keyboard focus remains visible and moves to a meaningful control after each step change.
- Interruption during selection preserves choices and clears pending input; interruption during countdown preserves remaining time and requires Resume. Reload clears the entire session.
- Returning from portrait orientation cannot skip countdown numbers or automatically enter combat. Browser time spent hidden is excluded.
- Build updates may apply before selection or after a run, but cannot replace assets or reset the duo during locked preparation/countdown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The homepage MUST show a named portrait grid and initially no preview or confirmed choice. It MUST retain access to existing settings. (PRD FR-001, FR-036, FR-041)
- **FR-002**: Each role MUST require one deliberate activation to preview and another on the same tile to confirm; changing the tile MUST only change the preview. (PRD FR-041–042)
- **FR-003**: The preview MUST show name, full-body animated character, and labelled Health, Power, and Speed bars using consistent comparison scales. Health represents maximum health, Power the first basic Light strike damage, and Speed normal movement speed for that playable character. Role text MUST explain AI partners act automatically under partner rules. Stats MUST reflect current gameplay tuning, not fictitious ratings. (PRD FR-043)
- **FR-004**: Partner selection MUST retain the fighter visibly, prohibit duplicate identity, label its unavailable tile “Your Fighter,” and require explicit partner preview/confirmation even with one candidate. (PRD FR-042)
- **FR-005**: Back MUST clear the partner and restore the former fighter as a preview requiring confirmation. (PRD FR-042)
- **FR-006**: Touch and click MUST behave equivalently. Arrow keys MUST move focus within the grid and Enter MUST preview/confirm through fresh presses. Focus, preview, confirmation, and unavailability MUST remain distinguishable without colour alone. Cancellation, scrolling, and key repeat MUST NOT produce unintended selection. (PRD FR-041–042, FR-045)
- **FR-007**: Partner confirmation MUST lock the duo until launch, retaining it through loading retry. Countdown MUST wait for all required assets and level readiness, show both characters and each of 3/2/1 for one second, then launch exactly once. (PRD FR-001, FR-044)
- **FR-008**: Countdown MUST suspend on backgrounding, focus loss, or portrait rotation, require explicit Resume, and exclude interrupted time. Combat, run timing, and carried selection input MUST remain inactive until entry completes. (PRD FR-005, FR-044; NFR-003–004)
- **FR-009**: Cow and Crow MUST each support player and AI roles. The player MUST have Light, Heavy, Dodge, and Special with shared combat rules and character-specific stats/presentation. AI partners MUST retain existing follow, support attack, recovery, and knockout rules without player-only healing or a separate Special. (PRD FR-008–025, FR-031, FR-038–040, FR-046)
- **FR-010**: HUD identity, defeat, meter ownership, pickups, tutorials, and solo completion MUST follow selected roles. Cow’s player Special retains Bovine Spin presentation; Crow uses character-appropriate presentation under the same area-attack rules. (PRD FR-002–007, FR-014, FR-023, FR-031, FR-046)
- **FR-011**: Retry MUST retain the duo and repeat readiness/countdown with fully reset run state. Return to homepage and reload MUST reset selection. (PRD FR-002, FR-004, FR-047)
- **FR-012**: The grid MUST accommodate additional roster entries without changing selection rules, preserve access on small supported screens, and avoid empty launch placeholders. Future entries require complete gameplay and presentation content. (PRD FR-045)
- **FR-013**: Presentation MUST use bold arcade typography, chunky portrait frames, vivid selection outlines, dramatic previews, and brief responsive selection transitions. Reduced motion MUST replace animated previews with still poses and remove decorative motion. (PRD FR-032, FR-037, FR-043, FR-045)
- **FR-014**: Selection and entry MUST retain offline operation, actionable loading failure, nonblocking storage/audio failure, user-activated audio, and safe update behavior. No network service or persistent selection is required. (PRD FR-035–037; NFR-005–009)

### Mobile Quality and Validation *(mandatory)*

Automatable behavior requires failing regression tests before implementation; documentation itself receives consistency review. Device procedures below must be recorded before implementation and executed before acceptance.

| Area and PRD mapping | Automated acceptance | Required manual procedure |
| --- | --- | --- |
| Touch, cancellation, safe areas; FR-039–042, FR-045; NFR-001–003 | Verify fresh activation, drag/cancel, no held-key repeat, both role assignments, two/twelve-entry reachability, input clearing at entry. | On iPhone 12 Safari and Pixel 6 Chrome, browse both rosters in landscape with browser chrome resizing; inspect safe areas, labels, settings, Back, and thumb reach. Record OS/browser versions. |
| Interruptions and timing; FR-005, FR-044; NFR-003–004 | Interrupt each countdown number; assert remaining time, explicit resume, no hidden launch, and no active run time before control. | Hide, switch apps, lose focus, and rotate during selection/loading/countdown; return and explicitly resume. Confirm no input or audio leaks into combat. |
| Telegraphs, muted/no-shake, reduced motion; FR-032, FR-037, FR-043, FR-046 | Verify still preview and role-correct actions, damage, meter, HUD, pickups, defeat, and partner knockout. | With sound and shake off, inspect selection states and play each fighter; check new Crow player/Cow partner animations preserve readable attack warnings and feedback. |
| Audio, loading/storage failure, offline and updates; FR-001, FR-035, FR-047; NFR-005–009 | Test load failure/retry, unavailable storage/audio, duplicate launches, retry/reset, cached selection assets, and update deferral through countdown. | Cache online; relaunch offline and complete both duo assignments through results/retry in browser and installed modes where available. Confirm soundtrack follows pause and retry without overlap. |
| Performance and player evaluation; NFR-002; SC-001–008 | Run regressions and build checks; automated emulation is supplementary. | Record complete-run frame timing with each playable fighter on both reference phones: target 60 fps and at least 30 fps in busiest encounter. Conduct five-player evaluation below and retain existing combat/playthrough evaluation gates. |

### Key Entities *(include if feature involves data)*

- **Roster character**: Unique identity, name, portrait, full-body preview, playable stats, and the content needed for player and AI roles.
- **Selection session**: Current step, focused tile, previewed identity, confirmed fighter, and confirmed partner; no duplicate identities and no persistence across reload.
- **Prepared duo**: Locked fighter/partner assignment, readiness or failure state, remaining countdown, and interruption state.
- **Run assignment**: The duo carried into player controls, AI behavior, HUD, outcomes, and retry.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least four of five first-time casual action testers select their intended fighter and partner and reach gameplay without verbal coaching. Before starting, record each intended duo; afterward ask which character was AI controlled. At least four correctly identify that role. (PRD SC-008)
- **SC-002**: Both valid launch duos pass all selection, role assignment, partner-loss, player-defeat, and retry scenarios; zero duplicate duos or duplicate launches occur. (PRD SC-005)
- **SC-003**: Every uninterrupted countdown displays three successive one-second numbers and opens control after three seconds; loading, interruptions, and countdown add zero time to the reported run duration. (PRD FR-005, FR-044)
- **SC-004**: Every tile in two-character and twelve-character test rosters is reachable with each supported input method, with required controls and text visible inside supported landscape safe areas. (PRD FR-045; NFR-003)
- **SC-005**: Both role assignments complete cached offline selection, a full run, results, and retry on each reference phone; all required assets remain available without network access. (PRD NFR-006; SC-005)
- **SC-006**: Both reference phones meet the existing complete-run performance gate with either fighter; recorded evidence includes selection responsiveness and any preview stalls. (PRD SC-006)

## Assumptions

- Initial roster is Cow and Crow. Twelve entries are a validation fixture, not a commitment to ship ten additional characters.
- Selection replaces the homepage Start action and directly launches the existing level; no mode or stage picker is added.
- Supported phone usage remains landscape. Portrait displays the existing rotate guidance and cannot advance countdown or combat.
- Stats describe the playable character consistently in both previews; the AI-role explanation distinguishes automatic support behavior. Bar endpoints and exact combat tuning are decided during technical planning and playtesting using a shared scale per stat.
- Existing character models provide the starting artwork; new role-specific animation coverage may be needed during implementation. Distinct movesets and new production artwork are outside this specification’s commitment.
- Best time and existing preferences retain their current persistence rules; selections are session-only. Settings cannot change a locked duo.
- Required device access, animation coverage, and player evaluation are implementation acceptance dependencies, not completed evidence.
