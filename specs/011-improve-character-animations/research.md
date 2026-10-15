# Research: Fighter and Companion Animations

**Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

## Scope and evidence

Research used the checked-in Godot runtime, authoring scripts, local supplied GLBs and license files. Three parallel read-only investigations covered rig adaptation, runtime timing and delivery/validation. [Initial exploration](exploration.md) records the local asset inventory. No candidate was retargeted or visually approved during planning. All architecture questions below are resolved; selecting the best-looking source is an explicitly planned empirical milestone, not an unresolved architecture dependency.

## 1. Offline adaptation into compact character rigs

**Decision**: Adapt and bake motion in Blender into character-specific GLBs at existing runtime paths. Keep editable rigged sources, explicit source-to-target bone mappings and selected clip inventories. Use compact articulated rigs appropriate to each body; author only the elbow/knee/foot/wing controls that improve visible motion. Strip unused donor geometry and unused finger chains.

**Rationale**: Existing exports have seven joints with whole meshes rigidly weighted to one bone. New bone names alone cannot bend whole limb capsules. Split/reshape limbs or deliberately weight joint geometry while retaining proportions, outfits and silhouette. Plates' plate, eyes, irises, smile and cheeks must share a rigid body transform: the current generic `bone_for()` assigns eyes to Head and other facial parts to Torso. Crow needs explicit wing groups, not a human finger mapping. Offline pose correction allows these anatomical differences without shipping a retargeting system.

**Alternatives considered**: Godot import/runtime humanoid retargeting; replacing heroes with donor mannequins; retaining seven rigid bones and merely renaming clips. Retargeting requires rest-pose and track correction, and a generic humanoid profile cannot establish acceptable wing/plate motion. Mannequin replacement violates identity. Existing coarse rigs limit articulation.

**Evidence**: `scripts/blender/characters.py`, `scripts/blender/rig_export.py`, `scripts/art/build_enemy_pilot.py`, `scripts/art/build_bouncers.py`. Existing enemy scripts demonstrate the repository's pinned Blender action-slot/NLA export practices. Godot documents the importance of rest poses, rotation/position handling and bone mapping in [3D skeleton retargeting](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/retargeting_3d_skeletons.html). This design does not depend on adding that runtime feature.

## 2. Candidate comparison before production

**Decision**: Inventory exact source-file/clip pairs and run eight bounded trials: KayKit and Universal on each of the four characters. Assemble four matched current/KayKit/Universal comparisons covering idle, travel and one attack, both facings, at gameplay scale. Record adaptation effort, missing states, visual defects and size; choose per character or action after owner review. Custom motion fills gaps or replaces unsuccessful candidates.

**Rationale**: KayKit Medium and Large both have 23-joint samples, but their melee names differ: Medium has `Melee_Unarmed_Attack_Punch_A`; Large has `Melee_Unarmed_Punch`, `Melee_Unarmed_Kick` and `Melee_Unarmed_Smash`. Universal Standard has 65 joints and 43 clips, including `Punch_Jab`, `Punch_Cross`, `Walk_Loop`, `Jog_Fwd_Loop`, `Roll` and `Death01`. Neither pack proves bespoke Special coverage. Prefer the supplied non-root-motion Universal file for trials, while still checking resulting root tracks.

**Alternatives considered**: Commit to KayKit because enemies already use it; commit to Universal because it has more joints; compare only donor mannequins. None proves suitability on all four existing bodies. KayKit is a useful first pilot due to repository experience, not a predetermined winner.

**Evidence**: Local GLB metadata and licenses under `/home/mark/projects/godot/assets/`; source pages [KayKit](https://kaylousberg.itch.io/kaykit-character-animations) and [Universal Animation Library](https://quaternius.itch.io/universal-animation-library). The locally supplied versions and retained license bytes define the evaluated inputs; do not substitute current online pack contents.

## 3. Gameplay remains the timing authority

**Decision**: Add a validated hero-animation profile mapping current semantic keys to physical clips and segments. Use one continuous authored clip per attack, mapped through contiguous windup/active/recovery anchors. Keep `content/animation-clips.json` as required semantic coverage. A pure resolver converts gameplay snapshots and private presentation state to samples; a manually driven character view applies them.

**Rationale**: `world_view.gd::sample()` currently restarts independent phase clips, uses a global 28-tick movement cycle and immediately samples the final knockout pose. `character_view.gd` plays/seeks/pauses each requested clip. Source durations must adapt to existing action windows, not change simulation duration. Author poses so boundary samples match; use bounded visual blending only for eligible transitions, never to postpone contact or input.

**Alternatives considered**: An autonomous AnimationTree controlling action transitions; animation callbacks dealing damage; replacing gameplay durations with donor clip lengths. These create a second authority or change gameplay. An AnimationTree is unnecessary for this bounded state set.

**Evidence**: `game/presentation/world_view.gd`, `character_view.gd`, `game/simulation/actions.gd`, `partner_ai.gd`, `combat.gd`. Godot's [AnimationPlayer reference](https://docs.godotengine.org/en/stable/classes/class_animationplayer.html) documents seeking/advancing; implementation must validate the exact pinned engine behavior through imported-scene tests. Imported tracks are restricted to visual transforms; callbacks, audio and gameplay property tracks are rejected.

## 4. Observe every simulation step; derive actual motion and hit reactions

**Decision**: Call a read-only presentation observer after each `Step.step_run`, before result handling. Maintain per-run/per-actor presentation state, distance-based locomotion phase and event-derived hit/knockout state. Keep previews separately owned. The observer never mutates run dictionaries or issues gameplay commands.

**Rationale**: Main can execute five fixed steps before one render; sampling only the final render loses short actions and movement history. Support damage occurs immediately on `partner-hit`, starting a six-tick `active` action with no gameplay windup/recovery. Ordinary `hit` events reduce HP but do not create `hurt` actions. Therefore support anticipation is a readying pose during approach/cooldown; contact coincides with actual damage, and follow-through cannot block later decisions. Nonlethal reactions are visual overlays or short reactions while idle, without canceling an authoritative strike.

**Alternatives considered**: Infer everything from the final action kind; insert support windup or gameplay hitstun; drive movement from requested input speed. These miss real events, change behavior or make stationary/blocked actors walk. Use actual X/depth displacement; explicit obstruction recovery resets gait instead of interpreting repositioning as a stride.

**Evidence**: `game/app/main.gd::_process`, `game/app/clocks.gd`, `game/simulation/partner_ai.gd`, `game/simulation/combat.gd`. `partner-hit` carries tick, actorId and targetId; `hit` identifies the victim through targetId. Tests must cover multiple steps per render, duplicate observations and fresh run IDs.

## 5. Root motion, facing and spin ownership

**Decision**: Simulation owns actor position and facing. Bake no global travel into the asset root; retain only bounded local body bob/lunge inside existing visual envelopes. Bake each Special's visual rotation into its motion and remove the extra hero spin rotation from `world_view.gd` when switching profiles. Keep the current world scale/orientation contract and camera/AI envelopes.

**Rationale**: Current world rendering adds `TAU` rotation for Cow/Crow active spins. Keeping that with a baked spin would double rotation. Enlarging envelopes to accommodate careless retargeting would alter camera/partner behavior. Both directions and depth movement need actual in-game review.

**Alternatives considered**: Runtime root-motion locomotion; simultaneous imported and world spin; widening gameplay envelopes to hide clipping. All conflict with gameplay parity or clear ownership.

## 6. Knockout, pause and terminal results

**Decision**: On first zero-HP observation, start a one-shot knockout and then hold its final pose. During live gameplay, advance only on simulation ticks. If results stop simulation before the fall completes, finish only that pose using a bounded presentation clock (provisional 0.6 seconds, maximum 1 second total knockout duration). Results/Retry/Home appear immediately. Lifecycle interruptions freeze this clock and use the existing Resume control with a terminal resume target; resuming results never restarts combat, audio or the active-run clock. Settings/modal views freeze presentation.

**Rationale**: Immediate final sampling omits the fall; advancing simulation to finish it violates result and scoring rules. The narrowly scoped results clock permits visible settling while keeping the authoritative state frozen. Reduced motion can use the final inactive pose immediately. Retry/home clears all presentation state.

**Alternatives considered**: Delay results until the animation ends; keep simulating after defeat; let hidden-page wall time finish the pose. These violate current behavior. No new player action or UI control type is introduced.

**Evidence**: `game/app/run_session.gd` currently interrupts preparing/countdown/running only; extend its lifecycle support specifically for pending terminal presentation, preserving immediate result selection and unchanged scoring. `main.gd` currently supplies zero world delta outside running, so this clock must be explicit rather than piggybacking on general world effects.

## 7. Reuse readiness, export and provenance infrastructure

**Decision**: Keep `resources.models` as the sole hero model-path authority. Add profile `sourceRecordIds` referring to the existing `art-provenance.json`; extend hero-aware validation and generated credits traversal. Reuse ResourceStore ownership, catalogue validation, hashed release inventory, split-pack export and complete-cache workflow. Ship only baked runtime assets and required metadata; authoring sources, donor packs and review fixtures remain excluded from Web Release.

**Rationale**: Current provenance/credit discovery covers rooms, enemies and runtime props, not hero models. Adding a license record without connecting hero traversal would leave validation and credits incomplete. Existing exporter already includes all four models and embedded animation dependencies, so a parallel loader or cache is unnecessary.

**Alternatives considered**: Duplicate hero paths under `resources.art`; create a second license ledger; bundle complete donor libraries. These introduce competing authorities or unneeded download cost.

**Evidence**: `game/content/resource_store.gd`, `catalogue.gd`, `scripts/art/validate.ts`, `credits.ts`, `delivery.ts`, `scripts/godot/export.ts`, `content/resources.json`. Reuse existing KayKit provenance; new selected source copies require hashes and evidence. Never invent a past acquisition date; record current repository acquisition separately from unknown original receipt.

## 8. Regression strategy and historical evidence

**Decision**: Keep deterministic simulation fixtures unchanged. Add test-first observer/resolver, import/readiness, rigid attachment and phase-boundary checks. Update only superseded test assumptions about seven-bone rigs and frozen hero bytes. Preserve feature 010's historical fingerprint record and supplier-source immutability tests. Register new browser specs explicitly in the Playwright configuration.

**Rationale**: `tests/blender/test_enemy_exports.py` freezes old hero hashes, `test_rig_export.py` assumes one rigid vertex group/current bone names, and Godot import tests assume clip-length phase mapping. Blindly running those after legitimate changes gives misleading failures; overwriting historical evidence would be worse. New assertions must prove identity/attachments, supported animation coverage and unchanged gameplay rather than protect obsolete implementation details.

**Alternatives considered**: Delete old tests wholesale; regenerate parity outputs; treat desktop screenshots as phone acceptance. All lose meaningful regression protection. Physical iPhone 12 and Pixel 6 measurements and five-player records remain required.

## Resolved research status

No unresolved technical clarification remains. The production workflow, runtime timing boundaries, data authority and validation approach are selected. Candidate visual quality, owner selection, final motion, phone performance and player preference are future implementation evidence with explicit gates, not reported successes.
