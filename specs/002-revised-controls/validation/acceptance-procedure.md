# Full-run and player acceptance procedure

**Status:** Procedure defined before revised-control implementation; results pending.

Record build/commit ID, date, iPhone 12 Safari and Pixel 6 Chrome OS/browser versions, browser/installed mode, and asset/audio/PWA readiness. The existing MVP audio, final distributable soundtrack, and offline-cache tasks remain dependencies for their final gates; a temporary loop is permitted during development.

## Full-run and performance

On each phone, complete the whole level with Light, Heavy, Dodge, and Special. Record active run duration, Cow and Crow survival, enemy/boss readability, visible stalls, and frame intervals through the busiest encounter using the MVP diagnostics build, then confirm representative behavior on the release build. Target 60 fps and require at least 30 fps during the busiest encounter. Repeat a run after Crow is knocked out to establish Cow-only completion. Tune data in `src/content/tuning.ts` if needed, retaining Heavy's slower/stronger identity and the 3–5 minute successful-run target.

## Offline and failure handling

After the complete MVP build caches online, close the tab/app, disable networking, relaunch, complete a level, and retry. Repeat in installed mode where supported. Verify packaged music/effects, preference and best-result persistence, loading/cache failure feedback, and an update arriving during a run applying only between runs. Record browser data eviction separately from cache failure. Do not claim offline acceptance before the original MVP PWA/audio work is complete.

## Five-player study

Recruit five casual action players; do not verbally coach controls. Record each player's time from control availability to first movement and first Light attack. At least four must do both within 30 seconds (SC-001). After all relevant contextual prompts, provide a reachable enemy and full special meter through play or a prepared encounter. Start a two-minute window and record whether the player correctly demonstrates Light, Heavy, directed Dodge, and ready Special; at least four must demonstrate all four (SC-007). Ask separate 1–5 ratings for responsiveness and readability; at least four must score each at least 4 (SC-004). Record attempts, first successful active duration, Crow survival, recurring confusion, and grip changes. At least four must finish within three attempts and have a first successful run lasting 3–5 active minutes (SC-002/003). Report raw results and failures without claiming statistical market validation from five participants.
