# Revised controls verification

**Date:** 2026-09-27
**Branch:** `002-implement`

| Command | Result |
| --- | --- |
| `bun run typecheck` | Passed |
| `PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test` | Passed: 68 Vitest tests and 22 Playwright cases across Chromium and WebKit |
| `bun run build` | Passed; Vite reported a 500 kB chunk size warning |
| `bun run audit:build` | Passed its current static entry check; complete asset/precache audit remains in the original MVP work |
| `git diff --check` | Passed |

The first restricted-shell browser run could not bind the local preview server; the same full suite passed when rerun with loopback access. No failing tests remain. This evidence covers automated controls behavior and desktop browser rendering. The release remains a static web build suitable for the planned AWS hosting path.

Feature acceptance still requires T031 (iPhone 12 and Pixel 6 touch/readability), T033 (whole-level balance and Cow solo), T034 (offline/audio after original MVP PWA work), T035 (physical-device performance), and T036 (five-player evaluation). Those checks have not been performed and are not counted as passes. The final distributable soundtrack is still owner supplied; a temporary loop was approved for development.
