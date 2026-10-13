# US1 playable increment — phases 3–4 branch

Implementation branch: `009-godot-rewrite-phases-3-4`. The previous phase 2 changes
remain intact. Production bootstrap now loads the Godot-owned playable scene; Web Test
uses a separate entrypoint that can also select the original foundation fixture.

## Actual automated evidence

- [Parity](evidence/us1-parity.log): all 26 pinned-reference fixtures match across
  780 frame checkpoints, including all twelve duos, four Specials, four enemy roles,
  three targeting layouts, tables/healing, lethal ties and stalled/paused frames.
  IDs/actions/HP/hit targets/events/results compare exactly; only the specified
  continuous fields use the existing 1e-9 relative tolerance.
- [Complete browser suite](evidence/us1-browser-full.log): all twelve separately
  parameterized canvas journeys passed in Chromium and WebKit, together with the
  foundation and keyboard/lifecycle checks: 32 passed and two existing WebKit skips.
  Each journey uses actual canvas selection and a Light action, then test-only result
  staging to verify retained-duo retry and Home. Result staging does not prove a human
  can finish a normal run.
- [Actual-game native input](evidence/us1-native-input.log): simultaneous joystick and
  Light, cancellation, cleared movement and no held-action repetition passed in Chromium.
  WebKit native multi-touch injection remains unavailable and physical Safari remains pending.
- [Headless rules/view checks](evidence/us1-control-layout-green.log): constructors,
  clocks, combat windows/buffering, all Specials, stable targeting/swept projectiles,
  stun/boss distinction, partner visibility/recovery, wave/table/pickup rules, all four
  solo terminal outcomes, source camera fitting, imported bones and resource ownership.
- [Release audit](evidence/us1-audit-release.log): actual playable Release resources
  exclude the Web Test registration, fixtures and mutation API. URL flags cannot supply
  resources absent from that pack. Final release acceptance remains a later gate.

The four solo outcomes are headless last-hit fixtures with the partner knocked out,
covering each fighter's victory ownership and terminal path. They are not four recorded
normal full-level solo playthroughs or substitutes for phone/player evaluation.

## Matched visual inspection

[Godot views](evidence/us1-views/manifest.json) record exact export identity, viewport,
state and screenshots at 667x375, 844x390 and 915x412. They use the same staged Cow/Crow
positions and grunt arrangement as the pinned
[Three.js views](evidence/reference-views/manifest.json). Inspect both sets side by side.
The rig assets, ally scale/facing, scalar camera and original touch-control geometry
are retained; Godot lighting/rasterization and native Controls differ in appearance.
Phase 3's plain development floor is explicitly temporary until phase 4 art integration.

Visual inspection found a changed action-button arrangement. A failing geometry test
([red](evidence/us1-control-layout-red.log)) identified the source diamond layout:
Light 72px, other actions 56px within the 176px group. The port now uses that geometry
([green](evidence/us1-control-layout-green.log)) and the original 60px fixed joystick.
Preview camera errors were reproduced through a browser-console assertion
([red](evidence/us1-preview-errors-red.log), [green](evidence/us1-preview-errors-green.log)).
Removed actors left stale render models; the ownership regression failed then passed
([red](evidence/us1-world-cleanup-red.log), [green](evidence/us1-world-cleanup-green.log)).
No simulation tuning, encounter composition, HP or damage was changed by these fixes.

## Remaining acceptance

T021 phone evidence remains pending. Required full phone runs, intended soundtrack,
five-player learning/completion/readability and accessibility reviews remain governed
by [procedures.md](procedures.md). Full persistence/audio/cache reliability and semantic
projection work belong to phase 5; the phase 3 tutorial currently retains in-memory
progress and keeps Heavy distinct from legacy Attack. Final scenery and its actual
review decisions belong to phase 4. No legacy runtime is retired and nothing is published.
