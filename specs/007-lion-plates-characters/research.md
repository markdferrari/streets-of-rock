# Research: Lion, Plates and Character Creation

Date: 2026-09-28. Decisions derive from repository source, 005/006 design and the locally available skill-creator guidance. Delegated combat research independently identified active-hitbox cancellation and projectile ordering risks.

## R1. Shared configuration

**Decision:** Per-character bundled JSON schemaVersion 1, validated into pure TypeScript definitions; static presentation manifest resolves resource keys.
**Rationale:** Current tuning.ts and character-assets.ts hardcode Cow/Crow. 005 already defines a registry and profile separation. JSON is readable by both runtime validation and Blender/Python authoring, unlike executable TypeScript configuration. Keep validation custom and bounded to existing fields/three Special variants; no added dependency.
**Alternatives considered:** One giant roster file increases unrelated-edit risk. Executable config complicates authoring validation; an arbitrary ability DSL exceeds scope.

## R2. Stun and simultaneous combat

**Decision:** Stun normal enemies at ROAR effect before AI/contact evaluation, removing owned active hitboxes and attacker-slot claims. Queue boss damage for batched contact resolution; never stun or interrupt a living boss.
**Rationale:** Existing run.attacks outlive an actor action until expiry, so skipping AI alone leaves damaging hitboxes. damage.ts deliberately batches hit intents; early boss-health mutation could suppress its already valid lethal intent and change defeat precedence. Use tick expiry, cancel-before-AI for normals and normal terminal handling.
**Alternatives considered:** Hurt animation alone is not a stun model. Cancelling released projectiles contradicts the spec. Applying raw damage to every target would violate normal-enemy zero-damage behavior.

## R3. Headrest collision

**Decision:** Snapshot nearest visible aim at action start, create immutable velocity on release, sweep each segment and resolve earliest entry fraction with stable ID tie-break. Clip distance before collision.
**Rationale:** Current projectiles.ts sorts intersecting actors by ID; collision.ts returns only a boolean swept contact, not earliest contact. That cannot implement first enemy physically struck. Preserve current enemy-projectile damage and selection policy while adding correct headrest behavior explicitly.
**Alternatives considered:** Per-frame overlap permits tunnelling. Homing or retargeting violates agreed straight throw. Removing a projectile only after an oversized final step can hit beyond its configured maximum range.

## R4. Asset workflow

**Decision:** Generalize existing Blender tools by selected character ID, retain Cow/Crow output compatibility and add separate lion/plates directories plus headrest prop. Use concept and gameplay review before completion.
**Rationale:** generate.py enumerates a fixed pair; rig_export.py assumes Cow/Crow bone naming/clip sets. A reusable skill needs per-character scripts with bounded outputs rather than repeatedly changing hardcoded lists. Existing stylized parts and 5.2 toolchain suffice; no graphics-overhaul pipeline is needed.
**Alternatives considered:** New rig framework or new graphics tools are not justified. Automatically overwriting all roster models violates unrelated-resource preservation.

## R5. Skill scope and validation

**Decision:** Project-local character-builder SKILL.md with a concise entrypoint and one detailed workflow reference; invoke shared repository tools and record two end-to-end exercises.
**Rationale:** Local skill-creator guidance requires task-specific instructions, progressive disclosure, meaningful script validation and no unrelated scope/permission expansion. Concept review is a real product gate already in spec, not a blanket approval step for every reversible operation.
**Alternatives considered:** A global plugin/installer is unnecessary. A long duplicated build manual would drift from scripts and contracts. A successful scaffold alone cannot prove character assets or gameplay are accepted.

## R6. Platform and test dependencies

**Decision:** Complete/integrate 005 selected roles/platform and 006 visible arena/partner behavior, then extend their existing tests/audits to four identities. Keep current package versions and TDD.
**Rationale:** Inspected source remains legacy fixed Cow/Crow; planned capabilities are not existing evidence. New clips/portraits/prop must join the full inventory. Unit tests cannot establish actual art readability, installed offline operation or phone performance.
**Alternatives considered:** Duplicating selection/AI/platform code creates conflicting ownership. Waiving hardware or workflow exercises would leave explicit acceptance unmet.

No unresolved technical choices remain. Provisional numeric defaults are fixed in data-model.md for implementation and may change only through recorded balance review.
