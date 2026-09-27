# Controls implementation baseline

**Date:** 2026-09-27
**Branch:** `002-implement`, a feature branch; repository clean except generated feature tasks at start.
**Toolchain:** Bun 1.4.2; pinned TypeScript 6.0.3, Three 0.186.0, Vite 8.3.0, Vitest 4.1.11, Playwright 1.63.0. `AGENTS.md` requires all tests passing before a conventional commit.

## Known browser regression and repair

`PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test:e2e` initially failed four cases (the same two cases in Chromium and WebKit). The old test expected `Dodge attacks` immediately after moving, but the tutorial shows it only after an enemy warning. The full first wave starts too far away and at different depths for that warning to be immediate. The old meter test placed Cow at x=1.5, outside attack range of the full wave. The test now verifies the movement prompt clears, and places Cow at x=6 so an in-range enemy at x=7 can take one damaging attack. The assertions still check observable tutorial and meter behavior.

After repair, all 10 browser cases passed in Chromium and WebKit. Typecheck and the test build passed as part of that browser run. The full suite and release build are recorded below when run.

## Passing baseline

- `PLAYWRIGHT_BROWSERS_PATH=$PWD/.playwright-browsers bun run test`: 58/58 Vitest tests and 10/10 Playwright browser cases passed (Chromium and WebKit).
- `bun run build`: TypeScript check and Vite production build passed. Vite warned that the main JavaScript chunk exceeds 500 kB; this is a performance observation, not a build failure.
- No revised-control implementation had been written at this checkpoint.
