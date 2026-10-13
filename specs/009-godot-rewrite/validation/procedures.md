# Manual validation procedures

Before any visual implementation, record: procedure ID, requirement/scenario IDs, pass/fail/pending, UTC date, operator/reviewer, commit/content digest/buildId/mode/engine fingerprint, device model/OS/browser/version, installed/browser mode, CSS viewport/DPR/safe insets, duo, settings (music/effects/shake/reduced motion), steps, expected and actual results, evidence files, frame sample scope and unresolved dependencies.

Pending dependencies: no connected iPhone 12 or Pixel 6, no concept or final-art decisions, intended soundtrack confirmation and five first-time participants unavailable. Desktop emulation does not substitute for these.

## Phone, art and five-player procedures


Record build ID, OS/browser, viewport/safe area, duo and settings for every procedure.

- **Touch/readability:** Play all fighters on both phones with music/effects muted and
  shake disabled, then reduced motion. Exercise simultaneous joystick/actions, canceled
  touches, edge positions, long drags, orientation changes and GO. Inspect 90% combat
  view coverage, labels, telegraphs, partner visibility and distinct interactive tables.
- **Accessibility:** Test keyboard focus and selection on desktop and VoiceOver/TalkBack
  on phones. Confirm names, pressed/disabled states, meters, countdown, errors and
  modal focus restoration agree with the visible Godot UI.
- **Art:** Review all four camera-composited concepts before final production, then all
  four rooms in busy gameplay. Record required cues, consistent branding, rightward
  entrance, quiet floor, no false platforms/exits, no gaps and no flashing/strobing.
- **Audio/lifecycle:** Use intended music and effects; activate from real gestures,
  pause/resume/retry, background and rotate during countdown and both new Specials.
  Confirm one music track, independent levels, frozen durations and explicit resume.
- **Offline/update:** Cache online, close, disable networking, reopen, finish all rooms
  and retry. Repeat installed mode where supported and with two windows awaiting an
  update. Include upgrade from the original JS release with saved records.
- **Performance:** Use the diagnostics build to record active-run frame intervals,
  one-second rolling FPS, longest frames, draw calls/triangles and ten lifecycle cycles.
  Keep at least 30 fps in the busiest encounter, target 60 fps; confirm identical
  content/settings in the release and repeat visible-stall checks there. Exclude
  selection/loading/countdown/paused/hidden/results samples from active-run summaries.
- **Players:** Five first-time casual players attempt selection and play without
  coaching. Record every PRD SC-001–011 outcome separately: learning within 30 seconds,
  completion within three attempts, first success 3–5 active minutes, separate
  responsiveness/readability >=4/5, four-action demonstration within two minutes
  after the last relevant prompt, correct AI-role understanding, GO direction within
  three seconds, Lion/Plates differentiation, and all four settings without labels.
  Apply the PRD's >=4/5 threshold per applicable criterion.


## Every inherited PRD threshold

| ID | Required outcome |
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

## Foundation smoke (T021)

On both physical phones: serve Web Test via local HTTPS, load imported Cow, inspect every semantic clip and scalar position/facing mapping, activate the canvas Control and the mirrored semantic button separately, use simultaneous touch/drag/cancel and outside release, activate audio through each real gesture, background/rotate and explicitly resume, cache then close and reopen offline with all WASM/PCK bytes. Repeat forced-small-cap export and cold pack mount; verify actual Release has no fixture registration/resources. Record each unavailable step as pending.
