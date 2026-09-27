# First playable slice — 2026-09-27

Branch `001-tasks`. TDD failures were observed before touch ownership, collision/actions, attack slots, HUD/tutorial, and canceled-touch fixes. `bun run test` passed: 30 Vitest tests and the touch browser flow in Chromium and WebKit. `bun run typecheck` and the test-mode production build passed. Playwright WebKit needed a local copy of `libavif16` and dependencies on this Mint host; these files remain ignored.

The playable slice has Cow, one grunt, touch movement/actions, a simple Three.js venue, HUD, contextual prompts, and pause/resume. It is a training increment. The complete four-area level, Crow AI, boss, results, audio, settings, offline build, full browser regressions, reference-phone touch checks, and player acceptance are pending. This record does not claim US1 or MVP acceptance.

Follow-up refinement on the same branch: `bun run test` passed 38 Vitest tests and 2 browser tests after adding swept contact geometry, action cooldown/feedback, contextual prompts, poses, and simultaneous lethal-contact resolution. `bun run build` passed. The browser regression remains a basic flow; comprehensive input and visual checks and reference-device evidence remain pending.

US1 automated checkpoint: `bun run test` passed 39 Vitest tests and 8 Playwright cases across Chromium and WebKit. `bun run build` and strict typechecking passed. Release output contains no `__sorTest` or `placeCow` fixture controls. Browser cases cover movement release, unavailable special feedback, meter gain, and a timed combo. Actual multitouch ergonomics, animation readability, and frame rate on the reference phones are still pending T027.
