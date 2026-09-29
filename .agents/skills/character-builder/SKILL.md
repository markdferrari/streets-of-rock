---
name: character-builder
description: Build or update a Streets of Rock fighter from a brief, including its validated definition, supported gameplay, bundled assets, and review record.
---

# Character Builder

Use this skill for roster character creation or updates in Streets of Rock. Read the
existing definition, runtime assets, and review report first; edit only the requested
identity and its explicitly required shared systems. Ask for missing product intent
only when it cannot be resolved from the supplied brief and feature specification.

Follow repository test-first rules for behavior changes. Configuration can select only
implemented Special kinds. A new mechanic requires tests and runtime work before it can
be configured. Validate static resources and semantic animation clips before marking a
character ready. Keep player and AI partner profiles separate; AI partners do not receive
player Specials. Preserve unrelated approved resources and report their hashes when the
task requires preservation evidence.

For asset generation, concept review, supported tools, validation commands, and the
CreationReport format, read [the workflow reference](references/workflow.md).
Report unavailable concept, playable, device, balance, or participant evidence as
pending; command success does not establish visual or gameplay acceptance.
