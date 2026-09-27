# Controls requirement coverage

**Reviewed:** 2026-09-27 against PRD v2.1, feature 002 spec/plan/runtime contract, original MVP tasks, and current automated checks.

| Feature scenarios | Implemented and automated evidence | Remaining acceptance |
| --- | --- | --- |
| CTRL-AC-001–004 | Fixed visible ring/knob, four labelled button positions, input ownership, deadzone/clamp, movement/facing tests, and 568×320 Chromium/WebKit layout check | Physical safe-area, reach, and visual warning checks on iPhone 12 and Pixel 6 |
| CTRL-AC-005–008 | Light combo, single Heavy state/damage/knockback/table/meter rules, ordered one-shot requests, cancellation, buffer/priority, Chromium/WebKit Heavy action | Human combat feel and complete-level balance |
| CTRL-AC-009 | Unit and browser checks for separate Heavy prompt and retained legacy Light completion; unavailable-storage fallback test | Confirm prompt clarity with five casual players |
| CTRL-AC-010–011 | Existing Dodge/Special deterministic tests, new text readiness and browser interaction checks | Physical timing/readability while moving on both phones |
| CTRL-AC-012–013 | Chromium/WebKit readiness, blur, portrait/landscape, pause/retry, and input clearing checks | Physical two-thumb, muted/no-shake, tab/installed interruption, active-time/audio observations |

The revised-control runtime contract supersedes original MVP joystick/input clauses. The original MVP still has unfinished audio, PWA cache, complete offline replay, device performance, soundtrack, and five-player gates. Desktop browser tests and documentation do not satisfy those gates. No new backend or runtime package was introduced; the release remains a static build compatible with the planned AWS hosting path.

Open feature tasks: T031 (two phones), T033 (complete-level balance/solo run), T034 (offline/audio when MVP delivery is ready), T035 (phone performance), and T036 (five-player evaluation). Keep them open until actual results are recorded. Original MVP unfinished tasks remain in `specs/001-neon-velvet-mvp/tasks.md`.
