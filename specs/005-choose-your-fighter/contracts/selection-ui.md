# UI Contract: Fighter and Partner Selection

Applies to feature FR-001–008, FR-011–014. No network API is exposed.

## Screens and controls

- Homepage heading is “Choose Your Chieftain”; preserve “Streets of Rock” branding. Partner heading is “Choose Your Partner” with “Ai-controlled companion.”
- Each tile is a native button with character name as its accessible name and portrait alt empty when the name is already adjacent. Previewed tile exposes `aria-pressed=true`; unavailable fighter tile exposes disabled state and visible “Your Fighter.”
- Native buttons live in a named roster group with roving tabindex. Tab enters at current focus and can leave to Back/settings; arrows navigate eligible tiles by their displayed row/column, clamp at edges, and scroll focused tiles into view. Enter and Space activate once per fresh key press; repeated keydown is ignored and default synthetic activation is prevented when handled.
- Focus never previews by itself. First activation previews; next activation of that same eligible portrait confirms. Input is handled through one canonical activation path, with no pointerup-plus-click double processing. Pointer movement beyond 8 CSS px or pointercancel suppresses activation; roster buttons override global touch-action to allow vertical panning.
- Preview contains name, animated full body, Health/Power/Speed meters and a live confirmation instruction. Touch/mouse show “Tap again to choose”; keyboard shows “Press Enter again to choose.” Meter accessible values come from actual playable tuning. Partner screen explains “Your partner attacks automatically.”
- Partner Back returns to the prior fighter preview requiring confirmation. With two characters the only partner still requires its own preview and confirmation. No auto-pick or double-click-specific timer.
- Settings is available during selection and paused gameplay; it offers labelled music/effects sliders and shake toggle, restores prior focus on close, and never changes the duo. Portrait orientation displays rotate guidance, retaining state and blocking progression.

## Loading, countdown and results

Required preview failure leaves the tile/name visible with “Unable to load character” and Retry. No confirmation succeeds until its required preview is ready. Less than two valid entries shows “Two characters are needed to form a team” and Reload; it never inserts duplicates.

After partner confirmation show both names and portraits, identify “Your Fighter” and “AI Partner,” and show readiness progress by completed loading stage. Do not invent byte percentages when total size is unknown. Error Retry retains the duo. Countdown replaces loading with 3, 2, 1; only the countdown numeral changes and both portraits remain visible. An accessible status announces numbers and the start once.

During a locked preparation/countdown there is no Back, settings, or reselection control. An interruption offers Resume only when focused, visible, and landscape; returning alone does not resume. Retry after victory/defeat retains the duo. “Return to homepage” clears it.

## Visual acceptance

Use the layout and resource limits in [plan.md](../plan.md). Portrait grid and full-body preview are distinct. Confirmed and unavailable states use words/framing as well as colour. Reduced motion freezes preview at Idle time zero and removes decorative transitions. No strobing or rapid flashes. Small landscape layouts keep names, three bars, instruction, and required buttons legible without overlapping the grid or safe areas.

A twelve-entry fixture tests scrolling and focus only; additional shipped fighters require complete profiles/assets. Production builds expose no fixture roster or test globals.
