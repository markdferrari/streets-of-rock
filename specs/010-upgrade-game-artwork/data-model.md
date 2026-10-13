# Data Model: 3D Venue and Enemy Artwork

**Scope**: Presentation/content only. Existing simulation `RunState`, enemy roles, moves, area IDs, save keys and combat tuning remain authoritative and unchanged. All proposed content uses `schemaVersion: 1`; unknown versions fail with a field/path diagnostic.

## RoomPresentation

Authority: `content/rooms.json`, exactly four entries. References the shared `content/resources.json` catalogue and the existing level.

| Field | Meaning / validation |
| --- | --- |
| areaId | Unique existing simulation area ID; exact four-area coverage required. |
| visualId | Unique `exterior`, `bar`, `dance-floor` or `stage-vip` mapped by the content contract. |
| sceneResourceId | Required room `PackedScene` containing actual major 3D structures/props. |
| requiredLandmarks | Nonempty exact required cue IDs; each maps to a reviewable named scene node/region. Presence checks do not establish recognizable art. |
| dependencyIds | Referenced GLBs, textures, materials and shared props; closure resolves through resources catalogue and imported scene dependencies. |
| decorationBounds | Authored bounds outside the playable floor; floor/backing may cover it, furniture may not intrude. |
| coverageBounds | Floor/backing extent for the camera's supported travel and connector overlap; finite ordered bounds. |
| exitLandmark | Outward cue/region aligned with the next route; final room has no next-room exit cue. |
| reviewSubjectId | Link to concept and final gameplay review records. |

A shared venue coverage entry describes the three connectors and camera margins. Gameplay bounds are read from the level; no editable duplicate becomes a second collision definition. Interactive tables are excluded from decorative room content.

## EnemyPresentation

Authority: `content/enemy-presentations.json`, exactly one entry per `grunt`, `zoner`, `enforcer`, `liam`.

| Field | Meaning / validation |
| --- | --- |
| role | Existing role enum, unique and complete. |
| sceneResourceId | Imported rigged GLB or wrapper scene; complete skeleton and material references required. |
| sourceRecordIds | One or more accepted provenance records covering the shipped model, clips, textures and adaptations. |
| transform | Finite positive uniform scale, foot offset and facing correction; canonical export has feet y=0 and forward +z. No runtime root-motion translation. |
| visualEnvelope | Reviewed authored dimensions for validation/culling only; cannot replace gameplay reach or camera/ArenaContext envelopes. |
| clipBindings | Required semantic keys mapped to imported clip names and time segments, as below. |
| allowedMoveIds | `grunt`; `throw`; `charge`; or `close, rope, shockwave` according to role. Must match simulation's supported moves exactly. |
| phase2Style | Liam-only, nonblocking silhouette/posture/material cue; cannot obscure current warnings or change action timing. |
| defeatHoldTicks | Positive bounded presentation lifetime, initially 21 ticks; never affects actor removal, waves or results. |
| reviewSubjectId | Role concept and final action/appearance evidence. |

Required normal-enemy semantics: Idle, Move, Hurt, Stunned, Defeated and `<move>.windup`, `<move>.active`, `<move>.recovery`. Liam requires Idle, Move, Hurt, Defeated and all nine attack-phase bindings; no Stunned binding is used. Hurt is only shown when the simulation reports hurt; requiring a clip does not add susceptibility.

## ClipBinding

Fields: `clipName`, `startSeconds`, `endSeconds`, `loop`, optional `fixedSampleSeconds` for a held pose. All values are finite; ranges fit the imported clip; a fixed sample lies inside its range. Action segments use normalized simulation-phase progress, never their source duration as a gameplay timer. Idle/Move/Stunned may loop. Source names and imported names are both inspected; bindings refer to actual imported names.

Animation tracks may affect skeleton/local visual transforms and materials. Gameplay callbacks, audio method calls, resource loading, hidden network references, actor-root translations and embedded colliders/scripts are rejected from imported art. Intentional weapon/limb motion stays local to the view. Face corrections are authored once per role, not guessed each frame.

## ArtSourceRecord and RuntimeAssetRecord

Single editable authority: `content/art-provenance.json`. Candidate status is `candidate`, `accepted` or `rejected`; rejected/unfinished records cannot back a required runtime asset.

- Source record: stable ID, pack/work name, creator, original source URL (or original-author declaration), version if supplied, acquisition date, archive/file SHA-256, license identifier and retained license/evidence paths, commercial/modification/game-distribution assessment, attribution text/notices, assessment/rejection reason and reviewer/date.
- Runtime asset record: stable resource ID, source record IDs, selected source file IDs/hashes, authored/exported path and hash, modifications, exporter/tool version, dependency IDs and review subject IDs. An original asset still records author and ownership/license basis; its source URL may be absent with an explicit original-work declaration.
- License evidence remains a human review input. Structural validation detects missing evidence and unaccepted status but cannot prove legal rights. The build requires completed review and bundled obligations, not an automated legal conclusion.
- Source archives are authoring inputs; shipped credits are a deterministic projection of accepted records actually used by the release. License texts/notices needed for distribution ship beside those credits.

No path traversal, absolute resource paths, duplicate IDs, unhashed accepted inputs or missing source links are accepted. Shared dependencies have one resource identity even when used in several rooms/enemies.

## ArtPreparation (transient)

Fields: `generation`, `releaseId`, required logical resource IDs, resolved dependency closure, state `idle | loading | validating | ready | failed | retired`, progress, owned temporary instances and optional failure `{resourceId, field, reason, retryable}`.

Transitions: idle -> loading -> validating -> ready; loading/validating -> failed on required visual failure. Home/replacement/disposal -> retired. Retry starts a new generation; a callback from another generation cannot mutate the active result. Cache-only readiness is separate from runtime visual readiness. Only fully validated visuals and a rendered initial view can satisfy the session's countdown gate.

The inherited ResourceStore owns shared imported resources. Preparation uses temporary instances to validate every room/enemy; it releases them before handing the live view to the session. Failed/retired preparations drain outstanding work and release late instances. A shared reference cannot be freed while another current consumer owns it.

## EnemyViewState (transient, per runId + actorId)

Fields: role, independent skeleton/animation player, last simulation position/tick, selected semantic key, normalized sample, phase visual state, owned effects/material overrides and optional defeated-view record.

Derived pose precedence: defeated > live normal-enemy stun > action phase/hurt > moving > idle. Movement derives from consecutive simulation snapshots, not camera movement. Stun is read from `stunnedUntilTick` and `combatClass`, independent of `action.kind`. Returning from pause without a simulation tick must preserve the sample.

A defeated-view record stores the final transform, Defeated pose, expiry tick and run generation. It exists only in presentation after HP reaches zero; it has no collider, hit target, AI, pickup or encounter ID. Within active play it expires at the configured tick, even if the simulation removes the actor. At terminal result it remains frozen only while its view remains visible; home/retry/disposal clears it immediately. Actor IDs reused in a new run cannot revive old records.

Liam's phase changes only the view overlay. Already released bottle/projectile views belong to their simulation projectile IDs and survive their owner's stun/death according to existing rules.

## VisualReviewRecord and EvidenceRegister

Created during implementation under this feature's `reviews/` and `validation/`, not as fictional completed reports during planning.

Fields: subject ID (four rooms/four roles), stage `concept | gameplay`, asset/source hashes, build ID if applicable, date/reviewer, required landmark/action coverage, screenshot/video paths, device/browser/layout/settings, result `pending | pass | changes-required`, findings and unresolved dependencies. Concepts link to final reviewed assets; changing reviewed files invalidates affected approvals until rechecked.

The requirement register maps feature FR/US/SC and PRD IDs to test/review records, status and actual evidence. Five-player records include anonymized participant IDs, prior exposure, recognition answers, separate responsiveness/readability scores, matched artwork preference and GO response times. Record manually; add no telemetry service.

## Release data

Inherit feature 009's `ReleaseInventoryV1`, pack ownership, digests and engine/content classification. Art resources and generated credits are content. Derive pack membership from actual imported resource dependencies, not just GLB source filenames. Every required resource resolves to exactly one owner; duplicate emitted bytes still count in size totals. No new independent download manifest or persistent player-data schema is introduced.
