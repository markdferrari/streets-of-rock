# Data Model: Choose Your Chieftain

## Character registry

`CharacterId` is a registry key (initial production values `cow`, `crow`); test registries may contain additional unique keys. `CharacterDefinition` contains `id`, `displayName`, `assetKey`, `portraitKey`, `playerProfile`, `partnerProfile`, and `specialLabel`. Asset keys resolve to bundled URLs in presentation, keeping the registry independent of Three and the DOM.

`playerProfile` contains `maxHp`, `moveSpeed`, damage for `light1/light2/light3/heavy/special`, and shared move timing/range references. `partnerProfile` contains `maxHp`, `moveSpeed`, `catchUpSpeed`, `supportDamage`, and `supportCooldownTicks`. Values must be finite and positive, all referenced assets/moves must exist, and IDs must be unique. Validate a minimum of two complete entries before enabling selection. Production registry extensions require both gameplay profiles and all presentation mappings.

### Provisional starting values

| Field | Cow | Crow |
| --- | --- | --- |
| Player/partner maximum HP | 500 | 240 |
| Normal movement speed | 3.2 | 3.4 |
| Player Light damage sequence | 12 / 14 / 22 | 10 / 12 / 18 |
| Player Heavy damage | 30 | 26 |
| Player Special damage | 60 | 50 |
| AI support damage / cooldown | 8 / 54 ticks | 8 / 54 ticks |
| AI catch-up speed | 4.5 | 4.5 |
| Player Special presentation | Bovine Spin | Wing Spin |

Cow player values and Crow partner values preserve existing behavior. Crow player damage, Cow partner profile, and Wing Spin naming are provisional implementation defaults. Player attacks inherit existing Cow timings, range, depth tolerance, knockback, dodge duration/speed/protection/cooldown, meter rules, and input buffering. Partner profiles retain current follow, target selection, recovery, attack ordering, and no-healing/no-Special constraints.

Displayed bars derive from the playable profile in both steps: Health=maxHp, Power=light1 damage, Speed=moveSpeed. Fixed endpoints are 500 HP, 20 damage, and 5 movement units/second. Fill is clamp(value / endpoint, 0, 1); accessible values retain the true number when above the endpoint. Never normalize separately per character or silently rewrite endpoints when the roster grows. These endpoints are provisional tuning; gameplay values remain the source of truth.

## Duo assignment and run actors

`DuoAssignment = { fighterId: CharacterId, partnerId: CharacterId }` is readonly after confirmation. Both IDs must be registered and distinct. Validation happens at selection confirmation and run construction.

Replace `CowState` with `PlayerState { role: 'player', characterId, ...existing player fields }` and `CrowState` with `PartnerState { role: 'partner', characterId, active, lastProgressTick }`. Both retain common Actor position, health, action, protection, and targeting fields. EnemyState retains `grunt | zoner | enforcer | liam`. No enemy has an ally characterId.

`RunState` gains `duo`; player and partner fields are found by `getPlayer(run)` / `getPartner(run)`. Create exactly one of each with IDs 1/2 and positions 0/-0.8, both facing progression. Future targeting uses selectors rather than numeric constants. Run construction takes profiles from the registry, resets all existing counters/state, and rejects invalid assignments. No saved-run migration is needed because runs are not persisted.

## Selection state

`SelectionState` fields: `step: fighter | partner`, `focusedId: CharacterId | null`, `previewedId: CharacterId | null`, `fighterId: CharacterId | null`. Partner confirmation produces DuoAssignment and exits selection; no partially confirmed partner is retained.

| Event | Guard | Result |
| --- | --- | --- |
| reset | any prior session disposed | fighter step, no preview/fighter; focus may target first tile without previewing it |
| focus(id) | eligible registered tile | focus changes only |
| activate(id) | eligible, not current preview | preview becomes id |
| activate(id) | fighter step, current preview | fighterId=id; partner step; clear preview; focus first eligible partner |
| activate(id) | partner step, current preview, id differs from fighter | emit validated duo exactly once and leave selection |
| back | partner step | fighter step; preview previous fighter; clear fighter confirmation; focus that preview |
| interrupt | selection | preserve selection, clear active gesture/held keys, suspend animation |

Unknown or unavailable tile activation is a no-op. Preview readiness is held by the browser adapter: confirmation cannot advance with missing required preview assets; Retry retains the preview and reattempts load.

## Session and countdown

`RunSession` owns `phase: selecting | preparing | countdown | running | paused | victory | defeat | error`, selection state, locked duo, prepared/current run, `generation`, and `resumeTarget: preparing | countdown | running | null`. Error carries preparation generation and retryable message; interrupted preparing/countdown carry an explicit-resume latch. View settings are a modal over selecting/paused only and do not reset the session.

| Transition | Required effect |
| --- | --- |
| selected duo → preparing | lock duo; increment generation; clear input; reset clocks and run; request preparation |
| preparation success | accept matching generation only; if interrupted remain paused with countdown as resume target, otherwise countdown |
| preparation failure | accept matching generation only; error retains duo; error Retry starts a new generation |
| countdown → running | after three active seconds, once only; clear fresh-input barriers, loop accumulator, and run clock; enable simulation |
| interrupt during preparing/countdown/running | suspend active clock, record resume target/latch, clear input; loading may complete without advancing |
| resume | foreground, focused, landscape; resume target only after deliberate activation; reset timing sample |
| run terminal result | pause clock; clear pending inputs; defeat takes priority on simultaneous player/boss death |
| result Retry | retain duo; new preparation generation and reset run; full countdown |
| homepage/reload | dispose views, invalidate outstanding work, clear duo and selection |

Countdown stores `number: 3 | 2 | 1`, `numberElapsedMs`, `paused`, `completed` and an injected monotonic time source. Each shown number requires 1000 active ms. On interruption preserve its elapsed fraction. Advance at most one number per presented frame and discard overshoot into the next number so a long visible rendering stall cannot skip a number; normal uninterrupted completion is 3000 ms plus frame scheduling tolerance. Timing tests use the exact logical boundaries; device checks allow one render frame per boundary and record longer stalls. The gameplay clock is separate and starts only after 1 finishes.

Preparation generation also tags preview changes. Out-of-order success/error is ignored; abandoned renderers and clones are disposed. Retry uses a new generation even when cached assets resolve immediately.

## Presentation and persistence

`AnimationMap` is keyed by character identity and semantic action/phase. Cow maps light1/2/3→cow1/2/3, heavy→cowHeavy, special→spin, support→cow1.active. Crow maps light1/2/3→crow1/2/3, heavy→crowHeavy, special→wingSpin, support→crow.active; export the additional named phase clips and Dodge. Idle/Move/Hurt/KnockedOut remain shared names. Keep existing Crow support clips for compatibility. Every reachable mapping is validated against actual GLB inventory.

`Settings` stores schema version 1, musicVolume and effectsVolume in [0,1] (defaults 0.7/0.8), and screenShake boolean (default true), under `sor.settings.v1`. Parse failures, invalid fields, or unavailable storage fall back per field; existing tutorial and best-result keys are untouched. Reduced motion follows the system media query dynamically. Selection/duo are never saved. Music uses one looping HTMLAudioElement; short SFX use an AudioContext and independent effects gain. Failure disables only affected audio.

`AssetInventory` identifies the current build and every required local asset with URL, revision and byte size; `CacheReadiness` records unknown/caching/ready/error for that build. It is recomputed from actual current-build cache content. Runtime readiness distinguishes critical visual assets from nonblocking audio playback capability. A waiting worker status is separate from runtime readiness and cannot activate through in-app selection/countdown actions.
