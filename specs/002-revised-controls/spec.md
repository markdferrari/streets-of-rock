# Feature Specification: Visible Joystick and Four-Button Combat

**Feature Branch**: `feat/revised_controls`

**Created**: 2026-09-27

**Status**: Ready for technical planning; documentation validated, revised controls not implemented

**Input**: Replace the unclear touch controls with an always-visible joystick and a console-style diamond of Light, Heavy, Dodge, and Special buttons, as agreed with the owner.

## Product Alignment *(mandatory)*

- **PRD references**: [PRD v2.1](../../PRD.md), FR-006, FR-008–017, FR-031, FR-037–040; AC-001–007, AC-012, AC-015–021, AC-035–039; NFR-001–009; SC-001–007. Requirement IDs below retain their PRD meanings.
- **Included behavior**: Discoverable fixed movement control, four labelled action buttons, existing Light combo, a distinct Heavy strike, existing directional Dodge and Bovine Spin, visible input/readiness feedback, and updated onboarding for new and returning players.
- **Deferred behavior**: Physical controller support, remapping, alternate layouts, automatic attacks, hold-to-repeat, charge attacks, mixed Light/Heavy combos, gesture controls, and additional playable characters or level content.
- **Provisional tuning**: Retain a starting joystick radius of 60 CSS pixels and 15% deadzone, 72 CSS pixels for Light and 56 for the other buttons, and 150 ms input buffering. Sizes and spacing must pass phone reach checks; the fixed anchor and diamond ordering are required. Damage, startup/recovery, knockback, and meter gain are adjustable. Heavy must retain the slower, stronger identity specified below.
- **Governance and relationship**: Follow the [constitution](../../.specify/memory/constitution.md). This is a separate feature replacing the original controls in [001-neon-velvet-mvp](../001-neon-velvet-mvp/spec.md). The one-level 3–5 minute MVP, solo viability after Crow falls, and AWS-compatible static delivery remain acceptance constraints. Existing MVP plans/tasks and results reflect earlier controls; planning this feature must reconcile affected contracts and test expectations before implementation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Recognize and operate movement immediately (Priority: P1)

As a new player, I can see where to put my movement thumb and understand how Cow responds before guessing where to touch.

**Why this priority**: The owner's reported problem is that the current movement control is not discoverable.

**Independent Test**: Start a representative encounter on either phone and move Cow without needing an enemy or advanced attack.

**Acceptance Scenarios**:

1. **CTRL-AC-001**: Given active landscape gameplay before touching the screen, when controls appear, then the left joystick ring and centred knob are visible alongside four labelled buttons: Special above, Light left, Heavy right, Dodge below. (FR-009, FR-039; PRD AC-035, AC-038)
2. **CTRL-AC-002**: Given a touch beginning inside the joystick ring, when it moves inside the deadzone, outside the deadzone, and beyond the ring, then input is respectively neutral, directional, and capped at maximum; the knob follows within the ring and its anchor does not move. Release or cancellation stops movement and centres the knob. (FR-009; PRD AC-035)
3. **CTRL-AC-003**: Given an active movement touch, when another touch operates any available action, then movement input stays tracked. A second movement touch does not steal control; releasing the original does not transfer control to an already-held finger. Touches beginning outside the ring, including on the HUD, do not activate movement. (FR-009–010; PRD AC-002, AC-035)
4. **CTRL-AC-004**: Given landscape play, when movement changes horizontally, only along depth, or reaches an arena boundary, then facing follows horizontal input and persists for depth-only input, and Cow remains in bounds. (FR-008, FR-011; MVP AC-022)

### User Story 2 - Choose between quick and committed attacks (Priority: P1)

As a player, I can choose quick Light combos or a slower Heavy strike with a clear payoff and recovery cost.

**Why this priority**: The new button must provide an understandable combat choice while preserving the existing Light combo.

**Independent Test**: Use equivalent targets and a breakable table in a representative encounter; compare attacks, recovery, combo progress, and meter gain.

**Acceptance Scenarios**:

1. **CTRL-AC-005**: Given Cow is actionable, when three Light taps meet the continuation windows, then a three-hit combo ends in knockback. A missed window restarts at hit one. Holding a button or dragging onto another button never repeats or switches the action. (FR-012, FR-040; PRD AC-003, AC-039; MVP AC-023)
2. **CTRL-AC-006**: Given equivalent targets and Cow in an actionable state, when Heavy is tapped, then it executes once, has longer startup and recovery and more per-target damage than each individual Light hit, and knocks back eligible enemies without spending health or meter. Starting it resets the Light combo; the next Light is hit one. No input cancels its startup, strike, or recovery. (FR-038, FR-040; PRD AC-036)
3. **CTRL-AC-007**: Given enemies in and out of range/depth and a table, when Light or Heavy is used, then only eligible targets take damage, each at most once per strike. Both attacks can break a table, which still drops exactly one drink. Enemy damage fills the capped meter; misses, table damage, and Bovine Spin do not. (FR-014, FR-016, FR-031, FR-038; PRD AC-004, AC-037)
4. **CTRL-AC-008**: Given Cow is recovering, when follow-up requests arrive, then only one unexpired eligible request can wait. The latest replaces the earlier one; same-sample requests select Special, Dodge, Heavy, then Light. Unavailable requests give feedback without spending resources or displacing a valid buffered request. Expired or canceled requests never execute later. (FR-012, FR-015, FR-040; PRD AC-003, AC-039)
5. **CTRL-AC-009**: Given a new player or a returning player with legacy attack prompts completed, when the first encounter is played, then Heavy receives its own nonblocking introduction. New players also learn movement and Light; Dodge/Special prompts appear when relevant. Completing Heavy persists across reload when storage works; absent or unavailable storage permits play with default prompts. (FR-006, NFR-008; PRD AC-001, AC-017)

### User Story 3 - Use defensive and special actions confidently (Priority: P1)

As a player, I can reach Dodge and Special while moving and understand whether they are ready, including after an interruption.

**Why this priority**: Four buttons must remain practical on a phone and retain understandable combat feedback.

**Independent Test**: Use a telegraphed enemy and a full special meter on both phones, with sound muted and shake disabled; separately exercise interruptions and retry.

**Acceptance Scenarios**:

1. **CTRL-AC-010**: Given a ready Dodge, when tapped with directional or neutral movement, then it follows the joystick or established facing respectively. Hits during its invulnerability do no damage; cooldown blocks another Dodge with visible feedback. (FR-013, FR-015; PRD AC-005)
2. **CTRL-AC-011**: Given a full meter and actionable Cow, when Special is tapped, then Bovine Spin occurs once and empties the meter, including after Crow is knocked out. An incomplete meter does not execute or consume resources. Meter progress and readiness are visible on the button. (FR-014–015, FR-039; PRD AC-006)
3. **CTRL-AC-012**: Given either reference phone with sound muted and shake disabled, when controls are pressed and become unavailable/ready, then labels, pressed states, Dodge cooldown, and Special progress/readiness are distinguishable without relying on color. With a normal two-thumb grip, Light and Dodge can be reached without releasing movement or repositioning the holding hand; all buttons stay inside safe areas and do not overlap each other, the HUD, or central attack warnings. (FR-037, FR-039, NFR-003; PRD AC-018, AC-038)
4. **CTRL-AC-013**: Given active movement and a pending action, when its touch is canceled, then that touch no longer contributes movement or a pending request. On pause, focus loss, backgrounding, portrait rotation, terminal result, or retry, all inputs clear and the knob centres. Returning to landscape/focus requires explicit Resume and fresh touches; retry starts with no pending action or inherited combo. Pauses exclude active time and pause audio. (FR-002, FR-040, NFR-003–004; PRD AC-012, AC-015, AC-039)

### Edge Cases

- Presses outside the joystick ring do not activate it, even if subsequently dragged across it. HUD interactions retain precedence.
- A held action finger sliding over other buttons retains its original ownership and creates no additional requests. A normal finger release preserves a valid tap request; cancellation removes an unexecuted request from that finger but does not undo an already executed hit.
- Multiple requests cannot create parallel attacks. An action can be buffered during recovery but cannot execute until Cow is actionable. Insufficient meter or Dodge cooldown produces feedback, not a hidden delayed action when readiness changes.
- Heavy can miss and still resets the combo once started; a rejected Heavy request does not reset it. Knockback respects arena bounds and enemy eligibility; it does not guarantee displacement of a boss immune to knockback.
- Heavy adds no invulnerability. Existing post-hit protection, death handling, and simultaneous Cow/Liam lethal-damage precedence remain in force.
- Resize or rotation clears active input before relocating controls. The joystick centre is fixed within the current landscape layout, not at an absolute position across different screen sizes.
- Results and pause overlays may obscure/disable gameplay controls. “Always visible” applies while active landscape gameplay is available, not over title, result, or rotate-device screens.
- Legacy tutorial completion does not imply Heavy completion. Keep existing preferences and best results; no in-progress run migration is required because reload returns to title.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-006**: The first encounter teaches movement and Light with short contextual prompts. Introduce Heavy during that encounter and Dodge and Special as they become relevant. Prompts must not require a separate tutorial level or block essential controls. Returning players with completed legacy attack prompts must still receive the new Heavy prompt; completing it persists when storage is available.
- **FR-009**: The fixed-position joystick is visible before any touch during active landscape gameplay, with an outer ring and a centred thumb knob. A touch beginning inside the ring controls movement relative to its centre, with a deadzone. The knob follows the drag up to the ring boundary; dragging beyond it continues movement at maximum input without moving the anchor. Releasing or canceling the controlling touch immediately stops movement and centres the knob.
- **FR-012**: Repeated Light taps perform a three-hit combo with a knockback finisher. A missed continuation window resets the next Light attack to the first hit. Buffered actions must not accumulate into an uncontrolled sequence.
- **FR-014**: Successful damaging Light and Heavy attacks against enemies fill one special meter, capped at full. Misses, table damage, and Bovine Spin do not fill it. At full meter, Special activates Bovine Spin, damages nearby enemies, knocks them back, and empties the meter. Crow’s attacks and status do not control availability.
- **FR-038**: Heavy performs one facing-directed strike with longer startup and recovery and greater per-target damage than any individual Light hit, plus knockback on eligible enemies. It has no charge gesture, health cost, or meter cost. Starting Heavy resets the Light combo. It obeys the same range, depth, once-per-target, actionable-state, and breakable-damage rules as Light; it grants no invulnerability or recovery cancel.
- **FR-039**: Show four labelled buttons in a right-hand diamond: Special above, Light left, Heavy right, and Dodge below. Light and Dodge occupy the easiest thumb-reach positions. Buttons show press feedback; Dodge shows cooldown progress and Special shows meter progress and readiness. Labels and readiness remain understandable without color, audio, or screen shake. Controls respect safe areas without overlapping each other, the HUD, or central combat warnings.
- **FR-040**: Each action touch requests at most one action; holding or sliding between buttons does not repeat attacks or trigger another button. At most one unexpired follow-up is buffered. The latest eligible request replaces it; requests in the same input sample use Special, Dodge, Heavy, then Light priority. Unavailable requests give feedback without displacing a valid buffered request or spending resources. Actions do not interrupt active startup, execution, or recovery. Cancellation clears requests from that touch; pause, backgrounding, focus loss, portrait rotation, results, and retry clear all active and buffered inputs. Resume requires fresh input.

Unchanged obligations incorporated from the PRD: FR-008/010/011 govern movement, simultaneous touches, and facing; FR-013/015/016/017 govern Dodge, actionable states, hit validity, and post-hit protection; FR-031 governs table drops; FR-037 governs non-color feedback. Their acceptance coverage is specified above. No new public network interface is needed.

### Mobile Quality and Validation *(mandatory)*

The following are required future verification procedures, not results. Implementation must follow test-first development for automatable behavior. Define detailed fixtures and measurement procedures during planning before implementation.

| Area and PRD references | Automated coverage and manual procedure |
| --- | --- |
| Input and combat: FR-006, FR-008–017, FR-031, FR-038–040 | Write failing deterministic tests for joystick boundaries/ownership, each action, combo reset, Heavy timing/damage, meter, hit validity, buffering, unavailable requests, cancellation, and retry. Browser checks cover labels, initial visibility, knob/pressed/readiness presentation, and tutorial persistence. Cover CTRL-AC-001–013. |
| Touch reach, safe areas, warnings, mute/no-shake: FR-037/039, NFR-001/003 | On iPhone 12 Safari and Pixel 6 Chrome, record OS/browser versions. From a normal two-thumb grip, move continuously and operate each button, check portrait/landscape transitions and browser resizing, then repeat with sound muted/shake disabled. Record missed touches, required grip changes, clipped controls, and obscured telegraphs; these observations must satisfy CTRL-AC-012. Repeat in installed mode where supported. |
| Interruptions and timing: NFR-003/004 | Automate input clearing and paused timing where feasible. On each phone, background, lose focus, rotate, pause, resume, and retry during held movement and a buffered attack. Confirm centred knob, no stale action, audio pause, stopped active timer, and explicit resume. |
| Audio and loading failures: FR-001, FR-035/036, NFR-007 | Existing activation, loading-retry, and audio-failure behavior remains required. Regression-check that input changes do not block Start/Resume or silent play; Heavy uses existing action/impact feedback categories. No new soundtrack or loading flow is introduced. |
| Storage: NFR-008 | Test legacy tutorial completion, new Heavy completion, reload, and missing/corrupt/unavailable storage. Verify settings/best results remain intact and play remains possible. |
| Offline, installation, updates: NFR-005–007/009 | After caching the revised build, close, disable networking, relaunch, complete and retry a run using all four actions. Repeat installed mode where supported. Confirm failure never claims offline readiness, and updates apply only between runs. Existing pending MVP delivery work remains a prerequisite for this final check. |
| Performance and balance: NFR-002, SC-002–006 | Run the complete level on both phones, record frame timing/stalls in the busiest encounter, and preserve 60 fps target/30 fps minimum. Exercise solo completion after Crow falls. Evaluate Heavy alongside Light; retain the 3–5 minute successful-run goal. |
| Discoverability and usability: SC-001/004/007 | With five casual action players and no verbal control coaching, time first movement/Light, then demonstrate readiness through gameplay or a prepared encounter and time all four actions after contextual prompts. Record each action, confusion, grip changes, attempts, successful duration, Crow survival, and separate responsiveness/readability ratings. |

All mobile quality gates remain applicable. A documentation checklist pass is not runtime, device, or player acceptance. Existing missing MVP features are dependencies, not waived gates.

### Key Entities *(include if feature involves data)*

- **Movement control**: Visible fixed centre, ring/deadzone, knob displacement, controlling touch, and current movement direction/magnitude.
- **Action control**: Label, diamond position, pressed feedback, and available/cooldown/meter state for Light, Heavy, Dodge, or Special.
- **Cow combat state**: Current action and recovery, Light combo progress, at most one pending action, health, facing, and shared special meter.
- **Tutorial progress**: Completed movement/Light/Dodge/Special prompts and independently completed Heavy prompt; retained locally when available.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 4 of 5 players move and perform a Light attack within 30 seconds of gaining control, without verbal coaching.
- **SC-004**: At least 4 of 5 players separately rate responsiveness and combat readability at least 4/5.
- **SC-005**: All 13 feature acceptance scenarios pass; full MVP acceptance also retains every applicable PRD scenario, including solo completion and offline replay.
- **SC-006**: Both reference phones retain the 60 fps target and at least 30 fps during the busiest encounter in a complete run, with frame timing and visible stalls recorded.
- **SC-007**: At least 4 of 5 players correctly demonstrate Light, Heavy, directed Dodge, and ready Special within two minutes after receiving their contextual prompts, without verbal coaching. Record each action separately. Begin this window after the final relevant prompt, with a reachable enemy and sufficient meter to exercise Special; gameplay or a prepared encounter may provide these prerequisites.

PRD SC-002 and SC-003 remain final balance gates: at least 4 of 5 finish within three attempts and at least 4 of 5 have a first successful run of 3–5 active minutes. Players who do not finish do not meet the duration gate. Exact damage and timing may change to meet these outcomes without changing Heavy's required identity.

## Assumptions

- This specification implements the owner's selected four-button direction; a three-button alternative is not part of this feature.
- The approved always-visible joystick is fixed, begins interaction inside its ring, and allows continued dragging outside the ring. No floating-anchor fallback is included.
- Each tap requests one action; neither automatic attacks nor hold-to-repeat is implied. Heavy is one attack, not a fourth combo hit or a charge mechanic.
- Same-sample priority extends the existing Special-before-Dodge-before-basic-attack rule with Heavy ahead of Light. Latest eligible request wins the single pending slot; unavailable requests do not erase it.
- Light/Heavy enemy hits build meter; table damage and Special do not. Heavy has no independent cooldown beyond its recovery and requires no new resource.
- A ring/knob, labels, diamond positions, and observable feedback are obligations; exact appearance and spacing are tuning within the acceptance constraints.
- The owner has confirmed access to both reference phones. No new phone or five-player results have been collected for these controls.
- No engine, hosting, account, network service, or soundtrack change is required. A temporary music loop remains authorized for development; final soundtrack acceptance retains its existing dependency.
