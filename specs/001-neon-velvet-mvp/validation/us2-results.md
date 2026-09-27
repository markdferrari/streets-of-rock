# Full-level rules checkpoint — 2026-09-27

Core simulation tests were written and observed failing before Crow, enemy, progression, pickup, session, and best-time implementations. `bun run test` passed 56 Vitest tests and 8 browser cases across Chromium/WebKit; `bun run build` passed strict typechecking and the release build. The browser still launches a training composition, so this is a rules checkpoint, not a full-level acceptance record. Presentation transitions, boss HUD/results, retry wiring, resource cleanup, solo-win browser checks, area timing, and phone evidence remain pending.
