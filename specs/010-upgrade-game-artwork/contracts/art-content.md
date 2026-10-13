# Art Content and Authoring Contract

**Applies to:** FR-001–005, FR-010–013; [data model](../data-model.md).

## Stable room mapping

| Simulation area ID | X bounds | Visual ID | Mandatory cues |
| --- | --- | --- | --- |
| dance-floor | 0–16 | exterior | Frontage, club sign, neon doorway/light spill, pavement, queue barriers, event posters. |
| vip-lounge | 18–34 | bar | Long counter, colourful bottle shelves, stools, booths, warm light/neon accents; the existing two interactive tables remain separately owned. |
| backstage-corridor | 36–52 | dance-floor | Dance floor, DJ booth, large speakers, overhead fixtures and coloured light pools. |
| alley-exit | 54–70 | stage-vip | Curtains, stage backdrop, VIP seating, club branding and dramatic lighting. |

All walkable depth bounds remain [-3,3]. Existing tables stay at x/depth (22,-2) and (28,2). Connectors 16–18, 34–36 and 52–54 and camera margins receive complete visual coverage without new walkable regions or collision. Retain original waves, spawn positions, exit conditions and boss behavior. Required major structures and props must be 3D meshes; flat signs/posters and stylized surface shading are allowed.

Room scenes contain decorative Node3D/MeshInstance3D/material content only. Shared lights are presentation-owned, static for the baseline. Imported objects must not contain gameplay scripts, navigation regions, physics bodies or collision shapes. Interactive-table/pickup views remain tied to existing simulation IDs and distinguishable from props. Floor/backing may span the playable rectangle; chairs, counters, barriers, stages and foreground features may not obscure or intrude into it.

Room origin is its area's minX with y=0; local geometry is composed along +x. Runtime derives placement from the current level data. The retained x bounds above are parity assertions, not a duplicated editable gameplay layout. The fixed camera and hero envelopes determine coverage tests.

## Enemy designs and animation coverage

| Role | Required identity | Required attack bindings |
| --- | --- | --- |
| grunt | Rowdy clubgoer, lighter/mobile silhouette | grunt.windup, grunt.active, grunt.recovery |
| zoner | Bartender, distinguishable service clothing/equipment | throw.windup, throw.active, throw.recovery |
| enforcer | Broad/heavy security threat | charge.windup, charge.active, charge.recovery |
| liam | Largest distinct head bouncer, unique outfit/shape beyond a tint/scale variant | close, rope and shockwave, each with windup/active/recovery |

All require Idle, Move, Hurt and Defeated. Normal enemies also require Stunned; the boss never shows stun in response to ROAR. A clip segment or deliberately authored held pose can satisfy a semantic binding; accidental default/rest poses cannot. No requirement is satisfied merely by a supplier advertising an animation count.

## Export and import

Use Blender's explicit glTF 2.0 binary export for selected runtime objects/materials/clips. Keep edited `.blend` source and retained source-license evidence outside runtime export folders. Do not enable implicit Blender import. Each export records its tool version and source/runtime hash. Imported scale must be finite and uniform, feet anchored at ground and canonical facing +z; wrapper transforms map existing facing ±1 to yaw ±pi/2.

Confirm skeleton bindings, clip names/segments, normals, backfaces, material assignments, alpha usage and clean resource dependencies in the pinned Godot importer and exported browser. Remove root translation used for locomotion; local limb/weapon motion is retained. Do not add damage or event-call tracks. Share palettes/materials; duplicate materials only for per-instance mutable effects.

Missing animation coverage, malformed geometry, unresolved resources or unsupported imported nodes fails validation. Validate source GLBs and the actual imported scene; neither test substitutes for the other. Original/final source assets and unrelated hero files must remain intact during scoped edits.

## Reuse and provenance

Evaluate free candidate archives before final production; record accepted/rejected choices, actual included files/clips and any gaps. Accepted sources require documented compatible modification and game-distribution permission with zero asset purchase/recurring fee. Prefer CC0; compatible attribution licenses are allowed with fulfilled notices. A free price tag or a neighboring pack's license is insufficient.

Every shipped model, material, texture, animation and adapted work must map to accepted source records or an original-author declaration. Preserve acquired source identity/hash, license evidence and modifications; source/license records must be reviewable without rediscovering a supplier page. Pack-level records may cover multiple explicitly listed assets without duplicating boilerplate.

Generate credits/notices from the accepted assets actually shipped. Include required author/title/license/modification text exactly as reviewed. Retain source/license links as text in the offline record; network navigation is optional. Candidate/rejected assets and source archives must not enter runtime packs.

## Review before production and acceptance

Review all four room concepts and four enemy concepts against current heroes/camera/HUD before final production. Record outcomes and revisions, then inspect all final subjects in gameplay, including every attack/state and both Liam phases. Production scope follows the user's request; reviews establish appearance rather than reopen routine implementation permission.

Import/resource tests do not establish style, recognizable roles, readable combat, user preference or ownership rights. Unresolved reviews remain pending. A changed asset hash invalidates the affected final review; unchanged subjects retain their evidence.
