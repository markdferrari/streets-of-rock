# Research: Choose Your Chieftain

Date: 2026-09-27. All technical questions identified during planning are resolved below. Findings describe this checkout, not assumed capabilities of installed packages.

## R1. Character identity and control role

**Decision:** Give allies a `characterId` and discriminate their state by `role: player | partner`; retain enemy archetype roles. Use role selectors throughout gameplay. Require `createRun(runId, duo)` and preserve the immutable duo on retry.

**Rationale:** `src/game/types.ts` binds player-only fields to Cow and AI-only fields to Crow. Identity lookups also occur in damage, projectiles, movement, actions, pickups, enemy targeting, camera, encounters, HUD, tutorial, and app test helpers. Renaming only the homepage would leave Crow unplayable and defeat/pickups following the wrong character. Numeric IDs may remain player=1, partner=2, but targeting must resolve the player rather than assume ID 1.

**Alternatives considered:** Swapping meshes would misrepresent identity and stats. Separate Cow/Crow simulation classes would duplicate shared combat. Keep one player implementation and one support AI, selected independently of identity.

## R2. Tuning and animation migration

**Decision:** Keep Cow's current player profile unchanged. Use the provisional Crow profile in data-model.md with shared timings/ranges/cooldowns. Retain support damage 8 every 54 ticks for either partner; use character movement speed and HP. Normalize three displayed bars by fixed shared endpoints. Adopt semantic move IDs and an explicit identity-to-clip map.

**Rationale:** `src/content/tuning.ts` and `src/game/run.ts` supply Cow's existing profile; `src/game/ai/crow.ts` supplies Crow's HP/movement/support baseline. Crow player attack damage is new provisional tuning. Current Cow assets provide all player actions; Crow lacks Dodge and full player attack phases. `scene.ts` silently retains old animation when a clip is missing, so validate the complete required mapping before readiness. Retain partner direct-hit damage ordering to avoid an unrelated combat rewrite.

**Alternatives considered:** Per-roster maximum bars would change existing ratings when adding a fighter. Invented ratings would diverge from gameplay. Reusing Crow's support pose for every player action would fail readable-animation requirements. Unique mechanics remain deferred.

## R3. One session controller and deterministic countdown

**Decision:** Integrate RunSession into GameApp as the sole session transition owner; use a pure selection reducer and separate injected-clock countdown. Tag preparation attempts with generation IDs. Readiness includes asset validation, scene construction, and an initial rendered frame without simulation.

**Rationale:** `src/app/session.ts` is currently only used by tests; production GameApp has a separate screen union. `start()` starts timing immediately after asset load. A single authoritative controller avoids a test-only countdown. Existing ActiveClock supports paused elapsed-time accounting. Loading completion during interruption must preserve a resume latch.

**Alternatives considered:** Independent interval timers drift and are unreliable in hidden tabs; a second parallel lifecycle in GameApp would duplicate behavior. Hidden pages throttle timers and animation callbacks, so lifecycle events explicitly pause active-time accounting. See [MDN Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

## R4. Portraits, previews, and input

**Decision:** Export static portraits from existing Blender sources; use one dedicated Three preview renderer with cloned Idle animation. Dispose preview-owned resources before constructing gameplay renderer. Use native labelled buttons, roving focus, semantic meter bars, and an explicitly scrollable roster.

**Rationale:** The checked-in CharacterAssetStore already uses SkeletonUtils cloning and deduplicated load promises. Installed `node_modules/three/examples/jsm/utils/SkeletonUtils.js` confirms cloned skeletons but shared mesh resources; template geometry/materials must remain store-owned. Existing global button `touch-action: none` needs a roster override to permit pan scrolling. `scripts/blender/render.py` establishes the local rendering workflow; no portrait PNGs currently ship.

**Alternatives considered:** A live canvas per tile scales poorly; unrelated generated illustrations break asset consistency. A generic UI framework is unnecessary for this screen. CSS-only previews cannot satisfy the agreed animated full-body requirement.

## R5. Missing platform prerequisites

**Decision:** Deliver the missing minimum audio/settings/PWA adapters with this feature, reusing the documented 001 design and installed dependencies. Add a full asset inventory audit, injectManifest worker, cached media range handling, guarded preferences, and natural worker waiting. No forced `skipWaiting`, `clientsClaim`, or mid-session reload. Pending update instructions are offered only before/after runs.

**Rationale:** `vite.config.ts` currently has no PWA plugin, `src/main.ts` only creates GameApp, there is no settings/audio adapter, and `scripts/audit-build.ts` only checks index.html. The approved FR-014 cannot pass without these prerequisites. Full-build caching must include portraits, both extended GLBs, all level assets, fonts if any, and bundled audio. Cache success and runtime readiness are separate: playback rejection never blocks gameplay, but incomplete caching cannot show offline-ready.

**Alternatives considered:** Deferring these prerequisites would leave mandatory feature acceptance incomplete. Automatically refreshing a waiting worker risks replacing an active build in another tab. The plugin documents prompt-style registration and explicit update callbacks; our choice retains the stricter natural-waiting policy from the project's earlier research instead of invoking its refresh callback. See [Vite PWA update guide](https://vite-pwa-org.netlify.app/guide/prompt-for-update.html) and [baseline research](../001-neon-velvet-mvp/research.md).

## R6. Testing and evidence

**Decision:** Use existing pinned Bun/Vitest/Playwright/Blender tools. Write failing tests for each deterministic behavior before implementation, expand both-role regression coverage, and migrate existing Start-based browser journeys. Full automated suites precede commits; actual phones and the five-player protocol establish user/performance acceptance.

**Rationale:** Playwright already serves a test build and has Chromium/WebKit projects; Vitest includes both unit and integration tests. Test-only helpers must follow the selected player and stay absent from production builds. The current audit is insufficient for offline claims. Device access and final owner soundtrack are explicit release dependencies.

**Alternatives considered:** More unit tests cannot establish real touchscreen usability, audio activation, installed offline replay, or phone GPU performance. A documentation-only plan does not need artificial runtime tests.

## Resolution

No unresolved technical clarification remains. Exact provisional numbers and interfaces are fixed in the accompanying design artifacts. Runtime acceptance is pending implementation; final owner soundtrack, physical devices, and five participants remain required evidence inputs.
