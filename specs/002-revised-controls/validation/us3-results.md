# US3 readiness and interruption result

**Date:** 2026-09-27

Browser tests were observed failing before implementation because Dodge/Special buttons lacked readiness text and blur did not pause play. Buttons now show Dodge Ready or remaining seconds and Special percentage or Ready. A pressed state is visible without audio or shake. Blur, hidden page, portrait resize, manual pause, result, retry, and geometry reset clear browser ownership and buffered actions; portrait displays a rotate prompt, and landscape/focus return requires explicit Resume. The active clock pauses through the existing app flow.

`PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test` passed 68/68 Vitest and 22/22 browser cases in Chromium/WebKit. `bun run build` and the current `bun run audit:build` passed; the audit currently checks the static entry and does not verify complete PWA caching. Actual iPhone 12/Pixel 6 thumb reach, safe-area behavior, audio pause, installed mode, and full-run performance are not yet observed. The original MVP audio/PWA implementation is still pending and cannot be credited to this controls increment.
