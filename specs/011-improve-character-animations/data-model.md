# Data Model: Hero Animation Profiles and Review Evidence

**Feature**: [spec.md](spec.md) | **Runtime contract**: [contracts/animation-presentation.md](contracts/animation-presentation.md)

All new records below are planned. Simulation actors, character combat definitions, action durations, save data and network interfaces retain their existing schemas.

## 1. HeroAnimationProfile

**Authority**: proposed `content/hero-animations.json`, `{schemaVersion: 1, sources: [...], characters: [...]}`. The minimal `sources` summaries contain IDs/status derived from the validated provenance ledger; build validation checks exact agreement, while runtime uses these summaries without loading excluded authoring provenance. Exactly one character record for each ID in `content/roster.json`; current scope is cow, crow, lion and plates. Existing `content/animation-clips.json` remains the required semantic-key inventory, not a list of required physical GLB clip names once profiles are active.

| Field | Type / meaning | Validation |
| --- | --- | --- |
| characterId | Existing roster ID | Unique; matches definition and animationSetKey. |
| modelKey | Key in resources.models | Must equal the character definition's modelKey; no duplicate model path here. |
| sourceRecordIds | Existing provenance IDs | Nonempty; every shipping source accepted and evidenced. |
| bindings | Map from existing semantic key to AnimationBinding | Exact required semantic coverage; no silent missing-state fallback. |
| locomotion | Forward/backward/left/right bindings with strideDistance for each | Four valid loop bindings with finite positive distances in gameplay units; calibrated after existing display scale. Move remains the forward semantic alias. |
| idleCycleSeconds | Authored Idle cycle duration used for preview/gameplay idle sampling | Finite, positive and consistent with binding interval. |
| hurtSeconds | Visual reaction lifetime | Positive, bounded by 0.3 seconds; does not become gameplay hitstun. |
| knockoutSeconds | Complete fall duration, then terminal hold | Positive, at most 1 second; provisional starting value 0.6 seconds. |
| transitionSeconds | Map of allowed transition families to blend duration | Finite 0..0.1 seconds; zero at authoritative contact/release and immediate KO priority. |
| reactionBoneNames | Authored additive reaction mask | Existing bones; cannot move actor root or replace a contact limb during an active strike. |
| rigidGroups | Named attachments that must retain relative transforms | Includes Plates body and entire face; Crow feather groups; validated against source/export bindings. |
| secondaryMotionBoneNames | Optional decorative motion targets | Existing nonessential targets only; suppressed in reduced motion. |

Durations other than gameplay action timing are presentation tuning. Physical performance and visual tests may shorten them; they cannot relax obligations or extend gameplay eligibility windows. Existing world scale 1.25, feet origin, facing convention and `resources.bodyEnvelopes` stay authoritative. Source geometry is normalized to these instead of adding another runtime transform catalogue.

## 2. AnimationBinding

| Field | Meaning |
| --- | --- |
| clipName | Exact exported physical clip name, resolved after the known import name normalization. |
| startSeconds, endSeconds | Finite ordered samples within the physical clip duration; moving segments require positive span. |
| mode | `loop`, `phase`, `reaction` or `hold`; defines how normalized time is sampled. |
| actionGroup | Optional shared action ID, such as cow1 or roar, joining three phase semantics. |
| contactSeconds | Optional visible impact/release marker within the active interval; author at active-start for immediate effects. |
| fixedSampleSeconds | Required only for `hold`; lies inside the segment. |

A normal three-phase action binds windup, active and recovery to adjacent segments of the same physical clip. Windup end equals active start; active end equals recovery start. Source samples at shared boundaries must be equal by construction. Transitions between different actions can blend only before the next authoritative contact and cannot delay input.

Semantic aliases preserve the current 20 Cow / 23 Crow / 23 Lion / 23 Plates coverage keys. Support-specific semantics that have no gameplay phase remain valid authoring/review segments: for Cow the existing cow1 phase mapping may be reused; Crow uses crow, Lion lionSupport, Plates platesSupport. Support-ready presentation can sample the windup segment while approaching/cooling down; `partner-hit` directly enters the active segment at its contact marker. Recovery is interruptible visual follow-through, not a new simulation action.

Idle/Move loop; Hurt is a short event-derived reaction; KnockedOut plays once and holds its endpoint; Dodge follows its actual directed action progress. Preview uses the Idle binding and a stable fixed sample under reduced motion. No binding produces attacks, sound, movement or events.

## 3. CharacterMotionState (runtime-only)

**Owner**: one gameplay view for `(runId, actorId)`, or one isolated selection preview. Never saved, shared between views or stored in immutable profile/animation resources.

| State | Purpose |
| --- | --- |
| lastObservedTick, lastPosition, lastHp | Observe each simulation step exactly once; derive travelled distance and HP transitions. |
| locomotionDistance, moving, locomotionPhase | Stable gait based on actual normal travel, including depth; unchanged during duplicate renders. |
| actionIdentity, semanticKey, phaseProgress | Track current move and phase without restarting at phase boundaries. |
| latestReactionTick, reactionAge | React to actual hit/HP decrease once; respect authoritative action. |
| knockoutStarted, knockoutElapsed | One-shot fall followed by terminal hold. |
| outgoingBonePose, transitionElapsed | Private cached pose for bounded transitions. |
| terminalSettleRemaining, terminalInterrupted | Results-only residual fall; no gameplay clock access. |
| previewElapsed | Separate selection clock; never reused for gameplay. |

Reset on new run, actor replacement, retry, Home and disposal. First observation seeds position rather than accumulating travel from origin. Older or duplicate ticks do not replay events. Tick gaps are only permitted for explicit fixture initialization; ordinary play observes every step. HP decrease fallback handles prepared snapshots without inventing multiple reactions for the same hit.

### Transitions and precedence

1. HP <= 0 latches knockout and cancels locomotion/reaction blends; after its duration hold final pose.
2. Existing gameplay attack/Dodge phases remain authoritative. A hit may add a small masked reaction but cannot cancel or postpone them.
3. Support `partner-hit` starts immediate visible contact; follow-through yields to the next authoritative action.
4. With no authoritative action, a recent hit may briefly take visual priority over idle/move. Normal movement position continues to be applied.
5. Otherwise use Move for actual ordinary travel and Idle when stopped; sustain gait phase across frame-only renders and reset on obstruction recovery.

Normal gait excludes knockback, Dodge, attack displacement and explicit recovery repositioning. Ordinary travel distance is `sqrt(dx² + dDepth²)`; state/event context filters excluded movement. Project the displacement into actor-facing local forward/lateral axes. Sample the relevant signed directional loops, with up to two normalized weights for diagonal travel and direction-specific stride distances. This supports depth-only and backward travel without rotating against simulation facing. Maintain normalized gait phase when direction changes; align loop contact phases during authoring. Direction/facing remains the simulation's value; no renderer-driven turn or foot-lock movement is written back.

## 4. PoseSample (internal view boundary)

A pure resolver returns `semanticKey`, one base sample (or up to two weighted directional locomotion samples) each with `clipName`/`timeSeconds`, optional masked reaction sample, transition weight and terminal-hold flag. Inputs include read-only actor/action state, profile and private observed motion state. Actor world position/facing are passed separately to the view. Samples must be finite, in bounds and idempotent for equal input. Calling the view may change only its own skeleton/visual nodes.

## 5. CandidateAssessment (review data)

**Location**: feature `reviews/` during implementation. Eight entries identify library, source file/hash, exact clip names, character, target rig revision, mapping/adaptations, required-state coverage, measured export size, defects, effort notes and recommendation. Status is `untried`, `trialled`, `selected` or `rejected`; selection requires actual comparison evidence and recorded owner feedback. A mixed/custom choice names each action's origin rather than pretending the whole pack was selected.

Four composite comparisons link current, KayKit and Universal motion with matched camera, character scale, lighting, playback speed and settings. Include idle, travel and representative attack in both facings. Source trials may fail; preserve evidence and the explicit custom fallback decision rather than silently omitting a candidate.

## 6. Existing AssetProvenance extensions

Reuse `content/art-provenance.json` source records and `runtimeAssets`. Add runtime hero records with stable IDs `hero.cow`, `hero.crow`, `hero.lion`, `hero.plates`, character/model key, runtime hash, editable-source path/hash, selected source-file/clip mappings and adaptation notes. Resolve runtime path from `resources.models`; if an existing runtimeAssets field stores a path for compatibility, validator must enforce equality rather than permit a second authority.

Source records retain creator, version, source URL, local acquired path/hash, selected file hashes, license/supporting evidence, permissions, credits, reviewer/date and acceptance status. Reuse the already accepted KayKit source; retain extra selected Large/Medium files with hashes if trials require them. Original receipt may be explicitly unknown; the current date of repository retention is separate. Runtime profiles carry only source IDs; full provenance remains an authoring record excluded from release, with generated required notices/credits included offline.

## 7. ValidationEvidence

**Location**: feature `validation/` and `reviews/` when work executes. Each record identifies build/source hashes, character, role, ordered duo, semantic action, facing, room/camera, settings, test/reviewer/date, relevant local FR/SC and PRD AC, result and artifact paths. Result is `pending`, `pass`, `fail` or `blocked`; never infer a pass from a missing recording or unavailable phone.

Final `validation/acceptance.json` must use the existing build-audit evidence schema and bind to the exact feature 011 release build. Retain detailed action coverage, eight trial outcomes, four final character reviews, all twelve duos, two phone measurements and five-player results as linked evidence. Earlier feature evidence and waivers do not automatically cover changed animation assets.
