# US2 scenery increment — phase 4

Branch: `009-godot-rewrite-phases-3-4`. The owner approved all four
[concepts](../reviews/backdrop-concepts.md) before final SVG production.
[Final in-game reviews](../reviews/backdrops-final.md) retain actual screenshots,
clearances/connectors, reviewer decisions and pending participant/phone evidence.

## Implemented behavior

All eight self-contained static SVG panels are required: four 2048×1024 walls
and four 1024×512 floors. Godot loads the complete validated catalogue before
countdown, checks imported dimensions/mipmaps and exposes actionable resource
errors instead of launching partial scenery. Retry rechecks readiness.
Textures remain shared across room views and retries.

The exact stable-ID mapping is unchanged. All four room groups remain visible;
three quiet connectors and extended backing cover fitted camera margins.
Panels are opaque and unlit, with no animation or collision. Development floors
have been removed. Level rectangles, waves, AI/combat rules and table coordinates
remain unchanged. GO uses native vector drawing, avoids visible controls/messages,
respects safe insets and disappears on entry/result/reset.

## Actual verification

- [Unit gate](evidence/us2-unit.log): 167 retained legacy unit/integration cases,
  30 tooling/platform cases and 43 GUT cases pass.
- [Reference replay](evidence/us2-parity.log): all 26 fixtures match across 780
  state/event/camera checkpoints after scenery integration.
- [Complete Godot browser suite](evidence/us2-browser-full.log): 41 passed, three
  WebKit host-capability skips; includes all twelve duos in both engines.
- [Final scenery/input rerun](evidence/us2-browser-final.log): 13 passed, one native
  WebKit injection skip after the GO fixes. Covers all four rooms at three sizes,
  real transitions, paused GO, retry, review URLs and native/lifecycle input.
- [Release gameplay smoke](evidence/us2-release-browser.log): both browsers select
  a real duo, complete readiness/countdown, accept Light and pause; query parameters
  cannot register test/diagnostics APIs. Console/page errors fail the check.
- [Type checks](evidence/us2-typecheck.log) and
  [Blender suite](evidence/us2-blender.log): pass; Blender reports 24 cases.
- [Release](evidence/us2-audit-release.log),
  [Web Test](evidence/us2-audit-test.log) and
  [Diagnostics](evidence/us2-audit-diagnostics.log) audit exact shipped bytes, imports,
  budgets and mode isolation. Production excludes prototype art and test fixtures.
- [Forced split export](evidence/us2-export-split.log) and
  [audit](evidence/us2-audit-split.log) retain three actual resource-boundary packs
  under the 4 MiB fixture cap, including all eight final imports. This build precedes
  only the vector GO rendering correction; scenery and resource loading are identical.
  [Cold offline launch](evidence/us2-split-offline.log) passes with all three packs
  mounted from the cached immutable release in a fresh Chromium page.

The complete mipmapped RGBA estimate is **55,924,064 bytes (53.33 MiB)**, below
64 MiB. Final Release content is **5,648,234 bytes (5.39 MiB)**, below 30 MiB;
its content pack is below 16 MiB. Verified engine overhead is **39,804,840 bytes**.
Cached payload is **45,453,074 bytes**. Compressed-transfer estimates and exact
identities are in the [Release report](evidence/us2-release-report.json);
actual hosting transfer and phone memory/performance acceptance remain pending.

## Failures and limits

SVG opacity/animation, mipmap import, lower camera margin, pause-overlay GO and
missing-arrow-glyph failures were observed and corrected; see [TDD](tdd.md).
The initial browser test incorrectly expected bar tables before bar entry;
the [failure](evidence/us2-browser-table-expectation-failure.log) is retained.
Source behavior creates them on bar entry. A later room test read the preceding
frame; it now waits for both the requested area ID and active encounter.

Concept approval and technical scene review do not replace five-player recognition,
reference phones, intended-track confirmation or phase 5 browser reliability.
Those acceptance dependencies remain visible in [procedures.md](procedures.md).
Nothing is published and no legacy runtime is retired.
