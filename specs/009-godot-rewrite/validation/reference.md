# Pinned reference capture

`bun run reference:capture` archives and imports the actual implementation at `58137537a7d4ef992bd27e3fdf7efe92e5e2add1`. It never imports gameplay from the working tree. `tests/reference/manifest.json` records content SHA-256 and per-fixture digests; fixtures retain constructor state, ordered frame timestamps, input, viewport, explicit camera/ArenaContext, ordered events and state checkpoints.

26 fixtures cover all twelve distinct duos, all four Specials, grunt/zoner/enforcer/Liam roles, three matched camera-dependent targeting layouts, tables/healing, lethal ties and solo/stalled/paused frames. These are runnable legacy inputs; matching Godot simulation is phase 3 (T041), not claimed here. Comparator unit tests verify ordered outcomes, missing-to-null and continuous tolerance `1e-9 * max(1, abs(expected), abs(actual))`; discrete hit/target/HP/tick outcomes are exact.

`PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers LD_LIBRARY_PATH="$PWD/.browser-libs/usr/lib/x86_64-linux-gnu" bun scripts/reference/views.ts` used the pinned reference's actual Vite test export at localhost:4180, performed Cow/Crow selection/countdown, then used its existing stagePlayerHit fixture. Combat captures and snapshots are recorded for 667x375, 844x390 and 915x412 in `evidence/reference-views/manifest.json`. The 667x375 capture was visually inspected: HUD, joystick/actions and both fighters are present. Detailed Godot visual matching is pending the playable port, not established by the isolated foundation scene.

No gameplay correction or rebalance is encoded in these traces. Malformed-definition validation is a specified correction tracked separately in tdd.md and coverage.md. Final art, phones, intended soundtrack and participant evidence remain pending.
