# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## Product Alignment *(mandatory)*

- **PRD references**: [Applicable FR/NFR/SC and acceptance-scenario IDs from PRD.md]
- **Included behavior**: [What this feature delivers within the agreed MVP]
- **Deferred behavior**: [Explicit exclusions; do not import future-vision features]
- **Provisional tuning**: [Values to adjust through playtesting, distinct from obligations]

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE against its declared prerequisites.
  One story can deliver a playable increment; the full MVP still requires all PRD acceptance gates.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "accept movement and attack touches simultaneously"]
- **FR-002**: System MUST [specific capability, e.g., "register each strike once per target"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "retry the full level after defeat"]
- **FR-004**: System MUST [data requirement, e.g., "persist audio preferences locally"]
- **FR-005**: System MUST [behavior, e.g., "pause gameplay when the page is hidden"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST communicate attack readiness via [NEEDS CLARIFICATION: visible feedback not specified]
- **FR-007**: System MUST define [NEEDS CLARIFICATION: retry behavior for this encounter not specified]

### Mobile Quality and Validation *(mandatory)*

For each affected area, state observable acceptance criteria and map them to PRD requirements.
If unaffected, record why; do not silently omit a gate.

- Touch input, input cancellation, landscape safe areas, telegraphs, and muted/no-shake play.
- Background/focus/orientation interruption, explicit resume, and active-time accounting.
- Audio activation, loading failure, storage failure, complete offline replay, and safe updates.
- Reference-device performance and applicable five-player evaluation criteria.

Specify which outcomes receive automated regression tests and which also require device
checks. Define manual procedures before implementation; do not treat device checks as a
replacement for test-first development of automatable rules. Preserve PRD IDs in a mapping
if this feature uses its own requirement numbering.

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "4 of 5 players move and attack within 30 seconds"]
- **SC-002**: [Measurable metric, e.g., "A cached full run completes with networking disabled"]
- **SC-003**: [User satisfaction metric, e.g., "4 of 5 players finish within three attempts"]
- **SC-004**: [Performance metric, e.g., "Both reference devices sustain the PRD performance target"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Initial caching requires connectivity"]
- [Assumption about scope boundaries, e.g., "Native packaging remains deferred"]
- [Assumption about data/environment, e.g., "Settings remain local to this browser"]
- [Dependency on existing system/service, e.g., "Reference phones are available for device acceptance"]
