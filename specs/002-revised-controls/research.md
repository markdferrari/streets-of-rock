# Research: Revised Controls

**Date:** 2026-09-27
**Scope:** Decisions drawn from the pinned project stack, current source, PRD v2.1, feature spec, and constitution. No new package or network research is needed.

## Fixed joystick and touch ownership

**Decision:** Keep the existing pointer adapter and `PointerEvent` capture. Replace the floating anchor with a centre supplied by the visible joystick element in CSS pixels. Accept a movement owner only when pointerdown begins within the ring. Clamp visual knob travel and movement magnitude at the configured radius; preserve the fixed centre while the owner drags beyond it. Compute the centre from the rendered element on pointerdown and resize, without storing absolute device coordinates across rotation. Clear owner and centre the knob on release/cancel/interruption. The movement region becomes the ring itself; the underlying left play area does not create movement.

**Rationale:** The existing `PointerControls` already owns independent pointer IDs and handles normal release versus canceled capture. Its current anchor-follow behavior and broad 47% movement region cause the exact discoverability problem identified by the owner. A fixed visible ring gives a stable target without adding a dependency.

**Alternatives considered:** Keep the floating stick with a persistent hint; easier to code, but contradicts FR-009. Use joystick library; adds weight and does not solve lifecycle or game-specific input semantics.

## Ordered action requests and buffering

**Decision:** The browser adapter emits one `ActionRequest` per accepted pointerdown, carrying kind, pointer ID, and monotonically increasing input order; movement remains a continuously sampled normalized vector. A held finger cannot emit a second request, and crossing button bounds does not change its kind. Pointerup marks a normal tap complete; cancellation drops an unconsumed request and sends the source pointer ID to the simulation to clear a still-buffered request from that finger. Once an action executes, cancellation cannot undo it. The pending request therefore retains its source pointer ID until execution or expiry. The simulation has one pending eligible request with a nine-tick starting buffer, using the existing 60 Hz fixed step. A later eligible request replaces it; equal-sample requests resolve Special > Dodge > Heavy > Light, with input order for duplicate kinds. A request is eligible only if Cow is alive and its resource/cooldown condition is met when received. Expiry is exclusive at `expiresTick`; no queued request survives a terminal state or interruption. Keep active action phases uninterruptible.

**Rationale:** `PointerOutput` and `InputFrame` currently use attack/dodge/special booleans, which lose arrival order and cannot implement the specified latest-eligible policy. `updateCowAction` currently overwrites pending commands before checking availability, so unavailable requests can erase a valid buffer. The state remains deterministic when the adapter passes ordered requests into `stepRun`.

**Alternatives considered:** Add a Heavy boolean and keep priority only; loses latest-request semantics. Move buffering into DOM callbacks; makes combat rules depend on render timing and browser state.

## Heavy strike and balance

**Decision:** Add `cowHeavy` to `MoveId`, Cow action timings, attack instance creation, damage/knockback/meter rules, and presentation. Treat it as one attack, not a Light combo step. Starting Heavy resets `comboStep` and `comboDeadlineTick`; a rejected/unavailable Heavy leaves them unchanged. Initial tuning: 14 windup ticks, 6 active ticks, 24 recovery ticks, 30 damage, 1.3-unit range, 0.45 depth tolerance, 1.2-unit knockback, 10 meter per eligible enemy hit. Existing Light attacks are 12/14/22 damage with 8/8/11 windup ticks and 14/14/20 recovery ticks. Heavy has no resource cost, separate cooldown, invulnerability, or action cancel. Knockback follows existing finisher clamping and boss-specific immunity if present. Table damage can break tables but grants no meter.

**Rationale:** The numbers make the distinction observable while keeping Heavy within the current combat system and below Bovine Spin's 60 damage. The exact values are provisional and must be adjusted against 3–5 minute runs, solo completion, and combat readability. The current `tuning.ts` does not hold all action values; move damage/timings/knockback to data there or an imported move table before final tuning.

**Alternatives considered:** Charged Heavy or a mixed Light/Heavy combo; both expand input complexity beyond the agreed four-button design. Heavy as a fourth Light hit; it would not offer an immediate choice.

## Layout and feedback

**Decision:** Render one visible joystick ring with a knob and a four-button diamond in gameplay. Start with 120 CSS-pixel ring diameter, 72-pixel Light button, 56-pixel Heavy/Dodge/Special buttons; group centres form a diamond approximately 100 pixels apart vertically/horizontally. Place the group at the right/bottom safe-area inset, the ring at the left/bottom inset, and reserve a clear central combat corridor. Use labels for all buttons, a pressed shape/scale state, `Dodge` plus remaining seconds or `Ready`, and `Special` plus percentage or `Ready` on the controls. Keep the HUD's existing values for redundancy. Focus/press and readiness are visible when muted and shake disabled. Use responsive layout adjustments only when necessary to keep hit targets separated and readable; verify the existing 568×320 CSS-pixel lower landscape bound, iPhone 12, and Pixel 6.

**Rationale:** The current horizontal row and hidden ring are unclear. The existing CSS and DOM can support the visible layout without another UI framework. A separate readiness label survives color-blind and muted play.

**Alternatives considered:** Color-only glow, radial gesture pad, and three-button omission of Special; they do not satisfy FR-039 or the owner’s chosen scheme.

## Tutorial persistence and compatibility

**Decision:** Keep existing prompt IDs for movement, attack, dodge, and special in local storage; map the legacy `attack` prompt to Light. Add an independent `heavy` prompt and show it in the first encounter after movement/Light are introduced. Never infer Heavy completion from legacy attack completion. Continue with in-memory defaults if storage is missing, invalid, or throws. Do not overwrite settings or best results. A successful Heavy start completes its prompt; merely touching an unavailable button does not.

**Rationale:** This preserves returning-player progress while ensuring they discover the new action. `TutorialProgress` is currently in-memory only, so persistence work must follow the existing MVP NFR-008 task and be covered in this feature’s integration tests.

**Alternatives considered:** Reset all prompts on upgrade; unnecessarily repeats prior onboarding. Reuse `attack` for Heavy; hides the new control from returning players.

## Existing test baseline and delivery integration

**Decision:** Keep the Bun 1.4.2, TypeScript 6.0.3, Three 0.186.0, Vite 8.3.0, Vitest 4.1.11, and Playwright 1.63.0 stack. No new runtime dependency or backend. Update the MVP runtime contract’s Playing/input portions and supersede older control assumptions with the feature contract below. Before a controls commit, diagnose the four current Chromium/WebKit failures in `tests/e2e/touch-combat.spec.ts`: stale `Dodge attacks` prompt expectation and unreachable `Special 10%` fixture in the full-level opening. Repair tests with meaningful first-encounter setup/observable outcomes; do not weaken assertions merely to make them pass. Follow red–green–refactor for new behavior; run the full suite before every commit.

**Rationale:** The pinned stack already supports the feature and AWS-compatible static release. The full suite currently passes 58 Vitest tests and 6 of 10 browser cases; the 4 browser failures block commits under `AGENTS.md`. The feature is documentation complete but not implementation validated. Existing PWA, audio, lifecycle, and offline MVP work remains in progress; their final acceptance cannot be claimed here.

**Alternatives considered:** Replace the engine or add a control library; no requirement justifies that work. Commit plan docs despite failing baseline; violates the repository’s all-tests-pass rule.
