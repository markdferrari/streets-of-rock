# US1 fixed joystick and layout result

**Date:** 2026-09-27

A new unit test failed because `PointerControls` had no fixed-centre API. A new Chromium/WebKit browser check failed because the joystick was hidden before first touch. After implementation, movement starts only inside the persistent ring, the centre stays fixed, the knob clamps to the ring, and release/cancel centres it. The four labelled buttons occupy a diamond at right; HUD remains above the control layer. The browser check also covers a 568×320 CSS-pixel viewport.

`PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test`: 59/59 Vitest and 12/12 Playwright cases passed. `bun run build`: passed typecheck and production build; existing >500 kB chunk warning remains. No physical iPhone 12/Pixel 6 reach or safe-area observation has been performed. Heavy is visible but does not yet execute; the full four-button interface is not ready for a player demo until US2.
